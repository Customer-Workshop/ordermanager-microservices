from datetime import datetime
from pydantic import BaseModel

from app.models.role import RoleCategory, ExperienceLevel


class RoleSkillBase(BaseModel):
    skill_name: str
    is_mandatory: bool = True
    proficiency_level: int = 3


class RoleSkillCreate(RoleSkillBase):
    pass


class RoleSkillResponse(RoleSkillBase):
    id: int
    role_id: int

    model_config = {"from_attributes": True}


class RoleBase(BaseModel):
    title: str
    category: RoleCategory
    experience_level: ExperienceLevel
    description: str | None = None
    min_years_experience: int = 0
    practice_unit_id: int | None = None
    clearance_required: str | None = None


class RoleCreate(RoleBase):
    required_skills: list[RoleSkillCreate] = []


class RoleUpdate(BaseModel):
    title: str | None = None
    category: RoleCategory | None = None
    experience_level: ExperienceLevel | None = None
    description: str | None = None
    min_years_experience: int | None = None
    practice_unit_id: int | None = None
    clearance_required: str | None = None


class RoleResponse(RoleBase):
    id: int
    created_at: datetime
    required_skills: list[RoleSkillResponse] = []

    model_config = {"from_attributes": True}
