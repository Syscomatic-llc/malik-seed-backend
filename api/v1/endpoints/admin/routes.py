from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Any, Dict, Optional
from datetime import datetime
import os
import shutil
import json

from core.database import get_db
from core.config import get_upload_directory

# Import all models
from models.homepage.model import (
    HomepageHeroSlide, HomepageAbout, HomepageService, HomepageBrand,
    HomepageTestimonial, HomepageTimeline, HomepagePartner, HomepageNewsItem, HomepageCTABanner
)
from models.our_story.model import (
    OurStoryHero, OurStoryMission, OurStoryValue, OurStoryTimeline,
    OurStoryTeam, OurStoryAwards
)
from models.our_brands.model import (
    OurBrand, FlowerPortfolio, TrainingCentre, BrandProduct
)
from models.our_gallery.model import (
    GalleryItem, GalleryCategory, GalleryVideo
)
from models.hiring.model import (
    JobPosition, JobApplication, AssessmentQuestion,
    CareerBenefit, HiringTestimonial, HiringPageContent
)
from models.contact.model import (
    ContactInfo, ContactMessage, OfficeLocation, FAQ
)
from models.news.model import (
    NewsArticle, NewsCategoryModel, PressRelease, NewsletterSubscriber
)
from models.site_settings.model import (
    SiteSettings, MenuItem, SocialLink, PageSEO
)

router = APIRouter()

UPLOAD_DIR = get_upload_directory()
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Registry mapping resource name -> (ModelClass, single_record)
# single_record=True means only one record expected (e.g. About, ContactInfo)
MODEL_REGISTRY: Dict[str, tuple] = {
    # Homepage
    "homepage-hero": (HomepageHeroSlide, False),
    "homepage-about": (HomepageAbout, True),
    "homepage-service": (HomepageService, False),
    "homepage-brand": (HomepageBrand, False),
    "homepage-testimonial": (HomepageTestimonial, False),
    "homepage-timeline": (HomepageTimeline, False),
    "homepage-partner": (HomepagePartner, False),
    "homepage-news": (HomepageNewsItem, False),
    "homepage-cta": (HomepageCTABanner, False),

    # Our Story
    "our-story-hero": (OurStoryHero, True),
    "our-story-mission": (OurStoryMission, True),
    "our-story-value": (OurStoryValue, False),
    "our-story-timeline": (OurStoryTimeline, False),
    "our-story-team": (OurStoryTeam, False),
    "our-story-award": (OurStoryAwards, False),

    # Brands
    "brand": (OurBrand, False),
    "flower-portfolio": (FlowerPortfolio, False),
    "training-centre": (TrainingCentre, False),
    "brand-product": (BrandProduct, False),

    # Gallery
    "gallery-item": (GalleryItem, False),
    "gallery-category": (GalleryCategory, False),
    "gallery-video": (GalleryVideo, False),

    # Hiring
    "job-position": (JobPosition, False),
    "career-benefit": (CareerBenefit, False),
    "hiring-testimonial": (HiringTestimonial, False),
    "hiring-page-content": (HiringPageContent, True),

    # Contact
    "contact-info": (ContactInfo, True),
    "office-location": (OfficeLocation, False),
    "faq": (FAQ, False),

    # News
    "news-article": (NewsArticle, False),
    "news-category": (NewsCategoryModel, False),
    "press-release": (PressRelease, False),

    # Site Settings
    "site-settings": (SiteSettings, True),
    "menu-item": (MenuItem, False),
    "social-link": (SocialLink, False),
    "page-seo": (PageSEO, False),
}


def _model_to_dict(obj) -> Dict[str, Any]:
    """Convert SQLAlchemy model instance to dict"""
    result = {}
    for col in obj.__table__.columns:
        val = getattr(obj, col.name)
        if val is not None:
            result[col.name] = val
    return result


def _apply_data(obj, data: Dict[str, Any]):
    """Apply dictionary data to model instance, skipping id and auto timestamps"""
    skip_fields = {"id", "created_at", "updated_at"}
    for key, value in data.items():
        if key in skip_fields:
            continue
        if hasattr(obj, key):
            # Handle JSON fields
            column = obj.__table__.columns.get(key)
            if column is not None and str(column.type) == "JSON":
                if isinstance(value, str):
                    try:
                        value = json.loads(value)
                    except json.JSONDecodeError:
                        pass
            setattr(obj, key, value)


# ============== GENERIC ADMIN CRUD ==============

@router.get("/{resource}")
def list_items(resource: str, db: Session = Depends(get_db)):
    """List all items for a resource (including inactive)"""
    if resource not in MODEL_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Resource '{resource}' not found")

    model_class, is_single = MODEL_REGISTRY[resource]
    items = db.query(model_class).all()
    return [{"id": item.id, **_model_to_dict(item)} for item in items]


