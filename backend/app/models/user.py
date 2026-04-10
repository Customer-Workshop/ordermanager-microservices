import enum
from datetime import datetime

from sqlalchemy import String, Boolean, DateTime, Enum, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PersonaType(str, enum.Enum):
    CLIENT_REQUESTOR = "client_requestor"
    CLIENT_MANAGER = "client_manager"
    STAFFING_MANAGER = "staffing_manager"
    RECRUITER = "recruiter"
    INTERVIEWER = "interviewer"
    CANDIDATE = "candidate"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sso_id: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    location_id: Mapped[int | None] = mapped_column(ForeignKey("locations.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    personas: Mapped[list["UserPersona"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    location: Mapped["Location | None"] = relationship()


class UserPersona(Base):
    __tablename__ = "user_personas"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    persona: Mapped[PersonaType] = mapped_column(Enum(PersonaType))
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship(back_populates="personas")


# Avoid circular import
from app.models.location import Location  # noqa: E402
