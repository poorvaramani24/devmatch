"""Integration tests for the API endpoints using SQLite."""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.database import Base, get_db
from app.main import app

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"
test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
test_session = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with test_session() as session:
        try:
            yield session
        finally:
            await session.close()


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def auth_client(client: AsyncClient):
    """Client with a registered and authenticated user."""
    resp = await client.post("/api/auth/register", json={
        "email": "test@example.com",
        "password": "testpassword123",
        "display_name": "Test User",
    })
    assert resp.status_code == 201
    token = resp.json()["access_token"]
    client.headers["Authorization"] = f"Bearer {token}"
    return client, resp.json()["user_id"]


class TestHealthCheck:
    @pytest.mark.asyncio
    async def test_health(self, client: AsyncClient):
        resp = await client.get("/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"
        assert data["app"] == "DevMatch"


class TestAuth:
    @pytest.mark.asyncio
    async def test_register(self, client: AsyncClient):
        resp = await client.post("/api/auth/register", json={
            "email": "new@example.com",
            "password": "securepass123",
            "display_name": "New User",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user_id" in data

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, client: AsyncClient):
        await client.post("/api/auth/register", json={
            "email": "dup@example.com",
            "password": "pass123456",
            "display_name": "User 1",
        })
        resp = await client.post("/api/auth/register", json={
            "email": "dup@example.com",
            "password": "pass123456",
            "display_name": "User 2",
        })
        assert resp.status_code == 400

    @pytest.mark.asyncio
    async def test_login(self, client: AsyncClient):
        await client.post("/api/auth/register", json={
            "email": "login@example.com",
            "password": "mypassword123",
            "display_name": "Login User",
        })
        resp = await client.post("/api/auth/login", json={
            "email": "login@example.com",
            "password": "mypassword123",
        })
        assert resp.status_code == 200
        assert "access_token" in resp.json()

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client: AsyncClient):
        await client.post("/api/auth/register", json={
            "email": "wrong@example.com",
            "password": "correct123",
            "display_name": "Wrong User",
        })
        resp = await client.post("/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "incorrect123",
        })
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_login_nonexistent(self, client: AsyncClient):
        resp = await client.post("/api/auth/login", json={
            "email": "nobody@example.com",
            "password": "doesntmatter",
        })
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_get_me(self, auth_client):
        client, user_id = auth_client
        resp = await client.get("/api/auth/me")
        assert resp.status_code == 200
        assert resp.json()["email"] == "test@example.com"

    @pytest.mark.asyncio
    async def test_get_me_no_token(self, client: AsyncClient):
        resp = await client.get("/api/auth/me")
        assert resp.status_code == 401


class TestProfile:
    @pytest.mark.asyncio
    async def test_get_my_profile(self, auth_client):
        client, _ = auth_client
        resp = await client.get("/api/profile/me")
        assert resp.status_code == 200
        assert resp.json()["display_name"] == "Test User"

    @pytest.mark.asyncio
    async def test_update_profile(self, auth_client):
        client, _ = auth_client
        resp = await client.put("/api/profile/me", json={
            "bio": "I am a developer",
            "role": "Backend Engineer",
            "tech_stack": ["Python", "Go", "PostgreSQL"],
            "work_style": "Remote",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["bio"] == "I am a developer"
        assert data["role"] == "Backend Engineer"
        assert "Python" in data["tech_stack"]

    @pytest.mark.asyncio
    async def test_setup_profile(self, auth_client):
        client, _ = auth_client
        resp = await client.post("/api/profile/me/setup", json={
            "display_name": "Dev User",
            "age": 28,
            "gender": "Male",
            "role": "Full Stack Engineer",
            "tech_stack": ["React", "TypeScript", "Node.js"],
            "work_style": "Remote",
            "personality": "Builder",
            "matching_mode": "Serious Relationship",
        })
        assert resp.status_code == 200
        assert resp.json()["role"] == "Full Stack Engineer"


class TestDiscovery:
    @pytest.mark.asyncio
    async def test_discover_empty(self, auth_client):
        client, _ = auth_client
        resp = await client.get("/api/discover")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


class TestIcebreakers:
    @pytest.mark.asyncio
    async def test_get_icebreakers(self, client: AsyncClient):
        resp = await client.get("/api/icebreakers")
        assert resp.status_code == 200
        data = resp.json()
        assert "prompts" in data
        prompts = data["prompts"]
        assert len(prompts) > 0
        assert any("Tabs" in p for p in prompts)


class TestBadges:
    @pytest.mark.asyncio
    async def test_get_all_badge_info(self, client: AsyncClient):
        resp = await client.get("/api/badges/info")
        assert resp.status_code == 200
        badges = resp.json()
        assert len(badges) > 0
        for badge in badges:
            assert "type" in badge
            assert "name" in badge
            assert "icon" in badge

    @pytest.mark.asyncio
    async def test_get_my_badges(self, auth_client):
        client, _ = auth_client
        resp = await client.get("/api/badges")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
