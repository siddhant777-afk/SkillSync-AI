import { AlertTriangle, Check } from "lucide-react";
import { Link } from "react-router-dom";

const toneByPriority = {
  High: "border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300",
  Medium: "border-amber-100 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
  Low: "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400",
};

const AISkillGapCard = ({ skills = [], gaps = [] }) => {
  const safeSkills = Array.isArray(skills) ? skills : [];
  const safeGaps = Array.isArray(gaps) ? gaps : [];

  const strongSkills = safeSkills.filter((s) => s.status === "Strong");

  return (
    <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs min-w-0">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/60">
          <AlertTriangle size={20} className="text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">AI Skill Gap Analysis</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">What is strong, improving, and missing.</p>
        </div>
      </div>

      <div className="mb-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Strong Areas</p>
        <div className="flex flex-wrap gap-2">
          {strongSkills.length > 0 ? (
            strongSkills.map((skill) => (
              <span
                key={skill.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
              >
                <Check size={13} /> {skill.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500 italic">No verified strong skills yet</span>
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Needs Improvement</p>
        <div className="flex flex-wrap gap-2">
          {safeGaps.length > 0 ? (
            safeGaps.slice(0, 5).map((gap) => (
              <span
                key={gap.name}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  toneByPriority[gap.priority] || toneByPriority.Medium
                }`}
              >
                {gap.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500 italic">No skill gaps identified yet</span>
          )}
        </div>
      </div>

      <Link
        to="/skills"
        className="mt-5 inline-block text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 transition hover:text-indigo-700 dark:hover:text-indigo-300"
      >
        View Detailed Analysis →
      </Link>
    </section>
  );
};

export default AISkillGapCard;
