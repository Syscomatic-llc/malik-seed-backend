from contextlib import asynccontextmanager
import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

from api.v1.api import router as api_router
from core.database import create_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting Application")
    create_tables()
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


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
