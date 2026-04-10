import enum
from datetime import datetime, date

from sqlalchemy import String, Text, Enum, DateTime, Date, ForeignKey, Float, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class OfferStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    SENT = "sent"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    WITHDRAWN = "withdrawn"
    EXPIRED = "expired"


class Offer(Base):
    __tablename__ = "offers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    staffing_request_candidate_id: Mapped[int] = mapped_column(
        ForeignKey("staffing_request_candidates.id", ondelete="CASCADE"), index=True
    )
    status: Mapped[OfferStatus] = mapped_column(Enum(OfferStatus), default=OfferStatus.DRAFT)
    compensation_details: Mapped[str | None] = mapped_column(Text, nullable=True)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    expiry_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    offer_letter_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    approved_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    decline_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    request_candidate: Mapped["StaffingRequestCandidate"] = relationship()
    approved_by: Mapped["User | None"] = relationship()


from app.models.staffing_request import StaffingRequestCandidate  # noqa: E402
from app.models.user import User  # noqa: E402
