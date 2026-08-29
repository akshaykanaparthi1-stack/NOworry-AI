import os
import uuid
from backend.app.core.db import SessionLocal, init_db_schema
from backend.app.models.profile import Profile

def seed_login_users():
    init_db_schema()
    db = SessionLocal()
    
    users = [
        {
            "email": "operator@noworry.ai",
            "full_name": "System Operator",
            "role": "OPERATOR",
            "auth_user_id": "user_operator_noworry_ai"
        },
        {
            "email": "admin@noworry.ai",
            "full_name": "System Administrator",
            "role": "ADMIN",
            "auth_user_id": "user_admin_noworry_ai"
        },
        {
            "email": "analyst@noworry.ai",
            "full_name": "Revenue Analyst",
            "role": "ANALYST",
            "auth_user_id": "user_analyst_noworry_ai"
        }
    ]
    
    inserted = []
    for u in users:
        existing = db.query(Profile).filter(Profile.email == u["email"]).first()
        if not existing:
            prof = Profile(
                auth_user_id=u["auth_user_id"],
                full_name=u["full_name"],
                email=u["email"],
                role=u["role"]
            )
            db.add(prof)
            inserted.append(u["email"])
        else:
            existing.role = u["role"]
            existing.full_name = u["full_name"]
            
    db.commit()
    db.close()
    print(f"Successfully seeded {len(users)} login user profiles into database!")
    if inserted:
        print(f"Inserted new user accounts: {', '.join(inserted)}")

if __name__ == "__main__":
    seed_login_users()
