from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    conversation_id: int | None = None
    language: str | None = Field(None, description="en or te")


class ChatResponse(BaseModel):
    conversation_id: int
    message: str
    navigation: str | None = None
    suggestions: list[str] = []
    used_tools: list[str] = []
    source: str = "llm"  # llm | rules


class ConversationSummary(BaseModel):
    id: int
    title: str | None
    created_at: str
    message_count: int


class ConversationDetail(BaseModel):
    id: int
    title: str | None
    messages: list[ChatMessage]
