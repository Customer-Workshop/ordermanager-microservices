from datetime import datetime

from sqlalchemy import String, Text, DateTime, ForeignKey, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PracticeUnit(Base):
    __tablename__ = "practice_units"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)  # e.g., "ADM", "CIS"
    name: Mapped[str] = mapped_column(String(255))  # e.g., "Application Development & Maintenance"
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    anchors: Mapped[list["UnitAnchor"]] = relationship(back_populates="practice_unit", cascade="all, delete-orphan")


class UnitAnchor(Base):
    __tablename__ = "unit_anchors"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    practice_unit_id: Mapped[int] = mapped_column(
        ForeignKey("practice_units.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    practice_unit: Mapped["PracticeUnit"] = relationship(back_populates="anchors")
    user: Mapped["User"] = relationship()


from app.models.user import User  # noqa: E402
