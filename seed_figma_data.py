"""Seed database with Figma data for local API testing.
Run: python seed_figma_data.py
"""
import json
import os
import shutil
from pathlib import Path
from datetime import datetime

from core.database import SessionLocal, Base, engine
from models.site_settings.model import SiteSettings, MenuItem
from models.homepage.model import (
    HomepageHeroSlide, HomepageAbout, HomepageService,
    HomepageBrand, HomepageTestimonial, HomepageTimeline,
    HomepagePartner, HomepageNewsItem, HomepageCTABanner
)
from models.our_story.model import (
    OurStoryHero, OurStoryMission, OurStoryValue,
    OurStoryTimeline, OurStoryTeam, OurStoryAwards
)
from models.our_brands.model import OurBrand, FlowerPortfolio, TrainingCentre, BrandProduct
from models.our_gallery.model import GalleryItem, GalleryCategory
from models.hiring.model import JobPosition, CareerBenefit, HiringTestimonial, HiringPageContent
from models.contact.model import ContactInfo, OfficeLocation, FAQ
from models.news.model import NewsArticle, NewsCategoryModel, PressRelease


def ensure_uploads_dir():
    """Create uploads directories"""
    dirs = ['uploads/homepage', 'uploads/our_story', 'uploads/brands', 
            'uploads/gallery', 'uploads/news', 'uploads/hiring', 'uploads/team']
    for d in dirs:
        Path(d).mkdir(parents=True, exist_ok=True)


def seed_site_settings(db):
    """Seed site settings and menu"""
    # Site settings
    settings = SiteSettings(
        site_name="Malik Seeds",
        site_tagline="Helping Farmers Grow with Confidence Since 1969",
        contact_email="support@armalikseeds.com",
        contact_phone="+44 01929 739037",
        contact_address="Malik Seeds Headquarters, Bangladesh",
        primary_color="#2c5530",
        secondary_color="#4a7c59",
        accent_color="#f4a261",
        copyright_text="Copyright ©armalikseeds2026. All rights reserved.",
        footer_text="We are committed to deliver high-performance hybrid seed varieties that empower farmers with better yield, climate resilience, disease resistance, and profitability.",
        enable_careers=True,
        enable_gallery=True,
        enable_newsletter=True
    )
    db.add(settings)
    
    # Menu items
    menus = [
        MenuItem(title="Home", url="/", sort_order=1),
        MenuItem(title="About us", url="/our-story", sort_order=2),
        MenuItem(title="Our Brands", url="/our-brands", sort_order=3),
        MenuItem(title="Our Products", url="/our-products", sort_order=4),
        MenuItem(title="News", url="/news", sort_order=5),
        MenuItem(title="Contact", url="/contact", sort_order=6),
        MenuItem(title="Join us", url="/hiring", sort_order=7),
    ]
    for m in menus:
        db.add(m)
    
    db.commit()
    print("✓ Site settings seeded")


