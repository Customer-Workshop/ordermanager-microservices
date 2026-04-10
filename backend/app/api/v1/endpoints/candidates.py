from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.candidate import Candidate, CandidateSkill
from app.schemas.candidate import CandidateCreate, CandidateUpdate, CandidateResponse

router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.get("/", response_model=list[CandidateResponse])
def list_candidates(
    status_filter: str | None = None,
    location_id: int | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    query = db.query(Candidate)
    if status_filter:
        query = query.filter(Candidate.status == status_filter)
    if location_id:
        query = query.filter(Candidate.preferred_location_id == location_id)
    return query.offset(skip).limit(limit).all()


@router.get("/{candidate_id}", response_model=CandidateResponse)
def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if candidate is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    return candidate


@router.post("/", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
def create_candidate(data: CandidateCreate, db: Session = Depends(get_db)):
    skills_data = data.skills
    candidate_data = data.model_dump(exclude={"skills"})
    candidate = Candidate(**candidate_data)
    for skill in skills_data:
        candidate.skills.append(CandidateSkill(**skill.model_dump()))
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return candidate


@router.put("/{candidate_id}", response_model=CandidateResponse)
def update_candidate(candidate_id: int, data: CandidateUpdate, db: Session = Depends(get_db)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if candidate is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(candidate, field, value)
    db.commit()
    db.refresh(candidate)
    return candidate


@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if candidate is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    db.delete(candidate)
    db.commit()
