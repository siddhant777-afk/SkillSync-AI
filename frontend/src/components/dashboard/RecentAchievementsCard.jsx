import { Award, Trophy, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const RecentAchievementsCard = ({ achievements }) => {
  const list = Array.isArray(achievements) ? achievements : [];

  return (
    <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs min-w-0">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Achievements & Honors</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">Verified accomplishments beyond standard DSA practice.</p>
        </div>
        <Trophy size={21} className="text-amber-500" />
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">No custom achievements added yet.</p>
          <Link
            to="/achievements"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <Plus size={13} /> Add Hackathons, Papers or Certifications →
          </Link>
        </div>
      ) : (
        <div className="space-y-3 min-w-0">
          {list.slice(0, 3).map((item, idx) => (
            <div key={item.id || idx} className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-850 p-3.5 border border-slate-100 dark:border-slate-800 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <Award size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">{item.title}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">{item.date}</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 truncate">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <Link
          to="/achievements"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 transition hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center justify-between"
        >
          <span>Manage Non-DSA Achievements ({list.length})</span>
          <span>→</span>
        </Link>
      </div>
    </section>
  );
};

export default RecentAchievementsCard;
