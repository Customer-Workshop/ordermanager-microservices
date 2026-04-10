from datetime import datetime, date

from sqlalchemy import String, DateTime, Date, ForeignKey, Integer, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class HybridWorkAgreement(Base):
    __tablename__ = "hybrid_work_agreements"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    candidate_id: Mapped[int] = mapped_column(ForeignKey("candidates.id"), index=True)
    agreed: Mapped[bool] = mapped_column(Boolean, default=False)
    min_office_days_per_week: Mapped[int] = mapped_column(Integer, default=3)
    preferred_office_location_id: Mapped[int | None] = mapped_column(ForeignKey("locations.id"), nullable=True)
    agreement_signed_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    agreement_document_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    candidate: Mapped["Candidate"] = relationship()
    preferred_office_location: Mapped["Location | None"] = relationship()


from app.models.candidate import Candidate  # noqa: E402
from app.models.location import Location  # noqa: E402
