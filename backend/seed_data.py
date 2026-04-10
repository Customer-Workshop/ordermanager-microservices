"""Seed script to populate initial data: locations, practice units, and sample users."""
from app.database import SessionLocal, engine, Base
from app.models.location import Location
from app.models.practice_unit import PracticeUnit
from app.models.user import User, UserPersona
from app.core.security import get_password_hash

# Import all models so tables are created
import app.models  # noqa: F401


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # --- Locations (3 company + 2 client) ---
    locations = [
        {"city": "Richardson", "state": "TX", "zip_code": "75080", "is_client_location": False},
        {"city": "Raleigh", "state": "NC", "zip_code": "27601", "is_client_location": False},
        {"city": "Phoenix", "state": "AZ", "zip_code": "85001", "is_client_location": False},
        {"city": "Plano", "state": "TX", "zip_code": "75024", "is_client_location": True},
        {"city": "Reston", "state": "VA", "zip_code": "20190", "is_client_location": True},
    ]
    for loc_data in locations:
        existing = db.query(Location).filter(Location.city == loc_data["city"], Location.state == loc_data["state"]).first()
        if not existing:
            db.add(Location(**loc_data))

    # --- Practice Units ---
    practice_units = [
        {"code": "ADM", "name": "Application Development & Maintenance", "description": "Development roles"},
        {"code": "CIS", "name": "Cloud & Infrastructure Services", "description": "Infra support roles"},
        {"code": "QES", "name": "Quality Engineering & Services", "description": "Testing roles"},
        {"code": "ARC", "name": "Architecture & Design", "description": "Architecture roles"},
        {"code": "DAA", "name": "Data & Analytics", "description": "Data Analytics roles"},
        {"code": "CSC", "name": "Cyber Security Center", "description": "Cyber security roles"},
    ]
    for pu_data in practice_units:
        existing = db.query(PracticeUnit).filter(PracticeUnit.code == pu_data["code"]).first()
        if not existing:
            db.add(PracticeUnit(**pu_data))

    # --- Sample Users ---
    users = [
        {"email": "admin@infosys.com", "full_name": "Portal Admin", "persona": UserPersona.ADMIN, "password": "admin123"},
        {"email": "recruiter@infosys.com", "full_name": "Sample Recruiter", "persona": UserPersona.RECRUITER, "password": "recruiter123"},
        {"email": "interviewer@infosys.com", "full_name": "Sample Interviewer", "persona": UserPersona.INTERVIEWER, "password": "interviewer123"},
        {"email": "anchor@infosys.com", "full_name": "Unit Anchor", "persona": UserPersona.UNIT_ANCHOR, "password": "anchor123"},
    ]
    for user_data in users:
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if not existing:
            db.add(User(
                email=user_data["email"],
                full_name=user_data["full_name"],
                persona=user_data["persona"],
                hashed_password=get_password_hash(user_data["password"]),
            ))

    db.commit()
    db.close()
    print("Seed data loaded successfully.")


if __name__ == "__main__":
    seed()
