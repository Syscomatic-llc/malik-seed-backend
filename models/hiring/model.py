from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from models.base import Base


class JobDepartment(str, enum.Enum):
    SALES = "sales"
    MARKETING = "marketing"
    OPERATIONS = "operations"
    RESEARCH = "research"
    FINANCE = "finance"
    HR = "hr"
    IT = "it"
    FIELD = "field"
    LOGISTICS = "logistics"
    PRODUCTION = "production"


class JobType(str, enum.Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"


class JobLocation(str, enum.Enum):
    DHAKA = "dhaka"
    CHITTAGONG = "chittagong"
    RAJSHAHI = "rajshahi"
    KHULNA = "khulna"
    SYLHET = "sylhet"
    BARISAL = "barisal"
    RANGPUR = "rangpur"
    REMOTE = "remote"


class JobPosition(Base):
    """Open positions - admin can create/manage. Matches Figma 'Open Positions' screen"""
    __tablename__ = "job_positions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False)

    # Job details
    department = Column(Enum(JobDepartment), nullable=False)
    job_type = Column(Enum(JobType), default=JobType.FULL_TIME, nullable=False)
    location = Column(Enum(JobLocation), default=JobLocation.DHAKA, nullable=False)

    # Description
    description = Column(Text, nullable=False)
    short_description = Column(String(500), nullable=True)

    # Requirements & Responsibilities
    requirements = Column(JSON, default=list)
    responsibilities = Column(JSON, default=list)
    benefits = Column(JSON, default=list)

    # Skills
    skills_required = Column(JSON, default=list)
    experience_required = Column(String(100), nullable=True)
    education_required = Column(String(200), nullable=True)

    # Salary
    salary_range = Column(String(200), nullable=True)
    salary_currency = Column(String(10), default="BDT")

    # Job description / details PDF
    details_pdf_url = Column(String(500), nullable=True)

    # Position details
    positions_available = Column(Integer, default=1)
    application_deadline = Column(DateTime(timezone=True), nullable=True)

    # Assessment - matches Figma MCQ/Short Answer/Long Answer flow
    has_assessment = Column(Boolean, default=False)
    assessment_duration = Column(Integer, default=30)
    passing_score = Column(Integer, default=70)

    # Per-section time limits (minutes). Fall back to assessment_duration when not set.
    mcq_duration = Column(Integer, nullable=True)
    short_answer_duration = Column(Integer, nullable=True)
    long_answer_duration = Column(Integer, nullable=True)

    # Ordering
    sort_order = Column(Integer, default=0)

    # Status
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    is_urgent = Column(Boolean, default=False)

    # Stats
    view_count = Column(Integer, default=0)
    application_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<JobPosition {self.title}>"


class JobApplication(Base):
    """Job applications - matches Figma application flow (5 steps)"""
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)

    # User reference (nullable - applicants can apply without being logged in)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    position_id = Column(Integer, ForeignKey("job_positions.id"), nullable=False)

    # Application status flow
    status = Column(String(50), default="step_1")

    # Step 1: Personal Info
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)

    # OTP verification for application flow
    otp_code = Column(String(10), nullable=True)

    # Step 2: Experience & Education
    resume_url = Column(String(500), nullable=True)
    cover_letter = Column(Text, nullable=True)
    experience_years = Column(Integer, default=0)
    current_company = Column(String(200), nullable=True)
    current_designation = Column(String(200), nullable=True)
    current_salary = Column(String(100), nullable=True)
    expected_salary = Column(String(100), nullable=True)
    education = Column(JSON, default=list)

    # Step 3: Skills & Portfolio
    skills = Column(JSON, default=list)
    portfolio_url = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    references = Column(JSON, default=list)

    # Step 4: Assessment Answers - matches Figma MCQ/Short/Long answer sections
    # MCQ answers: {"question_id": "selected_option_index", ...}
    # Short answers: {"question_id": "answer_text", ...}
    # Long answers: {"question_id": "answer_text", ...}
    assessment_answers = Column(JSON, default=dict)
    assessment_score = Column(Integer, nullable=True)
    # Admin manual scores for short/long answer questions: {question_id: earned_marks}
    admin_scores = Column(JSON, default=dict)
    assessment_submitted_at = Column(DateTime(timezone=True), nullable=True)

    # Step 5: Additional Info & Submit
    why_join = Column(Text, nullable=True)
    availability = Column(String(100), nullable=True)
    relocate = Column(Boolean, default=False)
    additional_info = Column(Text, nullable=True)
    current_location = Column(String(200), nullable=True)
    source = Column(JSON, default=list)  # how the applicant heard about the opportunity

    # Final submission
    submitted_at = Column(DateTime(timezone=True), nullable=True)

    # Admin review
    admin_notes = Column(Text, nullable=True)
    interview_date = Column(DateTime(timezone=True), nullable=True)
    interview_notes = Column(Text, nullable=True)

    # Notifications
    is_notified = Column(Boolean, default=False)
    last_notification_sent = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<JobApplication {self.first_name} {self.last_name} - {self.position_id}>"


