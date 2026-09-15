"""
Comprehensive Platform Overhaul Test Suite
Validates:
- Platform adapters against realistic snapshots and fixtures
- Distinction between verified zero and unavailable
- CodeChef whitespace-tolerant parsing, stars, and division
- Codeforces native rating bands and titles
- GitHub repo quality evaluation (forks vs source)
- Dynamic Timeline generation without hardcoded months
- Multi-dimensional explainable ranking engine
"""

import json
import os
import re
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.adapters.base import Availability, ProvenanceMetric
from app.services.adapters.codechef import CodeChefAdapter
from app.services.adapters.codeforces import CodeforcesAdapter
from app.services.adapters.github import GitHubAdapter
from app.services.adapters.leetcode import LeetCodeAdapter
from app.services.ranking_engine import RankingEngine
from app.services.timeline_service import TimelineService


class TestPlatformAdapters(unittest.TestCase):
    def setUp(self):
        self.fixtures_dir = os.path.join(os.path.dirname(__file__), "fixtures")

    def test_codechef_active_html(self):
        with open(os.path.join(self.fixtures_dir, "codechef_active.html"), "r", encoding="utf-8") as f:
            html = f.read()

        # Verify rating regex matches whitespace/newlines
        r_match = re.search(r'class="rating-number"[^>]*>\s*(\d+)\s*<', html)
        self.assertIsNotNone(r_match)
        self.assertEqual(int(r_match.group(1)), 3355)

        # Verify highest rating
        hr_match = re.search(r'eChef Rating[\s\S]*?[Hh]ighest\s*[Rr]ating\s*(\d+)', html) or re.search(r'[Hh]ighest\s*[Rr]ating\s*(\d+)', html)
        self.assertIsNotNone(hr_match)
        self.assertEqual(int(hr_match.group(1)), 3445)

        # Verify stars & division
        stars, div = CodeChefAdapter.get_stars_and_division(3355)
        self.assertEqual(stars, "7★")
        self.assertEqual(div, "Div 1")

        # Verify global rank and country rank
        gr_match = re.search(r'<strong class=[\'"]global-rank[\'"][^>]*>\s*(\d+)\s*<', html)
        self.assertIsNotNone(gr_match)
        self.assertEqual(int(gr_match.group(1)), 22)

        cr_match = re.search(r'<a[^>]*filterBy=Country[^>]*>\s*<strong>\s*(\d+)\s*</strong>', html, re.IGNORECASE)
        self.assertIsNotNone(cr_match)
        self.assertEqual(int(cr_match.group(1)), 1)

        # Verify contest history JSON
        all_r_match = re.search(r'var all_rating = (\[[\s\S]*?\]);', html)
        self.assertIsNotNone(all_r_match)
        contests = json.loads(all_r_match.group(1))
        self.assertEqual(len(contests), 2)
        self.assertEqual(contests[0]["rating"], "1396")
        self.assertEqual(contests[1]["rating"], "3355")

        # Verify problems extraction and deduplication
        ps_match = re.search(r'<section class="rating-data-section problems-solved">([\s\S]*?)</section>', html)
        self.assertIsNotNone(ps_match)
        c_blocks = re.findall(r"<div class=['\"]content['\"]><h5><span[^>]*>([\s\S]*?)</span></h5><p><span>([\s\S]*?)</span></p></div>", ps_match.group(1))
        self.assertEqual(len(c_blocks), 4)

    def test_codechef_unrated_html(self):
        with open(os.path.join(self.fixtures_dir, "codechef_unrated.html"), "r", encoding="utf-8") as f:
            html = f.read()

        r_match = re.search(r'class="rating-number"[^>]*>\s*(\d+)\s*<', html)
        self.assertIsNone(r_match)

        hr_match = re.search(r'eChef Rating[\s\S]*?[Hh]ighest\s*[Rr]ating\s*(\d+)', html)
        self.assertIsNone(hr_match)

        stars, div = CodeChefAdapter.get_stars_and_division(None)
        self.assertEqual(stars, "Unrated")
        self.assertEqual(div, "Unrated")


    def test_codeforces_tiers_and_bands(self):
        self.assertEqual(CodeforcesAdapter.get_tier_name(None), "Unrated")
        self.assertEqual(CodeforcesAdapter.get_tier_name(0), "Unrated")
        self.assertEqual(CodeforcesAdapter.get_tier_name(1150), "Newbie")
        self.assertEqual(CodeforcesAdapter.get_tier_name(1350), "Pupil")
        self.assertEqual(CodeforcesAdapter.get_tier_name(1500), "Specialist")
        self.assertEqual(CodeforcesAdapter.get_tier_name(1700), "Expert")
        self.assertEqual(CodeforcesAdapter.get_tier_name(1950), "Candidate Master")
        self.assertEqual(CodeforcesAdapter.get_tier_name(2150), "Master")
        self.assertEqual(CodeforcesAdapter.get_tier_name(2350), "International Master")
        self.assertEqual(CodeforcesAdapter.get_tier_name(2500), "Grandmaster")
        self.assertEqual(CodeforcesAdapter.get_tier_name(3300), "Legendary Grandmaster")

    def test_github_repo_quality_evaluation(self):
        source_repo = {
            "name": "ai-engine",
            "fork": False,
            "size": 500,
            "description": "High-throughput machine learning inference engine in Python",
            "stargazers_count": 25,
            "forks_count": 5,
            "language": "Python",
        }
        source_eval = GitHubAdapter.evaluate_repo_quality(source_repo)
        self.assertFalse(source_eval["is_fork"])
        self.assertGreater(source_eval["quality_score"], 60)

        fork_repo = {
            "name": "random-fork",
            "fork": True,
            "size": 10,
            "description": "",
            "stargazers_count": 0,
            "forks_count": 0,
            "language": "JavaScript",
        }
        fork_eval = GitHubAdapter.evaluate_repo_quality(fork_repo)
        self.assertTrue(fork_eval["is_fork"])
        self.assertLess(fork_eval["quality_score"], source_eval["quality_score"])


