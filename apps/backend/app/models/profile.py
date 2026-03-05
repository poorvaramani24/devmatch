import uuid
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, Float, Text, ForeignKey, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.types import StringList, GUID
import enum


class Role(str, enum.Enum):
    FRONTEND = "Frontend Engineer"
    BACKEND = "Backend Engineer"
    FULLSTACK = "Full Stack Engineer"
    SDET = "SDET / QA Engineer"
    DEVOPS = "DevOps Engineer"
    DATA = "Data Engineer"
    ML = "ML Engineer"
    MOBILE = "Mobile Engineer"
    PRODUCT = "Product Engineer"
    SECURITY = "Security Engineer"
    FOUNDER = "Tech Founder"
    OTHER = "Other"


class WorkStyle(str, enum.Enum):
    REMOTE = "Remote"
    HYBRID = "Hybrid"
    ONSITE = "Onsite"
    FLEXIBLE = "Flexible"


class Personality(str, enum.Enum):
    INTROVERT = "Introvert"
    EXTROVERT = "Extrovert"
    AMBIVERT = "Ambivert"
    BUILDER = "Builder"
    RESEARCHER = "Researcher"
    MENTOR = "Mentor"


class MatchingMode(str, enum.Enum):
    SERIOUS = "Serious Relationship"
    CASUAL = "Casual"
    HACKATHON_BUDDY = "Hackathon Buddy"
    COFOUNDER = "Co-founder Energy"


class Gender(str, enum.Enum):
    MALE = "Male"
    FEMALE = "Female"
    NON_BINARY = "Non-binary"
    OTHER = "Other"
    PREFER_NOT_TO_SAY = "Prefer not to say"


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), unique=True)

    # Basic info
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(String(50), nullable=False)
    looking_for: Mapped[list[str]] = mapped_column(StringList, default=list)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    photos: Mapped[list[str]] = mapped_column(StringList, default=list)

    # Location
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    country: Mapped[str] = mapped_column(String(100), default="United States")
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Professional
    role: Mapped[str] = mapped_column(String(100), nullable=False)
    years_experience: Mapped[int] = mapped_column(Integer, default=0)
    company: Mapped[str | None] = mapped_column(String(200), nullable=True)
    tech_stack: Mapped[list[str]] = mapped_column(StringList, default=list)
    favorite_tools: Mapped[list[str]] = mapped_column(StringList, default=list)
    work_style: Mapped[str] = mapped_column(String(50), default=WorkStyle.REMOTE.value)

    # Social
    github_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    stackoverflow_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    website_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Personality & Preferences
    personality: Mapped[str] = mapped_column(String(50), default=Personality.AMBIVERT.value)
    hobbies: Mapped[list[str]] = mapped_column(StringList, default=list)
    matching_mode: Mapped[str] = mapped_column(String(50), default=MatchingMode.SERIOUS.value)

    # Fun prompts
    prompt_tabs_open: Mapped[str | None] = mapped_column(Text, nullable=True)
    prompt_toxic_trait: Mapped[str | None] = mapped_column(Text, nullable=True)
    prompt_hill_to_die_on: Mapped[str | None] = mapped_column(Text, nullable=True)

    # GitHub data (populated via API)
    github_languages: Mapped[list[str]] = mapped_column(StringList, default=list)
    github_repos_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    github_contributions: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Visibility
    is_visible: Mapped[bool] = mapped_column(default=True)
    max_distance_km: Mapped[int] = mapped_column(Integer, default=100)
    min_age_preference: Mapped[int] = mapped_column(Integer, default=18)
    max_age_preference: Mapped[int] = mapped_column(Integer, default=99)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="profile")
