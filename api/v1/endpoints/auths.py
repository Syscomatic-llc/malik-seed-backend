from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, timedelta

from core.database import get_db
from core.security import generate_otp, hash_password, verify_password, create_access_token, is_otp_valid
from models.user.model import User, UserRole, UserStatus

router = APIRouter()


# ============== SCHEMAS ==============
class SignupRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    password: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ResendOTPRequest(BaseModel):
    email: EmailStr


class AuthResponse(BaseModel):
    status: str
    message: str
    data: Optional[dict] = None


class SetPasswordRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str = Field(..., min_length=6)


# ============== SIGNUP ==============
@router.post("/signup", response_model=AuthResponse)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """Step 1: User signs up with email - OTP is sent"""
    existing = db.query(User).filter(User.email == request.email).first()
    if existing and existing.email_verified:
        raise HTTPException(status_code=400, detail="Email already registered. Please login.")

    otp = generate_otp()
    otp_expires = datetime.utcnow() + timedelta(minutes=10)

    if existing:
        user = existing
        user.first_name = request.first_name
        user.last_name = request.last_name
        user.phone = request.phone
        user.otp_code = otp
        user.otp_expires_at = otp_expires
    else:
        user = User(
            first_name=request.first_name,
            last_name=request.last_name,
            email=request.email,
            phone=request.phone,
            otp_code=otp,
            otp_expires_at=otp_expires,
            role=UserRole.APPLICANT,
            status=UserStatus.PENDING,
            email_verified=False
        )
        db.add(user)

    db.commit()
    db.refresh(user)

    return {
        "status": "success",
        "message": "OTP sent to your email. Please verify within 10 minutes.",
        "data": {"email": user.email, "expires_in": "10 minutes"}
    }


# ============== VERIFY OTP ==============
@router.post("/verify-otp", response_model=AuthResponse)
def verify_otp(request: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Step 2: Verify OTP and optionally set password"""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.email_verified:
        raise HTTPException(status_code=400, detail="Email already verified. Please login.")

    if not is_otp_valid(user):
        raise HTTPException(status_code=400, detail="OTP expired. Please request a new one.")

    if user.otp_code != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP. Please try again.")

    user.email_verified = True
    user.status = UserStatus.ACTIVE
    user.otp_code = None
    user.otp_expires_at = None

    if request.password:
        user.password_hash = hash_password(request.password)

    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role.value})

    return {
        "status": "success",
        "message": "Email verified successfully!",
        "data": {
            "token": token,
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "role": user.role.value,
                "email_verified": user.email_verified
            }
        }
    }


# ============== RESEND OTP ==============
@router.post("/resend-otp", response_model=AuthResponse)
def resend_otp(request: ResendOTPRequest, db: Session = Depends(get_db)):
    """Resend OTP to user's email"""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.email_verified:
        raise HTTPException(status_code=400, detail="Email already verified. Please login.")

    otp = generate_otp()
    user.otp_code = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    return {
        "status": "success",
        "message": "OTP resent to your email.",
        "data": {"email": user.email, "expires_in": "10 minutes"}
    }


# ============== LOGIN ==============
@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password"""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.email_verified:
        raise HTTPException(status_code=401, detail="Email not verified. Please verify your email first.")

    if not user.password_hash:
        raise HTTPException(status_code=401, detail="Password not set. Please set your password.")

    if not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user.last_login = datetime.utcnow()
    db.commit()

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role.value})

    return {
        "status": "success",
        "message": "Login successful",
        "data": {
            "token": token,
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "role": user.role.value,
                "email_verified": user.email_verified
            }
        }
    }


# ============== SET PASSWORD ==============
@router.post("/set-password", response_model=AuthResponse)
def set_password(request: SetPasswordRequest, db: Session = Depends(get_db)):
    """Set password for user (after OTP verification)"""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.email_verified:
        raise HTTPException(status_code=400, detail="Please verify your email first")

    user.password_hash = hash_password(request.password)
    db.commit()

    return {
        "status": "success",
        "message": "Password set successfully. You can now login.",
        "data": {"email": user.email}
    }


# ============== FORGOT PASSWORD ==============
@router.post("/forgot-password", response_model=AuthResponse)
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Send OTP to reset password"""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp = generate_otp()
    user.otp_code = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    return {
        "status": "success",
        "message": "Password reset OTP sent to your email.",
        "data": {"email": user.email}
    }


# ============== RESET PASSWORD ==============
@router.post("/reset-password", response_model=AuthResponse)
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password with OTP"""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not is_otp_valid(user):
        raise HTTPException(status_code=400, detail="OTP expired. Please request a new one.")

    if user.otp_code != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    user.password_hash = hash_password(request.new_password)
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()

    return {
        "status": "success",
        "message": "Password reset successfully. You can now login with your new password.",
        "data": {"email": user.email}
    }


# ============== LOGOUT ==============
@router.post("/logout", response_model=AuthResponse)
def logout():
    """Logout (client-side token removal)"""
    return {
        "status": "success",
        "message": "Logout successful. Please remove your token.",
        "data": None
    }


# ============== GET CURRENT USER ==============
@router.get("/me")
def get_me(request: Request, db: Session = Depends(get_db)):
    """Get current user from token (Authorization: Bearer <token> or ?token=)"""
    from core.security import verify_token
    auth_header = request.headers.get("Authorization")
    token = None
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:]
    if not token:
        token = request.query_params.get("token")
    if not token:
        raise HTTPException(status_code=401, detail="Token required")

    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "status": "success",
        "data": {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role.value,
            "status": user.status.value,
            "avatar_url": user.avatar_url,
            "email_verified": user.email_verified
        }
    }
