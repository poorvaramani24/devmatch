from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class MessageCreate(BaseModel):
    content: str
    content_type: str = "text"


class MessageResponse(BaseModel):
    id: UUID
    match_id: UUID
    sender_id: UUID
    content: str
    content_type: str
    read_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class WebSocketMessage(BaseModel):
    type: str  # "message", "typing", "read"
    match_id: UUID | None = None
    content: str | None = None
    content_type: str = "text"
    message_id: UUID | None = None
