from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.auth_deps import get_current_user
from app.api.deps import get_db
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserResponse
from app.services.auth_service import (
    authenticate_user,
    create_access_token,
    get_user_with_role,
    register_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, req.email, req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token({"sub": str(user.id), "email": user.email})
    user_data = get_user_with_role(db, user)
    return AuthResponse(access_token=token, user=UserResponse(**user_data))


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    user_data = get_user_with_role(db, current_user)
    return UserResponse(**user_data)


@router.post("/register", response_model=AuthResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    user = register_user(
        db,
        company_name=req.company_name,
        full_name=req.full_name,
        email=req.email,
        password=req.password,
    )
    token = create_access_token({"sub": str(user.id), "email": user.email})
    user_data = get_user_with_role(db, user)
    return AuthResponse(access_token=token, user=UserResponse(**user_data))
