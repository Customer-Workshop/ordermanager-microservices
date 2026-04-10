from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.interview import InterviewRound, InterviewFeedback
from app.models.rubric import RubricRating
from app.schemas.interview import (
    InterviewRoundCreate, InterviewRoundUpdate, InterviewRoundResponse,
    InterviewFeedbackCreate, InterviewFeedbackResponse,
)

router = APIRouter(prefix="/interviews", tags=["Interviews"])


@router.get("/", response_model=list[InterviewRoundResponse])
def list_interviews(
    staffing_request_candidate_id: int | None = None,
    status_filter: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(InterviewRound)
    if staffing_request_candidate_id:
        query = query.filter(InterviewRound.staffing_request_candidate_id == staffing_request_candidate_id)
    if status_filter:
        query = query.filter(InterviewRound.status == status_filter)
    return query.all()


@router.get("/{interview_id}", response_model=InterviewRoundResponse)
def get_interview(interview_id: int, db: Session = Depends(get_db)):
    interview = db.query(InterviewRound).filter(InterviewRound.id == interview_id).first()
    if interview is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    return interview


@router.post("/", response_model=InterviewRoundResponse, status_code=status.HTTP_201_CREATED)
def create_interview(data: InterviewRoundCreate, db: Session = Depends(get_db)):
    interview = InterviewRound(**data.model_dump())
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return interview


@router.put("/{interview_id}", response_model=InterviewRoundResponse)
def update_interview(interview_id: int, data: InterviewRoundUpdate, db: Session = Depends(get_db)):
    interview = db.query(InterviewRound).filter(InterviewRound.id == interview_id).first()
    if interview is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(interview, field, value)
    db.commit()
    db.refresh(interview)
    return interview


# --- Interview Feedback with Rubric Ratings ---

@router.post("/{interview_id}/feedback", response_model=InterviewFeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(interview_id: int, data: InterviewFeedbackCreate, db: Session = Depends(get_db)):
    interview = db.query(InterviewRound).filter(InterviewRound.id == interview_id).first()
    if interview is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")

    rubric_ratings_data = data.rubric_ratings
    feedback_data = data.model_dump(exclude={"rubric_ratings"})
    feedback_data["interview_round_id"] = interview_id
    feedback = InterviewFeedback(**feedback_data)
    db.add(feedback)
    db.flush()

    for rating_data in rubric_ratings_data:
        rating = RubricRating(
            interview_feedback_id=feedback.id,
            criterion_id=rating_data.criterion_id,
            score=rating_data.score,
            notes=rating_data.notes,
        )
        db.add(rating)

    db.commit()
    db.refresh(feedback)
    return feedback
