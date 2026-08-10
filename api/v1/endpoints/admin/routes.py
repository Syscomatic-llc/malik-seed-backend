from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from starlette.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Any, Dict, List, Optional
from datetime import datetime
import os
import shutil
import json
import csv
import io

from PIL import Image

from core.config import MAX_FILE_SIZE, get_upload_directory

from core.database import get_db
from api.deps import require_admin, get_current_user
from models.user.model import User
from models.activity_log.model import ActivityLog

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
    CareerBenefit, HiringTestimonial, HiringPageContent, ResumeUpload
)
from models.contact.model import (
    ContactInfo, ContactMessage, OfficeLocation, FAQ
)
from models.news.model import (
    NewsArticle, NewsCategoryModel, PressRelease, NewsletterSubscriber
)
from models.site_settings.model import (
    SiteSettings, MenuItem, SocialLink, PageSEO, Sitemap
)

router = APIRouter(dependencies=[Depends(require_admin)])

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
    "resume": (ResumeUpload, False),

    # Contact
    "contact-info": (ContactInfo, True),
    "contact-message": (ContactMessage, False),
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
    "sitemap": (Sitemap, False),
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

def _get_resource_name(data: dict, item: any = None) -> str:
    """Extract a human-readable name from payload or model instance."""
    if data:
        for key in ("title", "name", "slug", "email", "page_path", "url_path"):
            if key in data and data[key]:
                return str(data[key])[:300]
    if item is not None:
        for attr in ("title", "name", "slug", "email", "page_path", "url_path"):
            val = getattr(item, attr, None)
            if val:
                return str(val)[:300]
    return ""


def _log_activity(
    db: Session,
    user: User,
    action: str,
    resource: str,
    resource_id: int,
    resource_name: str = "",
    details: dict = None,
):
    log = ActivityLog(
        user_id=user.id,
        user_email=user.email,
        action=action,
        resource_type=resource,
        resource_id=resource_id,
        resource_name=resource_name or "",
        details=details or {},
    )
    db.add(log)
    db.commit()


