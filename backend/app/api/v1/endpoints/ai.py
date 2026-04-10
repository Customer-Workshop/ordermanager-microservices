from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.ai_service import ai_service

router = APIRouter(prefix="/ai", tags=["AI"])


class MatchRequest(BaseModel):
    candidate_summary: str
    role_description: str
    required_skills: list[str]


class ResumeParseRequest(BaseModel):
    resume_text: str


class InterviewQuestionsRequest(BaseModel):
    role_title: str
    candidate_skills: list[str]
    rubric_criteria: list[str] = []


class SemanticSearchRequest(BaseModel):
    query: str
    corpus: list[dict] = []


@router.post("/match-candidate")
async def match_candidate(data: MatchRequest):
    result = await ai_service.match_candidate_to_role(
        data.candidate_summary, data.role_description, data.required_skills
    )
    return result


@router.post("/parse-resume")
async def parse_resume(data: ResumeParseRequest):
    result = await ai_service.parse_resume(data.resume_text)
    return result


@router.post("/interview-questions")
async def generate_interview_questions(data: InterviewQuestionsRequest):
    result = await ai_service.generate_interview_questions(
        data.role_title, data.candidate_skills, data.rubric_criteria
    )
    return {"questions": result}


@router.post("/semantic-search")
async def semantic_search(data: SemanticSearchRequest):
    results = await ai_service.semantic_search(data.query, data.corpus)
    return {"results": results}
