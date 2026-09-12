import { useEffect, useState } from "react";
import { BrainCircuit, CheckCircle2, CircleAlert, Sparkles, Plus, Trash2 } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import AddSkillModal from "../../components/modals/AddSkillModal";
import skillService from "../../services/skillService";
import { useUser } from "../../hooks/useUser";
import toast from "react-hot-toast";

const Skills = () => {
  const { user } = useUser();
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
      // Remove from gaps if matched
      setGaps((prev) => prev.filter((g) => !g.name.toLowerCase().includes(formData.name.toLowerCase())));
      toast.success(`${formData.name} added to your skill matrix!`);
    } catch {
      setSkills((prev) => [...prev, { id: Date.now(), ...formData }]);
      toast.success(`${formData.name} added!`);
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await skillService.deleteSkill(id);
      setSkills((prev) => prev.filter((s) => s.id !== id));
      toast.success("Skill removed.");
    } catch {
      setSkills((prev) => prev.filter((s) => s.id !== id));
      toast.success("Skill removed.");
    }
  };

  const checklistItems = [
    "Containerize an ML microservice with Docker",
    "Configure CI/CD automated test pipeline",
    "Build high-throughput REST APIs with FastAPI",
    "Practice low-level System Design with Redis & PostgreSQL",
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Career Intelligence"
        title="Skills & Competencies"
        description="Understand your verified strengths, detect role-specific gaps, and prioritize competencies that maximize placement selections."
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus size={16} /> Add Skill
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit size={20} className="text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Skill Matrix</h2>
            </div>
            <span className="text-xs font-semibold text-slate-400">{skills.length} verified competencies</span>
          </div>

          <div className="mt-6 space-y-5">
            {skills.map((skill) => (
              <div key={skill.id || skill.name} className="group">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-sm">{skill.name}</span>
                    <span className="text-[11px] font-medium text-slate-400">({skill.category || "Tech"})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">{skill.level || skill.score}%</span>
                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-600 transition"
                      title="Remove skill"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${skill.level || skill.score}%` }}
                  />
                </div>

                <p
                  className={`mt-1.5 text-xs font-semibold ${
                    (skill.level || skill.score) >= 75
                      ? "text-emerald-600"
                      : (skill.level || skill.score) >= 50
                      ? "text-indigo-600"
                      : "text-amber-600"
                  }`}
                >
                  {skill.status || ((skill.level || skill.score) >= 75 ? "Strong" : "Growing")}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-violet-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">AI Skill Gaps</h2>
              <p className="text-xs text-slate-400">Targeting {user?.careerGoal || "AI / ML Engineer"}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {gaps.map((gap) => (
              <div
                key={gap.name}
                className="rounded-xl border border-slate-100 p-4 transition hover:border-indigo-100 hover:bg-slate-50/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{gap.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{gap.reason || gap.category}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      gap.priority === "High"
                        ? "bg-rose-50 text-rose-600"
                        : gap.priority === "Medium"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {gap.priority} Priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Skill Improvement Checklist</h2>
        <p className="text-xs text-slate-500">Action items to turn identified skill gaps into verified placement assets.</p>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {checklistItems.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              <span className="text-sm font-medium text-slate-700">{item}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <CircleAlert size={14} /> AI recommendations dynamically re-score as you solve LeetCode problems and push GitHub commits.
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