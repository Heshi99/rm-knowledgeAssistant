from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question: str
    history: list[ChatMessage] = []


class ContextItem(BaseModel):
    source: str
    content: str


class ChatResponse(BaseModel):
    answer: str
    context: list[ContextItem]