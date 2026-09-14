"""
Base Platform Adapter & Data Provenance Layer
Provides standardized structures for metric values, provenance, availability,
and confidence tracking across all external platform adapters.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class Availability(str, Enum):
    AVAILABLE = "available"          # Verified data successfully obtained from source
    VERIFIED_ZERO = "verified_zero"  # Confirmed by source that metric is explicitly 0
    UNRATED = "unrated"              # User has account but hasn't participated/received rating
    UNAVAILABLE = "unavailable"      # Source exists but could not provide the field (e.g. scrape blocked)
    NOT_CONNECTED = "not_connected"  # User has not connected a handle for this platform
    NOT_FOUND = "not_found"          # Handle does not exist on target platform
    RATE_LIMITED = "rate_limited"    # Source temporarily throttled our request


class Confidence(str, Enum):
    OFFICIAL_API = "official_api"        # 100% ground-truth from vendor API (e.g., Codeforces API, LeetCode GraphQL)
    SCRAPED_CONFIRMED = "scraped_confirmed"  # Web scrape with structural signature confirmed
    COMMUNITY_API = "community_api"      # Public mirror or community proxy (e.g. jogruber github api)
    FALLBACK_VERIFIED = "fallback_verified"  # Derived from verified secondary signals (e.g. git push events)
    UNVERIFIED = "unverified"            # Metric unconfirmed


class ProvenanceMetric(BaseModel):
    """
    Standard envelope for every platform metric ensuring strict data provenance.
    Distinguishes null/unavailable from verified zero.
    """
    value: Optional[Any] = None
    availability: Availability = Availability.UNAVAILABLE
    confidence: Confidence = Confidence.UNVERIFIED
    source: str = Field(default="", description="Identifier of the origin source (e.g. 'codeforces_api_user_info')")
    source_timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO 8601 UTC timestamp of when our system fetched the metric"
    )
    activity_timestamp: Optional[str] = Field(
        default=None,
        description="ISO 8601 UTC timestamp of when the user activity actually occurred"
    )
    error_reason: Optional[str] = None

    def is_valid(self) -> bool:
        return self.availability in (Availability.AVAILABLE, Availability.VERIFIED_ZERO) and self.value is not None


class ContestHistoryEntry(BaseModel):
    """Normalized entry for contest participation across platforms."""
    contest_id: Optional[str] = None
    contest_name: str
    timestamp: Optional[str] = None  # ISO 8601
    unix_timestamp: Optional[int] = None
    rating: Optional[int] = None
    rank: Optional[int] = None
    delta: Optional[int] = None


class BasePlatformAdapter:
    """Abstract base class for all platform adapters."""
    PLATFORM_NAME = "base"

    @classmethod
    async def fetch_data(cls, username: str) -> Dict[str, Any]:
        raise NotImplementedError("Platform adapters must implement fetch_data")
