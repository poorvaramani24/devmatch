from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    display_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: UUID


class UserResponse(BaseModel):
    id: UUID
    email: str
    is_verified: bool
    is_premium: bool
    created_at: datetime
    last_active: datetime | None = None

    model_config = {"from_attributes": True}


class OAuthRequest(BaseModel):
    code: str
    provider: str