def seed_homepage(db):
    """Seed homepage data from Figma"""
    # Hero slide
    hero = HomepageHeroSlide(
        title="Helping Farmers Grow with Confidence",
        subtitle="Since 1969",
        description="Malik Seeds is the pioneer of hybrid vegetable seeds in Bangladesh. We introduce international seed varieties to Bangladeshi farmers.",
        primary_cta_text="Our Products",
        primary_cta_link="/our-brands",
        secondary_cta_text="Learn More",
        secondary_cta_link="/our-story",
        background_image="uploads/homepage/hero_bg.jpg",
        sort_order=1,
        is_active=True
    )
    db.add(hero)
    
    # About section
    about = HomepageAbout(
        title="About Malik Seeds",
        description="Malik Seeds is the pioneer of hybrid vegetable seeds in Bangladesh. We introduce international seed varieties to Bangladeshi farmers. Our history goes back to 1969 when our founder, A. R. Malik launched 'Atlas-70' Cabbage from Sakata Seed Corporation, based in Japan. Today, we are among the most trusted seed companies in Bangladesh.",
        image_url="uploads/homepage/about_image.jpg",
        stats=json.dumps([
            {"value": "10k+", "label": "Seed Varieties Trialed"},
            {"value": "200", "label": "Ton Seeds Distributed"},
            {"value": "100+", "label": "Distributor Network"},
            {"value": "13+", "label": "Agri-Innovation Projects"},
            {"value": "5+", "label": "Decades Farming Legacy"}
        ]),
        cta_text="Learn More",
        cta_link="/our-story",
        is_active=True
    )
    db.add(about)
    
    # Services / Brands showcase
    services = [
        HomepageService(title="Vegetable Seeds", description="High-quality hybrid vegetable seeds for Bangladeshi farmers", icon="leaf", image_url="uploads/homepage/veg_seeds.jpg", link="/our-brands/vegetable-seeds", sort_order=1),
        HomepageService(title="Potato Seeds", description="Premium potato seed varieties with high yield potential", icon="potato", image_url="uploads/homepage/potato_seeds.jpg", link="/our-brands/potato-seeds", sort_order=2),
        HomepageService(title="Malik's Farm", description="International-standard R&D Farm for next generation seed varieties", icon="farm", image_url="uploads/homepage/malik_farm.jpg", link="/our-brands/malik-farm", sort_order=3),
        HomepageService(title="Origene by Malik", description="Advanced genetic research and seed innovation", icon="dna", image_url="uploads/homepage/origene.jpg", link="/our-brands/origene", sort_order=4),
        HomepageService(title="Malik's Flower", description="Beautiful flower seed varieties for commercial growers", icon="flower", image_url="uploads/homepage/flower.jpg", link="/our-brands/flower", sort_order=5),
        HomepageService(title="Innovation & Development", description="Cutting-edge agricultural research and development", icon="flask", image_url="uploads/homepage/innovation.jpg", link="/our-brands/innovation", sort_order=6),
    ]
    for s in services:
        db.add(s)
    
    # Timeline items
    timeline_items = [
        HomepageTimeline(year="1962", title="A Vision Begins", description="A.R. Malik joined the East Pakistan Agriculture Development Corporation (EPADC), in charge of 5 out of 17 districts.", is_milestone=True, sort_order=1),
        HomepageTimeline(year="Late 1960s", title="The Realization", description="During field tours across the 5 districts, he witnesses the struggles of farmers with the lack of access to quality seeds.", sort_order=2),
        HomepageTimeline(year="1969", title="Malik Seeds is Founded", description="A.R. Malik left his prestigious job to start a risky business. Malik Seeds is born, the first private seed company in Bangladesh.", is_milestone=True, sort_order=3),
        HomepageTimeline(year="1970s-1980s", title="Building Trust", description="A.R. Malik travels extensively, introducing superior hybrid seed varieties like Atlas-70 Cabbage, Top-Yield Watermelon and Diamant Potato.", sort_order=4),
        HomepageTimeline(year="1993", title="National Seed Policy", description="The government approved this policy, allowing private companies to import seeds directly, register their own varieties, and conduct independent research.", is_milestone=True, sort_order=5),
        HomepageTimeline(year="1994", title="Industry Takes Shape", description="With the new policy in place, the seed industry matures and A.R. Malik fully transitions to his own independent venture.", sort_order=6),
        HomepageTimeline(year="1997", title="Next-Generation Leadership", description="Ataus Sopan Malik joins Malik Seeds to look after Sales and Marketing across the entire country.", sort_order=7),
        HomepageTimeline(year="2010", title="Establishment of Malik's Farm", description="We established an international-standard R&D Farm. The focus is to do research & introduce next generation seed varieties.", is_milestone=True, sort_order=8),
        HomepageTimeline(year="2019", title="50 Years of Feeding Bangladesh", description="Malik Seeds reflects on five decades of Farmer Empowerment, Honest Business Practices, and Seed Technology Innovation.", sort_order=9),
        HomepageTimeline(year="Today", title="Stronger Than Ever", description="Today, A.R. Malik's mission lives on through the 200+ talented team members, innovating in the agriculture industry with people and technology.", is_milestone=True, sort_order=10),
    ]
    for t in timeline_items:
        db.add(t)
    
    # Testimonials
    testimonials = [
        HomepageTestimonial(
            name="Md. Rafiqul Islam Rafiq",
            designation="Farmer",
            company="Nabagram, Baldhara, Singair",
            content="22 years abroad, then back to the soil. He learned about companion cropping from our FB page and now farms multiple varieties successfully.",
            testimonial_type="farmer",
            sort_order=1
        ),
        HomepageTestimonial(
            name="Md. Kobbat Hossain Ovi",
            designation="Farmer",
            company="Maitka, Hemayetpur, Savar",
            content="After losing his father in 2003, he carried my family through farming and Malik Seeds has been with him all the way. Green Crown variety has a special place in his broccoli project.",
            testimonial_type="farmer",
            sort_order=2
        ),
        HomepageTestimonial(
            name="Md. Jangir Alam",
            designation="Farmer",
            company="Brahmankanda",
            content="Became talk of the town after harvesting PurpleBeauty in only 60 days, and within 120 days, total production reached 4.5 tons.",
            testimonial_type="farmer",
            sort_order=3
        ),
        HomepageTestimonial(
            name="Md. Saiful Islam",
            designation="Farmer",
            company="Sakrail, Garpara, Sadar, Manikganj",
            content="Ex-electrician turned farmer. In 2021, I bet 1.3 lakh on Malik Seeds' Ice Green cucumber and walked away with 3.0 lakh revenue.",
            testimonial_type="farmer",
            sort_order=4
        ),
    ]
    for t in testimonials:
        db.add(t)
    
    # News items
    news_items = [
        HomepageNewsItem(
            title="Strengthening Climate-Resilient Farming Through Hybrid Innovation",
            excerpt="Insights from agricultural research & field experts on climate-resilient farming practices.",
            category="Climate",
            display_date="SEP 12, 2024",
            image_url="uploads/news/news_1.jpg",
            sort_order=1
        ),
        HomepageNewsItem(
            title="Introducing High-Yield Pumpkin Variety for Commercial Growers",
            excerpt="New pumpkin variety designed specifically for commercial farming operations.",
            category="Commercial Growers",
            display_date="JUN 18, 2024",
            image_url="uploads/news/news_2.jpg",
            sort_order=2
        ),
        HomepageNewsItem(
            title="Expanding Farmer Training Programs Across Northern Regions",
            excerpt="Malik Seeds expands its training programs to reach more farmers in northern Bangladesh.",
            category="Training Programs",
            display_date="AUG 03, 2024",
            image_url="uploads/news/news_3.jpg",
            sort_order=3
        ),
    ]
    for n in news_items:
        db.add(n)
    
    # CTA Banner
    cta = HomepageCTABanner(
        title="Join our Team",
        subtitle="Shape the Future of Agriculture with Malik Seeds",
        cta_text="Join Today",
        cta_link="/hiring",
        background_image="uploads/homepage/cta_bg.jpg",
        sort_order=1
    )
    db.add(cta)
    
    db.commit()
    print("✓ Homepage data seeded")


