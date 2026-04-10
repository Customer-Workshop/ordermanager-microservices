import enum
from datetime import datetime

from sqlalchemy import String, Text, Enum, DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class RoleCategory(str, enum.Enum):
    DEVELOPMENT = "development"
    TESTING = "testing"
    ARCHITECTURE = "architecture"
    INFRA_SUPPORT = "infra_support"
    DATA_ANALYTICS = "data_analytics"
    CYBER_SECURITY = "cyber_security"
    OTHER = "other"


class ExperienceLevel(str, enum.Enum):
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"
    LEAD = "lead"
    ARCHITECT = "architect"


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    category: Mapped[RoleCategory] = mapped_column(Enum(RoleCategory))
    experience_level: Mapped[ExperienceLevel] = mapped_column(Enum(ExperienceLevel))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    min_years_experience: Mapped[int] = mapped_column(Integer, default=0)
    practice_unit_id: Mapped[int | None] = mapped_column(ForeignKey("practice_units.id"), nullable=True, index=True)
    clearance_required: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    required_skills: Mapped[list["RoleSkill"]] = relationship(back_populates="role", cascade="all, delete-orphan")
    practice_unit: Mapped["PracticeUnit | None"] = relationship()


from app.models.practice_unit import PracticeUnit  # noqa: E402


class RoleSkill(Base):
    __tablename__ = "role_skills"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), index=True)
    skill_name: Mapped[str] = mapped_column(String(100))
    is_mandatory: Mapped[bool] = mapped_column(default=True)
    proficiency_level: Mapped[int] = mapped_column(Integer, default=3)  # 1-5 scale

    role: Mapped["Role"] = relationship(back_populates="required_skills")
