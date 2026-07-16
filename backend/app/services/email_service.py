import logging
import smtplib
from email.message import EmailMessage

from app.core.config import get_settings

logger = logging.getLogger("smrt.email")
settings = get_settings()


def send_email(to: str, subject: str, body: str) -> None:
    if not settings.smtp_host:
        logger.info("[DEV EMAIL] To: %s | Subject: %s | Body: %s", to, subject, body)
        return

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.smtp_from_email
    msg["To"] = to
    msg.set_content(body)

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        if settings.smtp_user:
            server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)


def send_verification_email(to: str, token: str) -> None:
    link = f"{settings.frontend_base_url.rstrip('/')}/verify-email?token={token}"
    send_email(
        to,
        "Verify your SMRT account",
        f"Welcome to SMRT.\n\nVerify your email by opening this link (expires in {settings.email_verification_expire_hours}h):\n{link}\n",
    )


def send_password_reset_email(to: str, token: str) -> None:
    link = f"{settings.frontend_base_url.rstrip('/')}/reset-password?token={token}"
    send_email(
        to,
        "Reset your SMRT password",
        f"Use this one-time link to reset your password (expires in {settings.password_reset_expire_minutes} minutes):\n{link}\n\nIf you did not request this, ignore this email.\n",
    )
