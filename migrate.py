"""Add missing columns and resize columns for existing databases.

Run in Docker:
    docker compose exec backend python migrate.py

Or directly:
    python migrate.py

Supports SQLite and PostgreSQL.
"""
from sqlalchemy import inspect, text
from core.database import engine


def table_exists(table_name: str) -> bool:
    inspector = inspect(engine)
    return table_name in inspector.get_table_names()


def column_exists(table_name: str, column_name: str) -> bool:
    inspector = inspect(engine)
    columns = [c["name"] for c in inspector.get_columns(table_name)]
    return column_name in columns


def get_column_length(table_name: str, column_name: str) -> int:
    inspector = inspect(engine)
    for col in inspector.get_columns(table_name):
        if col["name"] == column_name:
            return getattr(col["type"], "length", 0) or 0
    return 0


def add_column(table_name: str, column_name: str, column_def: str):
    """Add a column if it does not already exist."""
    if not table_exists(table_name):
        return
    if column_exists(table_name, column_name):
        print(f"  ✓ {table_name}.{column_name} already exists")
        return

    dialect = engine.dialect.name
    with engine.connect() as conn:
        if dialect == "sqlite":
            # SQLite uses 0/1 for boolean
            sqlite_def = column_def.replace("DEFAULT TRUE", "DEFAULT 1").replace("DEFAULT FALSE", "DEFAULT 0")
            conn.execute(text(f'ALTER TABLE {table_name} ADD COLUMN {column_name} {sqlite_def}'))
        elif dialect == "postgresql":
            # PostgreSQL uses TRUE/FALSE for boolean
            pg_def = column_def.replace("DEFAULT 1", "DEFAULT TRUE").replace("DEFAULT 0", "DEFAULT FALSE")
            conn.execute(text(f'ALTER TABLE {table_name} ADD COLUMN {column_name} {pg_def}'))
        else:
            print(f"  ✗ Unsupported dialect: {dialect}")
            return
        conn.commit()
    print(f"  ✓ Added {table_name}.{column_name}")


def add_json_column(table_name: str, column_name: str):
    if column_exists(table_name, column_name):
        print(f"  ✓ {table_name}.{column_name} already exists")
        return

    dialect = engine.dialect.name

    if dialect == "sqlite":
        with engine.connect() as conn:
            conn.execute(text(f'ALTER TABLE {table_name} ADD COLUMN {column_name} TEXT'))
            conn.commit()
    elif dialect == "postgresql":
        with engine.connect() as conn:
            conn.execute(text(f'ALTER TABLE {table_name} ADD COLUMN {column_name} JSONB'))
            conn.commit()
    else:
        print(f"  ✗ Unsupported dialect: {dialect}")
        return

    print(f"  ✓ Added {table_name}.{column_name}")


def ensure_varchar_length(table_name: str, column_name: str, min_length: int):
    if not table_exists(table_name):
        return

    current_length = get_column_length(table_name, column_name)
    if current_length >= min_length:
        print(f"  ✓ {table_name}.{column_name} length is OK ({current_length})")
        return

    dialect = engine.dialect.name

    if dialect in ("sqlite", "postgresql"):
        with engine.connect() as conn:
            conn.execute(text(f'ALTER TABLE {table_name} ALTER COLUMN {column_name} TYPE VARCHAR({min_length})'))
            conn.commit()
    else:
        print(f"  ✗ Unsupported dialect: {dialect}")
        return

    print(f"  ✓ Resized {table_name}.{column_name} to VARCHAR({min_length})")


def add_enum_value(enum_name: str, value: str):
    """Add a value to a PostgreSQL enum type if it does not already exist."""
    dialect = engine.dialect.name
    if dialect != "postgresql":
        return

    with engine.connect() as conn:
        result = conn.execute(text(
            f"SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = '{enum_name}')"
        )).fetchall()
        existing = {row[0] for row in result}
        if value in existing:
            print(f"  ✓ Enum {enum_name}.{value} already exists")
            return

        conn.execute(text(f"ALTER TYPE {enum_name} ADD VALUE '{value}'"))
        conn.commit()
    print(f"  ✓ Added value {value} to enum {enum_name}")


