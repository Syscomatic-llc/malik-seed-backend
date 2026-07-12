from contextlib import asynccontextmanager
import os
import mimetypes
import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

from api.v1.api import router as api_router
from core.database import create_tables, SessionLocal
from core.config import get_upload_directory, FIRST_ADMIN_EMAIL, FIRST_ADMIN_PASSWORD, CORS_ORIGINS
from core.security import hash_password
from models.user.model import User, UserRole, UserStatus


def ensure_admin_user():
    db = SessionLocal()
    try:
        if db.query(User).first():
            return

        email = FIRST_ADMIN_EMAIL or "malikseed.admin@gmail.com"
        password = FIRST_ADMIN_PASSWORD or "M@lik@2026"

        admin = User(
            first_name="Admin",
            last_name="User",
            email=email,
            password_hash=hash_password(password),
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE,
            email_verified=True,
        )
        db.add(admin)
        db.commit()
        print(f"Created admin user: {email}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting Application")
    create_tables()
    ensure_admin_user()
    print("Database Created Successfully")
    yield
    print("Shutting Down Application...")


app = FastAPI(
    title="Malik Seed CMS API",
    description="Backend CMS API for Malik Seed Website",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Static files for uploads (kept as fallback)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/media/{path:path}")
async def serve_media(path: str):
    """Serve uploaded media with explicit headers to avoid HTTP/2 proxy issues."""
    upload_dir = get_upload_directory()
    file_path = os.path.abspath(os.path.join(upload_dir, path))

    # Security: prevent path traversal
    if not file_path.startswith(os.path.abspath(upload_dir)):
        raise HTTPException(status_code=403, detail="Forbidden")

    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    media_type, _ = mimetypes.guess_type(file_path)
    if not media_type:
        media_type = "application/octet-stream"

    headers = {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Accept-Ranges": "bytes",
    }

    return FileResponse(
        file_path,
        media_type=media_type,
        headers=headers,
    )


@app.get("/")
async def root():
    return {
        "message": "Malik Seed CMS API Server Running",
        "version": "1.0.0",
        "docs_url": "/docs",
        "api_url": "/api/v1"
    }


@app.get("/health")
async def health():
    return {"status": "ok", "service": "malik-seed-cms"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
