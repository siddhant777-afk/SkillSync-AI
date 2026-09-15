import { useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, CheckCircle2, CircleUserRound, ShieldAlert, ShieldCheck } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import ScoreRing from "../../components/dashboard/ScoreRing";
import CodingOverviewCard from "../../components/dashboard/CodingOverviewCard";
import SkillsOverviewCard from "../../components/dashboard/SkillsOverviewCard";
import ProgressOverviewCard from "../../components/dashboard/ProgressOverviewCard";
import RecentAchievementsCard from "../../components/dashboard/RecentAchievementsCard";
import AIRecommendationsCard from "../../components/dashboard/AIRecommendationsCard";
import AISkillGapCard from "../../components/dashboard/AISkillGapCard";
import ContestCalendar from "../../components/dashboard/ContestCalendar";
import PlacementReportModal from "../../components/modals/PlacementReportModal";
import PlatformVerificationModal from "../../components/modals/PlatformVerificationModal";
import { useUser } from "../../hooks/useUser";

const Dashboard = () => {
  const { user, isLoading, refetch } = useUser();
  const [reportOpen, setReportOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  if (isLoading && !user) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading your career intelligence dashboard...</p>
        </div>
      </div>
    );
  }

  const userName = user?.name ? user.name.split(" ")[0] : "Student";
  const hasUnverified = !user?.leetcode?.verified || !user?.github?.verified;
  const readiness = user?.placementReadiness ?? 0;
  const lcSolved = user?.leetcode?.solved ?? 0;
  const cfSolved = user?.codeforces?.solved ?? 0;
  const ccSolved = user?.codechef?.solved ?? (user?.codechef?.problems?.total_solved ?? 0);
  const totalCodingProblems = lcSolved + cfSolved + ccSolved;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${userName}! 👋`}
        description="Code. Learn. Improve. Repeat. Your verified career intelligence snapshot is ready."
        action={
          <button
            onClick={() => setReportOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 shrink-0"
          >
            View Full Report <ArrowUpRight size={16} />
          </button>
        }
      />

      {/* Unverified Platforms Prompt Banner */}
      {hasUnverified && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-amber-900 transition-colors duration-200 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
              <ShieldAlert size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold">Coding Platform IDs Not Verified</p>
              <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-0.5 break-words">
                Connect and verify your LeetCode and GitHub handles to enable live algorithmic tracking and official contest recognition.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setVerifyModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition shrink-0 self-start sm:self-auto w-full sm:w-auto"
          >
            <ShieldCheck size={14} /> Verify IDs Now →
          </button>
        </div>
      )}

      {/* Primary KPI StatCards */}
      <div className="grid gap-3.5 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 min-w-0">
        <StatCard
          label="Placement Readiness"
          value={`${readiness}/100`}
          helper="Evaluated from verified platforms"
          icon={BriefcaseBusiness}
          tone="green"
        />
        <StatCard
          label="Profile Completion"
          value={`${user?.profileCompletion ?? 0}%`}
          helper="Academic & coding profiles"
          icon={CircleUserRound}
          tone="purple"
        />
        <StatCard
          label="Coding Problems"
          value={totalCodingProblems}
          helper={
            <span className="flex items-center gap-1.5 flex-wrap font-semibold text-[11px]">
              <span className="text-amber-600 dark:text-amber-400">{lcSolved} LC</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="text-blue-600 dark:text-blue-400">{cfSolved} CF</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="text-orange-600 dark:text-orange-400">{ccSolved} CC</span>
            </span>
          }
          icon={CheckCircle2}
          tone="indigo"
        />
        <StatCard
          label="GitHub Contributions"
          value={user?.github?.contributions ?? 0}
          helper="Last 12 months verified"
          icon={ArrowUpRight}
          tone="blue"
        />
      </div>

      {/* FULL-WIDTH PLACEMENT READINESS INTELLIGENCE CENTER */}
      <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-xs space-y-6 min-w-0 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Placement Readiness Intelligence Center
              </h2>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Composite career index calculated from verified algorithmic problem solving, contest ratings, codebase commits, and domain depth.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold border ${
                readiness >= 80
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  : readiness >= 50
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                  : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
              }`}
            >
              {readiness >= 80 ? "🏆 Tier-1 FAANG & Unicorn Ready" : readiness >= 50 ? "🚀 High Engineering Readiness" : "🌱 Foundations in Progress"}
            </span>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target: {user?.careerGoal || "Full Stack Engineer"}
            </span>
          </div>
        </div>

        {/* Center Grid: Visual Radial Gauge + 4 Sub-Score Evaluation Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center min-w-0">
          {/* Left Column: Centered Radial Gauge with Percentile Standing */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-indigo-50/60 to-slate-50/40 dark:from-slate-850 dark:to-slate-900 border border-indigo-100/70 dark:border-slate-800 text-center space-y-3">
            <ScoreRing value={readiness} />

            <div className="space-y-1">
              <p className="text-sm font-black text-slate-900 dark:text-white">
                {readiness >= 75 ? "Top Tier Competitiveness" : readiness >= 40 ? "Steady Growth Trajectory" : "Profile Sync Required"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                {readiness >= 75
                  ? "Top 5% candidate standing among GL Bajaj Institute & peer colleges."
                  : "Connect your official coding platforms to unlock continuous automated evaluation."}
              </p>
            </div>

            <div className="pt-2 w-full">
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 dark:bg-indigo-500 py-2.5 px-4 text-xs font-bold text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition shadow-xs"
              >
                📄 View Full Diagnostic Report
              </button>
            </div>
          </div>

          {/* Right Column: 4 Sub-Score Evaluation Pillars with High-Contrast Progress Bars */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5 min-w-0">
            {/* Pillar 1: DSA & Algorithmic Depth */}
            <div className="rounded-xl bg-slate-50/70 dark:bg-slate-850/70 border border-slate-200/80 dark:border-slate-800 p-4 space-y-2 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  1. Algorithmic Problem Solving
                </span>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                  {user?.ranking?.dimension_scores?.problem_solving_depth ?? (totalCodingProblems > 0 ? Math.min(100, Math.round((totalCodingProblems / 350) * 100)) : Math.min(100, Math.round(readiness * 1.05)))}/100
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-750 overflow-hidden">
                <div
                  style={{ width: `${user?.ranking?.dimension_scores?.problem_solving_depth ?? (totalCodingProblems > 0 ? Math.min(100, Math.round((totalCodingProblems / 350) * 100)) : Math.min(100, Math.round(readiness * 1.05)))}%` }}
                  className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-1 flex-wrap">
                <span>{totalCodingProblems} solved total</span>
                <span className="font-semibold text-[10px]">
                  <span className="text-amber-600 dark:text-amber-400">{lcSolved} LC</span> ·{" "}
                  <span className="text-blue-600 dark:text-blue-400">{cfSolved} CF</span> ·{" "}
                  <span className="text-orange-600 dark:text-orange-400">{ccSolved} CC</span>
                </span>
              </div>
            </div>

            {/* Pillar 2: Real Code & Verified Projects */}
            <div className="rounded-xl bg-slate-50/70 dark:bg-slate-850/70 border border-slate-200/80 dark:border-slate-800 p-4 space-y-2 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  2. Projects & Git Contributions
                </span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {user?.github?.repositories ? Math.min(100, Math.round(user.github.repositories * 15 + (user.github.commits ? 25 : 0))) : Math.min(100, Math.round(readiness * 0.95))}/100
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-750 overflow-hidden">
                <div
                  style={{ width: `${user?.github?.repositories ? Math.min(100, Math.round(user.github.repositories * 15 + (user.github.commits ? 25 : 0))) : Math.min(100, Math.round(readiness * 0.95))}%` }}
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {user?.github?.contributions || user?.github?.commits || 0} Commits · {user?.github?.repositories || 0} Repositories
              </p>
            </div>

            {/* Pillar 3: Contest Consistency & Speed */}
            <div className="rounded-xl bg-slate-50/70 dark:bg-slate-850/70 border border-slate-200/80 dark:border-slate-800 p-4 space-y-2 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  3. Contest Rating Benchmark
                </span>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                  {Math.max(user?.leetcode?.contest_rating || 0, user?.codeforces?.rating || 0, user?.codechef?.rating || 0) > 0 ? Math.min(100, Math.round((Math.max(user?.leetcode?.contest_rating || 0, user?.codeforces?.rating || 0, user?.codechef?.rating || 0) / 1900) * 100)) : Math.min(100, Math.round(readiness * 0.9))}/100
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-750 overflow-hidden">
                <div
                  style={{ width: `${Math.max(user?.leetcode?.contest_rating || 0, user?.codeforces?.rating || 0, user?.codechef?.rating || 0) > 0 ? Math.min(100, Math.round((Math.max(user?.leetcode?.contest_rating || 0, user?.codeforces?.rating || 0, user?.codechef?.rating || 0) / 1900) * 100)) : Math.min(100, Math.round(readiness * 0.9))}%` }}
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Peak Rating: {Math.max(user?.leetcode?.contest_rating || 0, user?.codeforces?.rating || 0, user?.codechef?.rating || 0) || "Unrated"} pts
              </p>
            </div>

            {/* Pillar 4: Domain Stack & Profile Completion */}
            <div className="rounded-xl bg-slate-50/70 dark:bg-slate-850/70 border border-slate-200/80 dark:border-slate-800 p-4 space-y-2 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  4. Academic & Skill Alignment
                </span>
                <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                  {user?.profileCompletion ?? 0}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-750 overflow-hidden">
                <div
                  style={{ width: `${user?.profileCompletion ?? 0}%` }}
                  className="h-full rounded-full bg-purple-500 transition-all duration-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {user?.college || "GL Bajaj Institute of Technology and Management"}
              </p>
            </div>
          </div>
        </div>

        {/* Diagnostic Action Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="text-amber-500 font-bold">⚡ AI Growth Recommendation:</span>
            <span>Focus on Advanced Topics (DP & Graph traversal) to reach the 95+ Placement Readiness threshold.</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/resume"
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              Optimize Resume For This Score →
            </a>
          </div>
        </div>
      </section>

      {/* FULL-WIDTH CODING OVERVIEW CARD */}
      <div className="w-full min-w-0">
        <CodingOverviewCard user={user} />
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2 min-w-0">
        <SkillsOverviewCard skills={user?.skills || []} />
        <ProgressOverviewCard progress={user?.progress} />
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 min-w-0">
        <RecentAchievementsCard achievements={user?.achievements || []} />
        <AIRecommendationsCard recommendations={user?.recommendations || []} />
        <AISkillGapCard skills={user?.skills || []} gaps={user?.skillGaps || []} />
      </div>

      <ContestCalendar user={user} />

      {/* Full Placement Report Modal */}
      <PlacementReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        user={user}
      />

      {/* Platform ID Verification Modal */}
      <PlatformVerificationModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        user={user}
        onSyncSuccess={() => {
          if (refetch) refetch();
        }}
      />
    </div>
  );
};

export default Dashboard;