def convert_enum_column_to_varchar(table_name: str, column_name: str):
    """Convert a PostgreSQL enum column to VARCHAR so custom free-text values can be stored."""
    if not table_exists(table_name):
        return

    dialect = engine.dialect.name
    if dialect != "postgresql":
        return

    with engine.connect() as conn:
        # Check current column type
        result = conn.execute(text(
            f"SELECT data_type, udt_name FROM information_schema.columns WHERE table_name = '{table_name}' AND column_name = '{column_name}'"
        )).fetchone()

        if not result:
            return

        data_type, udt_name = result
        if data_type.lower() != "user-defined" or udt_name.lower() == "varchar":
            print(f"  ✓ {table_name}.{column_name} is already VARCHAR or not an enum")
            return

        conn.execute(text(
            f"ALTER TABLE {table_name} ALTER COLUMN {column_name} TYPE VARCHAR(100) USING {column_name}::text"
        ))
        conn.commit()
    print(f"  ✓ Converted {table_name}.{column_name} from enum to VARCHAR(100)")


def make_column_nullable(table_name: str, column_name: str):
    if not table_exists(table_name):
        return

    dialect = engine.dialect.name
    if dialect == "postgresql":
        with engine.connect() as conn:
            conn.execute(text(f'ALTER TABLE {table_name} ALTER COLUMN {column_name} DROP NOT NULL'))
            conn.commit()
        print(f"  ✓ Made {table_name}.{column_name} nullable")
    elif dialect == "sqlite":
        # SQLite columns are nullable by default; dropping NOT NULL requires table recreate.
        print(f"  ~ {table_name}.{column_name} SQLite nullable check skipped")
    else:
        print(f"  ✗ Unsupported dialect: {dialect}")


def backfill_story_hero_images():
    if not table_exists("our_story_heroes"):
        return

    dialect = engine.dialect.name
    if dialect == "postgresql":
        with engine.connect() as conn:
            conn.execute(text(
                """
                UPDATE our_story_heroes
                SET background_images = to_jsonb(array[background_image])
                WHERE background_image IS NOT NULL
                  AND (background_images IS NULL OR jsonb_array_length(background_images) = 0)
                """
            ))
            conn.commit()
    elif dialect == "sqlite":
        with engine.connect() as conn:
            conn.execute(text(
                """
                UPDATE our_story_heroes
                SET background_images = '["' || background_image || '"]'
                WHERE background_image IS NOT NULL
                  AND (background_images IS NULL OR background_images = '[]')
                """
            ))
            conn.commit()
    else:
        return

    print("  ✓ Backfilled our_story_heroes.background_images from background_image")


def backfill_resume_upload_fields():
    if not table_exists("resume_uploads") or not table_exists("job_applications"):
        return

    dialect = engine.dialect.name
    with engine.connect() as conn:
        if dialect == "postgresql":
            conn.execute(text(
                """
                UPDATE resume_uploads ru
                SET current_location = ja.current_location,
                    linkedin_url = ja.linkedin_url,
                    portfolio_url = ja.portfolio_url,
                    source = ja.source,
                    phone = COALESCE(NULLIF(ja.phone, ''), ru.phone),
                    name = COALESCE(NULLIF(TRIM(ja.first_name || ' ' || ja.last_name), ''), ru.name)
                FROM job_applications ja
                WHERE ru.file_url = ja.resume_url
                  AND ru.resume_type = 'open_position'
                """
            ))
        elif dialect == "sqlite":
            conn.execute(text(
                """
                UPDATE resume_uploads
                SET current_location = (
                    SELECT ja.current_location FROM job_applications ja
                    WHERE ja.resume_url = resume_uploads.file_url LIMIT 1
                ),
                linkedin_url = (
                    SELECT ja.linkedin_url FROM job_applications ja
                    WHERE ja.resume_url = resume_uploads.file_url LIMIT 1
                ),
                portfolio_url = (
                    SELECT ja.portfolio_url FROM job_applications ja
                    WHERE ja.resume_url = resume_uploads.file_url LIMIT 1
                ),
                source = (
                    SELECT ja.source FROM job_applications ja
                    WHERE ja.resume_url = resume_uploads.file_url LIMIT 1
                ),
                phone = COALESCE((
                    SELECT ja.phone FROM job_applications ja
                    WHERE ja.resume_url = resume_uploads.file_url LIMIT 1
                ), phone),
                name = COALESCE((
                    SELECT TRIM(ja.first_name || ' ' || ja.last_name) FROM job_applications ja
                    WHERE ja.resume_url = resume_uploads.file_url LIMIT 1
                ), name)
                WHERE resume_type = 'open_position'
                """
            ))
        else:
            print(f"  ~ Skipped resume_upload backfill for dialect: {dialect}")
            return
        conn.commit()

    print("  ✓ Backfilled resume_upload fields from job_applications")


