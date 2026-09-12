import { BrainCircuit } from "lucide-react";
import { Link } from "react-router-dom";

const SkillsOverviewCard = ({ skills }) => {
  const safeSkills = Array.isArray(skills) ? skills : [];

  return (
    <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs min-w-0">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Skills Overview</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">Verified capability matrix from your profile.</p>
        </div>
        <BrainCircuit className="text-indigo-600 dark:text-indigo-400" size={21} />
      </div>

      {safeSkills.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
          <BrainCircuit className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={28} />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No skills added yet (0 Verified)</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Add your technical competencies to see live skill proficiency bars.</p>
          <Link
            to="/skills"
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            + Add Your First Skill →
          </Link>
        </div>
      ) : (
        <div className="space-y-4 min-w-0">
          {safeSkills.slice(0, 5).map((skill) => (
            <div key={skill.name} className="min-w-0">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{skill.name}</span>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{skill.level}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Link
        to="/skills"
        className="mt-5 inline-block text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 transition hover:text-indigo-700 dark:hover:text-indigo-300"
      >
        Manage All Skills ({safeSkills.length}) →
      </Link>
    </section>
  );
};

export default SkillsOverviewCard;
