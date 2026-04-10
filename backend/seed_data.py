"""Seed script to populate initial data: locations, practice units, and sample users."""
from app.database import SessionLocal, engine, Base
from app.models.location import Location
from app.models.practice_unit import PracticeUnit
from app.models.user import User, UserPersona, PersonaType
from app.core.security import get_password_hash

# Import all models so tables are created
import app.models  # noqa: F401


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # --- Locations (3 company + 2 client) ---
    locations = [
        {"name": "Richardson Office", "city": "Richardson", "state": "TX", "location_type": "company"},
        {"name": "Raleigh Office", "city": "Raleigh", "state": "NC", "location_type": "company"},
        {"name": "Phoenix Office", "city": "Phoenix", "state": "AZ", "location_type": "company"},
        {"name": "Plano Client Site", "city": "Plano", "state": "TX", "location_type": "client"},
        {"name": "Reston Client Site", "city": "Reston", "state": "VA", "location_type": "client"},
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
        {"email": "admin@infosys.com", "full_name": "Portal Admin", "persona": PersonaType.ADMIN, "password": "admin123"},
        {"email": "recruiter@infosys.com", "full_name": "Sample Recruiter", "persona": PersonaType.RECRUITER, "password": "recruiter123"},
        {"email": "interviewer@infosys.com", "full_name": "Sample Interviewer", "persona": PersonaType.INTERVIEWER, "password": "interviewer123"},
        {"email": "anchor@infosys.com", "full_name": "Unit Anchor", "persona": PersonaType.STAFFING_MANAGER, "password": "anchor123"},
    ]
    for user_data in users:
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if not existing:
            user = User(
                email=user_data["email"],
                full_name=user_data["full_name"],
                hashed_password=get_password_hash(user_data["password"]),
            )
            db.add(user)
            db.flush()
            db.add(UserPersona(user_id=user.id, persona=user_data["persona"], is_primary=True))

    db.commit()
    db.close()
    print("Seed data loaded successfully.")


if __name__ == "__main__":
    seed()
