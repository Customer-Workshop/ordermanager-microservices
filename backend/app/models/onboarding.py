import enum
from datetime import datetime

from sqlalchemy import String, Text, Enum, DateTime, ForeignKey, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TaskCategory(str, enum.Enum):
    DOCUMENTATION = "documentation"
    IT_SETUP = "it_setup"
    ACCESS_PROVISIONING = "access_provisioning"
    TRAINING = "training"
    COMPLIANCE = "compliance"
    ORIENTATION = "orientation"
    OTHER = "other"


class OnboardingTask(Base):
    __tablename__ = "onboarding_tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    staffing_request_candidate_id: Mapped[int] = mapped_column(
        ForeignKey("staffing_request_candidates.id", ondelete="CASCADE"), index=True
    )
    task_name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[TaskCategory] = mapped_column(Enum(TaskCategory), default=TaskCategory.OTHER)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    assigned_to_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    request_candidate: Mapped["StaffingRequestCandidate"] = relationship()
    assigned_to: Mapped["User | None"] = relationship()


from app.models.staffing_request import StaffingRequestCandidate  # noqa: E402
from app.models.user import User  # noqa: E402
