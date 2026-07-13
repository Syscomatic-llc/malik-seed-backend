from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from core.database import get_db
from models.homepage.model import (
    HomepageHeroSlide, HomepageAbout, HomepageService,
    HomepageBrand, HomepageTestimonial, HomepageTimeline,
    HomepagePartner, HomepageNewsItem, HomepageCTABanner
)
from models.site_settings.model import SiteSettings

router = APIRouter()


def _serialize_hero_slide(slide: HomepageHeroSlide) -> dict:
    """Return only the public-facing slide fields."""
    return {
        "id": slide.id,
        "title": slide.title,
        "description": slide.description,
        "background_image": slide.background_image,
        "background_video": slide.background_video,
        "mobile_image": slide.mobile_image,
        "sort_order": slide.sort_order,
        "is_active": slide.is_active,
        "created_at": slide.created_at,
        "updated_at": slide.updated_at,
    }


def _hero_cta_buttons(db: Session):
    """Build the global hero CTA buttons array from site settings."""
    site = db.query(SiteSettings).first()
    buttons = []
    if site:
        if site.hero_primary_cta_text:
            buttons.append({
                "type": "primary",
                "text": site.hero_primary_cta_text,
                "link": site.hero_primary_cta_link or "#",
            })
        if site.hero_secondary_cta_text:
            buttons.append({
                "type": "secondary",
                "text": site.hero_secondary_cta_text,
                "link": site.hero_secondary_cta_link or "#",
            })
    return buttons


# Homepage Hero
@router.get("/hero")
def get_hero(db: Session = Depends(get_db)):
    heroes = db.query(HomepageHeroSlide).filter(HomepageHeroSlide.is_active == True).order_by(HomepageHeroSlide.sort_order).all()
    return {
        "slides": [_serialize_hero_slide(slide) for slide in heroes],
        "cta_buttons": _hero_cta_buttons(db),
    }


# Homepage About
@router.get("/about")
def get_about(db: Session = Depends(get_db)):
    about = db.query(HomepageAbout).filter(HomepageAbout.is_active == True).first()
    return about


# Homepage Services
@router.get("/services")
def get_services(db: Session = Depends(get_db)):
    services = db.query(HomepageService).filter(HomepageService.is_active == True).order_by(HomepageService.sort_order).all()
    return services


# Homepage Brands
@router.get("/brands")
def get_brands(db: Session = Depends(get_db)):
    brands = db.query(HomepageBrand).filter(HomepageBrand.is_active == True).order_by(HomepageBrand.sort_order).all()
    return brands


# Homepage Testimonials
@router.get("/testimonials")
def get_testimonials(db: Session = Depends(get_db)):
    testimonials = db.query(HomepageTestimonial).filter(HomepageTestimonial.is_active == True).order_by(HomepageTestimonial.sort_order).all()
    return testimonials


# Homepage Timeline
@router.get("/timeline")
def get_timeline(db: Session = Depends(get_db)):
    timeline = db.query(HomepageTimeline).filter(HomepageTimeline.is_active == True).order_by(HomepageTimeline.sort_order).all()
    return timeline


# Homepage Partners
@router.get("/partners")
def get_partners(db: Session = Depends(get_db)):
    partners = db.query(HomepagePartner).filter(HomepagePartner.is_active == True).order_by(HomepagePartner.sort_order).all()
    return partners


# Homepage News
@router.get("/news")
def get_news(db: Session = Depends(get_db)):
    news = db.query(HomepageNewsItem).filter(HomepageNewsItem.is_active == True).order_by(HomepageNewsItem.sort_order).all()
    return news


# Homepage CTA Banners
@router.get("/cta-banners")
def get_cta_banners(db: Session = Depends(get_db)):
    banners = db.query(HomepageCTABanner).filter(HomepageCTABanner.is_active == True).order_by(HomepageCTABanner.sort_order).all()
    return banners


# Get all homepage content
@router.get("/")
def get_all_homepage_content(db: Session = Depends(get_db)):
    return {
        "hero": {
            "slides": [_serialize_hero_slide(slide) for slide in db.query(HomepageHeroSlide).filter(HomepageHeroSlide.is_active == True).order_by(HomepageHeroSlide.sort_order).all()],
            "cta_buttons": _hero_cta_buttons(db),
        },
        "about": db.query(HomepageAbout).filter(HomepageAbout.is_active == True).first(),
        "services": db.query(HomepageService).filter(HomepageService.is_active == True).order_by(HomepageService.sort_order).all(),
        "brands": db.query(HomepageBrand).filter(HomepageBrand.is_active == True).order_by(HomepageBrand.sort_order).all(),
        "testimonials": db.query(HomepageTestimonial).filter(HomepageTestimonial.is_active == True).order_by(HomepageTestimonial.sort_order).all(),
        "timeline": db.query(HomepageTimeline).filter(HomepageTimeline.is_active == True).order_by(HomepageTimeline.sort_order).all(),
        "partners": db.query(HomepagePartner).filter(HomepagePartner.is_active == True).order_by(HomepagePartner.sort_order).all(),
        "news": db.query(HomepageNewsItem).filter(HomepageNewsItem.is_active == True).order_by(HomepageNewsItem.sort_order).all(),
        "cta_banners": db.query(HomepageCTABanner).filter(HomepageCTABanner.is_active == True).order_by(HomepageCTABanner.sort_order).all(),
    }
