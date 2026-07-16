from pydantic import BaseModel, ConfigDict


class DocumentBase(BaseModel):
    tenant_id: int
    doc_type: str
    title: str
    file_path: str | None = None
    file_name: str | None = None
    reference_type: str | None = None
    reference_id: int | None = None
    description: str | None = None
    uploaded_by: str | None = None


class DocumentCreate(DocumentBase):
    pass


class DocumentRead(DocumentBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
