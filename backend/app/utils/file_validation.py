"""File upload validation helpers."""

import secrets
from pathlib import Path

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".csv",
    ".txt",
}

BLOCKED_EXTENSIONS = {
    ".exe",
    ".bat",
    ".cmd",
    ".sh",
    ".ps1",
    ".js",
    ".jar",
    ".msi",
    ".dll",
    ".php",
    ".py",
    ".rb",
    ".pl",
}


def secure_upload_filename(original: str | None) -> str:
    ext = Path(original or "upload.bin").suffix.lower()
    if ext in BLOCKED_EXTENSIONS or ext not in ALLOWED_EXTENSIONS:
        ext = ".bin"
    return f"{secrets.token_hex(16)}{ext}"


def validate_upload(filename: str | None, size: int, content_type: str | None = None) -> None:
    ext = Path(filename or "").suffix.lower()
    if ext in BLOCKED_EXTENSIONS:
        raise ValueError("Executable or script uploads are not allowed")
    if ext and ext not in ALLOWED_EXTENSIONS:
        raise ValueError("File type not allowed")
    if size <= 0 or size > MAX_UPLOAD_BYTES:
        raise ValueError("File size exceeds the allowed limit")
    if content_type and content_type.startswith(("application/x-msdownload", "application/javascript")):
        raise ValueError("File type not allowed")
