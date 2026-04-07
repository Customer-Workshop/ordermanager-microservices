"""Scraper for savings rate comparison sites (Moneyfacts, Savings Champion)."""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field

from scraper import ScrapedPage, WebScraper

logger = logging.getLogger(__name__)


@dataclass
class SavingsRateData:
    """Structured savings rate data from comparison sites."""

    isa_rates: list[dict[str, str]] = field(default_factory=list)
    fixed_rate_bonds: list[dict[str, str]] = field(default_factory=list)
    easy_access_rates: list[dict[str, str]] = field(default_factory=list)
    notice_accounts: list[dict[str, str]] = field(default_factory=list)
    regular_savers: list[dict[str, str]] = field(default_factory=list)
    best_buys_summary: str | None = None
    raw_pages: list[ScrapedPage] = field(default_factory=list)


def scrape_moneyfacts(scraper: WebScraper) -> SavingsRateData:
    """Scrape Moneyfacts for current savings rates across product types."""
    data = SavingsRateData()

    pages_to_scrape = [
        ("https://moneyfacts.co.uk/savings-accounts/", "general"),
        ("https://moneyfacts.co.uk/savings-accounts/cash-isas/", "isa"),
        ("https://moneyfacts.co.uk/savings-accounts/fixed-rate-bonds/", "fixed"),
        ("https://moneyfacts.co.uk/savings-accounts/easy-access-accounts/", "easy_access"),
        ("https://moneyfacts.co.uk/savings-accounts/notice-accounts/", "notice"),
        ("https://moneyfacts.co.uk/savings-accounts/regular-savings-accounts/", "regular"),
    ]

    for url, page_type in pages_to_scrape:
        page = scraper.scrape_url(url, "Moneyfacts", use_selenium=True)
        if page is None:
            logger.warning("Could not scrape Moneyfacts page: %s", url)
            continue

        # Skip error / near-empty pages
        if len(page.text_content) < 200 or "404" in page.title:
            logger.warning("Skipping low-content page: %s (%s)", url, page.title)
            continue

        data.raw_pages.append(page)
        rates = _extract_rate_entries(page)

        if page_type == "isa":
            data.isa_rates = rates
        elif page_type == "fixed":
            data.fixed_rate_bonds = rates
        elif page_type == "easy_access":
            data.easy_access_rates = rates
        elif page_type == "notice":
            data.notice_accounts = rates
        elif page_type == "regular":
            data.regular_savers = rates

    return data


def scrape_savings_champion(scraper: WebScraper) -> SavingsRateData:
    """Scrape Savings Champion best-buy tables."""
    data = SavingsRateData()

    page = scraper.scrape_url(
        "https://www.savingschampion.co.uk/best-buys",
        "Savings Champion",
        use_selenium=True,
    )
    if page is None:
        logger.warning("Could not scrape Savings Champion")
        return data

    data.raw_pages.append(page)
    data.best_buys_summary = page.text_content[:5000]
    data.easy_access_rates = _extract_rate_entries(page)

    return data


def _extract_rate_entries(page: ScrapedPage) -> list[dict[str, str]]:
    """Extract rate entries from page content using pattern matching."""
    entries: list[dict[str, str]] = []
    text = page.text_content

    # Look for rate patterns like "Provider Name ... X.XX% AER"
    rate_pattern = re.compile(
        r"([A-Z][A-Za-z\s&'.()-]+?)\s+(\d+\.\d+%)\s*(?:AER|gross|p\.a\.)?",
        re.MULTILINE,
    )

    for match in rate_pattern.finditer(text):
        provider = match.group(1).strip()
        rate = match.group(2)
        if len(provider) > 3 and len(provider) < 80:
            entries.append({"provider": provider, "rate": rate})

    # Deduplicate
    seen: set[str] = set()
    unique: list[dict[str, str]] = []
    for entry in entries:
        key = f"{entry['provider']}|{entry['rate']}"
        if key not in seen:
            seen.add(key)
            unique.append(entry)

    return unique[:30]  # Limit to top 30 entries
