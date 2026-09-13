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
import UpcomingEventsCard from "../../components/dashboard/UpcomingEventsCard";
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
          value={user?.leetcode?.solved ?? 0}
          helper="Verified across platforms"
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

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3 min-w-0">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Placement Readiness Score</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Overall score across your career signals.</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              readiness >= 75
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                : readiness >= 40
                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            }`}>
              {readiness >= 75 ? "Excellent" : readiness >= 40 ? "Growing" : "Pending Sync"}
            </span>
          </div>

          <div className="mt-5 flex flex-col items-center">
            <ScoreRing value={readiness} />
            <p className="mt-2 font-semibold text-slate-800 dark:text-slate-200">
              {readiness > 0 ? "Keep Growing! 🚀" : "No Activity Synced Yet"}
            </p>
            <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
              {readiness > 0
                ? "Connect platforms and solve DP/core DSA to maximize your score."
                : "Connect your official LeetCode and GitHub accounts to calculate your score."}
            </p>
            <button
              onClick={() => setReportOpen(true)}
              className="mt-4 w-full rounded-xl bg-indigo-50 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-400 dark:hover:bg-indigo-900/60"
            >
              View Full Report
            </button>
          </div>
        </section>

        <div className="xl:col-span-2 min-w-0">
          <CodingOverviewCard user={user} />
        </div>
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

      <UpcomingEventsCard events={user?.upcomingEvents || []} user={user} />

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
