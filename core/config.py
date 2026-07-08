import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# ==============================
# Database
# ==============================

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./malikseed_cms.db"
)

# ==============================
# JWT
# ==============================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "your-super-secret-key-change-in-production"
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
)

# ==============================
# Upload Directory
# ==============================

DEFAULT_UPLOAD_DIR = (
    "/app/uploads"
    if Path("/.dockerenv").exists()
    else "uploads"
)

UPLOAD_DIR = os.getenv("UPLOAD_DIR", DEFAULT_UPLOAD_DIR)

MAX_FILE_SIZE = int(
    os.getenv("MAX_FILE_SIZE", "10485760")
)

# ==============================
# SMTP
# ==============================

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@malikseed.com")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@malikseed.com")

# ==============================
# First Admin
# ==============================

FIRST_ADMIN_EMAIL = os.getenv(
    "FIRST_ADMIN_EMAIL",
    "admin@malikseed.com"
)

FIRST_ADMIN_PASSWORD = os.getenv(
    "FIRST_ADMIN_PASSWORD",
    "admin123"
)


def get_upload_directory():
    """
    Returns a writable upload directory.

    Local:
        project/uploads

    Docker:
        /app/uploads
    """

    upload_path = Path(UPLOAD_DIR)

    if not upload_path.is_absolute():
        project_root = Path(__file__).resolve().parent.parent
        upload_path = project_root / upload_path

    upload_path.mkdir(parents=True, exist_ok=True)

    return str(upload_path)