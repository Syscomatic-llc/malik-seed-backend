from fastapi import APIRouter

from api.v1.endpoints.auths import router as auths_router
from api.v1.endpoints.homepage.routes import router as homepage_router
from api.v1.endpoints.our_story.routes import router as our_story_router
from api.v1.endpoints.our_brands.routes import router as our_brands_router
from api.v1.endpoints.our_gallery.routes import router as our_gallery_router
from api.v1.endpoints.hiring.routes import router as hiring_router
from api.v1.endpoints.contact.routes import router as contact_router
from api.v1.endpoints.news.routes import router as news_router
from api.v1.endpoints.site_settings import router as site_settings_router
from api.v1.endpoints.admin import router as admin_router

router = APIRouter()

router.include_router(auths_router, prefix="/auth", tags=["Authentication"])
router.include_router(homepage_router, prefix="/homepage", tags=["Homepage"])
router.include_router(our_story_router, prefix="/our-story", tags=["Our Story"])
router.include_router(our_brands_router, prefix="/our-brands", tags=["Our Brands"])
router.include_router(our_gallery_router, prefix="/our-gallery", tags=["Our Gallery"])
router.include_router(hiring_router, prefix="/hiring", tags=["Hiring"])
router.include_router(contact_router, prefix="/contact", tags=["Contact"])
router.include_router(news_router, prefix="/news", tags=["News"])
router.include_router(site_settings_router, tags=["Site Settings"])
router.include_router(admin_router, prefix="/admin", tags=["Admin"])
