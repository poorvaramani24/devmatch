from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.like import Like
from app.models.match import Match
from app.auth.jwt import get_current_user
from app.schemas.profile import DiscoverProfile
from app.services.matching import calculate_compatibility, passes_basic_filters

router = APIRouter(prefix="/api/discover", tags=["Discovery"])


@router.get("", response_model=list[DiscoverProfile])
async def discover_profiles(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Get current user's profile
    result = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    my_profile = result.scalar_one_or_none()
    if not my_profile:
        return []

    # Get IDs of users already liked/passed or matched
    liked_result = await db.execute(
        select(Like.to_user_id).where(Like.from_user_id == current_user.id)
    )
    liked_ids = {row[0] for row in liked_result.all()}

    matched_result = await db.execute(
        select(Match.user1_id, Match.user2_id).where(
            or_(Match.user1_id == current_user.id, Match.user2_id == current_user.id)
        )
    )
    matched_ids = set()
    for row in matched_result.all():
        matched_ids.add(row[0])
        matched_ids.add(row[1])

    exclude_ids = liked_ids | matched_ids | {current_user.id}

    # Get candidate profiles
    result = await db.execute(
        select(Profile).where(
            and_(
                Profile.user_id.notin_(exclude_ids),
                Profile.is_visible == True,
            )
        )
    )
    candidates = result.scalars().all()

    # Score and filter
    scored = []
    for candidate in candidates:
        if not passes_basic_filters(my_profile, candidate):
            continue
        score = calculate_compatibility(my_profile, candidate)
        scored.append((candidate, score))

    # Sort by compatibility score descending
    scored.sort(key=lambda x: x[1], reverse=True)

    # Paginate
    start = (page - 1) * limit
    end = start + limit
    page_results = scored[start:end]

    # Build response
    profiles = []
    for candidate, score in page_results:
        # Get badges for this user
        from app.models.badge import Badge
        badge_result = await db.execute(
            select(Badge.badge_type).where(Badge.user_id == candidate.user_id)
        )
        badges = [row[0] for row in badge_result.all()]

        profile_data = DiscoverProfile.model_validate(candidate)
        profile_data.compatibility_score = score
        profile_data.badges = badges
        profiles.append(profile_data)

    return profiles