@router.get("/resume")
def list_resumes(
    resume_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List resume uploads with optional resume_type filter."""
    query = db.query(ResumeUpload)
    if resume_type:
        query = query.filter(ResumeUpload.resume_type == resume_type)
    resumes = query.order_by(ResumeUpload.created_at.desc()).all()
    return [{"id": item.id, **_model_to_dict(item)} for item in resumes]


@router.get("/resume/export")
def export_resumes(
    resume_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Export resumes to CSV."""
    query = db.query(ResumeUpload)
    if resume_type:
        query = query.filter(ResumeUpload.resume_type == resume_type)
    resumes = query.order_by(ResumeUpload.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Name", "Email", "Phone", "Resume Type", "Position", "Position Name",
        "File Name", "File URL", "Size (KB)", "Reviewed", "Submitted At"
    ])
    for r in resumes:
        size_kb = round((r.file_size or 0) / 1024, 2) if r.file_size else 0
        writer.writerow([
            r.id,
            r.name or "",
            r.email or "",
            r.phone or "",
            r.resume_type or "",
            r.position or "",
            r.position_name or "",
            r.filename or "",
            r.file_url or "",
            size_kb,
            "Yes" if r.is_reviewed else "No",
            r.created_at.isoformat() if r.created_at else "",
        ])

    output.seek(0)
    csv_bytes = io.BytesIO(output.getvalue().encode("utf-8"))
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    type_suffix = f"-{resume_type}" if resume_type else ""
    filename = f"malik-seeds-resumes{type_suffix}-{timestamp}.csv"

    return StreamingResponse(
        csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.post("/resume/bulk-delete")
def bulk_delete_resumes(
    payload: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """Bulk delete resume uploads by ids."""
    ids = payload.get("ids", []) if payload else []
    if not ids or not isinstance(ids, list):
        raise HTTPException(status_code=400, detail="ids must be a non-empty list")
    count = db.query(ResumeUpload).filter(ResumeUpload.id.in_(ids)).delete(synchronize_session=False)
    db.commit()
    return {"status": "success", "deleted": count}


@router.get("/activity-logs")
def get_activity_logs(db: Session = Depends(get_db)):
    """Get recent admin activity logs (latest 50)"""
    logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(50).all()
    return logs


# ============== ASSESSMENT SUBMISSIONS ==============

@router.get("/hiring/assessment-submissions")
def list_assessment_submissions(
    position_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """List all job applications that have submitted an assessment (admin)."""
    query = db.query(JobApplication).filter(
        JobApplication.assessment_submitted_at.isnot(None)
    ).order_by(JobApplication.assessment_submitted_at.desc())

    if position_id:
        query = query.filter(JobApplication.position_id == position_id)

    applications = query.all()
    result = []
    for app in applications:
        position = db.query(JobPosition).filter(JobPosition.id == app.position_id).first()
        result.append({
            "id": app.id,
            "first_name": app.first_name,
            "last_name": app.last_name,
            "email": app.email,
            "phone": app.phone,
            "position_id": app.position_id,
            "position_title": position.title if position else None,
            "assessment_score": app.assessment_score,
            "assessment_submitted_at": app.assessment_submitted_at,
            "status": app.status,
        })
    return result


@router.get("/hiring/assessment-submissions/{application_id}")
def get_assessment_submission_detail(
    application_id: int,
    db: Session = Depends(get_db)
):
    """Get a single assessment submission with questions and answers."""
    application = db.query(JobApplication).filter(
        JobApplication.id == application_id
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    position = db.query(JobPosition).filter(
        JobPosition.id == application.position_id
    ).first()

    questions = db.query(AssessmentQuestion).filter(
        AssessmentQuestion.position_id == application.position_id
    ).order_by(AssessmentQuestion.sort_order).all()

    answers = application.assessment_answers or {}

    total_marks = 0
    earned_marks = 0
    question_details = []
    for q in questions:
        applicant_answer = answers.get(str(q.id))
        is_correct = None
        q_earned = None

        if q.question_type == "mcq" and q.correct_answer is not None:
            total_marks += q.marks or 0
            if applicant_answer is not None and str(applicant_answer).lower().strip() == str(q.correct_answer).lower().strip():
                is_correct = True
                q_earned = q.marks or 0
                earned_marks += q_earned
            else:
                is_correct = False
                q_earned = 0

        question_details.append({
            "id": q.id,
            "question_type": q.question_type,
            "question": q.question,
            "options": q.options,
            "correct_answer": q.correct_answer,
            "applicant_answer": applicant_answer,
            "marks": q.marks or 0,
            "earned_marks": q_earned,
            "is_correct": is_correct,
        })

    mcq_total = sum(1 for q in question_details if q["question_type"] == "mcq")
    mcq_correct = sum(1 for q in question_details if q["question_type"] == "mcq" and q["is_correct"] is True)

    return {
        "id": application.id,
        "first_name": application.first_name,
        "last_name": application.last_name,
        "email": application.email,
        "phone": application.phone,
        "position_id": application.position_id,
        "position_title": position.title if position else None,
        "assessment_score": application.assessment_score,
        "passing_score": position.passing_score if position else 70,
        "assessment_submitted_at": application.assessment_submitted_at,
        "status": application.status,
        "total_questions": len(question_details),
        "mcq_score": f"{mcq_correct}/{mcq_total}" if mcq_total else None,
        "total_marks": total_marks,
        "earned_marks": earned_marks,
        "questions": question_details,
    }


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
def create_item(resource: str, data: Dict[str, Any], db: Session = Depends(get_db), user: User = Depends(require_admin)):
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
    _log_activity(
        db, user, "create", resource, item.id,
        resource_name=_get_resource_name(data, item),
        details={"created_id": item.id},
    )
    return {"status": "success", "id": item.id, "data": _model_to_dict(item)}


@router.put("/{resource}/{item_id}")
def update_item(resource: str, item_id: int, data: Dict[str, Any], db: Session = Depends(get_db), user: User = Depends(require_admin)):
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
    _log_activity(
        db, user, "update", resource, item.id,
        resource_name=_get_resource_name(data, item),
        details={"updated_fields": list(data.keys())},
    )
    return {"status": "success", "id": item.id, "data": _model_to_dict(item)}


@router.delete("/{resource}/{item_id}")
def delete_item(resource: str, item_id: int, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    """Delete item"""
    if resource not in MODEL_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Resource '{resource}' not found")

    model_class, _ = MODEL_REGISTRY[resource]
    item = db.query(model_class).filter(model_class.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if resource == "news-category":
        # Cascade delete: remove all articles linked to this category automatically.
        linked_articles = db.query(NewsArticle).filter(NewsArticle.category == item.name).all()
        for article in linked_articles:
            db.delete(article)

    db.delete(item)
    db.commit()
    _log_activity(
        db, user, "delete", resource, item_id,
        resource_name=_get_resource_name({}, item),
        details={},
    )
    return {"status": "success", "message": "Item deleted"}


@router.post("/{resource}/reorder")
def reorder_items(resource: str, order: List[int], db: Session = Depends(get_db)):
    """Generic reorder endpoint: update sort_order for supported resources."""
    if resource not in MODEL_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Resource '{resource}' not found")
    model_class, _ = MODEL_REGISTRY[resource]
    if not hasattr(model_class, 'sort_order'):
        raise HTTPException(status_code=400, detail=f"Resource '{resource}' does not support reordering")
    for idx, item_id in enumerate(order):
        db.query(model_class).filter(model_class.id == item_id).update({"sort_order": idx})
    db.commit()
    return {"status": "success"}


# ============== FILE UPLOAD ==============

@router.post("/upload/image")
def upload_image(
    file: UploadFile = File(...),
    folder: Optional[str] = Form("general"),
    resize: bool = Form(False),
    max_width: Optional[int] = Form(None),
    max_height: Optional[int] = Form(None),
    quality: int = Form(85),
):
    """Upload image file for CMS content. Optional resize with max_width/max_height/quality."""
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".pdf"}
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )

    # Enforce 10MB size limit
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum allowed size is {MAX_FILE_SIZE / 1024 / 1024:.0f}MB."
        )

    # Sanitize folder name
    folder = "".join(c for c in folder if c.isalnum() or c in "-_")
    target_dir = os.path.join(UPLOAD_DIR, folder)
    os.makedirs(target_dir, exist_ok=True)

    base_name = f"{folder}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{os.urandom(4).hex()}"
    original_filename = f"{base_name}{file_ext}"
    original_path = os.path.join(target_dir, original_filename)

    with open(original_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    final_filename = original_filename
    final_path = original_path
    resized = False
    final_width: Optional[int] = None
    final_height: Optional[int] = None

    # Resize image if requested and dimensions are image-compatible
    if resize and file_ext != ".pdf" and (max_width or max_height):
        max_width = max_width or 1920
        max_height = max_height or 1920
        quality = max(1, min(quality, 100))
        resized_filename = f"{base_name}_r{max_width}x{max_height}{file_ext}"
        resized_path = os.path.join(target_dir, resized_filename)

        try:
            with Image.open(original_path) as img:
                if file_ext in (".jpg", ".jpeg") and img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
                save_kwargs = {}
                if file_ext in (".jpg", ".jpeg"):
                    save_kwargs["quality"] = quality
                    save_kwargs["optimize"] = True
                elif file_ext == ".webp":
                    save_kwargs["quality"] = quality
                img.save(resized_path, **save_kwargs)
                final_width, final_height = img.width, img.height

            final_filename = resized_filename
            final_path = resized_path
            resized = True
        except Exception:
            # If resizing fails for any reason, fall back to the original file
            pass

    return {
        "status": "success",
        "filename": final_filename,
        "url": f"uploads/{folder}/{final_filename}",
        "path": final_path,
        "original_url": f"uploads/{folder}/{original_filename}",
        "resized": resized,
        "width": final_width,
        "height": final_height,
    }


@router.post("/upload/file")
def upload_file(
    file: UploadFile = File(...),
    folder: Optional[str] = Form("files"),
):
    """Upload a non-image file (PDF, DOC, DOCX, etc.) for CMS content."""
    allowed_extensions = {".pdf", ".doc", ".docx", ".txt", ".xls", ".xlsx", ".ppt", ".pptx"}
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )

    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum allowed size is {MAX_FILE_SIZE / 1024 / 1024:.0f}MB."
        )

    folder = "".join(c for c in folder if c.isalnum() or c in "-_")
    target_dir = os.path.join(UPLOAD_DIR, folder)
    os.makedirs(target_dir, exist_ok=True)

    base_name = f"{folder}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{os.urandom(4).hex()}"
    filename = f"{base_name}{file_ext}"
    file_path = os.path.join(target_dir, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "status": "success",
        "filename": filename,
        "url": f"uploads/{folder}/{filename}",
        "path": file_path,
    }


@router.post("/gallery-items/reorder")
def reorder_gallery_items(order: List[int], db: Session = Depends(get_db)):
    """Update gallery item sort_order based on provided ordered id list."""
    for idx, item_id in enumerate(order):
        db.query(GalleryItem).filter(GalleryItem.id == item_id).update({"sort_order": idx})
    db.commit()
    return {"status": "success"}


@router.post("/our-story-timeline/reorder")
def reorder_our_story_timeline(order: List[int], db: Session = Depends(get_db)):
    """Update our-story timeline sort_order based on provided ordered id list."""
    for idx, item_id in enumerate(order):
        db.query(OurStoryTimeline).filter(OurStoryTimeline.id == item_id).update({"sort_order": idx})
    db.commit()
    return {"status": "success"}


@router.post("/homepage-timeline/reorder")
def reorder_homepage_timeline(order: List[int], db: Session = Depends(get_db)):
    """Update homepage timeline sort_order based on provided ordered id list."""
    for idx, item_id in enumerate(order):
        db.query(HomepageTimeline).filter(HomepageTimeline.id == item_id).update({"sort_order": idx})
    db.commit()
    return {"status": "success"}


@router.post("/homepage-testimonial/reorder")
def reorder_homepage_testimonials(order: List[int], db: Session = Depends(get_db)):
    """Update homepage testimonial sort_order based on provided ordered id list."""
    for idx, item_id in enumerate(order):
        db.query(HomepageTestimonial).filter(HomepageTestimonial.id == item_id).update({"sort_order": idx})
    db.commit()
    return {"status": "success"}


@router.post("/hiring-testimonial/reorder")
def reorder_hiring_testimonials(order: List[int], db: Session = Depends(get_db)):
    """Update hiring testimonial sort_order based on provided ordered id list."""
    for idx, item_id in enumerate(order):
        db.query(HiringTestimonial).filter(HiringTestimonial.id == item_id).update({"sort_order": idx})
    db.commit()
    return {"status": "success"}


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
        "mcq_duration": position.mcq_duration,
        "short_answer_duration": position.short_answer_duration,
        "long_answer_duration": position.long_answer_duration,
        "assessment_duration": position.assessment_duration,
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