def backfill_is_published():
    if not table_exists("job_positions"):
        return

    dialect = engine.dialect.name
    with engine.connect() as conn:
        if dialect == "postgresql":
            conn.execute(text(
                """
                UPDATE job_positions
                SET is_published = COALESCE(is_active, TRUE)
                WHERE is_published IS NULL
                """
            ))
        elif dialect == "sqlite":
            conn.execute(text(
                """
                UPDATE job_positions
                SET is_published = COALESCE(is_active, 1)
                WHERE is_published IS NULL
                """
            ))
        else:
            print(f"  ~ Skipped is_published backfill for dialect: {dialect}")
            return
        conn.commit()

    print("  ✓ Backfilled job_positions.is_published from is_active")


def backfill_job_positions_sort_order():
    if not table_exists("job_positions"):
        return

    dialect = engine.dialect.name
    with engine.connect() as conn:
        if dialect == "postgresql":
            conn.execute(text(
                """
                UPDATE job_positions
                SET sort_order = sub.rn
                FROM (
                    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
                    FROM job_positions
                ) AS sub
                WHERE job_positions.id = sub.id
                  AND job_positions.sort_order IS NULL
                """
            ))
        elif dialect == "sqlite":
            conn.execute(text(
                """
                UPDATE job_positions
                SET sort_order = (
                    SELECT COUNT(*) FROM job_positions jp2
                    WHERE jp2.created_at < job_positions.created_at
                       OR (jp2.created_at = job_positions.created_at AND jp2.id <= job_positions.id)
                )
                WHERE sort_order IS NULL
                """
            ))
        else:
            print(f"  ~ Skipped job_positions sort_order backfill for dialect: {dialect}")
            return
        conn.commit()

    print("  ✓ Backfilled job_positions.sort_order")


def seed_brands_if_empty():
    """Seed default brand pages only if the our_brands table is empty."""
    if not table_exists("our_brands"):
        return

    with engine.connect() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM our_brands")).scalar() or 0
        if count > 0:
            print("  ✓ our_brands already has data, skipping brand seed")
            return

    try:
        import seed_brands
        seed_brands.seed_brands()
    except Exception as e:
        print(f"  ✗ Brand seed failed: {e}")


