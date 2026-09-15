import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Award,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { SiCodechef, SiCodeforces, SiLeetcode } from "react-icons/si";

const PLATFORM_CONFIGS = {
  all: {
    label: "All Platforms",
    icon: Layers,
    color: "#6366f1",
    hasRating: false,
  },
  leetcode: {
    label: "LeetCode",
    icon: SiLeetcode,
    color: "#f59e0b",
    gradientId: "lcGradient",
    metricLabel: "Submissions",
    ratingLabel: "Contest Rating",
    hasRating: true,
  },
  github: {
    label: "GitHub",
    icon: FaGithub,
    color: "#10b981",
    gradientId: "ghGradient",
    metricLabel: "Contributions",
    ratingLabel: null,
    hasRating: false,
  },
  codeforces: {
    label: "Codeforces",
    icon: SiCodeforces,
    color: "#3b82f6",
    gradientId: "cfGradient",
    metricLabel: "Contest Activity",
    ratingLabel: "Official Rating",
    hasRating: true,
  },
  codechef: {
    label: "CodeChef",
    icon: SiCodechef,
    color: "#f97316",
    gradientId: "ccGradient",
    metricLabel: "Contest Activity",
    ratingLabel: "Contest Rating",
    hasRating: true,
  },
};

const CustomTooltip = ({ active, payload, label, mode, platform }) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0]?.payload;
  const fullLabel = dataPoint?.fullLabel || label;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 text-xs shadow-xl backdrop-blur-xs text-slate-100 min-w-[160px] space-y-1.5">
      <p className="font-bold text-slate-300 border-b border-slate-700/60 pb-1 flex items-center justify-between">
        <span>{fullLabel}</span>
        {dataPoint?.contestsParticipated > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/70 text-indigo-200 font-medium">
            {dataPoint.contestsParticipated} contest{dataPoint.contestsParticipated > 1 ? "s" : ""}
          </span>
        )}
      </p>

      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color || entry.stroke }}
            />
            {entry.name}:
          </span>
          <span className="font-bold text-white">
            {entry.value !== null && entry.value !== undefined ? entry.value : "—"}
            {mode === "rating" && entry.value ? " pts" : ""}
          </span>
        </div>
      ))}
    </div>
  );
};

