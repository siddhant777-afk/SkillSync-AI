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
import { Link } from "react-router-dom";

const Progress = () => {
  const { user } = useUser();
  const [selectedMetric, setSelectedMetric] = useState("leetcode");

  const lcSolved = user?.leetcode?.solved ?? 0;
  const ghContribs = user?.github?.contributions ?? 0;
  const projCount = user?.projects?.length ?? 0;
  const skillsCount = user?.skills?.length ?? 0;
  const readiness = user?.placementReadiness ?? 0;
  const completion = user?.profileCompletion ?? 0;
  const atsScore = user?.ats_score ?? user?.atsScore ?? 0;

  const progressData = user?.progress || {
    months: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    leetcode: [0, 0, 0, 0, 0, lcSolved],
    skills: [0, 0, 0, 0, 0, skillsCount],
    github: [0, 0, 0, 0, 0, ghContribs],
    projects: [0, 0, 0, 0, 0, projCount],
    velocity: [0, 0, 0, 0, 0, 0],
  };

  const chartSeries = progressData[selectedMetric] || progressData.leetcode || [0, 0, 0, 0, 0, 0];
  const maxVal = Math.max(...chartSeries, 1);

  // Dynamic pillar scores
  const cpScore = Math.min(100, Math.round((Math.min(lcSolved, 500) / 500) * 100));
  const projScore = Math.min(100, Math.round((Math.min(ghContribs, 500) / 500) * 60 + (Math.min(projCount, 4) / 4) * 40));
  const skillScore = Math.min(100, Math.round((Math.min(skillsCount, 8) / 8) * 100));

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <PageHeader
        eyebrow="Velocity & Growth"
        title="My Progress"
        description="Visualize your competitive coding velocity, repository activity and placement score trajectories over time."
      />

      {/* KPI Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Readiness Score</span>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white truncate">
            {readiness}/100
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate">
            <span>{readiness > 0 ? "⚡ Verified platform composite" : "⚪ Connect platforms to score"}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">LeetCode Solved</span>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Code2 size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white truncate">
            {lcSolved}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 truncate">
            <span>{lcSolved > 0 ? (user?.leetcode?.rank || "Active Solver") : "No handle verified"}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">GitHub Activity</span>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <GitCommit size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white truncate">
            {ghContribs}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 truncate">
            <span>{user?.github?.repositories ?? 0} Repositories active</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Profile Completion</span>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Target size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white truncate">
            {completion}%
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 truncate">
            <span>Role: {user?.careerGoal || "Software Engineering"}</span>
          </div>
        </div>
      </div>

      {/* Interactive Growth Chart */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs min-w-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Performance Momentum Trend</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Cumulative growth across connected technical platforms</p>
          </div>

          <div className="flex flex-wrap rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
            {[
              ["leetcode", "LeetCode Solved"],
              ["skills", "Platform Skills"],
              ["velocity", "Velocity Index"],
              ["github", "GitHub Commits"],
              ["projects", "Projects Built"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedMetric(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  selectedMetric === key
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Metric Explanation */}
        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500" />
          <span>
            {selectedMetric === "leetcode" && "Verified monthly submissions directly from your LeetCode profile calendar."}
            {selectedMetric === "skills" && "Cumulative technical proficiencies added and verified on SkillSync AI over time."}
            {selectedMetric === "velocity" && "Composite Placement Momentum score (0-100) combining DSA submissions, verified skills, and projects."}
            {selectedMetric === "github" && "Verified commit frequency and open-source contribution velocity."}
            {selectedMetric === "projects" && "Portfolio projects built and verified with modern tech stacks."}
          </span>
        </div>

        <div className="mt-6 flex h-60 items-end gap-3 pt-6 sm:gap-6 min-w-0">
          {chartSeries.map((val, idx) => {
            const heightPct = Math.max(8, Math.round((val / maxVal) * 100));
            return (
              <div key={progressData.months[idx] || idx} className="flex flex-1 flex-col items-center gap-2 min-w-0">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{val}</span>
                <div className="w-full max-w-[48px] rounded-t-xl bg-slate-100 dark:bg-slate-800 flex items-end h-44 overflow-hidden">
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all duration-500 hover:brightness-110"
                    style={{ height: `${val === 0 ? 4 : heightPct}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate">
                  {progressData.months[idx]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdown Pillars */}
      <div className="grid gap-6 md:grid-cols-2 min-w-0">
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Zap size={18} className="text-amber-500" />
              <span>Target Competencies Mastered</span>
            </div>
            <Link to="/skills" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Manage →
            </Link>
          </div>

          {Array.isArray(user?.skills) && user.skills.length > 0 ? (
            <div className="space-y-3">
              {user.skills.slice(0, 5).map((s) => (
                <div key={s.name}>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{s.name}</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{s.level || s.score}%</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500"
                      style={{ width: `${s.level || s.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No skills added yet (0 Verified)</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Add your languages and frameworks in Skills to track proficiency curves.
              </p>
              <Link
                to="/skills"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                + Add Skills
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4 min-w-0">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
            <span>Placement Readiness Pillars</span>
          </div>
          <div className="space-y-3">
            {[
              ["Competitive Programming", "35% Weight", cpScore, "bg-indigo-600 dark:bg-indigo-500"],
              ["Projects & GitHub Repos", "30% Weight", projScore, "bg-emerald-600 dark:bg-emerald-500"],
              ["Core Domain Skills", "20% Weight", skillScore, "bg-purple-600 dark:bg-purple-500"],
              ["ATS Resume Score", "15% Weight", atsScore, "bg-amber-500 dark:bg-amber-400"],
            ].map(([name, weight, pct, color]) => (
              <div key={name}>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">
                    {name} <span className="font-normal text-slate-400 dark:text-slate-500">({weight})</span>
                  </span>
                  <span className="text-slate-800 dark:text-slate-200">{pct}/100</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${pct}%` }}
                  />
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