def main():
    print("Running migrations...")

    # Ensure tables exist first
    from core.database import Base
    from models.homepage.model import HomepageAbout, HomepageTimeline
    from models.activity_log.model import ActivityLog
    Base.metadata.create_all(bind=engine)

    add_json_column("homepage_abouts", "gallery_images")
    add_json_column("homepage_timelines", "gallery_images")
    add_json_column("our_story_heroes", "background_images")
    add_json_column("our_story_timelines", "gallery_images")
    backfill_story_hero_images()

    make_column_nullable("gallery_items", "title")
    make_column_nullable("gallery_items", "category")

    ensure_varchar_length("homepage_timelines", "year", 50)
    ensure_varchar_length("our_story_timelines", "year", 50)

    # Contact info footer description and subject options
    add_column("contact_infos", "footer_description", "TEXT")
    add_json_column("contact_infos", "subject_options")

    # Our Story mission vision description
    add_column("our_story_missions", "vision_description", "TEXT")
    add_column("our_story_missions", "vision_title", "VARCHAR(200)")

    # Site settings new fields
    add_column("site_settings", "site_description", "TEXT")
    add_column("site_settings", "google_search_console_verification", "TEXT")

    # Hiring page content hero badge
    add_column("hiring_page_contents", "hero_badge", "VARCHAR(200)")

    # Career page structured sections
    add_json_column("hiring_page_contents", "career_hero_section")
    add_json_column("hiring_page_contents", "career_manifesto")
    add_json_column("hiring_page_contents", "career_team_culture")
    add_json_column("hiring_page_contents", "career_future_program")

    # Homepage news items icon
    add_column("homepage_news_items", "icon", "VARCHAR(100)")

    # Migrate is_active to is_published for job_positions
    add_column("job_positions", "is_published", "BOOLEAN DEFAULT TRUE")
    backfill_is_published()

    # Convert legacy enum columns to VARCHAR so admin can add custom options
    convert_enum_column_to_varchar("job_positions", "department")
    convert_enum_column_to_varchar("job_positions", "job_type")
    convert_enum_column_to_varchar("job_positions", "location")

    # Job position details PDF
    add_column("job_positions", "details_pdf_url", "VARCHAR(500)")

    # Job position per-section assessment durations (minutes)
    add_column("job_positions", "mcq_duration", "INTEGER")
    add_column("job_positions", "short_answer_duration", "INTEGER")
    add_column("job_positions", "long_answer_duration", "INTEGER")
    add_column("job_positions", "sort_order", "INTEGER")
    backfill_job_positions_sort_order()

    # Resume uploads new metadata fields
    add_column("resume_uploads", "resume_type", "VARCHAR(50)")
    add_column("resume_uploads", "position_id", "INTEGER")
    add_column("resume_uploads", "position_name", "VARCHAR(300)")
    add_column("resume_uploads", "applicant_name", "VARCHAR(300)")
    add_column("resume_uploads", "current_location", "VARCHAR(200)")
    add_column("resume_uploads", "linkedin_url", "VARCHAR(500)")
    add_column("resume_uploads", "portfolio_url", "VARCHAR(500)")
    add_json_column("resume_uploads", "source")
    backfill_resume_upload_fields()

    # Job applications OTP verification
    add_column("job_applications", "otp_code", "VARCHAR(10)")

    # Job applications additional info (public application flow)
    add_column("job_applications", "current_location", "VARCHAR(200)")
    add_json_column("job_applications", "source")

    # Job applications admin manual scoring for short/long answers
    add_json_column("job_applications", "admin_scores")

    # Make job application and resume upload position_id nullable so deleting a position can preserve related records
    make_column_nullable("job_applications", "position_id")
    make_column_nullable("resume_uploads", "position_id")

    # Our brands rich page content
    add_json_column("our_brands", "content")

    # Ensure brand category enum includes 'features' for PostgreSQL
    add_enum_value("brandcategory", "features")

    # Hero global CTA buttons
    add_column("site_settings", "hero_primary_cta_text", "VARCHAR(100)")
    add_column("site_settings", "hero_primary_cta_link", "VARCHAR(500)")
    add_column("site_settings", "hero_secondary_cta_text", "VARCHAR(100)")
    add_column("site_settings", "hero_secondary_cta_link", "VARCHAR(500)")

    # Resume uploads table
    if not table_exists("resume_uploads"):
        dialect = engine.dialect.name
        with engine.connect() as conn:
            if dialect == "postgresql":
                conn.execute(text(
                    """
                    CREATE TABLE resume_uploads (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(200),
                        email VARCHAR(255),
                        phone VARCHAR(50),
                        position VARCHAR(200),
                        message TEXT,
                        filename VARCHAR(300) NOT NULL,
                        file_url VARCHAR(500) NOT NULL,
                        file_size INTEGER,
                        is_reviewed BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE
                    )
                    """
                ))
            elif dialect == "sqlite":
                conn.execute(text(
                    """
                    CREATE TABLE resume_uploads (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name VARCHAR(200),
                        email VARCHAR(255),
                        phone VARCHAR(50),
                        position VARCHAR(200),
                        message TEXT,
                        filename VARCHAR(300) NOT NULL,
                        file_url VARCHAR(500) NOT NULL,
                        file_size INTEGER,
                        is_reviewed BOOLEAN DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP
                    )
                    """
                ))
            else:
                print(f"  ✗ Unsupported dialect: {dialect}")
            conn.commit()
        print("  ✓ Created resume_uploads table")
    else:
        print("  ✓ resume_uploads table already exists")

    # Sitemaps table
    if not table_exists("sitemaps"):
        dialect = engine.dialect.name
        with engine.connect() as conn:
            if dialect == "postgresql":
                conn.execute(text(
                    """
                    CREATE TABLE sitemaps (
                        id SERIAL PRIMARY KEY,
                        url_path VARCHAR(500) NOT NULL,
                        last_modified TIMESTAMP WITH TIME ZONE,
                        changefreq VARCHAR(20) DEFAULT 'monthly',
                        priority VARCHAR(10) DEFAULT '0.5',
                        is_active BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE
                    )
                    """
                ))
            elif dialect == "sqlite":
                conn.execute(text(
                    """
                    CREATE TABLE sitemaps (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        url_path VARCHAR(500) NOT NULL,
                        last_modified TIMESTAMP,
                        changefreq VARCHAR(20) DEFAULT 'monthly',
                        priority VARCHAR(10) DEFAULT '0.5',
                        is_active BOOLEAN DEFAULT 1,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP
                    )
                    """
                ))
            else:
                print(f"  ✗ Unsupported dialect: {dialect}")
            conn.commit()
        print("  ✓ Created sitemaps table")
    else:
        print("  ✓ sitemaps table already exists")

    # Hiring dropdown options table
    if not table_exists("hiring_dropdown_options"):
        dialect = engine.dialect.name
        with engine.connect() as conn:
            if dialect == "postgresql":
                conn.execute(text(
                    """
                    CREATE TABLE hiring_dropdown_options (
                        id SERIAL PRIMARY KEY,
                        option_type VARCHAR(50) NOT NULL,
                        value VARCHAR(100) NOT NULL,
                        label VARCHAR(100) NOT NULL,
                        sort_order INTEGER DEFAULT 0,
                        is_active BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE
                    )
                    """
                ))
            elif dialect == "sqlite":
                conn.execute(text(
                    """
                    CREATE TABLE hiring_dropdown_options (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        option_type VARCHAR(50) NOT NULL,
                        value VARCHAR(100) NOT NULL,
                        label VARCHAR(100) NOT NULL,
                        sort_order INTEGER DEFAULT 0,
                        is_active BOOLEAN DEFAULT 1,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP
                    )
                    """
                ))
            else:
                print(f"  ✗ Unsupported dialect: {dialect}")
            conn.commit()
        print("  ✓ Created hiring_dropdown_options table")
    else:
        print("  ✓ hiring_dropdown_options table already exists")

    seed_hiring_dropdown_options()

    # Seed default Our Brands pages only when the table is empty
    seed_brands_if_empty()

    print("Migrations complete.")


