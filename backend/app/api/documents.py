from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.permissions import require_permission, tenant_scope
from app.models.user import User
from app.schemas.document import DocumentCreate, DocumentRead
from app.services.document_service import create_document, list_documents

router = APIRouter(prefix="/documents", tags=["documents"])

MODULE = "documents"


@router.post("", response_model=DocumentRead)
def create_document_endpoint(
    payload: DocumentCreate,
    user: User = Depends(require_permission(MODULE)),
    db: Session = Depends(get_db),
) -> DocumentRead:
    payload.tenant_id = user.tenant_id
    return create_document(db, payload)


@router.get("", response_model=list[DocumentRead])
def list_documents_endpoint(
    tenant_id: int = Depends(tenant_scope(MODULE)),
    doc_type: str | None = Query(None),
    db: Session = Depends(get_db),
) -> list[DocumentRead]:
    return list_documents(db, tenant_id, doc_type)
