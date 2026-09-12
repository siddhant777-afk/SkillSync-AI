import { ArrowRight, Bot, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const AIRecommendationsCard = ({ recommendations = [] }) => {
  const safeRecs = Array.isArray(recommendations) ? recommendations : [];

  return (
    <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs min-w-0">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60">
          <Bot size={20} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white truncate">AI Recommendations for You</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Personalized actions based on verified platform signals.</p>
        </div>
      </div>

      {safeRecs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No custom recommendations yet</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Connect and verify your coding platforms or add skills to generate role-specific action items.
          </p>
          <Link
            to="/profile"
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Connect Handles in Profile →
          </Link>
        </div>
      ) : (
        <div className="space-y-3 min-w-0">
          {safeRecs.slice(0, 4).map((recommendation) => (
            <div
              key={recommendation}
              className="flex items-start gap-3 rounded-xl border border-slate-100 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-850/50 min-w-0"
            >
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
              <p className="text-xs leading-5 text-slate-700 dark:text-slate-300 break-words flex-1">{recommendation}</p>
              <ArrowRight size={14} className="ml-auto mt-0.5 shrink-0 text-slate-300 dark:text-slate-600" />
            </div>
          ))}
        </div>
      )}

      <Link
        to="/recommendations"
        className="mt-4 inline-block text-xs font-semibold text-indigo-600 dark:text-indigo-400 transition hover:text-indigo-700 dark:hover:text-indigo-300"
      >
        View Full Roadmap →
      </Link>
    </section>
  );
};

export default AIRecommendationsCard;
