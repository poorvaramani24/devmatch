from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.badge import Badge, BadgeType
from app.models.profile import Profile
from app.models.match import Match
from app.models.message import Message


async def check_and_award_badges(user_id: UUID, db: AsyncSession) -> list[str]:
    """Check and award any new badges the user has earned."""
    result = await db.execute(select(Badge).where(Badge.user_id == user_id))
    existing = {b.badge_type for b in result.scalars().all()}
    new_badges = []

    # Profile Complete badge
    if BadgeType.PROFILE_COMPLETE.value not in existing:
        result = await db.execute(select(Profile).where(Profile.user_id == user_id))
        profile = result.scalar_one_or_none()
        if profile and _is_profile_complete(profile):
            new_badges.append(BadgeType.PROFILE_COMPLETE.value)

    # Open Source Contributor badge
    if BadgeType.OPEN_SOURCE_CONTRIBUTOR.value not in existing:
        result = await db.execute(select(Profile).where(Profile.user_id == user_id))
        profile = result.scalar_one_or_none()
        if profile and profile.github_repos_count and profile.github_repos_count >= 5:
            new_badges.append(BadgeType.OPEN_SOURCE_CONTRIBUTOR.value)

    # Polyglot badge (5+ languages)
    if BadgeType.POLYGLOT.value not in existing:
        result = await db.execute(select(Profile).where(Profile.user_id == user_id))
        profile = result.scalar_one_or_none()
        if profile and len(profile.tech_stack or []) >= 5:
            new_badges.append(BadgeType.POLYGLOT.value)

    # First Match badge
    if BadgeType.FIRST_MATCH.value not in existing:
        result = await db.execute(
            select(Match).where(
                (Match.user1_id == user_id) | (Match.user2_id == user_id)
            )
        )
        if result.scalars().first():
            new_badges.append(BadgeType.FIRST_MATCH.value)

    # Conversation Starter badge
    if BadgeType.CONVERSATION_STARTER.value not in existing:
        result = await db.execute(
            select(Message).where(Message.sender_id == user_id)
        )
        messages = result.scalars().all()
        if len(messages) >= 10:
            new_badges.append(BadgeType.CONVERSATION_STARTER.value)

    # Senior Dev badge (10+ years experience)
    if BadgeType.SENIOR_DEV.value not in existing:
        result = await db.execute(select(Profile).where(Profile.user_id == user_id))
        profile = result.scalar_one_or_none()
        if profile and profile.years_experience >= 10:
            new_badges.append(BadgeType.SENIOR_DEV.value)

    # Save new badges
    for badge_type in new_badges:
        badge = Badge(user_id=user_id, badge_type=badge_type)
        db.add(badge)

    if new_badges:
        await db.commit()

    return new_badges


def _is_profile_complete(profile: Profile) -> bool:
    return all([
        profile.display_name,
        profile.bio,
        profile.role,
        profile.tech_stack,
        profile.personality,
        profile.matching_mode,
        profile.prompt_tabs_open or profile.prompt_toxic_trait or profile.prompt_hill_to_die_on,
    ])
