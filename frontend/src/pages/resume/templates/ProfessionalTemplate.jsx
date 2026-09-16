import { getSpacingClass, getMarginClass, getFontSizeStyle } from "./templateUtils";

const ProfessionalTemplate = ({ data, customization }) => {
  const {
    accentColor = "#1e3a8a",
    sectionSpacing = "standard",
    margins = "standard",
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
      {/* Corporate Centered Masthead */}
      <header className="resume-section text-center pb-3 border-b-2" style={{ borderColor: accentColor }}>
        <h1
          className="text-2xl sm:text-3xl font-bold tracking-normal uppercase"
          style={{ fontFamily: "'Merriweather', serif", color: accentColor }}
        >
          {data.fullName || "Student Name"}
        </h1>
        <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-600">
          {data.headline || "Software Engineering Professional"}
        </p>
        <p className="mt-2 text-xs text-slate-600 font-normal">
          {[data.email, data.college, data.branch].filter(Boolean).join("  |  ")}
        </p>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="resume-section">
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-1 border-b"
            style={{ fontFamily: "'Merriweather', serif", borderColor: "#cbd5e1" }}
          >
            Professional Summary
          </h2>
          <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-slate-800 text-justify">
            {data.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="resume-section">
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-1 border-b"
            style={{ fontFamily: "'Merriweather', serif", borderColor: "#cbd5e1" }}
          >
            Professional Experience
          </h2>
          <div className="mt-2 space-y-3">
            {data.experience.map((exp, idx) => (
              <div key={idx} className="resume-section">
                <div className="flex flex-wrap items-baseline justify-between gap-1">
                  <span className="text-xs font-bold text-slate-950">
                    {exp.role} — <span className="font-semibold text-slate-700">{exp.company}</span>
                  </span>
                  {exp.duration && <span className="text-xs font-medium text-slate-600">{exp.duration}</span>}
                </div>
                {exp.description && (
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="resume-section">
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-1 border-b"
            style={{ fontFamily: "'Merriweather', serif", borderColor: "#cbd5e1" }}
          >
            Technical Projects & Applications
          </h2>
          <div className="mt-2 space-y-3">
            {data.projects.map((proj, idx) => (
              <div key={idx} className="resume-section">
                <div className="flex flex-wrap items-baseline justify-between gap-1">
                  <span className="text-xs font-bold text-slate-950">{proj.title}</span>
                  {proj.stack && <span className="text-xs italic text-slate-600">[{proj.stack}]</span>}
                </div>
                {proj.description && (
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed">{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Technical Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className="resume-section">
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-1 border-b"
            style={{ fontFamily: "'Merriweather', serif", borderColor: "#cbd5e1" }}
          >
            Core Competencies & Technologies
          </h2>
          <p className="mt-2 text-xs text-slate-800 leading-relaxed">
            <strong className="text-slate-950">Technologies & Tools: </strong>
            {data.skills.join(", ")}
          </p>
        </section>
      )}

      {/* Achievements */}
      {data.achievements && data.achievements.length > 0 && (
        <section className="resume-section">
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-1 border-b"
            style={{ fontFamily: "'Merriweather', serif", borderColor: "#cbd5e1" }}
          >
            Honors & Distinctions
          </h2>
          <ul className="mt-2 list-disc list-inside space-y-1 text-xs text-slate-700">
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
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-1 border-b"
            style={{ fontFamily: "'Merriweather', serif", borderColor: "#cbd5e1" }}
          >
            Education & Qualifications
          </h2>
          <div className="mt-2 space-y-2">
            {data.education.map((edu, idx) => (
              <div key={idx} className="flex flex-wrap items-baseline justify-between gap-1 text-xs">
                <div>
                  <span className="font-bold text-slate-950">{edu.degree}</span>
                  <span className="text-slate-700 ml-1.5">— {edu.institution}</span>
                </div>
                <div className="text-slate-600 font-medium">
                  {edu.year} {edu.score && `| Score: ${edu.score}`}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProfessionalTemplate;
