from datetime import datetime

from sqlalchemy import String, Text, DateTime, ForeignKey, Integer, Float, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class RoleRubric(Base):
    """Rubric uploaded as HTML file, rendered in real-time for interviewers.

    Supports weighted scoring, pass-band thresholds, auto-reject rules,
    and specialist-friendly rules per role/experience level.
    """
    __tablename__ = "role_rubrics"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    html_content: Mapped[str | None] = mapped_column(Text, nullable=True)  # Full HTML rubric content
    document_url: Mapped[str | None] = mapped_column(String(500), nullable=True)  # S3/storage URL for original file
    pass_band: Mapped[str | None] = mapped_column(String(255), nullable=True)  # e.g. "Weighted score >= 65%"
    auto_reject_rule: Mapped[str | None] = mapped_column(Text, nullable=True)  # e.g. "< 3 on OpenShift OR < 3 on RCA"
    specialist_rule: Mapped[str | None] = mapped_column(Text, nullable=True)  # e.g. "Depth in either VMware OR Nutanix"
    version: Mapped[int] = mapped_column(Integer, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    uploaded_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    role: Mapped["Role"] = relationship()
    uploaded_by: Mapped["User | None"] = relationship()
    criteria: Mapped[list["RubricCriterion"]] = relationship(
        back_populates="rubric", cascade="all, delete-orphan"
    )


class RubricCriterion(Base):
    """Individual criterion within a rubric that interviewers rate candidates on."""
    __tablename__ = "rubric_criteria"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    rubric_id: Mapped[int] = mapped_column(ForeignKey("role_rubrics.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    max_score: Mapped[float] = mapped_column(Float, default=5.0)
    weight: Mapped[float] = mapped_column(Float, default=1.0)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    rubric: Mapped["RoleRubric"] = relationship(back_populates="criteria")


class RubricRating(Base):
    """Interviewer's rating of a candidate against a specific rubric criterion."""
    __tablename__ = "rubric_ratings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    interview_feedback_id: Mapped[int] = mapped_column(
        ForeignKey("interview_feedbacks.id", ondelete="CASCADE"), index=True
    )
    criterion_id: Mapped[int] = mapped_column(
        ForeignKey("rubric_criteria.id", ondelete="CASCADE"), index=True
    )
    score: Mapped[float] = mapped_column(Float)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    criterion: Mapped["RubricCriterion"] = relationship()
    interview_feedback: Mapped["InterviewFeedback"] = relationship()


from app.models.role import Role  # noqa: E402
from app.models.user import User  # noqa: E402
from app.models.interview import InterviewFeedback  # noqa: E402
