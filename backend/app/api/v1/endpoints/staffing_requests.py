from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.staffing_request import StaffingRequest, StaffingRequestCandidate, CandidateStageStatus
from app.schemas.staffing_request import (
    StaffingRequestCreate, StaffingRequestUpdate, StaffingRequestResponse, ShortlistCandidateRequest,
)

router = APIRouter(prefix="/staffing-requests", tags=["Staffing Requests"])


@router.get("/", response_model=list[StaffingRequestResponse])
def list_requests(
    status_filter: str | None = None,
    location_id: int | None = None,
    priority: str | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    query = db.query(StaffingRequest)
    if status_filter:
        query = query.filter(StaffingRequest.status == status_filter)
    if location_id:
        query = query.filter(StaffingRequest.location_id == location_id)
    if priority:
        query = query.filter(StaffingRequest.priority == priority)
    return query.order_by(StaffingRequest.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{request_id}", response_model=StaffingRequestResponse)
def get_request(request_id: int, db: Session = Depends(get_db)):
    req = db.query(StaffingRequest).filter(StaffingRequest.id == request_id).first()
    if req is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staffing request not found")
    return req


@router.post("/", response_model=StaffingRequestResponse, status_code=status.HTTP_201_CREATED)
def create_request(data: StaffingRequestCreate, db: Session = Depends(get_db)):
    req = StaffingRequest(**data.model_dump())
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@router.put("/{request_id}", response_model=StaffingRequestResponse)
def update_request(request_id: int, data: StaffingRequestUpdate, db: Session = Depends(get_db)):
    req = db.query(StaffingRequest).filter(StaffingRequest.id == request_id).first()
    if req is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staffing request not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(req, field, value)
    db.commit()
    db.refresh(req)
    return req


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_request(request_id: int, db: Session = Depends(get_db)):
    req = db.query(StaffingRequest).filter(StaffingRequest.id == request_id).first()
    if req is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staffing request not found")
    db.delete(req)
    db.commit()


@router.post("/{request_id}/shortlist", status_code=status.HTTP_201_CREATED)
def shortlist_candidate(request_id: int, data: ShortlistCandidateRequest, db: Session = Depends(get_db)):
    req = db.query(StaffingRequest).filter(StaffingRequest.id == request_id).first()
    if req is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staffing request not found")
    existing = db.query(StaffingRequestCandidate).filter(
        StaffingRequestCandidate.staffing_request_id == request_id,
        StaffingRequestCandidate.candidate_id == data.candidate_id,
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Candidate already shortlisted")
    src = StaffingRequestCandidate(
        staffing_request_id=request_id,
        candidate_id=data.candidate_id,
        stage_status=CandidateStageStatus.SHORTLISTED,
        shortlisted_at=datetime.now(timezone.utc),
    )
    db.add(src)
    db.commit()
    db.refresh(src)
    return {"id": src.id, "message": "Candidate shortlisted"}
