import { useState } from "react";
import { X, Check, Eye, Sparkles, CheckCircle2 } from "lucide-react";
import { RESUME_TEMPLATES } from "./resumeConfig";

// Realistic Miniature Document Visuals for each template identity
const MiniatureDocument = ({ templateId, accentColor = "#4338ca" }) => {
  switch (templateId) {
    case "minimal":
      return (
        <div className="w-full h-48 bg-white p-3.5 border border-slate-200 rounded-lg shadow-2xs flex flex-col justify-between text-left overflow-hidden font-sans select-none pointer-events-none">
          <div>
            <div className="h-3.5 w-24 bg-slate-900 rounded-xs mb-1" />
            <div className="h-2 w-16 bg-slate-300 rounded-xs mb-2" />
            <div className="h-1.5 w-32 bg-slate-200 rounded-xs mb-3" />
            <div className="border-b border-slate-100 my-1.5" />
            <div className="space-y-1 mt-2">
              <div className="h-1.5 w-10 bg-slate-400 rounded-xs mb-1 uppercase tracking-widest" />
              <div className="h-1.5 w-full bg-slate-200 rounded-xs" />
              <div className="h-1.5 w-4/5 bg-slate-200 rounded-xs" />
            </div>
            <div className="space-y-1 mt-3">
              <div className="h-1.5 w-12 bg-slate-400 rounded-xs mb-1 uppercase tracking-widest" />
              <div className="flex gap-1">
                <div className="h-2 w-8 bg-slate-100 border border-slate-200 rounded-xs" />
                <div className="h-2 w-10 bg-slate-100 border border-slate-200 rounded-xs" />
                <div className="h-2 w-7 bg-slate-100 border border-slate-200 rounded-xs" />
              </div>
            </div>
          </div>
          <div className="text-[9px] text-slate-300 font-mono tracking-widest uppercase">
            Minimalist Whitespace
          </div>
        </div>
      );

    case "modern":
      return (
        <div className="w-full h-48 bg-white p-3.5 border border-slate-200 rounded-lg shadow-2xs flex flex-col justify-between text-left overflow-hidden font-sans select-none pointer-events-none">
          <div>
            <div className="flex justify-between items-end border-b pb-2" style={{ borderColor: `${accentColor}30` }}>
              <div>
                <div className="h-3.5 w-28 bg-slate-900 rounded-xs mb-1" />
                <div className="h-2 w-20 rounded-xs" style={{ backgroundColor: accentColor }} />
              </div>
              <div className="h-1.5 w-16 bg-slate-300 rounded-xs" />
            </div>
            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-4 rounded-full" style={{ backgroundColor: accentColor }} />
                <div className="h-2 w-14 bg-slate-800 rounded-xs uppercase" />
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-xs" />
              <div className="h-1.5 w-5/6 bg-slate-200 rounded-xs" />
            </div>
            <div className="mt-2.5 pl-2 border-l-2 space-y-1" style={{ borderColor: `${accentColor}60` }}>
              <div className="flex justify-between">
                <div className="h-2 w-16 bg-slate-900 rounded-xs" />
                <div className="h-1.5 w-8 rounded-xs" style={{ backgroundColor: `${accentColor}20` }} />
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-xs" />
            </div>
          </div>
          <div className="text-[9px] font-bold tracking-wider uppercase" style={{ color: accentColor }}>
            Modern Split Grid
          </div>
        </div>
      );

    case "professional":
      return (
        <div className="w-full h-48 bg-white p-3.5 border border-slate-200 rounded-lg shadow-2xs flex flex-col justify-between text-center overflow-hidden font-serif select-none pointer-events-none">
          <div>
            <div className="border-b-2 pb-2" style={{ borderColor: accentColor }}>
              <div className="h-3.5 w-32 bg-slate-900 rounded-xs mx-auto mb-1" />
              <div className="h-1.5 w-20 bg-slate-400 rounded-xs mx-auto mb-1 uppercase tracking-wider" />
              <div className="h-1.5 w-28 bg-slate-300 rounded-xs mx-auto" />
            </div>
            <div className="mt-2 text-left space-y-1.5">
              <div className="h-2 w-24 bg-slate-800 rounded-xs border-b pb-0.5" />
              <div className="h-1.5 w-full bg-slate-200 rounded-xs" />
              <div className="h-1.5 w-11/12 bg-slate-200 rounded-xs" />
            </div>
            <div className="mt-2 text-left space-y-1">
              <div className="h-2 w-28 bg-slate-800 rounded-xs border-b pb-0.5" />
              <div className="flex justify-between">
                <div className="h-1.5 w-16 bg-slate-700 rounded-xs" />
                <div className="h-1.5 w-10 bg-slate-400 rounded-xs" />
              </div>
              <div className="h-1.5 w-5/6 bg-slate-200 rounded-xs" />
            </div>
          </div>
          <div className="text-[9px] text-slate-400 uppercase tracking-widest font-sans font-semibold">
            Corporate Standard
          </div>
        </div>
      );

    case "executive":
      return (
        <div className="w-full h-48 bg-white p-3 border border-slate-200 rounded-lg shadow-2xs flex flex-col justify-between text-center overflow-hidden font-serif select-none pointer-events-none">
          <div>
            <div className="border-t border-b py-2" style={{ borderColor: `${accentColor}40` }}>
              <div className="h-3.5 w-36 rounded-xs mx-auto mb-1" style={{ backgroundColor: accentColor }} />
              <div className="h-1.5 w-24 bg-slate-400 rounded-xs mx-auto uppercase tracking-widest" />
            </div>
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-slate-200" />
                <div className="h-1.5 w-16 bg-slate-600 rounded-xs uppercase tracking-widest" />
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="h-1.5 w-4/5 bg-slate-200 rounded-xs mx-auto" />
              <div className="h-1.5 w-3/5 bg-slate-200 rounded-xs mx-auto" />
            </div>
            <div className="mt-2.5 space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-slate-200" />
                <div className="h-1.5 w-20 bg-slate-600 rounded-xs uppercase tracking-widest" />
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="h-1.5 w-5/6 bg-slate-200 rounded-xs mx-auto" />
            </div>
          </div>
          <div className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: accentColor }}>
            Executive Suite
          </div>
        </div>
      );

    case "creative":
      return (
        <div className="w-full h-48 bg-white border border-slate-200 rounded-lg shadow-2xs grid grid-cols-[1fr_2fr] overflow-hidden select-none pointer-events-none text-left">
          {/* Left Rail */}
          <div className="p-2.5 space-y-2 border-r" style={{ backgroundColor: `${accentColor}12`, borderColor: `${accentColor}25` }}>
            <div className="h-2 w-10 rounded-xs mb-1" style={{ backgroundColor: accentColor }} />
            <div className="h-1 w-12 bg-slate-400 rounded-xs" />
            <div className="h-1 w-10 bg-slate-400 rounded-xs" />
            <div className="border-b my-1" style={{ borderColor: `${accentColor}30` }} />
            <div className="h-2 w-12 rounded-xs mb-1" style={{ backgroundColor: accentColor }} />
            <div className="flex flex-wrap gap-1">
              <div className="h-2 w-5 bg-white rounded-xs border border-slate-300" />
              <div className="h-2 w-6 bg-white rounded-xs border border-slate-300" />
              <div className="h-2 w-4 bg-white rounded-xs border border-slate-300" />
            </div>
          </div>
          {/* Main Column */}
          <div className="p-3 space-y-2 flex flex-col justify-between">
            <div>
              <div className="h-3.5 w-24 bg-slate-900 rounded-xs mb-0.5" />
              <div className="h-1.5 w-16 rounded-xs mb-2" style={{ backgroundColor: accentColor }} />
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-slate-200 rounded-xs" />
                <div className="h-1.5 w-4/5 bg-slate-200 rounded-xs" />
              </div>
              <div className="mt-2 space-y-1">
                <div className="h-2 w-16 rounded-xs" style={{ backgroundColor: accentColor }} />
                <div className="h-1.5 w-full bg-slate-200 rounded-xs" />
              </div>
            </div>
            <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>
              Two-Column Asymmetric
            </div>
          </div>
        </div>
      );

    case "technical":
      return (
        <div className="w-full h-48 bg-white p-3.5 border border-slate-200 rounded-lg shadow-2xs flex flex-col justify-between text-left overflow-hidden font-mono select-none pointer-events-none">
          <div>
            <div className="flex justify-between items-baseline border-b pb-1.5 border-slate-200">
              <div className="h-3 w-28 bg-slate-950 rounded-xs" />
              <div className="h-1.5 w-12 bg-slate-400 rounded-xs" />
            </div>
            <div className="mt-2 space-y-1">
              <div className="text-[9px] text-slate-700 font-bold">$ cat skills.txt</div>
              <div className="flex flex-wrap gap-1">
                <span className="h-2 w-7 bg-slate-100 border border-slate-300 rounded-xs" />
                <span className="h-2 w-9 bg-slate-100 border border-slate-300 rounded-xs" />
                <span className="h-2 w-6 bg-slate-100 border border-slate-300 rounded-xs" />
                <span className="h-2 w-8 bg-slate-100 border border-slate-300 rounded-xs" />
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <div className="text-[9px] text-slate-700 font-bold">$ git log --projects</div>
              <div className="h-1.5 w-full bg-slate-200 rounded-xs" />
              <div className="h-1.5 w-4/5 bg-slate-200 rounded-xs" />
            </div>
          </div>
          <div className="text-[9px] text-slate-500 font-bold tracking-wide uppercase">
            Developer Terminal Matrix
          </div>
        </div>
      );

    case "academic":
      return (
        <div className="w-full h-48 bg-white p-3 border border-slate-200 rounded-lg shadow-2xs flex flex-col justify-between text-center overflow-hidden font-serif select-none pointer-events-none">
          <div>
            <div className="h-3.5 w-32 bg-slate-900 rounded-xs mx-auto mb-1" />
            <div className="h-1.5 w-24 bg-slate-500 rounded-xs mx-auto mb-1" />
            <div className="border-t-2 border-b my-1 py-0.5 border-slate-900" />
            <div className="mt-1.5 text-left space-y-1">
              <div className="h-1.5 w-24 bg-slate-900 rounded-xs border-b border-slate-400" />
              <div className="flex justify-between">
                <div className="h-1.5 w-20 bg-slate-800 rounded-xs" />
                <div className="h-1.5 w-10 bg-slate-400 rounded-xs" />
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-xs" />
            </div>
            <div className="mt-2 text-left space-y-1">
              <div className="h-1.5 w-28 bg-slate-900 rounded-xs border-b border-slate-400" />
              <div className="h-1.5 w-full bg-slate-200 rounded-xs" />
            </div>
          </div>
          <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold font-sans">
            Academic & Scholarly Dense
          </div>
        </div>
      );

    case "elegant":
    default:
      return (
        <div className="w-full h-48 bg-white p-3.5 border border-slate-200 rounded-lg shadow-2xs flex flex-col justify-between text-center overflow-hidden font-serif select-none pointer-events-none">
          <div>
            <div className="h-3.5 w-28 rounded-xs mx-auto mb-1" style={{ backgroundColor: accentColor }} />
            <div className="h-1.5 w-20 bg-slate-400 rounded-xs mx-auto mb-1.5" />
            <div className="flex items-center justify-center gap-1 my-1">
              <div className="h-px w-6 bg-slate-200" />
              <span className="text-[8px] text-slate-400">❖</span>
              <div className="h-px w-6 bg-slate-200" />
            </div>
            <div className="mt-2 space-y-1">
              <div className="h-1.5 w-3/4 bg-slate-200 rounded-xs mx-auto italic" />
              <div className="h-1.5 w-1/2 bg-slate-200 rounded-xs mx-auto italic" />
            </div>
            <div className="mt-2 text-left space-y-1">
              <div className="h-1.5 w-16 bg-slate-600 rounded-xs border-b pb-0.5 uppercase tracking-widest" />
              <div className="h-1.5 w-full bg-slate-200 rounded-xs" />
            </div>
          </div>
          <div className="text-[9px] text-slate-400 uppercase tracking-widest font-sans font-medium">
            Editorial Luxury
          </div>
        </div>
      );
  }
};

