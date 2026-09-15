import { X, CheckCircle2, Code2, FolderKanban, BrainCircuit, FileCheck, AlertCircle } from "lucide-react";

const PlacementReportModal = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  const score = user?.placementReadiness ?? 0;
  const lcSolved = user?.leetcode?.solved ?? 0;
  const cfRating = user?.codeforces?.rating ?? 0;
  const ccSolved = user?.codechef?.solved ?? (user?.codechef?.problems?.total_solved ?? 0);
  const ccRating = user?.codechef?.rating ?? (user?.codechef?.profile?.rating ?? 0);
  const ccStars = user?.codechef?.stars || "";
  const ccDivision = user?.codechef?.division || "";
  const ghContribs = user?.github?.contributions ?? 0;
  const projCount = user?.projects?.length ?? (user?.github?.repositories ? Math.min(user.github.repositories, 5) : 0);
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


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-2xl text-slate-800 dark:text-slate-100 my-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                score >= 75
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                  : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
              }`}>
                {score > 0 ? "Verified Report" : "Initial Assessment"}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Target: {user?.careerGoal || "Software Engineering"}
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Placement Readiness Report</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-800/80 dark:via-slate-900 dark:to-indigo-950/40 p-6 text-center border border-indigo-100 dark:border-slate-800 min-w-0">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Composite Readiness Score
          </p>
          <div className="mt-2 flex items-baseline justify-center gap-1 min-w-0">
            <span className="text-4xl sm:text-5xl md:text-6xl font-black text-indigo-700 dark:text-indigo-400 truncate">
              {score}
            </span>
            <span className="text-lg sm:text-xl font-bold text-slate-400 dark:text-slate-500">/100</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {score >= 80
              ? "🔥 Top 15% Placement Candidate"
              : score >= 50
              ? "📈 Good candidate with high upward potential"
              : score > 0
              ? "⚡ Emerging candidate - profile actively synchronizing"
              : "⚪ 0 Activity Recorded - Ready for initial verification"}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md">
            Calculated across competitive coding consistency, portfolio project depth, technical skill breadth, and ATS resume impact.
          </p>
        </div>

        {/* 4 Pillars Breakdown */}
        <div className="mt-6 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Evaluation Pillars</h3>

          <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-850">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                  <Code2 size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">Competitive Coding (35%)</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                    {lcSolved > 0 || cfRating > 0 || ccSolved > 0
                      ? [
                          lcSolved > 0 && `${lcSolved} LeetCode`,
                          cfRating > 0 && `Codeforces ${cfRating}`,
                          (ccRating > 0 || ccSolved > 0) && `CodeChef ${ccRating > 0 ? `${ccRating} pts` : `${ccSolved} solved`} (${ccStars || ccDivision || "Rated"})`,
                        ].filter(Boolean).join(" · ")
                      : "No verified coding handles linked"}
                  </p>
                </div>

              </div>
              <span className="font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-300 shrink-0">{codingPts}/35 pts</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-850">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <FolderKanban size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">Project Depth & GitHub (30%)</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                    {ghContribs > 0 || projCount > 0
                      ? `${ghContribs} contributions · ${projCount} portfolio projects`
                      : "No GitHub activity or projects added"}
                  </p>
                </div>
              </div>
              <span className="font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-300 shrink-0">{projectPts}/30 pts</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-850">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <BrainCircuit size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">Core Technical Skills (20%)</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                    {skillsCount > 0
                      ? `${skillsCount} skills entered in matrix`
                      : "No technical skills entered"}
                  </p>
                </div>
              </div>
              <span className="font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-300 shrink-0">{skillPts}/20 pts</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-850">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <FileCheck size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">ATS Resume & Profile (15%)</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                    {atsScore > 0 ? `${atsScore}/100 ATS baseline score` : "Resume not evaluated yet"}
                  </p>
                </div>
              </div>
              <span className="font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-300 shrink-0">{atsPts}/15 pts</span>
            </div>
          </div>
        </div>

        {/* Actionable Advice Tailored to Current State */}
        <div className="mt-6 rounded-xl bg-slate-50 dark:bg-slate-800/70 p-4 border border-slate-100 dark:border-slate-800">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
            {score >= 70 ? "Target Next Steps to Reach 90+" : "Recommended Steps to Build Placement Score"}
          </h4>
          <ul className="mt-2.5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {lcSolved === 0 && (
              <li className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Verify your LeetCode handle in Profile to import solved DSA count and topic depth.</span>
              </li>
            )}
            {ghContribs === 0 && (
              <li className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Connect your GitHub account to showcase open-source contributions and commit frequency.</span>
              </li>
            )}
            {projCount === 0 && (
              <li className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Add 2 or more major technical projects with architecture details in the Portfolio section.</span>
              </li>
            )}
            {skillsCount === 0 && (
              <li className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Add your programming languages and frameworks in Skills to detect role gaps.</span>
              </li>
            )}
            {score > 50 && (
              <li className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Practice Dynamic Programming and Graph problems to increase algorithmic depth ranking.</span>
              </li>
            )}
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-indigo-600 dark:bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlacementReportModal;
