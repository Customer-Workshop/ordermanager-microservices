import enum
from datetime import datetime

from sqlalchemy import String, Enum, Integer, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class LocationType(str, enum.Enum):
    COMPANY = "company"
    CLIENT = "client"


class Location(Base):
    __tablename__ = "locations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    city: Mapped[str] = mapped_column(String(100))
    state: Mapped[str] = mapped_column(String(2))
    location_type: Mapped[LocationType] = mapped_column(Enum(LocationType))
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    capacity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
