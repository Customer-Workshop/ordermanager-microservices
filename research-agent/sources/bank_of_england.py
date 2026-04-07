"""Scraper for Bank of England data - base rate, monetary policy, statistics."""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass

from scraper import ScrapedPage, WebScraper

logger = logging.getLogger(__name__)


@dataclass
class BoEData:
    """Structured data extracted from the Bank of England."""

    base_rate: str | None = None
    last_decision_date: str | None = None
    policy_summary: str | None = None
    recent_news: list[dict[str, str]] | None = None
    rate_history_snippet: str | None = None
    raw_pages: list[ScrapedPage] | None = None


def scrape_bank_of_england(scraper: WebScraper) -> BoEData:
    """Scrape the Bank of England for monetary policy and rate data."""
    data = BoEData(recent_news=[], raw_pages=[])

    urls = [
        (
            "https://www.bankofengland.co.uk/monetary-policy-summary-and-minutes",
            "monetary_policy",
        ),
        (
            "https://www.bankofengland.co.uk/news",
            "news",
        ),
    ]

    for url, page_type in urls:
        page = scraper.scrape_url(url, "Bank of England", use_selenium=True)
        if page is None:
            logger.warning("Could not scrape BoE page: %s", url)
            continue

        if data.raw_pages is not None:
            data.raw_pages.append(page)

        if page_type == "monetary_policy":
            data.policy_summary = _extract_policy_summary(page)
            data.base_rate = _extract_base_rate(page)
        elif page_type == "news":
            data.recent_news = _extract_news_items(page)

    return data


def _extract_base_rate(page: ScrapedPage) -> str | None:
    """Try to extract the current base rate from the page text."""
    patterns = [
        r"Bank Rate (?:is |at |to )(\d+\.?\d*%)",
        r"base rate.*?(\d+\.?\d*%)",
        r"(\d+\.?\d*%)\s*(?:Bank Rate|base rate)",
        r"interest rate.*?(\d+\.?\d*%)",
    ]
    for pattern in patterns:
        match = re.search(pattern, page.text_content, re.IGNORECASE)
        if match:
            return match.group(1)
    return None


def _extract_policy_summary(page: ScrapedPage) -> str | None:
    """Extract the latest monetary policy summary text."""
    text = page.text_content
    if not text:
        return None
    # Return the first ~2000 chars which typically contain the summary
    return text[:2000] if len(text) > 2000 else text


def _extract_news_items(page: ScrapedPage) -> list[dict[str, str]]:
    """Extract recent news headlines and links."""
    items: list[dict[str, str]] = []
    for link in page.links[:20]:
        text = link.get("text", "").strip()
        href = link.get("href", "")
        if text and len(text) > 10:
            if not href.startswith("http"):
                href = f"https://www.bankofengland.co.uk{href}"
            items.append({"title": text, "url": href})
    return items
