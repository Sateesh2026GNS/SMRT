from pydantic import BaseModel, ConfigDict, Field


class DocumentBase(BaseModel):
    tenant_id: int | None = 1
    doc_type: str
    title: str
    file_path: str | None = None
    file_name: str | None = None
    file_size: int | None = 0
    reference_type: str | None = None
    reference_id: int | None = None
    department: str | None = "Procurement"
    version: str | None = "v1.0"
    description: str | None = None
    uploaded_by: str | None = None


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseModel):
    doc_type: str | None = None
    title: str | None = None
    file_path: str | None = None
    file_name: str | None = None
    file_size: int | None = 0
    reference_type: str | None = None
    reference_id: int | None = None
    department: str | None = None
    version: str | None = None
    description: str | None = None
    uploaded_by: str | None = None


class DocumentRead(DocumentBase):
    id: int
    created_at: object | None = Field(default=None)
    updated_at: object | None = Field(default=None)
    model_config = ConfigDict(from_attributes=True)
