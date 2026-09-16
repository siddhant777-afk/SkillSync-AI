import MinimalTemplate from "./templates/MinimalTemplate";
import ModernTemplate from "./templates/ModernTemplate";
import ProfessionalTemplate from "./templates/ProfessionalTemplate";
import ExecutiveTemplate from "./templates/ExecutiveTemplate";
import CreativeTemplate from "./templates/CreativeTemplate";
import TechnicalTemplate from "./templates/TechnicalTemplate";
import AcademicTemplate from "./templates/AcademicTemplate";
import ElegantTemplate from "./templates/ElegantTemplate";

const templateMap = {
  minimal: MinimalTemplate,
  modern: ModernTemplate,
  professional: ProfessionalTemplate,
  executive: ExecutiveTemplate,
  creative: CreativeTemplate,
  technical: TechnicalTemplate,
  academic: AcademicTemplate,
  elegant: ElegantTemplate,
};

const ResumeRenderer = ({ templateId = "modern", data, customization }) => {
  const TemplateComponent = templateMap[templateId] || ModernTemplate;

  return (
    <div
      id="printable-resume"
      className="w-full bg-white shadow-lg print:shadow-none print:m-0 print:w-full transition-all duration-150 overflow-hidden"
    >
      <TemplateComponent data={data} customization={customization} />
    </div>
  );
};

export default ResumeRenderer;
