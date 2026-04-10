import enum
from datetime import datetime, date

from sqlalchemy import String, Text, Enum, DateTime, Date, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class RotationStatus(str, enum.Enum):
    ACTIVE = "active"
    REPLACEMENT_NEEDED = "replacement_needed"
    REPLACEMENT_IN_PROGRESS = "replacement_in_progress"
    KT_IN_PROGRESS = "kt_in_progress"
    ROTATED = "rotated"
    EXTENDED = "extended"


class RotationTracker(Base):
    __tablename__ = "rotation_tracker"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    candidate_id: Mapped[int] = mapped_column(ForeignKey("candidates.id"), index=True)
    staffing_request_id: Mapped[int] = mapped_column(ForeignKey("staffing_requests.id"), index=True)
    start_date: Mapped[date] = mapped_column(Date)
    rotation_due_date: Mapped[date] = mapped_column(Date)
    status: Mapped[RotationStatus] = mapped_column(Enum(RotationStatus), default=RotationStatus.ACTIVE)
    replacement_candidate_id: Mapped[int | None] = mapped_column(ForeignKey("candidates.id"), nullable=True)
    kt_plan: Mapped[str | None] = mapped_column(Text, nullable=True)
    kt_start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    kt_end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    actual_rotation_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    candidate: Mapped["Candidate"] = relationship(foreign_keys=[candidate_id])
    replacement_candidate: Mapped["Candidate | None"] = relationship(foreign_keys=[replacement_candidate_id])
    staffing_request: Mapped["StaffingRequest"] = relationship()


from app.models.candidate import Candidate  # noqa: E402
from app.models.staffing_request import StaffingRequest  # noqa: E402