def seed_our_story(db):
    """Seed Our Story page data"""
    # Hero
    hero = OurStoryHero(
        title="Our Story",
        subtitle="Cultivating the Future of Agriculture in Bangladesh",
        background_image="uploads/our_story/hero.jpg",
        is_active=True
    )
    db.add(hero)
    
    # Mission
    mission = OurStoryMission(
        title="OUR MISSION",
        description="Helping farmers grow with confidence, by providing the highest quality seeds, research backed knowledge and hands on support, season after season.",
        image_url="uploads/our_story/mission.jpg",
        is_active=True
    )
    db.add(mission)
    
    # Vision
    vision = OurStoryMission(
        title="OUR VISION",
        description="To lead a new era of agriculture in Bangladesh where innovation serves every farmer, and trust grows with every harvest.",
        image_url="uploads/our_story/vision.jpg",
        is_active=True
    )
    db.add(vision)
    
    # Values
    values = [
        OurStoryValue(title="Farmer First", description="Everything we do starts with the farmer in mind. Their success is our success.", icon="heart", sort_order=1),
        OurStoryValue(title="Innovation", description="Continuously pushing boundaries in seed technology and agricultural practices.", icon="lightbulb", sort_order=2),
        OurStoryValue(title="Uncompromising Quality", description="We never compromise on the quality of our seeds. Every batch is tested rigorously.", icon="shield", sort_order=3),
        OurStoryValue(title="Research Backed", description="Our products are backed by decades of research and field testing.", icon="microscope", sort_order=4),
    ]
    for v in values:
        db.add(v)
    
    # Timeline
    timeline_items = [
        OurStoryTimeline(year="1962", title="A Vision Begins", description="A.R. Malik joined the East Pakistan Agriculture Development Corporation (EPADC), in charge of 5 out of 17 districts.", is_milestone=True, sort_order=1),
        OurStoryTimeline(year="Late 1960s", title="The Realization", description="During field tours across the 5 districts, he witnesses the struggles of farmers with the lack of access to quality seeds.", sort_order=2),
        OurStoryTimeline(year="1969", title="Malik Seeds is Founded", description="A.R. Malik left his prestigious job to start a risky business. Malik Seeds is born, the first private seed company in Bangladesh.", is_milestone=True, sort_order=3),
        OurStoryTimeline(year="1970s-1980s", title="Building Trust", description="A.R. Malik travels extensively, introducing superior hybrid seed varieties like Atlas-70 Cabbage, and Diamant Potato.", sort_order=4),
        OurStoryTimeline(year="1993", title="National Seed Policy", description="In 1993, The government approved this policy, allowing private companies to import seeds directly, register their own varieties, and conduct independent research.", is_milestone=True, sort_order=5),
        OurStoryTimeline(year="1994", title="Industry Takes Shape", description="With the new policy in place, the seed industry matures and A.R. Malik fully transitions to his own independent venture.", sort_order=6),
        OurStoryTimeline(year="1997", title="Next-Generation Leadership", description="Ataus Sopan Malik joins Malik Seeds to look after Sales and Marketing across the entire country.", sort_order=7),
        OurStoryTimeline(year="Late 1990s-Early 2000s", title="Industry Innovation", description="Malik Seeds introduces innovations, like using aluminum foil packaging to preserve germination rates and using a distributorship model for delivering our seeds to farmers.", sort_order=8),
        OurStoryTimeline(year="2010", title="Establishment of Malik's Farm", description="We established an international-standard R&D Farm. The focus is to do research & introduce next generation seed varieties.", is_milestone=True, sort_order=9),
        OurStoryTimeline(year="2019", title="50 Years of Feeding Bangladesh", description="Malik Seeds reflects on five decades of: Farmer Empowerment, Honest Business Practices, Seed Technology Innovation.", sort_order=10),
        OurStoryTimeline(year="Today", title="Stronger Than Ever", description="Today, A.R. Malik's mission lives on through the 200+ talented team members, innovating in the agriculture industry with people and technology.", is_milestone=True, sort_order=11),
    ]
    for t in timeline_items:
        db.add(t)
    
    db.commit()
    print("✓ Our Story data seeded")


