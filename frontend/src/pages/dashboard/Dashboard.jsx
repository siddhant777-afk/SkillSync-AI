import { useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, CheckCircle2, CircleUserRound } from "lucide-react";
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
import { useUser } from "../../hooks/useUser";

const Dashboard = () => {
  const { user } = useUser();
  const [reportOpen, setReportOpen] = useState(false);

  const userName = user?.name ? user.name.split(" ")[0] : "Student";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${userName}! 👋`}
        description="Code. Learn. Improve. Repeat. Your career intelligence snapshot is ready."
        action={
          <button
            onClick={() => setReportOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            View Full Report <ArrowUpRight size={16} />
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Placement Readiness"
          value={`${user?.placementReadiness ?? 82}/100`}
          helper="↑ 6 points this month"
          icon={BriefcaseBusiness}
          tone="green"
        />
        <StatCard
          label="Profile Completion"
          value={`${user?.profileCompletion ?? 90}%`}
          helper="2 items left to complete"
          icon={CircleUserRound}
          tone="purple"
        />
        <StatCard
          label="Coding Problems"
          value={user?.leetcode?.solved ?? 420}
          helper="Across competitive platforms"
          icon={CheckCircle2}
          tone="indigo"
        />
        <StatCard
          label="GitHub Contributions"
          value={user?.github?.contributions ?? 620}
          helper="Last 12 months"
          icon={ArrowUpRight}
          tone="blue"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Placement Readiness Score</h2>
              <p className="mt-1 text-sm text-slate-500">Overall score across your career signals.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Good</span>
          </div>

          <div className="mt-5 flex flex-col items-center">
            <ScoreRing value={user?.placementReadiness ?? 82} />
            <p className="mt-2 font-semibold text-slate-800">Great job! 🎉</p>
            <p className="mt-1 text-center text-sm text-slate-500">Keep improving your cloud, system design and deployment skills.</p>
            <button
              onClick={() => setReportOpen(true)}
              className="mt-4 w-full rounded-xl bg-indigo-50 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
            >
              View Full Report
            </button>
          </div>
        </section>

        <div className="xl:col-span-2">
          <CodingOverviewCard user={user} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SkillsOverviewCard skills={user?.skills || []} />
        <ProgressOverviewCard progress={user?.progress} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <RecentAchievementsCard achievements={user?.achievements || []} />
        <AIRecommendationsCard recommendations={user?.recommendations || []} />
        <AISkillGapCard skills={user?.skills || []} gaps={user?.skillGaps || []} />
      </div>

      <UpcomingEventsCard events={user?.upcomingEvents || []} />

      <PlacementReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        user={user}
      />
    </div>
  );
};

export default Dashboard;
