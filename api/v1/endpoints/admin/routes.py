from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from starlette.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from typing import Any, Dict, List, Optional
from datetime import datetime
import os
import shutil
import json
import csv
import io
import zipfile
import re

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
    CareerBenefit, HiringTestimonial, HiringPageContent, ResumeUpload,
    HiringDropdownOption
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


# ============== DROPDOWN OPTIONS ==============

@router.get("/hiring/dropdown-options")
def get_dropdown_options(db: Session = Depends(get_db)):
    """Get managed department, job_type, and location values."""
    query = db.query(HiringDropdownOption).filter(HiringDropdownOption.is_active == True)
    departments = [o.label for o in query.filter(HiringDropdownOption.option_type == "department").order_by(HiringDropdownOption.sort_order).all()]
    job_types = [o.label for o in query.filter(HiringDropdownOption.option_type == "job_type").order_by(HiringDropdownOption.sort_order).all()]
    locations = [o.label for o in query.filter(HiringDropdownOption.option_type == "location").order_by(HiringDropdownOption.sort_order).all()]

    # Fallback to existing job positions if no managed options exist yet
    if not departments and not job_types and not locations:
        departments = sorted({r[0] for r in db.query(JobPosition.department).distinct().all() if r[0]})
        job_types = sorted({r[0] for r in db.query(JobPosition.job_type).distinct().all() if r[0]})
        locations = sorted({r[0] for r in db.query(JobPosition.location).distinct().all() if r[0]})

    return {
        "departments": departments,
        "job_types": job_types,
        "locations": locations,
    }


@router.get("/hiring/dropdown-options/all")
def get_all_dropdown_options(option_type: Optional[str] = None, db: Session = Depends(get_db)):
    """Get all managed dropdown options (including inactive) for admin."""
    query = db.query(HiringDropdownOption)
    if option_type:
        query = query.filter(HiringDropdownOption.option_type == option_type)
    options = query.order_by(HiringDropdownOption.option_type, HiringDropdownOption.sort_order).all()
    return [{
        "id": o.id,
        "option_type": o.option_type,
        "value": o.value,
        "label": o.label,
        "sort_order": o.sort_order,
        "is_active": o.is_active,
    } for o in options]