def seed_our_brands(db):
    """Seed Our Brands data"""
    brands = [
        OurBrand(
            name="Vegetable Seeds",
            slug="vegetable-seeds",
            category="vegetable_seeds",
            tagline="High-quality hybrid vegetable seeds",
            description="Premium vegetable seeds for Bangladeshi farmers with high yield and disease resistance.",
            logo_url="uploads/brands/veg_logo.jpg",
            image_url="uploads/brands/veg_banner.jpg",
            is_featured=True,
            sort_order=1
        ),
        OurBrand(
            name="Potato Seeds",
            slug="potato-seeds",
            category="potato_seeds",
            tagline="Premium potato seed varieties",
            description="High-quality potato seeds with excellent germination and yield potential.",
            logo_url="uploads/brands/potato_logo.jpg",
            image_url="uploads/brands/potato_banner.jpg",
            is_featured=True,
            sort_order=2
        ),
        OurBrand(
            name="Malik's Farm",
            slug="malik-farm",
            category="malik_farms",
            tagline="International-standard R&D Farm",
            description="Research and development farm focused on next generation seed varieties.",
            logo_url="uploads/brands/farm_logo.jpg",
            image_url="uploads/brands/farm_banner.jpg",
            is_featured=True,
            sort_order=3
        ),
        OurBrand(
            name="Origene by Malik",
            slug="origene",
            category="innovation",
            tagline="Advanced genetic research",
            description="Cutting-edge genetic research and seed innovation for the future of agriculture.",
            logo_url="uploads/brands/origene_logo.jpg",
            image_url="uploads/brands/origene_banner.jpg",
            is_featured=True,
            sort_order=4
        ),
        OurBrand(
            name="Malik's Flower",
            slug="malik-flower",
            category="flower",
            tagline="Beautiful flower seed varieties",
            description="Stunning flower seeds for commercial growers and gardening enthusiasts.",
            logo_url="uploads/brands/flower_logo.jpg",
            image_url="uploads/brands/flower_banner.jpg",
            is_featured=True,
            sort_order=5
        ),
        OurBrand(
            name="Innovation & Development",
            slug="innovation",
            category="innovation",
            tagline="Pushing agricultural boundaries",
            description="Research division focused on developing climate-resilient and high-yield seed varieties.",
            logo_url="uploads/brands/innovation_logo.jpg",
            image_url="uploads/brands/innovation_banner.jpg",
            sort_order=6
        ),
    ]
    for b in brands:
        db.add(b)
    
    db.commit()
    print("✓ Our Brands data seeded")


