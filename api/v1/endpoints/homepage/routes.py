from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from core.database import get_db
from models.homepage.model import (
    HomepageHeroSlide, HomepageAbout, HomepageService,
    HomepageBrand, HomepageTestimonial, HomepageTimeline,
    HomepagePartner, HomepageNewsItem, HomepageCTABanner
)

router = APIRouter()


# Homepage Hero
@router.get("/hero")
def get_hero(db: Session = Depends(get_db)):
    heroes = db.query(HomepageHeroSlide).filter(HomepageHeroSlide.is_active == True).order_by(HomepageHeroSlide.sort_order).all()
    return heroes


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
        "hero": db.query(HomepageHeroSlide).filter(HomepageHeroSlide.is_active == True).order_by(HomepageHeroSlide.sort_order).all(),
        "about": db.query(HomepageAbout).filter(HomepageAbout.is_active == True).first(),
        "services": db.query(HomepageService).filter(HomepageService.is_active == True).order_by(HomepageService.sort_order).all(),
        "brands": db.query(HomepageBrand).filter(HomepageBrand.is_active == True).order_by(HomepageBrand.sort_order).all(),
        "testimonials": db.query(HomepageTestimonial).filter(HomepageTestimonial.is_active == True).order_by(HomepageTestimonial.sort_order).all(),
        "timeline": db.query(HomepageTimeline).filter(HomepageTimeline.is_active == True).order_by(HomepageTimeline.sort_order).all(),
        "partners": db.query(HomepagePartner).filter(HomepagePartner.is_active == True).order_by(HomepagePartner.sort_order).all(),
        "news": db.query(HomepageNewsItem).filter(HomepageNewsItem.is_active == True).order_by(HomepageNewsItem.sort_order).all(),
        "cta_banners": db.query(HomepageCTABanner).filter(HomepageCTABanner.is_active == True).order_by(HomepageCTABanner.sort_order).all(),
    }
