import { getFontSizeStyle } from "./templateUtils";
import { Mail, GraduationCap, Briefcase, Award, Code2, Sparkles } from "lucide-react";

const CreativeTemplate = ({ data, customization }) => {
  const {
    accentColor = "#0f766e",
    fontSize = "standard",
    showIcons = true,
  } = customization;

  const fontStyle = getFontSizeStyle(fontSize);

  return (
    <div
      className="w-full bg-white text-slate-800 font-sans grid grid-cols-1 md:grid-cols-[1fr_2.1fr] min-h-[850px]"
      style={{ ...fontStyle, fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      {/* Left Sidebar Rail */}
      <aside
        className="p-6 sm:p-7 space-y-6 text-slate-700 border-r"
        style={{
          backgroundColor: `${accentColor}0a`,
          borderColor: `${accentColor}25`,
        }}
      >
        {/* Contact info in sidebar */}
        <div className="space-y-2">
          <h2
            className="text-[11px] font-bold uppercase tracking-wider pb-1 border-b"
            style={{ color: accentColor, borderColor: `${accentColor}30` }}
          >
            Contact Details
          </h2>
          <div className="space-y-2 text-xs">
            {data.email && (
              <div className="flex items-center gap-1.5 break-all">
                {showIcons && <Mail size={12} style={{ color: accentColor }} className="shrink-0" />}
                <span>{data.email}</span>
              </div>
            )}
            {data.college && (
              <div className="flex items-start gap-1.5">
                {showIcons && <GraduationCap size={12} style={{ color: accentColor }} className="shrink-0 mt-0.5" />}
                <span className="leading-snug">{data.college}</span>
              </div>
            )}
            {data.branch && (
              <div className="text-slate-500 pl-4 text-[11px]">
                {data.branch}
              </div>
            )}
          </div>
        </div>

        {/* Competencies */}
        {data.skills && data.skills.length > 0 && (
          <div className="space-y-2">
            <h2
              className="text-[11px] font-bold uppercase tracking-wider pb-1 border-b"
              style={{ color: accentColor, borderColor: `${accentColor}30` }}
            >
              Skills & Stack
            </h2>
            <div className="flex flex-wrap gap-1">
              {data.skills.map((s, idx) => (
                <span
                  key={idx}
                  className="rounded px-2 py-0.5 text-[11px] font-medium border"
                  style={{
                    backgroundColor: "white",
                    borderColor: `${accentColor}30`,
                    color: "#0f172a",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div className="space-y-2">
            <h2
              className="text-[11px] font-bold uppercase tracking-wider pb-1 border-b"
              style={{ color: accentColor, borderColor: `${accentColor}30` }}
            >
              Education
            </h2>
            <div className="space-y-2.5 text-xs">
              {data.education.map((edu, idx) => (
                <div key={idx} className="space-y-0.5">
                  <p className="font-bold text-slate-900 leading-tight">{edu.degree}</p>
                  <p className="text-slate-600 text-[11px]">{edu.institution}</p>
                  <p className="text-slate-400 text-[11px] font-medium">
                    {edu.year} {edu.score && `· ${edu.score}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Honors & Milestones */}
        {data.achievements && data.achievements.length > 0 && (
          <div className="space-y-2">
            <h2
              className="text-[11px] font-bold uppercase tracking-wider pb-1 border-b"
              style={{ color: accentColor, borderColor: `${accentColor}30` }}
            >
              Honors
            </h2>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {data.achievements.map((ach, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                  <Sparkles size={11} style={{ color: accentColor }} className="shrink-0 mt-0.5" />
                  <span>{typeof ach === "string" ? ach : ach.title || ach.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      {/* Main Right Content Column */}
      <main className="p-6 sm:p-8 space-y-6">
        {/* Masthead */}
        <header className="resume-section pb-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {data.fullName || "Student Name"}
          </h1>
          <p
            className="mt-1 text-sm font-semibold tracking-wide uppercase"
            style={{ color: accentColor }}
          >
            {data.headline || "Full-Stack Engineer & Product Builder"}
          </p>
        </header>

        {/* Professional Summary */}
        {data.summary && (
          <section className="resume-section">
            <h2
              className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
              style={{ color: accentColor }}
            >
              About
            </h2>
            <p className="text-xs sm:text-[13px] leading-relaxed text-slate-700">
              {data.summary}
            </p>
          </section>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <section className="resume-section">
            <h2
              className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 pb-1 border-b"
              style={{ color: accentColor, borderColor: `${accentColor}30` }}
            >
              Featured Applications & Projects
            </h2>
            <div className="space-y-3.5">
              {data.projects.map((proj, idx) => (
                <div key={idx} className="resume-section">
                  <div className="flex flex-wrap items-baseline justify-between gap-1">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">{proj.title}</span>
                    {proj.stack && (
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded"
                        style={{ backgroundColor: `${accentColor}12`, color: accentColor }}
                      >
                        {proj.stack}
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <section className="resume-section">
            <h2
              className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 pb-1 border-b"
              style={{ color: accentColor, borderColor: `${accentColor}30` }}
            >
              Experience & Internships
            </h2>
            <div className="space-y-3.5">
              {data.experience.map((exp, idx) => (
                <div key={idx} className="resume-section">
                  <div className="flex flex-wrap items-baseline justify-between gap-1">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {exp.role} <span className="font-semibold text-slate-600">at {exp.company}</span>
                    </span>
                    {exp.duration && <span className="text-xs text-slate-400 font-medium">{exp.duration}</span>}
                  </div>
                  {exp.description && (
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default CreativeTemplate;
