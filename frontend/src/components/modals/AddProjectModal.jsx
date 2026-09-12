import { useState } from "react";
import { X } from "lucide-react";

const AddProjectModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stack: "",
    github_url: "",
    live_url: "",
    status: "In Progress",
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl text-slate-800 dark:text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Portfolio Project</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Showcase your technical depth to recruiters and ATS.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Project Title</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Distributed Task Queue"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tech Stack (comma separated)</label>
            <input
              type="text"
              name="stack"
              placeholder="e.g. Python · FastAPI · Redis · Docker"
              value={formData.stack}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Description & Impact</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Describe what you built, architecture decisions, and quantifiable outcomes..."
              value={formData.description}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">GitHub Repository URL</label>
              <input
                type="url"
                name="github_url"
                placeholder="https://github.com/..."
                value={formData.github_url}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Live Demo URL (optional)</label>
              <input
                type="url"
                name="live_url"
                placeholder="https://..."
                value={formData.live_url}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            >
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Deployed">Deployed</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo-600 dark:bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 transition"
            >
              {loading ? "Adding..." : "Add Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;
