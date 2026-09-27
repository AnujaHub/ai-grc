from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

class ChatMessage(BaseModel):
    role: str  # "user" ou "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    organisation_id: Optional[UUID] = None

class ChatResponse(BaseModel):
    reponse: str