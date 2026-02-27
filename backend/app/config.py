from pydantic_settings import BaseSettings
from pydantic import model_validator
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "DevMatch"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://devmatch:devmatch@localhost:5432/devmatch"
    DATABASE_URL_SYNC: str = "postgresql://devmatch:devmatch@localhost:5432/devmatch"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    SECRET_KEY: str = "change-this-to-a-secure-random-string-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None

    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAIL_FROM: str = "noreply@devmatch.app"

    # Frontend
    FRONTEND_URL: str = "http://localhost:5173"

    # Matching
    DAILY_LIKE_LIMIT: int = 20
    DAILY_SUPER_LIKE_LIMIT: int = 3

    @model_validator(mode="after")
    def derive_database_urls(self):
        """Auto-convert Railway's postgresql:// to asyncpg and sync variants."""
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            self.DATABASE_URL = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            self.DATABASE_URL_SYNC = url
        elif url.startswith("postgresql+asyncpg://"):
            self.DATABASE_URL_SYNC = url.replace("postgresql+asyncpg://", "postgresql://", 1)
        return self

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
