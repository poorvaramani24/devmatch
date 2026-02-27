import pytest


def pytest_configure(config):
    """Set up test environment variables before anything loads."""
    import os
    os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
    os.environ.setdefault("DATABASE_URL_SYNC", "sqlite:///./test.db")
    os.environ.setdefault("SECRET_KEY", "test-secret-key")
    os.environ.setdefault("DEBUG", "false")
