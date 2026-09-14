"""Platform adapters module."""
from .base import Availability, Confidence, ProvenanceMetric, ContestHistoryEntry, BasePlatformAdapter
from .codeforces import CodeforcesAdapter
from .codechef import CodeChefAdapter
from .leetcode import LeetCodeAdapter
from .github import GitHubAdapter

__all__ = [
    "Availability",
    "Confidence",
    "ProvenanceMetric",
    "ContestHistoryEntry",
    "BasePlatformAdapter",
    "CodeforcesAdapter",
    "CodeChefAdapter",
    "LeetCodeAdapter",
    "GitHubAdapter",
]
