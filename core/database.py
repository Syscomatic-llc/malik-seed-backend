from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models.base import Base
from core.config import DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency to get DB session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_engine():
    """Get SQLAlchemy engine for admin"""
    return engine


def create_tables():
    """Create all database tables"""
    # Import all models so they register with Base.metadata
    from models.site_settings.model import SiteSettings, MenuItem, SocialLink, PageSEO
    from models.homepage.model import (
        HomepageHeroSlide, HomepageAbout, HomepageService,
        HomepageBrand, HomepageTestimonial, HomepageTimeline,
        HomepagePartner, HomepageNewsItem, HomepageCTABanner
    )
    from models.our_story.model import (
        OurStoryHero, OurStoryMission, OurStoryValue,
        OurStoryTimeline, OurStoryTeam, OurStoryAwards
    )
    from models.our_brands.model import OurBrand, FlowerPortfolio, TrainingCentre, BrandProduct
    from models.our_gallery.model import GalleryItem, GalleryCategory, GalleryVideo
    from models.hiring.model import (
        JobPosition, JobApplication, AssessmentQuestion,
        CareerBenefit, HiringTestimonial, HiringPageContent
    )
    from models.contact.model import ContactInfo, ContactMessage, OfficeLocation, FAQ
    from models.news.model import NewsArticle, NewsCategoryModel, NewsletterSubscriber, PressRelease
    from models.user.model import User

    Base.metadata.create_all(bind=engine)