def seed_hiring_dropdown_options():
    """Seed hiring dropdown options from defaults and existing job positions."""
    if not table_exists("hiring_dropdown_options") or not table_exists("job_positions"):
        return

    from models.hiring.model import HiringDropdownOption

    defaults = {
        "department": ["Sales", "Marketing", "Operations", "Research", "Finance", "HR", "IT", "Field", "Logistics", "Production"],
        "job_type": ["Full Time", "Part Time", "Contract", "Internship"],
        "location": ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Sylhet", "Barisal", "Rangpur", "Remote"],
    }

    with engine.connect() as conn:
        existing_count = conn.execute(text("SELECT COUNT(*) FROM hiring_dropdown_options")).scalar()
        if existing_count and existing_count > 0:
            print("  ✓ hiring_dropdown_options already seeded")
            return

        # Collect existing values from job_positions
        existing_values = {t: set() for t in defaults}
        for option_type in defaults:
            col_name = "department" if option_type == "department" else ("job_type" if option_type == "job_type" else "location")
            result = conn.execute(text(f"SELECT DISTINCT {col_name} FROM job_positions WHERE {col_name} IS NOT NULL"))
            for row in result:
                val = row[0]
                if val:
                    existing_values[option_type].add(val.strip())

        all_values = {}
        sort_order = 0
        for option_type, labels in defaults.items():
            merged = []
            for label in labels:
                value = label.lower().replace(' ', '_')
                merged.append((value, label))
            for val in sorted(existing_values[option_type]):
                label = ' '.join(word.capitalize() for word in val.replace('_', ' ').split())
                if (val, label) not in merged:
                    merged.append((val, label))
            all_values[option_type] = merged

        for option_type, values in all_values.items():
            for idx, (value, label) in enumerate(values):
                conn.execute(text(
                    "INSERT INTO hiring_dropdown_options (option_type, value, label, sort_order, is_active) VALUES (:ot, :val, :lbl, :so, TRUE)"
                ), {"ot": option_type, "val": value, "lbl": label, "so": idx})
        conn.commit()
    print("  ✓ Seeded hiring_dropdown_options")


if __name__ == "__main__":
    main()
