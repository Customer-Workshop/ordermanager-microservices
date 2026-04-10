import enum
from datetime import datetime

from sqlalchemy import String, Text, Enum, DateTime, ForeignKey, Integer, Float, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class SLAStage(str, enum.Enum):
    REQUEST_TO_SHORTLIST = "request_to_shortlist"
    SHORTLIST_TO_INTERVIEW = "shortlist_to_interview"
    INTERVIEW_TO_OFFER = "interview_to_offer"
    OFFER_TO_ACCEPTANCE = "offer_to_acceptance"
    ACCEPTANCE_TO_ONBOARDING = "acceptance_to_onboarding"
    END_TO_END = "end_to_end"


class SLAStatus(str, enum.Enum):
    ON_TRACK = "on_track"
    AT_RISK = "at_risk"
    BREACHED = "breached"
    MET = "met"


class SLADefinition(Base):
    __tablename__ = "sla_definitions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    stage: Mapped[SLAStage] = mapped_column(Enum(SLAStage))
    target_days: Mapped[int] = mapped_column(Integer)
    warning_threshold_days: Mapped[int] = mapped_column(Integer)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    attachments: Mapped[list["SLAAttachment"]] = relationship(
        back_populates="sla_definition", cascade="all, delete-orphan"
    )


class SLATracking(Base):
    __tablename__ = "sla_tracking"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    staffing_request_id: Mapped[int] = mapped_column(ForeignKey("staffing_requests.id"), index=True)
    sla_definition_id: Mapped[int] = mapped_column(ForeignKey("sla_definitions.id"), index=True)
    status: Mapped[SLAStatus] = mapped_column(Enum(SLAStatus), default=SLAStatus.ON_TRACK)
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    target_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    actual_completion_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    days_elapsed: Mapped[int | None] = mapped_column(Integer, nullable=True)
    ai_risk_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    ai_risk_explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    staffing_request: Mapped["StaffingRequest"] = relationship()
    sla_definition: Mapped["SLADefinition"] = relationship()


class SLAAttachment(Base):
    """SLA document attachment — supports .xls/.xlsx file uploads."""
    __tablename__ = "sla_attachments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    sla_definition_id: Mapped[int] = mapped_column(
        ForeignKey("sla_definitions.id", ondelete="CASCADE"), index=True
    )
    file_name: Mapped[str] = mapped_column(String(255))
    file_url: Mapped[str] = mapped_column(String(500))
    file_type: Mapped[str] = mapped_column(String(50), default="application/vnd.ms-excel")
    file_size_bytes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    uploaded_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    sla_definition: Mapped["SLADefinition"] = relationship(back_populates="attachments")
    uploaded_by: Mapped["User | None"] = relationship()


from app.models.staffing_request import StaffingRequest  # noqa: E402
from app.models.user import User  # noqa: E402
