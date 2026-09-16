import { getSpacingClass, getMarginClass, getFontSizeStyle } from "./templateUtils";

const ElegantTemplate = ({ data, customization }) => {
  const {
    accentColor = "#334155",
    sectionSpacing = "spacious",
    margins = "generous",
    fontSize = "standard",
  } = customization;

  const spacingClass = getSpacingClass(sectionSpacing);
  const marginClass = getMarginClass(margins);
  const fontStyle = getFontSizeStyle(fontSize);

  return (
    <div
      className={`w-full bg-white text-slate-900 ${marginClass} ${spacingClass}`}
      style={{ ...fontStyle, fontFamily: "'Lora', serif" }}
    >
      {/* Editorial Header */}
      <header className="resume-section text-center pb-4">
        <h1
          className="text-3xl sm:text-4xl font-normal tracking-wide"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: accentColor }}
        >
          {data.fullName || "Student Name"}
        </h1>
        <p className="mt-1 text-xs tracking-widest uppercase text-slate-500 font-sans">
          {data.headline || "Software Engineering & Systems"}
        </p>

        <div className="mt-2.5 flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-slate-600 font-sans font-light">
          {data.email && <span>{data.email}</span>}
          {data.college && (
            <>
              <span className="text-slate-300">·</span>
              <span>{data.college}</span>
            </>
          )}
          {data.branch && (
            <>
              <span className="text-slate-300">·</span>
              <span>{data.branch}</span>
            </>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="h-px w-16 bg-slate-200" />
          <span className="text-[10px] text-slate-400">❖</span>
          <div className="h-px w-16 bg-slate-200" />
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="resume-section text-center max-w-xl mx-auto">
          <h2
            className="text-xs uppercase tracking-[0.2em] font-sans font-semibold text-slate-500 mb-2"
          >
            Biography
          </h2>
          <p className="text-xs sm:text-[13.5px] leading-relaxed text-slate-700 font-light italic">
            &ldquo;{data.summary}&rdquo;
          </p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="resume-section">
          <h2
            className="text-xs uppercase tracking-[0.2em] font-sans font-semibold text-slate-500 pb-1 border-b border-slate-200 mb-3"
          >
            Experience
          </h2>
          <div className="space-y-4">
            {data.experience.map((exp, idx) => (
              <div key={idx} className="resume-section">
                <div className="flex flex-wrap items-baseline justify-between gap-1">
                  <div>
                    <span className="text-sm font-normal text-slate-950" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px" }}>
                      {exp.role}
                    </span>
                    <span className="text-xs text-slate-600 ml-1.5 font-sans italic">at {exp.company}</span>
                  </div>
                  {exp.duration && <span className="text-xs text-slate-400 font-sans">{exp.duration}</span>}
                </div>
                {exp.description && (
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed font-light">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Selected Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="resume-section">
          <h2
            className="text-xs uppercase tracking-[0.2em] font-sans font-semibold text-slate-500 pb-1 border-b border-slate-200 mb-3"
          >
            Selected Works & Projects
          </h2>
          <div className="space-y-3.5">
            {data.projects.map((proj, idx) => (
              <div key={idx} className="resume-section">
                <div className="flex flex-wrap items-baseline justify-between gap-1">
                  <span className="text-sm font-normal text-slate-950" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "16px" }}>
                    {proj.title}
                  </span>
                  {proj.stack && <span className="text-xs text-slate-500 font-sans italic">({proj.stack})</span>}
                </div>
                {proj.description && (
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed font-light">{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Competencies */}
      {data.skills && data.skills.length > 0 && (
        <section className="resume-section">
          <h2
            className="text-xs uppercase tracking-[0.2em] font-sans font-semibold text-slate-500 pb-1 border-b border-slate-200 mb-2"
          >
            Capabilities
          </h2>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-700 font-sans font-light">
            {data.skills.map((s, idx) => (
              <span key={idx} className="after:content-['·'] after:ml-3 after:text-slate-300 last:after:content-['']">
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Honors */}
      {data.achievements && data.achievements.length > 0 && (
        <section className="resume-section">
          <h2
            className="text-xs uppercase tracking-[0.2em] font-sans font-semibold text-slate-500 pb-1 border-b border-slate-200 mb-2"
          >
            Distinctions & Milestones
          </h2>
          <ul className="space-y-1 text-xs text-slate-700 font-sans font-light">
            {data.achievements.map((ach, idx) => (
              <li key={idx} className="flex items-baseline gap-2">
                <span className="text-slate-400">❖</span>
                <span>{typeof ach === "string" ? ach : ach.title || ach.description}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Academic Qualifications */}
      {data.education && data.education.length > 0 && (
        <section className="resume-section">
          <h2
            className="text-xs uppercase tracking-[0.2em] font-sans font-semibold text-slate-500 pb-1 border-b border-slate-200 mb-2"
          >
            Academic Qualifications
          </h2>
          <div className="space-y-2">
            {data.education.map((edu, idx) => (
              <div key={idx} className="flex flex-wrap items-baseline justify-between gap-1 text-xs">
                <div>
                  <span className="font-medium text-slate-950 font-sans">{edu.degree}</span>
                  <span className="text-slate-600 font-sans ml-1.5 italic">/ {edu.institution}</span>
                </div>
                <div className="text-slate-500 font-sans text-right">
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

export default ElegantTemplate;
