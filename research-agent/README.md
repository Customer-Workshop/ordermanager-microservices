# UK Retail Banking Research Agent

An automated research agent that gathers and analyses the latest information on UK retail banking trends, focusing on **cash savings products** — both **ISA** and **non-ISA** — across the UK market.

## What It Does

The agent performs a three-phase research pipeline:

1. **Scrape** — Collects data from major UK financial sources using headless Selenium and HTTP requests
2. **Analyse** — Uses the Infosys AI Gateway LLM to produce structured insights across five key areas
3. **Report** — Generates a comprehensive Markdown research report with executive summary

### Research Coverage

| Area | Details |
|------|---------|
| **Base Rate & Monetary Policy** | Bank of England rate decisions, MPC minutes, forward guidance |
| **Cash ISA Products** | Fixed-rate, variable-rate, Innovative Finance ISA, Lifetime ISA |
| **Non-ISA Savings** | Easy access, fixed-term bonds, notice accounts, regular savers |
| **Regulatory Landscape** | FCA Consumer Duty, transparency rules, savings market reviews |
| **Market Competition** | Challenger banks, fintechs, building societies, digital platforms |

### Data Sources

- Bank of England (bankofengland.co.uk)
- Moneyfacts (moneyfacts.co.uk)
- Savings Champion (savingschampion.co.uk)
- UK Finance (ukfinance.org.uk)
- Building Societies Association (bsa.org.uk)
- Financial Conduct Authority (fca.org.uk)
- BBC Business News
- Financial Times

## Setup

### Prerequisites

- Python 3.10+
- Google Chrome / Chromium installed
- ChromeDriver (matching your Chrome version)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd uk-retail-banking-research-agent

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # Linux/macOS
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

### Configuration

Copy the example environment file and fill in your API key:

```bash
cp .env.example .env
```

Edit `.env` with your Infosys AI Gateway API key:

```env
INFOSYS_API_KEY=your-api-key-here
INFOSYS_API_BASE=https://aigateway-intern.ad.infosys.com/aigateway
INFOSYS_MODEL=gpt-4o
```

## Usage

### Full Research Run

```bash
python main.py
```

This will scrape all sources, analyse the data, and generate a Markdown report in `./output/`.

### Common Options

```bash
# Use a different LLM model
python main.py --model gpt-4o-mini

# Custom output directory
python main.py --output-dir ./reports

# Verbose logging
python main.py -v

# Scrape-only mode (skip LLM analysis — useful for testing scraping)
python main.py --scrape-only

# Run browser in visible mode (debugging)
python main.py --no-headless
```

### CLI Reference

| Flag | Description |
|------|-------------|
| `--model MODEL` | Override the LLM model name |
| `--api-key KEY` | Override the API key |
| `--api-base URL` | Override the API base URL |
| `--output-dir DIR` | Set the report output directory |
| `--scrape-only` | Only scrape data, skip LLM analysis |
| `--selenium-only` | Force Selenium for all page fetches |
| `--no-headless` | Show the browser window (for debugging) |
| `-v, --verbose` | Enable debug-level logging |

## Project Structure

```
uk-retail-banking-research-agent/
├── main.py               # CLI entry point
├── agent.py              # Main orchestrator
├── config.py             # Configuration & source registry
├── scraper.py            # Web scraping infrastructure
├── analyzer.py           # LLM-based analysis module
├── report_generator.py   # Markdown report generation
├── sources/              # Individual source scrapers
│   ├── bank_of_england.py
│   ├── savings_rates.py
│   ├── regulatory.py
│   ├── industry.py
│   └── news.py
├── output/               # Generated reports (git-ignored)
├── requirements.txt
├── .env.example
└── README.md
```

## Output

The agent generates a structured Markdown report containing:

- **Executive Summary** — High-level overview of the UK savings market
- **Base Rate Analysis** — BoE decisions and rate outlook
- **ISA Products Analysis** — Cash ISA rates, trends, and comparisons
- **Non-ISA Savings Analysis** — Easy access, fixed-term, notice, and regular saver products
- **Regulatory Landscape** — FCA Consumer Duty and savings regulation updates
- **Market Competition** — Challenger banks, digital platforms, and competitive dynamics
- **Sources & Methodology** — Full source list and methodology disclosure

## Disclaimer

This tool gathers data from publicly available sources and uses LLM-based analysis. The generated reports should be independently verified before making financial decisions. Rates and product details change frequently — always check with providers directly for the latest information.
