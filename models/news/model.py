from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON, Enum
from sqlalchemy.sql import func
import enum

from models.base import Base


class NewsCategory(str, enum.Enum):
    COMPANY = "company"
    PRODUCT = "product"
    INDUSTRY = "industry"
    EVENT = "event"
    AWARD = "award"
    PARTNERSHIP = "partnership"
    SUSTAINABILITY = "sustainability"
    RESEARCH = "research"
    RESEARCH_TRIALS = "research-trials"
    FARMER_STORIES = "farmer-stories"
    INNOVATION = "innovation"
    COMMUNITY_PROGRAMS = "community-programs"


class NewsArticle(Base):
    """News articles - admin can upload. Matches Figma News page & Article details"""
    __tablename__ = "news_articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    slug = Column(String(300), unique=True, nullable=False)

    # Content
    excerpt = Column(String(500), nullable=True)
    content = Column(Text, nullable=False)

    # Media
    featured_image = Column(String(500), nullable=True)
    gallery_images = Column(JSON, default=list)
    video_url = Column(String(500), nullable=True)
    video_thumbnail = Column(String(500), nullable=True)

    # Category & Tags
    category = Column(String(100), nullable=False, default="company")
    tags = Column(JSON, default=list)

    # Author
    author_name = Column(String(100), nullable=True)
    author_title = Column(String(200), nullable=True)
    author_avatar = Column(String(500), nullable=True)
    author_bio = Column(Text, nullable=True)

    # SEO
    meta_title = Column(String(200), nullable=True)
    meta_description = Column(String(500), nullable=True)
    meta_keywords = Column(String(500), nullable=True)
    og_image = Column(String(500), nullable=True)

    # Status
    is_featured = Column(Boolean, default=False)
    is_published = Column(Boolean, default=False)
    published_at = Column(DateTime(timezone=True), nullable=True)

    # Stats
    view_count = Column(Integer, default=0)
    share_count = Column(Integer, default=0)

    # Related articles
    related_article_ids = Column(JSON, default=list)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<NewsArticle {self.title}>"


class NewsCategoryModel(Base):
    """News categories - admin can manage"""
    __tablename__ = "news_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    icon = Column(String(100), nullable=True)

    article_count = Column(Integer, default=0)

    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<NewsCategoryModel {self.name}>"


class PressRelease(Base):
    """Press releases - admin can upload"""
    __tablename__ = "press_releases"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    slug = Column(String(300), unique=True, nullable=False)
    summary = Column(String(500), nullable=True)
    content = Column(Text, nullable=False)

    featured_image = Column(String(500), nullable=True)
    pdf_url = Column(String(500), nullable=True)

    publish_date = Column(DateTime(timezone=True), nullable=True)

    is_published = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<PressRelease {self.title}>"


class NewsletterSubscriber(Base):
    """Newsletter subscribers"""
    __tablename__ = "newsletter_subscribers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)

    # Interests
    interests = Column(JSON, default=list)

    # Verification
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(255), nullable=True)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<NewsletterSubscriber {self.email}>"
