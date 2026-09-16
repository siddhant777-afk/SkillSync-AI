import { getSpacingClass, getMarginClass, getFontSizeStyle, SectionDivider } from "./templateUtils";
import { Mail, GraduationCap, MapPin, Briefcase, Award, Code2 } from "lucide-react";

const ModernTemplate = ({ data, customization }) => {
  const {
    accentColor = "#4338ca",
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
      style={{ ...fontStyle, fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      {/* Modern Split Header */}
      <header className="resume-section border-b pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3" style={{ borderColor: `${accentColor}30` }}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {data.fullName || "Student Name"}
          </h1>
          <p
            className="mt-0.5 text-xs sm:text-sm font-semibold tracking-wide uppercase"
            style={{ color: accentColor }}
          >
            {data.headline || "Software Engineer"}
          </p>
        </div>

        <div className="text-xs text-slate-600 space-y-1 sm:text-right font-medium">
          {data.email && (
            <div className="flex items-center gap-1.5 sm:justify-end">
              {showIcons && <Mail size={12} style={{ color: accentColor }} />}
              <span>{data.email}</span>
            </div>
          )}
          {(data.college || data.branch) && (
            <div className="flex items-center gap-1.5 sm:justify-end text-slate-500">
              {showIcons && <GraduationCap size={12} style={{ color: accentColor }} />}
              <span>{[data.branch, data.college].filter(Boolean).join(", ")}</span>
            </div>
          )}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="resume-section">
          <div className="flex items-center gap-2 mb-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Professional Summary
            </h2>
          </div>
          <SectionDivider style={dividerStyle} color={accentColor} className="mb-2" />
          <p className="text-xs sm:text-[13px] leading-relaxed text-slate-700 font-normal">
            {data.summary}
          </p>
        </section>
      )}

      {/* Technical Skills / Competencies */}
      {data.skills && data.skills.length > 0 && (
        <section className="resume-section">
          <div className="flex items-center gap-2 mb-1.5">
            {showIcons && <Code2 size={13} style={{ color: accentColor }} />}
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Technical Competencies
            </h2>
          </div>
          <SectionDivider style={dividerStyle} color={accentColor} className="mb-2.5" />
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((s, idx) => (
              <span
                key={idx}
                className="rounded-md px-2.5 py-1 text-xs font-medium border"
                style={{
                  backgroundColor: `${accentColor}08`,
                  borderColor: `${accentColor}25`,
                  color: "#1e293b",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="resume-section">
          <div className="flex items-center gap-2 mb-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Projects & Engineering Work
            </h2>
          </div>
          <SectionDivider style={dividerStyle} color={accentColor} className="mb-3" />
          <div className="space-y-3.5">
            {data.projects.map((proj, idx) => (
              <div
                key={idx}
                className="resume-section pl-3 border-l-2"
                style={{ borderColor: `${accentColor}50` }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-1">
                  <span className="text-xs sm:text-sm font-bold text-slate-900">{proj.title}</span>
                  {proj.stack && (
                    <span
                      className="text-[11px] font-semibold tracking-wide px-1.5 py-0.5 rounded"
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
          <div className="flex items-center gap-2 mb-1.5">
            {showIcons && <Briefcase size={13} style={{ color: accentColor }} />}
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Experience & Internships
            </h2>
          </div>
          <SectionDivider style={dividerStyle} color={accentColor} className="mb-3" />
          <div className="space-y-3.5">
            {data.experience.map((exp, idx) => (
              <div
                key={idx}
                className="resume-section pl-3 border-l-2"
                style={{ borderColor: `${accentColor}50` }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-1">
                  <div className="text-xs sm:text-sm">
                    <span className="font-bold text-slate-900">{exp.role}</span>
                    <span className="text-slate-600 font-medium"> — {exp.company}</span>
                  </div>
                  {exp.duration && <span className="text-xs text-slate-500 font-medium">{exp.duration}</span>}
                </div>
                {exp.description && (
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Honors & Milestones */}
      {data.achievements && data.achievements.length > 0 && (
        <section className="resume-section">
          <div className="flex items-center gap-2 mb-1.5">
            {showIcons && <Award size={13} style={{ color: accentColor }} />}
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Verified Achievements & Milestones
            </h2>
          </div>
          <SectionDivider style={dividerStyle} color={accentColor} className="mb-2" />
          <ul className="space-y-1.5 text-xs text-slate-700">
            {data.achievements.map((ach, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                <span className="leading-relaxed">
                  {typeof ach === "string" ? ach : ach.title || ach.description}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="resume-section">
          <div className="flex items-center gap-2 mb-1.5">
            {showIcons && <GraduationCap size={13} style={{ color: accentColor }} />}
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Education & Academics
            </h2>
          </div>
          <SectionDivider style={dividerStyle} color={accentColor} className="mb-2" />
          <div className="space-y-2">
            {data.education.map((edu, idx) => (
              <div key={idx} className="flex flex-wrap items-baseline justify-between gap-1 text-xs">
                <div>
                  <span className="font-bold text-slate-900">{edu.degree}</span>
                  <span className="text-slate-600 ml-1.5">· {edu.institution}</span>
                </div>
                <div className="text-slate-500 font-medium">
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

export default ModernTemplate;
