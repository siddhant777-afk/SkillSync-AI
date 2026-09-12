import { useState } from "react";
import { X } from "lucide-react";

const AddSkillModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "Languages",
    level: 70,
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onAdd({
      name: formData.name.trim(),
      category: formData.category,
      level: Number(formData.level),
      score: Number(formData.level),
      status: Number(formData.level) >= 75 ? "Strong" : "Growing",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl text-slate-800 dark:text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add Competency</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Expand your technical capability matrix.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Skill / Framework Name</label>
            <input
              type="text"
              placeholder="e.g. PyTorch, Redis, TypeScript"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Domain Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            >
              <option value="Languages">Languages (C++, Python, JS, Go)</option>
              <option value="Frameworks">Frameworks (React, FastAPI, Node)</option>
              <option value="Database">Database & Caching (Postgres, Redis)</option>
              <option value="Cloud & DevOps">Cloud & DevOps (Docker, AWS, K8s)</option>
              <option value="AI / ML">AI / ML (PyTorch, TensorFlow, LLMs)</option>
              <option value="Core CS">Core CS (DSA, OS, Networks, DBMS)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>Proficiency Level</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{formData.level}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              className="mt-2 w-full accent-indigo-600"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 dark:bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
            >
              Save Skill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSkillModal;
