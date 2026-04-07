"""Web scraping module using Selenium (headless) and BeautifulSoup.

Provides a reusable infrastructure for fetching and parsing web pages from
UK financial data sources.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass

import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from tenacity import retry, stop_after_attempt, wait_exponential

from config import ScraperConfig

logger = logging.getLogger(__name__)


@dataclass
class ScrapedPage:
    """Container for a scraped web page's content."""

    url: str
    title: str
    text_content: str
    html_snippet: str
    links: list[dict[str, str]]
    scraped_at: str
    source_name: str


class WebScraper:
    """Headless Selenium + requests-based web scraper."""

    def __init__(self, config: ScraperConfig | None = None) -> None:
        self.config = config or ScraperConfig()
        self._driver: webdriver.Chrome | None = None

    # ------------------------------------------------------------------
    # Selenium driver lifecycle
    # ------------------------------------------------------------------

    def _get_driver(self) -> webdriver.Chrome:
        """Return (and lazily create) a headless Chrome driver."""
        if self._driver is not None:
            return self._driver

        options = ChromeOptions()
        if self.config.headless:
            options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")
        options.add_argument(f"--user-agent={self.config.user_agent}")
        options.add_argument("--disable-blink-features=AutomationControlled")

        self._driver = webdriver.Chrome(options=options)
        self._driver.set_page_load_timeout(self.config.request_timeout)
        return self._driver

    def close(self) -> None:
        """Shut down the Selenium driver if it is running."""
        if self._driver is not None:
            try:
                self._driver.quit()
            except Exception:
                pass
            self._driver = None

    # ------------------------------------------------------------------
    # Public scraping helpers
    # ------------------------------------------------------------------

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
    )
    def scrape_with_selenium(self, url: str, source_name: str) -> ScrapedPage:
        """Fetch a page using headless Selenium and extract its content."""
        logger.info("Scraping (Selenium): %s", url)
        driver = self._get_driver()
        driver.get(url)

        # Allow dynamic content to load
        WebDriverWait(driver, self.config.request_timeout).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        time.sleep(self.config.scrape_delay)

        page_source = driver.page_source
        title = driver.title
        return self._parse_html(url, title, page_source, source_name)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
    )
    def scrape_with_requests(self, url: str, source_name: str) -> ScrapedPage:
        """Fetch a page using plain HTTP requests (faster, no JS)."""
        logger.info("Scraping (requests): %s", url)
        headers = {"User-Agent": self.config.user_agent}
        resp = requests.get(
            url, headers=headers, timeout=self.config.request_timeout
        )
        resp.raise_for_status()
        title = ""
        soup = BeautifulSoup(resp.text, "lxml")
        title_tag = soup.find("title")
        if title_tag:
            title = title_tag.get_text(strip=True)
        return self._parse_html(url, title, resp.text, source_name)

    def scrape_url(
        self, url: str, source_name: str, use_selenium: bool = False
    ) -> ScrapedPage | None:
        """High-level helper: scrape a URL, falling back on errors."""
        try:
            if use_selenium:
                return self.scrape_with_selenium(url, source_name)
            return self.scrape_with_requests(url, source_name)
        except Exception:
            logger.warning("Failed to scrape %s, trying fallback method", url)
            try:
                if use_selenium:
                    return self.scrape_with_requests(url, source_name)
                return self.scrape_with_selenium(url, source_name)
            except Exception:
                logger.error("Failed to scrape %s with both methods", url)
                return None

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _parse_html(
        url: str, title: str, html: str, source_name: str
    ) -> ScrapedPage:
        soup = BeautifulSoup(html, "lxml")

        # Remove noise
        for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
            tag.decompose()

        # Extract main content (try common content selectors)
        main_content = (
            soup.find("main")
            or soup.find("article")
            or soup.find("div", class_="content")
            or soup.find("div", id="content")
            or soup.find("body")
        )

        text_content = ""
        if main_content:
            text_content = main_content.get_text(separator="\n", strip=True)
            # Truncate very long pages to keep context manageable
            if len(text_content) > 15_000:
                text_content = text_content[:15_000] + "\n... [truncated]"

        # Extract useful links
        links: list[dict[str, str]] = []
        if main_content:
            for a_tag in main_content.find_all("a", href=True)[:50]:
                link_text = a_tag.get_text(strip=True)
                href = a_tag["href"]
                if link_text and href and not href.startswith("#"):
                    links.append({"text": link_text, "href": href})

        # Keep a small HTML snippet for reference
        html_snippet = ""
        if main_content:
            html_snippet = str(main_content)[:5_000]

        from datetime import datetime, timezone

        return ScrapedPage(
            url=url,
            title=title,
            text_content=text_content,
            html_snippet=html_snippet,
            links=links,
            scraped_at=datetime.now(timezone.utc).isoformat(),
            source_name=source_name,
        )
