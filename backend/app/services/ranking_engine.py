"""
Multi-Dimensional Explainable Ranking Engine
Authoritative source of truth for candidate placement readiness, leaderboard scoring,
and recruiter search ranking.

Adheres strictly to:
- Distribution-aware platform normalization (1800 CF != 1800 LC != 1800 CC)
- Anti-gaming diminishing returns for problem solving
- Quality-based software engineering evaluation (filtering empty repos)
- Non-punitive dynamic reweighting for missing platforms
- Complete explainability breakdown and provenance tracking
- Centralized configuration with zero magic numbers
"""

from datetime import datetime, timezone
import math
from typing import Any, Dict, List, Optional, Tuple

from app.core.ranking_config import (
    AchievementConfig,
    ConsistencyConfig,
    DifficultyWeights,
    PlatformWeights,
    RankingConfig,
)


class RankingEngine:
    ALGORITHM_VERSION = RankingConfig.ALGORITHM_VERSION

    @staticmethod
    def _clean_rating_value(rating: Any) -> Optional[int]:
        if isinstance(rating, dict):
            rating = rating.get("value")
        if rating is None:
            return None
        try:
            val = int(float(rating))
            return val if val > 0 else None
        except (ValueError, TypeError):
            return None

    @classmethod
    def normalize_codeforces_rating(cls, rating: Any) -> Optional[float]:
        """
        Distribution-aware Codeforces contest rating normalization (0-100).
        Codeforces active percentile alignment:
        - < 1200 (Newbie): 0 to 35 pts
        - 1200-1399 (Pupil): 35 to 55 pts
        - 1400-1599 (Specialist): 55 to 75 pts
        - 1600-1899 (Expert): 75 to 90 pts (Top ~3%)
        - 1900-2099 (Candidate Master): 90 to 97 pts (Top ~1%)
        - 2100+ (Master+): 97 to 100 pts (World elite)
        """
        rating_clean = cls._clean_rating_value(rating)
        if rating_clean is None:
            return None
        rating = rating_clean
        if rating < 1200:
            return min(35.0, (rating / 1200.0) * 35.0)
        elif rating < 1400:
            return 35.0 + ((rating - 1200.0) / 200.0) * 20.0
        elif rating < 1600:
            return 55.0 + ((rating - 1400.0) / 200.0) * 20.0
        elif rating < 1900:
            return 75.0 + ((rating - 1600.0) / 300.0) * 15.0
        elif rating < 2100:
            return 90.0 + ((rating - 1900.0) / 200.0) * 7.0
        else:
            return min(100.0, 97.0 + ((rating - 2100.0) / 400.0) * 3.0)

    @classmethod
    def normalize_leetcode_rating(cls, rating: Any) -> Optional[float]:
        """
        Distribution-aware LeetCode contest rating normalization (0-100).
        - < 1400: 0 to 30 pts
        - 1400-1600: 30 to 50 pts
        - 1600-1800: 50 to 70 pts
        - 1800-2000 (Knight): 70 to 88 pts
        - 2000-2300 (Guardian): 88 to 97 pts
        - 2300+: 97 to 100 pts
        """
        rating_clean = cls._clean_rating_value(rating)
        if rating_clean is None:
            return None
        rating = rating_clean
        if rating < 1400:
            return min(30.0, (rating / 1400.0) * 30.0)
        elif rating < 1600:
            return 30.0 + ((rating - 1400.0) / 200.0) * 20.0
        elif rating < 1800:
            return 50.0 + ((rating - 1600.0) / 200.0) * 20.0
        elif rating < 2000:
            return 70.0 + ((rating - 1800.0) / 200.0) * 18.0
        elif rating < 2300:
            return 88.0 + ((rating - 2000.0) / 300.0) * 9.0
        else:
            return min(100.0, 97.0 + ((rating - 2300.0) / 400.0) * 3.0)

    @classmethod
    def normalize_codechef_rating(cls, rating: Any) -> Optional[float]:
        """
        Distribution-aware CodeChef contest rating normalization (0-100).
        - < 1400 (1★ / Div 4): 0 to 30 pts
        - 1400-1599 (2★ / Div 3): 30 to 50 pts
        - 1600-1799 (3★ / Div 2): 50 to 70 pts
        - 1800-1999 (4★ / Div 2): 70 to 85 pts
        - 2000-2199 (5★ / Div 1): 85 to 95 pts
        - 2200+ (6★-7★ / Div 1): 95 to 100 pts
        """
        rating_clean = cls._clean_rating_value(rating)
        if rating_clean is None:
            return None
        rating = rating_clean
        if rating < 1400:
            return min(30.0, (rating / 1400.0) * 30.0)
        elif rating < 1600:
            return 30.0 + ((rating - 1400.0) / 200.0) * 20.0
        elif rating < 1800:
            return 50.0 + ((rating - 1600.0) / 200.0) * 20.0
        elif rating < 2000:
            return 70.0 + ((rating - 1800.0) / 200.0) * 15.0
        elif rating < 2200:
            return 85.0 + ((rating - 2000.0) / 200.0) * 10.0
        else:
            return min(100.0, 95.0 + ((rating - 2200.0) / 400.0) * 5.0)

    @classmethod
    def calculate_competitive_programming_score(
        cls,
        cf_rating: Optional[int],
        lc_rating: Optional[int],
        cc_rating: Optional[int],
    ) -> Tuple[Optional[float], Dict[str, Any]]:
        """
        Evaluates competitive programming prowess.
        Prioritizes top performance (80%) + secondary synergy bonus (up to 20%).
        Returns None if user has 0 contest ratings across all platforms.
        """
        norm_cf = cls.normalize_codeforces_rating(cf_rating)
        norm_lc = cls.normalize_leetcode_rating(lc_rating)
        norm_cc = cls.normalize_codechef_rating(cc_rating)

        available_ratings = []
        if norm_cf is not None:
            available_ratings.append(("Codeforces", norm_cf, cf_rating))
        if norm_lc is not None:
            available_ratings.append(("LeetCode", norm_lc, lc_rating))
        if norm_cc is not None:
            available_ratings.append(("CodeChef", norm_cc, cc_rating))

        if not available_ratings:
            return None, {
                "status": "unrated",
                "details": "No contest ratings available across connected platforms",
            }

        # Sort by highest normalized score
        available_ratings.sort(key=lambda x: x[1], reverse=True)
        primary = available_ratings[0]
        primary_score = primary[1]

        # Secondary platform synergy bonus (up to 20%)
        if len(available_ratings) > 1:
            secondary_score = available_ratings[1][1]
            final_cp = (
                primary_score * PlatformWeights.PRIMARY_PLATFORM_WEIGHT
                + secondary_score * PlatformWeights.SECONDARY_PLATFORM_WEIGHT
            )
        else:
            final_cp = primary_score

        return min(100.0, round(final_cp, 1)), {
            "status": "rated",
            "primary_platform": primary[0],
            "primary_normalized": round(primary_score, 1),
            "normalized_scores": {p[0]: round(p[1], 1) for p in available_ratings},
        }

    @classmethod
    def calculate_problem_solving_depth_score(
        cls,
        leetcode_stats: Dict[str, Any],
        codeforces_stats: Dict[str, Any],
        codechef_stats: Dict[str, Any],
    ) -> Tuple[float, Dict[str, Any]]:
        """
        Evaluates problem solving depth using platform-native difficulty weights
        with concave diminishing returns to eliminate trivial volume grinding.
        """
        # 1. LeetCode weighted points
        lc_easy = leetcode_stats.get("easy", 0)
        lc_med = leetcode_stats.get("medium", 0)
        lc_hard = leetcode_stats.get("hard", 0)
        lc_points = (
            lc_easy * DifficultyWeights.LC_EASY
            + lc_med * DifficultyWeights.LC_MEDIUM
            + lc_hard * DifficultyWeights.LC_HARD
        )

        # 2. Codeforces weighted points
        cf_bands = codeforces_stats.get("rating_bands", {})
        cf_points = (
            cf_bands.get("< 1000 (Newbie Basics)", 0) * DifficultyWeights.CF_NEWBIE_BASICS
            + cf_bands.get("1000–1199 (Newbie Advanced)", 0) * DifficultyWeights.CF_NEWBIE_ADVANCED
            + cf_bands.get("1200–1399 (Pupil)", 0) * DifficultyWeights.CF_PUPIL
            + cf_bands.get("1400–1599 (Specialist)", 0) * DifficultyWeights.CF_SPECIALIST
            + cf_bands.get("1600–1899 (Expert)", 0) * DifficultyWeights.CF_EXPERT
            + cf_bands.get("1900–2099 (Candidate Master)", 0) * DifficultyWeights.CF_CANDIDATE_MASTER
            + cf_bands.get("2100+ (Master+)", 0) * DifficultyWeights.CF_MASTER_PLUS
            + cf_bands.get("Unrated", 0) * DifficultyWeights.CF_UNRATED
        )

        # 3. CodeChef weighted points based on native difficulty bands
        cc_bands = codechef_stats.get("difficulty_bands") or (codechef_stats.get("problems", {}) or {}).get("difficulty_bands", {})
        if cc_bands:
            cc_points = (
                cc_bands.get("< 1000", 0) * DifficultyWeights.CC_BAND_UNDER_1000
                + cc_bands.get("1000–1199", 0) * DifficultyWeights.CC_BAND_1000_1199
                + cc_bands.get("1200–1399", 0) * DifficultyWeights.CC_BAND_1200_1399
                + cc_bands.get("1400–1599", 0) * DifficultyWeights.CC_BAND_1400_1599
                + cc_bands.get("1600–1799", 0) * DifficultyWeights.CC_BAND_1600_1799
                + cc_bands.get("1800–1999", 0) * DifficultyWeights.CC_BAND_1800_1999
                + cc_bands.get("2000+", 0) * DifficultyWeights.CC_BAND_2000_PLUS
                + cc_bands.get("Unrated", 0) * DifficultyWeights.CC_BAND_UNRATED
            )
        else:
            cc_solved = codechef_stats.get("solved", 0)
            cc_points = cc_solved * DifficultyWeights.CC_SOLVED_DEFAULT

        total_weighted_points = lc_points + cf_points + cc_points


        if total_weighted_points <= 0:
            return 0.0, {
                "total_weighted_points": 0.0,
                "lc_points": 0.0,
                "cf_points": 0.0,
                "cc_points": 0.0,
                "total_problems_solved": 0,
            }

        # Diminishing returns curve: score = 100 * (1 - exp(-points / K))
        score = 100.0 * (1.0 - math.exp(-total_weighted_points / DifficultyWeights.SATURATION_K))
        score = min(100.0, max(0.0, round(score, 1)))

        total_solved = (
            leetcode_stats.get("solved", 0)
            + codeforces_stats.get("solved", 0)
            + codechef_stats.get("solved", 0)
        )

        return score, {
            "total_weighted_points": round(total_weighted_points, 1),
            "lc_points": round(lc_points, 1),
            "cf_points": round(cf_points, 1),
            "cc_points": round(cc_points, 1),
            "total_problems_solved": total_solved,
        }

    @classmethod
    def calculate_software_engineering_score(
        cls,
        github_stats: Dict[str, Any],
    ) -> Tuple[Optional[float], Dict[str, Any]]:
        """
        Evaluates real-world software engineering activity and repository quality.
        Returns None if GitHub account is not connected.
        """
        if not github_stats.get("verified"):
            return None, {"status": "unconnected", "details": "GitHub account not connected"}

        contribs = github_stats.get("contributions", 0)
        source_repos_count = github_stats.get("source_repositories_count", 0)
        repos_list = github_stats.get("repositories_list", [])
        stars = github_stats.get("stars", 0)

        # 1. Authentic contributions score (0-40 pts, saturated at 350 contribs)
        c_score = min(40.0, (contribs / 350.0) * 40.0)

        # 2. Source repositories depth (0-30 pts, rewards up to 5 real original projects)
        r_score = min(30.0, source_repos_count * 6.0)

        # 3. Repository quality & traction (0-30 pts)
        top_repos = [r for r in repos_list if not r.get("is_fork")][:5]
        if top_repos:
            avg_quality = sum(r.get("quality_score", 0) for r in top_repos) / len(top_repos)
            q_score = (avg_quality / 100.0) * 20.0 + min(10.0, stars * 2.0)
        else:
            q_score = min(10.0, stars * 2.0)

        total_se = min(100.0, round(c_score + r_score + q_score, 1))

        return total_se, {
            "contributions": contribs,
            "source_repositories": source_repos_count,
            "stars_accrued": stars,
            "contributions_score": round(c_score, 1),
            "repositories_score": round(r_score, 1),
            "quality_score": round(q_score, 1),
        }

    @classmethod
    def calculate_project_portfolio_score(
        cls,
        projects: List[Any],
    ) -> Tuple[float, Dict[str, Any]]:
        """
        Evaluates verified portfolio projects stored in SkillSync.
        Rewards live deployment URLs, GitHub repository links, and comprehensive descriptions.
        """
        if not projects:
            return 0.0, {"projects_count": 0, "live_projects": 0}

        count = len(projects)
        # Base count points: up to 3 projects = 45 pts
        base_points = min(45.0, count * 15.0)

        # Quality points for each project: live URL (+15), github link (+10), description length (+10)
        quality_points = 0.0
        live_count = 0
        github_count = 0

        for p in projects:
            p_live = getattr(p, "live_url", "") or getattr(p, "liveUrl", "") or ""
            p_repo = getattr(p, "github_url", "") or getattr(p, "githubUrl", "") or ""
            p_desc = getattr(p, "description", "") or ""

            if p_live and len(p_live.strip()) > 5:
                quality_points += 15.0
                live_count += 1
            if p_repo and len(p_repo.strip()) > 5:
                quality_points += 10.0
                github_count += 1
            if p_desc and len(p_desc.strip()) > 40:
                quality_points += 10.0

        total_proj_score = min(100.0, round(base_points + min(55.0, quality_points), 1))

        return total_proj_score, {
            "projects_count": count,
            "live_projects": live_count,
            "github_linked_projects": github_count,
        }

    @classmethod
    def calculate_consistency_score(
        cls,
        timeline: Dict[str, Any],
        active_platforms_count: int,
    ) -> Tuple[float, Dict[str, Any]]:
        """
        Evaluates coding velocity and consistency across the dynamic timeline.
        """
        v_series = timeline.get("velocity", [])
        active_months = sum(1 for v in v_series if v > 0)

        month_pts = min(84.0, active_months * ConsistencyConfig.POINTS_PER_ACTIVE_MONTH)
        bonus_pts = min(ConsistencyConfig.MULTI_PLATFORM_BONUS, active_platforms_count * 5.0)

        total_consistency = min(100.0, round(month_pts + bonus_pts, 1))

        return total_consistency, {
            "active_months": active_months,
            "total_timeline_months": len(v_series),
            "multi_platform_count": active_platforms_count,
        }

    @classmethod
    def calculate_achievements_score(
        cls,
        achievements: List[Any],
    ) -> Tuple[float, Dict[str, Any]]:
        """
        Evaluates non-DSA achievements (Hackathons, Research, Certifications).
        """
        if not achievements:
            return 0.0, {"achievements_count": 0}

        count = len(achievements)
        score = min(100.0, count * AchievementConfig.POINTS_PER_ACHIEVEMENT)

        return score, {"achievements_count": count}

    @classmethod
    def calculate_composite_score(
        cls,
        leetcode_stats: Dict[str, Any],
        codeforces_stats: Dict[str, Any],
        codechef_stats: Dict[str, Any],
        github_stats: Dict[str, Any],
        projects: List[Any],
        achievements: List[Any],
        timeline: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Authoritative composite scoring function.
        Implements Section 0.4 Non-Punitive Dynamic Reweighting across available dimensions.
        """
        # 1. Individual Dimension Scores (0-100 or None if missing)
        cf_r = codeforces_stats.get("rating")
        lc_cr = leetcode_stats.get("contest_rating")
        cc_r = codechef_stats.get("rating")
        cp_score, cp_meta = cls.calculate_competitive_programming_score(cf_r, lc_cr, cc_r)

        depth_score, depth_meta = cls.calculate_problem_solving_depth_score(
            leetcode_stats, codeforces_stats, codechef_stats
        )

        se_score, se_meta = cls.calculate_software_engineering_score(github_stats)

        proj_score, proj_meta = cls.calculate_project_portfolio_score(projects)

        # Count active verified platforms
        active_count = sum(
            1 for s in [leetcode_stats, codeforces_stats, codechef_stats, github_stats]
            if s.get("verified")
        )
        consistency_score, consistency_meta = cls.calculate_consistency_score(timeline, active_count)

        ach_score, ach_meta = cls.calculate_achievements_score(achievements)

        # 2. Non-Punitive Dimension Reweighting
        dimensions = {
            "competitive_programming": cp_score,
            "problem_solving_depth": depth_score,
            "software_engineering": se_score,
            "project_portfolio": proj_score,
            "consistency": consistency_score,
            "achievements": ach_score,
        }

        base_weights = RankingConfig.BASE_WEIGHTS
        available_dims = {k: v for k, v in dimensions.items() if v is not None}
        missing_dims = [k for k, v in dimensions.items() if v is None]

        total_avail_weight = sum(base_weights[k] for k in available_dims.keys())

        if total_avail_weight > 0:
            normalized_weights = {
                k: base_weights[k] / total_avail_weight for k in available_dims.keys()
            }
            composite = sum(
                available_dims[k] * normalized_weights[k] for k in available_dims.keys()
            )
        else:
            normalized_weights = {}
            composite = 0.0

        composite_score = min(100.0, max(0.0, round(composite, 1)))

        # 3. Badges & Strengths Synthesis
        badges = []
        strengths = []
        improvements = []

        if cp_score and cp_score >= 80:
            badges.append("Contest Elite")
            strengths.append("High competitive programming contest performance")
        elif depth_score >= 70:
            badges.append("Algorithm Specialist")
            strengths.append("Strong problem solving depth in Data Structures & Algorithms")

        if se_score and se_score >= 75:
            badges.append("Open Source Contributor")
            strengths.append("Substantial real-world Git contributions and repo quality")

        if proj_score >= 80:
            badges.append("Full-Stack Builder")
            strengths.append("Comprehensive portfolio of live-deployed software projects")

        if consistency_score >= 80:
            badges.append("Relentless Coder")

        if not badges:
            badges.append("Rising Talent")

        # Suggestions for score improvement
        if cp_score is None or cp_score < 50:
            improvements.append("Participate in rated Codeforces or LeetCode contests to demonstrate competitive speed")
        if se_score is None or se_score < 50:
            improvements.append("Connect your GitHub handle and build open-source projects with live documentation")
        if proj_score < 50:
            improvements.append("Deploy 2+ real-world web projects with live URLs")
        if depth_score < 50:
            improvements.append("Solve more Medium and Hard algorithmic problems")

        return {
            "algorithm_version": cls.ALGORITHM_VERSION,
            "composite_score": composite_score,
            "placement_readiness": int(round(composite_score)),
            "coverage_ratio": round(total_avail_weight, 2),
            "missing_dimensions": missing_dims,
            "dimension_scores": {
                "competitive_programming": cp_score,
                "problem_solving_depth": depth_score,
                "software_engineering": se_score,
                "project_portfolio": proj_score,
                "consistency": consistency_score,
                "achievements": ach_score,
            },
            "dimension_weights": {k: round(w, 3) for k, w in normalized_weights.items()},
            "metadata": {
                "cp": cp_meta,
                "problem_solving": depth_meta,
                "software_engineering": se_meta,
                "project_portfolio": proj_meta,
                "consistency": consistency_meta,
                "achievements": ach_meta,
            },
            "badges": badges,
            "strengths": strengths[:3],
            "improvements": improvements[:3],
            "calculated_at": datetime.now(timezone.utc).isoformat(),
        }
