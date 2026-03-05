from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, or_, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.match import Match, MatchStatus
from app.models.like import Like
from app.models.message import Message
from app.auth.jwt import get_current_user
from app.schemas.match import LikeRequest, LikeResponse, MatchResponse
from app.schemas.message import MessageCreate, MessageResponse
from app.services.matching import calculate_compatibility
from app.services.badges import check_and_award_badges

router = APIRouter(prefix="/api", tags=["Matches"])


@router.post("/like/{user_id}", response_model=LikeResponse)
async def like_user(
    user_id: UUID,
    data: LikeRequest = LikeRequest(),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot like yourself")

    # Check if already liked
    result = await db.execute(
        select(Like).where(
            and_(Like.from_user_id == current_user.id, Like.to_user_id == user_id)
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already liked this user")

    # Create like
    like = Like(from_user_id=current_user.id, to_user_id=user_id, is_super_like=data.is_super_like)
    db.add(like)

    # Check for mutual like (match!)
    result = await db.execute(
        select(Like).where(
            and_(Like.from_user_id == user_id, Like.to_user_id == current_user.id)
        )
    )
    mutual = result.scalar_one_or_none()

    match_id = None
    score = None
    if mutual:
        # Calculate compatibility
        result_a = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
        result_b = await db.execute(select(Profile).where(Profile.user_id == user_id))
        profile_a = result_a.scalar_one_or_none()
        profile_b = result_b.scalar_one_or_none()

        score = 0.0
        if profile_a and profile_b:
            score = calculate_compatibility(profile_a, profile_b)

        # Ensure consistent ordering for the unique constraint
        uid1, uid2 = sorted([current_user.id, user_id])
        match = Match(user1_id=uid1, user2_id=uid2, compatibility_score=score)
        db.add(match)
        await db.flush()
        match_id = match.id

        await check_and_award_badges(current_user.id, db)
        await check_and_award_badges(user_id, db)

    await db.commit()

    return LikeResponse(liked=True, matched=mutual is not None, match_id=match_id, compatibility_score=score)


@router.post("/pass/{user_id}")
async def pass_user(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Record as a like with no super_like to track that we've seen this user
    # We use likes table to track passes too (could use separate table)
    result = await db.execute(
        select(Like).where(
            and_(Like.from_user_id == current_user.id, Like.to_user_id == user_id)
        )
    )
    if not result.scalar_one_or_none():
        like = Like(from_user_id=current_user.id, to_user_id=user_id, is_super_like=False)
        db.add(like)
        await db.commit()

    return {"passed": True}


@router.get("/matches", response_model=list[MatchResponse])
async def get_matches(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Match).where(
            and_(
                or_(Match.user1_id == current_user.id, Match.user2_id == current_user.id),
                Match.status == MatchStatus.ACTIVE.value,
            )
        ).order_by(Match.matched_at.desc())
    )
    matches = result.scalars().all()

    response = []
    for match in matches:
        other_user_id = match.user2_id if match.user1_id == current_user.id else match.user1_id
        prof_result = await db.execute(select(Profile).where(Profile.user_id == other_user_id))
        other_profile = prof_result.scalar_one_or_none()
        if not other_profile:
            continue

        # Get last message
        msg_result = await db.execute(
            select(Message)
            .where(Message.match_id == match.id)
            .order_by(Message.created_at.desc())
            .limit(1)
        )
        last_msg = msg_result.scalar_one_or_none()

        # Count unread
        unread_result = await db.execute(
            select(func.count()).select_from(Message).where(
                and_(
                    Message.match_id == match.id,
                    Message.sender_id != current_user.id,
                    Message.read_at.is_(None),
                )
            )
        )
        unread_count = unread_result.scalar() or 0

        from app.schemas.profile import ProfileResponse
        response.append(MatchResponse(
            id=match.id,
            other_user=ProfileResponse.model_validate(other_profile),
            compatibility_score=match.compatibility_score,
            status=match.status,
            matched_at=match.matched_at,
            last_message=last_msg.content if last_msg else None,
            unread_count=unread_count,
        ))

    return response


@router.delete("/matches/{match_id}")
async def unmatch(
    match_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Match).where(
            and_(
                Match.id == match_id,
                or_(Match.user1_id == current_user.id, Match.user2_id == current_user.id),
            )
        )
    )
    match = result.scalar_one_or_none()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    match.status = MatchStatus.UNMATCHED.value
    await db.commit()
    return {"unmatched": True}


@router.get("/matches/{match_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    match_id: UUID,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify user is part of this match
    result = await db.execute(
        select(Match).where(
            and_(
                Match.id == match_id,
                or_(Match.user1_id == current_user.id, Match.user2_id == current_user.id),
            )
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Match not found")

    offset = (page - 1) * limit
    result = await db.execute(
        select(Message)
        .where(Message.match_id == match_id)
        .order_by(Message.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    messages = result.scalars().all()

    # Mark messages as read
    for msg in messages:
        if msg.sender_id != current_user.id and msg.read_at is None:
            msg.read_at = func.now()
    await db.commit()

    return list(reversed(messages))


@router.post("/matches/{match_id}/messages", response_model=MessageResponse)
async def send_message(
    match_id: UUID,
    data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify user is part of this match
    result = await db.execute(
        select(Match).where(
            and_(
                Match.id == match_id,
                Match.status == MatchStatus.ACTIVE.value,
                or_(Match.user1_id == current_user.id, Match.user2_id == current_user.id),
            )
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Match not found or inactive")

    message = Message(
        match_id=match_id,
        sender_id=current_user.id,
        content=data.content,
        content_type=data.content_type,
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)

    try:
        await check_and_award_badges(current_user.id, db)
    except Exception:
        pass  # Badge check is non-critical

    return message
