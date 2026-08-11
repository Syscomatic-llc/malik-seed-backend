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
            conn.execute(text(f'ALTER TABLE {table_name} ADD COLUMN {column_name} {column_def}'))
        elif dialect == "postgresql":
            conn.execute(text(f'ALTER TABLE {table_name} ADD COLUMN {column_name} {column_def}'))
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

    # Homepage news items icon
    add_column("homepage_news_items", "icon", "VARCHAR(100)")

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

    print("Migrations complete.")


if __name__ == "__main__":
    main()
