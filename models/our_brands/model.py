from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON, Enum
from sqlalchemy.sql import func
import enum

from models.base import Base


class BrandCategory(str, enum.Enum):
    VEGETABLE_SEEDS = "vegetable_seeds"
    POTATO_SEEDS = "potato_seeds"
    FLOWER = "flower"
    MALIK_FARMS = "malik_farms"
    INNOVATION = "innovation"
    ORIGENE = "origene"
    TRAINING = "training"
    FRESH = "fresh"
    PLANTED_BY_MALIK = "planted_by_malik"
    FEATURES = "features"


class OurBrand(Base):
    """Our Brands - admin can manage. Matches Figma brand pages"""
    __tablename__ = "our_brands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False)
    category = Column(Enum(BrandCategory), nullable=False)

    tagline = Column(String(300), nullable=True)
    description = Column(Text, nullable=True)
    long_description = Column(Text, nullable=True)

    # Media
    logo_url = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)
    hero_image = Column(String(500), nullable=True)
    gallery_images = Column(JSON, default=list)

    # Features/highlights
    features = Column(JSON, default=list)

    # Stats
    stats = Column(JSON, default=list)

    # Link
    link = Column(String(500), nullable=True)

    # Rich page content sections (hero, intro, farmers, qualities, portfolio, heritage)
    content = Column(JSON, default=dict)

    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<OurBrand {self.name}>"


class FlowerPortfolio(Base):
    """Flower Portfolio - matches Figma 'OUR FLOWER PORTFOLIO'"""
    __tablename__ = "flower_portfolios"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    colors = Column(JSON, default=list)
    season = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<FlowerPortfolio {self.name}>"


class TrainingCentre(Base):
    """Training Centre - matches Figma training pages"""
    __tablename__ = "training_centres"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    long_description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    duration = Column(String(100), nullable=True)
    curriculum = Column(JSON, default=list)
    features = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<TrainingCentre {self.title}>"


class BrandProduct(Base):
    """Products under each brand - admin can manage"""
    __tablename__ = "brand_products"

    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, nullable=False)
    name = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    short_description = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)
    gallery_images = Column(JSON, default=list)
    specifications = Column(JSON, default=list)
    features = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<BrandProduct {self.name}>"
