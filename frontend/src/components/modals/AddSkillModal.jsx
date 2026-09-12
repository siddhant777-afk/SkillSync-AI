import { useState } from "react";
import { X, Plus, BrainCircuit } from "lucide-react";

const AddSkillModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    level: 75,
    category: "Languages",
    status: "Strong",
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const value = e.target.name === "level" ? parseInt(e.target.value, 10) : e.target.value;
    setFormData((prev) => {
      const next = { ...prev, [e.target.name]: value };
      if (e.target.name === "level") {
        next.status = value >= 75 ? "Strong" : value >= 50 ? "Growing" : "Needs Improvement";
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="text-indigo-600" size={20} />
            <h2 className="text-lg font-bold text-slate-900">Add Technical Skill</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600">Skill Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Docker, PyTorch, Redis"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option>Languages</option>
              <option>Computer Science</option>
              <option>AI & Data</option>
              <option>Databases</option>
              <option>DevOps & Cloud</option>
              <option>Architecture</option>
              <option>Web Development</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Proficiency Level</span>
              <span className="text-indigo-600 font-bold">{formData.level}% ({formData.status})</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="mt-2 w-full accent-indigo-600"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              <Plus size={16} />
              {loading ? "Adding..." : "Add Skill"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSkillModal;
