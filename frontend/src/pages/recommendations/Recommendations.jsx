import { ArrowRight, BookOpen, BriefcaseBusiness, Lightbulb, Sparkles, CheckCircle2 } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { useUser } from "../../hooks/useUser";
import { Link } from "react-router-dom";

const Recommendations = () => {
  const { user } = useUser();

  const careerGoal = user?.careerGoal || "Software Engineering";
  const readiness = user?.placementReadiness ?? 0;
  const lcSolved = user?.leetcode?.solved ?? 0;
  const ghContribs = user?.github?.contributions ?? 0;
  const projCount = user?.projects?.length ?? 0;

  const defaultRoadmap = [
    lcSolved === 0
      ? "Verify your LeetCode handle in Profile to benchmark your algorithmic problem solving."
      : "Solve 30 more Medium/Hard Dynamic Programming and Graph problems on LeetCode.",
    ghContribs === 0
      ? "Link your GitHub account to showcase active commits and repository development."
      : "Containerize your primary project with Docker and configure CI/CD test automation.",
    projCount === 0
      ? "Build and document an end-to-end full-stack or ML application in your Portfolio."
      : "Deploy your primary portfolio project to a live cloud host and link the URL.",
    "Practice core low-level System Design: master caching, database indexing, and REST APIs.",
  ];

  const recs = user?.recommendations && user.recommendations.length > 0
    ? user.recommendations
    : defaultRoadmap;

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <PageHeader
        eyebrow="AI Career Intelligence"
        title="Recommendations & Action Roadmap"
        description={`Personalized high-leverage milestones generated from your target role (${careerGoal}), verified skill gaps, and platform velocity.`}
      />

      <div className="grid gap-6 lg:grid-cols-3 min-w-0">
        {[
          {
            title: "Target Alignment",
            value: readiness > 0 ? `${readiness}%` : "0%",
            icon: BriefcaseBusiness,
            text: readiness > 0
              ? `Your competencies are benchmarked against ${careerGoal}.`
              : `Connect handles to compute alignment against ${careerGoal}.`,
          },
          {
            title: "Learning Priority",
            value: readiness > 60 ? "Advanced" : "Fundamentals",
            icon: BookOpen,
            text: lcSolved < 100
              ? "Focus on core DSA (arrays, strings, trees) and algorithmic consistency."
              : "Focus on cloud deployment, scalable system design and automated pipelines.",
          },
          {
            title: "Portfolio Projects",
            value: `${projCount} Active`,
            icon: Lightbulb,
            text: projCount > 0
              ? "Add live deployment links and architectural diagrams to your repositories."
              : "Add your first full-stack or machine learning project in Portfolio.",
          },
        ].map(({ title, value, icon: Icon, text }) => (
          <div key={title} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60">
              <Icon size={19} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{title}</p>
            <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white truncate">{value}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400 break-words">{text}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-900 dark:to-indigo-950/30 p-6 min-w-0">
        <div className="flex items-start gap-3">
          <Sparkles size={21} className="mt-1 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Sequenced Action Plan</h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Complete these targeted milestones to increase your recruiter matching score and placement readiness.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3 min-w-0">
          {recs.map((item, index) => (
            <div
              key={item || index}
              className="flex items-center gap-4 rounded-xl bg-white dark:bg-slate-850 p-4 shadow-xs border border-slate-100 dark:border-slate-800 transition hover:border-indigo-200 dark:hover:border-indigo-800 min-w-0"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 dark:bg-indigo-500 text-xs font-bold text-white">
                {index + 1}
              </span>
              <p className="flex-1 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium break-words">{item}</p>
              <ArrowRight size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Recommendations;
