from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Enum, JSON
from sqlalchemy.sql import func
import enum

from models.base import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    APPLICANT = "applicant"
    USER = "user"


class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    SUSPENDED = "suspended"


class User(Base):
    """User model - for job applicants, admins, editors"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Personal info
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)

    # Auth
    password_hash = Column(String(255), nullable=True)
    otp_code = Column(String(10), nullable=True)
    otp_expires_at = Column(DateTime(timezone=True), nullable=True)
    email_verified = Column(Boolean, default=False)

    # Role & status
    role = Column(Enum(UserRole), default=UserRole.APPLICANT, nullable=False)
    status = Column(Enum(UserStatus), default=UserStatus.PENDING, nullable=False)

    # Profile
    avatar_url = Column(String(500), nullable=True)
    resume_url = Column(String(500), nullable=True)

    # Timestamps
    last_login = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<User {self.email}>"
