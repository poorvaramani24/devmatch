from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from app.schemas.profile import ProfileResponse


class MatchResponse(BaseModel):
    id: UUID
    other_user: ProfileResponse
    compatibility_score: float
    status: str
    matched_at: datetime
    last_message: str | None = None
    unread_count: int = 0

    model_config = {"from_attributes": True}


class LikeRequest(BaseModel):
    is_super_like: bool = False


class LikeResponse(BaseModel):
    liked: bool
    matched: bool
    match_id: UUID | None = None
    compatibility_score: float | None = None
