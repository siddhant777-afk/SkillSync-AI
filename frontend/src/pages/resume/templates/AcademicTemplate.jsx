import { getSpacingClass, getMarginClass, getFontSizeStyle } from "./templateUtils";

const AcademicTemplate = ({ data, customization }) => {
  const {
    accentColor = "#1e293b",
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
      {/* Academic Formal Masthead */}
      <header className="resume-section text-center pb-2">
        <h1
          className="text-2xl sm:text-3xl font-normal tracking-tight text-slate-950"
          style={{ fontFamily: "'Merriweather', serif" }}
        >
          {data.fullName || "Student Name"}
        </h1>
        <p className="mt-1 text-xs text-slate-600 font-serif italic">
          {data.headline || "Candidate for Bachelor / Master of Technology"}
        </p>

        <div className="mt-2 text-xs text-slate-600 space-x-3">
          {data.email && <span>{data.email}</span>}
          {data.college && (
            <>
              <span>•</span>
              <span>{data.college}</span>
            </>
          )}
          {data.branch && (
            <>
              <span>•</span>
              <span>{data.branch}</span>
            </>
          )}
        </div>

        <div className="mt-3 border-b-2 border-t py-0.5 border-slate-900" />
      </header>

      {/* Education First (Scholarly Hierarchy) */}
      {data.education && data.education.length > 0 && (
        <section className="resume-section">
          <h2
            className="text-xs font-bold uppercase tracking-wider text-slate-950 pb-0.5 border-b border-slate-300"
            style={{ fontFamily: "'Merriweather', serif" }}
          >
            Education & Academic Credentials
          </h2>
          <div className="mt-2 space-y-2">
            {data.education.map((edu, idx) => (
              <div key={idx} className="flex flex-wrap items-baseline justify-between gap-1 text-xs">
                <div>
                  <span className="font-bold text-slate-950">{edu.institution}</span>
                  <span className="text-slate-700 ml-1.5">— {edu.degree}</span>
                </div>
                <div className="text-slate-600">
                  {edu.year} {edu.score && `| Cumulative Score: ${edu.score}`}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Research & Engineering Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="resume-section">
          <h2
            className="text-xs font-bold uppercase tracking-wider text-slate-950 pb-0.5 border-b border-slate-300"
            style={{ fontFamily: "'Merriweather', serif" }}
          >
            Research & Engineering Projects
          </h2>
          <div className="mt-2 space-y-3">
            {data.projects.map((proj, idx) => (
              <div key={idx} className="resume-section">
                <div className="flex flex-wrap items-baseline justify-between gap-1">
                  <span className="text-xs font-bold text-slate-950">{proj.title}</span>
                  {proj.stack && <span className="text-xs italic text-slate-600">Methods: {proj.stack}</span>}
                </div>
                {proj.description && (
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed text-justify">{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience & Fellowships */}
      {data.experience && data.experience.length > 0 && (
        <section className="resume-section">
          <h2
            className="text-xs font-bold uppercase tracking-wider text-slate-950 pb-0.5 border-b border-slate-300"
            style={{ fontFamily: "'Merriweather', serif" }}
          >
            Research Experience & Appointments
          </h2>
          <div className="mt-2 space-y-3">
            {data.experience.map((exp, idx) => (
              <div key={idx} className="resume-section">
                <div className="flex flex-wrap items-baseline justify-between gap-1">
                  <span className="text-xs font-bold text-slate-950">
                    {exp.role}, <span className="font-normal italic">{exp.company}</span>
                  </span>
                  {exp.duration && <span className="text-xs text-slate-600">{exp.duration}</span>}
                </div>
                {exp.description && (
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed text-justify">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Technical Specializations */}
      {data.skills && data.skills.length > 0 && (
        <section className="resume-section">
          <h2
            className="text-xs font-bold uppercase tracking-wider text-slate-950 pb-0.5 border-b border-slate-300"
            style={{ fontFamily: "'Merriweather', serif" }}
          >
            Technical Specializations & Methodologies
          </h2>
          <p className="mt-1.5 text-xs text-slate-800 leading-relaxed">
            {data.skills.join(" • ")}
          </p>
        </section>
      )}

      {/* Honors, Awards & Grants */}
      {data.achievements && data.achievements.length > 0 && (
        <section className="resume-section">
          <h2
            className="text-xs font-bold uppercase tracking-wider text-slate-950 pb-0.5 border-b border-slate-300"
            style={{ fontFamily: "'Merriweather', serif" }}
          >
            Honors, Awards & Milestones
          </h2>
          <ul className="mt-1.5 list-disc list-inside space-y-1 text-xs text-slate-700">
            {data.achievements.map((ach, idx) => (
              <li key={idx} className="leading-relaxed">
                {typeof ach === "string" ? ach : ach.title || ach.description}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Research Interest / Summary */}
      {data.summary && (
        <section className="resume-section">
          <h2
            className="text-xs font-bold uppercase tracking-wider text-slate-950 pb-0.5 border-b border-slate-300"
            style={{ fontFamily: "'Merriweather', serif" }}
          >
            Research Interests & Objective
          </h2>
          <p className="mt-1.5 text-xs text-slate-700 leading-relaxed text-justify">
            {data.summary}
          </p>
        </section>
      )}
    </div>
  );
};

export default AcademicTemplate;
