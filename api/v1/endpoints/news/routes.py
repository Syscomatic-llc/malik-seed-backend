from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from core.database import get_db
from models.news.model import NewsArticle, NewsCategoryModel, PressRelease, NewsletterSubscriber

router = APIRouter()


@router.get("/articles")
def get_articles(
    category: Optional[str] = None,
    slug: Optional[str] = None,
    featured: Optional[bool] = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get news articles with pagination (default 10 per page)"""
    query = db.query(NewsArticle).filter(
        NewsArticle.is_published == True,
        NewsArticle.is_active == True
    )
    if category:
        query = query.filter(NewsArticle.category == category)
    if slug:
        query = query.filter(NewsArticle.slug == slug)
    if featured:
        query = query.filter(NewsArticle.is_featured == True)

    total = query.count()
    page = max(1, page)
    limit = max(1, min(limit, 100))
    offset = (page - 1) * limit

    items = query.order_by(NewsArticle.published_at.desc()).offset(offset).limit(limit).all()
    pages = (total + limit - 1) // limit

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages,
        "has_next": page < pages,
        "has_prev": page > 1
    }


@router.get("/articles/featured")
def get_featured_articles(db: Session = Depends(get_db)):
    """Get featured news articles"""
    return db.query(NewsArticle).filter(
        NewsArticle.is_featured == True,
        NewsArticle.is_published == True,
        NewsArticle.is_active == True
    ).order_by(NewsArticle.published_at.desc()).all()


@router.get("/articles/{slug}")
def get_article_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get single article by slug"""
    article = db.query(NewsArticle).filter(
        NewsArticle.slug == slug,
        NewsArticle.is_active == True
    ).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    # Increment view count
    article.view_count += 1
    db.commit()

    return article


@router.get("/categories")
def get_news_categories(db: Session = Depends(get_db)):
    """Get all news categories"""
    return db.query(NewsCategoryModel).filter(NewsCategoryModel.is_active == True).order_by(NewsCategoryModel.sort_order).all()


@router.get("/press-releases")
def get_press_releases(db: Session = Depends(get_db)):
    """Get all press releases"""
    return db.query(PressRelease).filter(
        PressRelease.is_published == True,
        PressRelease.is_active == True
    ).order_by(PressRelease.publish_date.desc()).all()


@router.get("/press-releases/{slug}")
def get_press_release_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get single press release by slug"""
    pr = db.query(PressRelease).filter(
        PressRelease.slug == slug,
        PressRelease.is_active == True
    ).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Press release not found")
    return pr


@router.post("/subscribe")
def subscribe_newsletter(
    email: str,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Subscribe to newsletter"""
    existing = db.query(NewsletterSubscriber).filter(NewsletterSubscriber.email == email).first()
    if existing:
        return {"status": "success", "message": "You are already subscribed!"}

    subscriber = NewsletterSubscriber(
        email=email,
        first_name=first_name,
        last_name=last_name
    )
    db.add(subscriber)
    db.commit()

    return {"status": "success", "message": "Thank you for subscribing to our newsletter!"}


@router.get("/")
def get_all_news(db: Session = Depends(get_db)):
    """Get all news page content"""
    return {
        "articles": db.query(NewsArticle).filter(
            NewsArticle.is_published == True,
            NewsArticle.is_active == True
        ).order_by(NewsArticle.published_at.desc()).all(),
        "featured_articles": db.query(NewsArticle).filter(
            NewsArticle.is_featured == True,
            NewsArticle.is_published == True,
            NewsArticle.is_active == True
        ).order_by(NewsArticle.published_at.desc()).all(),
        "categories": db.query(NewsCategoryModel).filter(NewsCategoryModel.is_active == True).order_by(NewsCategoryModel.sort_order).all(),
        "press_releases": db.query(PressRelease).filter(
            PressRelease.is_published == True,
            PressRelease.is_active == True
        ).order_by(PressRelease.publish_date.desc()).all(),
    }