@router.get("/{resource}/{item_id}")
def get_item(resource: str, item_id: int, db: Session = Depends(get_db)):
    """Get single item by id"""
    if resource not in MODEL_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Resource '{resource}' not found")

    model_class, _ = MODEL_REGISTRY[resource]
    item = db.query(model_class).filter(model_class.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"id": item.id, **_model_to_dict(item)}


@router.post("/{resource}")
def create_item(resource: str, data: Dict[str, Any], db: Session = Depends(get_db)):
    """Create new item"""
    if resource not in MODEL_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Resource '{resource}' not found")

    model_class, is_single = MODEL_REGISTRY[resource]

    # For single-record resources, update existing or create new
    if is_single:
        existing = db.query(model_class).first()
        if existing:
            _apply_data(existing, data)
            db.commit()
            db.refresh(existing)
            return {"status": "success", "id": existing.id, "data": _model_to_dict(existing)}

    item = model_class()
    _apply_data(item, data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"status": "success", "id": item.id, "data": _model_to_dict(item)}


@router.put("/{resource}/{item_id}")
def update_item(resource: str, item_id: int, data: Dict[str, Any], db: Session = Depends(get_db)):
    """Update existing item"""
    if resource not in MODEL_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Resource '{resource}' not found")

    model_class, _ = MODEL_REGISTRY[resource]
    item = db.query(model_class).filter(model_class.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    _apply_data(item, data)
    db.commit()
    db.refresh(item)
    return {"status": "success", "id": item.id, "data": _model_to_dict(item)}


@router.delete("/{resource}/{item_id}")
def delete_item(resource: str, item_id: int, db: Session = Depends(get_db)):
    """Delete item"""
    if resource not in MODEL_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Resource '{resource}' not found")

    model_class, _ = MODEL_REGISTRY[resource]
    item = db.query(model_class).filter(model_class.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(item)
    db.commit()
    return {"status": "success", "message": "Item deleted"}


# ============== FILE UPLOAD ==============

@router.post("/upload/image")
def upload_image(
    file: UploadFile = File(...),
    folder: Optional[str] = Form("general")
):
    """Upload image file for CMS content"""
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".pdf"}
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )

    # Sanitize folder name
    folder = "".join(c for c in folder if c.isalnum() or c in "-_")
    target_dir = os.path.join(UPLOAD_DIR, folder)
    os.makedirs(target_dir, exist_ok=True)

    filename = f"{folder}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{os.urandom(4).hex()}{file_ext}"
    file_path = os.path.join(target_dir, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "status": "success",
        "filename": filename,
        "url": f"uploads/{folder}/{filename}",
        "path": file_path
    }


# ============== ASSESSMENT QUESTIONS ==============

@router.get("/hiring/positions/{position_id}/questions")
def list_assessment_questions(position_id: int, db: Session = Depends(get_db)):
    """List all assessment questions for a position (admin - including inactive)"""
    position = db.query(JobPosition).filter(JobPosition.id == position_id).first()
    if not position:
        raise HTTPException(status_code=404, detail="Position not found")

    questions = db.query(AssessmentQuestion).filter(
        AssessmentQuestion.position_id == position_id
    ).order_by(AssessmentQuestion.sort_order).all()

    return {
        "position_id": position_id,
        "position_title": position.title,
        "questions": [{"id": q.id, **_model_to_dict(q)} for q in questions]
    }


@router.post("/hiring/positions/{position_id}/questions")
def create_assessment_question(position_id: int, data: Dict[str, Any], db: Session = Depends(get_db)):
    """Create assessment question for a position"""
    position = db.query(JobPosition).filter(JobPosition.id == position_id).first()
    if not position:
        raise HTTPException(status_code=404, detail="Position not found")

    question = AssessmentQuestion(position_id=position_id)
    _apply_data(question, data)
    db.add(question)
    db.commit()
    db.refresh(question)

    # Enable assessment on position if not already
    if not position.has_assessment:
        position.has_assessment = True
        db.commit()

    return {"status": "success", "id": question.id, "data": _model_to_dict(question)}


@router.put("/hiring/positions/{position_id}/questions/{question_id}")
def update_assessment_question(
    position_id: int, question_id: int, data: Dict[str, Any], db: Session = Depends(get_db)
):
    """Update assessment question"""
    question = db.query(AssessmentQuestion).filter(
        AssessmentQuestion.id == question_id,
        AssessmentQuestion.position_id == position_id
    ).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    _apply_data(question, data)
    db.commit()
    db.refresh(question)
    return {"status": "success", "id": question.id, "data": _model_to_dict(question)}


@router.delete("/hiring/positions/{position_id}/questions/{question_id}")
def delete_assessment_question(position_id: int, question_id: int, db: Session = Depends(get_db)):
    """Delete assessment question"""
    question = db.query(AssessmentQuestion).filter(
        AssessmentQuestion.id == question_id,
        AssessmentQuestion.position_id == position_id
    ).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    db.delete(question)
    db.commit()
    return {"status": "success", "message": "Question deleted"}
