from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON
from sqlalchemy.sql import func

from models.base import Base


class OurStoryHero(Base):
    """Our Story hero - admin can manage"""
    __tablename__ = "our_story_heroes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    subtitle = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    background_image = Column(String(500), nullable=True)
    background_images = Column(JSON, default=list)
    background_video = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<OurStoryHero {self.title}>"


class OurStoryMission(Base):
    """Our Mission section - admin can manage"""
    __tablename__ = "our_story_missions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, default="OUR MISSION")
    description = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=True)
    icon = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<OurStoryMission {self.title}>"


class OurStoryValue(Base):
    """Our Values section - admin can manage"""
    __tablename__ = "our_story_values"

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
        return f"<OurStoryValue {self.title}>"


class OurStoryTimeline(Base):
    """Timeline/Journey section - admin can manage"""
    __tablename__ = "our_story_timelines"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    is_milestone = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<OurStoryTimeline {self.year}: {self.title}>"


class OurStoryTeam(Base):
    """Team/Leadership section - admin can manage"""
    __tablename__ = "our_story_teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    designation = Column(String(200), nullable=False)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    department = Column(String(100), nullable=True)
    is_leadership = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<OurStoryTeam {self.name}>"


class OurStoryAwards(Base):
    """Awards & Recognition section - admin can manage"""
    __tablename__ = "our_story_awards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    year = Column(String(20), nullable=True)
    image_url = Column(String(500), nullable=True)
    organization = Column(String(200), nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<OurStoryAwards {self.title}>"
