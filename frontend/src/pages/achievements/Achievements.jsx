import { useEffect, useState } from "react";
import {
  Award,
  CalendarDays,
  Trophy,
  Plus,
  Trash2,
  BookOpen,
  GitPullRequest,
  Users,
  CheckCircle2,
  ExternalLink,
  Code,
  Sparkles,
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useUser } from "../../hooks/useUser";
import careerService from "../../services/careerService";
import toast from "react-hot-toast";

const Achievements = () => {
  const { user, refreshUser } = useUser();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [formData, setFormData] = useState({
    title: "",
    category: "Hackathon",
    date: "",
    description: "",
  });

  const categories = [
    { name: "Hackathon", icon: Trophy, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800" },
    { name: "Research Paper", icon: BookOpen, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800" },
    { name: "Certification", icon: Award, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800" },
    { name: "Open Source", icon: GitPullRequest, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800" },
    { name: "Leadership", icon: Users, color: "text-rose-500 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800" },
  ];

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const data = await careerService.getAchievements();
      setAchievements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load achievements:", err);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please enter a title and description.");
      return;
    }

    try {
      await careerService.createAchievement({
        title: formData.title.trim(),
        category: formData.category,
        date: formData.date.trim() || "Recently",
        description: formData.description.trim(),
        icon: formData.category.toLowerCase().replace(/\s+/g, "_"),
      });
      toast.success("Achievement added successfully!");
      setIsModalOpen(false);
      setFormData({ title: "", category: "Hackathon", date: "", description: "" });
      fetchAchievements();
      if (refreshUser) refreshUser();
    } catch (err) {
      toast.error("Failed to add achievement.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this achievement?")) return;
    try {
      await careerService.deleteAchievement(id);
      toast.success("Achievement deleted.");
      fetchAchievements();
      if (refreshUser) refreshUser();
    } catch (err) {
      toast.error("Failed to delete achievement.");
    }
  };

  const safeAchievements = Array.isArray(achievements) ? achievements : [];
  const filteredAchievements = safeAchievements.filter((a) => {
    if (selectedCategory === "All") return true;
    return (a.category || "").toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <PageHeader
        eyebrow="Non-DSA Portfolio"
        title="Student Achievements & Honors"
        description="Showcase hackathon victories, peer-reviewed research papers, industry certifications, and leadership milestones that differentiate your engineering profile."
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 dark:bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
          >
            <Plus size={16} /> Add Achievement
          </button>
        }
      />

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2 min-w-0">
        <button
          onClick={() => setSelectedCategory("All")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            selectedCategory === "All"
              ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          All Honors ({safeAchievements.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              selectedCategory === cat.name
                ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <cat.icon size={14} />
            {cat.name}
          </button>
        ))}
      </div>

      {/* Achievements Cards Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <LoadingSpinner />
        </div>
      ) : filteredAchievements.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500">
            <Trophy size={28} />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">No achievements recorded yet</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Add hackathon awards, published research, open source contributions, or cloud certifications to strengthen your placement portfolio.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 dark:bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-xs"
          >
            <Plus size={14} /> Add First Achievement
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 min-w-0">
          {filteredAchievements.map((item) => {
            const catObj = categories.find((c) => c.name.toLowerCase() === (item.category || "").toLowerCase()) || categories[0];
            const Icon = catObj.icon;
            return (
              <div
                key={item.id || item.title}
                className="flex flex-col justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs transition hover:shadow-md dark:hover:border-slate-700 min-w-0"
              >
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${catObj.color}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <CalendarDays size={12} /> {item.date}
                      </span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg p-1 text-slate-300 dark:text-slate-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition"
                        title="Delete achievement"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 className="mt-4 font-bold text-base text-slate-900 dark:text-white break-words">{item.title}</h3>
                  <span className="mt-1 inline-block rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                    {item.category}
                  </span>
                  <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400 break-words">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Achievement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl text-slate-800 dark:text-slate-100">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Non-DSA Achievement</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Showcase your multi-faceted talent to recruiters.</p>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Achievement Title</label>
                <input
                  type="text"
                  placeholder="e.g. Winner at Smart India Hackathon 2024"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Date / Year</label>
                  <input
                    type="text"
                    placeholder="e.g. Nov 2024"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Description & Details</label>
                <textarea
                  rows={3}
                  placeholder="Explain what the honor involved, key outcomes, metrics or responsibilities..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 dark:bg-indigo-500 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
                >
                  Save Achievement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;
