"""Seed initial Our Brands pages.

Run:
    python seed_brands.py

Creates the 7 brand pages matching the Figma structure:
- Our Brands - Features
- Our Brands - Planted by Malik
- Our Brands - Malik's Flower
- Our Brands - Malik Farms
- Our Brands - Innovation & Development
- Our Brands - Potato Seeds
- Our Brands - Vegetable Seeds

Images are left empty so the admin can upload them through the CMS.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from core.database import SessionLocal, engine
from models.our_brands.model import OurBrand, BrandCategory
from models.base import Base


BRAND_DEFAULTS = {
    "vegetable_seeds": {
        "name": "Vegetable Seeds",
        "slug": "vegetable-seeds",
        "tagline": "Bangladesh's trusted vegetable seed portfolio",
        "description": "A carefully curated range of high-value vegetable crops selected for what performs in Bangladesh's fields.",
        "content": {
            "hero": {"title": "VEGETABLE SEEDS", "subtitle": "", "background_image": "", "scroll_text": "Scroll to explore"},
            "intro": {
                "heading": "Seeds built for",
                "heading_highlight": "Bangladesh's farmers.",
                "description": "For over half a century, we've worked alongside farmers to bring better seeds to Bangladesh's fields—higher yields, stronger resistance, and varieties proven in local conditions.",
                "tags": ["Climate Resilient", "Disease Resistant", "High Yielding"]
            },
            "farmers": {
                "badge": "WITH OUR FARMERS",
                "heading": "Built for the farmers who grow them",
                "description": "Every variety we release is tested, proven, and trusted by the farmers who plant it.",
                "images": []
            },
            "qualities": {
                "badge": "WHAT WE BREED FOR",
                "heading": "Three qualities. Every variety.",
                "description": "Our portfolio is selected for three qualities that matter most to Bangladesh's farmers.",
                "cards": [
                    {"number": 1, "title": "Climate Resilient", "description": "Our varieties are selected and tested across Bangladesh's diverse agro-climatic zones from summer heat to monsoon conditions."},
                    {"number": 2, "title": "Disease Resistant", "description": "Our seed portfolio prioritises varieties with strong natural resistance to the most common and damaging diseases in Bangladesh."},
                    {"number": 3, "title": "High Yielding", "description": "Our varieties produce more fruits per plant, more harvests per season. Every hybrid is trialled specifically for superior yield output."}
                ]
            },
            "portfolio": {
                "badge": "SEED PORTFOLIO",
                "heading": "Bangladesh's Trusted Vegetable Seed Portfolio",
                "description": "A carefully curated range of high-value vegetable crops selected for what performs in Bangladesh's fields.",
                "tags": ["CAULIFLOWER", "CABBAGE", "KOHLRABI", "BROCCOLI", "BEET ROOT", "TOMATO", "CHILLI", "BRINJAL", "CUCUMBER", "GOURDS", "PUMPKIN", "RADISH", "CARROT", "OKRA", "YARD LONG BEAN", "CAPSICUM", "PAPAYA", "WATERMELON", "AND MORE..."]
            },
            "heritage": {
                "badge": "OUR HERITAGE",
                "heading": "Over half a century in the field",
                "description": "",
                "images": [],
                "youtube_url": ""
            }
        }
    },
    "potato_seeds": {
        "name": "Potato Seeds",
        "slug": "potato-seeds",
        "tagline": "Certified potato seed for better harvests",
        "description": "High-quality, disease-free potato seeds developed for Bangladesh's growing conditions.",
        "content": {
            "hero": {"title": "POTATO SEEDS", "subtitle": "", "background_image": "", "scroll_text": "Scroll to explore"},
            "intro": {
                "heading": "Built for",
                "heading_highlight": "Bangladesh's soil.",
                "description": "Our certified potato seeds deliver consistent germination, strong plant vigour, and higher marketable yields across the country's major potato-growing regions.",
                "tags": ["Certified", "Disease Free", "High Yielding"]
            },
            "farmers": {
                "badge": "WITH OUR FARMERS",
                "heading": "Trusted by potato growers nationwide",
                "description": "From Rangpur to Munshiganj, our potato seeds are grown and trusted by farmers who demand reliability and performance.",
                "images": []
            },
            "qualities": {
                "badge": "WHAT WE BREED FOR",
                "heading": "Quality starts with the seed.",
                "description": "Every lot is monitored for purity, vigour, and freedom from seed-borne diseases.",
                "cards": [
                    {"number": 1, "title": "Certified Quality", "description": "Our seed production follows strict certification standards to ensure farmers receive genetically pure and healthy potato seed."},
                    {"number": 2, "title": "Disease Management", "description": "We implement integrated disease control from tissue culture to field multiplication, minimising viral and bacterial threats."},
                    {"number": 3, "title": "Yield Performance", "description": "Varieties are selected for uniform tuber size, drought tolerance, and superior productivity under Bangladeshi conditions."}
                ]
            },
            "portfolio": {
                "badge": "VARIETIES",
                "heading": "Our Potato Seed Portfolio",
                "description": "A focused selection of varieties suited for table, processing, and export markets.",
                "tags": ["CARDINAL", "DIAMANT", "GRANOLA", "COURAGE", "LADY ROSSETTA", "ASTA", "AND MORE..."]
            },
            "heritage": {
                "badge": "OUR HERITAGE",
                "heading": "Decades of potato expertise",
                "description": "",
                "images": [],
                "youtube_url": ""
            }
        }
    },
    "flower": {
        "name": "Malik's Flower",
        "slug": "maliks-flower",
        "tagline": "Vibrant flowers for every season",
        "description": "A wide range of flower seeds and seedlings that bring colour and confidence to growers and gardeners.",
        "content": {
            "hero": {"title": "MALIK'S FLOWER", "subtitle": "", "background_image": "", "scroll_text": "Scroll to explore"},
            "intro": {
                "heading": "Blooms built for",
                "heading_highlight": "Bangladesh.",
                "description": "From nurseries to home gardens, our flower portfolio offers vigorous varieties with bright colours, long vase life, and strong performance in local climates.",
                "tags": ["Vibrant Colours", "Long Vase Life", "Climate Adapted"]
            },
            "farmers": {
                "badge": "WITH OUR GROWERS",
                "heading": "Grown with pride",
                "description": "Our flowers are cultivated by commercial growers and home gardeners who value quality, uniformity, and reliable germination.",
                "images": []
            },
            "qualities": {
                "badge": "WHAT WE BREED FOR",
                "heading": "Beauty that lasts.",
                "description": "We select varieties for colour, form, and resilience so every bloom makes an impact.",
                "cards": [
                    {"number": 1, "title": "Vibrant Colours", "description": "Our breeding and trialling focus on intense, stable colours that stand out in gardens, bouquets, and market stalls."},
                    {"number": 2, "title": "Long Vase Life", "description": "Cut-flower varieties are chosen for strong stems and extended post-harvest life, helping growers command better prices."},
                    {"number": 3, "title": "Climate Adapted", "description": "Each variety is tested under Bangladesh's heat, humidity, and seasonal rainfall to ensure reliable performance."}
                ]
            },
            "portfolio": {
                "badge": "FLOWER PORTFOLIO",
                "heading": "Malik's Flower Portfolio",
                "description": "Seeds and seedlings for every season and setting.",
                "tags": ["MARIGOLD", "ROSE", "GERBERA", "CHRYSANTHEMUM", "COSMOS", "ZINNIA", "PETUNIA", "DAHLIA", "AND MORE..."]
            },
            "heritage": {
                "badge": "OUR HERITAGE",
                "heading": "Bringing colour to Bangladesh",
                "description": "",
                "images": [],
                "youtube_url": ""
            }
        }
    },
    "malik_farms": {
        "name": "Malik Farms",
        "slug": "malik-farms",
        "tagline": "Sustainable farming from the ground up",
        "description": "Our own production farms demonstrate best practices in seed multiplication and crop management.",
        "content": {
            "hero": {"title": "MALIK FARMS", "subtitle": "", "background_image": "", "scroll_text": "Scroll to explore"},
            "intro": {
                "heading": "Farming the",
                "heading_highlight": "Malik way.",
                "description": "Malik Farms serve as living laboratories where we refine agronomic practices, test new varieties, and produce high-quality seed stock under controlled conditions.",
                "tags": ["Sustainable", "Quality Assured", "Farmer Focused"]
            },
            "farmers": {
                "badge": "WITH OUR TEAM",
                "heading": "Run by experienced hands",
                "description": "Our farm teams combine decades of local experience with modern techniques to produce seed that performs.",
                "images": []
            },
            "qualities": {
                "badge": "WHAT WE PRACTICE",
                "heading": "Farm practices that raise the bar.",
                "description": "Every Malik Farm follows integrated crop management protocols designed for quality and sustainability.",
                "cards": [
                    {"number": 1, "title": "Sustainable Methods", "description": "We use water-efficient irrigation, balanced nutrition, and integrated pest management to protect the environment and the crop."},
                    {"number": 2, "title": "Quality Assured", "description": "Seed plots are isolated, inspected, and rogued at every stage to maintain genetic purity and seed health."},
                    {"number": 3, "title": "Farmer Focused", "description": "Lessons learned on Malik Farms are shared with partner growers through training and on-farm demonstrations."}
                ]
            },
            "portfolio": {
                "badge": "ACTIVITIES",
                "heading": "What happens on Malik Farms",
                "description": "From breeder seed to foundation stock, our farms support the full seed value chain.",
                "tags": ["SEED MULTIPLICATION", "CROP TRIALS", "DEMONSTRATION PLOTS", "FARMER TRAINING", "QUALITY TESTING"]
            },
            "heritage": {
                "badge": "OUR HERITAGE",
                "heading": "Rooted in the field",
                "description": "",
                "images": [],
                "youtube_url": ""
            }
        }
    },
    "innovation": {
        "name": "Innovation & Development",
        "slug": "innovation-development",
        "tagline": "Research-driven seed solutions",
        "description": "Our R&D pipeline turns field insights into improved varieties and better growing outcomes.",
        "content": {
            "hero": {"title": "INNOVATION & DEVELOPMENT", "subtitle": "", "background_image": "", "scroll_text": "Scroll to explore"},
            "intro": {
                "heading": "Research for",
                "heading_highlight": "real fields.",
                "description": "We combine conventional breeding, trait selection, and on-farm testing to develop varieties that solve real problems for Bangladeshi farmers.",
                "tags": ["Research Led", "Field Tested", "Future Ready"]
            },
            "farmers": {
                "badge": "WITH OUR SCIENTISTS",
                "heading": "Where science meets soil",
                "description": "Our researchers work side by side with farmers to understand local challenges and validate new solutions.",
                "images": []
            },
            "qualities": {
                "badge": "WHAT WE FOCUS ON",
                "heading": "Three pillars of innovation.",
                "description": "Every project is judged by its potential to improve yield, resilience, and farmer profitability.",
                "cards": [
                    {"number": 1, "title": "Research Led", "description": "Our breeding programmes are guided by market needs, agronomic data, and feedback from farmers and extension teams."},
                    {"number": 2, "title": "Field Tested", "description": "New varieties undergo multi-location trials before release, ensuring performance across Bangladesh's diverse environments."},
                    {"number": 3, "title": "Future Ready", "description": "We invest in traits that prepare farmers for changing climates, evolving markets, and emerging pest pressures."}
                ]
            },
            "portfolio": {
                "badge": "FOCUS AREAS",
                "heading": "Innovation Portfolio",
                "description": "From germplasm to grower recommendations, our development work covers the full lifecycle.",
                "tags": ["BREEDING", "TRIAL NETWORKS", "SEED TECHNOLOGY", "DIGITAL AGRONOMY", "CAPACITY BUILDING"]
            },
            "heritage": {
                "badge": "OUR HERITAGE",
                "heading": "Pioneering better seeds",
                "description": "",
                "images": [],
                "youtube_url": ""
            }
        }
    },
    "planted_by_malik": {
        "name": "Planted by Malik",
        "slug": "planted-by-malik",
        "tagline": "Field-proven crop solutions",
        "description": "End-to-end support that helps farmers plant, grow, and harvest with confidence.",
        "content": {
            "hero": {"title": "PLANTED BY MALIK", "subtitle": "", "background_image": "", "scroll_text": "Scroll to explore"},
            "intro": {
                "heading": "Solutions",
                "heading_highlight": "from seed to harvest.",
                "description": "Planted by Malik brings together quality seed, agronomic guidance, and market linkages to help farmers succeed at every stage of the crop cycle.",
                "tags": ["Quality Inputs", "Expert Guidance", "Market Access"]
            },
            "farmers": {
                "badge": "WITH OUR FARMERS",
                "heading": "Growing together",
                "description": "We partner with farmers through demonstrations, advisory services, and reliable input supply.",
                "images": []
            },
            "qualities": {
                "badge": "WHAT WE DELIVER",
                "heading": "Three promises to every farmer.",
                "description": "Our farmer support model is built on quality products, practical knowledge, and stronger market connections.",
                "cards": [
                    {"number": 1, "title": "Quality Inputs", "description": "Farmers receive genuine, high-performing seed and crop care products backed by our quality assurance systems."},
                    {"number": 2, "title": "Expert Guidance", "description": "Our extension team provides practical, season-specific advice to help farmers get the most from every acre."},
                    {"number": 3, "title": "Market Access", "description": "We help connect growers to buyers and markets, turning better harvests into better livelihoods."}
                ]
            },
            "portfolio": {
                "badge": "SERVICES",
                "heading": "Planted by Malik Services",
                "description": "Comprehensive support for profitable farming.",
                "tags": ["INPUT SUPPLY", "CROP ADVISORY", "DEMONSTRATIONS", "HARVEST SUPPORT", "MARKET LINKAGES"]
            },
            "heritage": {
                "badge": "OUR HERITAGE",
                "heading": "Walking with farmers since the beginning",
                "description": "",
                "images": [],
                "youtube_url": ""
            }
        }
    },
    "features": {
        "name": "Our Brands Features",
        "slug": "our-brands-features",
        "tagline": "Explore the Malik Seed family",
        "description": "An overview of our brands and the value they bring to farmers, growers, and partners.",
        "content": {
            "hero": {"title": "OUR BRANDS", "subtitle": "Features", "background_image": "", "scroll_text": "Scroll to explore"},
            "intro": {
                "heading": "A family of brands",
                "heading_highlight": "for Bangladesh's agriculture.",
                "description": "Each Malik Seed brand is built around a specific promise: better seeds, stronger partnerships, and sustainable growth for the farming community.",
                "tags": ["Quality", "Innovation", "Partnership"]
            },
            "farmers": {
                "badge": "WITH OUR PARTNERS",
                "heading": "Built on relationships",
                "description": "Our brands are shaped by the farmers, researchers, and partners who work with us every day.",
                "images": []
            },
            "qualities": {
                "badge": "WHAT WE STAND FOR",
                "heading": "Shared values across every brand.",
                "description": "Whether it's seeds, flowers, or farm services, these principles guide everything we do.",
                "cards": [
                    {"number": 1, "title": "Quality First", "description": "Every product and service is held to rigorous standards so farmers can plant with confidence."},
                    {"number": 2, "title": "Innovation Driven", "description": "We continuously invest in research, technology, and field learning to improve outcomes."},
                    {"number": 3, "title": "Partnership Minded", "description": "We grow by working alongside farmers, distributors, and communities across Bangladesh."}
                ]
            },
            "portfolio": {
                "badge": "BRAND PORTFOLIO",
                "heading": "Explore Our Brands",
                "description": "Click through to learn more about each Malik Seed brand.",
                "tags": ["VEGETABLE SEEDS", "POTATO SEEDS", "MALIK'S FLOWER", "MALIK FARMS", "INNOVATION", "PLANTED BY MALIK"]
            },
            "heritage": {
                "badge": "OUR HERITAGE",
                "heading": "A legacy of growth",
                "description": "",
                "images": [],
                "youtube_url": ""
            }
        }
    }
}


def seed_brands(force_update: bool = False):
    """Seed the default Malik Seed brand pages.

    By default only creates missing brands so existing admin edits are preserved.
    Pass force_update=True to overwrite existing brand content from defaults.
    """
    db: Session = SessionLocal()
    try:
        Base.metadata.create_all(bind=engine)

        created = 0
        updated = 0
        for category_key, defaults in BRAND_DEFAULTS.items():
            existing = db.query(OurBrand).filter(OurBrand.slug == defaults["slug"]).first()
            if existing:
                if force_update:
                    existing.name = defaults["name"]
                    existing.category = BrandCategory(category_key)
                    existing.tagline = defaults["tagline"]
                    existing.description = defaults["description"]
                    existing.content = defaults["content"]
                    existing.is_active = True
                    updated += 1
            else:
                brand = OurBrand(
                    name=defaults["name"],
                    slug=defaults["slug"],
                    category=BrandCategory(category_key),
                    tagline=defaults["tagline"],
                    description=defaults["description"],
                    content=defaults["content"],
                    is_active=True,
                    is_featured=False,
                    sort_order=0
                )
                db.add(brand)
                created += 1

        db.commit()
        action = f"{created} created" + (f", {updated} updated" if force_update else "")
        print(f"✓ Brand seed complete: {action}.")
    except Exception as e:
        db.rollback()
        print(f"✗ Brand seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_brands()
