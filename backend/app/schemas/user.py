from datetime import datetime
from pydantic import BaseModel, EmailStr

from app.models.user import PersonaType


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: str | None = None
    location_id: int | None = None


class UserCreate(UserBase):
    password: str | None = None
    sso_id: str | None = None
    personas: list[PersonaType] = []


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = None
    phone: str | None = None
    location_id: int | None = None
    is_active: bool | None = None


class UserPersonaResponse(BaseModel):
    id: int
    persona: PersonaType
    is_primary: bool

    model_config = {"from_attributes": True}


class UserResponse(UserBase):
    id: int
    is_active: bool
    sso_id: str | None = None
    created_at: datetime
    updated_at: datetime
    personas: list[UserPersonaResponse] = []

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: int | None = None
    email: str | None = None