def seed_gallery(db):
    """Seed Gallery data"""
    categories = [
        GalleryCategory(name="Field Activities", slug="field-activities", description="Photos from our field activities and farmer interactions"),
        GalleryCategory(name="Research & Development", slug="research-development", description="R&D farm and laboratory activities"),
        GalleryCategory(name="Training Programs", slug="training-programs", description="Farmer training and workshops"),
        GalleryCategory(name="Product Showcase", slug="product-showcase", description="Our seed products and varieties"),
        GalleryCategory(name="Company Events", slug="company-events", description="Company events and celebrations"),
    ]
    for c in categories:
        db.add(c)
    
    db.commit()
    
    # Gallery items
    items = [
        GalleryItem(title="Field Visit 2024", description="Farmers learning about new seed varieties", image_url="uploads/gallery/field1.jpg", category="field-activities", sort_order=1),
        GalleryItem(title="R&D Laboratory", description="Our scientists working on seed research", image_url="uploads/gallery/lab1.jpg", category="research-development", sort_order=1),
        GalleryItem(title="Training Workshop", description="Farmers attending training on modern techniques", image_url="uploads/gallery/training1.jpg", category="training-programs", sort_order=1),
        GalleryItem(title="New Cabbage Variety", description="Atlas-70 Cabbage in full growth", image_url="uploads/gallery/cabbage1.jpg", category="product-showcase", sort_order=1),
        GalleryItem(title="Company Anniversary", description="Celebrating 50 years of excellence", image_url="uploads/gallery/anniversary.jpg", category="company-events", sort_order=1),
    ]
    for item in items:
        db.add(item)
    
    db.commit()
    print("✓ Gallery data seeded")


