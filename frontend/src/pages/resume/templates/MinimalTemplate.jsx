import { getSpacingClass, getMarginClass, getFontSizeStyle, SectionDivider } from "./templateUtils";

const MinimalTemplate = ({ data, customization }) => {
  const { accentColor = "#111827", dividerStyle = "hairline", sectionSpacing = "standard", margins = "generous", fontSize = "standard" } = customization;
  const spacingClass = getSpacingClass(sectionSpacing);
  const marginClass = getMarginClass(margins);
  const fontStyle = getFontSizeStyle(fontSize);

  return (
    <div
      className={`w-full bg-white text-slate-800 ${marginClass} ${spacingClass} font-sans`}
      style={{ ...fontStyle, fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header: Clean, understated left-aligned */}
      <header className="resume-section pb-3">
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-950">
          {data.fullName || "Student Name"}
        </h1>
        <p className="mt-1 text-sm font-medium tracking-wide text-slate-500 uppercase">
          {data.headline || "Software Engineer"}
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 font-light">
          {data.email && <span>{data.email}</span>}
          {data.college && (
            <>
              <span className="text-slate-300">/</span>
              <span>{data.college}</span>
            </>
          )}
          {data.branch && (
            <>
              <span className="text-slate-300">/</span>
              <span>{data.branch}</span>
            </>
          )}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="resume-section">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
            About
          </h2>
          <p className="text-slate-700 leading-relaxed font-light">{data.summary}</p>
          <SectionDivider style={dividerStyle} color={accentColor} className="mt-3.5" />
        </section>
      )}

      {/* Technical Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className="resume-section">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Competencies
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-800 font-normal">
            {data.skills.map((s, idx) => (
              <span key={idx} className="after:content-['·'] after:ml-4 after:text-slate-300 last:after:content-['']">
                {s}
              </span>
            ))}
          </div>
          <SectionDivider style={dividerStyle} color={accentColor} className="mt-3.5" />
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="resume-section">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Projects
          </h2>
          <div className="space-y-4">
            {data.projects.map((proj, idx) => (
              <div key={idx} className="resume-section">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-medium text-slate-900">{proj.title}</h3>
                  {proj.stack && <span className="text-xs text-slate-500 font-light">{proj.stack}</span>}
                </div>
                {proj.description && (
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed font-light">{proj.description}</p>
                )}
              </div>
            ))}
          </div>
          <SectionDivider style={dividerStyle} color={accentColor} className="mt-3.5" />
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="resume-section">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Experience
          </h2>
          <div className="space-y-4">
            {data.experience.map((exp, idx) => (
              <div key={idx} className="resume-section">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-sm">
                    <span className="font-medium text-slate-900">{exp.role}</span>
                    <span className="text-slate-500 font-light ml-1.5">at {exp.company}</span>
                  </div>
                  {exp.duration && <span className="text-xs text-slate-400 font-light">{exp.duration}</span>}
                </div>
                {exp.description && (
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed font-light">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
          <SectionDivider style={dividerStyle} color={accentColor} className="mt-3.5" />
        </section>
      )}

      {/* Achievements */}
      {data.achievements && data.achievements.length > 0 && (
        <section className="resume-section">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Honors & Milestones
          </h2>
          <ul className="space-y-1 text-xs text-slate-700 font-light">
            {data.achievements.map((ach, idx) => (
              <li key={idx} className="flex items-baseline gap-2">
                <span className="text-slate-400">―</span>
                <span>{typeof ach === "string" ? ach : ach.title || ach.description}</span>
              </li>
            ))}
          </ul>
          <SectionDivider style={dividerStyle} color={accentColor} className="mt-3.5" />
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="resume-section">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2.5">
            Education
          </h2>
          <div className="space-y-2">
            {data.education.map((edu, idx) => (
              <div key={idx} className="flex items-baseline justify-between gap-2 text-xs">
                <div>
                  <span className="font-medium text-slate-900">{edu.degree}</span>
                  <span className="text-slate-500 font-light ml-2">{edu.institution}</span>
                </div>
                <div className="text-slate-500 font-light">
                  {edu.year} {edu.score && `· ${edu.score}`}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MinimalTemplate;
