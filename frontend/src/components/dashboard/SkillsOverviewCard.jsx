import { BrainCircuit } from "lucide-react";
import { Link } from "react-router-dom";

const SkillsOverviewCard = ({ skills }) => {
  const safeSkills =
    Array.isArray(skills) && skills.length > 0
      ? skills
      : [
          { name: "Python", level: 90 },
          { name: "DSA", level: 88 },
          { name: "Machine Learning", level: 80 },
          { name: "SQL", level: 75 },
        ];

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Skills Overview</h2>
          <p className="mt-1 text-sm text-slate-500">Current capability estimates from your profile.</p>
        </div>
        <BrainCircuit className="text-indigo-600" size={21} />
      </div>

      <div className="space-y-4">
        {safeSkills.slice(0, 5).map((skill) => (
          <div key={skill.name}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-700">{skill.name}</span>
              <span className="text-xs font-semibold text-slate-400">{skill.level}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                style={{ width: `${skill.level}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <Link
        to="/skills"
        className="mt-5 inline-block text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
      >
        View All Skills →
      </Link>
    </section>
  );
};

export default SkillsOverviewCard;
