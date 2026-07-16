from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document
from app.schemas.document import DocumentCreate


def create_document(db: Session, payload: DocumentCreate) -> Document:
    doc = Document(**payload.model_dump())
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def list_documents(
    db: Session,
    tenant_id: int,
    doc_type: str | None = None,
) -> list[Document]:
    stmt = select(Document).where(Document.tenant_id == tenant_id)
    if doc_type:
        stmt = stmt.where(Document.doc_type == doc_type)
    stmt = stmt.order_by(Document.created_at.desc())
    return list(db.scalars(stmt).all())
