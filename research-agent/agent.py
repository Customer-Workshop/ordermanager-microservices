"""Main research agent orchestrator.

Coordinates the scraping, analysis, and report-generation pipeline for
UK retail banking and cash-savings research.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field

from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn

from analyzer import AnalysisResult, ResearchAnalyzer
from config import LLMConfig, OutputConfig, ScraperConfig
from report_generator import ReportGenerator
from scraper import ScrapedPage, WebScraper
from sources.bank_of_england import BoEData, scrape_bank_of_england
from sources.industry import IndustryData, scrape_bsa, scrape_uk_finance
from sources.news import NewsData, scrape_bbc_business, scrape_ft_banking
from sources.regulatory import RegulatoryData, scrape_fca
from sources.savings_rates import (
    SavingsRateData,
    scrape_moneyfacts,
    scrape_savings_champion,
)

logger = logging.getLogger(__name__)
console = Console()


@dataclass
class ResearchData:
    """Container for all scraped research data."""

    boe_data: BoEData | None = None
    moneyfacts_data: SavingsRateData | None = None
    savings_champion_data: SavingsRateData | None = None
    regulatory_data: RegulatoryData | None = None
    uk_finance_data: IndustryData | None = None
    bsa_data: IndustryData | None = None
    bbc_news: NewsData | None = None
    ft_news: NewsData | None = None
    all_pages: list[ScrapedPage] = field(default_factory=list)


class ResearchAgent:
    """Orchestrates the full research pipeline."""

    def __init__(
        self,
        llm_config: LLMConfig | None = None,
        scraper_config: ScraperConfig | None = None,
        output_config: OutputConfig | None = None,
    ) -> None:
        self.llm_config = llm_config or LLMConfig()
        self.scraper_config = scraper_config or ScraperConfig()
        self.output_config = output_config or OutputConfig()

        self.scraper = WebScraper(self.scraper_config)
        self.analyzer = ResearchAnalyzer(self.llm_config)
        self.report_generator = ReportGenerator(self.output_config)

    def run(self) -> str:
        """Execute the full research pipeline and return the report path."""
        console.print(
            Panel(
                "[bold blue]UK Retail Banking Research Agent[/bold blue]\n"
                "Researching cash savings products (ISA & non-ISA) in the UK market",
                title="Starting Research",
                border_style="blue",
            )
        )

        try:
            # Phase 1: Scrape data
            research_data = self._scrape_all_sources()

            # Phase 2: Analyse data
            analyses = self._analyse_data(research_data)

            # Phase 3: Generate executive summary
            console.print("\n[bold yellow]Generating executive summary...[/bold yellow]")
            executive_summary = self.analyzer.generate_executive_summary(analyses)

            # Phase 4: Generate report
            console.print("\n[bold yellow]Generating report...[/bold yellow]")
            metadata = {
                "sources_scraped": len(
                    {p.source_name for p in research_data.all_pages}
                ),
                "pages_analysed": len(research_data.all_pages),
            }
            report_path = self.report_generator.generate_report(
                executive_summary, analyses, metadata
            )

            console.print(
                Panel(
                    f"[bold green]Report generated successfully![/bold green]\n"
                    f"Output: {report_path}",
                    title="Research Complete",
                    border_style="green",
                )
            )
            return report_path

        finally:
            self.scraper.close()

    # ------------------------------------------------------------------
    # Phase 1 – Scraping
    # ------------------------------------------------------------------

    def _scrape_all_sources(self) -> ResearchData:
        """Scrape all configured data sources."""
        data = ResearchData()

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            # Bank of England
            task = progress.add_task("Scraping Bank of England...", total=None)
            try:
                data.boe_data = scrape_bank_of_england(self.scraper)
                if data.boe_data.raw_pages:
                    data.all_pages.extend(data.boe_data.raw_pages)
                progress.update(task, description="[green]Bank of England ✓")
            except Exception as e:
                logger.error("Failed to scrape BoE: %s", e)
                progress.update(task, description="[red]Bank of England ✗")

            # Moneyfacts
            task = progress.add_task("Scraping Moneyfacts...", total=None)
            try:
                data.moneyfacts_data = scrape_moneyfacts(self.scraper)
                data.all_pages.extend(data.moneyfacts_data.raw_pages)
                progress.update(task, description="[green]Moneyfacts ✓")
            except Exception as e:
                logger.error("Failed to scrape Moneyfacts: %s", e)
                progress.update(task, description="[red]Moneyfacts ✗")

            # Savings Champion
            task = progress.add_task("Scraping Savings Champion...", total=None)
            try:
                data.savings_champion_data = scrape_savings_champion(self.scraper)
                data.all_pages.extend(data.savings_champion_data.raw_pages)
                progress.update(task, description="[green]Savings Champion ✓")
            except Exception as e:
                logger.error("Failed to scrape Savings Champion: %s", e)
                progress.update(task, description="[red]Savings Champion ✗")

            # FCA Regulatory
            task = progress.add_task("Scraping FCA...", total=None)
            try:
                data.regulatory_data = scrape_fca(self.scraper)
                data.all_pages.extend(data.regulatory_data.raw_pages)
                progress.update(task, description="[green]FCA ✓")
            except Exception as e:
                logger.error("Failed to scrape FCA: %s", e)
                progress.update(task, description="[red]FCA ✗")

            # UK Finance
            task = progress.add_task("Scraping UK Finance...", total=None)
            try:
                data.uk_finance_data = scrape_uk_finance(self.scraper)
                data.all_pages.extend(data.uk_finance_data.raw_pages)
                progress.update(task, description="[green]UK Finance ✓")
            except Exception as e:
                logger.error("Failed to scrape UK Finance: %s", e)
                progress.update(task, description="[red]UK Finance ✗")

            # BSA
            task = progress.add_task("Scraping BSA...", total=None)
            try:
                data.bsa_data = scrape_bsa(self.scraper)
                data.all_pages.extend(data.bsa_data.raw_pages)
                progress.update(task, description="[green]BSA ✓")
            except Exception as e:
                logger.error("Failed to scrape BSA: %s", e)
                progress.update(task, description="[red]BSA ✗")

            # BBC Business
            task = progress.add_task("Scraping BBC Business...", total=None)
            try:
                data.bbc_news = scrape_bbc_business(self.scraper)
                data.all_pages.extend(data.bbc_news.raw_pages)
                progress.update(task, description="[green]BBC Business ✓")
            except Exception as e:
                logger.error("Failed to scrape BBC: %s", e)
                progress.update(task, description="[red]BBC Business ✗")

            # Financial Times
            task = progress.add_task("Scraping Financial Times...", total=None)
            try:
                data.ft_news = scrape_ft_banking(self.scraper)
                data.all_pages.extend(data.ft_news.raw_pages)
                progress.update(task, description="[green]Financial Times ✓")
            except Exception as e:
                logger.error("Failed to scrape FT: %s", e)
                progress.update(task, description="[red]Financial Times ✗")

        console.print(
            f"\n[bold]Scraped {len(data.all_pages)} pages from "
            f"{len({p.source_name for p in data.all_pages})} sources[/bold]\n"
        )
        return data

    # ------------------------------------------------------------------
    # Phase 2 – Analysis
    # ------------------------------------------------------------------

    def _analyse_data(self, data: ResearchData) -> list[AnalysisResult]:
        """Run LLM-based analysis on all collected data."""
        analyses: list[AnalysisResult] = []

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            # 1. Base rate trends
            task = progress.add_task("Analysing base rate trends...", total=None)
            try:
                content = self._gather_content_for_topic(data, "monetary_policy")
                if content:
                    result = self.analyzer.analyze_base_rate_trends(
                        content, ["Bank of England"]
                    )
                    analyses.append(result)
                progress.update(task, description="[green]Base rate analysis ✓")
            except Exception as e:
                logger.error("Base rate analysis failed: %s", e)
                progress.update(task, description="[red]Base rate analysis ✗")

            # 2. ISA products
            task = progress.add_task("Analysing ISA products...", total=None)
            try:
                content = self._gather_content_for_topic(data, "isa")
                if content:
                    result = self.analyzer.analyze_isa_products(
                        content, ["Moneyfacts", "Savings Champion"]
                    )
                    analyses.append(result)
                progress.update(task, description="[green]ISA analysis ✓")
            except Exception as e:
                logger.error("ISA analysis failed: %s", e)
                progress.update(task, description="[red]ISA analysis ✗")

            # 3. Non-ISA savings
            task = progress.add_task(
                "Analysing non-ISA savings...", total=None
            )
            try:
                content = self._gather_content_for_topic(data, "non_isa")
                if content:
                    result = self.analyzer.analyze_non_isa_savings(
                        content, ["Moneyfacts", "Savings Champion"]
                    )
                    analyses.append(result)
                progress.update(task, description="[green]Non-ISA analysis ✓")
            except Exception as e:
                logger.error("Non-ISA analysis failed: %s", e)
                progress.update(task, description="[red]Non-ISA analysis ✗")

            # 4. Regulatory landscape
            task = progress.add_task(
                "Analysing regulatory landscape...", total=None
            )
            try:
                content = self._gather_content_for_topic(data, "regulatory")
                if content:
                    result = self.analyzer.analyze_regulatory_landscape(
                        content, ["FCA"]
                    )
                    analyses.append(result)
                progress.update(
                    task, description="[green]Regulatory analysis ✓"
                )
            except Exception as e:
                logger.error("Regulatory analysis failed: %s", e)
                progress.update(
                    task, description="[red]Regulatory analysis ✗"
                )

            # 5. Market competition & digital trends
            task = progress.add_task(
                "Analysing market competition...", total=None
            )
            try:
                content = self._gather_content_for_topic(data, "competition")
                if content:
                    result = self.analyzer.analyze_market_competition(
                        content,
                        [
                            "UK Finance",
                            "BSA",
                            "BBC Business",
                            "Financial Times",
                        ],
                    )
                    analyses.append(result)
                progress.update(
                    task, description="[green]Competition analysis ✓"
                )
            except Exception as e:
                logger.error("Competition analysis failed: %s", e)
                progress.update(
                    task, description="[red]Competition analysis ✗"
                )

        return analyses

    # ------------------------------------------------------------------
    # Data-gathering helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _gather_content_for_topic(
        data: ResearchData, topic: str
    ) -> str:
        """Collect relevant scraped text for a given analysis topic."""
        parts: list[str] = []

        if topic == "monetary_policy":
            if data.boe_data and data.boe_data.raw_pages:
                for page in data.boe_data.raw_pages:
                    parts.append(
                        f"### {page.source_name} - {page.title}\n"
                        f"{page.text_content}\n"
                    )
            # Also include relevant news headlines
            if data.bbc_news and data.bbc_news.headlines:
                parts.append("### Recent BBC Headlines\n")
                for h in data.bbc_news.headlines[:10]:
                    parts.append(f"- {h['title']}")

        elif topic == "isa":
            if data.moneyfacts_data:
                for page in data.moneyfacts_data.raw_pages:
                    if "isa" in page.url.lower():
                        parts.append(
                            f"### {page.source_name} - {page.title}\n"
                            f"{page.text_content}\n"
                        )
                if data.moneyfacts_data.isa_rates:
                    parts.append("### Extracted ISA Rates\n")
                    for r in data.moneyfacts_data.isa_rates:
                        parts.append(f"- {r['provider']}: {r['rate']}")
            if data.savings_champion_data:
                for page in data.savings_champion_data.raw_pages:
                    parts.append(
                        f"### {page.source_name} - {page.title}\n"
                        f"{page.text_content}\n"
                    )

        elif topic == "non_isa":
            if data.moneyfacts_data:
                for page in data.moneyfacts_data.raw_pages:
                    if "isa" not in page.url.lower():
                        parts.append(
                            f"### {page.source_name} - {page.title}\n"
                            f"{page.text_content}\n"
                        )
                if data.moneyfacts_data.easy_access_rates:
                    parts.append("### Extracted Easy Access Rates\n")
                    for r in data.moneyfacts_data.easy_access_rates:
                        parts.append(f"- {r['provider']}: {r['rate']}")
                if data.moneyfacts_data.fixed_rate_bonds:
                    parts.append("### Extracted Fixed Rate Bond Rates\n")
                    for r in data.moneyfacts_data.fixed_rate_bonds:
                        parts.append(f"- {r['provider']}: {r['rate']}")
                if data.moneyfacts_data.notice_accounts:
                    parts.append("### Extracted Notice Account Rates\n")
                    for r in data.moneyfacts_data.notice_accounts:
                        parts.append(f"- {r['provider']}: {r['rate']}")
                if data.moneyfacts_data.regular_savers:
                    parts.append("### Extracted Regular Saver Rates\n")
                    for r in data.moneyfacts_data.regular_savers:
                        parts.append(f"- {r['provider']}: {r['rate']}")

        elif topic == "regulatory":
            if data.regulatory_data:
                for page in data.regulatory_data.raw_pages:
                    parts.append(
                        f"### {page.source_name} - {page.title}\n"
                        f"{page.text_content}\n"
                    )
                if data.regulatory_data.recent_updates:
                    parts.append("### Recent FCA Updates\n")
                    for u in data.regulatory_data.recent_updates:
                        parts.append(f"- [{u['title']}]({u['url']})")

        elif topic == "competition":
            if data.uk_finance_data:
                for page in data.uk_finance_data.raw_pages:
                    parts.append(
                        f"### {page.source_name} - {page.title}\n"
                        f"{page.text_content}\n"
                    )
            if data.bsa_data:
                for page in data.bsa_data.raw_pages:
                    parts.append(
                        f"### {page.source_name} - {page.title}\n"
                        f"{page.text_content}\n"
                    )
            if data.bbc_news and data.bbc_news.headlines:
                parts.append("### BBC Business Headlines\n")
                for h in data.bbc_news.headlines[:10]:
                    parts.append(f"- {h['title']}")
            if data.ft_news and data.ft_news.headlines:
                parts.append("### FT Headlines\n")
                for h in data.ft_news.headlines[:10]:
                    parts.append(f"- {h['title']}")

        combined = "\n".join(parts)
        # Truncate to stay within LLM context limits
        if len(combined) > 30_000:
            combined = combined[:30_000] + "\n\n... [content truncated]"
        return combined
