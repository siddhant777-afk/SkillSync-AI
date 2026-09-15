"""
Ranking Engine Configuration
Centralized configuration defining all weights, difficulty multipliers,
platform calibration bands, and normalization parameters.
Zero magic numbers scattered in calculation logic.
"""

from typing import Dict


class RankingConfig:
    ALGORITHM_VERSION = "v1.0.0"

    # Base Pillar Weights (Sum of base weights = 1.0)
    # CP: 0.25, Problem Solving: 0.25, Software Engineering: 0.20,
    # Projects: 0.15, Consistency: 0.10, Achievements: 0.05
    BASE_WEIGHTS = {
        "competitive_programming": 0.25,
        "problem_solving_depth": 0.25,
        "software_engineering": 0.20,
        "project_portfolio": 0.15,
        "consistency": 0.10,
        "achievements": 0.05,
    }


class PlatformWeights:
    """Relative calibration of competitive programming platforms."""
    # When multiple CP platforms are present, the primary platform is given 80% weight
    # and secondary platform synergy provides up to 20% bonus.
    PRIMARY_PLATFORM_WEIGHT = 0.80
    SECONDARY_PLATFORM_WEIGHT = 0.20


class DifficultyWeights:
    """
    Native difficulty points for problem solving.
    Trivial problems have very low weight, whereas hard algorithmic problems
    receive substantial weight. Anti-gaming saturation prevents linear grinding.
    """
    # LeetCode Native Weights
    LC_EASY = 0.5
    LC_MEDIUM = 2.0
    LC_HARD = 5.0

    # Codeforces Native Band Weights
    CF_NEWBIE_BASICS = 0.5     # < 1000
    CF_NEWBIE_ADVANCED = 1.0   # 1000-1199
    CF_PUPIL = 2.0             # 1200-1399
    CF_SPECIALIST = 3.5        # 1400-1599
    CF_EXPERT = 5.5            # 1600-1899
    CF_CANDIDATE_MASTER = 8.0  # 1900-2099
    CF_MASTER_PLUS = 12.0      # 2100+
    CF_UNRATED = 1.0

    # CodeChef Native Band Weights
    CC_BAND_UNDER_1000 = 0.5   # < 1000 (Div 4 intro)
    CC_BAND_1000_1199 = 1.0    # 1000-1199 (Div 4)
    CC_BAND_1200_1399 = 1.8    # 1200-1399 (Div 4 advanced)
    CC_BAND_1400_1599 = 2.5    # 1400-1599 (Div 3)
    CC_BAND_1600_1799 = 4.0    # 1600-1799 (Div 2)
    CC_BAND_1800_1999 = 6.0    # 1800-1999 (Div 2 advanced)
    CC_BAND_2000_PLUS = 9.0    # 2000+ (Div 1)
    CC_BAND_UNRATED = 1.0      # Practice / unrated
    CC_SOLVED_DEFAULT = 1.5

    # Saturation parameter K for problem solving score:

    # score = 100 * (1 - exp(-total_points / SATURATION_K))
    # At 250 weighted points (~75 Med + 20 Hard), score is ~80 pts.
    # At 500 weighted points, score is ~96 pts.
    SATURATION_K = 180.0


class ConsistencyConfig:
    """Parameters for evaluating development & coding consistency."""
    MAX_ACTIVE_MONTHS = 12
    POINTS_PER_ACTIVE_MONTH = 7.0  # Up to 84 pts for 12 months
    MULTI_PLATFORM_BONUS = 16.0    # 16 pts for active multi-platform usage


class AchievementConfig:
    """Parameters for non-DSA verified achievements."""
    MAX_ACHIEVEMENTS = 5
    POINTS_PER_ACHIEVEMENT = 20.0  # 5 achievements = 100 pts
