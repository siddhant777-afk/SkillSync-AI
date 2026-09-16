import { getSpacingClass, getMarginClass, getFontSizeStyle, SectionDivider } from "./templateUtils";
import { Terminal, Code2, GitBranch, Cpu, Database, Award } from "lucide-react";

const TechnicalTemplate = ({ data, customization }) => {
  const {
    accentColor = "#334155",
    dividerStyle = "accent-bar",
    sectionSpacing = "standard",
    margins = "standard",
    fontSize = "standard",
    showIcons = true,
  } = customization;

  const spacingClass = getSpacingClass(sectionSpacing);
  const marginClass = getMarginClass(margins);
  const fontStyle = getFontSizeStyle(fontSize);

  return (
    <div
      className={`w-full bg-white text-slate-800 ${marginClass} ${spacingClass} font-sans`}
      style={{ ...fontStyle, fontFamily: "'Inter', sans-serif" }}
    >
      {/* Engineering Header */}
      <header className="resume-section border-b pb-3.5" style={{ borderColor: "#e2e8f0" }}>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 font-mono">
              {data.fullName || "Student Name"}
            </h1>
            <p className="mt-1 text-xs font-semibold text-slate-700 tracking-wider uppercase flex items-center gap-1.5">
              {showIcons && <Terminal size={13} style={{ color: accentColor }} />}
              <span>{data.headline || "Systems & Software Engineer"}</span>
            </p>
          </div>

          <div className="text-xs text-slate-600 font-mono space-y-0.5 sm:text-right">
            {data.email && <div>{data.email}</div>}
            {(data.college || data.branch) && (
              <div className="text-slate-500">{[data.branch, data.college].filter(Boolean).join(" · ")}</div>
            )}
          </div>
        </div>
      </header>

      {/* Technical Skills Matrix - Elevated to Priority Position */}
      {data.skills && data.skills.length > 0 && (
        <section className="resume-section">
          <div className="flex items-center gap-2 mb-1">
            {showIcons && <Cpu size={14} style={{ color: accentColor }} />}
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              $ cat technical_skills.txt
            </h2>
          </div>
          <SectionDivider style={dividerStyle} color={accentColor} className="mb-2.5" />
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((s, idx) => (
              <span
                key={idx}
                className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800"
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Systems & Technical Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="resume-section">
          <div className="flex items-center gap-2 mb-1">
            {showIcons && <GitBranch size={14} style={{ color: accentColor }} />}
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              $ git log --projects
            </h2>
          </div>
          <SectionDivider style={dividerStyle} color={accentColor} className="mb-3" />
          <div className="space-y-3.5">
            {data.projects.map((proj, idx) => (
              <div key={idx} className="resume-section">
                <div className="flex flex-wrap items-baseline justify-between gap-1">
                  <span className="text-xs sm:text-sm font-bold text-slate-950 font-mono">
                    {proj.title}
                  </span>
                  {proj.stack && (
                    <span className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                      stack: {proj.stack}
                    </span>
                  )}
                </div>
                {proj.description && (
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed font-normal">{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Work Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="resume-section">
          <div className="flex items-center gap-2 mb-1">
            {showIcons && <Database size={14} style={{ color: accentColor }} />}
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              $ cat work_experience.log
            </h2>
          </div>
          <SectionDivider style={dividerStyle} color={accentColor} className="mb-3" />
          <div className="space-y-3.5">
            {data.experience.map((exp, idx) => (
              <div key={idx} className="resume-section">
                <div className="flex flex-wrap items-baseline justify-between gap-1">
                  <div className="text-xs sm:text-sm">
                    <span className="font-bold text-slate-950 font-mono">{exp.role}</span>
                    <span className="text-slate-600 font-medium"> @ {exp.company}</span>
                  </div>
                  {exp.duration && <span className="font-mono text-xs text-slate-500">{exp.duration}</span>}
                </div>
                {exp.description && (
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed font-normal">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Coding Milestones & Honors */}
      {data.achievements && data.achievements.length > 0 && (
        <section className="resume-section">
          <div className="flex items-center gap-2 mb-1">
            {showIcons && <Award size={14} style={{ color: accentColor }} />}
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              $ cat milestones_and_honors.txt
            </h2>
          </div>
          <SectionDivider style={dividerStyle} color={accentColor} className="mb-2" />
          <ul className="space-y-1 text-xs text-slate-700">
            {data.achievements.map((ach, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="font-mono text-slate-400">&gt;</span>
                <span className="leading-relaxed">
                  {typeof ach === "string" ? ach : ach.title || ach.description}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Summary */}
      {data.summary && (
        <section className="resume-section">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono mb-1">
            $ cat summary.md
          </h2>
          <SectionDivider style={dividerStyle} color={accentColor} className="mb-1.5" />
          <p className="text-xs leading-relaxed text-slate-700 font-normal">{data.summary}</p>
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="resume-section">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono mb-1">
            $ cat education.env
          </h2>
          <SectionDivider style={dividerStyle} color={accentColor} className="mb-2" />
          <div className="space-y-2">
            {data.education.map((edu, idx) => (
              <div key={idx} className="flex flex-wrap items-baseline justify-between gap-1 text-xs">
                <div>
                  <span className="font-bold text-slate-950 font-mono">{edu.degree}</span>
                  <span className="text-slate-600 ml-1.5">[{edu.institution}]</span>
                </div>
                <div className="font-mono text-slate-500">
                  {edu.year} {edu.score && `| ${edu.score}`}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default TechnicalTemplate;
