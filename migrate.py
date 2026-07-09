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


def main():
    print("Running migrations...")

    # Ensure tables exist first
    from core.database import Base
    from models.homepage.model import HomepageAbout, HomepageTimeline
    Base.metadata.create_all(bind=engine)

    add_json_column("homepage_abouts", "gallery_images")
    add_json_column("homepage_timelines", "gallery_images")

    ensure_varchar_length("homepage_timelines", "year", 50)
    ensure_varchar_length("our_story_timelines", "year", 50)

    print("Migrations complete.")


if __name__ == "__main__":
    main()
