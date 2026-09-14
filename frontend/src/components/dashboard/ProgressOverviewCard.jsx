import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Calendar, TrendingUp } from "lucide-react";

const ProgressOverviewCard = ({ progress }) => {
  const months = progress?.months || [];
  const leetcode = progress?.leetcode || [];
  const github = progress?.github || [];
  const codeforces = progress?.codeforces || [];
  const velocity = progress?.velocity || [];

  const earliestActivity = progress?.earliest_observed_activity;
  const historyFrom = progress?.history_available_from;

  const data = months.map((month, index) => ({
    month,
    fullLabel: progress?.month_full_labels?.[index] || month,
    leetcode: leetcode[index] || 0,
    github: github[index] || 0,
    codeforces: codeforces[index] || 0,
    velocity: velocity[index] || 0,
  }));

  const hasData = data.some((d) => d.leetcode > 0 || d.github > 0 || d.codeforces > 0 || d.velocity > 0);

  return (
    <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs min-w-0">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-600 dark:text-indigo-400" />
            Dynamic Coding Activity & Velocity Trajectory
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Chronological multi-platform activity mapped from authentic calendar timestamps.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {earliestActivity ? (
            <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              <Calendar size={12} className="text-indigo-500" />
              First observed: {earliestActivity}
            </span>
          ) : (
            <span className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
              {months.length > 0 ? `${months.length} months window` : "Awaiting Sync"}
            </span>
          )}
        </div>
      </div>

      <div className="h-72">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b830" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #334155",
                  backgroundColor: "#0f172a",
                  color: "#f8fafc",
                }}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.fullLabel || label}
              />
              <Line type="monotone" dataKey="leetcode" stroke="#6366f1" strokeWidth={3} dot={false} name="LeetCode Submissions" />
              <Line type="monotone" dataKey="github" stroke="#10b981" strokeWidth={3} dot={false} name="GitHub Contributions" />
              <Line type="monotone" dataKey="codeforces" stroke="#3b82f6" strokeWidth={2} dot={false} name="Codeforces Contests" />
              <Line type="monotone" dataKey="velocity" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Momentum Index (0-100)" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No activity timeline available. Connect coding platforms to visualize growth.
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex flex-wrap gap-4">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> LeetCode</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> GitHub</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Codeforces</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Velocity Index</span>
        </div>
        {historyFrom && (
          <span className="text-[11px] text-slate-400">
            Data window begins: {historyFrom}
          </span>
        )}
      </div>
    </section>
  );
};

export default ProgressOverviewCard;
