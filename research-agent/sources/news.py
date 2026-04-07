"""Scraper for financial news sources - BBC Business, FT, Reuters."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field

from scraper import ScrapedPage, WebScraper

logger = logging.getLogger(__name__)


@dataclass
class NewsData:
    """Structured data from financial news sources."""

    headlines: list[dict[str, str]] = field(default_factory=list)
    articles_summary: str | None = None
    raw_pages: list[ScrapedPage] = field(default_factory=list)


def scrape_bbc_business(scraper: WebScraper) -> NewsData:
    """Scrape BBC Business for relevant UK banking/savings news."""
    data = NewsData()

    urls = [
        "https://www.bbc.co.uk/news/topics/clm1wxp5pvlt",
        "https://www.bbc.co.uk/news/business/economy",
    ]

    for url in urls:
        page = scraper.scrape_url(url, "BBC Business", use_selenium=True)
        if page is None:
            logger.warning("Could not scrape BBC page: %s", url)
            continue

        data.raw_pages.append(page)
        data.headlines.extend(_extract_bbc_headlines(page))

    # Deduplicate headlines
    seen: set[str] = set()
    unique: list[dict[str, str]] = []
    for item in data.headlines:
        if item["title"] not in seen:
            seen.add(item["title"])
            unique.append(item)
    data.headlines = unique[:20]

    return data


def scrape_ft_banking(scraper: WebScraper) -> NewsData:
    """Scrape Financial Times banking section (limited - may hit paywall)."""
    data = NewsData()

    page = scraper.scrape_url(
        "https://www.ft.com/uk-banks",
        "Financial Times",
        use_selenium=True,
    )
    if page is None:
        logger.warning("Could not scrape FT - likely behind paywall")
        return data

    data.raw_pages.append(page)
    data.headlines = _extract_ft_headlines(page)
    return data


def _extract_bbc_headlines(page: ScrapedPage) -> list[dict[str, str]]:
    """Extract news headlines from BBC pages."""
    items: list[dict[str, str]] = []
    for link in page.links[:30]:
        text = link.get("text", "").strip()
        href = link.get("href", "")
        if text and len(text) > 15 and len(text) < 200:
            if not href.startswith("http"):
                href = f"https://www.bbc.co.uk{href}"
            items.append({"title": text, "url": href})
    return items


def _extract_ft_headlines(page: ScrapedPage) -> list[dict[str, str]]:
    """Extract headlines from FT pages."""
    items: list[dict[str, str]] = []
    for link in page.links[:20]:
        text = link.get("text", "").strip()
        href = link.get("href", "")
        if text and len(text) > 15 and len(text) < 200:
            if not href.startswith("http"):
                href = f"https://www.ft.com{href}"
            items.append({"title": text, "url": href})
    return items
