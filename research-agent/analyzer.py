"""LLM-based analysis module using the Infosys AI Gateway (OpenAI-compatible)."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field

from openai import OpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from config import LLMConfig

logger = logging.getLogger(__name__)


@dataclass
class AnalysisResult:
    """Container for an LLM analysis result."""

    topic: str
    analysis: str
    key_findings: list[str] = field(default_factory=list)
    data_points: list[dict[str, str]] = field(default_factory=list)
    sources_used: list[str] = field(default_factory=list)


class ResearchAnalyzer:
    """Analyzes scraped data using the Infosys AI Gateway LLM."""

    def __init__(self, config: LLMConfig | None = None) -> None:
        self.config = config or LLMConfig()
        self._client = OpenAI(
            api_key=self.config.api_key,
            base_url=f"{self.config.api_base}/chat/completions".rsplit(
                "/chat/completions", 1
            )[0],
        )

    # ------------------------------------------------------------------
    # Public analysis methods
    # ------------------------------------------------------------------

    def analyze_base_rate_trends(
        self, scraped_content: str, source_names: list[str]
    ) -> AnalysisResult:
        """Analyze Bank of England base rate trends and monetary policy outlook."""
        prompt = (
            "You are a UK retail banking research analyst. Based on the following "
            "scraped content from official sources, provide a detailed analysis of:\n\n"
            "1. The current Bank of England base rate\n"
            "2. Recent MPC (Monetary Policy Committee) decisions\n"
            "3. Forward guidance and rate outlook\n"
            "4. Impact on savings rates for consumers\n\n"
            "Be specific with dates, figures, and data points. If certain data is not "
            "available in the content, note that clearly.\n\n"
            f"SCRAPED CONTENT:\n{scraped_content}\n\n"
            "Provide your analysis in a structured format with clear sections."
        )
        return self._run_analysis(
            "UK Base Rate Trends & Monetary Policy", prompt, source_names
        )

    def analyze_isa_products(
        self, scraped_content: str, source_names: list[str]
    ) -> AnalysisResult:
        """Analyze ISA savings products - rates, trends, and outlook."""
        prompt = (
            "You are a UK retail banking research analyst. Based on the following "
            "scraped content, provide a detailed analysis of Cash ISA products in "
            "the UK market:\n\n"
            "1. Current best Cash ISA rates (fixed and variable)\n"
            "2. Innovative Finance ISA and Lifetime ISA trends\n"
            "3. ISA allowance details and any recent/upcoming changes\n"
            "4. Comparison of ISA vs non-ISA rates\n"
            "5. Tax implications and the Personal Savings Allowance interaction\n"
            "6. Trends in ISA subscriptions and transfers\n"
            "7. Which providers are offering the most competitive ISA rates\n\n"
            "Be specific with rates, providers, and data points where available.\n\n"
            f"SCRAPED CONTENT:\n{scraped_content}\n\n"
            "Provide your analysis in a structured format with clear sections."
        )
        return self._run_analysis(
            "Cash ISA Products Analysis", prompt, source_names
        )

    def analyze_non_isa_savings(
        self, scraped_content: str, source_names: list[str]
    ) -> AnalysisResult:
        """Analyze non-ISA savings products across all types."""
        prompt = (
            "You are a UK retail banking research analyst. Based on the following "
            "scraped content, provide a detailed analysis of non-ISA savings products "
            "in the UK market:\n\n"
            "1. Easy access savings accounts - best rates and trends\n"
            "2. Fixed-term deposits / fixed-rate bonds - rates across different terms\n"
            "3. Notice accounts - rates and terms available\n"
            "4. Regular saver accounts - best rates and conditions\n"
            "5. Comparison between high-street banks and challenger banks\n"
            "6. Overall trend in savings rates (rising, falling, stable)\n"
            "7. Notable new product launches or changes\n\n"
            "Be specific with rates, providers, and terms where available.\n\n"
            f"SCRAPED CONTENT:\n{scraped_content}\n\n"
            "Provide your analysis in a structured format with clear sections."
        )
        return self._run_analysis(
            "Non-ISA Savings Products Analysis", prompt, source_names
        )

    def analyze_regulatory_landscape(
        self, scraped_content: str, source_names: list[str]
    ) -> AnalysisResult:
        """Analyze the regulatory environment for savings products."""
        prompt = (
            "You are a UK retail banking research analyst. Based on the following "
            "scraped content from the FCA and other regulatory sources, provide a "
            "detailed analysis of the regulatory landscape for UK savings:\n\n"
            "1. FCA Consumer Duty and its impact on savings products\n"
            "2. Cash savings market review findings\n"
            "3. Transparency and fair-value requirements for savings providers\n"
            "4. Any upcoming regulatory changes affecting savings\n"
            "5. Consumer protection measures for savers\n"
            "6. Regulatory stance on savings rate passthrough from base rate changes\n\n"
            "Be specific with regulatory references and dates where available.\n\n"
            f"SCRAPED CONTENT:\n{scraped_content}\n\n"
            "Provide your analysis in a structured format with clear sections."
        )
        return self._run_analysis(
            "Regulatory Landscape", prompt, source_names
        )

    def analyze_market_competition(
        self, scraped_content: str, source_names: list[str]
    ) -> AnalysisResult:
        """Analyze market competition in UK savings."""
        prompt = (
            "You are a UK retail banking research analyst. Based on the following "
            "scraped content, provide a detailed analysis of competition in the UK "
            "savings market:\n\n"
            "1. Traditional banks vs challenger banks vs building societies\n"
            "2. Key new entrants and their impact on the savings market\n"
            "3. Digital-only savings providers and their competitive positioning\n"
            "4. Open banking and its role in savings comparison / switching\n"
            "5. Savings platform aggregators and marketplace models\n"
            "6. International players entering the UK savings market\n"
            "7. Trends in customer acquisition and retention strategies\n\n"
            "Be specific with provider names and market data where available.\n\n"
            f"SCRAPED CONTENT:\n{scraped_content}\n\n"
            "Provide your analysis in a structured format with clear sections."
        )
        return self._run_analysis(
            "Market Competition & Digital Trends", prompt, source_names
        )

    def generate_executive_summary(
        self, all_analyses: list[AnalysisResult]
    ) -> str:
        """Generate an executive summary from all individual analyses."""
        combined = "\n\n---\n\n".join(
            f"## {a.topic}\n{a.analysis}" for a in all_analyses
        )

        prompt = (
            "You are a senior UK retail banking research analyst. Based on the "
            "following individual analyses, produce a concise EXECUTIVE SUMMARY "
            "(max 800 words) that captures:\n\n"
            "1. The overall state of the UK retail savings market\n"
            "2. Key trends and developments\n"
            "3. Most important data points\n"
            "4. Outlook and what to watch\n"
            "5. Key risks and opportunities for savings providers and consumers\n\n"
            "Write in a professional, report-ready style. Use bullet points for "
            "key highlights.\n\n"
            f"INDIVIDUAL ANALYSES:\n{combined}"
        )

        response = self._call_llm(prompt)
        return response

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _run_analysis(
        self,
        topic: str,
        prompt: str,
        source_names: list[str],
    ) -> AnalysisResult:
        """Run an LLM analysis and parse the result."""
        response_text = self._call_llm(prompt)

        # Extract key findings (lines that start with bullet-like markers)
        key_findings: list[str] = []
        for line in response_text.split("\n"):
            stripped = line.strip()
            if stripped.startswith(("-", "*", "•")) and len(stripped) > 10:
                key_findings.append(stripped.lstrip("-*• ").strip())

        return AnalysisResult(
            topic=topic,
            analysis=response_text,
            key_findings=key_findings[:10],
            sources_used=source_names,
        )

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=15),
    )
    def _call_llm(self, prompt: str) -> str:
        """Call the Infosys AI Gateway LLM endpoint."""
        logger.info("Calling LLM for analysis...")
        try:
            response = self._client.chat.completions.create(
                model=self.config.model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an expert UK retail banking analyst specialising "
                            "in savings products. Provide detailed, data-driven analysis "
                            "based on the content provided. Always cite specific figures, "
                            "rates, dates, and provider names when available. If data is "
                            "insufficient, clearly state what additional information would "
                            "be needed."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature,
            )
            content = response.choices[0].message.content
            return content if content else ""
        except Exception as e:
            logger.error("LLM call failed: %s", e)
            raise
