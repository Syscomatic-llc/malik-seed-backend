from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from core.config import DATABASE_URL
from models.base import Base

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_engine():
    return engine


def create_tables():

    from models.site_settings.model import (
        SiteSettings,
        MenuItem,
        SocialLink,
        PageSEO,
        Sitemap,
    )

    from models.homepage.model import (
        HomepageHeroSlide,
        HomepageAbout,
        HomepageService,
        HomepageBrand,
        HomepageTestimonial,
        HomepageTimeline,
        HomepagePartner,
        HomepageNewsItem,
        HomepageCTABanner,
    )

    from models.our_story.model import (
        OurStoryHero,
        OurStoryMission,
        OurStoryValue,
        OurStoryTimeline,
        OurStoryTeam,
        OurStoryAwards,
    )

    from models.our_brands.model import (
        OurBrand,
        FlowerPortfolio,
        TrainingCentre,
        BrandProduct,
    )

    from models.our_gallery.model import (
        GalleryItem,
        GalleryCategory,
        GalleryVideo,
    )

    from models.hiring.model import (
        JobPosition,
        JobApplication,
        AssessmentQuestion,
        CareerBenefit,
        HiringTestimonial,
        HiringPageContent,
        ResumeUpload,
    )

    from models.contact.model import (
        ContactInfo,
        ContactMessage,
        OfficeLocation,
        FAQ,
    )

    from models.news.model import (
        NewsArticle,
        NewsCategoryModel,
        NewsletterSubscriber,
        PressRelease,
    )

    from models.user.model import User
    from models.activity_log.model import ActivityLog

    Base.metadata.create_all(bind=engine)
