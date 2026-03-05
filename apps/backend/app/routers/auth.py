from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.auth.jwt import hash_password, verify_password, create_access_token, get_current_user
from app.auth.oauth import get_google_user_info, get_github_user_info
from app.schemas.user import UserRegister, UserLogin, TokenResponse, UserResponse, OAuthRequest

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(email=data.email, password_hash=hash_password(data.password))
    db.add(user)
    await db.flush()

    # Create a minimal profile
    profile = Profile(
        user_id=user.id,
        display_name=data.display_name,
        age=25,
        gender="Prefer not to say",
        role="Other",
    )
    db.add(profile)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user_id=user.id)


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not user.password_hash or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user_id=user.id)


@router.post("/oauth/{provider}", response_model=TokenResponse)
async def oauth_login(provider: str, data: OAuthRequest, db: AsyncSession = Depends(get_db)):
    if provider == "google":
        user_info = await get_google_user_info(data.code)
    elif provider == "github":
        user_info = await get_github_user_info(data.code)
    else:
        raise HTTPException(status_code=400, detail="Unsupported provider")

    if not user_info or not user_info.get("email"):
        raise HTTPException(status_code=400, detail="Could not retrieve user info from provider")

    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_info["email"]))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            email=user_info["email"],
            oauth_provider=provider,
            oauth_id=user_info.get("oauth_id"),
            is_verified=True,
        )
        db.add(user)
        await db.flush()

        profile = Profile(
            user_id=user.id,
            display_name=user_info.get("name", ""),
            age=25,
            gender="Prefer not to say",
            role="Other",
            avatar_url=user_info.get("avatar"),
            github_url=user_info.get("github_url"),
        )
        db.add(profile)
        await db.commit()
        await db.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user_id=user.id)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
