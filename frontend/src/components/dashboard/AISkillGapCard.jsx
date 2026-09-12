import { AlertTriangle, Check } from "lucide-react";
import { Link } from "react-router-dom";

const toneByPriority = {
  High: "border-rose-100 bg-rose-50 text-rose-700",
  Medium: "border-amber-100 bg-amber-50 text-amber-700",
  Low: "border-slate-200 bg-slate-50 text-slate-600",
};

const AISkillGapCard = ({ skills = [], gaps = [] }) => {
  const safeSkills = Array.isArray(skills) ? skills : [];
  const safeGaps = Array.isArray(gaps) ? gaps : [];

  const strongSkills = safeSkills.filter((s) => s.status === "Strong");

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
          <AlertTriangle size={20} className="text-violet-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">AI Skill Gap Analysis</h2>
          <p className="text-sm text-slate-500">What is strong, improving, and missing.</p>
        </div>
      </div>

      <div className="mb-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Strong Areas</p>
        <div className="flex flex-wrap gap-2">
          {strongSkills.length > 0 ? (
            strongSkills.map((skill) => (
              <span
                key={skill.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
              >
                <Check size={13} /> {skill.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400">Syncing skills from profile...</span>
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Needs Improvement</p>
        <div className="flex flex-wrap gap-2">
          {safeGaps.slice(0, 5).map((gap) => (
            <span
              key={gap.name}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                toneByPriority[gap.priority] || toneByPriority.Medium
              }`}
            >
              {gap.name}
            </span>
          ))}
        </div>
      </div>

      <Link
        to="/skills"
        className="mt-5 inline-block text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
      >
        View Detailed Analysis →
      </Link>
    </section>
  );
};

export default AISkillGapCard;
