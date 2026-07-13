from sqlalchemy import Column, Integer, String, DateTime, JSON, Text
from sqlalchemy.sql import func

from models.base import Base


class ActivityLog(Base):
    """Audit log of admin/CMS actions"""
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    user_email = Column(String(255), nullable=True)
    action = Column(String(50), nullable=False)  # create, update, delete, login
    resource_type = Column(String(100), nullable=True)  # e.g. homepage-hero, news-article
    resource_id = Column(Integer, nullable=True)
    resource_name = Column(String(300), nullable=True)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
