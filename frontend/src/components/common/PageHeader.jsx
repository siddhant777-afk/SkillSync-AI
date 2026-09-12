import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const PageHeader = ({ eyebrow, title, description, action, showBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === "/" || location.pathname === "";
  const displayBack = showBack !== undefined ? showBack : !isDashboard;

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between min-w-0 max-w-full">
      <div className="min-w-0 flex-1">
        {displayBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
          >
            <ArrowLeft size={13} />
            <span>Back</span>
          </button>
        )}
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 break-words dark:text-white sm:text-3xl lg:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm text-slate-500 break-words dark:text-slate-400 sm:text-base">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">{action}</div>}
    </div>
  );
};

export default PageHeader;