class AssessmentQuestion(Base):
    """Assessment questions - admin can create MCQ, Short Answer, Long Answer.
    Matches Figma: Technical Knowledge (MCQ), Short Answers, Long Answers"""
    __tablename__ = "assessment_questions"

    id = Column(Integer, primary_key=True, index=True)
    position_id = Column(Integer, ForeignKey("job_positions.id"), nullable=False)

    # question_type: "mcq" | "short_answer" | "long_answer"
    # Matches Figma sections: Technical Knowledge (MCQ), Short Answers, Long Answers
    question_type = Column(String(50), nullable=False)
    question = Column(Text, nullable=False)

    # For MCQ - options like ["A. Farmer preference", "B. Plot layout..."]
    options = Column(JSON, nullable=True)
    # For MCQ - correct_answer stores the correct option index or text
    correct_answer = Column(String(500), nullable=True)

    # Scoring
    marks = Column(Integer, default=1)

    # Time limit per question type (matches Figma)
    # MCQ: 20 minutes total, Short: 15 minutes, Long: 30 minutes
    time_limit = Column(Integer, nullable=True)

    # Character limit for text answers (matches Figma: Short=300, Long=500)
    char_limit = Column(Integer, nullable=True)

    # Category
    category = Column(String(100), nullable=True)

    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<AssessmentQuestion {self.question[:50]}...>"


class CareerBenefit(Base):
    """Career benefits - matches Figma 'Why Join Us' section"""
    __tablename__ = "career_benefits"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)
    image_url = Column(String(500), nullable=True)

    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<CareerBenefit {self.title}>"


class HiringTestimonial(Base):
    """Employee testimonials for hiring page - matches Figma 'Voice of Impact' in hiring"""
    __tablename__ = "hiring_testimonials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    designation = Column(String(200), nullable=True)
    department = Column(String(100), nullable=True)
    content = Column(Text, nullable=False)

    avatar_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)

    years_at_company = Column(Integer, nullable=True)

    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<HiringTestimonial {self.name}>"


class HiringPageContent(Base):
    """Hiring page hero/content - admin can manage"""
    __tablename__ = "hiring_page_contents"

    id = Column(Integer, primary_key=True, index=True)

    # Hero section
    hero_title = Column(String(500), nullable=False, default="Join Our Team")
    hero_subtitle = Column(String(500), nullable=True)
    hero_badge = Column(String(200), nullable=True)
    hero_description = Column(Text, nullable=True)
    hero_background_image = Column(String(500), nullable=True)
    hero_video_url = Column(String(500), nullable=True)

    # Stats
    stats = Column(JSON, default=list)

    # Initiative section (matches Figma "Malik Seeds Initiative")
    initiative_title = Column(String(200), nullable=True)
    initiative_description = Column(Text, nullable=True)
    initiative_image = Column(String(500), nullable=True)

    # CTA
    cta_title = Column(String(200), nullable=True, default="It's Your Turn")
    cta_description = Column(Text, nullable=True)
    cta_button_text = Column(String(100), nullable=True, default="View Open Positions")
    cta_button_link = Column(String(500), nullable=True, default="/hiring/positions")

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<HiringPageContent {self.hero_title}>"


class ResumeUpload(Base):
    """Public CV/resume uploads - stored for HR review"""
    __tablename__ = "resume_uploads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    position = Column(String(200), nullable=True)
    message = Column(Text, nullable=True)

    # New resume upload metadata
    resume_type = Column(String(50), nullable=True)
    position_id = Column(Integer, ForeignKey("job_positions.id"), nullable=True)
    position_name = Column(String(300), nullable=True)
    applicant_name = Column(String(300), nullable=True)

    filename = Column(String(300), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=True)

    current_location = Column(String(200), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    portfolio_url = Column(String(500), nullable=True)
    source = Column(JSON, default=list)

    is_reviewed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<ResumeUpload {self.email} - {self.filename}>"
