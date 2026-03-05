from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.routers import auth, profiles, discover, matches, badges
from app.websocket.chat import router as ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await init_db()
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Database init failed: {e}")
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Dating app for Software Engineers — match by tech stack, personality & vibe",
    lifespan=lifespan,
)

# CORS
origins = [settings.FRONTEND_URL]
if settings.DEBUG:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REST routes
app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(discover.router)
app.include_router(matches.router)
app.include_router(badges.router)

# WebSocket
app.include_router(ws_router)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "app": settings.APP_NAME, "version": settings.APP_VERSION}


@app.get("/api/icebreakers")
async def get_icebreakers():
    return {
        "prompts": [
            "Tabs vs Spaces?",
            "Best testing framework?",
            "What's the worst bug you've ever shipped to production?",
            "Vim, VS Code, or IntelliJ?",
            "Monolith or microservices?",
            "REST or GraphQL?",
            "What side project are you most proud of?",
            "If you could mass-delete one technology from existence, what would it be?",
            "What's your go-to debugging strategy?",
            "Morning coder or night owl?",
            "What's one tech opinion that got you in trouble?",
            "Docker compose up or bare metal?",
            "Frontend or backend — and why are you wrong?",
            "What's the tech hill you'd die on?",
            "Pair programming: love it or leave it?",
        ]
    }
