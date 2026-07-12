from fastapi import APIRouter
from .users import router as users_router
from .routes import router as main_router

router = APIRouter()
# Dedicated admin endpoints must be registered before the generic catch-all CRUD router
router.include_router(users_router, prefix="/users")
router.include_router(main_router)
