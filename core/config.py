import os
from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./malikseed_cms.db")

# JWT
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# Uploads
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "10485760"))

# SMTP
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@malikseed.com")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@malikseed.com")

# First admin user
FIRST_ADMIN_EMAIL = os.getenv("FIRST_ADMIN_EMAIL", "admin@malikseed.com")
FIRST_ADMIN_PASSWORD = os.getenv("FIRST_ADMIN_PASSWORD", "admin123")


def get_upload_directory():
    """Get upload directory path, create if not exists"""
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), UPLOAD_DIR)
    os.makedirs(upload_dir, exist_ok=True)
    return upload_dir
