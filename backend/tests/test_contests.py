import unittest
from datetime import datetime, timezone, timedelta
from app.services.contest_service import ContestService, format_duration


class TestContestService(unittest.TestCase):
    def test_format_duration(self):
        self.assertEqual(format_duration(3600), "1h")
        self.assertEqual(format_duration(7200), "2h")
        self.assertEqual(format_duration(8100), "2h 15m")
        self.assertEqual(format_duration(1800), "30m")
        self.assertEqual(format_duration(0), "0m")

    def test_compute_status(self):
        now = datetime.now(timezone.utc)

        # Upcoming: starts in future
        start_future = now + timedelta(hours=2)
        end_future = start_future + timedelta(hours=2)
        self.assertEqual(ContestService._compute_status(start_future, end_future, now), "upcoming")

        # Live: currently between start and end
        start_past = now - timedelta(minutes=30)
        end_future2 = now + timedelta(minutes=90)
        self.assertEqual(ContestService._compute_status(start_past, end_future2, now), "live")

        # Completed: ended in past
        start_past2 = now - timedelta(hours=5)
        end_past = now - timedelta(hours=3)
        self.assertEqual(ContestService._compute_status(start_past2, end_past, now), "completed")


if __name__ == "__main__":
    unittest.main()
