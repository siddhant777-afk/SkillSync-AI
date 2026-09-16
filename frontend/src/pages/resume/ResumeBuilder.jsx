import { useEffect, useRef, useState } from "react";
import {
  Download,
  FileText,
  Sparkles,
  Upload,
  RefreshCw,
  Pencil,
  Wand2,
  CheckCircle,
  LayoutTemplate,
  Sliders,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import EditResumeSectionModal from "../../components/modals/EditResumeSectionModal";
import resumeService from "../../services/resumeService";
import { useUser } from "../../hooks/useUser";
import toast from "react-hot-toast";

import { DEFAULT_CUSTOMIZATION, RESUME_TEMPLATES, STYLE_DIRECTIONS } from "./resumeConfig";
import ResumeRenderer from "./ResumeRenderer";
import VisualCustomizer from "./VisualCustomizer";
import TemplatePreviewModal from "./TemplatePreviewModal";

const STORAGE_KEY = "skillsync_resume_customization_v1";

const ResumeBuilder = () => {
  const { user } = useUser();
  const fileInputRef = useRef(null);

  // Resume data model
  const [resumeData, setResumeData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    college: user?.college || "",
    branch: user?.branch || "",
    headline: user?.careerGoal || "",
    summary: "",
    ats_score: 0,
    education: user?.college
      ? [
          {
            degree: user?.branch || "",
            institution: user?.college,
            year: user?.year || "",
            score: "",
          },
        ]
      : [],
    skills: [],
    projects: [],
    experience: [],
    achievements: [],
    ai_feedback:
      "Resume initialized. Fill in your sections, select your desired template aesthetic, and click 'Auto-Fill from Profile' to sync your verified records.",
  });

  // Visual Customization state initialized from localStorage
  const [customization, setCustomization] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_CUSTOMIZATION, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_CUSTOMIZATION;
  });

  const [reviewing, setReviewing] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [zoom, setZoom] = useState(100); // 75, 90, 100, 110, 125
  const [leftTab, setLeftTab] = useState("sections"); // "sections" | "design"

  // Persist customization changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customization));
    } catch {
      // LocalStorage quota or disabled
    }
  }, [customization]);

  const handleCustomizationChange = (key, value) => {
    setCustomization((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApplyDirection = (direction) => {
    setCustomization((prev) => ({
      ...prev,
      styleDirection: direction.id,
      templateId: direction.defaultTemplate,
      accentColor: direction.accentColor,
      fontPairing: direction.fontPairing,
      dividerStyle: direction.dividerStyle,
      headerLayout: direction.headerLayout,
      showIcons: direction.showIcons,
      sectionSpacing: direction.sectionSpacing || prev.sectionSpacing,
      margins: direction.margins || prev.margins,
    }));
    toast.success(`Applied ${direction.name} style direction!`);
  };

  const handleSelectTemplate = (templateId) => {
    setCustomization((prev) => {
      const tpl = RESUME_TEMPLATES.find((t) => t.id === templateId);
      return {
        ...prev,
        templateId,
        styleDirection: tpl?.styleDirection || prev.styleDirection,
      };
    });
    const found = RESUME_TEMPLATES.find((t) => t.id === templateId);
    toast.success(`Switched to ${found?.name || templateId} template!`);
  };

  const fetchResume = async () => {
    try {
      const data = await resumeService.getResume();
      if (data) {
        setResumeData((prev) => ({
          ...prev,
          ...data,
          fullName: data.fullName || user?.name || prev.fullName,
          email: data.email || user?.email || prev.email,
          college: data.college || user?.college || prev.college,
          branch: data.branch || user?.branch || prev.branch,
        }));
      }
    } catch {
      // Keep state defaults
    }
  };

  useEffect(() => {
    fetchResume();
  }, [user]);

  const handleExportPDF = () => {
    window.print();
  };

  const handleAutoFill = async () => {
    setAutoFilling(true);
    const toastId = toast.loading("Syncing live profile, coding stats, and honors into resume...");
    try {
      const res = await resumeService.autoFillProfile();
      if (res.resume) {
        setResumeData((prev) => ({
          ...prev,
          ...res.resume,
        }));
        toast.success("Resume auto-filled with live profile data!", { id: toastId });
      }
    } catch {
      toast.error("Failed to auto-fill resume.", { id: toastId });
    } finally {
      setAutoFilling(false);
    }
  };

  const handleRunAIReview = async () => {
    setReviewing(true);
    const toastId = toast.loading("Analyzing ATS parser readability and industry keywords...");
    try {
      const res = await resumeService.runAIReview(user?.careerGoal || resumeData.headline || "Software Engineer");
      setResumeData((prev) => ({
        ...prev,
        ats_score: res.ats_score,
        ai_feedback: res.feedback,
      }));
      toast.success(`ATS Score updated to ${res.ats_score}/100!`, { id: toastId });
    } catch {
      toast.error("Failed to analyze resume. Please try again.", { id: toastId });
    } finally {
      setReviewing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setResumeData((prev) => ({
          ...prev,
          summary: text.slice(0, 350) || prev.summary,
        }));
        toast.success(`Loaded content from ${file.name}!`);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveSection = async (section, value) => {
    const next = { ...resumeData, [section]: value };
    setResumeData(next);
    try {
      const payload = {
        headline: next.headline,
        summary: next.summary,
        education: next.education,
        skills_json: next.skills,
        projects_json: next.projects,
        experience_json: next.experience,
        achievements_json: next.achievements,
      };
      const res = await resumeService.updateResume(payload);
      if (res && res.ats_score !== undefined) {
        setResumeData((prev) => ({ ...prev, ats_score: res.ats_score }));
      }
      toast.success(`${section.toUpperCase()} updated successfully!`);
    } catch {
      toast.success(`${section.toUpperCase()} saved locally.`);
    }
  };

  const sections = [
    { key: "summary", label: "Professional Summary", data: resumeData.summary },
    { key: "education", label: "Education & Academics", data: resumeData.education },
    { key: "skills", label: "Technical Skills", data: resumeData.skills },
    { key: "projects", label: "Projects & Portfolio", data: resumeData.projects },
    { key: "experience", label: "Work Experience & Internships", data: resumeData.experience },
    { key: "achievements", label: "Honors & Achievements", data: resumeData.achievements },
  ];

  const currentTemplate =
    RESUME_TEMPLATES.find((t) => t.id === customization.templateId) || RESUME_TEMPLATES[0];

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Top Application Header */}
      <div className="no-print">
        <PageHeader
          eyebrow="Resume Studio"
          title="Professional Resume Designer"
          description="Craft distinct, recruiter-ready resumes tailored to your career trajectory. Choose from 8 dedicated architectural templates or customize typography, palette, and layout."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowTemplateModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs"
              >
                <LayoutTemplate size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span>Templates ({currentTemplate.name})</span>
              </button>

              <button
                onClick={handleAutoFill}
                disabled={autoFilling}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-4 py-2.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition shadow-xs"
              >
                <Wand2 size={16} className={autoFilling ? "animate-spin" : ""} />
                {autoFilling ? "Auto-Filling..." : "Auto-Fill Profile"}
              </button>

              <button
                onClick={handleExportPDF}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 dark:hover:bg-indigo-500 transition"
              >
                <Download size={16} /> Print / Export PDF
              </button>
            </div>
          }
        />
      </div>

      {/* Main Studio Grid: Left Control Center | Right Live Canvas */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_1.45fr] min-w-0">
        {/* Left Column: Switcher Tabs (Sections vs Visual Customizer) & ATS Intelligence */}
        <div className="space-y-5 no-print min-w-0">
          {/* ATS Metric & Feedback Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 min-w-0">
            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs min-w-0 overflow-hidden">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                ATS Pass Score
              </p>
              <div className="mt-2 flex items-baseline gap-1 min-w-0">
                <span className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 truncate">
                  {resumeData.ats_score || 0}
                </span>
                <span className="text-base font-bold text-slate-300 dark:text-slate-600">/100</span>
              </div>
              <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {resumeData.ats_score >= 80
                  ? "✅ Recruiter Screening Ready"
                  : resumeData.ats_score > 0
                  ? "⚠️ Keyword optimization recommended"
                  : "⚪ Auto-fill or review to evaluate"}
              </p>
            </section>

            <section className="rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-900 dark:to-indigo-950/40 p-4 sm:p-5 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-center gap-1.5">
                  <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                    ATS Feedback
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3 break-words">
                  {resumeData.ai_feedback}
                </p>
              </div>

              <button
                onClick={handleRunAIReview}
                disabled={reviewing}
                className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-300 shadow-xs hover:bg-indigo-50 dark:hover:bg-slate-700 transition"
              >
                <RefreshCw size={12} className={reviewing ? "animate-spin" : ""} />
                {reviewing ? "Reviewing..." : "Re-evaluate ATS"}
              </button>
            </section>
          </div>

          {/* Dual Tab Switcher: [Resume Content] vs [Visual Design & Customization] */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => setLeftTab("sections")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                leftTab === "sections"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileText size={15} />
              <span>Resume Content</span>
            </button>
            <button
              onClick={() => setLeftTab("design")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                leftTab === "design"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Sliders size={15} />
              <span>Visual Customizer</span>
            </button>
          </div>

          {/* Tab Content: Resume Content Sections */}
          {leftTab === "sections" && (
            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                  Content Sections
                </h2>
                <span className="text-xs text-slate-400">Click edit to customize</span>
              </div>

              <div className="mt-3.5 space-y-2.5">
                {sections.map(({ key, label, data }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 p-3 transition hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 min-w-0"
                  >
                    <div className="flex-1 pr-3 min-w-0">
                      <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">{label}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500 truncate">
                        {Array.isArray(data)
                          ? `${data.length} entries configured`
                          : typeof data === "string" && data.trim()
                          ? data
                          : "Empty"}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSection({ section: key, data })}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition shrink-0"
                    >
                      <Pencil size={11} /> Edit
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-300 transition"
              >
                <Upload size={14} /> Import text summary
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </section>
          )}

          {/* Tab Content: Visual Customizer */}
          {leftTab === "design" && (
            <VisualCustomizer
              customization={customization}
              onChange={handleCustomizationChange}
              onApplyDirection={handleApplyDirection}
            />
          )}
        </div>

        {/* Right Column: Live Interactive Document Canvas & Quick Template Carousel */}
        <div className="space-y-3 min-w-0">
          {/* Quick Template Selector Carousel & Canvas Zoom Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs no-print">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
              {RESUME_TEMPLATES.map((tpl) => {
                const isActive = customization.templateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {tpl.name}
                  </button>
                );
              })}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-2 sm:pt-0 sm:pl-3 shrink-0">
              <button
                onClick={() => setZoom((z) => Math.max(75, z - 10))}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Zoom Out"
              >
                <ZoomOut size={15} />
              </button>
              <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 w-10 text-center">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(125, z + 10))}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Zoom In"
              >
                <ZoomIn size={15} />
              </button>
              <button
                onClick={() => setZoom(100)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-[11px]"
                title="Reset Zoom to 100%"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          </div>

          {/* Document Framing Container */}
          <div className="overflow-x-auto max-w-full pb-8 flex justify-center bg-slate-200/60 dark:bg-slate-950/60 p-3 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
                width: "100%",
                maxWidth: "850px",
              }}
              className="transition-transform duration-100"
            >
              <ResumeRenderer
                templateId={customization.templateId}
                data={resumeData}
                customization={customization}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Section Modal */}
      {activeSection && (
        <EditResumeSectionModal
          isOpen={Boolean(activeSection)}
          onClose={() => setActiveSection(null)}
          section={activeSection.section}
          data={activeSection.data}
          onSave={handleSaveSection}
        />
      )}

      {/* Large Template Preview Modal */}
      <TemplatePreviewModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        selectedTemplateId={customization.templateId}
        onSelectTemplate={handleSelectTemplate}
        accentColor={customization.accentColor}
      />
    </div>
  );
};

export default ResumeBuilder;
