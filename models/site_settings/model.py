from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON
from sqlalchemy.sql import func

from models.base import Base


class SiteSettings(Base):
    """Global site settings - admin can manage"""
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, index=True)
    site_name = Column(String(200), nullable=False, default="Malik Seed")
    site_tagline = Column(String(500), nullable=True)
    logo_url = Column(String(500), nullable=True)
    logo_dark_url = Column(String(500), nullable=True)
    favicon_url = Column(String(500), nullable=True)

    # Contact Info
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    contact_address = Column(Text, nullable=True)
    contact_hours = Column(String(200), nullable=True)

    # Social Media
    facebook_url = Column(String(500), nullable=True)
    twitter_url = Column(String(500), nullable=True)
    instagram_url = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    youtube_url = Column(String(500), nullable=True)

    # SEO
    meta_title = Column(String(200), nullable=True)
    meta_description = Column(String(500), nullable=True)
    meta_keywords = Column(String(500), nullable=True)
    google_analytics_id = Column(String(100), nullable=True)

    # Footer
    footer_text = Column(Text, nullable=True)
    footer_links = Column(JSON, default=list)
    copyright_text = Column(String(500), nullable=True)

    # Features
    maintenance_mode = Column(Boolean, default=False)
    maintenance_message = Column(Text, nullable=True)
    enable_newsletter = Column(Boolean, default=True)
    enable_careers = Column(Boolean, default=True)
    enable_gallery = Column(Boolean, default=True)

    # Appearance
    primary_color = Column(String(50), nullable=True, default="#2c5530")
    secondary_color = Column(String(50), nullable=True, default="#4a7c59")
    accent_color = Column(String(50), nullable=True, default="#f4a261")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<SiteSettings {self.site_name}>"


class MenuItem(Base):
    """Navigation menu items - admin can manage"""
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    url = Column(String(500), nullable=False)
    icon = Column(String(100), nullable=True)
    parent_id = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    location = Column(String(50), default="header", nullable=False)
    target = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<MenuItem {self.title}>"


class SocialLink(Base):
    """Social media links - admin can manage"""
    __tablename__ = "social_links"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String(50), nullable=False)
    url = Column(String(500), nullable=False)
    icon = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<SocialLink {self.platform}>"


class PageSEO(Base):
    """SEO settings for individual pages - admin can manage"""
    __tablename__ = "page_seos"

    id = Column(Integer, primary_key=True, index=True)
    page_path = Column(String(200), unique=True, nullable=False)
    title = Column(String(200), nullable=True)
    meta_title = Column(String(200), nullable=True)
    meta_description = Column(String(500), nullable=True)
    meta_keywords = Column(String(500), nullable=True)
    og_image = Column(String(500), nullable=True)
    og_title = Column(String(200), nullable=True)
    og_description = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<PageSEO {self.page_path}>"
