import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

SECRET_KEY = os.getenv("SECRET_KEY")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
)

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")

MAX_FILE_SIZE = int(
    os.getenv("MAX_FILE_SIZE", str(50 * 1024 * 1024))
)

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]
if not CORS_ORIGINS:
    CORS_ORIGINS = [
        "http://localhost:4200",
        "https://localhost:4200",
        "https://localhost:6500",
        "https://cmsmalik.syscomatic.cloud",
        "https://apimalikseed.syscomatic.cloud",
        "https://apimalikseed.syscomatic.cloud/api/v1/admin/",

    ]

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

FROM_EMAIL = os.getenv("FROM_EMAIL")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")

FIRST_ADMIN_EMAIL = os.getenv("FIRST_ADMIN_EMAIL")
FIRST_ADMIN_PASSWORD = os.getenv("FIRST_ADMIN_PASSWORD")


def get_upload_directory():

    upload_path = Path(UPLOAD_DIR)

    if not upload_path.is_absolute():
        upload_path = Path(__file__).resolve().parent.parent / upload_path

    upload_path.mkdir(parents=True, exist_ok=True)

    return str(upload_path)