"""WMT (Workplace Management Tool) Integration Service — placeholder/hook.

This module provides the interface for integrating with the client's WMT system.
The actual integration details (API endpoints, auth, data format) are TBD.
"""

import logging
from datetime import datetime

from app.config import settings

logger = logging.getLogger(__name__)


class WMTService:
    """Placeholder service for WMT integration."""

    def __init__(self) -> None:
        self.api_url = settings.WMT_API_URL
        self.api_key = settings.WMT_API_KEY
        self.poll_interval = settings.WMT_POLL_INTERVAL_SECONDS

    @property
    def is_configured(self) -> bool:
        return self.api_url is not None and self.api_key is not None

    async def fetch_new_requests(self) -> list[dict]:
        """Fetch new staffing requests from WMT.

        Returns list of dicts with standardized fields:
        - wmt_reference_id: str
        - title: str
        - description: str
        - role_title: str
        - location: str
        - number_of_positions: int
        - priority: str
        - target_start_date: str (ISO format)
        - deadline_date: str (ISO format)
        """
        if not self.is_configured:
            logger.info("WMT not configured — returning empty list")
            return []

        # TODO: Implement actual WMT API call when details are available
        # Example:
        # async with httpx.AsyncClient() as client:
        #     response = await client.get(
        #         f"{self.api_url}/staffing-requests",
        #         headers={"Authorization": f"Bearer {self.api_key}"},
        #         params={"status": "new", "since": last_poll_timestamp}
        #     )
        #     return response.json()

        logger.info("WMT fetch_new_requests called — integration pending")
        return []

    async def update_request_status(self, wmt_reference_id: str, status: str, notes: str | None = None) -> bool:
        """Push status update back to WMT for a given request."""
        if not self.is_configured:
            logger.info(f"WMT not configured — skipping status update for {wmt_reference_id}")
            return False

        # TODO: Implement actual WMT API call
        logger.info(f"WMT status update: {wmt_reference_id} -> {status}")
        return True

    async def sync_candidate_status(self, wmt_reference_id: str, candidate_name: str, stage: str) -> bool:
        """Sync candidate stage status back to WMT."""
        if not self.is_configured:
            return False

        # TODO: Implement actual WMT API call
        logger.info(f"WMT candidate sync: {wmt_reference_id} / {candidate_name} -> {stage}")
        return True


wmt_service = WMTService()