const TemplatePreviewModal = ({
  isOpen,
  onClose,
  selectedTemplateId,
  onSelectTemplate,
  accentColor = "#4338ca",
}) => {
  const [filter, setFilter] = useState("all"); // all, simple, modern, professional, executive

  if (!isOpen) return null;

  const filteredTemplates = RESUME_TEMPLATES.filter((tpl) => {
    if (filter === "all") return true;
    return tpl.styleDirection === filter || tpl.category === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-5 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-2xl text-slate-900 dark:text-white my-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Professional Resume Templates
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Each template has its own unique structural composition, typography hierarchy, and visual personality. All your content stays 100% intact.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="mt-4 flex flex-wrap gap-2 pb-2">
          {[
            { id: "all", label: "All Templates (8)" },
            { id: "simple", label: "Minimal & Clean" },
            { id: "modern", label: "Modern & Tech" },
            { id: "professional", label: "Corporate Standard" },
            { id: "executive", label: "Executive & Editorial" },
            { id: "creative", label: "Creative Distinctive" },
          ].map((flt) => (
            <button
              key={flt.id}
              onClick={() => setFilter(flt.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filter === flt.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {flt.label}
            </button>
          ))}
        </div>

        {/* Large Realistic Template Grid */}
        <div className="mt-4 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => {
            const isCurrent = selectedTemplateId === template.id;

            return (
              <div
                key={template.id}
                className={`rounded-2xl border p-4 transition flex flex-col justify-between ${
                  isCurrent
                    ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 ring-2 ring-indigo-500/50"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div>
                  {/* Miniature Scaled Document Preview */}
                  <div className="relative group rounded-xl overflow-hidden shadow-xs border border-slate-200 dark:border-slate-750">
                    <MiniatureDocument templateId={template.id} accentColor={accentColor} />
                    {isCurrent && (
                      <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-md">
                        <Check size={14} />
                      </div>
                    )}
                  </div>

                  {/* Template Meta */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {template.name}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {template.badge}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {template.description}
                    </p>
                    <div className="mt-2 text-[11px] text-indigo-700 dark:text-indigo-400 font-medium">
                      🎯 {template.bestFor}
                    </div>
                  </div>
                </div>

                {/* Select Button */}
                <button
                  onClick={() => {
                    onSelectTemplate(template.id);
                    onClose();
                  }}
                  className={`mt-4 w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                      : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-xs"
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <CheckCircle2 size={14} /> Currently Active
                    </>
                  ) : (
                    "Use This Template"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TemplatePreviewModal;
