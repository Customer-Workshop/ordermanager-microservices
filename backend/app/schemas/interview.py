from datetime import datetime
from pydantic import BaseModel

from app.models.interview import InterviewType, InterviewStatus, InterviewResult
from app.schemas.rubric import RubricRatingCreate, RubricRatingResponse


class InterviewRoundBase(BaseModel):
    staffing_request_candidate_id: int
    round_number: int = 1
    interview_type: InterviewType
    scheduled_at: datetime | None = None
    duration_minutes: int = 60
    meeting_link: str | None = None
    notes: str | None = None


class InterviewRoundCreate(InterviewRoundBase):
    pass


class InterviewRoundUpdate(BaseModel):
    status: InterviewStatus | None = None
    scheduled_at: datetime | None = None
    duration_minutes: int | None = None
    meeting_link: str | None = None
    notes: str | None = None


class InterviewFeedbackBase(BaseModel):
    interview_round_id: int
    interviewer_id: int
    result: InterviewResult
    technical_score: float | None = None
    communication_score: float | None = None
    cultural_fit_score: float | None = None
    overall_score: float | None = None
    strengths: str | None = None
    weaknesses: str | None = None
    comments: str | None = None


class InterviewFeedbackCreate(InterviewFeedbackBase):
    rubric_ratings: list[RubricRatingCreate] = []


class InterviewFeedbackResponse(InterviewFeedbackBase):
    id: int
    created_at: datetime
    rubric_ratings: list[RubricRatingResponse] = []

    model_config = {"from_attributes": True}


class InterviewRoundResponse(InterviewRoundBase):
    id: int
    status: InterviewStatus
    ai_suggested_questions: str | None
    created_at: datetime
    feedbacks: list[InterviewFeedbackResponse] = []

    model_config = {"from_attributes": True}