def seed_hiring(db):
    """Seed Hiring/Careers data"""
    # Page content
    page = HiringPageContent(
        hero_title="Join Our Team",
        hero_subtitle="Shape the Future of Agriculture with Malik Seeds",
        hero_description="Be part of a company that's transforming agriculture in Bangladesh through innovation and dedication.",
        cta_title="It's Your Turn",
        cta_description="Ready to make an impact? Join our team of passionate agricultural professionals.",
        cta_button_text="View Open Positions",
        cta_button_link="/hiring/positions"
    )
    db.add(page)
    
    # Benefits
    benefits = [
        CareerBenefit(title="Competitive Salary", description="Industry-leading compensation packages", icon="money", sort_order=1),
        CareerBenefit(title="Health Insurance", description="Comprehensive health coverage for you and your family", icon="heart", sort_order=2),
        CareerBenefit(title="Professional Growth", description="Continuous learning and development opportunities", icon="chart", sort_order=3),
        CareerBenefit(title="Work-Life Balance", description="Flexible working arrangements and paid time off", icon="balance", sort_order=4),
        CareerBenefit(title="Team Environment", description="Collaborative and supportive work culture", icon="users", sort_order=5),
    ]
    for b in benefits:
        db.add(b)
    
    # Testimonials
    testimonials = [
        HiringTestimonial(name="A.R. Malik", designation="Founder", department="Leadership", content="Building Malik Seeds from the ground up has been the most rewarding journey of my life. Our team is like family.", years_at_company=50),
        HiringTestimonial(name="Ataus Sopan Malik", designation="Director of Sales & Marketing", department="Sales", content="Joining Malik Seeds allowed me to contribute to something bigger than myself - feeding the nation.", years_at_company=25),
    ]
    for t in testimonials:
        db.add(t)
    
    # Job positions
    positions = [
        JobPosition(
            title="Agricultural Research Scientist",
            slug="agricultural-research-scientist",
            department="research",
            job_type="full_time",
            location="dhaka",
            description="Lead research initiatives for developing new hybrid seed varieties.",
            short_description="Research and develop new seed varieties",
            requirements=["PhD in Plant Breeding or related field", "5+ years experience in seed research"],
            responsibilities=["Develop new hybrid varieties", "Conduct field trials", "Analyze research data"],
            skills_required=["Plant breeding", "Genetics", "Data analysis"],
            experience_required="5+ years",
            is_active=True
        ),
        JobPosition(
            title="Sales Executive",
            slug="sales-executive",
            department="sales",
            job_type="full_time",
            location="dhaka",
            description="Drive sales of our seed products across Bangladesh.",
            short_description="Sell seed products to farmers and distributors",
            requirements=["Bachelor's degree", "2+ years sales experience"],
            responsibilities=["Meet sales targets", "Build distributor relationships", "Conduct product demonstrations"],
            skills_required=["Sales", "Communication", "Negotiation"],
            experience_required="2+ years",
            is_active=True
        ),
        JobPosition(
            title="Field Officer",
            slug="field-officer",
            department="field",
            job_type="full_time",
            location="rajshahi",
            description="Work directly with farmers to provide technical support and training.",
            short_description="Support farmers in the field",
            requirements=["Diploma in Agriculture", "Willingness to travel"],
            responsibilities=["Visit farmers", "Provide technical advice", "Collect field data"],
            skills_required=["Agricultural knowledge", "Communication", "Problem solving"],
            experience_required="1+ years",
            is_active=True
        ),
    ]
    for p in positions:
        db.add(p)
    
    db.commit()
    print("✓ Hiring data seeded")


def seed_contact(db):
    """Seed Contact page data"""
    info = ContactInfo(
        title="Contact Us",
        description="Get in touch with us for any inquiries about our products, services, or partnerships.",
        address="Malik Seeds Headquarters, Dhaka, Bangladesh",
        city="Dhaka",
        country="Bangladesh",
        phone_primary="+44 01929 739037",
        email_primary="support@armalikseeds.com",
        business_hours=json.dumps([
            {"day": "Sunday - Thursday", "hours": "9:00 AM - 6:00 PM"},
            {"day": "Friday - Saturday", "hours": "Closed"}
        ]),
        facebook_url="https://facebook.com/malikseeds",
        instagram_url="https://instagram.com/malikseeds"
    )
    db.add(info)
    
    # Office locations
    locations = [
        OfficeLocation(name="Head Office", address="Malik Seeds Headquarters, Dhaka", city="Dhaka", country="Bangladesh", is_headquarters=True, sort_order=1),
        OfficeLocation(name="Regional Office - Rajshahi", address="Rajshahi Division Office", city="Rajshahi", country="Bangladesh", sort_order=2),
        OfficeLocation(name="Regional Office - Khulna", address="Khulna Division Office", city="Khulna", country="Bangladesh", sort_order=3),
    ]
    for loc in locations:
        db.add(loc)
    
    # FAQs
    faqs = [
        FAQ(question="How can I purchase Malik Seeds products?", answer="You can purchase our products through our authorized distributors across Bangladesh or contact our sales team directly.", category="General", sort_order=1),
        FAQ(question="Do you offer training for farmers?", answer="Yes, we regularly conduct farmer training programs. Check our News section for upcoming training schedules.", category="Training", sort_order=2),
        FAQ(question="How can I become a distributor?", answer="Contact our sales team with your business details. We evaluate distributor applications based on region and capacity.", category="Business", sort_order=3),
    ]
    for f in faqs:
        db.add(f)
    
    db.commit()
    print("✓ Contact data seeded")


