from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Staffing AI Portal"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql://staffing_user:staffing_pass@localhost:5432/staffing_portal"

    # Security
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    # SSO Configuration (Infosys SSO - placeholder)
    SSO_ENABLED: bool = False
    SSO_PROVIDER_URL: Optional[str] = None
    SSO_CLIENT_ID: Optional[str] = None
    SSO_CLIENT_SECRET: Optional[str] = None

    # WMT Integration (placeholder)
    WMT_API_URL: Optional[str] = None
    WMT_API_KEY: Optional[str] = None
    WMT_POLL_INTERVAL_SECONDS: int = 300

    # AI Configuration
    AI_PROVIDER: str = "anthropic"  # "anthropic" | "bedrock" | "openai"
    ANTHROPIC_API_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    BEDROCK_MODEL_ID: str = "anthropic.claude-3-5-sonnet-20241022-v2:0"
    AI_MODEL: str = "claude-sonnet-4-20250514"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
