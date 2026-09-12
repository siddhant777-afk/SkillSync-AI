from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ------------------------------------------------------------------
    # Application
    # ------------------------------------------------------------------

    APP_NAME: str = Field(default="SkillSync AI")
    APP_VERSION: str = Field(default="1.0.0")
    ENVIRONMENT: str = Field(default="development")
    DEBUG: bool = Field(default=True)

    # ------------------------------------------------------------------
    # Server
    # ------------------------------------------------------------------

    HOST: str = Field(default="127.0.0.1")
    PORT: int = Field(default=8000)

    # ------------------------------------------------------------------
    # Database
    # ------------------------------------------------------------------

    DATABASE_URL: str = Field(
        default="postgresql+psycopg://postgres:postgres@localhost:5432/skillsync_ai"
    )

    # ------------------------------------------------------------------
    # JWT
    # ------------------------------------------------------------------

    SECRET_KEY: str = Field(
        default="9f8c6b29d4724e8ab9c7e0c3894bf8217e54c86a23b54d19bb6a27e4e1a6c429"
    )

    ALGORITHM: str = Field(default="HS256")

    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)

    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7)

    # ------------------------------------------------------------------
    # CORS
    # ------------------------------------------------------------------

    FRONTEND_URL: str = Field(default="http://localhost:5173")

    # ------------------------------------------------------------------
    # Logging
    # ------------------------------------------------------------------

    LOG_LEVEL: str = Field(default="INFO")

    # ------------------------------------------------------------------
    # AI Providers
    # ------------------------------------------------------------------

    OPENAI_API_KEY: str = Field(default="")
    GEMINI_API_KEY: str = Field(default="")

    # ------------------------------------------------------------------
    # GitHub
    # ------------------------------------------------------------------

    GITHUB_CLIENT_ID: str = Field(default="")
    GITHUB_CLIENT_SECRET: str = Field(default="")

    # ------------------------------------------------------------------
    # SMTP / Email Service
    # ------------------------------------------------------------------

    SMTP_HOST: str = Field(default="")
    SMTP_PORT: int = Field(default=587)
    SMTP_USER: str = Field(default="")
    SMTP_PASSWORD: str = Field(default="")
    SMTP_FROM_EMAIL: str = Field(default="noreply@skillsync.ai")
    SMTP_TLS: bool = Field(default=True)


@lru_cache
def get_settings() -> Settings:
    """
    Returns a cached Settings instance.
    """
    return Settings()


settings = get_settings()