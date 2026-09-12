import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ProgressOverviewCard = ({ progress }) => {
  const months = progress?.months || ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  const leetcode = progress?.leetcode || [0, 0, 0, 0, 0, 0];
  const skills = progress?.skills || [0, 0, 0, 0, 0, 0];
  const github = progress?.github || [0, 0, 0, 0, 0, 0];
  const projects = progress?.projects || [0, 0, 0, 0, 0, 0];

  const data = months.map((month, index) => ({
    month,
    leetcode: leetcode[index] || 0,
    skills: skills[index] || 0,
    github: github[index] || 0,
    projects: (projects[index] || 0) * 5,
  }));

  return (
    <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs min-w-0">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Progress Over Time</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">Real verified growth trajectory based on platform activity.</p>
        </div>
        <span className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">6 months</span>
      </div>

      <div className="h-72">
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
            />
            <Line type="monotone" dataKey="leetcode" stroke="#6366f1" strokeWidth={3} dot={false} name="LeetCode" />
            <Line type="monotone" dataKey="skills" stroke="#a855f7" strokeWidth={3} dot={false} name="Verified Skills" />
            <Line type="monotone" dataKey="github" stroke="#10b981" strokeWidth={3} dot={false} name="GitHub" />
            <Line type="monotone" dataKey="projects" stroke="#f59e0b" strokeWidth={3} dot={false} name="Projects × 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap gap-5 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-500" /> LeetCode Solved</span>
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-purple-500" /> Verified Skills</span>
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> GitHub Contributions</span>
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" /> Projects</span>
      </div>
    </section>
  );
};

export default ProgressOverviewCard;
