from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.document import Document
from app.schemas.document import DocumentCreate, DocumentUpdate


def create_document(db: Session, payload: DocumentCreate) -> Document:
    data = payload.model_dump()
    if not data.get("tenant_id"):
        data["tenant_id"] = 1
    doc = Document(**data)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def list_documents(
    db: Session,
    tenant_id: int,
    doc_type: str | None = None,
) -> list[Document]:
    stmt = select(Document)
    if doc_type:
        dt = doc_type.lower()
        stmt = stmt.where(or_(Document.doc_type == doc_type, Document.doc_type == dt))
    stmt = stmt.order_by(Document.created_at.desc())
    return list(db.scalars(stmt).all())


def get_document(db: Session, document_id: int, tenant_id: int | None = None) -> Document | None:
    return db.get(Document, document_id)


def update_document(
    db: Session,
    document_id: int,
    tenant_id: int | None = None,
    payload: DocumentUpdate = None,
) -> Document | None:
    doc = get_document(db, document_id)
    if not doc:
        return None
    data = payload.model_dump(exclude_unset=True) if payload else {}
    for key, value in data.items():
        setattr(doc, key, value)
    db.commit()
    db.refresh(doc)
    return doc


def delete_document(db: Session, document_id: int, tenant_id: int | None = None) -> bool:
    doc = get_document(db, document_id)
    if not doc:
        return False
    db.delete(doc)
    db.commit()
    return True
