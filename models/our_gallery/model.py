from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON
from sqlalchemy.sql import func

from models.base import Base


class GalleryItem(Base):
    """Gallery items - admin can upload. Matches Figma Gallery"""
    __tablename__ = "gallery_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), nullable=True)

    category = Column(String(100), nullable=False)
    tags = Column(JSON, default=list)

    location = Column(String(200), nullable=True)
    date_taken = Column(String(100), nullable=True)

    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<GalleryItem {self.title}>"


class GalleryCategory(Base):
    """Gallery categories - admin can manage"""
    __tablename__ = "gallery_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    cover_image = Column(String(500), nullable=True)
    item_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<GalleryCategory {self.name}>"


class GalleryVideo(Base):
    """Gallery videos - admin can upload"""
    __tablename__ = "gallery_videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    video_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    category = Column(String(100), nullable=True)
    duration = Column(String(50), nullable=True)
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<GalleryVideo {self.title}>"
