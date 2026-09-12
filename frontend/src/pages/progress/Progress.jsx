
import { useState } from "react";
import {
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  Code2,
  GitCommit,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { useUser } from "../../hooks/useUser";

const Progress = () => {
  const { user } = useUser();
  const [selectedMetric, setSelectedMetric] = useState("leetcode");

  const progressData = user?.progress || {
    months: ["Dec", "Jan", "Feb", "Mar", "Apr", "May"],
    leetcode: [420, 455, 500, 540, 585, 625],
    github: [180, 255, 330, 410, 510, 620],
    projects: [2, 3, 4, 5, 6, 8],
  };

  const chartSeries = progressData[selectedMetric] || progressData.leetcode;
  const maxVal = Math.max(...chartSeries, 1);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Velocity & Growth"
        title="My Progress"
        description="Visualize your competitive coding velocity, repository activity and placement score trajectories over time."
      />

      {/* KPI Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Readiness Score</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">
            {user?.placementReadiness ?? 75}/100
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <span>↑ +12% this month</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">LeetCode Solved</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Code2 size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">
            {user?.leetcode?.solved ?? 420}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span>Rank: {user?.leetcode?.rank || "Top 18%"}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">GitHub Activity</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <GitCommit size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">
            {user?.github?.contributions ?? 620}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span>{user?.github?.repositories ?? 18} Repositories active</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Profile Completion</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Target size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">
            {user?.profileCompletion ?? 85}%
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
            <span>Role: {user?.careerGoal || "AI / ML Engineer"}</span>
          </div>
        </div>
      </div>

      {/* Interactive Growth Chart */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">6-Month Momentum Trend</h2>
            <p className="text-xs text-slate-400">Cumulative performance across primary coding platforms</p>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1">
            {[
              ["leetcode", "LeetCode"],
              ["github", "GitHub Commits"],
              ["projects", "Projects Built"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedMetric(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  selectedMetric === key
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex h-60 items-end gap-3 pt-6 sm:gap-6">
          {chartSeries.map((val, idx) => {
            const heightPct = Math.round((val / maxVal) * 100);
            return (
              <div key={progressData.months[idx]} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-700">{val}</span>
                <div className="w-full max-w-[48px] rounded-t-xl bg-slate-100 flex items-end h-44 overflow-hidden">
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all duration-500 hover:brightness-110"
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-400">
                  {progressData.months[idx]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdown Pillars */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Zap size={18} className="text-amber-500" />
            <span>Target Competencies Mastered</span>
          </div>
          <div className="space-y-3">
            {(user?.skills || [
              { name: "Python", level: 90 },
              { name: "DSA", level: 88 },
              { name: "Machine Learning", level: 80 },
              { name: "SQL", level: 75 },
            ]).slice(0, 5).map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{s.name}</span>
                  <span className="text-indigo-600">{s.level}%</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600"
                    style={{ width: `${s.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Sparkles size={18} className="text-indigo-600" />
            <span>Placement Readiness Pillars</span>
          </div>
          <div className="space-y-3">
            {[
              ["Competitive Programming", "35% Weight", 85, "bg-indigo-600"],
              ["Projects & GitHub Repos", "30% Weight", 80, "bg-emerald-600"],
              ["Core Domain Skills", "20% Weight", 78, "bg-purple-600"],
              ["ATS Resume Score", "15% Weight", 88, "bg-amber-500"],
            ].map(([name, weight, pct, color]) => (
              <div key={name}>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{name} <span className="font-normal text-slate-400">({weight})</span></span>
                  <span className="text-slate-800">{pct}/100</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;