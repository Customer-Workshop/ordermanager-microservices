"""Scraper for industry bodies - UK Finance, BSA, and trade publications."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field

from scraper import ScrapedPage, WebScraper

logger = logging.getLogger(__name__)


@dataclass
class IndustryData:
    """Structured data from UK banking industry bodies."""

    uk_finance_insights: list[dict[str, str]] = field(default_factory=list)
    bsa_statistics: str | None = None
    bsa_press_releases: list[dict[str, str]] = field(default_factory=list)
    raw_pages: list[ScrapedPage] = field(default_factory=list)


def scrape_uk_finance(scraper: WebScraper) -> IndustryData:
    """Scrape UK Finance for industry insights and data."""
    data = IndustryData()

    pages_to_scrape = [
        ("https://www.ukfinance.org.uk/news-and-insight", "insights"),
        ("https://www.ukfinance.org.uk/data-and-research", "data"),
    ]

    for url, page_type in pages_to_scrape:
        page = scraper.scrape_url(url, "UK Finance", use_selenium=True)
        if page is None:
            logger.warning("Could not scrape UK Finance page: %s", url)
            continue

        data.raw_pages.append(page)

        if page_type == "insights":
            data.uk_finance_insights = _extract_insights(page)

    return data


def scrape_bsa(scraper: WebScraper) -> IndustryData:
    """Scrape the Building Societies Association for savings data."""
    data = IndustryData()

    pages_to_scrape = [
        ("https://www.bsa.org.uk/statistics", "stats"),
        ("https://www.bsa.org.uk/media-centre/press-releases", "press"),
    ]

    for url, page_type in pages_to_scrape:
        page = scraper.scrape_url(url, "BSA", use_selenium=True)
        if page is None:
            logger.warning("Could not scrape BSA page: %s", url)
            continue

        data.raw_pages.append(page)

        if page_type == "stats":
            data.bsa_statistics = page.text_content[:4000]
        elif page_type == "press":
            data.bsa_press_releases = _extract_press_releases(page)

    return data


def _extract_insights(page: ScrapedPage) -> list[dict[str, str]]:
    """Extract insight articles from UK Finance."""
    items: list[dict[str, str]] = []
    for link in page.links[:20]:
        text = link.get("text", "").strip()
        href = link.get("href", "")
        if text and len(text) > 15:
            if not href.startswith("http"):
                href = f"https://www.ukfinance.org.uk{href}"
            items.append({"title": text, "url": href})
    return items


def _extract_press_releases(page: ScrapedPage) -> list[dict[str, str]]:
    """Extract press releases from the BSA."""
    items: list[dict[str, str]] = []
    for link in page.links[:15]:
        text = link.get("text", "").strip()
        href = link.get("href", "")
        if text and len(text) > 15:
            if not href.startswith("http"):
                href = f"https://www.bsa.org.uk{href}"
            items.append({"title": text, "url": href})
    return items
