import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const PageHeader = ({ eyebrow, title, description, action, showBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === "/" || location.pathname === "";
  const displayBack = showBack !== undefined ? showBack : !isDashboard;

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {displayBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft size={13} />
            <span>Back</span>
          </button>
        )}
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm text-slate-500 sm:text-base">{description}</p>}
      </div>
      {action}
    </div>
  );
};

export default PageHeader;
