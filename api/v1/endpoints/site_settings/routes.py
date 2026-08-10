from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from datetime import datetime
from xml.etree.ElementTree import Element, SubElement, tostring

from core.database import get_db
from models.site_settings.model import SiteSettings, PageSEO, Sitemap

router = APIRouter()


@router.get("/site-settings")
def get_site_settings(db: Session = Depends(get_db)):
    """Public site-wide settings."""
    settings = db.query(SiteSettings).first()
    if not settings:
        return {}
    return {
        "id": settings.id,
        "site_name": settings.site_name,
        "site_tagline": settings.site_tagline,
        "site_description": settings.site_description,
        "logo_url": settings.logo_url,
        "logo_dark_url": settings.logo_dark_url,
        "favicon_url": settings.favicon_url,
        "contact_email": settings.contact_email,
        "contact_phone": settings.contact_phone,
        "contact_address": settings.contact_address,
        "facebook_url": settings.facebook_url,
        "twitter_url": settings.twitter_url,
        "instagram_url": settings.instagram_url,
        "linkedin_url": settings.linkedin_url,
        "youtube_url": settings.youtube_url,
        "meta_title": settings.meta_title,
        "meta_description": settings.meta_description,
        "meta_keywords": settings.meta_keywords,
        "google_analytics_id": settings.google_analytics_id,
        "google_search_console_verification": settings.google_search_console_verification,
        "maintenance_mode": settings.maintenance_mode,
        "maintenance_message": settings.maintenance_message,
        "enable_careers": settings.enable_careers,
        "enable_gallery": settings.enable_gallery,
        "enable_newsletter": settings.enable_newsletter,
        "footer_text": settings.footer_text,
        "copyright_text": settings.copyright_text,
        "primary_color": settings.primary_color,
        "secondary_color": settings.secondary_color,
        "accent_color": settings.accent_color,
    }


@router.get("/page-seo/{page_path:path}")
def get_page_seo(page_path: str, db: Session = Depends(get_db)):
    """Get SEO metadata for a specific page path."""
    seo = db.query(PageSEO).filter(PageSEO.page_path == page_path, PageSEO.is_active == True).first()
    if not seo:
        raise HTTPException(status_code=404, detail="SEO metadata not found")
    return {
        "id": seo.id,
        "page_path": seo.page_path,
        "title": seo.title,
        "meta_title": seo.meta_title,
        "meta_description": seo.meta_description,
        "meta_keywords": seo.meta_keywords,
        "og_image": seo.og_image,
        "og_title": seo.og_title,
        "og_description": seo.og_description,
    }


@router.get("/sitemap.xml")
def get_sitemap_xml(db: Session = Depends(get_db)):
    """Generate XML sitemap from managed sitemap entries."""
    base_url = "https://cmsmalik.syscomatic.cloud"

    urlset = Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    entries = db.query(Sitemap).filter(Sitemap.is_active == True).order_by(Sitemap.id).all()
    for entry in entries:
        url_el = SubElement(urlset, "url")
        loc = SubElement(url_el, "loc")
        path = entry.url_path if entry.url_path.startswith("http") else f"{base_url.rstrip('/')}/{entry.url_path.lstrip('/')}"
        loc.text = path
        if entry.last_modified:
            lastmod = SubElement(url_el, "lastmod")
            lastmod.text = entry.last_modified.isoformat()
        if entry.changefreq:
            changefreq = SubElement(url_el, "changefreq")
            changefreq.text = entry.changefreq
        if entry.priority:
            priority = SubElement(url_el, "priority")
            priority.text = str(entry.priority)

    xml_bytes = tostring(urlset, encoding="utf-8", method="xml")
    return Response(content=xml_bytes, media_type="application/xml")
