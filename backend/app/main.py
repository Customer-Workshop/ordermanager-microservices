from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.api.v1.router import api_router

# Import all models so they're registered with SQLAlchemy
import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(application: FastAPI):
    # Create tables on startup (development only — use Alembic in production)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI-Enabled Staffing & Onboarding Portal — manages the full staffing lifecycle "
        "from WMT request ingestion through candidate identification, shortlisting, "
        "interviews, offer processing, and onboarding."
    ),
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/health")
def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}
