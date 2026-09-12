import { Award, Flame, Medal } from "lucide-react";
import { SiLeetcode } from "react-icons/si";
import { Link } from "react-router-dom";

const iconMap = {
  leetcode: SiLeetcode,
  streak: Flame,
  contest: Medal,
};

const RecentAchievementsCard = ({ achievements }) => {
  const safeAchievements =
    Array.isArray(achievements) && achievements.length > 0
      ? achievements
      : [
          {
            title: "500 LeetCode Problems Solved",
            date: "20 May 2024",
            description: "Consistent DSA practice milestone across data structures.",
            icon: "leetcode",
          },
          {
            title: "100 Days Coding Streak",
            date: "18 May 2024",
            description: "Maintained daily competitive programming streak without interruption.",
            icon: "streak",
          },
        ];

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Recent Achievements</h2>
          <p className="mt-1 text-sm text-slate-500">Milestones worth keeping on your profile.</p>
        </div>
        <Award size={21} className="text-amber-500" />
      </div>

      <div className="space-y-4">
        {safeAchievements.slice(0, 3).map((item, idx) => {
          const Icon = iconMap[item.icon] || Award;
          return (
            <div key={item.title || idx} className="flex items-start gap-4 rounded-xl bg-slate-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <Icon size={19} className="text-indigo-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800">{item.title}</p>
                <p className="mt-1 text-xs text-slate-400">{item.date}</p>
                <p className="mt-2 text-sm text-slate-500">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <Link
        to="/achievements"
        className="mt-4 inline-block text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
      >
        View All Achievements →
      </Link>
    </section>
  );
};

export default RecentAchievementsCard;
