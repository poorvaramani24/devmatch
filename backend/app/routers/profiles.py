from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.auth.jwt import get_current_user
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse
from app.services.github import fetch_github_languages
from app.services.badges import check_and_award_badges

router = APIRouter(prefix="/api/profile", tags=["Profiles"])


@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please complete setup.")
    return profile


@router.put("/me", response_model=ProfileResponse)
async def update_my_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)

    # Check for new badges
    await check_and_award_badges(current_user.id, db)

    return profile


@router.post("/me/setup", response_model=ProfileResponse)
async def setup_profile(
    data: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = result.scalar_one_or_none()

    if profile:
        # Update existing profile
        for field, value in data.model_dump().items():
            setattr(profile, field, value)
    else:
        profile = Profile(user_id=current_user.id, **data.model_dump())
        db.add(profile)

    await db.commit()
    await db.refresh(profile)

    await check_and_award_badges(current_user.id, db)

    return profile


@router.get("/{user_id}", response_model=ProfileResponse)
async def get_profile(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Profile).where(Profile.user_id == user_id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.post("/me/sync-github", response_model=ProfileResponse)
async def sync_github(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile or not profile.github_url:
        raise HTTPException(status_code=400, detail="No GitHub URL set in profile")

    # Extract username from GitHub URL
    username = profile.github_url.rstrip("/").split("/")[-1]
    github_data = await fetch_github_languages(username)

    profile.github_languages = github_data["languages"]
    profile.github_repos_count = github_data["repos_count"]

    await db.commit()
    await db.refresh(profile)

    await check_and_award_badges(current_user.id, db)

    return profile
