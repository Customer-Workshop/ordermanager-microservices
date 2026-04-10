from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.staffing_request import StaffingRequest
from app.models.candidate import Candidate, CandidateStatus
from app.models.location import Location
from app.models.practice_unit import PracticeUnit
from app.models.role import Role
from app.models.sla import SLATracking, SLAStatus
from app.models.rotation import RotationTracker

from app.schemas.dashboard import DashboardResponse, RequestStatusCount, LocationBreakdown, PracticeUnitBreakdown, SLASummary, RotationSummary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    # Request stats
    total_requests = db.query(func.count(StaffingRequest.id)).scalar() or 0
    total_candidates = db.query(func.count(Candidate.id)).scalar() or 0

    active_statuses = ["new", "sourcing", "shortlisted", "interviewing", "offer_pending"]
    total_active = db.query(func.count(StaffingRequest.id)).filter(
        StaffingRequest.status.in_(active_statuses)
    ).scalar() or 0

    total_onboarded = db.query(func.count(Candidate.id)).filter(
        Candidate.status == CandidateStatus.ACTIVE
    ).scalar() or 0

    # Status breakdown
    status_counts = db.query(
        StaffingRequest.status, func.count(StaffingRequest.id)
    ).group_by(StaffingRequest.status).all()
    request_status_breakdown = [
        RequestStatusCount(status=s.value if hasattr(s, "value") else str(s), count=c)
        for s, c in status_counts
    ]

    # Location breakdown
    location_data = db.query(Location).all()
    location_breakdown = []
    for loc in location_data:
        total = db.query(func.count(StaffingRequest.id)).filter(
            StaffingRequest.location_id == loc.id
        ).scalar() or 0
        fulfilled = db.query(func.count(StaffingRequest.id)).filter(
            StaffingRequest.location_id == loc.id, StaffingRequest.status == "fulfilled"
        ).scalar() or 0
        location_breakdown.append(LocationBreakdown(
            location_name=f"{loc.city}, {loc.state}",
            total_requests=total, fulfilled=fulfilled, in_progress=total - fulfilled,
        ))

    # Practice unit breakdown
    units = db.query(PracticeUnit).all()
    unit_breakdown = []
    for unit in units:
        role_ids = [r.id for r in db.query(Role.id).filter(Role.practice_unit_id == unit.id).all()]
        total_unit_requests = db.query(func.count(StaffingRequest.id)).filter(
            StaffingRequest.role_id.in_(role_ids)
        ).scalar() or 0 if role_ids else 0
        unit_breakdown.append(PracticeUnitBreakdown(
            unit_code=unit.code, unit_name=unit.name,
            total_requests=total_unit_requests, total_candidates=0,
            fulfillment_rate=0.0,
        ))

    # SLA summary
    sla_on_track = db.query(func.count(SLATracking.id)).filter(SLATracking.status == SLAStatus.ON_TRACK).scalar() or 0
    sla_at_risk = db.query(func.count(SLATracking.id)).filter(SLATracking.status == SLAStatus.AT_RISK).scalar() or 0
    sla_breached = db.query(func.count(SLATracking.id)).filter(SLATracking.status == SLAStatus.BREACHED).scalar() or 0
    sla_met = db.query(func.count(SLATracking.id)).filter(SLATracking.status == SLAStatus.MET).scalar() or 0

    # Rotation summary
    from datetime import date, timedelta
    today = date.today()
    rotation_active = db.query(func.count(RotationTracker.id)).filter(RotationTracker.status == "active").scalar() or 0
    due_30 = db.query(func.count(RotationTracker.id)).filter(
        RotationTracker.rotation_due_date <= today + timedelta(days=30),
        RotationTracker.rotation_due_date > today,
    ).scalar() or 0
    due_90 = db.query(func.count(RotationTracker.id)).filter(
        RotationTracker.rotation_due_date <= today + timedelta(days=90),
        RotationTracker.rotation_due_date > today,
    ).scalar() or 0
    due_180 = db.query(func.count(RotationTracker.id)).filter(
        RotationTracker.rotation_due_date <= today + timedelta(days=180),
        RotationTracker.rotation_due_date > today,
    ).scalar() or 0
    overdue = db.query(func.count(RotationTracker.id)).filter(
        RotationTracker.rotation_due_date < today,
        RotationTracker.status == "active",
    ).scalar() or 0

    return DashboardResponse(
        total_requests=total_requests,
        total_candidates=total_candidates,
        total_active_positions=total_active,
        total_onboarded=total_onboarded,
        request_status_breakdown=request_status_breakdown,
        location_breakdown=location_breakdown,
        practice_unit_breakdown=unit_breakdown,
        sla_summary=SLASummary(on_track=sla_on_track, at_risk=sla_at_risk, breached=sla_breached, met=sla_met),
        rotation_summary=RotationSummary(
            active=rotation_active, due_in_30_days=due_30, due_in_90_days=due_90,
            due_in_180_days=due_180, overdue=overdue,
        ),
    )
