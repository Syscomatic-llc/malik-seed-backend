from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from core.database import get_db
from models.contact.model import ContactInfo, ContactMessage, OfficeLocation, FAQ

router = APIRouter()


@router.get("/info")
def get_contact_info(db: Session = Depends(get_db)):
    """Get contact information"""
    info = db.query(ContactInfo).filter(ContactInfo.is_active == True).first()
    return info


@router.get("/locations")
def get_locations(db: Session = Depends(get_db)):
    """Get all office locations"""
    return db.query(OfficeLocation).filter(OfficeLocation.is_active == True).order_by(OfficeLocation.sort_order).all()


@router.get("/locations/headquarters")
def get_headquarters(db: Session = Depends(get_db)):
    """Get headquarters location"""
    return db.query(OfficeLocation).filter(
        OfficeLocation.is_headquarters == True,
        OfficeLocation.is_active == True
    ).first()


@router.get("/faqs")
def get_faqs(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get FAQs with optional category filter"""
    query = db.query(FAQ).filter(FAQ.is_active == True)
    if category:
        query = query.filter(FAQ.category == category)
    return query.order_by(FAQ.sort_order).all()


@router.get("/faqs/featured")
def get_featured_faqs(db: Session = Depends(get_db)):
    """Get featured FAQs"""
    return db.query(FAQ).filter(FAQ.is_featured == True, FAQ.is_active == True).order_by(FAQ.sort_order).all()


@router.post("/submit")
def submit_contact(
    name: str,
    email: str,
    message: str,
    phone: Optional[str] = None,
    subject: Optional[str] = None,
    inquiry_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Submit contact form"""
    contact_msg = ContactMessage(
        name=name,
        email=email,
        phone=phone,
        subject=subject,
        message=message,
        inquiry_type=inquiry_type
    )
    db.add(contact_msg)
    db.commit()
    db.refresh(contact_msg)

    return {
        "status": "success",
        "message": "Thank you for contacting us. We will get back to you soon.",
        "id": contact_msg.id
    }


@router.get("/")
def get_all_contact(db: Session = Depends(get_db)):
    """Get all contact page content"""
    return {
        "info": db.query(ContactInfo).filter(ContactInfo.is_active == True).first(),
        "locations": db.query(OfficeLocation).filter(OfficeLocation.is_active == True).order_by(OfficeLocation.sort_order).all(),
        "faqs": db.query(FAQ).filter(FAQ.is_active == True).order_by(FAQ.sort_order).all(),
        "featured_faqs": db.query(FAQ).filter(FAQ.is_featured == True, FAQ.is_active == True).order_by(FAQ.sort_order).all(),
    }
