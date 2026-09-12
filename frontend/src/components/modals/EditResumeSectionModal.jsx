import { useState } from "react";
import { X, Save } from "lucide-react";

const EditResumeSectionModal = ({ isOpen, onClose, section, data, onSave }) => {
  const [content, setContent] = useState(() => {
    if (typeof data === "string") return data;
    if (Array.isArray(data)) {
      if (typeof data[0] === "string") return data.join(", ");
      return JSON.stringify(data, null, 2);
    }
    return "";
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let parsed = content;
      if (section === "skills") {
        parsed = content.split(",").map((s) => s.trim()).filter(Boolean);
      } else if (section === "education" || section === "experience" || section === "projects") {
        try {
          parsed = JSON.parse(content);
        } catch {
          // If not valid JSON, treat as text summary or array
          parsed = [{ text: content }];
        }
      } else if (section === "achievements") {
        parsed = content.split("\n").map((s) => s.trim()).filter(Boolean);
      }
      await onSave(section, parsed);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit Resume: {section.toUpperCase()}</h2>
            <p className="text-xs text-slate-500">Update content to improve your ATS score and keyword matching.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600">
              {section === "skills"
                ? "Skills List (Comma separated)"
                : section === "summary"
                ? "Professional Summary (Include target role and metrics)"
                : section === "achievements"
                ? "Achievements (One per line)"
                : "Section Content (JSON or detailed text)"}
            </label>
            <textarea
              rows={section === "summary" ? 5 : 7}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 p-3.5 text-sm font-mono outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
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
              <Save size={16} />
              {loading ? "Saving..." : "Save Section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditResumeSectionModal;
