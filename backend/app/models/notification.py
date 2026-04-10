import enum
from datetime import datetime

from sqlalchemy import String, Text, Enum, DateTime, ForeignKey, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class NotificationType(str, enum.Enum):
    SLA_WARNING = "sla_warning"
    SLA_BREACH = "sla_breach"
    NEW_REQUEST = "new_request"
    CANDIDATE_SHORTLISTED = "candidate_shortlisted"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    OFFER_SENT = "offer_sent"
    OFFER_RESPONSE = "offer_response"
    ONBOARDING_TASK = "onboarding_task"
    ROTATION_WARNING = "rotation_warning"
    GENERAL = "general"


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    notification_type: Mapped[NotificationType] = mapped_column(Enum(NotificationType))
    title: Mapped[str] = mapped_column(String(255))
    message: Mapped[str] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    link: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
