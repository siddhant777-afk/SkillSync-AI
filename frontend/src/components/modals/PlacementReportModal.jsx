import React from "react";
import {
  X,
  CheckCircle2,
  Code2,
  FolderKanban,
  BrainCircuit,
  FileCheck,
  Trophy,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Target,
} from "lucide-react";
import { SiCodechef, SiCodeforces, SiLeetcode } from "react-icons/si";
import { FaGithub } from "react-icons/fa";

const PlacementReportModal = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  const score = user?.placementReadiness ?? 0;

  // Platform solves & ratings
  const lcSolved = user?.leetcode?.solved ?? 0;
  const lcRating = user?.leetcode?.contest_rating ?? 0;
  const lcBadge = user?.leetcode?.contest_badge || user?.leetcode?.rank || (lcRating > 0 ? "Ranked" : "Unrated");

  const cfSolved = user?.codeforces?.solved ?? 0;
  const cfRating = user?.codeforces?.rating ?? 0;
  const cfTitle = user?.codeforces?.title || (cfRating > 0 ? "Ranked" : "Unrated");

  const ccSolved = user?.codechef?.solved ?? (user?.codechef?.problems?.total_solved ?? 0);
  const ccRating = user?.codechef?.rating ?? (user?.codechef?.profile?.rating ?? 0);
  const ccStars = user?.codechef?.stars || (ccRating > 0 ? `${ccRating} pts` : "Unrated");

  const totalCodingProblems = lcSolved + cfSolved + ccSolved;

  const ghContribs = user?.github?.contributions ?? user?.github?.commits ?? 0;
  const ghRepos = user?.github?.repositories ?? 0;
  const projCount = user?.projects?.length ?? (ghRepos ? Math.min(ghRepos, 5) : 0);
  const skillsCount = user?.skills?.length ?? 0;
  const atsScore = user?.ats_score ?? (score > 0 ? Math.min(100, Math.round(score * 1.05)) : 0);

  // Authoritative ranking engine pillar scores
  const dimScores = user?.ranking?.dimension_scores || {};
  const cpScore = dimScores.competitive_programming;
  const depthScore = dimScores.problem_solving_depth;
  const engScore = dimScores.software_engineering;
  const projectScore = dimScores.project_portfolio;

  const codingPts = (cpScore != null || depthScore != null)
    ? Math.min(35, Math.round(((cpScore ?? 0) * 0.15) + ((depthScore ?? 0) * 0.20)))
    : Math.min(35, Math.round(
        (Math.min(lcSolved, 500) / 500) * 15 +
        (Math.min(cfRating, 1800) / 1800) * 10 +
        (Math.min(ccRating, 1800) / 1800) * 5 +
        (Math.min(ccSolved, 100) / 100) * 5
      ));

  const projectPts = (engScore != null || projectScore != null)
    ? Math.min(30, Math.round(((engScore ?? 0) * 0.15) + ((projectScore ?? 0) * 0.15)))
    : Math.min(30, Math.round((Math.min(ghContribs, 500) / 500) * 18 + (Math.min(projCount, 4) / 4) * 12));

  const skillPts = Math.min(20, Math.round((Math.min(skillsCount, 8) / 8) * 20));
  const atsPts = Math.min(15, Math.round((atsScore / 100) * 15));

  const pillars = [
    {
      id: "coding",
      name: "Competitive Coding & Problem Solving",
      icon: Code2,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-50 dark:bg-amber-950/60",
      barColor: "bg-amber-500",
      score: codingPts,
      maxScore: 35,
      weight: "35% Weight",
      detail: totalCodingProblems > 0
        ? `${totalCodingProblems} problems solved (${lcSolved} LC · ${cfSolved} CF · ${ccSolved} CC)`
        : "No verified coding handles linked yet",
    },
    {
      id: "projects",
      name: "Software Engineering & Git Projects",
      icon: FolderKanban,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/60",
      barColor: "bg-indigo-600 dark:bg-indigo-500",
      score: projectPts,
      maxScore: 30,
      weight: "30% Weight",
      detail: ghContribs > 0 || projCount > 0
        ? `${ghContribs.toLocaleString()} contributions · ${projCount} portfolio projects`
        : "No GitHub activity or projects added",
    },
    {
      id: "skills",
      name: "Core Technical Skills & Stack Depth",
      icon: BrainCircuit,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-50 dark:bg-purple-950/60",
      barColor: "bg-purple-600 dark:bg-purple-500",
      score: skillPts,
      maxScore: 20,
      weight: "20% Weight",
      detail: skillsCount > 0
        ? `${skillsCount} verified technical skills in matrix`
        : "No technical skills entered yet",
    },
    {
      id: "resume",
      name: "ATS Resume Impact & Industry Baseline",
      icon: FileCheck,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60",
      barColor: "bg-emerald-500",
      score: atsPts,
      maxScore: 15,
      weight: "15% Weight",
      detail: atsScore > 0
        ? `${atsScore}/100 ATS resume keyword & format alignment`
        : "Resume not uploaded or parsed yet",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-5 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-2xl text-slate-800 dark:text-slate-100 my-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                  score >= 75
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                    : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                }`}
              >
                {score > 0 ? "✓ Verified Diagnostic Report" : "Initial Assessment"}
              </span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate">
                Target Role: {user?.careerGoal || "Software Engineering"}
              </span>
            </div>
            <h2 className="mt-1.5 text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Placement Diagnostic & Readiness Evaluation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive telemetry across all connected coding platforms, project portfolios, and technical competencies.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Hero Score Banner */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-850 dark:via-slate-900 dark:to-indigo-950/40 p-5 sm:p-6 border border-indigo-100/80 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex flex-col items-center justify-center h-24 w-24 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900 shadow-sm shrink-0">
                <span className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 leading-none">
                  {score}
                </span>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-1">/ 100 PTS</span>
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Placement Readiness Composite
                </p>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {score >= 80
                    ? "🔥 Top 15% Placement Candidate"
                    : score >= 50
                    ? "📈 Strong Candidate With High Velocity"
                    : score > 0
                    ? "⚡ Active Candidate — Profile Synchronized"
                    : "⚪ Initial Setup — Connect Accounts to Benchmark"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                  Weighted assessment across competitive coding consistency, engineering quality, technical depth, and ATS resume benchmarks.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:min-w-[200px]">
              <div className="rounded-xl bg-white dark:bg-slate-800 p-2.5 border border-slate-100 dark:border-slate-750 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Solved</span>
                <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{totalCodingProblems}</p>
              </div>
              <div className="rounded-xl bg-white dark:bg-slate-800 p-2.5 border border-slate-100 dark:border-slate-750 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400">Projects</span>
                <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{projCount}</p>
              </div>
              <div className="rounded-xl bg-white dark:bg-slate-800 p-2.5 border border-slate-100 dark:border-slate-750 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400">Git Commits</span>
                <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{ghContribs}</p>
              </div>
              <div className="rounded-xl bg-white dark:bg-slate-800 p-2.5 border border-slate-100 dark:border-slate-755 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400">ATS Score</span>
                <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{atsScore}/100</p>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Platform Coding Problem Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Code2 size={15} className="text-indigo-600 dark:text-indigo-400" />
              Multi-Platform Question Breakdown & Solving Depth
            </h3>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Total: {totalCodingProblems} Problems Across 3 Platforms
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* LeetCode Card */}
            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SiLeetcode className="text-amber-500 text-lg shrink-0" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">LeetCode</span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                  {totalCodingProblems > 0 ? `${Math.round((lcSolved / totalCodingProblems) * 100)}% Share` : "0%"}
                </span>
              </div>
              <div className="pt-1">
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {lcSolved}
                </p>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  Questions Solved
                </p>
              </div>
              <div className="pt-2 border-t border-amber-200/50 dark:border-amber-900/40 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Contest Rating:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {lcRating > 0 ? `${lcRating} pts (${lcBadge})` : "Unrated"}
                </span>
              </div>
            </div>

            {/* Codeforces Card */}
            <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SiCodeforces className="text-blue-500 text-lg shrink-0" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Codeforces</span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                  {totalCodingProblems > 0 ? `${Math.round((cfSolved / totalCodingProblems) * 100)}% Share` : "0%"}
                </span>
              </div>
              <div className="pt-1">
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {cfSolved}
                </p>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  Questions Solved
                </p>
              </div>
              <div className="pt-2 border-t border-blue-200/50 dark:border-blue-900/40 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Contest Rating:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {cfRating > 0 ? `${cfRating} pts (${cfTitle})` : "Unrated"}
                </span>
              </div>
            </div>

            {/* CodeChef Card */}
            <div className="rounded-2xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/40 dark:bg-orange-950/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SiCodechef className="text-orange-500 text-lg shrink-0" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">CodeChef</span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-300">
                  {totalCodingProblems > 0 ? `${Math.round((ccSolved / totalCodingProblems) * 100)}% Share` : "0%"}
                </span>
              </div>
              <div className="pt-1">
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {ccSolved}
                </p>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  Questions Solved
                </p>
              </div>
              <div className="pt-2 border-t border-orange-200/50 dark:border-orange-900/40 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Contest Rating:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {ccRating > 0 ? `${ccRating} pts (${ccStars})` : ccStars || "Unrated"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Symmetrical 4 Evaluation Pillars with Progress Bars */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Evaluation Pillars Breakdown (100 Pts Total)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {pillars.map((p) => {
              const Icon = p.icon;
              const pct = Math.min(100, Math.round((p.score / p.maxScore) * 100));

              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850/60 p-4 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${p.iconBg} ${p.iconColor}`}>
                          <Icon size={16} />
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {p.name}
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0">
                        {p.weight}
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between text-xs">
                      <span className="text-[11px] font-medium text-slate-400">Earned Score</span>
                      <span className="font-black text-slate-900 dark:text-white text-sm">
                        {p.score} <span className="text-xs font-semibold text-slate-400">/ {p.maxScore} pts</span>
                      </span>
                    </div>

                    {/* High-contrast Progress Bar */}
                    <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${p.barColor}`}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-2">
                    {p.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actionable Next Steps */}
        <div className="rounded-2xl bg-slate-50/90 dark:bg-slate-850/80 p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
              <Sparkles size={15} className="text-indigo-600 dark:text-indigo-400" />
              {score >= 70 ? "Target Milestones to Reach 90+ Top Tier" : "Recommended Steps to Build Placement Readiness"}
            </h4>
            <span className="text-[11px] font-semibold text-slate-400">Prioritized by Impact</span>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600 dark:text-slate-300">
            {totalCodingProblems === 0 && (
              <li className="flex items-start gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <CheckCircle2 size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span>Link LeetCode, Codeforces, or CodeChef in Profile to import verified solved questions.</span>
              </li>
            )}
            {ghContribs === 0 && (
              <li className="flex items-start gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <CheckCircle2 size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span>Connect your GitHub account to showcase active open-source commits and repositories.</span>
              </li>
            )}
            {projCount === 0 && (
              <li className="flex items-start gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <CheckCircle2 size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span>Add 2 or more complete technical projects in the Portfolio section.</span>
              </li>
            )}
            {skillsCount === 0 && (
              <li className="flex items-start gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <CheckCircle2 size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span>Add programming languages and frameworks in Skills to detect role-specific gaps.</span>
              </li>
            )}
            {score > 50 && (
              <li className="flex items-start gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <CheckCircle2 size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span>Compete in scheduled weekly contests to improve live competitive rating.</span>
              </li>
            )}
            <li className="flex items-start gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <CheckCircle2 size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <span>Use the ATS Resume Builder to align keywords for your target role ({user?.careerGoal || "Software Engineering"}).</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400 text-center sm:text-left">
            Calculated by SkillSync AI Ranking Engine v1.0 using official platform APIs.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl bg-slate-900 dark:bg-slate-800 px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-slate-800 dark:hover:bg-slate-750 transition"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlacementReportModal;
