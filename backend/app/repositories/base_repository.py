"""Base repository with tenant-scoped session."""

from sqlalchemy.orm import Session


class BaseRepository:
    def __init__(self, db: Session, tenant_id: int):
        self.db = db
        self.tenant_id = tenant_id