@router.post("/hiring/dropdown-options")
def create_dropdown_option(data: Dict[str, Any], db: Session = Depends(get_db)):
    """Create a new dropdown option."""
    option_type = data.get("option_type")
    label = data.get("label", '').strip()
    if not option_type or option_type not in ("department", "job_type", "location"):
        raise HTTPException(status_code=400, detail="Invalid option_type")
    if not label:
        raise HTTPException(status_code=400, detail="Label is required")

    value = label.lower().replace(' ', '_')
    existing = db.query(HiringDropdownOption).filter(
        HiringDropdownOption.option_type == option_type,
        HiringDropdownOption.value == value
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Option already exists")

    max_order = db.query(HiringDropdownOption.sort_order).filter(
        HiringDropdownOption.option_type == option_type
    ).order_by(HiringDropdownOption.sort_order.desc()).first()
    sort_order = (max_order[0] if max_order and max_order[0] is not None else 0) + 1

    option = HiringDropdownOption(
        option_type=option_type,
        value=value,
        label=label,
        sort_order=sort_order,
        is_active=True
    )
    db.add(option)
    db.commit()
    db.refresh(option)
    return {"status": "success", "id": option.id, "data": {
        "id": option.id,
        "option_type": option.option_type,
        "value": option.value,
        "label": option.label,
        "sort_order": option.sort_order,
        "is_active": option.is_active,
    }}


@router.put("/hiring/dropdown-options/{option_id}")
def update_dropdown_option(option_id: int, data: Dict[str, Any], db: Session = Depends(get_db)):
    """Update a dropdown option label or active status."""
    option = db.query(HiringDropdownOption).filter(HiringDropdownOption.id == option_id).first()
    if not option:
        raise HTTPException(status_code=404, detail="Option not found")

    label = data.get("label", '').strip()
    if label:
        option.label = label
        option.value = label.lower().replace(' ', '_')

    if "is_active" in data:
        option.is_active = data["is_active"]

    db.commit()
    db.refresh(option)
    return {"status": "success", "id": option.id, "data": {
        "id": option.id,
        "option_type": option.option_type,
        "value": option.value,
        "label": option.label,
        "sort_order": option.sort_order,
        "is_active": option.is_active,
    }}


@router.delete("/hiring/dropdown-options/{option_id}")
def delete_dropdown_option(option_id: int, db: Session = Depends(get_db)):
    """Delete a dropdown option."""
    option = db.query(HiringDropdownOption).filter(HiringDropdownOption.id == option_id).first()
    if not option:
        raise HTTPException(status_code=404, detail="Option not found")

    db.delete(option)
    db.commit()
    return {"status": "success", "id": option_id}


@router.post("/hiring/dropdown-options/reorder")
def reorder_dropdown_options(data: Dict[str, Any], db: Session = Depends(get_db)):
    """Reorder dropdown options. Expects { option_type, order: [id, id, ...] }."""
    option_type = data.get("option_type")
    order = data.get("order", [])
    if not option_type or option_type not in ("department", "job_type", "location"):
        raise HTTPException(status_code=400, detail="Invalid option_type")
    if not isinstance(order, list):
        raise HTTPException(status_code=400, detail="Order must be a list")

    for idx, option_id in enumerate(order):
        db.query(HiringDropdownOption).filter(
            HiringDropdownOption.id == option_id,
            HiringDropdownOption.option_type == option_type
        ).update({"sort_order": idx})
    db.commit()
    return {"status": "success"}


# ============== ASSESSMENT SCORING HELPERS ==============

def _option_prefix(text):
    m = re.match(r'^([A-Za-z0-9]+)[\.\)]', str(text or ''))
    return m.group(1).lower() if m else None


def _option_body(text):
    return re.sub(r'^[A-Za-z0-9]+[\.\)]\s*', '', str(text or '')).strip().lower()


def _resolve_correct_option(correct, options):
    """Return the full option text that `correct` refers to, or `correct` itself."""
    if correct is None:
        return correct
    correct = str(correct).strip()
    correct_lower = correct.lower()
    if not options:
        return correct
    # Exact full match
    for opt in options:
        if opt.strip().lower() == correct_lower:
            return opt
    # Prefix match (e.g. correct='C' matches 'C. Become a Tester')
    for opt in options:
        prefix = _option_prefix(opt)
        if prefix and prefix == correct_lower:
            return opt
    return correct


def _normalize_answer(answer, options):
    """Convert numeric indexes to option text; otherwise return the answer as a string."""
    if answer is None:
        return None
    if options and isinstance(answer, (int, str)) and str(answer).isdigit():
        idx = int(answer)
        if 0 <= idx < len(options):
            return str(options[idx]).strip()
    return str(answer).strip()


def _answers_match(target, answer):
    """Compare a correct answer (full option text or bare prefix) with an applicant answer."""
    if answer is None:
        return False
    target = str(target or '').strip()
    answer = str(answer).strip()
    if not target or not answer:
        return False
    target_lower = target.lower()
    answer_lower = answer.lower()
    if target_lower == answer_lower:
        return True

    target_prefix = _option_prefix(target)
    answer_prefix = _option_prefix(answer)
    target_body = _option_body(target)
    answer_body = _option_body(answer)

    if target_prefix and answer_prefix and target_prefix == answer_prefix:
        return True
    if target_body and answer_body and target_body == answer_body:
        return True
    # Allow bare prefix as a correct answer (e.g. target='C. ...' and answer='C')
    if target_prefix and answer_lower == target_prefix:
        return True
    if answer_prefix and target_lower == answer_prefix:
        return True
    return False

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


def _compact_sort_order(db: Session, model_class):
    """Renumber sort_order values so they are contiguous starting from 0."""
    items = db.query(model_class).order_by(model_class.sort_order.asc(), model_class.id.asc()).all()
    for idx, item in enumerate(items):
        if item.sort_order != idx:
            item.sort_order = idx
    db.commit()


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
    position: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List resume uploads with optional resume_type and position filters."""
    query = db.query(ResumeUpload)
    if resume_type:
        query = query.filter(ResumeUpload.resume_type == resume_type)
    if position:
        query = query.filter(
            (ResumeUpload.position_name.ilike(f"%{position}%")) |
            (ResumeUpload.position.ilike(f"%{position}%"))
        )
    resumes = query.order_by(ResumeUpload.created_at.desc()).all()
    return [{"id": item.id, **_model_to_dict(item)} for item in resumes]


@router.get("/resume/export")
def export_resumes(
    resume_type: Optional[str] = None,
    ids: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Export resumes to CSV. Optionally filter by selected IDs."""
    query = db.query(ResumeUpload)
    if resume_type:
        query = query.filter(ResumeUpload.resume_type == resume_type)
    if ids:
        try:
            id_list = [int(x.strip()) for x in ids.split(",") if x.strip()]
            if id_list:
                query = query.filter(ResumeUpload.id.in_(id_list))
        except ValueError:
            pass
    resumes = query.order_by(ResumeUpload.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Name", "Email", "Phone", "Resume Type", "Position", "Position Name",
        "File Name", "File URL", "Size (KB)", "Reviewed", "Submitted At"
    ])
    for r in resumes:
        size_kb = round((r.file_size or 0) / 1024, 2) if r.file_size else 0
        writer.writerow([
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


@router.post("/resume/download-pdfs")
def download_resume_pdfs(
    payload: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """Download selected/all resume PDFs as a zip archive."""
    ids = payload.get("ids")
    resume_type = payload.get("resume_type")

    query = db.query(ResumeUpload)
    if resume_type:
        query = query.filter(ResumeUpload.resume_type == resume_type)
    if isinstance(ids, list) and ids:
        query = query.filter(ResumeUpload.id.in_(ids))

    resumes = query.all()
    if not resumes:
        raise HTTPException(status_code=404, detail="No resume files found")

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for resume in resumes:
            file_path = os.path.join(UPLOAD_DIR, resume.file_url.replace("uploads/", "", 1))
            if os.path.exists(file_path):
                arcname = resume.filename
                zip_file.write(file_path, arcname)

    zip_buffer.seek(0)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    type_suffix = f"-{resume_type}" if resume_type else ""
    filename = f"malik-seeds-resumes{type_suffix}-{timestamp}.zip"

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


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
    admin_scores = application.admin_scores or {}

    total_marks = 0
    earned_marks = 0
    question_details = []
    for q in questions:
        applicant_answer = answers.get(str(q.id))
        normalized_answer = _normalize_answer(applicant_answer, q.options or [])
        is_correct = None
        q_earned = None

        if q.question_type == "mcq" and q.correct_answer is not None:
            total_marks += q.marks or 0
            target = _resolve_correct_option(q.correct_answer, q.options or [])
            if _answers_match(target, normalized_answer):
                is_correct = True
                q_earned = q.marks or 0
                earned_marks += q_earned
            else:
                is_correct = False
                q_earned = 0
        elif q.question_type in ("short_answer", "long_answer"):
            total_marks += q.marks or 0
            manual = admin_scores.get(str(q.id))
            if manual is not None:
                q_earned = float(manual)
                earned_marks += q_earned

        question_details.append({
            "id": q.id,
            "question_type": q.question_type,
            "question": q.question,
            "options": q.options,
            "correct_answer": q.correct_answer,
            "applicant_answer": normalized_answer,
            "marks": q.marks or 0,
            "earned_marks": q_earned,
            "is_correct": is_correct,
            "sort_order": q.sort_order or 0,
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


@router.put("/hiring/assessment-submissions/{application_id}/score")
def update_assessment_scores(
    application_id: int,
    payload: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """Admin manually scores short/long answer questions and recalculates total score."""
    application = db.query(JobApplication).filter(
        JobApplication.id == application_id
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    scores = payload.get("scores") or {}
    if not isinstance(scores, dict):
        raise HTTPException(status_code=400, detail="scores must be an object mapping question_id to earned_marks")

    questions = db.query(AssessmentQuestion).filter(
        AssessmentQuestion.position_id == application.position_id
    ).all()
    question_map = {q.id: q for q in questions}

    # Validate every provided score
    normalized_scores = {}
    for key, value in scores.items():
        try:
            qid = int(key)
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail=f"Invalid question id: {key}")

        question = question_map.get(qid)
        if not question:
            raise HTTPException(status_code=400, detail=f"Question {qid} does not belong to this position")
        if question.question_type == "mcq":
            raise HTTPException(status_code=400, detail=f"Question {qid} is an MCQ and cannot be manually scored")

        try:
            earned = float(value)
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail=f"Invalid earned marks for question {qid}: {value}")

        max_marks = question.marks or 0
        if earned < 0 or earned > max_marks:
            raise HTTPException(
                status_code=400,
                detail=f"Earned marks for question {qid} must be between 0 and {max_marks}"
            )
        normalized_scores[str(qid)] = earned

    # Merge with existing admin scores (so partial updates keep prior values)
    # Create a new dict so SQLAlchemy detects the change.
    application.admin_scores = {**(application.admin_scores or {}), **normalized_scores}

    # Recalculate total assessment score
    answers = application.assessment_answers or {}
    total_earned = 0
    total_marks = 0
    for q in questions:
        if not q.marks:
            continue
        total_marks += q.marks
        if q.question_type == "mcq" and q.correct_answer is not None:
            applicant_answer = _normalize_answer(answers.get(str(q.id)), q.options or [])
            target = _resolve_correct_option(q.correct_answer, q.options or [])
            if _answers_match(target, applicant_answer):
                total_earned += q.marks
        elif q.question_type in ("short_answer", "long_answer"):
            manual = application.admin_scores.get(str(q.id))
            if manual is not None:
                total_earned += float(manual)

    application.assessment_score = round((total_earned / total_marks) * 100) if total_marks else 0
    db.commit()
    db.refresh(application)

    # Return updated detail
    return get_assessment_submission_detail(application_id, db=db)


# ============== JOB APPLICATIONS ==============

@router.get("/hiring/applications")
def list_job_applications(
    position_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all job applications for the CMS (admin)."""
    query = db.query(JobApplication).order_by(JobApplication.created_at.desc())
    if position_id:
        query = query.filter(JobApplication.position_id == position_id)
    if search:
        query = query.filter(
            (JobApplication.first_name.ilike(f"%{search}%")) |
            (JobApplication.last_name.ilike(f"%{search}%")) |
            (JobApplication.email.ilike(f"%{search}%"))
        )

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
            "current_location": app.current_location,
            "position_id": app.position_id,
            "position_title": position.title if position else None,
            "resume_url": app.resume_url,
            "linkedin_url": app.linkedin_url,
            "portfolio_url": app.portfolio_url,
            "source": app.source or [],
            "status": app.status,
            "assessment_score": app.assessment_score,
            "assessment_submitted_at": app.assessment_submitted_at,
            "submitted_at": app.submitted_at,
            "created_at": app.created_at,
        })
    return result


@router.get("/hiring/applications/{application_id}")
def get_job_application(application_id: int, db: Session = Depends(get_db)):
    """Get a single job application with full details."""
    application = db.query(JobApplication).filter(JobApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    position = db.query(JobPosition).filter(JobPosition.id == application.position_id).first()

    return {
        "id": application.id,
        "first_name": application.first_name,
        "last_name": application.last_name,
        "email": application.email,
        "phone": application.phone,
        "current_location": application.current_location,
        "position_id": application.position_id,
        "position_title": position.title if position else None,
        "resume_url": application.resume_url,
        "linkedin_url": application.linkedin_url,
        "portfolio_url": application.portfolio_url,
        "source": application.source or [],
        "status": application.status,
        "assessment_score": application.assessment_score,
        "assessment_submitted_at": application.assessment_submitted_at,
        "submitted_at": application.submitted_at,
        "created_at": application.created_at,
        "education": application.education or [],
        "skills": application.skills or [],
        "experience_years": application.experience_years,
        "current_company": application.current_company,
        "current_designation": application.current_designation,
        "expected_salary": application.expected_salary,
        "why_join": application.why_join,
        "additional_info": application.additional_info,
        "admin_notes": application.admin_notes,
        "interview_date": application.interview_date,
    }


@router.put("/hiring/applications/{application_id}/status")
def update_job_application_status(
    application_id: int,
    payload: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """Update the status of a job application."""
    application = db.query(JobApplication).filter(JobApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    status = payload.get("status")
    if not status:
        raise HTTPException(status_code=400, detail="status is required")

    application.status = status
    db.commit()
    db.refresh(application)
    return {"status": "success", "application_id": application.id, "new_status": application.status}


@router.delete("/hiring/applications/{application_id}")
def delete_job_application(application_id: int, db: Session = Depends(get_db)):
    """Delete a job application."""
    application = db.query(JobApplication).filter(JobApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(application)
    db.commit()
    return {"status": "success", "message": "Application deleted"}


@router.get("/{resource}")
def list_items(resource: str, db: Session = Depends(get_db)):
    """List all items for a resource (including inactive)"""
    if resource not in MODEL_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Resource '{resource}' not found")

    model_class, is_single = MODEL_REGISTRY[resource]
    query = db.query(model_class)
    if hasattr(model_class, 'sort_order'):
        query = query.order_by(model_class.sort_order.asc())
    items = query.all()
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

    # Validate required fields for job positions
    if resource == "job-position":
        required = ["title", "slug", "department", "job_type", "location", "description"]
        missing = [f for f in required if not data.get(f)]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Missing required fields: {', '.join(missing)}"
            )
        # Check for duplicate slug before attempting insert
        existing_slug = db.query(model_class).filter(model_class.slug == data.get("slug")).first()
        if existing_slug:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A job position with slug '{data.get('slug')}' already exists"
            )

    # Auto-assign sort_order for new job positions if not provided
    if resource == "job-position" and "sort_order" not in data:
        max_order = db.query(model_class.sort_order).order_by(model_class.sort_order.desc()).first()
        data["sort_order"] = (max_order[0] if max_order and max_order[0] is not None else 0) + 1

    _apply_data(item, data)
    db.add(item)
    try:
        db.commit()
        db.refresh(item)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Database constraint error: {str(e.orig)}"
        )
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
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

    # Validate required fields for job positions
    if resource == "job-position":
        required = ["title", "slug", "department", "job_type", "location", "description"]
        missing = [f for f in required if not data.get(f)]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Missing required fields: {', '.join(missing)}"
            )
        # Check for duplicate slug when changing slug
        if "slug" in data and data["slug"] != item.slug:
            existing_slug = db.query(model_class).filter(model_class.slug == data.get("slug")).first()
            if existing_slug:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"A job position with slug '{data.get('slug')}' already exists"
                )

    _apply_data(item, data)
    try:
        db.commit()
        db.refresh(item)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Database constraint error: {str(e.orig)}"
        )
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
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

    try:
        if resource == "news-category":
            # Cascade delete: remove all articles linked to this category automatically.
            linked_articles = db.query(NewsArticle).filter(NewsArticle.category == item.name).all()
            for article in linked_articles:
                db.delete(article)

        if resource == "job-position":
            # Preserve job applications and resume uploads by clearing their position reference.
            # Assessment questions are removed via SQLAlchemy cascade.
            db.query(JobApplication).filter(JobApplication.position_id == item_id).update({"position_id": None})
            db.query(ResumeUpload).filter(ResumeUpload.position_id == item_id).update({"position_id": None})
            db.flush()

        db.delete(item)
        db.commit()

        # Compact sort_order for resources that support it so there are no gaps after deletion.
        # This is best-effort: if compaction fails, the delete should still succeed.
        if hasattr(model_class, 'sort_order'):
            try:
                _compact_sort_order(db, model_class)
            except Exception:
                db.rollback()

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error while deleting {resource}: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error while deleting {resource}: {str(e)}"
        )

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
    """Delete assessment question and recompact sort_order so sequence stays gap-free."""
    question = db.query(AssessmentQuestion).filter(
        AssessmentQuestion.id == question_id,
        AssessmentQuestion.position_id == position_id
    ).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    db.delete(question)
    db.commit()

    # Recompact remaining questions for this position.
    _compact_assessment_questions(db, position_id)

    return {"status": "success", "message": "Question deleted"}


def _compact_assessment_questions(db: Session, position_id: int):
    """Renumber assessment question sort_order values contiguously starting from 0."""
    questions = db.query(AssessmentQuestion).filter(
        AssessmentQuestion.position_id == position_id
    ).order_by(AssessmentQuestion.sort_order.asc(), AssessmentQuestion.id.asc()).all()
    for idx, q in enumerate(questions):
        if q.sort_order != idx:
            q.sort_order = idx
    db.commit()


@router.post("/hiring/positions/{position_id}/questions/reorder")
def reorder_assessment_questions(position_id: int, order: List[int], db: Session = Depends(get_db)):
    """Update assessment question sort_order based on provided ordered id list."""
    position = db.query(JobPosition).filter(JobPosition.id == position_id).first()
    if not position:
        raise HTTPException(status_code=404, detail="Position not found")

    for idx, question_id in enumerate(order):
        db.query(AssessmentQuestion).filter(
            AssessmentQuestion.id == question_id,
            AssessmentQuestion.position_id == position_id
        ).update({"sort_order": idx})
    db.commit()
    return {"status": "success"}

