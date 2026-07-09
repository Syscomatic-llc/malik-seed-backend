"""Add missing columns to existing databases without dropping tables.

Run before seeding in production:
    python migrate.py

Supports SQLite and PostgreSQL.
"""
import os
import sys

from sqlalchemy import inspect, text
from core.database import engine


def column_exists(table_name: str, column_name: str) -> bool:
    inspector = inspect(engine)
    columns = [c["name"] for c in inspector.get_columns(table_name)]
    return column_name in columns


def add_json_column(table_name: str, column_name: str):
    if column_exists(table_name, column_name):
        print(f"  ✓ {table_name}.{column_name} already exists")
        return

    dialect = engine.dialect.name

    if dialect == "sqlite":
        # SQLite supports ALTER TABLE ADD COLUMN with JSON stored as text
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


def main():
    print("Running migrations...")

    # Ensure tables exist first
    from core.database import Base
    from models.homepage.model import HomepageAbout, HomepageTimeline
    Base.metadata.create_all(bind=engine)

    add_json_column("homepage_abouts", "gallery_images")
    add_json_column("homepage_timelines", "gallery_images")

    print("Migrations complete.")


if __name__ == "__main__":
    main()
