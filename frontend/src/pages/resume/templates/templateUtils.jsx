import { Mail, MapPin, GraduationCap, Briefcase, Award, Code2, Globe, ExternalLink, Calendar } from "lucide-react";

export const getSpacingClass = (spacing) => {
  switch (spacing) {
    case "compact":
      return "space-y-3.5";
    case "spacious":
      return "space-y-6";
    case "standard":
    default:
      return "space-y-5";
  }
};

export const getMarginClass = (margins) => {
  switch (margins) {
    case "compact":
      return "p-5 sm:p-6";
    case "generous":
      return "p-8 sm:p-12 md:p-14";
    case "standard":
    default:
      return "p-6 sm:p-8 md:p-10";
  }
};

export const getFontSizeStyle = (size) => {
  switch (size) {
    case "compact":
      return { fontSize: "13px", lineHeight: "1.45" };
    case "spacious":
      return { fontSize: "15px", lineHeight: "1.65" };
    case "standard":
    default:
      return { fontSize: "14px", lineHeight: "1.55" };
  }
};

export const SectionDivider = ({ style = "solid", color = "#1e293b", className = "my-1.5" }) => {
  if (style === "none") return null;

  if (style === "accent-bar") {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <div className="h-[3px] w-8 rounded-full" style={{ backgroundColor: color }} />
        <div className="h-[1px] flex-1 bg-slate-200" />
      </div>
    );
  }

  if (style === "hairline") {
    return <div className={`w-full border-b border-slate-200/80 ${className}`} />;
  }

  if (style === "dotted") {
    return (
      <div
        className={`w-full border-b border-dotted ${className}`}
        style={{ borderColor: color, borderWidth: "1.5px" }}
      />
    );
  }

  if (style === "double") {
    return (
      <div className={`w-full py-0.5 ${className}`}>
        <div className="w-full border-b border-slate-300 mb-0.5" />
        <div className="w-full border-b border-slate-300" />
      </div>
    );
  }

  // Default solid line
  return (
    <div
      className={`w-full border-b ${className}`}
      style={{ borderColor: color ? `${color}40` : "#e2e8f0", borderWidth: "1px" }}
    />
  );
};

export { Mail, MapPin, GraduationCap, Briefcase, Award, Code2, Globe, ExternalLink, Calendar };
