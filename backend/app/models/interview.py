import enum
from datetime import datetime

from sqlalchemy import String, Text, Enum, DateTime, ForeignKey, Integer, Float, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class InterviewType(str, enum.Enum):
    TECHNICAL = "technical"
    HR = "hr"
    MANAGERIAL = "managerial"
    CLIENT = "client"
    PANEL = "panel"


class InterviewStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"
    RESCHEDULED = "rescheduled"


class InterviewRound(Base):
    __tablename__ = "interview_rounds"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    staffing_request_candidate_id: Mapped[int] = mapped_column(
        ForeignKey("staffing_request_candidates.id", ondelete="CASCADE"), index=True
    )
    round_number: Mapped[int] = mapped_column(Integer, default=1)
    interview_type: Mapped[InterviewType] = mapped_column(Enum(InterviewType))
    status: Mapped[InterviewStatus] = mapped_column(Enum(InterviewStatus), default=InterviewStatus.SCHEDULED)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=60)
    meeting_link: Mapped[str | None] = mapped_column(String(500), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_suggested_questions: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    request_candidate: Mapped["StaffingRequestCandidate"] = relationship()
    feedbacks: Mapped[list["InterviewFeedback"]] = relationship(
        back_populates="interview_round", cascade="all, delete-orphan"
    )


class InterviewResult(str, enum.Enum):
    STRONG_YES = "strong_yes"
    YES = "yes"
    NEUTRAL = "neutral"
    NO = "no"
    STRONG_NO = "strong_no"


class InterviewFeedback(Base):
    __tablename__ = "interview_feedbacks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    interview_round_id: Mapped[int] = mapped_column(
        ForeignKey("interview_rounds.id", ondelete="CASCADE"), index=True
    )
    interviewer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    result: Mapped[InterviewResult] = mapped_column(Enum(InterviewResult))
    technical_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    communication_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    cultural_fit_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    overall_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    strengths: Mapped[str | None] = mapped_column(Text, nullable=True)
    weaknesses: Mapped[str | None] = mapped_column(Text, nullable=True)
    comments: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    interview_round: Mapped["InterviewRound"] = relationship(back_populates="feedbacks")
    interviewer: Mapped["User"] = relationship()


from app.models.staffing_request import StaffingRequestCandidate  # noqa: E402
from app.models.user import User  # noqa: E402
