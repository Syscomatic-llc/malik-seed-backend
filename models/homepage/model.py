from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON
from sqlalchemy.sql import func

from models.base import Base


class HomepageHeroSlide(Base):
    """Hero carousel slides - matches Figma hero-section with video/image backgrounds"""
    __tablename__ = "homepage_hero_slides"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    subtitle = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)

    # Media
    background_image = Column(String(500), nullable=True)
    background_video = Column(String(500), nullable=True)
    mobile_image = Column(String(500), nullable=True)

    # CTA Buttons
    primary_cta_text = Column(String(100), nullable=True, default="Discover More")
    primary_cta_link = Column(String(500), nullable=True, default="/our-story")
    secondary_cta_text = Column(String(100), nullable=True)
    secondary_cta_link = Column(String(500), nullable=True)

    # Display
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<HomepageHeroSlide {self.title}>"


class HomepageAbout(Base):
    """About Malik Seeds section - matches Figma 'About Malik Seeds' section"""
    __tablename__ = "homepage_abouts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, default="About Malik Seeds")
    subtitle = Column(String(500), nullable=True)
    description = Column(Text, nullable=False)

    # Media
    image_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    video_thumbnail = Column(String(500), nullable=True)
    gallery_images = Column(JSON, default=list)

    # Stats counters
    stats = Column(JSON, default=list)

    # CTA
    cta_text = Column(String(100), nullable=True, default="Our Story")
    cta_link = Column(String(500), nullable=True, default="/our-story")

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<HomepageAbout {self.title}>"


class HomepageService(Base):
    """What We Do / Services section - matches Figma services cards"""
    __tablename__ = "homepage_services"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)
    image_url = Column(String(500), nullable=True)

    # Link to brand/service page
    link = Column(String(500), nullable=True)
    link_text = Column(String(100), nullable=True, default="Learn More")

    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<HomepageService {self.title}>"


class HomepageBrand(Base):
    """Our Brands section - matches Figma brand showcase cards"""
    __tablename__ = "homepage_brands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False)
    tagline = Column(String(300), nullable=True)
    description = Column(Text, nullable=True)
    short_description = Column(String(500), nullable=True)

    # Media
    logo_url = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)
    hover_image_url = Column(String(500), nullable=True)

    # Link
    link = Column(String(500), nullable=True)

    # Category for filtering
    category = Column(String(100), nullable=True)

    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<HomepageBrand {self.name}>"


class HomepageTestimonial(Base):
    """Voice of Impact / Testimonials - matches Figma testimonial cards with video"""
    __tablename__ = "homepage_testimonials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    designation = Column(String(200), nullable=True)
    company = Column(String(200), nullable=True)
    content = Column(Text, nullable=False)

    # Media
    avatar_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    video_thumbnail = Column(String(500), nullable=True)

    # Rating
    rating = Column(Integer, default=5)

    # Type
    testimonial_type = Column(String(50), default="farmer")

    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<HomepageTestimonial {self.name}>"


class HomepageTimeline(Base):
    """Timeline / Journey section - matches Figma timeline with years"""
    __tablename__ = "homepage_timelines"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(String(20), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    gallery_images = Column(JSON, default=list)

    # Highlight/milestone
    is_milestone = Column(Boolean, default=False)
    milestone_icon = Column(String(100), nullable=True)

    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<HomepageTimeline {self.year}: {self.title}>"


class HomepagePartner(Base):
    """Partners/Clients logos section - matches Figma partner logos row"""
    __tablename__ = "homepage_partners"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    logo_url = Column(String(500), nullable=True)
    logo_white_url = Column(String(500), nullable=True)
    website_url = Column(String(500), nullable=True)

    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<HomepagePartner {self.name}>"


class HomepageNewsItem(Base):
    """Latest News section - matches Figma news cards on homepage"""
    __tablename__ = "homepage_news_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    excerpt = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)
    category = Column(String(100), nullable=True)

    # Link to full article
    article_slug = Column(String(300), nullable=True)
    external_link = Column(String(500), nullable=True)

    # Date display
    publish_date = Column(DateTime(timezone=True), nullable=True)
    display_date = Column(String(100), nullable=True)

    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<HomepageNewsItem {self.title}>"


class HomepageCTABanner(Base):
    """CTA Banner section - matches Figma bottom CTA banners"""
    __tablename__ = "homepage_cta_banners"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    subtitle = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)

    background_image = Column(String(500), nullable=True)
    background_color = Column(String(50), nullable=True)

    cta_text = Column(String(100), nullable=True)
    cta_link = Column(String(500), nullable=True)

    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<HomepageCTABanner {self.title}>"
