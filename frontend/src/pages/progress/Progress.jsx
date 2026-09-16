import { useState } from "react";
import {
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  Code2,
  ExternalLink,
  Flame,
  GitCommit,
  Layers,
  PieChart as PieIcon,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Tag,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { SiCodechef, SiCodeforces, SiLeetcode } from "react-icons/si";
import PageHeader from "../../components/common/PageHeader";
import ProgressOverviewCard from "../../components/dashboard/ProgressOverviewCard";
import { useUser } from "../../hooks/useUser";
import { Link } from "react-router-dom";

const Progress = () => {
  const { user, isSyncing, syncAccounts } = useUser();
  const [activeQuestionTab, setActiveQuestionTab] = useState("all");
  const [selectedTimelineMetric, setSelectedTimelineMetric] = useState("leetcode");

  // Core metrics
  const lcSolved = user?.leetcode?.solved ?? 0;
  const lcEasy = user?.leetcode?.easy ?? 0;
  const lcMed = user?.leetcode?.medium ?? 0;
  const lcHard = user?.leetcode?.hard ?? 0;
  const lcRating = user?.leetcode?.contest_rating ?? 0;
  const lcBadge = user?.leetcode?.contest_badge || "";
  const lcTopicCounts = user?.leetcode?.topic_counts || {};

  const cfSolved = user?.codeforces?.solved ?? 0;
  const cfRating = user?.codeforces?.rating ?? 0;
  const cfMaxRating = user?.codeforces?.maxRating ?? 0;
  const cfTitle = user?.codeforces?.title || (cfRating > 0 ? "Rated" : "Unrated");
  const cfRatingBands = user?.codeforces?.rating_bands || {};
  const cfProblemIndices = user?.codeforces?.problem_indices || {};
  const cfTags = user?.codeforces?.topic_tags || {};

  // CodeChef metrics - Separating User Profile from Problem Data
  const ccProfile = user?.codechef?.profile || {};
  const ccProblems = user?.codechef?.problems || {};
  const ccSolved = user?.codechef?.solved ?? (ccProblems.total_solved ?? 0);
  const ccRating = user?.codechef?.rating ?? (ccProfile.rating ?? null);
  const ccHighestRating = user?.codechef?.highestRating ?? user?.codechef?.highest_rating ?? (ccProfile.highest_rating ?? null);
  const ccStars = user?.codechef?.stars || (ccProfile.stars || "");
  const ccDivision = user?.codechef?.division || (ccProfile.division || "");
  const ccGlobalRank = user?.codechef?.globalRank ?? user?.codechef?.global_rank ?? (ccProfile.global_rank ?? null);
  const ccCountryRank = user?.codechef?.countryRank ?? user?.codechef?.country_rank ?? (ccProfile.country_rank ?? null);
  const ccDiffBands = user?.codechef?.difficulty_bands || (ccProblems.difficulty_bands || {});
  const ccDiffDist = user?.codechef?.difficulty_distribution || (ccProblems.difficulty_distribution || []);

  const ghContribs = user?.github?.contributions ?? 0;
  const ghRepos = user?.github?.repositories ?? 0;
  const ghSourceRepos = user?.github?.source_repositories_count ?? 0;
  const ghStars = user?.github?.stars ?? 0;

  const totalProblemsSolved = lcSolved + cfSolved + ccSolved;
  const projCount = user?.projects?.length ?? 0;
  const skillsCount = user?.skills?.length ?? 0;
  const readiness = user?.placementReadiness ?? 0;
  const completion = user?.profileCompletion ?? 0;
  const atsScore = user?.ats_score ?? user?.atsScore ?? 0;

  // Authoritative dynamic multi-platform timeline data
  const rawProgress = user?.progress?.months?.length
    ? user.progress
    : user?.timeline?.months?.length
    ? user.timeline
    : null;

  const progressData = rawProgress || {
    months: [],
    month_keys: [],
    month_full_labels: [],
    leetcode: [],
    github: [],
    codeforces: [],
    codechef: [],
    velocity: [],
    platforms: {},
  };

  const progressPlatforms = progressData.platforms || {};

  // Selected timeline platform view (using that platform's authentic independent joined timeline)
  const currentPlatTimeline = progressPlatforms[selectedTimelineMetric];
  const isPlatformSelected = selectedTimelineMetric !== "velocity" && selectedTimelineMetric !== "unified";

  const displayMonths =
    isPlatformSelected && currentPlatTimeline?.months?.length
      ? currentPlatTimeline.months
      : progressData.months;

  const displayFullLabels =
    isPlatformSelected && currentPlatTimeline?.month_full_labels?.length
      ? currentPlatTimeline.month_full_labels
      : progressData.month_full_labels;

  const displayActivity =
    isPlatformSelected && currentPlatTimeline?.activity?.length
      ? currentPlatTimeline.activity
      : progressData[selectedTimelineMetric] || progressData.leetcode || [];

  const displayContests = currentPlatTimeline?.contests_participated || [];
  const displayRatings = currentPlatTimeline?.rating_trajectory || [];
  const maxTimelineVal = Math.max(...displayActivity, 1);

  // Authoritative ranking engine pillar scores
  const dimScores = user?.ranking?.dimension_scores || {};
  const cpScore = dimScores.competitive_programming ?? (cfRating > 0 ? Math.min(100, Math.round(cfRating / 18)) : (lcSolved > 0 ? Math.min(100, Math.round((lcSolved / 300) * 100)) : 0));
  const depthScore = dimScores.problem_solving_depth ?? (lcSolved > 0 ? Math.min(100, Math.round((lcSolved / 250) * 100)) : 0);
  const engScore = dimScores.software_engineering ?? (ghContribs > 0 ? Math.min(100, Math.round((ghContribs / 200) * 100)) : 0);
  const projScore = dimScores.project_portfolio ?? Math.min(100, projCount * 30);
  const skillScore = Math.min(100, Math.round((Math.min(skillsCount, 8) / 8) * 100));

  // LeetCode percentage breakdown
  const lcTotalDiff = lcSolved > 0 ? lcSolved : 1;
  const lcEasyPct = Math.round((lcEasy / lcTotalDiff) * 100);
  const lcMedPct = Math.round((lcMed / lcTotalDiff) * 100);
  const lcHardPct = Math.max(0, 100 - lcEasyPct - lcMedPct);

  // Codeforces Numerical Rating Bands (Strictly no user titles in question difficulty)
  const CF_TIER_CONFIG = [
    { key: "800–999", altKey: "< 1000 (Newbie Basics)", label: "800–999", subtitle: "Introductory", color: "bg-slate-400 dark:bg-slate-500", text: "text-slate-600 dark:text-slate-300", border: "border-slate-200 dark:border-slate-700" },
    { key: "1000–1199", altKey: "1000–1199 (Newbie Advanced)", label: "1000–1199", subtitle: "Elementary", color: "bg-teal-500 dark:bg-teal-400", text: "text-teal-700 dark:text-teal-300", border: "border-teal-200 dark:border-teal-700" },
    { key: "1200–1399", altKey: "1200–1399 (Pupil)", label: "1200–1399", subtitle: "Easy", color: "bg-emerald-500 dark:bg-emerald-400", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
    { key: "1400–1599", altKey: "1400–1599 (Specialist)", label: "1400–1599", subtitle: "Intermediate", color: "bg-cyan-500 dark:bg-cyan-400", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-200 dark:border-cyan-800" },
    { key: "1600–1799", altKey: "1600–1899 (Expert)", label: "1600–1799", subtitle: "Medium-Hard", color: "bg-blue-500 dark:bg-blue-400", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800" },
    { key: "1800–1999", altKey: "1900–2099 (Candidate Master)", label: "1800–1999", subtitle: "Advanced", color: "bg-indigo-500 dark:bg-indigo-400", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-200 dark:border-indigo-800" },
    { key: "2000–2199", altKey: null, label: "2000–2199", subtitle: "Challenging", color: "bg-purple-500 dark:bg-purple-400", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
    { key: "2200+", altKey: "2100+ (Master+)", label: "2200+", subtitle: "Master-Level", color: "bg-rose-500 dark:bg-rose-400", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-800" },
    { key: "Unrated", altKey: null, label: "Unrated", subtitle: "Practice / Gym", color: "bg-gray-400 dark:bg-gray-500", text: "text-gray-600 dark:text-gray-300", border: "border-gray-200 dark:border-gray-700" },
  ];

  const getCfBandCount = (tier) => {
    if (cfRatingBands[tier.key] !== undefined) return cfRatingBands[tier.key];
    if (tier.altKey && cfRatingBands[tier.altKey] !== undefined) return cfRatingBands[tier.altKey];
    return 0;
  };

  const maxCfBandCount = Math.max(
    ...CF_TIER_CONFIG.map((t) => getCfBandCount(t)),
    1
  );

  // Top Codeforces tags
  const sortedCfTags = Object.entries(cfTags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // CodeChef native numerical difficulty bands configuration (Strictly no Div mentions in questions)
  const CC_DIFF_CONFIG = [
    { key: "< 1000", label: "< 1000", subtitle: "Introductory", color: "bg-slate-400 dark:bg-slate-500", text: "text-slate-600 dark:text-slate-300", border: "border-slate-200 dark:border-slate-700" },
    { key: "1000–1199", label: "1000–1199", subtitle: "Elementary", color: "bg-amber-500 dark:bg-amber-400", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
    { key: "1200–1399", label: "1200–1399", subtitle: "Easy", color: "bg-lime-500 dark:bg-lime-400", text: "text-lime-700 dark:text-lime-300", border: "border-lime-200 dark:border-lime-800" },
    { key: "1400–1599", label: "1400–1599", subtitle: "Intermediate", color: "bg-emerald-500 dark:bg-emerald-400", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
    { key: "1600–1799", label: "1600–1799", subtitle: "Medium", color: "bg-blue-500 dark:bg-blue-400", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800" },
    { key: "1800–1999", label: "1800–1999", subtitle: "Advanced", color: "bg-purple-500 dark:bg-purple-400", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
    { key: "2000+", label: "2000+", subtitle: "Hard / Expert", color: "bg-rose-500 dark:bg-rose-400", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-800" },
    { key: "Unrated", label: "Unrated", subtitle: "Practice / Learning", color: "bg-gray-400 dark:bg-gray-500", text: "text-gray-600 dark:text-gray-300", border: "border-gray-200 dark:border-gray-700" },
  ];

  const maxCcBandCount = Math.max(
    ...CC_DIFF_CONFIG.map((t) => ccDiffBands[t.key] || 0),
    1
  );

  // Official CodeChef division reference
  const CC_TIER_CONFIG = [
    { label: "Div 4 (< 1400)", title: "1★ Beginner", range: "0–1399", color: "bg-amber-600" },
    { label: "Div 3 (1400–1599)", title: "2★ Intermediate", range: "1400–1599", color: "bg-emerald-600" },
    { label: "Div 2 (1600–1799)", title: "3★ Advanced", range: "1600–1799", color: "bg-blue-600" },
    { label: "Div 2 (1800–1999)", title: "4★ Proficient", range: "1800–1999", color: "bg-purple-600" },
    { label: "Div 1 (2000–2199)", title: "5★ Candidate Master", range: "2000–2199", color: "bg-yellow-500" },
    { label: "Div 1 (2200–2499)", title: "6★ Master", range: "2200–2499", color: "bg-orange-500" },
    { label: "Div 1 (2500+)", title: "7★ Grandmaster", range: "2500+", color: "bg-rose-600" },
  ];


  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <PageHeader
        eyebrow="Analytics & Telemetry"
        title="My Progress & Question Distribution"
        description="Authoritative platform-native difficulty classifications, question distribution analytics, and dynamic coding trajectories."
      />

      {/* KPI Cards Row */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Total Solved (All Platforms)</span>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Code2 size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white truncate">
            {totalProblemsSolved}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="text-amber-600 dark:text-amber-400">{lcSolved} LC</span> ·
            <span className="text-blue-600 dark:text-blue-400">{cfSolved} CF</span> ·
            <span className="text-orange-600 dark:text-orange-400">{ccSolved} CC</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Readiness Score</span>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white truncate">
            {readiness}/100
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate">
            <span>{readiness > 0 ? "⚡ Authoritative Ranking Engine v1.0" : "⚪ Connect platforms to score"}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">GitHub Activity</span>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
              <GitCommit size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white truncate">
            {ghContribs}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 truncate">
            <span>{ghRepos} repos ({ghSourceRepos} source) · {ghStars} stars</span>
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
            <span>{user?.careerGoal || "Software Engineering"}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DYNAMIC CODING VELOCITY & RATING TRAJECTORY (MULTI-PLATFORM GRAPH) */}
      {/* ========================================================================= */}
      <ProgressOverviewCard progress={rawProgress || user?.progress} />

      {/* ========================================================================= */}
      {/* 2. PLATFORM-NATIVE QUESTION DISTRIBUTION & DIFFICULTY ANALYTICS (GRAPHS) */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-6 min-w-0">
        {/* Section Header & Tab Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 size={20} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Platform-Native Question Distribution Graphs
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Visualizes solved questions classified by each platform's authentic rating & difficulty system.
            </p>
          </div>

          {/* Platform Tab Switchers */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveQuestionTab("all")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                activeQuestionTab === "all"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750"
              }`}
            >
              <Layers size={14} /> Unified
            </button>
            <button
              type="button"
              onClick={() => setActiveQuestionTab("leetcode")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                activeQuestionTab === "leetcode"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750"
              }`}
            >
              <SiLeetcode className="text-amber-500" /> LeetCode (Easy/Med/Hard)
            </button>
            <button
              type="button"
              onClick={() => setActiveQuestionTab("codeforces")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                activeQuestionTab === "codeforces"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750"
              }`}
            >
              <SiCodeforces className="text-blue-500" /> Codeforces Rating Bands
            </button>
            <button
              type="button"
              onClick={() => setActiveQuestionTab("codechef")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                activeQuestionTab === "codechef"
                  ? "bg-orange-600 text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750"
              }`}
            >
              <SiCodechef className="text-orange-500" /> CodeChef Numerical Difficulty
            </button>
          </div>
        </div>

        {/* Methodology Info Banner */}
        <div className="rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/50 dark:bg-indigo-950/30 p-3.5 flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
          <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Authoritative Platform Difference:</span>
            <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed">
              <strong>LeetCode</strong> distributes questions into 3 discrete buckets (Easy, Medium, Hard). 
              <strong> Codeforces</strong> rates problems by numerical difficulty (800 to 3500) and contest problem index (Problem A, B, C, D, E, F+), completely separate from user contest titles. 
              <strong> CodeChef</strong> organizes practice problems strictly by numerical difficulty ratings (&lt; 1000 to 2000+), while user star tiers (1★ to 7★) and divisions (Div 1 to Div 4) reflect contest ranking. SkillSync AI accurately honors each platform's native taxonomy without flattening them.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: UNIFIED ALL-PLATFORMS COMPARATIVE QUESTION VIEW */}
        {/* ========================================================================= */}
        {activeQuestionTab === "all" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* LeetCode Summary Card */}
              <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SiLeetcode className="text-amber-500 text-lg" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">LeetCode</span>
                  </div>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                    {lcSolved} Solved
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tri-modal classification: <strong>{lcEasy}</strong> Easy · <strong>{lcMed}</strong> Medium · <strong>{lcHard}</strong> Hard
                </p>
                <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700 flex overflow-hidden">
                  <div style={{ width: `${lcEasyPct}%` }} className="bg-emerald-500" title={`Easy: ${lcEasy}`} />
                  <div style={{ width: `${lcMedPct}%` }} className="bg-amber-500" title={`Medium: ${lcMed}`} />
                  <div style={{ width: `${lcHardPct}%` }} className="bg-rose-500" title={`Hard: ${lcHard}`} />
                </div>
                <div className="flex justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                  <span className="text-emerald-600">Easy ({lcEasyPct}%)</span>
                  <span className="text-amber-600">Med ({lcMedPct}%)</span>
                  <span className="text-rose-600">Hard ({lcHardPct}%)</span>
                </div>
              </div>

              {/* Codeforces Summary Card */}
              <div className="rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SiCodeforces className="text-blue-500 text-lg" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Codeforces</span>
                  </div>
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full">
                    {cfSolved} Solved
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Numerical difficulty bands (800–3500+). Current rank: <strong>{cfTitle}</strong> ({cfRating > 0 ? `${cfRating} pts` : "Unrated"})
                </p>
                <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700 flex overflow-hidden">
                  {CF_TIER_CONFIG.map((t) => {
                    const cnt = cfRatingBands[t.key] || 0;
                    const pct = cfSolved > 0 ? Math.round((cnt / cfSolved) * 100) : 0;
                    return (
                      <div
                        key={t.key}
                        style={{ width: `${pct}%` }}
                        className={t.color}
                        title={`${t.label}: ${cnt} solved (${pct}%)`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                  <span>Newbie (&lt;1200)</span>
                  <span>Specialist (1400+)</span>
                  <span>Master (2100+)</span>
                </div>
              </div>

              {/* CodeChef Summary Card */}
              <div className="rounded-xl border border-orange-200/80 dark:border-orange-900/60 bg-orange-50/30 dark:bg-orange-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SiCodechef className="text-orange-500 text-lg" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">CodeChef</span>
                  </div>
                  <span className="text-xs font-bold text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/60 px-2 py-0.5 rounded-full">
                    {ccSolved} Solved
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Division & Star mapping: <strong>{ccStars || "Unrated"}</strong> ({ccDivision || "Contest Tier"}) · <strong>{ccRating > 0 ? `${ccRating} pts` : "Unrated"}</strong>
                </p>
                <div className="rounded-lg bg-orange-100/60 dark:bg-orange-900/40 p-2 text-center text-xs font-bold text-orange-800 dark:text-orange-300">
                  {ccDivision ? `${ccDivision} Coder · ${ccStars} Star Tier` : "Connect handle to extract division tier"}
                </div>
                <div className="flex justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                  <span>Div 4 (1★)</span>
                  <span>Div 3 (2★)</span>
                  <span>Div 1 (5★–7★)</span>
                </div>
              </div>
            </div>

            {/* Combined Comparative Distribution Bar Graph */}
            <div className="rounded-xl bg-slate-50/60 dark:bg-slate-850/60 p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Trophy size={16} className="text-amber-500" />
                Comparative Platform Question Distribution (Total: {totalProblemsSolved} Questions)
              </h3>

              <div className="space-y-3 pt-2">
                {/* LeetCode Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <SiLeetcode className="text-amber-500" /> LeetCode Questions
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      {lcSolved} solved ({totalProblemsSolved > 0 ? Math.round((lcSolved / totalProblemsSolved) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-4 w-full rounded-full bg-slate-200 dark:bg-slate-700 flex overflow-hidden">
                    <div
                      style={{ width: `${totalProblemsSolved > 0 ? (lcSolved / totalProblemsSolved) * 100 : 0}%` }}
                      className="bg-amber-500 transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Codeforces Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <SiCodeforces className="text-blue-500" /> Codeforces Problems
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      {cfSolved} solved ({totalProblemsSolved > 0 ? Math.round((cfSolved / totalProblemsSolved) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-4 w-full rounded-full bg-slate-200 dark:bg-slate-700 flex overflow-hidden">
                    <div
                      style={{ width: `${totalProblemsSolved > 0 ? (cfSolved / totalProblemsSolved) * 100 : 0}%` }}
                      className="bg-blue-500 transition-all duration-500"
                    />
                  </div>
                </div>

                {/* CodeChef Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <SiCodechef className="text-orange-500" /> CodeChef Problems
                    </span>
                    <span className="text-orange-600 dark:text-orange-400 font-bold">
                      {ccSolved} solved ({totalProblemsSolved > 0 ? Math.round((ccSolved / totalProblemsSolved) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-4 w-full rounded-full bg-slate-200 dark:bg-slate-700 flex overflow-hidden">
                    <div
                      style={{ width: `${totalProblemsSolved > 0 ? (ccSolved / totalProblemsSolved) * 100 : 0}%` }}
                      className="bg-orange-500 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LEETCODE NATIVE QUESTION DIFFICULTY GRAPH (EASY / MED / HARD) */}
        {/* ========================================================================= */}
        {activeQuestionTab === "leetcode" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/40 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200/60 dark:border-amber-900/60">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">LeetCode Classification</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <SiLeetcode className="text-amber-500" /> Easy, Medium & Hard Question Distribution
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-3 py-1 rounded-full">
                  {lcSolved} Total Questions Solved
                </span>
                {lcRating > 0 && (
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-3 py-1 rounded-full">
                    Contest: {lcRating} pts {lcBadge && `(${lcBadge})`}
                  </span>
                )}
              </div>
            </div>

            {/* 3-Column Question Difficulty Distribution Graph */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Easy Questions */}
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Easy Questions</span>
                  <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">{lcEasyPct}%</span>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{lcEasy}</p>
                <div className="h-2 w-full rounded-full bg-emerald-200/60 dark:bg-emerald-950 overflow-hidden">
                  <div style={{ width: `${lcEasyPct}%` }} className="h-full bg-emerald-500 rounded-full" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Fundamental patterns & syntax drills
                </p>
              </div>

              {/* Medium Questions */}
              <div className="rounded-xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Medium Questions</span>
                  <span className="text-xs font-black text-amber-800 dark:text-amber-300">{lcMedPct}%</span>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{lcMed}</p>
                <div className="h-2 w-full rounded-full bg-amber-200/60 dark:bg-amber-950 overflow-hidden">
                  <div style={{ width: `${lcMedPct}%` }} className="h-full bg-amber-500 rounded-full" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Core placement & interview-level DSA
                </p>
              </div>

              {/* Hard Questions */}
              <div className="rounded-xl border border-rose-200 dark:border-rose-800/80 bg-rose-50/40 dark:bg-rose-950/20 p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400">Hard Questions</span>
                  <span className="text-xs font-black text-rose-800 dark:text-rose-300">{lcHardPct}%</span>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{lcHard}</p>
                <div className="h-2 w-full rounded-full bg-rose-200/60 dark:bg-rose-950 overflow-hidden">
                  <div style={{ width: `${lcHardPct}%` }} className="h-full bg-rose-500 rounded-full" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Advanced dynamic programming & graphs
                </p>
              </div>
            </div>

            {/* LeetCode Topic Breakdown */}
            <div className="rounded-xl bg-slate-50/70 dark:bg-slate-850/60 p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Tag size={15} className="text-amber-500" />
                LeetCode Algorithmic Topic Categories
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-500">Fundamentals</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {lcTopicCounts.fundamentals ?? Math.round(lcSolved * 0.25)} problems
                  </p>
                  <p className="text-[10px] text-slate-400">Arrays, Strings, Two Pointers, Math</p>
                </div>
                <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-500">Core DSA</span>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                    {lcTopicCounts.core_dsa ?? Math.round(lcSolved * 0.55)} problems
                  </p>
                  <p className="text-[10px] text-slate-400">Trees, Hash Tables, Binary Search, Linked Lists</p>
                </div>
                <div className="rounded-lg bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-500">Advanced / DP</span>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {lcTopicCounts.advanced_topics ?? lcTopicCounts.dp_and_advanced ?? Math.round(lcSolved * 0.2)} problems
                  </p>
                  <p className="text-[10px] text-slate-400">Dynamic Programming, Graphs, Backtracking, Tries</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CODEFORCES NATIVE RATING BANDS & PROBLEM DIFFICULTY GRAPH */}
        {/* ========================================================================= */}
        {activeQuestionTab === "codeforces" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/40 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-200/60 dark:border-blue-900/60">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Codeforces Native System</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <SiCodeforces className="text-blue-500" /> Numerical Problem Rating Bands (800 to 3500)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/60 px-3 py-1 rounded-full">
                  Rank: {cfTitle}
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                  {cfSolved} Problems Solved
                </span>
                {cfRating > 0 && (
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-3 py-1 rounded-full">
                    Rating: {cfRating} (Max: {cfMaxRating})
                  </span>
                )}
              </div>
            </div>

            {/* Vertical Bar Graph for Codeforces Rating Bands */}
            <div className="rounded-xl bg-slate-50/70 dark:bg-slate-850/60 p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Problems Solved per Official Rating Band
                </h4>
                <span className="text-xs text-slate-400">
                  {cfSolved > 0 ? "Authentic Problem Submissions" : "No Codeforces Handle Connected"}
                </span>
              </div>

              {cfSolved > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3 pt-2">
                  {CF_TIER_CONFIG.map((tier) => {
                    const count = getCfBandCount(tier);
                    const heightPct = Math.max(8, Math.round((count / maxCfBandCount) * 100));
                    const pctOfCf = cfSolved > 0 ? Math.round((count / cfSolved) * 100) : 0;

                    return (
                      <div
                        key={tier.key}
                        className={`rounded-xl border ${tier.border} bg-white dark:bg-slate-900 p-3 flex flex-col items-center justify-between text-center min-h-[190px] shadow-2xs`}
                      >
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {count}
                          <span className="block text-[10px] font-normal text-slate-400">({pctOfCf}%)</span>
                        </span>

                        {/* Bar Pillar */}
                        <div className="w-full h-24 flex items-end justify-center my-2">
                          <div
                            style={{ height: `${heightPct}%` }}
                            className={`w-8 sm:w-10 rounded-t-lg ${tier.color} transition-all duration-500 hover:brightness-110`}
                            title={`${tier.label} (${tier.subtitle}): ${count} problems`}
                          />
                        </div>

                        <div>
                          <p className={`text-xs font-bold ${tier.text}`}>{tier.label}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{tier.subtitle}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center space-y-2">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Connect your Codeforces handle to view your solved problem distribution across official numerical rating bands.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Codeforces rates problems from 800 to 3500+ and by contest letters (A, B, C, D, E, F+).
                  </p>
                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    + Connect Codeforces Handle →
                  </Link>
                </div>
              )}
            </div>

            {/* Codeforces Topic Tags Cloud */}
            {sortedCfTags.length > 0 && (
              <div className="rounded-xl bg-slate-50/70 dark:bg-slate-850/60 p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Tag size={15} className="text-blue-500" />
                  Codeforces Topic Tag Mastery ({sortedCfTags.length} tags detected)
                </h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {sortedCfTags.map(([tag, count]) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs"
                    >
                      <span className="font-semibold capitalize">{tag.replace(/-/g, " ")}</span>
                      <span className="rounded-full bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                        {count}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CODECHEF NATIVE NUMERICAL PROBLEM DIFFICULTY GRAPH */}
        {/* ========================================================================= */}
        {activeQuestionTab === "codechef" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-orange-50/40 dark:bg-orange-950/20 p-4 rounded-xl border border-orange-200/60 dark:border-orange-900/60">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">CodeChef Native System</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <SiCodechef className="text-orange-500" /> Numerical Problem Difficulty Distribution
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/60 px-3 py-1 rounded-full">
                  Profile: {ccStars || "Unrated"} ({ccDivision || "Contest Tier"})
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                  {ccSolved} Problems Solved
                </span>
                {ccRating > 0 && (
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-3 py-1 rounded-full">
                    Rating: {ccRating} pts {ccHighestRating && `(Max: ${ccHighestRating})`}
                  </span>
                )}
                {ccGlobalRank && (
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                    Rank #{ccGlobalRank.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Vertical Bar Graph for CodeChef Numerical Difficulty Bands */}
            <div className="rounded-xl bg-slate-50/70 dark:bg-slate-850/60 p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Problems Solved per Official Numerical Difficulty Band
                </h4>
                <span className="text-xs text-slate-400">
                  {ccSolved > 0 ? "Authentic Problem Submissions" : "No CodeChef Handle Connected"}
                </span>
              </div>

              {ccSolved > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
                  {CC_DIFF_CONFIG.map((tier) => {
                    const count = ccDiffBands[tier.key] || 0;
                    const heightPct = Math.max(8, Math.round((count / maxCcBandCount) * 100));
                    const pctOfCc = ccSolved > 0 ? Math.round((count / ccSolved) * 100) : 0;

                    return (
                      <div
                        key={tier.key}
                        className={`rounded-xl border ${tier.border} bg-white dark:bg-slate-900 p-3 flex flex-col items-center justify-between text-center min-h-[190px] shadow-2xs`}
                      >
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {count}
                          <span className="block text-[10px] font-normal text-slate-400">({pctOfCc}%)</span>
                        </span>

                        {/* Bar Pillar */}
                        <div className="w-full h-24 flex items-end justify-center my-2">
                          <div
                            style={{ height: `${count > 0 ? heightPct : 6}%` }}
                            className={`w-full max-w-[32px] rounded-t-md transition-all duration-700 ${
                              count > 0 ? tier.color : "bg-slate-200 dark:bg-slate-800"
                            }`}
                          />
                        </div>

                        {/* Band Label & Subtitle */}
                        <div className="space-y-0.5 w-full">
                          <span className={`text-[11px] font-bold block ${tier.text}`}>
                            {tier.label}
                          </span>
                          <span className="text-[9px] text-slate-400 block truncate" title={tier.subtitle}>
                            {tier.subtitle}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No verified CodeChef problem submissions recorded. Connect your CodeChef handle to view difficulty distribution.
                </div>
              )}
            </div>

            {/* Exact Numerical Difficulty Solves Aggregation */}
            {ccDiffDist.length > 0 && (
              <div className="rounded-xl bg-slate-50/70 dark:bg-slate-850/60 p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Tag size={15} className="text-orange-500" />
                  Exact Numerical Difficulty Solves ({ccDiffDist.length} ratings recorded)
                </h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {ccDiffDist.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs"
                    >
                      <span className="font-semibold">{item.difficulty !== null ? `Rating ${item.difficulty}` : "Unrated / Unavailable"}</span>
                      <span className="rounded-full bg-orange-100 dark:bg-orange-900/60 px-1.5 py-0.5 text-[10px] font-bold text-orange-700 dark:text-orange-300">
                        {item.count} solved
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. DYNAMIC CHRONOLOGICAL ACTIVITY TIMELINE GRAPH */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs min-w-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Dynamic Activity & Submission Timeline
              </h2>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {currentPlatTimeline?.earliest_date
                ? `Independent ${selectedTimelineMetric.toUpperCase()} timeline mapped from earliest verified joined date (${currentPlatTimeline.earliest_date})`
                : progressData?.earliest_observed_activity
                ? `Historical timeline mapped from earliest verified activity (${progressData.earliest_observed_activity})`
                : "Dynamic multi-platform submission volume over time"}
            </p>
          </div>

          <div className="flex flex-wrap rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
            {[
              ["unified", "All Platforms"],
              ["leetcode", "LeetCode"],
              ["github", "GitHub"],
              ["codeforces", "Codeforces"],
              ["codechef", "CodeChef"],
              ["velocity", "Velocity Index"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedTimelineMetric(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  selectedTimelineMetric === key
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
            {selectedTimelineMetric === "unified" && "Unified multi-platform monthly activity and composite momentum index."}
            {selectedTimelineMetric === "leetcode" && "Authentic monthly submission count and contest participation from your LeetCode profile."}
            {selectedTimelineMetric === "github" && "Verified open-source contributions and Git commit frequency starting from your first commit."}
            {selectedTimelineMetric === "codeforces" && "Official Codeforces contest participation history, rating changes, and solved problems."}
            {selectedTimelineMetric === "codechef" && "Official CodeChef contest participation history and verified rating milestones."}
            {selectedTimelineMetric === "velocity" && "Composite multi-platform momentum score combining verified coding activity."}
          </span>
        </div>

        {/* Timeline Bar Chart */}
        {displayMonths.length > 0 ? (
          <div className="mt-6 flex h-64 items-end gap-2 pt-6 sm:gap-4 md:gap-6 min-w-0 overflow-x-auto pb-2">
            {displayMonths.map((month, idx) => {
              const val = displayActivity[idx] || 0;
              const contestsCount = displayContests[idx] || 0;
              const ratingVal = displayRatings[idx] || null;
              const heightPct = Math.max(6, Math.round((val / maxTimelineVal) * 100));
              const fullMonth = displayFullLabels?.[idx] || month;

              return (
                <div key={month || idx} className="flex flex-1 flex-col items-center gap-1.5 min-w-[42px]">
                  {/* Top indicators: contests badge or activity value */}
                  <div className="flex flex-col items-center gap-0.5">
                    {contestsCount > 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {contestsCount} 🏆
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                      {val}
                    </span>
                  </div>

                  {/* Pillar bar */}
                  <div className="w-full max-w-[44px] rounded-t-xl bg-slate-100 dark:bg-slate-800 flex items-end h-44 overflow-hidden">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 hover:brightness-110 ${
                        selectedTimelineMetric === "github"
                          ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                          : selectedTimelineMetric === "codeforces"
                          ? "bg-gradient-to-t from-blue-600 to-blue-400"
                          : selectedTimelineMetric === "codechef"
                          ? "bg-gradient-to-t from-orange-600 to-orange-400"
                          : selectedTimelineMetric === "leetcode"
                          ? "bg-gradient-to-t from-amber-600 to-amber-400"
                          : selectedTimelineMetric === "velocity"
                          ? "bg-gradient-to-t from-purple-600 to-purple-400"
                          : "bg-gradient-to-t from-indigo-600 to-indigo-400"
                      }`}
                      style={{ height: `${val === 0 ? 4 : heightPct}%` }}
                      title={`${fullMonth}: ${val} ${
                        contestsCount > 0 ? `· ${contestsCount} contest(s)` : ""
                      }${ratingVal ? ` · Rating: ${ratingVal} pts` : ""}`}
                    />
                  </div>

                  {/* Month label */}
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">
                    {month}
                  </span>

                  {/* Rating indicator below month if available */}
                  {ratingVal && (
                    <span className="text-[9px] font-semibold text-indigo-600 dark:text-indigo-400 block truncate" title={`Rating: ${ratingVal} pts`}>
                      {ratingVal}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center my-6">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              No historical timeline activity observed yet.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Connect your handles to generate your dynamic chronological activity window.
            </p>
            <button
              onClick={syncAccounts}
              disabled={isSyncing}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100"
            >
              <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
              {isSyncing ? "Syncing..." : "Sync Profiles"}
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. BREAKDOWN PILLARS & CORE COMPETENCIES */}
      {/* ========================================================================= */}
      <div className="grid gap-6 md:grid-cols-2 min-w-0">
        {/* Target Competencies */}
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
                    <span className="text-indigo-600 dark:text-indigo-400">{s.level || s.score || 80}%</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500"
                      style={{ width: `${s.level || s.score || 80}%` }}
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

        {/* Placement Readiness Pillars */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4 min-w-0">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
            <span>Placement Readiness Pillars</span>
          </div>
          <div className="space-y-3">
            {[
              ["Competitive Programming", "35% Weight", cpScore, "bg-indigo-600 dark:bg-indigo-500"],
              ["Problem Solving & DSA Depth", "25% Weight", depthScore, "bg-blue-600 dark:bg-blue-500"],
              ["Software Engineering & Git", "20% Weight", engScore, "bg-emerald-600 dark:bg-emerald-500"],
              ["Project Portfolio", "10% Weight", projScore, "bg-purple-600 dark:bg-purple-500"],
              ["ATS Resume Score", "10% Weight", atsScore, "bg-amber-500 dark:bg-amber-400"],
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
                    style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
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
