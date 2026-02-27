import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.types import GUID
import enum


class BadgeType(str, enum.Enum):
    BUG_SLAYER = "Bug Slayer"
    REFACTOR_MASTER = "Refactor Master"
    CICD_CHAMPION = "CI/CD Champion"
    OPEN_SOURCE_CONTRIBUTOR = "Open Source Contributor"
    STACK_OVERFLOW_HERO = "Stack Overflow Hero"
    POLYGLOT = "Polyglot Developer"
    EARLY_ADOPTER = "Early Adopter"
    CONVERSATION_STARTER = "Conversation Starter"
    PROFILE_COMPLETE = "Profile Complete"
    FIRST_MATCH = "First Match"
    SUPER_LIKER = "Super Liker"
    SENIOR_DEV = "Senior Dev Mode"


class Badge(Base):
    __tablename__ = "badges"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    badge_type: Mapped[str] = mapped_column(String(100), nullable=False)
    earned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="badges")
