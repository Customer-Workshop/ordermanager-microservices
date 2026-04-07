"""Configuration module for the UK Retail Banking Research Agent."""

import os
from dataclasses import dataclass, field
from dotenv import load_dotenv

load_dotenv()


@dataclass
class LLMConfig:
    """Configuration for the Infosys AI Gateway LLM endpoint."""

    api_key: str = field(default_factory=lambda: os.getenv("INFOSYS_API_KEY", ""))
    api_base: str = field(
        default_factory=lambda: os.getenv(
            "INFOSYS_API_BASE",
            "https://aigateway-intern.ad.infosys.com/aigateway",
        )
    )
    model: str = field(default_factory=lambda: os.getenv("INFOSYS_MODEL", "gpt-4o"))
    max_tokens: int = 4096
    temperature: float = 0.3


@dataclass
class ScraperConfig:
    """Configuration for web scraping behaviour."""

    headless: bool = field(
        default_factory=lambda: os.getenv("HEADLESS", "true").lower() == "true"
    )
    request_timeout: int = field(
        default_factory=lambda: int(os.getenv("REQUEST_TIMEOUT", "30"))
    )
    scrape_delay: float = field(
        default_factory=lambda: float(os.getenv("SCRAPE_DELAY", "2"))
    )
    user_agent: str = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )


@dataclass
class OutputConfig:
    """Configuration for report output."""

    output_dir: str = field(
        default_factory=lambda: os.getenv("OUTPUT_DIR", "output")
    )
    report_format: str = field(
        default_factory=lambda: os.getenv("REPORT_FORMAT", "markdown")
    )


# ---------------------------------------------------------------------------
# Data-source registry
# ---------------------------------------------------------------------------
# Each entry maps a human-readable source name to metadata used by the
# scraping layer.  The ``scraper`` field references the function that knows
# how to fetch content from that source; ``urls`` lists the specific pages
# to visit; and ``category`` groups sources for downstream analysis.
# ---------------------------------------------------------------------------

RESEARCH_SOURCES: dict[str, dict] = {
    "bank_of_england": {
        "name": "Bank of England",
        "urls": [
            "https://www.bankofengland.co.uk/monetary-policy-summary-and-minutes",
            "https://www.bankofengland.co.uk/statistics/interest-rate-statistics",
            "https://www.bankofengland.co.uk/news",
        ],
        "category": "monetary_policy",
        "description": "Base rate decisions, monetary policy minutes, and interest rate statistics",
    },
    "moneyfacts": {
        "name": "Moneyfacts",
        "urls": [
            "https://moneyfacts.co.uk/savings-accounts/",
            "https://moneyfacts.co.uk/savings-accounts/isa/",
            "https://moneyfacts.co.uk/savings-accounts/fixed-rate-bonds/",
        ],
        "category": "savings_rates",
        "description": "Comprehensive savings rate comparison tables for ISA and non-ISA products",
    },
    "savings_champion": {
        "name": "Savings Champion",
        "urls": [
            "https://www.savingschampion.co.uk/best-buys",
        ],
        "category": "savings_rates",
        "description": "Best-buy savings tables and rate analysis",
    },
    "uk_finance": {
        "name": "UK Finance",
        "urls": [
            "https://www.ukfinance.org.uk/news-and-insight",
            "https://www.ukfinance.org.uk/data-and-research",
        ],
        "category": "industry_reports",
        "description": "Industry trade body reports, data, and market insights",
    },
    "bsa": {
        "name": "Building Societies Association",
        "urls": [
            "https://www.bsa.org.uk/statistics",
            "https://www.bsa.org.uk/media-centre/press-releases",
        ],
        "category": "industry_reports",
        "description": "Building society savings data and press releases",
    },
    "fca": {
        "name": "Financial Conduct Authority",
        "urls": [
            "https://www.fca.org.uk/news/search?start=&end=&type=all&topic=savings-investments",
            "https://www.fca.org.uk/consumers/savings-accounts",
        ],
        "category": "regulatory",
        "description": "Regulatory updates, consumer duty, and savings-related guidance",
    },
    "which_money": {
        "name": "Which? Money",
        "urls": [
            "https://www.which.co.uk/money/savings-and-isas",
        ],
        "category": "consumer",
        "description": "Consumer savings guides and product analysis",
    },
    "bbc_business": {
        "name": "BBC Business",
        "urls": [
            "https://www.bbc.co.uk/news/topics/clm1wxp5pvlt",
        ],
        "category": "news",
        "description": "Business and financial news coverage",
    },
    "ft_banking": {
        "name": "Financial Times - Banking",
        "urls": [
            "https://www.ft.com/uk-banks",
            "https://www.ft.com/personal-finance",
        ],
        "category": "news",
        "description": "In-depth banking and personal finance analysis",
    },
}

RESEARCH_TOPICS: list[str] = [
    "UK Bank of England base rate trends and monetary policy outlook",
    "Cash ISA products: fixed-rate, variable-rate, innovative finance ISA, Lifetime ISA rates and trends",
    "Non-ISA savings products: easy access, fixed-term deposits, notice accounts, regular savers",
    "ISA allowance changes and tax implications for savers",
    "Regulatory changes: FCA Consumer Duty impact on savings products, transparency requirements",
    "Market competition: challenger banks, fintechs, and new entrants in savings market",
    "Consumer savings behaviour: deposit volumes, switching trends, savings ratios",
    "Digital banking trends: app-based savings, open banking, savings automation tools",
    "Building society vs bank savings rates comparison",
    "Impact of inflation on real savings returns in the UK",
]
