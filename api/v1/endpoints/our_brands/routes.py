from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List

from core.database import get_db
from models.our_brands.model import OurBrand, FlowerPortfolio, TrainingCentre, BrandProduct, BrandCategory

router = APIRouter()


@router.get("/categories")
def get_brand_categories():
    """Get all brand category options"""
    return [
        {"label": "Vegetable Seeds", "value": BrandCategory.VEGETABLE_SEEDS.value},
        {"label": "Potato Seeds", "value": BrandCategory.POTATO_SEEDS.value},
        {"label": "Flower", "value": BrandCategory.FLOWER.value},
        {"label": "Malik's Farms", "value": BrandCategory.MALIK_FARMS.value},
        {"label": "Innovation", "value": BrandCategory.INNOVATION.value},
        {"label": "Training", "value": BrandCategory.TRAINING.value},
        {"label": "Fresh", "value": BrandCategory.FRESH.value},
        {"label": "Planted by Malik", "value": BrandCategory.PLANTED_BY_MALIK.value},
    ]


@router.get("/brands")
def get_brands(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(OurBrand).filter(OurBrand.is_active == True)
    if category:
        query = query.filter(OurBrand.category == category)
    return query.order_by(OurBrand.sort_order).all()


@router.get("/brands/featured")
def get_featured_brands(db: Session = Depends(get_db)):
    return db.query(OurBrand).filter(OurBrand.is_featured == True, OurBrand.is_active == True).all()


@router.get("/brands/{slug}")
def get_brand_by_slug(slug: str, db: Session = Depends(get_db)):
    brand = db.query(OurBrand).filter(OurBrand.slug == slug, OurBrand.is_active == True).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand


@router.get("/brands/{slug}/detail")
def get_brand_detail_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get a brand with its full structured page content."""
    brand = db.query(OurBrand).filter(OurBrand.slug == slug, OurBrand.is_active == True).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    content = brand.content or {}

    def section(name: str, defaults: dict):
        return {**defaults, **(content.get(name) or {})}

    return {
        "id": brand.id,
        "name": brand.name,
        "slug": brand.slug,
        "category": brand.category.value if brand.category else None,
        "tagline": brand.tagline,
        "description": brand.description,
        "long_description": brand.long_description,
        "logo_url": brand.logo_url,
        "image_url": brand.image_url,
        "link": brand.link,
        "is_featured": brand.is_featured,
        "sort_order": brand.sort_order,
        "hero": section("hero", {
            "title": brand.name,
            "subtitle": "",
            "background_image": brand.hero_image,
            "scroll_text": "Scroll to explore"
        }),
        "intro": section("intro", {
            "heading": "Seeds built for",
            "heading_highlight": "Bangladesh's farmers.",
            "description": brand.description or "",
            "tags": brand.features or []
        }),
        "farmers": section("farmers", {
            "badge": "WITH OUR FARMERS",
            "heading": "Built for the farmers who grow them",
            "description": "Every variety we release is tested, proven, and trusted by the farmers who plant it.",
            "images": brand.gallery_images or []
        }),
        "qualities": section("qualities", {
            "badge": "WHAT WE BREED FOR",
            "heading": "Three qualities. Every variety.",
            "description": "Our portfolio is selected for three qualities that matter most to Bangladesh's farmers.",
            "cards": brand.stats or []
        }),
        "portfolio": section("portfolio", {
            "badge": "SEED PORTFOLIO",
            "heading": f"Bangladesh's Trusted {brand.name} Portfolio",
            "description": f"A carefully curated range of high-value crops selected for what performs in Bangladesh's fields.",
            "tags": []
        }),
        "heritage": section("heritage", {
            "badge": "OUR HERITAGE",
            "heading": "Over half a century in the field",
            "description": "",
            "images": [],
            "youtube_url": brand.link
        })
    }


@router.get("/flower-portfolio")
def get_flower_portfolio(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(FlowerPortfolio).filter(FlowerPortfolio.is_active == True)
    if category:
        query = query.filter(FlowerPortfolio.category == category)
    return query.order_by(FlowerPortfolio.sort_order).all()


@router.get("/training")
def get_training_centres(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(TrainingCentre).filter(TrainingCentre.is_active == True)
    if category:
        query = query.filter(TrainingCentre.category == category)
    return query.order_by(TrainingCentre.sort_order).all()


@router.get("/products")
def get_products(
    brand_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(BrandProduct).filter(BrandProduct.is_active == True)
    if brand_id:
        query = query.filter(BrandProduct.brand_id == brand_id)
    return query.order_by(BrandProduct.sort_order).all()


@router.get("/products/featured")
def get_featured_products(db: Session = Depends(get_db)):
    return db.query(BrandProduct).filter(BrandProduct.is_featured == True, BrandProduct.is_active == True).all()


@router.get("/products/{slug}")
def get_product_by_slug(slug: str, db: Session = Depends(get_db)):
    product = db.query(BrandProduct).filter(BrandProduct.slug == slug, BrandProduct.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("/")
def get_all_brands_content(db: Session = Depends(get_db)):
    return {
        "brands": db.query(OurBrand).filter(OurBrand.is_active == True).order_by(OurBrand.sort_order).all(),
        "featured_brands": db.query(OurBrand).filter(OurBrand.is_featured == True, OurBrand.is_active == True).all(),
        "flower_portfolio": db.query(FlowerPortfolio).filter(FlowerPortfolio.is_active == True).order_by(FlowerPortfolio.sort_order).all(),
        "training_centres": db.query(TrainingCentre).filter(TrainingCentre.is_active == True).order_by(TrainingCentre.sort_order).all(),
    }
