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


def main():
    print("Running migrations...")

    # Ensure tables exist first
    from core.database import Base
    from models.homepage.model import HomepageAbout, HomepageTimeline
    Base.metadata.create_all(bind=engine)

    add_json_column("homepage_abouts", "gallery_images")
    add_json_column("homepage_timelines", "gallery_images")
    add_json_column("our_story_heroes", "background_images")
    backfill_story_hero_images()

    make_column_nullable("gallery_items", "title")
    make_column_nullable("gallery_items", "category")

    ensure_varchar_length("homepage_timelines", "year", 50)
    ensure_varchar_length("our_story_timelines", "year", 50)

    # Contact info footer description
    add_column("contact_infos", "footer_description", "TEXT")

    # Our Story mission vision description
    add_column("our_story_missions", "vision_description", "TEXT")

    # Site settings new fields
    add_column("site_settings", "site_description", "TEXT")
    add_column("site_settings", "google_search_console_verification", "TEXT")

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