def seed_news(db):
    """Seed News data"""
    # Categories
    categories = [
        NewsCategoryModel(name="Climate", slug="climate", description="Climate and agriculture news"),
        NewsCategoryModel(name="Commercial Growers", slug="commercial-growers", description="News for commercial farming"),
        NewsCategoryModel(name="Training Programs", slug="training-programs", description="Training and education updates"),
        NewsCategoryModel(name="Company", slug="company", description="Company news and updates"),
    ]
    for c in categories:
        db.add(c)
    
    db.commit()
    
    # Articles
    articles = [
        NewsArticle(
            title="Strengthening Climate-Resilient Farming Through Hybrid Innovation",
            slug="climate-resilient-farming-hybrid-innovation",
            excerpt="How Malik Seeds is developing climate-resilient seed varieties to help farmers adapt to changing weather patterns.",
            content="Malik Seeds has been at the forefront of developing hybrid seed varieties that can withstand extreme weather conditions...",
            featured_image="uploads/news/news_1.jpg",
            category="company",
            author_name="Research Team",
            is_published=True,
            published_at=datetime(2024, 9, 12)
        ),
        NewsArticle(
            title="Introducing High-Yield Pumpkin Variety for Commercial Growers",
            slug="high-yield-pumpkin-commercial",
            excerpt="New pumpkin variety designed specifically for commercial farming operations with 30% higher yield.",
            content="We are excited to announce the launch of our new high-yield pumpkin variety...",
            featured_image="uploads/news/news_2.jpg",
            category="company",
            author_name="Product Team",
            is_published=True,
            published_at=datetime(2024, 6, 18)
        ),
        NewsArticle(
            title="Expanding Farmer Training Programs Across Northern Regions",
            slug="farmer-training-northern-regions",
            excerpt="Malik Seeds expands its training programs to reach more farmers in northern Bangladesh.",
            content="Our farmer training programs have been expanded to cover all northern districts...",
            featured_image="uploads/news/news_3.jpg",
            category="company",
            author_name="Training Team",
            is_published=True,
            published_at=datetime(2024, 8, 3)
        ),
    ]
    for a in articles:
        db.add(a)
    
    db.commit()
    print("✓ News data seeded")


def main():
    """Main seed function"""
    print("=" * 50)
    print("SEEDING MALIK SEEDS CMS WITH FIGMA DATA")
    print("=" * 50)
    
    # Ensure upload directories exist
    ensure_uploads_dir()
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created")
    
    db = SessionLocal()
    try:
        # Check if already seeded
        existing = db.query(SiteSettings).first()
        if existing:
            print("\\nDatabase already seeded. Skipping...")
            print("To re-seed, delete the database file and run again.")
            return
        
        seed_site_settings(db)
        seed_homepage(db)
        seed_our_story(db)
        seed_our_brands(db)
        seed_gallery(db)
        seed_hiring(db)
        seed_contact(db)
        seed_news(db)
        
        print("\\n" + "=" * 50)
        print("SEEDING COMPLETE!")
        print("=" * 50)
        print("\\nYou can now test the API at:")
        print("  - http://localhost:8000/docs")
        print("  - http://localhost:8000/api/v1/homepage")
        print("  - http://localhost:8000/api/v1/our-story")
        print("  - http://localhost:8000/api/v1/our-brands")
        print("  - http://localhost:8000/api/v1/our-gallery")
        print("  - http://localhost:8000/api/v1/hiring")
        print("  - http://localhost:8000/api/v1/contact")
        print("  - http://localhost:8000/api/v1/news")
        
    except Exception as e:
        print(f"\\nError during seeding: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    main()
