from pydantic import BaseModel


class RequestStatusCount(BaseModel):
    status: str
    count: int


class LocationBreakdown(BaseModel):
    location_name: str
    total_requests: int
    fulfilled: int
    in_progress: int


class PracticeUnitBreakdown(BaseModel):
    unit_code: str
    unit_name: str
    total_requests: int
    total_candidates: int
    fulfillment_rate: float


class SLASummary(BaseModel):
    on_track: int
    at_risk: int
    breached: int
    met: int


class RotationSummary(BaseModel):
    active: int
    due_in_30_days: int
    due_in_90_days: int
    due_in_180_days: int
    overdue: int


class DashboardResponse(BaseModel):
    total_requests: int
    total_candidates: int
    total_active_positions: int
    total_onboarded: int
    request_status_breakdown: list[RequestStatusCount]
    location_breakdown: list[LocationBreakdown]
    practice_unit_breakdown: list[PracticeUnitBreakdown]
    sla_summary: SLASummary
    rotation_summary: RotationSummary
