from datetime import datetime
from pydantic import BaseModel

from app.models.location import LocationType


class LocationBase(BaseModel):
    name: str
    city: str
    state: str
    location_type: LocationType
    address: str | None = None
    capacity: int | None = None


class LocationCreate(LocationBase):
    pass


class LocationUpdate(BaseModel):
    name: str | None = None
    city: str | None = None
    state: str | None = None
    location_type: LocationType | None = None
    address: str | None = None
    capacity: int | None = None


class LocationResponse(LocationBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
