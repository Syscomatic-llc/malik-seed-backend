from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from core.database import get_db
from models.our_gallery.model import GalleryItem, GalleryCategory, GalleryVideo

router = APIRouter()


@router.get("/items")
def get_gallery_items(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(GalleryItem).filter(GalleryItem.is_active == True)
    if category:
        query = query.filter(GalleryItem.category == category)
    return query.order_by(GalleryItem.sort_order).all()


@router.get("/items/featured")
def get_featured_items(db: Session = Depends(get_db)):
    return db.query(GalleryItem).filter(GalleryItem.is_featured == True, GalleryItem.is_active == True).all()


@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    return db.query(GalleryCategory).filter(GalleryCategory.is_active == True).order_by(GalleryCategory.sort_order).all()


@router.get("/videos")
def get_videos(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(GalleryVideo).filter(GalleryVideo.is_active == True)
    if category:
        query = query.filter(GalleryVideo.category == category)
    return query.order_by(GalleryVideo.sort_order).all()


@router.get("/videos/featured")
def get_featured_videos(db: Session = Depends(get_db)):
    return db.query(GalleryVideo).filter(GalleryVideo.is_featured == True, GalleryVideo.is_active == True).all()


@router.get("/")
def get_all_gallery(db: Session = Depends(get_db)):
    return {
        "items": db.query(GalleryItem).filter(GalleryItem.is_active == True).order_by(GalleryItem.sort_order).all(),
        "featured_items": db.query(GalleryItem).filter(GalleryItem.is_featured == True, GalleryItem.is_active == True).all(),
        "categories": db.query(GalleryCategory).filter(GalleryCategory.is_active == True).order_by(GalleryCategory.sort_order).all(),
        "videos": db.query(GalleryVideo).filter(GalleryVideo.is_active == True).order_by(GalleryVideo.sort_order).all(),
    }
