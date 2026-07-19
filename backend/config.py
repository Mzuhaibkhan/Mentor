from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional

class Settings(BaseSettings):
    GEMINI_API_KEY: str
    NVIDIA_API_KEY: Optional[str] = None
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:5174"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
