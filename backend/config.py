import os
from pathlib import Path

from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parent / ".env")


def required_setting(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


DATABASE_URL = required_setting("DATABASE_URL")
JWT_SECRET_KEY = required_setting("JWT_SECRET_KEY")
SESSION_SECRET = required_setting("SESSION_SECRET")
