from datetime import datetime
from pydantic import BaseModel


class PracticeUnitBase(BaseModel):
    code: str
    name: str
    description: str | None = None
    is_active: bool = True


class PracticeUnitCreate(PracticeUnitBase):
    pass


class PracticeUnitUpdate(BaseModel):
    code: str | None = None
    name: str | None = None
    description: str | None = None
    is_active: bool | None = None


class PracticeUnitResponse(PracticeUnitBase):
    id: int
    created_at: datetime
    updated_at: datetime
    anchors: list["UnitAnchorResponse"] = []

    model_config = {"from_attributes": True}


class UnitAnchorBase(BaseModel):
    practice_unit_id: int
    user_id: int
    is_primary: bool = False


class UnitAnchorCreate(UnitAnchorBase):
    pass


class UnitAnchorResponse(BaseModel):
    id: int
    practice_unit_id: int
    user_id: int
    is_primary: bool
    created_at: datetime

    model_config = {"from_attributes": True}
