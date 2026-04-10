"""AI Service abstraction layer — provider-agnostic interface for Claude/Bedrock/OpenAI.

Supports:
- Candidate-role matching and scoring
- Resume parsing and skill extraction
- Interview question generation
- SLA risk prediction
- Semantic search across candidates, roles, and requests
"""

import json
import logging
from abc import ABC, abstractmethod

from app.config import settings

logger = logging.getLogger(__name__)


class AIProvider(ABC):
    """Abstract base class for AI providers."""

    @abstractmethod
    async def generate(self, prompt: str, system_prompt: str | None = None, max_tokens: int = 4096) -> str:
        pass

    @abstractmethod
    async def generate_embedding(self, text: str) -> list[float]:
        pass


class AnthropicProvider(AIProvider):
    """Direct Anthropic API provider."""

    def __init__(self) -> None:
        try:
            import anthropic
            self.client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
            self.model = settings.AI_MODEL
        except ImportError:
            logger.warning("anthropic package not installed; AI features disabled")
            self.client = None

    async def generate(self, prompt: str, system_prompt: str | None = None, max_tokens: int = 4096) -> str:
        if self.client is None:
            return self._fallback_response()
        messages = [{"role": "user", "content": prompt}]
        kwargs: dict = {"model": self.model, "max_tokens": max_tokens, "messages": messages}
        if system_prompt:
            kwargs["system"] = system_prompt
        response = await self.client.messages.create(**kwargs)
        return response.content[0].text

    async def generate_embedding(self, text: str) -> list[float]:
        # Anthropic doesn't natively support embeddings yet;
        # use a hash-based placeholder or integrate with a dedicated embedding model
        logger.info("Embedding generation via Anthropic — using placeholder")
        return self._placeholder_embedding(text)

    @staticmethod
    def _fallback_response() -> str:
        return json.dumps({"status": "ai_unavailable", "message": "AI provider not configured"})

    @staticmethod
    def _placeholder_embedding(text: str) -> list[float]:
        import hashlib
        h = hashlib.sha256(text.encode()).hexdigest()
        return [int(h[i:i+2], 16) / 255.0 for i in range(0, 64, 2)]


class BedrockProvider(AIProvider):
    """AWS Bedrock provider for Claude models."""

    def __init__(self) -> None:
        try:
            import boto3
            self.client = boto3.client("bedrock-runtime", region_name=settings.AWS_REGION)
            self.model_id = settings.BEDROCK_MODEL_ID
        except ImportError:
            logger.warning("boto3 package not installed; Bedrock AI features disabled")
            self.client = None

    async def generate(self, prompt: str, system_prompt: str | None = None, max_tokens: int = 4096) -> str:
        if self.client is None:
            return json.dumps({"status": "ai_unavailable", "message": "Bedrock not configured"})
        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        }
        if system_prompt:
            body["system"] = system_prompt
        response = self.client.invoke_model(modelId=self.model_id, body=json.dumps(body))
        result = json.loads(response["body"].read())
        return result["content"][0]["text"]

    async def generate_embedding(self, text: str) -> list[float]:
        logger.info("Embedding generation via Bedrock — using placeholder")
        return AnthropicProvider._placeholder_embedding(text)


def get_ai_provider() -> AIProvider:
    """Factory: returns the configured AI provider."""
    if settings.AI_PROVIDER == "bedrock":
        return BedrockProvider()
    return AnthropicProvider()


class AIService:
    """High-level AI service with domain-specific methods."""

    def __init__(self) -> None:
        self.provider = get_ai_provider()

    async def match_candidate_to_role(
        self, candidate_summary: str, role_description: str, required_skills: list[str]
    ) -> dict:
        system_prompt = (
            "You are an expert staffing AI. Evaluate candidate-role fit and return JSON with: "
            "score (0-100), explanation (string), strengths (list), gaps (list), recommendation (hire/maybe/pass)."
        )
        prompt = (
            f"Role: {role_description}\nRequired Skills: {', '.join(required_skills)}\n\n"
            f"Candidate: {candidate_summary}\n\nEvaluate fit and return JSON."
        )
        response = await self.provider.generate(prompt, system_prompt)
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {"score": 0, "explanation": response, "strengths": [], "gaps": [], "recommendation": "maybe"}

    async def parse_resume(self, resume_text: str) -> dict:
        system_prompt = (
            "Extract structured data from this resume. Return JSON with: "
            "name (string), skills (list of {name, proficiency_level 1-5, years}), "
            "total_years_experience (float), education (list), certifications (list)."
        )
        response = await self.provider.generate(resume_text, system_prompt)
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {"raw_text": response}

    async def generate_interview_questions(
        self, role_title: str, candidate_skills: list[str], rubric_criteria: list[str]
    ) -> list[str]:
        system_prompt = "Generate 10 targeted interview questions. Return as JSON array of strings."
        prompt = (
            f"Role: {role_title}\nCandidate Skills: {', '.join(candidate_skills)}\n"
            f"Rubric Criteria: {', '.join(rubric_criteria)}\n\nGenerate interview questions."
        )
        response = await self.provider.generate(prompt, system_prompt)
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return [response]

    async def predict_sla_risk(self, request_data: dict, historical_metrics: dict) -> dict:
        system_prompt = (
            "Predict SLA risk. Return JSON with: risk_score (0-100), risk_level (low/medium/high/critical), "
            "explanation (string), recommended_actions (list of strings)."
        )
        prompt = f"Request: {json.dumps(request_data)}\nHistory: {json.dumps(historical_metrics)}"
        response = await self.provider.generate(prompt, system_prompt)
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {"risk_score": 50, "risk_level": "medium", "explanation": response, "recommended_actions": []}

    async def semantic_search(self, query: str, corpus: list[dict]) -> list[dict]:
        """Semantic search across a corpus using AI-powered relevance scoring."""
        system_prompt = (
            "You are a semantic search engine. Given a query and a list of items, "
            "return a JSON array of objects with 'id' and 'relevance_score' (0-100), "
            "sorted by relevance descending. Only include items with score > 30."
        )
        prompt = f"Query: {query}\n\nItems:\n{json.dumps(corpus[:50])}"
        response = await self.provider.generate(prompt, system_prompt, max_tokens=2048)
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return []


ai_service = AIService()