const ProgressOverviewCard = ({ progress }) => {
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [viewMode, setViewMode] = useState("rating"); // "rating" or "activity"

  const platformData = progress?.platforms || {};
  const months = progress?.months || [];
  const leetcode = progress?.leetcode || [];
  const github = progress?.github || [];
  const codeforces = progress?.codeforces || [];
  const codechef = progress?.codechef || [];
  const velocity = progress?.velocity || [];

  // Unified all-platforms dataset
  const unifiedData = months.map((month, index) => ({
    month,
    fullLabel: progress?.month_full_labels?.[index] || month,
    leetcode: leetcode[index] || 0,
    github: github[index] || 0,
    codeforces: codeforces[index] || 0,
    codechef: codechef[index] || 0,
    velocity: velocity[index] || 0,
  }));

  // Selected single-platform dataset (starting from authentic joined/earliest date)
  const singlePlat = platformData[selectedPlatform] || null;
  const singleMonths = singlePlat?.months || [];
  const singleActivities = singlePlat?.activity || [];
  const singleContests = singlePlat?.contests_participated || [];
  const singleRatings = singlePlat?.rating_trajectory || [];

  const singleData = singleMonths.map((month, index) => ({
    month,
    fullLabel: singlePlat?.month_full_labels?.[index] || month,
    activity: singleActivities[index] || 0,
    contestsParticipated: singleContests[index] || 0,
    rating: singleRatings[index] || null,
  }));

  const platConfig = PLATFORM_CONFIGS[selectedPlatform] || PLATFORM_CONFIGS.all;
  const canShowRating = platConfig.hasRating && singleRatings.some((r) => r !== null && r > 0);
  const activeMode = canShowRating ? viewMode : "activity";

  // Calculate platform summary statistics
  const validRatings = singleRatings.filter((r) => r !== null && r > 0);
  const peakRating = validRatings.length ? Math.max(...validRatings) : null;
  const currentRating = validRatings.length ? validRatings[validRatings.length - 1] : null;
  const totalActivity = singleActivities.reduce((acc, v) => acc + v, 0);
  const totalContests = singleContests.reduce((acc, v) => acc + v, 0);

  const hasAnyData =
    selectedPlatform === "all"
      ? unifiedData.some((d) => d.leetcode > 0 || d.github > 0 || d.codeforces > 0 || d.codechef > 0)
      : singleData.some((d) => d.activity > 0 || d.rating > 0 || d.contestsParticipated > 0);

  return (
    <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xs space-y-5 min-w-0">
      {/* Header with Title & Platform Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600 dark:text-indigo-400" />
            Dynamic Coding Activity & Rating Trajectory
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {selectedPlatform === "all"
              ? "Multi-platform chronological trajectory mapped across all connected profiles."
              : `Independent ${platConfig.label} timeline starting from user's earliest activity (${singlePlat?.earliest_date || "First active month"}).`}
          </p>
        </div>

        {/* Platform Switcher Buttons */}
        <div className="flex items-center gap-1 flex-wrap bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {Object.entries(PLATFORM_CONFIGS).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const isSelected = selectedPlatform === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedPlatform(key)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  isSelected
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon size={13} style={{ color: cfg.color }} />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-bar: View Mode Toggles & Summary Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Trajectory Mode Switcher (Rating vs Volume) */}
        {selectedPlatform !== "all" && platConfig.hasRating && (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setViewMode("rating")}
              disabled={!canShowRating}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition ${
                activeMode === "rating"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs"
                  : canShowRating
                  ? "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  : "text-slate-400 opacity-50 cursor-not-allowed"
              }`}
            >
              <Trophy size={12} />
              Rating Progression
            </button>
            <button
              type="button"
              onClick={() => setViewMode("activity")}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition ${
                activeMode === "activity"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Activity size={12} />
              Activity Volume
            </button>
          </div>
        )}

        {/* Platform telemetry pills */}
        {selectedPlatform !== "all" && singlePlat?.verified && (
          <div className="flex items-center gap-2 flex-wrap text-slate-500 dark:text-slate-400 text-[11px]">
            {singlePlat.earliest_date && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 dark:bg-slate-850 px-2 py-0.5 border border-slate-200 dark:border-slate-800">
                <Calendar size={11} className="text-indigo-500" />
                Joined: {singlePlat.earliest_date}
              </span>
            )}
            {currentRating && (
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 font-semibold border border-indigo-100 dark:border-indigo-900">
                <Trophy size={11} />
                Current Rating: {currentRating} pts
              </span>
            )}
            {peakRating && peakRating !== currentRating && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 font-semibold border border-amber-100 dark:border-amber-900">
                <Sparkles size={11} />
                Peak: {peakRating} pts
              </span>
            )}
            {totalContests > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 font-semibold border border-blue-100 dark:border-blue-900">
                <Award size={11} />
                {totalContests} Contests Attended
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Interactive Chart Container */}
      <div className="h-72 min-w-0">
        {hasAnyData ? (
          <ResponsiveContainer width="100%" height="100%">
            {selectedPlatform === "all" ? (
              /* Unified Comparative Multi-Platform Line Chart */
              <LineChart data={unifiedData} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b830" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} stroke="#94a3b8" />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip mode="activity" platform="all" />} />
                <Line type="monotone" dataKey="leetcode" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="LeetCode" />
                <Line type="monotone" dataKey="github" stroke="#10b981" strokeWidth={2.5} dot={false} name="GitHub" />
                <Line type="monotone" dataKey="codeforces" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="Codeforces" />
                <Line type="monotone" dataKey="codechef" stroke="#f97316" strokeWidth={2.5} dot={false} name="CodeChef" />
                <Line type="monotone" dataKey="velocity" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Velocity Index" />
              </LineChart>
            ) : activeMode === "rating" && canShowRating ? (
              /* Dedicated Rating Progression Area Chart */
              <AreaChart data={singleData} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id={`${platConfig.gradientId}Rating`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={platConfig.color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={platConfig.color} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b830" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} stroke="#94a3b8" />
                <YAxis
                  domain={["dataMin - 100", "dataMax + 100"]}
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="#94a3b8"
                />
                <Tooltip content={<CustomTooltip mode="rating" platform={selectedPlatform} />} />
                <Area
                  type="monotone"
                  dataKey="rating"
                  stroke={platConfig.color}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill={`url(#${platConfig.gradientId}Rating)`}
                  name={`${platConfig.label} Rating`}
                  connectNulls
                  dot={{ fill: platConfig.color, r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            ) : (
              /* Dedicated Activity / Submission Volume Area Chart */
              <AreaChart data={singleData} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={`${platConfig.gradientId}Activity`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={platConfig.color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={platConfig.color} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b830" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} stroke="#94a3b8" />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip mode="activity" platform={selectedPlatform} />} />
                <Area
                  type="monotone"
                  dataKey="activity"
                  stroke={platConfig.color}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill={`url(#${platConfig.gradientId}Activity)`}
                  name={platConfig.metricLabel || "Activity"}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-xs font-semibold">
              No verified timeline activity observed for {platConfig.label}.
            </p>
            <p className="text-[11px] text-slate-500">
              Connect your {platConfig.label} handle in Profile settings to synchronize your historical submissions and rating trajectory.
            </p>
          </div>
        )}
      </div>

      {/* Legend & Context Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
        {selectedPlatform === "all" ? (
          <div className="flex flex-wrap gap-4">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> LeetCode</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> GitHub</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Codeforces</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> CodeChef</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Velocity Index</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: platConfig.color }} />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {activeMode === "rating" ? `${platConfig.label} Contest Rating Progression` : `${platConfig.label} ${platConfig.metricLabel}`}
            </span>
            <span className="text-[11px] text-slate-400">
              ({singleMonths.length} months active)
            </span>
          </div>
        )}

        <span className="text-[11px] text-slate-400">
          Independent timeline windows · Pure authentic calendar data
        </span>
      </div>
    </section>
  );
};

export default ProgressOverviewCard;
