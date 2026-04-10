from datetime import datetime
from pydantic import BaseModel


class RubricCriterionBase(BaseModel):
    name: str
    description: str | None = None
    max_score: float = 5.0
    weight: float = 1.0
    sort_order: int = 0


class RubricCriterionCreate(RubricCriterionBase):
    pass


class RubricCriterionResponse(RubricCriterionBase):
    id: int
    rubric_id: int

    model_config = {"from_attributes": True}


class RoleRubricBase(BaseModel):
    role_id: int
    title: str
    description: str | None = None
    document_url: str | None = None
    pass_band: str | None = None
    auto_reject_rule: str | None = None
    specialist_rule: str | None = None


class RoleRubricCreate(RoleRubricBase):
    criteria: list[RubricCriterionCreate] = []


class RoleRubricUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    document_url: str | None = None
    pass_band: str | None = None
    auto_reject_rule: str | None = None
    specialist_rule: str | None = None
    is_active: bool | None = None


class RoleRubricResponse(RoleRubricBase):
    id: int
    html_content: str | None = None
    version: int
    is_active: bool
    uploaded_by_id: int | None
    created_at: datetime
    updated_at: datetime
    criteria: list[RubricCriterionResponse] = []

    model_config = {"from_attributes": True}


class RubricRatingBase(BaseModel):
    criterion_id: int
    score: float
    notes: str | None = None


class RubricRatingCreate(RubricRatingBase):
    pass


class RubricRatingResponse(RubricRatingBase):
    id: int
    interview_feedback_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
