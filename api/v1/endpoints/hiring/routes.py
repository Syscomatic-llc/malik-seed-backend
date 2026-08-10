from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from datetime import datetime
import json
import os
import random
import re
import shutil

from core.database import get_db
from core.security import verify_token
from core.config import get_upload_directory
from services.email_service import email_service
from models.hiring.model import (
    JobPosition, JobApplication, AssessmentQuestion,
    CareerBenefit, HiringTestimonial, HiringPageContent, ResumeUpload
)
from models.user.model import User

router = APIRouter()

UPLOAD_DIR = get_upload_directory()
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_current_user(token: str, db: Session):
    """Verify JWT token and return user"""
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ============== PUBLIC ENDPOINTS ==============

# Job Positions
@router.get("/positions")
def get_job_positions(
    department: Optional[str] = None,
    location: Optional[str] = None,
    job_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all active job positions with optional filters"""
    query = db.query(JobPosition).filter(JobPosition.is_active == True)
    if department:
        query = query.filter(JobPosition.department == department)
    if location:
        query = query.filter(JobPosition.location == location)
    if job_type:
        query = query.filter(JobPosition.job_type == job_type)
    positions = query.order_by(JobPosition.created_at.desc()).all()
    return positions


# Get single position by slug or ID
@router.get("/positions/{identifier}")
def get_position_by_identifier(identifier: str, db: Session = Depends(get_db)):
    """Get job position details by slug or numeric ID"""
    position = db.query(JobPosition).filter(
        JobPosition.slug == identifier,
        JobPosition.is_active == True
    ).first()

    if not position and identifier.isdigit():
        position = db.query(JobPosition).filter(
            JobPosition.id == int(identifier),
            JobPosition.is_active == True
        ).first()

    if not position:
        raise HTTPException(status_code=404, detail="Position not found")

    return {"position": position}


# Keep explicit slug endpoint for backward compatibility
@router.get("/positions/slug/{slug}")
def get_position_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get job position details by slug"""
    position = db.query(JobPosition).filter(
        JobPosition.slug == slug,
        JobPosition.is_active == True
    ).first()
    if not position:
        raise HTTPException(status_code=404, detail="Position not found")

    return {"position": position}


# Career Benefits
@router.get("/benefits")
def get_career_benefits(db: Session = Depends(get_db)):
    """Get all active career benefits"""
    benefits = db.query(CareerBenefit).filter(
        CareerBenefit.is_active == True
    ).order_by(CareerBenefit.sort_order).all()
    return benefits


# Hiring Testimonials
@router.get("/testimonials")
def get_hiring_testimonials(db: Session = Depends(get_db)):
    """Get employee testimonials for hiring page"""
    testimonials = db.query(HiringTestimonial).filter(
        HiringTestimonial.is_active == True
    ).order_by(HiringTestimonial.sort_order).all()
    return testimonials


# Hiring Page Content
@router.get("/page-content")
def get_hiring_page_content(db: Session = Depends(get_db)):
    """Get hiring page hero and content.

    Response mapping:
    - hero_badge  <- stored hero_title
    - hero_title  <- stored hero_subtitle
    """
    content = db.query(HiringPageContent).filter(
        HiringPageContent.is_active == True
    ).first()

    if not content:
        return None

    def col_value(col_name: str):
        return getattr(content, col_name)

    return {
        "id": col_value("id"),
        "hero_badge": col_value("hero_title"),
        "hero_title": col_value("hero_subtitle"),
        "hero_description": col_value("hero_description"),
        "hero_background_image": col_value("hero_background_image"),
        "hero_video_url": col_value("hero_video_url"),
        "stats": col_value("stats"),
        "initiative_title": col_value("initiative_title"),
        "initiative_description": col_value("initiative_description"),
        "initiative_image": col_value("initiative_image"),
        "cta_title": col_value("cta_title"),
        "cta_description": col_value("cta_description"),
        "cta_button_text": col_value("cta_button_text"),
        "cta_button_link": col_value("cta_button_link"),
        "is_active": col_value("is_active"),
        "created_at": col_value("created_at"),
        "updated_at": col_value("updated_at"),
    }


# Get all hiring content (public)
@router.get("/")
def get_all_hiring_content(db: Session = Depends(get_db)):
    """Get all hiring page content"""
    return {
        "positions": db.query(JobPosition).filter(
            JobPosition.is_active == True
        ).order_by(JobPosition.created_at.desc()).all(),
        "benefits": db.query(CareerBenefit).filter(
            CareerBenefit.is_active == True
        ).order_by(CareerBenefit.sort_order).all(),
        "testimonials": db.query(HiringTestimonial).filter(
            HiringTestimonial.is_active == True
        ).order_by(HiringTestimonial.sort_order).all(),
        "page_content": db.query(HiringPageContent).filter(
            HiringPageContent.is_active == True
        ).first()
    }


# ============== ASSESSMENT / QUESTIONS (Matches Figma) ==============

# Get assessment questions for a position - grouped by type
@router.get("/positions/{position_id}/assessment")
def get_position_assessment(position_id: int, db: Session = Depends(get_db)):
    """Get assessment questions grouped by type (MCQ, Short Answer, Long Answer)
    Matches Figma: Technical Knowledge (MCQ), Short Answers, Long Answers"""
    position = db.query(JobPosition).filter(
        JobPosition.id == position_id,
        JobPosition.is_active == True
    ).first()
    if not position:
        raise HTTPException(status_code=404, detail="Position not found")

    if not position.has_assessment:
        return {
            "position_id": position_id,
            "has_assessment": False,
            "mcq_questions": [],
            "short_answer_questions": [],
            "long_answer_questions": [],
            "mcq_count": 0,
            "short_answer_count": 0,
            "long_answer_count": 0,
            "total_questions": 0,
            "mcq_duration": 0,
            "short_answer_duration": 0,
            "long_answer_duration": 0,
            "duration": 0,
            "passing_score": position.passing_score
        }

    # Get all questions grouped by type
    all_questions = db.query(AssessmentQuestion).filter(
        AssessmentQuestion.position_id == position_id,
        AssessmentQuestion.is_active == True
    ).order_by(AssessmentQuestion.sort_order).all()

    mcq_questions = []
    short_answer_questions = []
    long_answer_questions = []

    for q in all_questions:
        q_safe = {
            "id": q.id,
            "question": q.question,
            "options": q.options,
            "marks": q.marks,
            "sort_order": q.sort_order,
            "char_limit": q.char_limit,
        }
        if q.question_type == "mcq":
            q_safe["correct_answer"] = q.correct_answer
            mcq_questions.append(q_safe)
        elif q.question_type == "short_answer":
            short_answer_questions.append(q_safe)
        elif q.question_type == "long_answer":
            long_answer_questions.append(q_safe)

    def section_duration(minutes):
        return minutes if minutes is not None else 0

    long_answer_count = len(long_answer_questions)

    return {
        "position_id": position_id,
        "has_assessment": True,
        "mcq_questions": mcq_questions,
        "short_answer_questions": short_answer_questions,
        "long_answer_questions": long_answer_questions,
        "mcq_count": len(mcq_questions),
        "short_answer_count": len(short_answer_questions),
        "long_answer_count": long_answer_count,
        "total_questions": len(all_questions),
        "mcq_duration": section_duration(position.mcq_duration),
        "short_answer_duration": section_duration(position.short_answer_duration),
        "long_answer_duration": section_duration(position.long_answer_duration) if long_answer_count > 0 else 0,
        "duration": position.assessment_duration,
        "passing_score": position.passing_score
    }


# ============== JOB APPLICATION FLOW ==============

# Step 1: Start Application (Personal Info + OTP)
@router.post("/apply/step-1")
def apply_step_1(
    position_id: int = Form(...),
    first_name: str = Form(...),
    last_name: Optional[str] = Form(None),
    email: str = Form(...),
    phone: Optional[str] = Form(None),
    token: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Step 1: Submit personal information, generate OTP, and send verification email"""
    position = db.query(JobPosition).filter(JobPosition.id == position_id).first()
    if not position:
        raise HTTPException(status_code=404, detail="Position not found")

    last_name = last_name or ""
    otp_code = str(random.randint(1000, 9999))

    user_id = None
    if token:
        try:
            user = get_current_user(token, db)
            user_id = user.id
        except Exception:
            pass

    existing = db.query(JobApplication).filter(
        JobApplication.email == email,
        JobApplication.position_id == position_id
    ).first()

    if existing:
        existing.first_name = first_name
        existing.last_name = last_name
        existing.phone = phone
        existing.status = "step_1"
        existing.otp_code = otp_code
        db.commit()
        db.refresh(existing)
        email_service.send_otp_email(existing.email, otp_code, f"{existing.first_name} {existing.last_name}".strip())
        return {
            "status": existing.status,
            "message": "Step 1 complete - OTP sent to your email",
            "application_id": existing.id,
            "otp_code": otp_code,
            "application": existing
        }

    application = JobApplication(
        user_id=user_id,
        position_id=position_id,
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=phone,
        status="step_1",
        otp_code=otp_code
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    position.application_count += 1
    db.commit()

    email_service.send_otp_email(application.email, otp_code, f"{application.first_name} {application.last_name}".strip())

    return {
        "status": "success",
        "message": "Step 1 complete - OTP sent to your email",
        "application_id": application.id,
        "otp_code": otp_code,
        "application": application
    }


# Get application status
@router.get("/applications/{application_id}")
def get_application_status(
    application_id: int,
    email: str,
    db: Session = Depends(get_db)
):
    """Get application status by ID and email"""
    application = db.query(JobApplication).filter(
        JobApplication.id == application_id,
        JobApplication.email == email
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    position = db.query(JobPosition).filter(JobPosition.id == application.position_id).first()

    return {
        "application": application,
        "position": position,
        "current_step": application.status,
        "assessment_score": application.assessment_score,
        "submitted_at": application.submitted_at
    }


# Get all applications for an email
@router.get("/applications")
def get_applications_by_email(
    email: str,
    db: Session = Depends(get_db)
):
    """Get all applications for an email address"""
    applications = db.query(JobApplication).filter(
        JobApplication.email == email
    ).order_by(JobApplication.created_at.desc()).all()

    result = []
    for app in applications:
        position = db.query(JobPosition).filter(JobPosition.id == app.position_id).first()
        result.append({"application": app, "position": position})

    return result


# ============== PUBLIC CV UPLOAD ==============

def _sanitize_filename_part(value: str) -> str:
    """Strip unsafe filesystem characters while keeping spaces and underscores."""
    value = (value or "").strip()
    return re.sub(r'[\\/*?:"<>|]', "", value)


@router.post("/upload-cv")
def upload_cv(
    file: UploadFile = File(...),
    resume_type: str = Form(...),
    applicant_name: Optional[str] = Form(None),
    name: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    position: Optional[str] = Form(None),
    message: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Public endpoint for uploading a CV/resume.

    - open_position: send the position name in the `position` field. Only resume PDF is needed.
    - future_leader: no extra fields needed. Only resume PDF is needed.
    - general: full applicant details (name, email, phone) are expected.
    """
    allowed_extensions = {".pdf", ".doc", ".docx"}
    file_ext = os.path.splitext(file.filename or "")[1].lower()

    if not file_ext or file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )

    resumes_dir = os.path.join(UPLOAD_DIR, "resumes")
    os.makedirs(resumes_dir, exist_ok=True)

    normalized_resume_type = (resume_type or "").lower().strip()
    if normalized_resume_type not in {"open_position", "future_leader", "general"}:
        raise HTTPException(
            status_code=400,
            detail="Invalid resume_type. Allowed: open_position, future_leader, general"
        )

    # Applicant name fallback with timestamp to keep filenames unique
    effective_name = (applicant_name or name or "").strip()
    if not effective_name:
        effective_name = f"Applicant_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    # Human-readable segments
    if normalized_resume_type == "open_position":
        hiring_type = "Open Position"
        position_segment = (position or "").strip()
    elif normalized_resume_type == "future_leader":
        hiring_type = "Future Leader Program"
        position_segment = ""
    else:  # general
        hiring_type = "General Resume"
        position_segment = ""

    # Build filename: Malik Seeds_{Hiring Type}_{Position/Program}_{Applicant Name} Resume.pdf
    parts = ["Malik Seeds", hiring_type]
    if position_segment:
        parts.append(position_segment)
    parts.append(f"{effective_name} Resume")

    filename = "_".join(_sanitize_filename_part(part) for part in parts)
    filename = f"{filename}{file_ext}"
    file_path = os.path.join(resumes_dir, filename)

    file_size = 0
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    file_size = os.path.getsize(file_path)

    upload = ResumeUpload(
        name=name,
        email=email,
        phone=phone,
        position=position,
        message=message,
        resume_type=normalized_resume_type,
        position_name=position or None,
        applicant_name=applicant_name or name or None,
        filename=filename,
        file_url=f"uploads/resumes/{filename}",
        file_size=file_size,
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)

    return {
        "status": "success",
        "message": "CV uploaded successfully",
        "id": upload.id,
        "url": upload.file_url,
        "filename": filename
    }


# ============== FILE UPLOAD ==============

@router.post("/upload/resume")
def upload_resume(
    file: UploadFile = File(...),
    application_id: Optional[int] = Form(None)
):
    """Upload resume file"""
    allowed_extensions = {".pdf", ".doc", ".docx"}
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )

    filename = f"resume_{application_id or 'temp'}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "status": "success",
        "filename": filename,
        "url": f"/uploads/{filename}",
        "path": file_path
    }
