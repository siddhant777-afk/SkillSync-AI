import { getSpacingClass, getMarginClass, getFontSizeStyle } from "./templateUtils";

const ExecutiveTemplate = ({ data, customization }) => {
  const {
    accentColor = "#881337",
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
      style={{ ...fontStyle, fontFamily: "'Inter', sans-serif" }}
    >
      {/* Executive Centered Masthead with Double Hairline Rules */}
      <header className="resume-section text-center pb-4">
        <div className="border-t border-b py-4" style={{ borderColor: `${accentColor}35` }}>
          <h1
            className="text-3xl sm:text-4xl font-normal tracking-wide uppercase"
            style={{ fontFamily: "'Lora', serif", color: accentColor }}
          >
            {data.fullName || "Student Name"}
          </h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.25em] text-slate-500">
            {data.headline || "Technology Executive & Software Architect"}
          </p>
        </div>

        <div className="mt-2.5 flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-light">
          {data.email && <span>{data.email}</span>}
          {data.college && (
            <>
              <span className="text-slate-300">|</span>
              <span>{data.college}</span>
            </>
          )}
          {data.branch && (
            <>
              <span className="text-slate-300">|</span>
              <span>{data.branch}</span>
            </>
          )}
        </div>
      </header>

      {/* Executive Summary */}
      {data.summary && (
        <section className="resume-section">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px flex-1 bg-slate-200" />
            <h2
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ fontFamily: "'Lora', serif", color: accentColor }}
            >
              Executive Profile
            </h2>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <p className="text-xs sm:text-[13.5px] leading-relaxed text-slate-700 text-center font-light italic px-2">
            &ldquo;{data.summary}&rdquo;
          </p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="resume-section">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-slate-200" />
            <h2
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ fontFamily: "'Lora', serif", color: accentColor }}
            >
              Leadership & Experience
            </h2>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="space-y-4">
            {data.experience.map((exp, idx) => (
              <div key={idx} className="resume-section">
                <div className="flex flex-wrap items-baseline justify-between gap-1">
                  <div>
                    <span className="text-sm font-semibold text-slate-900" style={{ fontFamily: "'Lora', serif" }}>
                      {exp.role}
                    </span>
                    <span className="text-xs text-slate-600 ml-1.5 font-light">| {exp.company}</span>
                  </div>
                  {exp.duration && <span className="text-xs text-slate-500 font-light">{exp.duration}</span>}
                </div>
                {exp.description && (
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed font-light">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects & Strategic Initiatives */}
      {data.projects && data.projects.length > 0 && (
        <section className="resume-section">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-slate-200" />
            <h2
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ fontFamily: "'Lora', serif", color: accentColor }}
            >
              Key Initiatives & Architecture
            </h2>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="space-y-3.5">
            {data.projects.map((proj, idx) => (
              <div key={idx} className="resume-section">
                <div className="flex flex-wrap items-baseline justify-between gap-1">
                  <span className="text-xs sm:text-sm font-semibold text-slate-900" style={{ fontFamily: "'Lora', serif" }}>
                    {proj.title}
                  </span>
                  {proj.stack && <span className="text-xs font-light text-slate-500">[{proj.stack}]</span>}
                </div>
                {proj.description && (
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed font-light">{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Core Competencies */}
      {data.skills && data.skills.length > 0 && (
        <section className="resume-section">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="h-px flex-1 bg-slate-200" />
            <h2
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ fontFamily: "'Lora', serif", color: accentColor }}
            >
              Core Proficiencies & Technologies
            </h2>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-slate-700 font-light text-center">
            {data.skills.map((s, idx) => (
              <span key={idx} className="after:content-['·'] after:ml-3 after:text-slate-300 last:after:content-['']">
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Honors & Distinctions */}
      {data.achievements && data.achievements.length > 0 && (
        <section className="resume-section">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px flex-1 bg-slate-200" />
            <h2
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ fontFamily: "'Lora', serif", color: accentColor }}
            >
              Honors & Distinctions
            </h2>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <ul className="space-y-1 text-xs text-slate-600 font-light text-center">
            {data.achievements.map((ach, idx) => (
              <li key={idx} className="leading-relaxed">
                {typeof ach === "string" ? ach : ach.title || ach.description}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="resume-section">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="h-px flex-1 bg-slate-200" />
            <h2
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ fontFamily: "'Lora', serif", color: accentColor }}
            >
              Academic Background
            </h2>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="space-y-2">
            {data.education.map((edu, idx) => (
              <div key={idx} className="flex flex-wrap items-baseline justify-between gap-1 text-xs">
                <div>
                  <span className="font-semibold text-slate-900" style={{ fontFamily: "'Lora', serif" }}>
                    {edu.degree}
                  </span>
                  <span className="text-slate-600 ml-1.5 font-light">· {edu.institution}</span>
                </div>
                <div className="text-slate-500 font-light">
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

export default ExecutiveTemplate;
