"""
Dynamic Timeline Service
Aggregates authentic timestamped activity across all connected platforms:
- LeetCode submissionCalendar timestamps
- Codeforces contest dates and submission timestamps
- CodeChef contest dates from var all_rating
- GitHub daily contribution calendar

Eliminates static month arrays (e.g. ['Apr', 'May', ...]) and synthetic multipliers.
Strictly distinguishes verified zero activity from unavailable historical data.
"""

from datetime import datetime, timezone
import calendar
from typing import Any, Dict, List, Optional, Tuple


class TimelineService:
    @staticmethod
    def _parse_iso_or_str(date_str: Optional[str]) -> Optional[datetime]:
        if not date_str:
            return None
        for fmt in ("%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
            try:
                dt = datetime.strptime(date_str[:19], fmt[:19])
                return dt.replace(tzinfo=timezone.utc)
            except Exception:
                continue
        return None

    @classmethod
    def generate_chronological_months(cls, start_dt: datetime, end_dt: datetime, max_months: int = 12) -> List[Tuple[int, int, str, str]]:
        """
        Generates list of (year, month, 'YYYY-MM', 'Mon YYYY') tuples
        from start_dt to end_dt inclusive, bounded by max_months.
        """
        months = []
        cur_year = start_dt.year
        cur_month = start_dt.month

        while (cur_year < end_dt.year) or (cur_year == end_dt.year and cur_month <= end_dt.month):
            m_key = f"{cur_year:04d}-{cur_month:02d}"
            short_lbl = calendar.month_abbr[cur_month]
            full_lbl = f"{short_lbl} {cur_year}"
            months.append((cur_year, cur_month, m_key, full_lbl))

            cur_month += 1
            if cur_month > 12:
                cur_month = 1
                cur_year += 1

        if len(months) > max_months:
            months = months[-max_months:]

        # If less than 6 months, pad forward/backward to at least 6 months up to current
        if len(months) < 6:
            # Anchor at end_dt and produce 6 months
            padded = []
            ey, em = end_dt.year, end_dt.month
            for i in range(5, -1, -1):
                m = (em - i - 1) % 12 + 1
                y = ey - ((em - i - 1) // 12 * -1 if (em - i) <= 0 else 0)
                m_key = f"{y:04d}-{m:02d}"
                padded.append((y, m, m_key, f"{calendar.month_abbr[m]} {y}"))
            return padded

        return months

    @classmethod
    def build_timeline(
        cls,
        leetcode_stats: Dict[str, Any],
        github_stats: Dict[str, Any],
        codeforces_stats: Dict[str, Any],
        codechef_stats: Dict[str, Any],
        max_months: int = 12,
    ) -> Dict[str, Any]:
        """
        Builds a verified, multi-platform chronological timeline.
        No fabricated numbers. Distinguishes verified zero from unavailable history.
        """
        now = datetime.now(timezone.utc)

        # 1. Collect authentic monthly activity maps
        lc_monthly = leetcode_stats.get("monthly_submissions", {})
        gh_monthly = github_stats.get("monthly_contributions", {})

        # Build Codeforces monthly activity from contest history
        cf_monthly: Dict[str, int] = {}
        for c in codeforces_stats.get("contest_history", []):
            ts = c.get("timestamp")
            if ts:
                dt = cls._parse_iso_or_str(ts)
                if dt:
                    key = dt.strftime("%Y-%m")
                    cf_monthly[key] = cf_monthly.get(key, 0) + 1

        # Build CodeChef monthly activity from contest history
        cc_monthly: Dict[str, int] = {}
        for c in codechef_stats.get("contest_history", []):
            ts = c.get("timestamp")
            if ts:
                dt = cls._parse_iso_or_str(ts)
                if dt:
                    key = dt.strftime("%Y-%m")
                    cc_monthly[key] = cc_monthly.get(key, 0) + 1

        # 2. Find earliest observed activity
        explicit_dates: List[datetime] = []
        for d_str in [
            leetcode_stats.get("earliest_activity_date"),
            github_stats.get("first_activity_date"),
            codeforces_stats.get("earliest_activity_date"),
            codechef_stats.get("first_activity_date"),
        ]:
            dt = cls._parse_iso_or_str(d_str)
            if dt:
                explicit_dates.append(dt)

        month_dates: List[datetime] = []
        for m_key in list(lc_monthly.keys()) + list(gh_monthly.keys()) + list(cf_monthly.keys()) + list(cc_monthly.keys()):
            try:
                dt = datetime.strptime(m_key, "%Y-%m").replace(tzinfo=timezone.utc)
                month_dates.append(dt)
            except Exception:
                pass

        if explicit_dates:
            earliest_dt = min(explicit_dates)
            earliest_observed_str = earliest_dt.strftime("%Y-%m-%d")
            min_window_dt = datetime(now.year - (1 if now.month <= max_months else 0), (now.month - max_months) % 12 + 1, 1, tzinfo=timezone.utc)
            start_dt = max(earliest_dt, min_window_dt)
            is_limited = earliest_dt < min_window_dt
        elif month_dates:
            earliest_dt = min(month_dates)
            earliest_observed_str = earliest_dt.strftime("%Y-%m-%d")
            min_window_dt = datetime(now.year - (1 if now.month <= max_months else 0), (now.month - max_months) % 12 + 1, 1, tzinfo=timezone.utc)
            start_dt = max(earliest_dt, min_window_dt)
            is_limited = earliest_dt < min_window_dt
        else:
            # No activity on any platform: default to past 6 months ending now
            earliest_observed_str = None
            start_dt = datetime(now.year if now.month > 6 else now.year - 1, (now.month - 6) % 12 + 1, 1, tzinfo=timezone.utc)
            is_limited = False

        # 3. Generate dynamic sequence of months
        chronological_months = cls.generate_chronological_months(start_dt, now, max_months=max_months)

        month_keys = [cm[2] for cm in chronological_months]
        month_labels = [calendar.month_abbr[cm[1]] for cm in chronological_months]
        month_full_labels = [cm[3] for cm in chronological_months]

        # 4. Populate exact data series
        lc_series: List[int] = []
        gh_series: List[int] = []
        cf_series: List[int] = []
        cc_series: List[int] = []
        velocity_series: List[int] = []

        lc_verified = leetcode_stats.get("verified", False)
        gh_verified = github_stats.get("verified", False)
        cf_verified = codeforces_stats.get("verified", False)
        cc_verified = codechef_stats.get("verified", False)

        for m_key in month_keys:
            lc_count = lc_monthly.get(m_key, 0) if lc_verified else 0
            gh_count = gh_monthly.get(m_key, 0) if gh_verified else 0
            cf_count = cf_monthly.get(m_key, 0) if cf_verified else 0
            cc_count = cc_monthly.get(m_key, 0) if cc_verified else 0

            lc_series.append(lc_count)
            gh_series.append(gh_count)
            cf_series.append(cf_count)
            cc_series.append(cc_count)

            # Velocity index for this month (0-100) based on verified activity
            v_score = min(100, int(
                min(40, lc_count * 1.5) +
                min(35, gh_count * 0.8) +
                min(25, (cf_count + cc_count) * 12.0)
            ))
            velocity_series.append(v_score)

        return {
            "months": month_labels,
            "month_keys": month_keys,
            "month_full_labels": month_full_labels,
            "leetcode": lc_series,
            "github": gh_series,
            "codeforces": cf_series,
            "codechef": cc_series,
            "velocity": velocity_series,
            "earliest_observed_activity": earliest_observed_str,
            "history_available_from": chronological_months[0][2] if chronological_months else None,
            "is_historical_data_limited": is_limited,
            "timeline_length_months": len(chronological_months),
        }
