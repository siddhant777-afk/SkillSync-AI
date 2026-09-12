import { useEffect, useRef, useState } from "react";
import { Download, FileText, Sparkles, Upload, RefreshCw, Pencil, Wand2, CheckCircle, GraduationCap, Briefcase } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import EditResumeSectionModal from "../../components/modals/EditResumeSectionModal";
import resumeService from "../../services/resumeService";
import { useUser } from "../../hooks/useUser";
import toast from "react-hot-toast";

const ResumeBuilder = () => {
  const { user } = useUser();
  const fileInputRef = useRef(null);

  const [resumeData, setResumeData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    college: user?.college || "",
    branch: user?.branch || "",
    headline: user?.careerGoal || "",
    summary: "",
    ats_score: 0,
    education: user?.college ? [
      {
        degree: user?.branch || "",
        institution: user?.college,
        year: user?.year || "",
        score: "",
      },
    ] : [],
    skills: [],
    projects: [],
    experience: [],
    achievements: [],
    ai_feedback: "Resume initialized. Fill in your sections or click 'Auto-Fill from Profile' to sync your real verified records.",
  });

  const [reviewing, setReviewing] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

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
    } catch (err) {
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
    } catch (err) {
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

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Print Styles: hide app navigation and show only the clean paper document */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-resume, #printable-resume * {
            visibility: visible;
          }
          #printable-resume {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: #1e293b !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="no-print">
        <PageHeader
          eyebrow="Resume Intelligence"
          title="Direct Web Resume Builder"
          description="Build, edit, and export an ATS-compliant resume directly in your browser. Auto-sync verified coding milestones, skills, and custom non-DSA honors."
          action={
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleAutoFill}
                disabled={autoFilling}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-4 py-2.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition shadow-xs"
              >
                <Wand2 size={16} className={autoFilling ? "animate-spin" : ""} />
                {autoFilling ? "Auto-Filling..." : "Auto-Fill from Profile"}
              </button>

              <button
                onClick={handleExportPDF}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 dark:hover:bg-indigo-500 transition"
              >
                <Download size={16} /> Download PDF / Print
              </button>
            </div>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr] min-w-0">
        {/* Left Control Panel: Sections & AI ATS Review */}
        <div className="space-y-6 no-print min-w-0">
          {/* ATS Score & AI Feedback */}
          <div className="grid gap-4 sm:grid-cols-2 min-w-0">
            <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs min-w-0 overflow-hidden">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">ATS Pass Score</p>
              <div className="mt-2 flex items-baseline gap-1 min-w-0">
                <span className="text-3xl sm:text-4xl md:text-5xl font-black text-indigo-600 dark:text-indigo-400 truncate">
                  {resumeData.ats_score || 0}
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-300 dark:text-slate-600">/100</span>
              </div>
              <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {resumeData.ats_score >= 80 ? "✅ Ready for recruiter screening" : resumeData.ats_score > 0 ? "⚠️ Add more keywords" : "⚪ Auto-fill or review to evaluate"}
              </p>
            </section>

            <section className="rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-900 dark:to-indigo-950/40 p-5 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-center gap-1.5">
                  <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">AI ATS Reviewer</h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3 break-words">
                  {resumeData.ai_feedback}
                </p>
              </div>

              <button
                onClick={handleRunAIReview}
                disabled={reviewing}
                className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-300 shadow-xs hover:bg-indigo-50 dark:hover:bg-slate-700 transition"
              >
                <RefreshCw size={13} className={reviewing ? "animate-spin" : ""} />
                {reviewing ? "Reviewing..." : "Re-evaluate ATS Score"}
              </button>
            </section>
          </div>

          {/* Section Editors Accordion */}
          <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-bold text-slate-900 dark:text-white">Resume Sections</h2>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500">Click edit to customize</span>
            </div>

            <div className="mt-4 space-y-2.5">
              {sections.map(({ key, label, data }) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 p-3.5 transition hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 min-w-0"
                >
                  <div className="flex-1 pr-3 min-w-0">
                    <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">{label}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500 truncate">
                      {Array.isArray(data)
                        ? `${data.length} entries configured`
                        : (typeof data === "string" && data.trim() ? data : "Not configured yet")}
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
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-300 transition"
            >
              <Upload size={14} /> Import text resume summary
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </section>
        </div>

        {/* Right Preview: Live Printable ATS Resume Document */}
        <div className="space-y-3 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1 no-print">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Live ATS Document Preview (Standard Letter / A4)
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle size={13} /> ATS Scanner Friendly Single-Column
            </span>
          </div>

          <div
            id="printable-resume"
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-8 md:p-10 shadow-lg text-slate-800 dark:text-slate-200 font-sans space-y-6 overflow-hidden break-words max-w-full"
          >
            {/* Header / Contacts */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-5 text-center min-w-0">
              <h1 className="text-2xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white break-words">
                {resumeData.fullName || user?.name || "Student Name"}
              </h1>
              <p className="mt-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider break-words">
                {resumeData.headline || "Aspiring Software Engineer"}
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 break-words">
                {[resumeData.email || user?.email, resumeData.college || user?.college, resumeData.branch || user?.branch].filter(Boolean).join(" · ")}
              </p>
            </div>

            {/* Professional Summary */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
                Professional Summary
              </h2>
              {resumeData.summary ? (
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 break-words">
                  {resumeData.summary}
                </p>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  No summary added yet. Click &apos;Edit&apos; on the left panel or use &apos;Auto-Fill from Profile&apos;.
                </p>
              )}
            </div>

            {/* Technical Skills */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
                Technical Competencies
              </h2>
              {resumeData.skills && resumeData.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {resumeData.skills.map((s, idx) => (
                    <span key={idx} className="after:content-[','] last:after:content-[''] pr-1 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  No skills entered yet. Add skills in Skills Matrix or click &apos;Auto-Fill from Profile&apos;.
                </p>
              )}
            </div>

            {/* Projects */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
                Projects & Technical Applications
              </h2>
              {resumeData.projects && resumeData.projects.length > 0 ? (
                <div className="space-y-3">
                  {resumeData.projects.map((p, idx) => (
                    <div key={idx} className="min-w-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white break-words">{p.title}</span>
                        {p.stack && (
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 italic">[{p.stack}]</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5 break-words">{p.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  No portfolio projects added yet. Click &apos;Auto-Fill from Profile&apos; to import your projects.
                </p>
              )}
            </div>

            {/* Experience */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
                Work Experience & Internships
              </h2>
              {resumeData.experience && resumeData.experience.length > 0 ? (
                <div className="space-y-3">
                  {resumeData.experience.map((exp, idx) => (
                    <div key={idx} className="min-w-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white break-words">
                          {exp.role} — <span className="font-semibold text-slate-700 dark:text-slate-300">{exp.company}</span>
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{exp.duration}</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5 break-words">{exp.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  No work experience or internships recorded.
                </p>
              )}
            </div>

            {/* Honors & Achievements */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
                Honors, Coding Milestones & Non-DSA Achievements
              </h2>
              {resumeData.achievements && resumeData.achievements.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {resumeData.achievements.map((ach, idx) => (
                    <li key={idx} className="leading-relaxed break-words">
                      {typeof ach === "string" ? ach : ach.title || ach.description}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  No custom achievements or honors listed.
                </p>
              )}
            </div>

            {/* Education */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
                Education & Academic Credentials
              </h2>
              {resumeData.education && resumeData.education.length > 0 ? (
                <div className="space-y-2">
                  {resumeData.education.map((edu, idx) => (
                    <div key={idx} className="flex flex-wrap justify-between items-baseline gap-1">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white break-words">{edu.degree}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 break-words">{edu.institution}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{edu.year}</p>
                        {edu.score && <p className="text-[11px] text-slate-500 dark:text-slate-400">{edu.score}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  No education records configured yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {activeSection && (
        <EditResumeSectionModal
          isOpen={Boolean(activeSection)}
          onClose={() => setActiveSection(null)}
          section={activeSection.section}
          data={activeSection.data}
          onSave={handleSaveSection}
        />
      )}
    </div>
  );
};

export default ResumeBuilder;
