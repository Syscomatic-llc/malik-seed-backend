"""Create or update the admin user.

Usage:
    python create_admin.py
    python create_admin.py --email admin@example.com --password Secret123!
"""
import argparse

from core.database import SessionLocal
from core.security import hash_password
from models.user.model import User, UserRole, UserStatus


def main():
    parser = argparse.ArgumentParser(description="Create or update Malik Seeds CMS admin user")
    parser.add_argument("--email", default="malikseed.admin@gmail.com", help="Admin email")
    parser.add_argument("--password", default="M@lik@2026", help="Admin password")
    parser.add_argument("--first-name", default="Admin", help="First name")
    parser.add_argument("--last-name", default="User", help="Last name")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == args.email).first()
        if user:
            user.password_hash = hash_password(args.password)
            user.email_verified = True
            user.status = UserStatus.ACTIVE
            user.role = UserRole.ADMIN
            db.commit()
            print(f"Updated admin user: {user.email} (id={user.id})")
        else:
            user = User(
                first_name=args.first_name,
                last_name=args.last_name,
                email=args.email,
                password_hash=hash_password(args.password),
                role=UserRole.ADMIN,
                status=UserStatus.ACTIVE,
                email_verified=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created admin user: {user.email} (id={user.id})")
    finally:
        db.close()


if __name__ == "__main__":
    main()
