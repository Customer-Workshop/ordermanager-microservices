"""Scraper for FCA regulatory updates and guidance related to savings."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field

from scraper import ScrapedPage, WebScraper

logger = logging.getLogger(__name__)


@dataclass
class RegulatoryData:
    """Structured regulatory data from the FCA and related bodies."""

    recent_updates: list[dict[str, str]] = field(default_factory=list)
    consumer_duty_info: str | None = None
    savings_guidance: str | None = None
    raw_pages: list[ScrapedPage] = field(default_factory=list)


def scrape_fca(scraper: WebScraper) -> RegulatoryData:
    """Scrape the FCA for savings-related regulatory updates."""
    data = RegulatoryData()

    pages_to_scrape = [
        (
            "https://www.fca.org.uk/news/search?start=&end=&type=all&topic=savings-investments",
            "news",
        ),
        (
            "https://www.fca.org.uk/consumers/savings-accounts",
            "guidance",
        ),
        (
            "https://www.fca.org.uk/firms/consumer-duty",
            "consumer_duty",
        ),
    ]

    for url, page_type in pages_to_scrape:
        page = scraper.scrape_url(url, "FCA", use_selenium=True)
        if page is None:
            logger.warning("Could not scrape FCA page: %s", url)
            continue

        data.raw_pages.append(page)

        if page_type == "news":
            data.recent_updates = _extract_fca_updates(page)
        elif page_type == "guidance":
            data.savings_guidance = page.text_content[:3000]
        elif page_type == "consumer_duty":
            data.consumer_duty_info = page.text_content[:3000]

    return data


def _extract_fca_updates(page: ScrapedPage) -> list[dict[str, str]]:
    """Extract recent FCA news/updates from the search results page."""
    items: list[dict[str, str]] = []
    for link in page.links[:25]:
        text = link.get("text", "").strip()
        href = link.get("href", "")
        if text and len(text) > 15:
            if not href.startswith("http"):
                href = f"https://www.fca.org.uk{href}"
            items.append({"title": text, "url": href})
    return items
