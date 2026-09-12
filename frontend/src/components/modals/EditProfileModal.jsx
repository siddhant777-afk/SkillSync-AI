import { useState } from "react";
import { X, Save, RefreshCw } from "lucide-react";
import { FaGithub, FaKaggle } from "react-icons/fa";
import { SiCodechef, SiCodeforces, SiLeetcode } from "react-icons/si";

const EditProfileModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    year: user?.year || "3rd Year",
    branch: user?.branch || "AIML",
    college: user?.college || "GL Bajaj Institute of Technology and Management",
    careerGoal: user?.careerGoal || "AI / ML Engineer",
    github: user?.github?.username || "",
    leetcode: user?.leetcode?.username || "",
    codeforces: user?.codeforces?.username || "",
    codechef: user?.codechef?.username || "",
    kaggle: user?.kaggle?.username || "",
  });

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Edit Career Profile</h2>
            <p className="text-xs text-slate-500">Update your academic info and connected coding platforms.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-600">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">Career Goal</label>
              <select
                name="careerGoal"
                value={formData.careerGoal}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option>AI / ML Engineer</option>
                <option>Backend Developer</option>
                <option>Data Scientist</option>
                <option>Full Stack Developer</option>
                <option>Cloud / DevOps Engineer</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600">College / Institution</label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">Academic Year</label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
                <option>Postgraduate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Branch / Specialization</label>
            <input
              type="text"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Connected Handles */}
          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-sm font-bold text-slate-800">Connected Platform Usernames</h3>
            <p className="text-xs text-slate-400">Enter your handles once. SkillSync AI will sync stats automatically.</p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="relative">
                <FaGithub className="absolute left-3.5 top-3 text-slate-500" size={16} />
                <input
                  type="text"
                  name="github"
                  placeholder="GitHub username"
                  value={formData.github}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="relative">
                <SiLeetcode className="absolute left-3.5 top-3 text-amber-500" size={16} />
                <input
                  type="text"
                  name="leetcode"
                  placeholder="LeetCode username"
                  value={formData.leetcode}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="relative">
                <SiCodeforces className="absolute left-3.5 top-3 text-blue-500" size={16} />
                <input
                  type="text"
                  name="codeforces"
                  placeholder="Codeforces handle"
                  value={formData.codeforces}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="relative">
                <SiCodechef className="absolute left-3.5 top-3 text-amber-700" size={16} />
                <input
                  type="text"
                  name="codechef"
                  placeholder="CodeChef handle"
                  value={formData.codechef}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="relative sm:col-span-2">
                <FaKaggle className="absolute left-3.5 top-3 text-cyan-500" size={16} />
                <input
                  type="text"
                  name="kaggle"
                  placeholder="Kaggle username"
                  value={formData.kaggle}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
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
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              Save & Sync
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
