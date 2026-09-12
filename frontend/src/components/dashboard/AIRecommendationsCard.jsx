import { ArrowRight, Bot, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const AIRecommendationsCard = ({ recommendations }) => {
  const safeRecs =
    Array.isArray(recommendations) && recommendations.length > 0
      ? recommendations
      : [
          "Learn Docker and containerize one of your ML/backend projects.",
          "Practice 50 more Graph and DP problems on LeetCode.",
          "Build and deploy an end-to-end full-stack app with CI/CD.",
          "Master system design: caching, database indexing, and APIs.",
        ];

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
          <Bot size={20} className="text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">AI Recommendations for You</h2>
          <p className="text-sm text-slate-500">Personalized actions based on your current profile.</p>
        </div>
      </div>

      <div className="space-y-3">
        {safeRecs.slice(0, 4).map((recommendation) => (
          <div key={recommendation} className="flex items-start gap-3 rounded-xl border border-slate-100 p-4">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
            <p className="text-sm leading-6 text-slate-600">{recommendation}</p>
            <ArrowRight size={16} className="ml-auto mt-1 shrink-0 text-slate-300" />
          </div>
        ))}
      </div>

      <Link
        to="/recommendations"
        className="mt-4 inline-block text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
      >
        View Full Roadmap →
      </Link>
    </section>
  );
};

export default AIRecommendationsCard;
