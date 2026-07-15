from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON
from sqlalchemy.sql import func

from models.base import Base


class ContactInfo(Base):
    """Contact information - admin can manage"""
    __tablename__ = "contact_infos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, default="Contact Us")
    subtitle = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    footer_description = Column(Text, nullable=True)

    # Address
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    postal_code = Column(String(50), nullable=True)

    # Contact details
    phone_primary = Column(String(50), nullable=True)
    phone_secondary = Column(String(50), nullable=True)
    email_primary = Column(String(255), nullable=True)
    email_secondary = Column(String(255), nullable=True)

    # Business hours
    business_hours = Column(JSON, default=list)

    # Map
    map_embed_url = Column(String(1000), nullable=True)
    map_image_url = Column(String(500), nullable=True)

    # Social links
    facebook_url = Column(String(500), nullable=True)
    twitter_url = Column(String(500), nullable=True)
    instagram_url = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    youtube_url = Column(String(500), nullable=True)

    # Contact form subject dropdown options
    subject_options = Column(JSON, default=list)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<ContactInfo {self.title}>"


class ContactMessage(Base):
    """Contact form submissions"""
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    subject = Column(String(200), nullable=True)
    message = Column(Text, nullable=False)

    # Inquiry type
    inquiry_type = Column(String(100), nullable=True)

    # Status
    is_read = Column(Boolean, default=False)
    is_replied = Column(Boolean, default=False)
    reply_message = Column(Text, nullable=True)
    replied_at = Column(DateTime(timezone=True), nullable=True)
    replied_by = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<ContactMessage {self.name}>"


class OfficeLocation(Base):
    """Office locations - admin can manage"""
    __tablename__ = "office_locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    address = Column(String(500), nullable=False)
    city = Column(String(100), nullable=False)
    country = Column(String(100), nullable=True)
    postal_code = Column(String(50), nullable=True)

    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)

    map_url = Column(String(1000), nullable=True)
    image_url = Column(String(500), nullable=True)

    is_headquarters = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<OfficeLocation {self.name}>"


class FAQ(Base):
    """FAQs - admin can manage"""
    __tablename__ = "faqs"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String(500), nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)

    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    view_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<FAQ {self.question[:50]}...>"
