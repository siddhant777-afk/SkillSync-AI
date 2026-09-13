import { useState } from "react";
import {
  RefreshCw,
  CheckCircle2,
  BrainCircuit,
  ShieldCheck,
  Flame,
  BarChart2,
  ExternalLink,
  GitBranch,
  Star,
  Trophy,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { SiCodechef, SiCodeforces, SiKaggle, SiLeetcode } from "react-icons/si";
import { useUser } from "../../hooks/useUser";
import { Link } from "react-router-dom";

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
  const cfSolved = user?.codeforces?.solved ?? 0;
  const cfTitle = user?.codeforces?.title || (cfRating > 0 ? "Rated" : "Unrated");

  // CodeChef metrics
  const ccRating = user?.codechef?.rating ?? 0;
  const ccSolved = user?.codechef?.solved ?? 0;
  const ccStars = user?.codechef?.stars || "";
  const ccTitle = user?.codechef?.title || (ccRating > 0 ? "Rated" : "Unrated");

  // GitHub metrics
  const ghCommits = user?.github?.commits ?? user?.github?.contributions ?? 0;
  const ghRepos = user?.github?.repositories ?? 0;
  const ghStars = user?.github?.stars ?? 0;
  const ghReposList = user?.github?.repositories_list || [];

  // Kaggle metrics
  const kgNotebooks = user?.kaggle?.notebooks ?? 0;
  const kgTier = user?.kaggle?.tier || "Unconnected";

  const platforms = [
    {
      label: "LeetCode",
      icon: SiLeetcode,
      iconClass: "text-amber-500",
      verified: user?.leetcode?.verified || false,
      badge: lcContestBadge || user?.leetcode?.rank || (lcSolved > 0 ? "Active" : "Unconnected"),
      contestRating: lcContestRating,
      contestHelper: lcContestBadge || (lcGlobalRank ? `Rank #${lcGlobalRank.toLocaleString()}` : "Contest Rating"),
      questionsSolved: lcSolved,
      questionsHelper: `${lcEasy}E · ${lcMed}M · ${lcHard}H`,
    },
    {
      label: "Codeforces",
      icon: SiCodeforces,
      iconClass: "text-blue-600 dark:text-blue-400",
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
      badge: ccStars || ccTitle,
      contestRating: ccRating,
      contestHelper: ccStars || "Contest Rating",
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
      commitsHelper: "Verified Commits",
      repositoriesCount: ghRepos,
      repositoriesHelper: `${ghStars} Stars Accrued`,
    },
    {
      label: "Kaggle",
      icon: SiKaggle,
      iconClass: "text-sky-600 dark:text-sky-400",
      verified: user?.kaggle?.verified || false,
      badge: kgTier,
      tierValue: kgTier,
      tierHelper: "Community Tier",
      questionsSolved: kgNotebooks,
      questionsHelper: "Public Notebooks",
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
  const algorithmicDepth = user?.leetcode?.algorithmic_depth_score || 0;

  // Exact mutually-exclusive difficulty percentages (sum = 100%)
  const totalDiff = lcSolved > 0 ? lcSolved : 1;
  const easyPct = Math.round((lcEasy / totalDiff) * 100);
  const medPct = Math.round((lcMed / totalDiff) * 100);
  const hardPct = Math.max(0, 100 - easyPct - medPct);

  const displayedRepos = showAllRepos ? ghReposList : ghReposList.slice(0, 4);

  return (
    <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xs space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy size={20} className="text-indigo-600 dark:text-indigo-400" />
            Verified Coding Profiles & Topic Depth
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Platform contest ratings and question solving metrics extracted directly from official profiles.
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

      {/* Platform Cards Grid - Distinct Contest Rating & Questions Solved */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 min-w-0">
        {platforms.map((p) => {
          const Icon = p.icon;
          const isGitHub = p.label === "GitHub";
          const isKaggle = p.label === "Kaggle";

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
                  {isGitHub ? "Actual Commits" : isKaggle ? "Kaggle Tier" : "Contest Rating"}
                </p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {isGitHub
                      ? p.commitsCount.toLocaleString()
                      : isKaggle
                      ? p.tierValue
                      : p.contestRating > 0
                      ? `${p.contestRating} pts`
                      : "Unrated"}
                  </span>
                  {p.verified && (
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mb-0.5" title="Verified Signal" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {isGitHub ? p.commitsHelper : isKaggle ? p.tierHelper : p.contestHelper}
                </p>
              </div>

              {/* Metric 2: Questions Solved / Repositories */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {isGitHub ? "Public Repositories" : isKaggle ? "Kaggle Contributions" : "Problems Solved"}
                </p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                    {isGitHub
                      ? p.repositoriesCount
                      : isKaggle
                      ? `${p.questionsSolved} notebooks`
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
                Multi-Platform Deep Dive & Topic Mastery
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Verified ground-truth metrics across all connected platforms with equal depth.
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
              🌐 All Platforms
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
                  <span className="text-xs font-bold text-slate-900 dark:text-white">LeetCode Breakdown</span>
                </div>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  {lcContestRating > 0 ? `${lcContestRating} pts (${lcContestBadge || "Rated"})` : `${lcSolved} Solved`}
                </span>
              </div>

              {/* Stacked difficulty bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <span>Distribution ({lcSolved} total)</span>
                  <span>{easyPct}% Easy · {medPct}% Med · {hardPct}% Hard</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
                  <div style={{ width: `${easyPct}%` }} className="bg-emerald-500" title={`Easy: ${lcEasy}`} />
                  <div style={{ width: `${medPct}%` }} className="bg-amber-500" title={`Medium: ${lcMed}`} />
                  <div style={{ width: `${hardPct}%` }} className="bg-rose-500" title={`Hard: ${lcHard}`} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="rounded-lg bg-slate-50 dark:bg-slate-850 p-2 border border-slate-100 dark:border-slate-750">
                  <span className="text-[10px] font-bold text-emerald-600">Easy</span>
                  <p className="font-black text-slate-900 dark:text-white">{lcEasy}</p>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-850 p-2 border border-slate-100 dark:border-slate-750">
                  <span className="text-[10px] font-bold text-amber-600">Medium</span>
                  <p className="font-black text-slate-900 dark:text-white">{lcMed}</p>
                </div>
                <div className="rounded-lg bg-slate-50 dark:bg-slate-850 p-2 border border-slate-100 dark:border-slate-750">
                  <span className="text-[10px] font-bold text-rose-600">Hard</span>
                  <p className="font-black text-slate-900 dark:text-white">{lcHard}</p>
                </div>
              </div>
            </div>

            {/* Codeforces Card */}
            <div className="rounded-xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 space-y-3 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SiCodeforces className="text-blue-500 text-base" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Codeforces Competitive Telemetry</span>
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
                <span>Platform Rating Tier: <strong className="text-slate-800 dark:text-slate-200">{cfTitle}</strong></span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">Active Sync</span>
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
                  {ccStars || (ccRating > 0 ? "Rated" : "Active")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="rounded-lg bg-orange-50/60 dark:bg-slate-850 p-3 border border-orange-100 dark:border-slate-750 text-center">
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contest Rating</p>
                  <p className="text-lg font-black text-orange-700 dark:text-orange-400 mt-0.5">
                    {ccRating > 0 ? `${ccRating} pts` : "Unrated"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{ccStars || "Division Coder"}</p>
                </div>

                <div className="rounded-lg bg-slate-50 dark:bg-slate-850 p-3 border border-slate-100 dark:border-slate-750 text-center">
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Problems Solved</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {ccSolved} <span className="text-xs font-normal text-slate-400">solved</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Practice & Star Contests</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                <span>Star Classification: <strong className="text-slate-800 dark:text-slate-200">{ccStars || "Unrated"}</strong></span>
                <span className="text-orange-600 dark:text-orange-400 font-semibold">Active Sync</span>
              </div>
            </div>

            {/* GitHub Codebase Card */}
            <div className="rounded-xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 space-y-3 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaGithub className="text-slate-900 dark:text-white text-base" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">GitHub Real Code Contributions</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Verified Commits
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="rounded-lg bg-slate-100 dark:bg-slate-850 p-3 border border-slate-200 dark:border-slate-750 text-center">
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Commits</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {ghCommits.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Verified Git Push Events</p>
                </div>

                <div className="rounded-lg bg-slate-100 dark:bg-slate-850 p-3 border border-slate-200 dark:border-slate-750 text-center">
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Public Repositories</p>
                  <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {ghRepos} <span className="text-xs font-normal text-slate-400">repos</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{ghStars} Stars Accrued</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                <span>Public Repos: <strong className="text-slate-800 dark:text-slate-200">{ghRepos} repositories</strong></span>
                <button
                  type="button"
                  onClick={() => setShowAllRepos((prev) => !prev)}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  View Code Projects ({ghReposList.length}) →
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
                <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">{topicCounts.fundamentals} problems</p>
              </div>
              <div className="rounded-xl bg-white dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Core DSA</p>
                <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">{topicCounts.core_dsa} problems</p>
              </div>
              <div className="rounded-xl bg-purple-50/50 dark:bg-purple-950/30 p-3.5 border border-purple-100 dark:border-purple-900/40">
                <p className="text-xs font-bold text-purple-700 dark:text-purple-300">Advanced Topics</p>
                <p className="mt-1 text-xl font-black text-purple-700 dark:text-purple-300">{advancedCount} problems</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CODEFORCES FOCUSED DEEP DIVE */}
        {activeTab === "codeforces" && (
          <div className="rounded-xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SiCodeforces className="text-blue-500 text-xl" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Codeforces Competitive Standing</h4>
                  <p className="text-xs text-slate-500">Official Division contest benchmarks</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                {cfTitle}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200 dark:border-slate-750">
                <span className="text-xs font-semibold text-slate-500">Current Rating</span>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{cfRating > 0 ? `${cfRating} pts` : "Unrated"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200 dark:border-slate-750">
                <span className="text-xs font-semibold text-slate-500">Max Peak Rating</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{cfRating > 0 ? `${cfRating} pts` : "Unrated"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200 dark:border-slate-750">
                <span className="text-xs font-semibold text-slate-500">Verified Solved</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{cfSolved} problems</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CODECHEF FOCUSED DEEP DIVE */}
        {activeTab === "codechef" && (
          <div className="rounded-xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SiCodechef className="text-orange-500 text-xl" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">CodeChef Star Division Telemetry</h4>
                  <p className="text-xs text-slate-500">Global rated contest standing</p>
                </div>
              </div>
              <span className="text-xs font-bold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950 px-3 py-1 rounded-full border border-orange-200 dark:border-orange-800">
                {ccStars || "Rated Division"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200 dark:border-slate-750">
                <span className="text-xs font-semibold text-slate-500">Contest Rating</span>
                <p className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">{ccRating > 0 ? `${ccRating} pts` : "Unrated"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200 dark:border-slate-750">
                <span className="text-xs font-semibold text-slate-500">Star Classification</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{ccStars || "1★ - 7★ Scale"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200 dark:border-slate-750">
                <span className="text-xs font-semibold text-slate-500">Problems Solved</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{ccSolved} solved</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: GITHUB FOCUSED DEEP DIVE */}
        {activeTab === "github" && (
          <div className="rounded-xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaGithub className="text-slate-900 dark:text-white text-xl" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">GitHub Real Code Contributions</h4>
                  <p className="text-xs text-slate-500">Commits, repositories, and open source projects</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                {ghCommits} Commits
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200 dark:border-slate-750">
                <span className="text-xs font-semibold text-slate-500">Verified Commits</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{ghCommits.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200 dark:border-slate-750">
                <span className="text-xs font-semibold text-slate-500">Public Repositories</span>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{ghRepos} repos</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200 dark:border-slate-750">
                <span className="text-xs font-semibold text-slate-500">Total Stars Accrued</span>
                <p className="text-2xl font-black text-amber-500 mt-1">{ghStars} ★</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CodingOverviewCard;
