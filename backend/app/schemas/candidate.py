from datetime import datetime
from pydantic import BaseModel, EmailStr

from app.models.candidate import CandidateStatus


class CandidateSkillBase(BaseModel):
    skill_name: str
    proficiency_level: int = 3
    years_of_experience: float = 0.0


class CandidateSkillCreate(CandidateSkillBase):
    pass


class CandidateSkillResponse(CandidateSkillBase):
    id: int
    candidate_id: int

    model_config = {"from_attributes": True}


class CandidateBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None = None
    current_location_city: str | None = None
    current_location_state: str | None = None
    preferred_location_id: int | None = None
    years_of_experience: float = 0.0
    notice_period_days: int = 0


class CandidateCreate(CandidateBase):
    skills: list[CandidateSkillCreate] = []


class CandidateUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    status: CandidateStatus | None = None
    current_location_city: str | None = None
    current_location_state: str | None = None
    preferred_location_id: int | None = None
    years_of_experience: float | None = None
    notice_period_days: int | None = None


class CandidateResponse(CandidateBase):
    id: int
    status: CandidateStatus
    resume_url: str | None = None
    ai_match_score: float | None = None
    ai_match_explanation: str | None = None
    created_at: datetime
    updated_at: datetime
    skills: list[CandidateSkillResponse] = []

    model_config = {"from_attributes": True}
