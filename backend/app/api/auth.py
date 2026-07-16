from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.auth_deps import get_current_user
from app.api.deps import get_db
from app.core.config import get_settings
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RefreshRequest,
    RegisterPendingResponse,
    RegisterRequest,
    ResetPasswordRequest,
    UserResponse,
    VerifyEmailRequest,
)
from app.services import rbac_service
from app.services.audit_service import log_audit
from app.services.auth_service import (
    authenticate_user,
    create_access_token,
    find_user_by_email,
    get_user_with_role,
    hash_password,
    issue_auth_response_data,
    register_user,
)
from app.services.email_service import send_password_reset_email, send_verification_email
from app.services.security_service import (
    INVALID_CREDENTIALS,
    consume_password_reset,
    create_email_verification,
    create_password_reset,
    is_account_locked,
    record_login_attempt,
    register_failed_login,
    rotate_refresh_token,
    revoke_refresh_token,
    touch_user_activity,
    validate_refresh_token,
    verify_email,
)

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()

PASSWORD_RESET_SENT = "If an account exists for this email, a reset link has been sent."


def _client_ip(request: Request) -> str | None:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, request: Request, db: Session = Depends(get_db)):
    email = req.email
    ip_address = _client_ip(request)
    user_agent = request.headers.get("User-Agent")
    user = find_user_by_email(db, email)

    if user and is_account_locked(user):
        record_login_attempt(
            db,
            email=email,
            success=False,
            user_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent,
            failure_reason="locked",
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Account temporarily locked. Try again later.",
        )

    authenticated = authenticate_user(db, email, req.password)
    if not authenticated or not authenticated.is_active or not authenticated.email_verified:
        if user:
            register_failed_login(db, user, email)
        record_login_attempt(
            db,
            email=email,
            success=False,
            user_id=user.id if user else None,
            ip_address=ip_address,
            user_agent=user_agent,
            failure_reason="invalid",
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=INVALID_CREDENTIALS,
        )

    record_login_attempt(
        db,
        email=email,
        success=True,
        user_id=authenticated.id,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    rbac_service.log_activity(
        db,
        tenant_id=authenticated.tenant_id,
        user_id=authenticated.id,
        action="login",
        resource="auth",
        request=request,
    )
    data = issue_auth_response_data(
        db, authenticated, ip_address=ip_address, user_agent=user_agent
    )
    return AuthResponse(**data)


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    user_data = get_user_with_role(db, current_user)
    user_data["email_verified"] = current_user.email_verified
    return UserResponse(**user_data)


@router.post("/register", response_model=AuthResponse | RegisterPendingResponse)
def register(req: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    user = register_user(
        db,
        company_name=req.company_name,
        full_name=req.full_name,
        email=req.email,
        password=req.password,
        role=req.role,
    )
    log_audit(
        db,
        tenant_id=user.tenant_id,
        user_id=user.id,
        action="create",
        resource="user_registration",
        resource_id=user.id,
        ip_address=_client_ip(request),
    )

    if settings.email_verification_required:
        raw_token = create_email_verification(db, user)
        send_verification_email(user.email, raw_token)
        return RegisterPendingResponse(
            message="Registration successful. Please verify your email before signing in.",
            email_verification_required=True,
        )

    data = issue_auth_response_data(db, user)
    return AuthResponse(**data)


@router.post("/verify-email", response_model=MessageResponse)
def verify_email_endpoint(req: VerifyEmailRequest, request: Request, db: Session = Depends(get_db)):
    user = verify_email(db, req.token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification link.",
        )
    log_audit(
        db,
        tenant_id=user.tenant_id,
        user_id=user.id,
        action="update",
        resource="email_verification",
        resource_id=user.id,
        ip_address=_client_ip(request),
    )
    return MessageResponse(message="Email verified successfully. You may now sign in.")


@router.post("/resend-verification", response_model=MessageResponse)
def resend_verification(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = find_user_by_email(db, req.email)
    if user and not user.email_verified:
        raw_token = create_email_verification(db, user)
        send_verification_email(user.email, raw_token)
    return MessageResponse(
        message="If an unverified account exists for this email, a verification link has been sent."
    )


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(req: ForgotPasswordRequest, request: Request, db: Session = Depends(get_db)):
    user = find_user_by_email(db, req.email)
    if user and user.is_active:
        raw_token = create_password_reset(db, user)
        send_password_reset_email(user.email, raw_token)
        log_audit(
            db,
            tenant_id=user.tenant_id,
            user_id=user.id,
            action="create",
            resource="password_reset_request",
            resource_id=user.id,
            ip_address=_client_ip(request),
        )
    return MessageResponse(message=PASSWORD_RESET_SENT)


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(req: ResetPasswordRequest, request: Request, db: Session = Depends(get_db)):
    user = consume_password_reset(db, req.token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset link.",
        )
    user.hashed_password = hash_password(req.password)
    user.failed_login_attempts = 0
    user.locked_until = None
    db.commit()
    log_audit(
        db,
        tenant_id=user.tenant_id,
        user_id=user.id,
        action="update",
        resource="password_reset",
        resource_id=user.id,
        ip_address=_client_ip(request),
    )
    rbac_service.log_activity(
        db,
        tenant_id=user.tenant_id,
        user_id=user.id,
        action="password_reset",
        resource="auth",
        request=request,
    )
    return MessageResponse(message="Password reset successfully. You may now sign in.")


@router.post("/refresh", response_model=AuthResponse)
def refresh_tokens(req: RefreshRequest, request: Request, db: Session = Depends(get_db)):
    ip_address = _client_ip(request)
    user_agent = request.headers.get("User-Agent")
    user = validate_refresh_token(db, req.refresh_token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=INVALID_CREDENTIALS,
        )
    touch_user_activity(db, user)
    new_refresh = rotate_refresh_token(
        db, req.refresh_token, user, ip_address=ip_address, user_agent=user_agent
    )
    access = create_access_token({"sub": str(user.id), "email": user.email})
    user_data = get_user_with_role(db, user)
    user_data["email_verified"] = user.email_verified
    return AuthResponse(
        access_token=access,
        refresh_token=new_refresh,
        user=UserResponse(**user_data),
    )


@router.post("/logout", response_model=MessageResponse)
def logout(
    req: RefreshRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    revoke_refresh_token(db, req.refresh_token)
    return MessageResponse(message="Logged out successfully.")
