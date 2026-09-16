import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Lightbulb,
  Sparkles,
  CheckCircle2,
  Code2,
  TrendingUp,
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { useUser } from "../../hooks/useUser";
import { Link } from "react-router-dom";
import careerService from "../../services/careerService";

const Recommendations = () => {
  const { user } = useUser();
  const [apiRecs, setApiRecs] = useState([]);

  const careerGoal = user?.careerGoal || "Software Engineering";
  const readiness = user?.placementReadiness ?? 0;

  const lcSolved = user?.leetcode?.solved ?? 0;
  const cfSolved = user?.codeforces?.solved ?? 0;
  const ccSolved = user?.codechef?.solved ?? (user?.codechef?.problems?.total_solved ?? 0);
  const codingSolved = lcSolved + cfSolved + ccSolved;

  const ghContribs = user?.github?.contributions ?? user?.github?.commits ?? 0;
  const projCount = user?.projects?.length ?? 0;

  useEffect(() => {
    careerService
      .getRecommendations()
      .then((data) => {
        if (data?.recommendations && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
          setApiRecs(data.recommendations);
        }
      })
      .catch(() => {});
  }, []);

  const defaultRoadmap = [
    codingSolved === 0
      ? "Verify your competitive coding handles (LeetCode, Codeforces, or CodeChef) in Profile to benchmark your algorithmic problem solving."
      : `Solve 25 more advanced Dynamic Programming and Graph problems across LeetCode (${lcSolved}), Codeforces (${cfSolved}), or CodeChef (${ccSolved}).`,
    ghContribs === 0
      ? "Link your GitHub account to showcase active commits and repository development."
      : "Containerize your primary project with Docker and configure CI/CD test automation.",
    projCount === 0
      ? "Build and document an end-to-end full-stack or ML application in your Portfolio."
      : "Deploy your primary portfolio project to a live cloud host and link the URL in Portfolio.",
    "Master core low-level System Design fundamentals: caching, database indexing, and REST API scalability.",
  ];

  const recs =
    user?.recommendations && user.recommendations.length > 0
      ? user.recommendations
      : apiRecs.length > 0
      ? apiRecs
      : defaultRoadmap;

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <PageHeader
        eyebrow="AI Career Intelligence"
        title="Recommendations & Action Roadmap"
        description={`Personalized high-leverage milestones generated from your target role (${careerGoal}), verified skill gaps, and platform velocity.`}
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          {
            title: "Target Alignment",
            value: readiness > 0 ? `${readiness}%` : "0%",
            icon: BriefcaseBusiness,
            text:
              readiness > 0
                ? `Competencies benchmarked against ${careerGoal}.`
                : `Connect handles to compute alignment against ${careerGoal}.`,
          },
          {
            title: "Coding Solved",
            value: `${codingSolved}`,
            icon: Code2,
            text: (
              <span className="font-semibold text-xs flex items-center gap-1.5 flex-wrap">
                <span className="text-amber-600 dark:text-amber-400">{lcSolved} LC</span> ·
                <span className="text-blue-600 dark:text-blue-400">{cfSolved} CF</span> ·
                <span className="text-orange-600 dark:text-orange-400">{ccSolved} CC</span>
              </span>
            ),
          },
          {
            title: "Learning Priority",
            value: codingSolved >= 100 ? "Advanced Depth" : "Fundamentals",
            icon: BookOpen,
            text:
              codingSolved < 100
                ? "Focus on core algorithmic patterns (DP, graphs, trees) and consistency."
                : "Focus on cloud deployment, distributed system design and automation.",
          },
          {
            title: "Portfolio Projects",
            value: `${projCount} Active`,
            icon: Lightbulb,
            text:
              projCount > 0
                ? `${ghContribs} git commits across public repositories.`
                : "Add your first full-stack or ML project in Portfolio.",
          },
        ].map(({ title, value, icon: Icon, text }) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs min-w-0 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {title}
                </p>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60">
                  <Icon size={17} className="text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white truncate">
                {value}
              </p>
            </div>
            <div className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
              {text}
            </div>
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
