from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.models.badge import Badge, BadgeType
from app.auth.jwt import get_current_user
from app.services.badges import check_and_award_badges
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

router = APIRouter(prefix="/api/badges", tags=["Badges"])


class BadgeResponse(BaseModel):
    id: UUID
    badge_type: str
    earned_at: datetime

    model_config = {"from_attributes": True}


class BadgeInfo(BaseModel):
    type: str
    name: str
    description: str
    icon: str


BADGE_INFO = {
    BadgeType.BUG_SLAYER.value: BadgeInfo(
        type=BadgeType.BUG_SLAYER.value, name="Bug Slayer",
        description="Squashed bugs like a pro", icon="🐛"
    ),
    BadgeType.REFACTOR_MASTER.value: BadgeInfo(
        type=BadgeType.REFACTOR_MASTER.value, name="Refactor Master",
        description="Clean code enthusiast", icon="♻️"
    ),
    BadgeType.CICD_CHAMPION.value: BadgeInfo(
        type=BadgeType.CICD_CHAMPION.value, name="CI/CD Champion",
        description="Pipeline perfectionist", icon="🚀"
    ),
    BadgeType.OPEN_SOURCE_CONTRIBUTOR.value: BadgeInfo(
        type=BadgeType.OPEN_SOURCE_CONTRIBUTOR.value, name="Open Source Contributor",
        description="5+ public repositories on GitHub", icon="🌟"
    ),
    BadgeType.POLYGLOT.value: BadgeInfo(
        type=BadgeType.POLYGLOT.value, name="Polyglot Developer",
        description="Proficient in 5+ technologies", icon="🗣️"
    ),
    BadgeType.EARLY_ADOPTER.value: BadgeInfo(
        type=BadgeType.EARLY_ADOPTER.value, name="Early Adopter",
        description="Joined DevMatch early", icon="🏅"
    ),
    BadgeType.CONVERSATION_STARTER.value: BadgeInfo(
        type=BadgeType.CONVERSATION_STARTER.value, name="Conversation Starter",
        description="Sent 10+ messages", icon="💬"
    ),
    BadgeType.PROFILE_COMPLETE.value: BadgeInfo(
        type=BadgeType.PROFILE_COMPLETE.value, name="Profile Complete",
        description="Filled out your entire profile", icon="✅"
    ),
    BadgeType.FIRST_MATCH.value: BadgeInfo(
        type=BadgeType.FIRST_MATCH.value, name="First Match",
        description="Got your first match!", icon="💘"
    ),
    BadgeType.SUPER_LIKER.value: BadgeInfo(
        type=BadgeType.SUPER_LIKER.value, name="Super Liker",
        description="Used a super like", icon="⭐"
    ),
    BadgeType.SENIOR_DEV.value: BadgeInfo(
        type=BadgeType.SENIOR_DEV.value, name="Senior Dev Mode",
        description="10+ years of experience", icon="👨‍💻"
    ),
}


@router.get("", response_model=list[BadgeResponse])
async def get_my_badges(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check for new badges first
    await check_and_award_badges(current_user.id, db)

    result = await db.execute(
        select(Badge).where(Badge.user_id == current_user.id).order_by(Badge.earned_at.desc())
    )
    return result.scalars().all()


@router.get("/info", response_model=list[BadgeInfo])
async def get_all_badge_info():
    return list(BADGE_INFO.values())
