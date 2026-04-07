#!/usr/bin/env python3
"""CLI entry point for the UK Retail Banking Research Agent.

Usage
-----
    # Run with default settings (reads config from .env or environment)
    python main.py

    # Override the LLM model
    python main.py --model gpt-4o-mini

    # Specify a custom output directory
    python main.py --output-dir ./reports

    # Use Selenium for all scraping (slower but handles JS-heavy pages)
    python main.py --selenium-only

    # Dry-run mode: scrape only, skip LLM analysis
    python main.py --scrape-only
"""

from __future__ import annotations

import argparse
import logging
import os
import sys

from rich.console import Console
from rich.logging import RichHandler

from agent import ResearchAgent
from config import LLMConfig, OutputConfig, ScraperConfig

console = Console()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="UK Retail Banking Research Agent - "
        "Gathers and analyses the latest information on UK cash savings products"
    )
    parser.add_argument(
        "--model",
        default=None,
        help="Override the LLM model name (default: from env or gpt-4o)",
    )
    parser.add_argument(
        "--api-key",
        default=None,
        help="Override the Infosys AI Gateway API key (default: from env)",
    )
    parser.add_argument(
        "--api-base",
        default=None,
        help="Override the API base URL",
    )
    parser.add_argument(
        "--output-dir",
        default=None,
        help="Directory for the generated report (default: ./output)",
    )
    parser.add_argument(
        "--scrape-only",
        action="store_true",
        help="Only scrape data - skip LLM analysis (useful for testing)",
    )
    parser.add_argument(
        "--selenium-only",
        action="store_true",
        help="Force Selenium for all scraping",
    )
    parser.add_argument(
        "--no-headless",
        action="store_true",
        help="Run browser in visible mode (for debugging)",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Enable verbose logging",
    )
    return parser.parse_args()


def setup_logging(verbose: bool = False) -> None:
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(message)s",
        datefmt="[%X]",
        handlers=[RichHandler(console=console, rich_tracebacks=True)],
    )


def main() -> None:
    args = parse_args()
    setup_logging(args.verbose)

    # Build configuration, applying CLI overrides
    llm_config = LLMConfig()
    if args.api_key:
        llm_config.api_key = args.api_key
    if args.api_base:
        llm_config.api_base = args.api_base
    if args.model:
        llm_config.model = args.model

    scraper_config = ScraperConfig()
    if args.no_headless:
        scraper_config.headless = False

    output_config = OutputConfig()
    if args.output_dir:
        output_config.output_dir = args.output_dir

    # Validate API key
    if not llm_config.api_key and not args.scrape_only:
        console.print(
            "[bold red]Error:[/bold red] No API key configured. "
            "Set INFOSYS_API_KEY in your environment or .env file, "
            "or pass --api-key, or use --scrape-only to skip analysis."
        )
        sys.exit(1)

    # Run the agent
    agent = ResearchAgent(
        llm_config=llm_config,
        scraper_config=scraper_config,
        output_config=output_config,
    )

    if args.scrape_only:
        console.print("[bold yellow]Running in scrape-only mode[/bold yellow]")
        from scraper import WebScraper

        scraper = WebScraper(scraper_config)
        try:
            data = agent._scrape_all_sources()
            console.print(
                f"\n[bold green]Scraping complete![/bold green] "
                f"Collected {len(data.all_pages)} pages."
            )
            for page in data.all_pages:
                console.print(
                    f"  - {page.source_name}: {page.title} "
                    f"({len(page.text_content)} chars)"
                )
        finally:
            scraper.close()
    else:
        report_path = agent.run()
        console.print(
            f"\n[bold green]Research complete![/bold green]\n"
            f"Report saved to: [link=file://{os.path.abspath(report_path)}]"
            f"{report_path}[/link]"
        )


if __name__ == "__main__":
    main()
