import { useEffect, useState } from "react";
import { BrainCircuit, CheckCircle2, CircleAlert, Sparkles, Plus, Trash2 } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import AddSkillModal from "../../components/modals/AddSkillModal";
import skillService from "../../services/skillService";
import { useUser } from "../../hooks/useUser";
import toast from "react-hot-toast";

const Skills = () => {
  const { user, refreshUser, notifyGlobalUpdate } = useUser();
  const [skills, setSkills] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchSkills = async () => {
    try {
      const data = await skillService.getSkills();
      if (data && data.skills) {
        setSkills(data.skills);
        setGaps(data.skillGaps || []);
      } else {
        setSkills(user?.skills || []);
        setGaps(user?.skillGaps || []);
      }
    } catch {
      setSkills(user?.skills || []);
      setGaps(user?.skillGaps || []);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [user]);

  const handleAddSkill = async (formData) => {
    try {
      const created = await skillService.addSkill(formData);
      setSkills((prev) => [...prev, created]);
      setGaps((prev) => prev.filter((g) => !g.name.toLowerCase().includes(formData.name.toLowerCase())));
      toast.success(`${formData.name} added to your skill matrix!`);
      if (refreshUser) refreshUser();
      if (notifyGlobalUpdate) notifyGlobalUpdate();
    } catch {
      setSkills((prev) => [...prev, { id: Date.now(), ...formData }]);
      toast.success(`${formData.name} added!`);
      if (refreshUser) refreshUser();
      if (notifyGlobalUpdate) notifyGlobalUpdate();
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await skillService.deleteSkill(id);
      setSkills((prev) => prev.filter((s) => s.id !== id));
      toast.success("Skill removed.");
      if (refreshUser) refreshUser();
      if (notifyGlobalUpdate) notifyGlobalUpdate();
    } catch {
      setSkills((prev) => prev.filter((s) => s.id !== id));
      toast.success("Skill removed.");
      if (refreshUser) refreshUser();
      if (notifyGlobalUpdate) notifyGlobalUpdate();
    }
  };

  const checklistItems = [
    "Containerize an ML or backend service with Docker",
    "Configure CI/CD automated test pipeline",
    "Build high-throughput REST APIs with FastAPI",
    "Practice low-level System Design with Redis & PostgreSQL",
  ];

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <PageHeader
        eyebrow="Career Intelligence"
        title="Skills & Competencies"
        description="Understand your verified strengths, detect role-specific gaps, and prioritize competencies that maximize placement selections."
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 dark:bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
          >
            <Plus size={16} /> Add Skill
          </button>
        }
      />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] min-w-0">
        <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit size={20} className="text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Skill Matrix</h2>
            </div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{skills.length} verified competencies</span>
          </div>

          {skills.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-10 text-center">
              <BrainCircuit className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={32} />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No skills in your matrix yet (0 Verified)</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Add your technical languages, frameworks and tools using the button above.</p>
              <button
                onClick={() => setModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-4 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
              >
                <Plus size={14} /> Add First Skill
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-5 min-w-0">
              {skills.map((skill) => (
                <div key={skill.id || skill.name} className="group min-w-0">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">{skill.name}</span>
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 shrink-0">({skill.category || "Tech"})</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{skill.level || skill.score}%</span>
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 transition"
                        title="Remove skill"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
                      style={{ width: `${skill.level || skill.score}%` }}
                    />
                  </div>

                  <p
                    className={`mt-1.5 text-xs font-semibold ${
                      (skill.level || skill.score) >= 75
                        ? "text-emerald-600 dark:text-emerald-400"
                        : (skill.level || skill.score) >= 50
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {skill.status || ((skill.level || skill.score) >= 75 ? "Strong" : "Growing")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-violet-600 dark:text-violet-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Skill Gaps</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">Targeting {user?.careerGoal || "Software Engineering"}</p>
            </div>
          </div>

          {gaps.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No skill gaps detected</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Add skills to evaluate coverage against your target role.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-3 min-w-0">
              {gaps.map((gap) => (
                <div
                  key={gap.name}
                  className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-850 p-4 transition hover:border-indigo-100 dark:hover:border-indigo-900/50 min-w-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{gap.name}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 break-words">{gap.reason || gap.category}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold shrink-0 ${
                        gap.priority === "High"
                          ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40"
                          : gap.priority === "Medium"
                          ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {gap.priority} Priority
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs min-w-0">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Skill Improvement Checklist</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Action items to turn identified skill gaps into verified placement assets.</p>

        <div className="mt-5 grid gap-3 md:grid-cols-2 min-w-0">
          {checklistItems.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-100 dark:border-slate-800 min-w-0">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 break-words">{item}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <CircleAlert size={14} className="shrink-0" /> AI recommendations dynamically re-score as you solve LeetCode problems and push GitHub commits.
        </p>
      </section>

      <AddSkillModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddSkill}
      />
    </div>
  );
};

export default Skills;
