from datetime import datetime, date
from pydantic import BaseModel

from app.models.staffing_request import RequestStatus, RequestPriority, CandidateStageStatus


class StaffingRequestBase(BaseModel):
    title: str
    description: str | None = None
    role_id: int
    location_id: int
    priority: RequestPriority = RequestPriority.MEDIUM
    number_of_positions: int = 1
    target_start_date: date | None = None
    deadline_date: date | None = None
    notes: str | None = None


class StaffingRequestCreate(StaffingRequestBase):
    wmt_reference_id: str | None = None
    requested_by_id: int | None = None
    assigned_recruiter_id: int | None = None


class StaffingRequestUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    role_id: int | None = None
    location_id: int | None = None
    status: RequestStatus | None = None
    priority: RequestPriority | None = None
    number_of_positions: int | None = None
    assigned_recruiter_id: int | None = None
    target_start_date: date | None = None
    deadline_date: date | None = None
    notes: str | None = None


class StaffingRequestCandidateResponse(BaseModel):
    id: int
    staffing_request_id: int
    candidate_id: int
    stage_status: CandidateStageStatus
    ai_match_score: float | None
    ai_match_explanation: str | None
    shortlisted_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class StaffingRequestResponse(StaffingRequestBase):
    id: int
    wmt_reference_id: str | None
    status: RequestStatus
    requested_by_id: int | None
    assigned_recruiter_id: int | None
    created_at: datetime
    updated_at: datetime
    candidates: list[StaffingRequestCandidateResponse] = []

    model_config = {"from_attributes": True}


class ShortlistCandidateRequest(BaseModel):
    candidate_id: int
    staffing_request_id: int
