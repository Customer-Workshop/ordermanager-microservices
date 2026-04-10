import enum
from datetime import datetime

from sqlalchemy import String, Text, Enum, DateTime, ForeignKey, Integer, Float, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CandidateStatus(str, enum.Enum):
    AVAILABLE = "available"
    SHORTLISTED = "shortlisted"
    INTERVIEWING = "interviewing"
    OFFERED = "offered"
    ONBOARDING = "onboarding"
    ACTIVE = "active"
    ON_ROTATION = "on_rotation"
    RELEASED = "released"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class Candidate(Base):
    __tablename__ = "candidates"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    status: Mapped[CandidateStatus] = mapped_column(Enum(CandidateStatus), default=CandidateStatus.AVAILABLE)
    current_location_city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    current_location_state: Mapped[str | None] = mapped_column(String(2), nullable=True)
    preferred_location_id: Mapped[int | None] = mapped_column(ForeignKey("locations.id"), nullable=True)
    years_of_experience: Mapped[float] = mapped_column(Float, default=0.0)
    resume_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    resume_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_match_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    ai_match_explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    notice_period_days: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    skills: Mapped[list["CandidateSkill"]] = relationship(back_populates="candidate", cascade="all, delete-orphan")
    preferred_location: Mapped["Location | None"] = relationship()


class CandidateSkill(Base):
    __tablename__ = "candidate_skills"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    candidate_id: Mapped[int] = mapped_column(ForeignKey("candidates.id", ondelete="CASCADE"), index=True)
    skill_name: Mapped[str] = mapped_column(String(100))
    proficiency_level: Mapped[int] = mapped_column(Integer, default=3)  # 1-5 scale
    years_of_experience: Mapped[float] = mapped_column(Float, default=0.0)

    candidate: Mapped["Candidate"] = relationship(back_populates="skills")


from app.models.location import Location  # noqa: E402
