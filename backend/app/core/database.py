from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Load .env from backend/ (ensures correct path regardless of cwd)
load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")

from app.core.config import get_settings

settings = get_settings()

_connect_args = {}
if settings.database_url.startswith("sqlite"):
    _connect_args["check_same_thread"] = False

engine = create_engine(
    settings.database_url,
    connect_args=_connect_args,
    pool_pre_ping=not settings.database_url.startswith("sqlite"),
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
