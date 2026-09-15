import { useState } from "react";
import {
  RefreshCw,
  CheckCircle2,
  BrainCircuit,
  ShieldCheck,
  BarChart2,
  ExternalLink,
  GitBranch,
  Star,
  Trophy,
  Award,
  Flame,
  Tag,
  Code2,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { SiCodechef, SiCodeforces, SiLeetcode } from "react-icons/si";
import { useUser } from "../../hooks/useUser";

const CodingOverviewCard = ({ user }) => {
  const { syncAccounts, isSyncing } = useUser();
  const [showAllRepos, setShowAllRepos] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // LeetCode metrics
  const lcSolved = user?.leetcode?.solved ?? 0;
  const lcEasy = user?.leetcode?.easy ?? 0;
  const lcMed = user?.leetcode?.medium ?? 0;
  const lcHard = user?.leetcode?.hard ?? 0;
  const lcContestRating = user?.leetcode?.contest_rating ?? 0;
  const lcContestBadge = user?.leetcode?.contest_badge || "";
  const lcGlobalRank = user?.leetcode?.contest_global_rank ?? 0;

  // Codeforces metrics
  const cfRating = user?.codeforces?.rating ?? 0;
  const cfMaxRating = user?.codeforces?.maxRating ?? 0;
  const cfSolved = user?.codeforces?.solved ?? 0;
  const cfTitle = user?.codeforces?.title || (cfRating > 0 ? "Rated" : "Unrated");
  const cfRatingBands = user?.codeforces?.rating_bands || {};
  const cfProblemIndices = user?.codeforces?.problem_indices || {};
  const cfTags = user?.codeforces?.topic_tags || {};

  // CodeChef metrics - Separating User Profile from Problem Data
  const ccProfile = user?.codechef?.profile || {};
  const ccProblems = user?.codechef?.problems || {};
  const ccRating = user?.codechef?.rating ?? (ccProfile.rating ?? null);
  const ccHighestRating = user?.codechef?.highestRating ?? user?.codechef?.highest_rating ?? (ccProfile.highest_rating ?? null);
  const ccSolved = user?.codechef?.solved ?? (ccProblems.total_solved ?? 0);
  const ccStars = user?.codechef?.stars || (ccProfile.stars || "");
  const ccDivision = user?.codechef?.division || (ccProfile.division || "");
  const ccGlobalRank = user?.codechef?.globalRank ?? user?.codechef?.global_rank ?? (ccProfile.global_rank ?? null);
  const ccCountryRank = user?.codechef?.countryRank ?? user?.codechef?.country_rank ?? (ccProfile.country_rank ?? null);
  const ccDiffBands = user?.codechef?.difficulty_bands || (ccProblems.difficulty_bands || {});
  const ccDiffDist = user?.codechef?.difficulty_distribution || (ccProblems.difficulty_distribution || []);
  const ccTitle = ccStars && ccStars !== "Unrated" ? ccStars : (ccRating > 0 ? `${ccRating} pts` : "Unrated");

  // GitHub metrics
  const ghCommits = user?.github?.contributions ?? user?.github?.commits ?? 0;
  const ghRepos = user?.github?.repositories ?? 0;
  const ghSourceRepos = user?.github?.source_repositories_count ?? 0;
  const ghStars = user?.github?.stars ?? 0;
  const ghReposList = user?.github?.repositories_list || [];
  const ghEngScore = user?.github?.engineering_score ?? 0;

  const platforms = [
    {
      label: "LeetCode",
      icon: SiLeetcode,
      iconClass: "text-amber-500",
      verified: user?.leetcode?.verified || false,
      badge: lcContestRating > 0 ? `${lcContestRating} pts` : lcSolved > 0 ? "Active" : "Unconnected",
      contestRating: lcContestRating,
      contestHelper: lcContestBadge || "Contest Rank",
      questionsSolved: lcSolved,
      questionsHelper: "Problems Solved",
    },
    {
      label: "Codeforces",
      icon: SiCodeforces,
      iconClass: "text-blue-500",
      verified: user?.codeforces?.verified || false,
      badge: cfTitle,
      contestRating: cfRating,
      contestHelper: cfTitle,
      questionsSolved: cfSolved,
      questionsHelper: "Problems Solved",
    },
    {
      label: "CodeChef",
      icon: SiCodechef,
      iconClass: "text-amber-700 dark:text-amber-500",
      verified: user?.codechef?.verified || false,
      badge: ccStars || (ccRating > 0 ? "Rated" : "Unrated"),
      contestRating: ccRating,
      contestHelper: ccStars ? `${ccStars} Star Tier` : "Contest Rating",
      questionsSolved: ccSolved,
      questionsHelper: "Problems Solved",
    },
    {
      label: "GitHub",
      icon: FaGithub,
      iconClass: "text-slate-900 dark:text-slate-100",
      verified: user?.github?.verified || false,
      badge: ghCommits > 0 ? "Active" : "Unconnected",
      commitsCount: ghCommits,
      commitsHelper: "Verified Contributions",
      repositoriesCount: ghRepos,
      repositoriesHelper: `${ghStars} Stars · ${ghSourceRepos} Original`,
    },
  ];

  const topicCounts = user?.leetcode?.topic_counts || {
    fundamentals: 0,
    core_dsa: 0,
    advanced_topics: 0,
    dp_and_advanced: 0,
    dp_specific: 0,
  };
  const advancedCount = topicCounts.advanced_topics || topicCounts.dp_and_advanced || 0;

  // Exact mutually-exclusive difficulty percentages for LeetCode
  const totalDiff = lcSolved > 0 ? lcSolved : 1;
  const easyPct = Math.round((lcEasy / totalDiff) * 100);
  const medPct = Math.round((lcMed / totalDiff) * 100);
  const hardPct = Math.max(0, 100 - easyPct - medPct);

  const displayedRepos = showAllRepos ? ghReposList : ghReposList.slice(0, 4);

  // Top Codeforces tags sorted by frequency
  const sortedCfTags = Object.entries(cfTags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xs space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy size={20} className="text-indigo-600 dark:text-indigo-400" />
            Verified Coding Profiles & Platform Telemetry
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Official metrics, native difficulty bands, stars, and authentic repository quality.
          </p>
        </div>
        <button
          onClick={syncAccounts}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-300 transition hover:bg-indigo-100 dark:hover:bg-indigo-900/60 disabled:opacity-50 shadow-xs self-start sm:self-auto"
        >
          <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? "Syncing..." : "Sync Platforms"}
        </button>
      </div>

      {/* Multi-Platform Solved Problems Summary Banner */}
      <div className="rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/40 dark:bg-indigo-950/20 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Code2 size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Total Solved Across Platforms: <strong className="text-indigo-600 dark:text-indigo-400">{lcSolved + cfSolved + ccSolved} Problems</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-semibold">
          <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            LeetCode: {lcSolved}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Codeforces: {cfSolved}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
            CodeChef: {ccSolved}
          </span>
        </div>
      </div>

      {/* Platform Cards Grid */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {platforms.map((p) => {
          const Icon = p.icon;
          const isGitHub = p.label === "GitHub";

          return (
            <div
              key={p.label}
              className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 p-4 flex flex-col justify-between space-y-3 min-w-0 hover:border-slate-200 dark:hover:border-slate-700 transition"
            >
              {/* Card Title & Verified Badge */}
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Icon size={18} className={`${p.iconClass} shrink-0`} />
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                    {p.label}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    p.verified
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : "bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {p.badge}
                </span>
              </div>

              {/* Metric 1: Contest Rating / Commits */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {isGitHub ? "Verified Contributions" : "Contest Rating"}
                </p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {isGitHub
                      ? p.commitsCount > 0 ? p.commitsCount.toLocaleString() : "0"
                      : p.contestRating > 0
                      ? `${p.contestRating} pts`
                      : "Unrated"}
                  </span>
                  {p.verified && (
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mb-0.5" title="Verified Signal" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {isGitHub ? p.commitsHelper : p.contestHelper}
                </p>
              </div>

              {/* Metric 2: Questions Solved / Repositories */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {isGitHub ? "Repositories" : "Problems Solved"}
                </p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                    {isGitHub
                      ? `${p.repositoriesCount} repos`
                      : `${p.questionsSolved} solved`}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {isGitHub ? p.repositoriesHelper : p.questionsHelper}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Synced GitHub Repositories Showcase with Live Links */}
      {ghReposList && ghReposList.length > 0 && (
        <div className="rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 space-y-3 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FaGithub size={18} className="text-slate-900 dark:text-white shrink-0" />
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                Extracted GitHub Repositories & Real Code Projects ({ghReposList.length})
              </h3>
            </div>
            {ghReposList.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllRepos((prev) => !prev)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline self-start sm:self-auto"
              >
                {showAllRepos ? "Show Fewer Repos" : `View All (${ghReposList.length}) →`}
              </button>
            )}
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
            {displayedRepos.map((repo) => (
              <a
                key={repo.name}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-xl bg-white dark:bg-slate-900 p-3.5 border border-slate-100 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition shadow-2xs hover:shadow-xs min-w-0"
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {repo.name}
                    </span>
                    <ExternalLink size={12} className="text-slate-400 group-hover:text-indigo-500 shrink-0" />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px]">
                    {repo.description || "Open source project on GitHub"}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                    {repo.language || "Code"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5 font-medium text-amber-600 dark:text-amber-400">
                      <Star size={11} /> {repo.stars}
                    </span>
                    <span className="flex items-center gap-0.5 font-medium text-slate-400">
                      <GitBranch size={11} /> {repo.forks}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* VERIFIED MULTI-PLATFORM DEEP DIVE & BREAKDOWN EXPLORER */}
      <div className="rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 p-5 space-y-5 min-w-0">
        {/* Header with Multi-Platform Tab Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-700/80">
          <div>
            <div className="flex items-center gap-2">
              <BrainCircuit size={19} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                Multi-Platform Deep Dive & Native Telemetry
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Verified ground-truth metrics across each platform in its native classification system.
            </p>
          </div>

          {/* Platform Tab Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              🌐 Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("leetcode")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                activeTab === "leetcode"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <SiLeetcode className="text-amber-500" /> LeetCode
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("codeforces")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                activeTab === "codeforces"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <SiCodeforces className="text-blue-500" /> Codeforces
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("codechef")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                activeTab === "codechef"
                  ? "bg-orange-600 text-white shadow-2xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <SiCodechef className="text-orange-500" /> CodeChef
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("github")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                activeTab === "github"
                  ? "bg-slate-800 text-white shadow-2xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <FaGithub className="text-slate-700 dark:text-slate-300" /> GitHub
            </button>
          </div>
        </div>

        {/* TAB 1: ALL PLATFORMS BALANCED 4-WAY GRID */}
        {activeTab === "all" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0">
            {/* LeetCode Card */}
            <div className="rounded-xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 space-y-3 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SiLeetcode className="text-amber-500 text-base" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">LeetCode Standings</span>
                </div>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  {lcContestRating > 0 ? `${lcContestRating} pts (${lcContestBadge || "Rated"})` : (lcSolved > 0 ? `${lcSolved} Solved` : "Unrated")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="rounded-lg bg-amber-50/60 dark:bg-slate-850 p-3 border border-amber-100 dark:border-slate-750 text-center">
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contest Rating</p>
                  <p className="text-lg font-black text-amber-700 dark:text-amber-400 mt-0.5">
                    {lcContestRating > 0 ? `${lcContestRating} pts` : "Unrated"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{lcContestBadge || (lcGlobalRank ? `Rank #${lcGlobalRank.toLocaleString()}` : "Contest Standing")}</p>
                </div>

                <div className="rounded-lg bg-slate-50 dark:bg-slate-850 p-3 border border-slate-100 dark:border-slate-750 text-center">
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Problems Solved</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {lcSolved} <span className="text-xs font-normal text-slate-400">solved</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">DSA Archive</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                <span>Rating Standing: <strong className="text-slate-800 dark:text-slate-200">{lcContestBadge || (lcContestRating > 0 ? `${lcContestRating} pts` : "Unrated")}</strong></span>
                <button
                  type="button"
                  onClick={() => setActiveTab("leetcode")}
                  className="text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                >
                  View Native Difficulty Breakdown →
                </button>
              </div>
            </div>

            {/* Codeforces Card */}
            <div className="rounded-xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 space-y-3 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SiCodeforces className="text-blue-500 text-base" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Codeforces Standings</span>
                </div>
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                  {cfTitle}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="rounded-lg bg-blue-50/60 dark:bg-slate-850 p-3 border border-blue-100 dark:border-slate-750 text-center">
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contest Rating</p>
                  <p className="text-lg font-black text-blue-700 dark:text-blue-400 mt-0.5">
                    {cfRating > 0 ? `${cfRating} pts` : "Unrated"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{cfTitle}</p>
                </div>

                <div className="rounded-lg bg-slate-50 dark:bg-slate-850 p-3 border border-slate-100 dark:border-slate-750 text-center">
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Problems Solved</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {cfSolved} <span className="text-xs font-normal text-slate-400">solved</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Competitive Archive</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                <span>Rating Tier: <strong className="text-slate-800 dark:text-slate-200">{cfTitle}</strong></span>
                <button
                  type="button"
                  onClick={() => setActiveTab("codeforces")}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  View Native Rating Bands →
                </button>
              </div>
            </div>

            {/* CodeChef Card */}
            <div className="rounded-xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 space-y-3 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SiCodechef className="text-orange-500 text-base" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">CodeChef Contest Telemetry</span>
                </div>
                <span className="text-[10px] font-bold text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-800">
                  {ccStars || (ccRating > 0 ? `${ccRating} pts` : "Unrated")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="rounded-lg bg-orange-50/60 dark:bg-slate-850 p-3 border border-orange-100 dark:border-slate-750 text-center">
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contest Rating</p>
                  <p className="text-lg font-black text-orange-700 dark:text-orange-400 mt-0.5">
                    {ccRating > 0 ? `${ccRating} pts` : "Unrated"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{ccStars ? `${ccStars} Star Tier` : "Rated Contestant"}</p>
                </div>

                <div className="rounded-lg bg-slate-50 dark:bg-slate-850 p-3 border border-slate-100 dark:border-slate-750 text-center">
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Problems Solved</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {ccSolved} <span className="text-xs font-normal text-slate-400">solved</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Practice Archive</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                <span>Star Standing: <strong className="text-slate-800 dark:text-slate-200">{ccStars || "Unrated"}</strong></span>
                <button
                  type="button"
                  onClick={() => setActiveTab("codechef")}
                  className="text-orange-600 dark:text-orange-400 font-semibold hover:underline"
                >
                  View Star Telemetry →
                </button>
              </div>
            </div>

            {/* GitHub Card */}
            <div className="rounded-xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 space-y-3 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaGithub className="text-slate-900 dark:text-white text-base" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">GitHub Real Code Contributions</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  {ghCommits > 0 ? "Active Git Contributor" : "Connected"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="rounded-lg bg-slate-100 dark:bg-slate-850 p-3 border border-slate-200 dark:border-slate-750 text-center">
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Contributions</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {ghCommits.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Calendar Push Events</p>
                </div>

                <div className="rounded-lg bg-slate-100 dark:bg-slate-850 p-3 border border-slate-200 dark:border-slate-750 text-center">
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Repositories</p>
                  <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {ghRepos} <span className="text-xs font-normal text-slate-400">repos</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{ghStars} Stars Accrued</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                <span>Original Repos: <strong className="text-slate-800 dark:text-slate-200">{ghSourceRepos} source</strong></span>
                <button
                  type="button"
                  onClick={() => setActiveTab("github")}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  View Code Quality →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LEETCODE FOCUSED DEEP DIVE */}
        {activeTab === "leetcode" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Difficulty Distribution: {lcEasy} Easy + {lcMed} Medium + {lcHard} Hard = {lcSolved} Solved
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck size={13} /> 100% Mutually Exclusive Live Data
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 flex">
                <div style={{ width: `${easyPct}%` }} className="bg-emerald-500" title={`Easy: ${lcEasy}`} />
                <div style={{ width: `${medPct}%` }} className="bg-amber-500" title={`Medium: ${lcMed}`} />
                <div style={{ width: `${hardPct}%` }} className="bg-rose-500" title={`Hard: ${lcHard}`} />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 p-2 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">Easy</span>
                  <p className="text-base font-black text-emerald-700 dark:text-emerald-400">{lcEasy} ({easyPct}%)</p>
                </div>
                <div className="rounded-lg bg-amber-50/60 dark:bg-amber-950/30 p-2 border border-amber-100 dark:border-amber-900/40">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">Medium</span>
                  <p className="text-base font-black text-amber-700 dark:text-amber-400">{lcMed} ({medPct}%)</p>
                </div>
                <div className="rounded-lg bg-rose-50/60 dark:bg-rose-950/30 p-2 border border-rose-100 dark:border-rose-900/40">
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">Hard</span>
                  <p className="text-base font-black text-rose-700 dark:text-rose-400">{lcHard} ({hardPct}%)</p>
                </div>
              </div>
            </div>

            {/* Macro Categories */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 text-center">
              <div className="rounded-xl bg-white dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Fundamentals</p>
                <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">{topicCounts.fundamentals || 0} problems</p>
              </div>
              <div className="rounded-xl bg-white dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Core DSA</p>
                <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">{topicCounts.core_dsa || 0} problems</p>
              </div>
              <div className="rounded-xl bg-purple-50/50 dark:bg-purple-950/30 p-3.5 border border-purple-100 dark:border-purple-900/40">
                <p className="text-xs font-bold text-purple-700 dark:text-purple-300">Advanced Topics & DP</p>
                <p className="mt-1 text-xl font-black text-purple-700 dark:text-purple-300">{advancedCount} problems</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CODEFORCES NATIVE RATING BANDS & TOPIC TAGS */}
        {activeTab === "codeforces" && (
          <div className="rounded-xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <SiCodeforces className="text-blue-500 text-xl" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Codeforces Native Problem Rating Bands</h4>
                  <p className="text-xs text-slate-500">Categorized by official Codeforces difficulty rating standards, not LeetCode approximations.</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 self-start sm:self-auto">
                {cfTitle} {cfRating > 0 ? `(${cfRating} pts)` : ""}
              </span>
            </div>

            {/* Codeforces Numerical Rating Bands Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { band: "800–999", label: "Introductory", count: cfRatingBands["800–999"] ?? cfRatingBands["< 1000 (Newbie Basics)"] ?? 0, color: "text-slate-700 bg-slate-100 dark:bg-slate-800 border-slate-200" },
                { band: "1000–1199", label: "Elementary", count: cfRatingBands["1000–1199"] ?? cfRatingBands["1000–1199 (Newbie Advanced)"] ?? 0, color: "text-teal-700 bg-teal-50 dark:bg-teal-950/40 border-teal-200" },
                { band: "1200–1399", label: "Easy", count: cfRatingBands["1200–1399"] ?? cfRatingBands["1200–1399 (Pupil)"] ?? 0, color: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200" },
                { band: "1400–1599", label: "Intermediate", count: cfRatingBands["1400–1599"] ?? cfRatingBands["1400–1599 (Specialist)"] ?? 0, color: "text-cyan-700 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200" },
                { band: "1600–1799", label: "Medium-Hard", count: cfRatingBands["1600–1799"] ?? cfRatingBands["1600–1899 (Expert)"] ?? 0, color: "text-blue-700 bg-blue-50 dark:bg-blue-950/40 border-blue-200" },
                { band: "1800–1999", label: "Advanced", count: cfRatingBands["1800–1999"] ?? cfRatingBands["1900–2099 (Candidate Master)"] ?? 0, color: "text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200" },
                { band: "2000–2199", label: "Challenging", count: cfRatingBands["2000–2199"] ?? 0, color: "text-purple-700 bg-purple-50 dark:bg-purple-950/40 border-purple-200" },
                { band: "2200+", label: "Master-Level", count: cfRatingBands["2200+"] ?? cfRatingBands["2100+ (Master+)"] ?? 0, color: "text-rose-700 bg-rose-50 dark:bg-rose-950/40 border-rose-200" },
                { band: "Unrated", label: "Practice/Gym", count: cfRatingBands["Unrated"] || 0, color: "text-slate-500 bg-slate-50 dark:bg-slate-850 border-slate-200" },
              ].map((item) => (
                <div key={item.band} className={`rounded-xl p-3 border ${item.color} text-center`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">{item.band}</span>
                  <span className="text-xs font-semibold block mt-0.5 truncate">{item.label}</span>
                  <p className="text-xl font-black mt-1">{item.count}</p>
                </div>
              ))}
            </div>

            {/* Top Solved Tags */}
            {sortedCfTags.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Tag size={13} className="text-blue-500" />
                  <span>Demonstrated Topic Competencies</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sortedCfTags.map(([tag, count]) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900"
                    >
                      <span>{tag}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-200/60 dark:bg-blue-800 text-blue-900 dark:text-blue-100 font-bold">{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CODECHEF FOCUSED DEEP DIVE */}
        {activeTab === "codechef" && (
          <div className="rounded-xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <SiCodechef className="text-orange-500 text-xl" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">CodeChef User Telemetry & Native Problem Difficulty</h4>
                  <p className="text-xs text-slate-500">Separates official competitive profile standing from native numerical problem difficulty.</p>
                </div>
              </div>
              <span className="text-xs font-bold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950 px-3 py-1 rounded-full border border-orange-200 dark:border-orange-800 self-start sm:self-auto">
                {ccStars && ccStars !== "Unrated" ? `${ccStars} (${ccDivision || "Rated"})` : (ccDivision || "Unrated")}
              </span>
            </div>

            {/* 1. Verified User Profile Telemetry */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-3.5 border border-slate-200 dark:border-slate-750">
                <span className="text-xs font-semibold text-slate-500">Contest Rating</span>
                <p className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">
                  {ccRating ? `${ccRating} pts` : "Unrated"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {ccHighestRating ? `Peak: ${ccHighestRating} pts` : (ccStars || "Standard Coder")}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-3.5 border border-slate-200 dark:border-slate-750">
                <span className="text-xs font-semibold text-slate-500">Star Tier</span>
                <p className="text-2xl font-black text-amber-500 mt-1">
                  {ccStars || "Unrated"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Official 1★–7★ Scale</p>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-3.5 border border-slate-200 dark:border-slate-750">
                <span className="text-xs font-semibold text-slate-500">Global Rank</span>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {ccGlobalRank ? `#${ccGlobalRank.toLocaleString()}` : "Unavailable"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {ccCountryRank ? `Country: #${ccCountryRank.toLocaleString()}` : "Country: Unavailable"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-3.5 border border-slate-200 dark:border-slate-750">
                <span className="text-xs font-semibold text-slate-500">Problems Solved</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {ccSolved}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {user?.codechef?.problems?.unique_solved_count ? `${user.codechef.problems.unique_solved_count} Unique Solves` : "Verified Solves"}
                </p>
              </div>
            </div>

            {/* 2. CodeChef Native Numerical Problem Difficulty Distribution */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Native Numerical Problem Difficulty Distribution
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    Categorized by CodeChef numerical difficulty standards. Strictly no LeetCode Easy/Medium/Hard approximation.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  {ccSolved > 0 ? `${ccSolved} Solved` : "No Activity"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { band: "< 1000", label: "Introductory", count: ccDiffBands["< 1000"] || 0, color: "text-slate-700 bg-slate-100 dark:bg-slate-800 border-slate-200" },
                  { band: "1000–1199", label: "Elementary", count: ccDiffBands["1000–1199"] || 0, color: "text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-200" },
                  { band: "1200–1399", label: "Easy", count: ccDiffBands["1200–1399"] || 0, color: "text-lime-700 bg-lime-50 dark:bg-lime-950/40 border-lime-200" },
                  { band: "1400–1599", label: "Intermediate", count: ccDiffBands["1400–1599"] || 0, color: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200" },
                  { band: "1600–1799", label: "Medium", count: ccDiffBands["1600–1799"] || 0, color: "text-blue-700 bg-blue-50 dark:bg-blue-950/40 border-blue-200" },
                  { band: "1800–1999", label: "Advanced", count: ccDiffBands["1800–1999"] || 0, color: "text-purple-700 bg-purple-50 dark:bg-purple-950/40 border-purple-200" },
                  { band: "2000+", label: "Hard / Expert", count: ccDiffBands["2000+"] || 0, color: "text-rose-700 bg-rose-50 dark:bg-rose-950/40 border-rose-200" },
                  { band: "Unrated", label: "Practice / Learning", count: ccDiffBands["Unrated"] || 0, color: "text-slate-500 bg-slate-50 dark:bg-slate-850 border-slate-200" },
                ].map((item) => (
                  <div key={item.band} className={`rounded-xl p-3 border ${item.color} text-center`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">{item.band}</span>
                    <span className="text-xs font-semibold block mt-0.5 truncate">{item.label}</span>
                    <p className="text-xl font-black mt-1">{item.count}</p>
                  </div>
                ))}
              </div>

              {/* Exact Numerical Difficulty Breakdown Pills */}
              {ccDiffDist.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Exact Numerical Difficulty Aggregation:
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {ccDiffDist.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 dark:bg-orange-950/50 text-orange-800 dark:text-orange-200 border border-orange-200/70 dark:border-orange-900"
                      >
                        <span>{item.difficulty !== null ? `Rating ${item.difficulty}` : "Unrated / Unavailable"}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-orange-200/80 dark:bg-orange-800 text-orange-900 dark:text-orange-100 font-bold">
                          {item.count}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}


        {/* TAB 5: GITHUB FOCUSED DEEP DIVE */}
        {activeTab === "github" && (
          <div className="rounded-xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FaGithub className="text-slate-900 dark:text-white text-xl" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">GitHub Real Code Contributions & Quality</h4>
                  <p className="text-xs text-slate-500">Evaluates original source repositories, commit activity, and code quality rather than empty forks.</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
                {ghCommits} Contributions
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200 dark:border-slate-750">
                <span className="text-xs font-semibold text-slate-500">Verified Contributions</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{ghCommits.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Calendar Activity</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200 dark:border-slate-750">
                <span className="text-xs font-semibold text-slate-500">Original Source Repos</span>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{ghSourceRepos} repos</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Non-fork Original Projects</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200 dark:border-slate-750">
                <span className="text-xs font-semibold text-slate-500">Stars Accrued</span>
                <p className="text-2xl font-black text-amber-500 mt-1">{ghStars} ★</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Community Traction</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200 dark:border-slate-750">
                <span className="text-xs font-semibold text-slate-500">Engineering Score</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{ghEngScore}/100</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Quality Weighted</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CodingOverviewCard;
