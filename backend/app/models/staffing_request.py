import enum
from datetime import datetime, date

from sqlalchemy import String, Text, Enum, DateTime, Date, ForeignKey, Integer, Float, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class RequestStatus(str, enum.Enum):
    NEW = "new"
    SOURCING = "sourcing"
    SHORTLISTED = "shortlisted"
    INTERVIEWING = "interviewing"
    OFFER_PENDING = "offer_pending"
    OFFER_ACCEPTED = "offer_accepted"
    ONBOARDING = "onboarding"
    FULFILLED = "fulfilled"
    CANCELLED = "cancelled"
    ON_HOLD = "on_hold"


class RequestPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class StaffingRequest(Base):
    __tablename__ = "staffing_requests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    wmt_reference_id: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), index=True)
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"), index=True)
    status: Mapped[RequestStatus] = mapped_column(Enum(RequestStatus), default=RequestStatus.NEW)
    priority: Mapped[RequestPriority] = mapped_column(Enum(RequestPriority), default=RequestPriority.MEDIUM)
    number_of_positions: Mapped[int] = mapped_column(Integer, default=1)
    requested_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    assigned_recruiter_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    target_start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    deadline_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    role: Mapped["Role"] = relationship()
    location: Mapped["Location"] = relationship()
    requested_by: Mapped["User | None"] = relationship(foreign_keys=[requested_by_id])
    assigned_recruiter: Mapped["User | None"] = relationship(foreign_keys=[assigned_recruiter_id])
    candidates: Mapped[list["StaffingRequestCandidate"]] = relationship(
        back_populates="staffing_request", cascade="all, delete-orphan"
    )


class CandidateStageStatus(str, enum.Enum):
    SHORTLISTED = "shortlisted"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    INTERVIEW_COMPLETED = "interview_completed"
    SELECTED = "selected"
    OFFERED = "offered"
    OFFER_ACCEPTED = "offer_accepted"
    OFFER_DECLINED = "offer_declined"
    ONBOARDING = "onboarding"
    ONBOARDED = "onboarded"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class StaffingRequestCandidate(Base):
    __tablename__ = "staffing_request_candidates"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    staffing_request_id: Mapped[int] = mapped_column(
        ForeignKey("staffing_requests.id", ondelete="CASCADE"), index=True
    )
    candidate_id: Mapped[int] = mapped_column(ForeignKey("candidates.id"), index=True)
    stage_status: Mapped[CandidateStageStatus] = mapped_column(
        Enum(CandidateStageStatus), default=CandidateStageStatus.SHORTLISTED
    )
    ai_match_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    ai_match_explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    shortlisted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    staffing_request: Mapped["StaffingRequest"] = relationship(back_populates="candidates")
    candidate: Mapped["Candidate"] = relationship()


from app.models.role import Role  # noqa: E402
from app.models.location import Location  # noqa: E402
from app.models.user import User  # noqa: E402
from app.models.candidate import Candidate  # noqa: E402
