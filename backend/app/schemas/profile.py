from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class ProfileCreate(BaseModel):
    display_name: str
    age: int
    gender: str
    looking_for: list[str] = []
    bio: str | None = None
    city: str | None = None
    state: str | None = None
    country: str = "United States"
    role: str
    years_experience: int = 0
    company: str | None = None
    tech_stack: list[str] = []
    favorite_tools: list[str] = []
    work_style: str = "Remote"
    github_url: str | None = None
    stackoverflow_url: str | None = None
    linkedin_url: str | None = None
    website_url: str | None = None
    personality: str = "Ambivert"
    hobbies: list[str] = []
    matching_mode: str = "Serious Relationship"
    prompt_tabs_open: str | None = None
    prompt_toxic_trait: str | None = None
    prompt_hill_to_die_on: str | None = None
    min_age_preference: int = 18
    max_age_preference: int = 99
    max_distance_km: int = 100


class ProfileUpdate(BaseModel):
    display_name: str | None = None
    age: int | None = None
    gender: str | None = None
    looking_for: list[str] | None = None
    bio: str | None = None
    avatar_url: str | None = None
    photos: list[str] | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    role: str | None = None
    years_experience: int | None = None
    company: str | None = None
    tech_stack: list[str] | None = None
    favorite_tools: list[str] | None = None
    work_style: str | None = None
    github_url: str | None = None
    stackoverflow_url: str | None = None
    linkedin_url: str | None = None
    website_url: str | None = None
    personality: str | None = None
    hobbies: list[str] | None = None
    matching_mode: str | None = None
    prompt_tabs_open: str | None = None
    prompt_toxic_trait: str | None = None
    prompt_hill_to_die_on: str | None = None
    is_visible: bool | None = None
    min_age_preference: int | None = None
    max_age_preference: int | None = None
    max_distance_km: int | None = None


class ProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    display_name: str
    age: int
    gender: str
    looking_for: list[str]
    bio: str | None = None
    avatar_url: str | None = None
    photos: list[str] = []
    city: str | None = None
    state: str | None = None
    country: str
    role: str
    years_experience: int
    company: str | None = None
    tech_stack: list[str]
    favorite_tools: list[str]
    work_style: str
    github_url: str | None = None
    stackoverflow_url: str | None = None
    linkedin_url: str | None = None
    website_url: str | None = None
    personality: str
    hobbies: list[str]
    matching_mode: str
    prompt_tabs_open: str | None = None
    prompt_toxic_trait: str | None = None
    prompt_hill_to_die_on: str | None = None
    github_languages: list[str] = []
    github_repos_count: int | None = None
    is_visible: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class DiscoverProfile(ProfileResponse):
    compatibility_score: float = 0.0
    badges: list[str] = []