class TestTimelineService(unittest.TestCase):
    def test_dynamic_timeline_generation(self):
        lc_stats = {
            "verified": True,
            "earliest_activity_date": "2025-11-20T00:00:00Z",
            "monthly_submissions": {
                "2025-11": 25,
                "2025-12": 15,
                "2026-01": 50,
                "2026-02": 0,  # Explicit zero
                "2026-03": 40,
                "2026-04": 30,
            },
        }
        timeline = TimelineService.build_timeline(
            leetcode_stats=lc_stats,
            github_stats={"verified": False},
            codeforces_stats={"verified": False},
            codechef_stats={"verified": False},
        )
        self.assertIn("Nov", timeline["months"])
        self.assertIn("2025-11", timeline["month_keys"])
        self.assertEqual(timeline["earliest_observed_activity"], "2025-11-20")

        # Verify month with 0 submissions is preserved as 0
        idx_feb = timeline["month_keys"].index("2026-02")
        self.assertEqual(timeline["leetcode"][idx_feb], 0)


class TestRankingEngine(unittest.TestCase):
    def test_diminishing_returns(self):
        # 100 easy problems should yield much fewer points than 50 hard problems
        score_easy, meta_easy = RankingEngine.calculate_problem_solving_depth_score(
            leetcode_stats={"easy": 100, "medium": 0, "hard": 0},
            codeforces_stats={},
            codechef_stats={},
        )
        score_hard, meta_hard = RankingEngine.calculate_problem_solving_depth_score(
            leetcode_stats={"easy": 0, "medium": 0, "hard": 50},
            codeforces_stats={},
            codechef_stats={},
        )
        # 50 Hard = 250 pts, 100 Easy = 50 pts
        self.assertGreater(score_hard, score_easy)

    def test_non_punitive_missing_platform_reweighting(self):
        # Candidate with only Codeforces should have non-punitive reweighting
        ranking = RankingEngine.calculate_composite_score(
            leetcode_stats={"verified": False},
            codeforces_stats={"verified": True, "rating": 1650, "solved": 150},
            codechef_stats={"verified": False},
            github_stats={"verified": False},
            projects=[],
            achievements=[],
            timeline={"velocity": [40, 50, 60]},
        )
        self.assertIn("software_engineering", ranking["missing_dimensions"])
        self.assertGreater(ranking["composite_score"], 0)
        # Available weights must normalize to 1.0
        self.assertAlmostEqual(sum(ranking["dimension_weights"].values()), 1.0, places=2)

    def test_reproducibility_determinism(self):
        # Same input must always produce the exact same composite score
        args = {
            "leetcode_stats": {"verified": True, "solved": 200, "easy": 50, "medium": 120, "hard": 30, "contest_rating": 1750},
            "codeforces_stats": {"verified": True, "rating": 1520, "solved": 180},
            "codechef_stats": {"verified": False},
            "github_stats": {"verified": True, "contributions": 150, "source_repositories_count": 3, "stars": 5},
            "projects": [],
            "achievements": [],
            "timeline": {"velocity": [30, 40, 50, 60, 70]},
        }
        run1 = RankingEngine.calculate_composite_score(**args)
        run2 = RankingEngine.calculate_composite_score(**args)
        self.assertEqual(run1["composite_score"], run2["composite_score"])
        self.assertEqual(run1["dimension_scores"], run2["dimension_scores"])


if __name__ == "__main__":
    unittest.main()
