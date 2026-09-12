import { useState } from "react";
import { X, Save, Plus, Trash2 } from "lucide-react";

const EditResumeSectionModal = ({ isOpen, onClose, section, data, onSave }) => {
  const [value, setValue] = useState(data);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(section, value);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl text-slate-800 dark:text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900 dark:text-white">
            Edit {section.replace(/_/g, " ")}
          </h2>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {section === "summary" && (
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Professional Summary</label>
              <textarea
                rows={5}
                value={typeof value === "string" ? value : ""}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Write a concise 3-4 sentence professional summary highlighting your strengths, top platforms, and domain interests..."
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 p-3.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30"
              />
            </div>
          )}

          {section === "skills" && (
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Technical Skills (comma-separated or one per line)
              </label>
              <textarea
                rows={4}
                value={Array.isArray(value) ? value.join(", ") : value}
                onChange={(e) => setValue(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                placeholder="Data Structures, Python, FastAPI, Docker, SQL, Git..."
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 p-3.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30"
              />
            </div>
          )}

          {section === "projects" && (
            <div className="space-y-4">
              {(Array.isArray(value) ? value : []).map((proj, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-850">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Project #{idx + 1}</span>
                    <button
                      onClick={() => setValue(value.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Project Title"
                    value={proj.title || proj.name || ""}
                    onChange={(e) => {
                      const updated = [...value];
                      updated[idx] = { ...proj, title: e.target.value };
                      setValue(updated);
                    }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Tech Stack (e.g. React · FastAPI · PostgreSQL)"
                    value={proj.stack || ""}
                    onChange={(e) => {
                      const updated = [...value];
                      updated[idx] = { ...proj, stack: e.target.value };
                      setValue(updated);
                    }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                  <textarea
                    rows={2}
                    placeholder="Description & Quantifiable Impact"
                    value={proj.description || ""}
                    onChange={(e) => {
                      const updated = [...value];
                      updated[idx] = { ...proj, description: e.target.value };
                      setValue(updated);
                    }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setValue([...(Array.isArray(value) ? value : []), { title: "", stack: "", description: "" }])}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus size={14} /> Add Another Project
              </button>
            </div>
          )}

          {section === "experience" && (
            <div className="space-y-4">
              {(Array.isArray(value) ? value : []).map((exp, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-850">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Experience #{idx + 1}</span>
                    <button
                      onClick={() => setValue(value.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Role (e.g. SDE Intern)"
                      value={exp.role || ""}
                      onChange={(e) => {
                        const updated = [...value];
                        updated[idx] = { ...exp, role: e.target.value };
                        setValue(updated);
                      }}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Company / Organization"
                      value={exp.company || ""}
                      onChange={(e) => {
                        const updated = [...value];
                        updated[idx] = { ...exp, company: e.target.value };
                        setValue(updated);
                      }}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Duration (e.g. Jun 2024 - Aug 2024)"
                    value={exp.duration || ""}
                    onChange={(e) => {
                      const updated = [...value];
                      updated[idx] = { ...exp, duration: e.target.value };
                      setValue(updated);
                    }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                  <textarea
                    rows={2}
                    placeholder="Responsibilities & Key Achievements"
                    value={exp.description || ""}
                    onChange={(e) => {
                      const updated = [...value];
                      updated[idx] = { ...exp, description: e.target.value };
                      setValue(updated);
                    }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setValue([...(Array.isArray(value) ? value : []), { role: "", company: "", duration: "", description: "" }])}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus size={14} /> Add Work Experience
              </button>
            </div>
          )}

          {section === "education" && (
            <div className="space-y-4">
              {(Array.isArray(value) ? value : []).map((edu, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-850">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Degree #{idx + 1}</span>
                    <button
                      onClick={() => setValue(value.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Degree (e.g. B.Tech in Computer Science)"
                    value={edu.degree || ""}
                    onChange={(e) => {
                      const updated = [...value];
                      updated[idx] = { ...edu, degree: e.target.value };
                      setValue(updated);
                    }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Institution"
                    value={edu.institution || ""}
                    onChange={(e) => {
                      const updated = [...value];
                      updated[idx] = { ...edu, institution: e.target.value };
                      setValue(updated);
                    }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Year (e.g. 2022 - 2026)"
                      value={edu.year || ""}
                      onChange={(e) => {
                        const updated = [...value];
                        updated[idx] = { ...edu, year: e.target.value };
                        setValue(updated);
                      }}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                    />
                    <input
                      type="text"
                      placeholder="CGPA / Score"
                      value={edu.score || ""}
                      onChange={(e) => {
                        const updated = [...value];
                        updated[idx] = { ...edu, score: e.target.value };
                        setValue(updated);
                      }}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setValue([...(Array.isArray(value) ? value : []), { degree: "", institution: "", year: "", score: "" }])}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus size={14} /> Add Education Entry
              </button>
            </div>
          )}

          {section === "achievements" && (
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Honors & Achievements (one per line)
              </label>
              <textarea
                rows={5}
                value={Array.isArray(value) ? value.map((a) => (typeof a === "string" ? a : a.title || a.description)).join("\n") : value}
                onChange={(e) => setValue(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
                placeholder="Winner of Smart India Hackathon 2024&#10;Published Research Paper on Distributed Consensus&#10;AWS Certified Cloud Practitioner"
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 p-3.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 font-sans"
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 dark:bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
          >
            <Save size={16} /> Save Section
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditResumeSectionModal;
