import { ArrowRight, BookOpen, BriefcaseBusiness, Lightbulb, Sparkles } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { useUser } from "../../hooks/useUser";

const Recommendations = () => {
  const { user } = useUser();

  const recs = user?.recommendations?.length
    ? user.recommendations
    : [
        "Learn Docker and containerize one of your existing full-stack projects.",
        "Practice 50 more Graph and Dynamic Programming problems on LeetCode.",
        "Build and deploy an end-to-end ML or microservices application with CI/CD.",
        "Start low-level System Design: master caching, load balancing, and SQL indexing.",
      ];

  const careerGoal = user?.careerGoal || "AI / ML Engineer";

  return (
    <div>
      <PageHeader
        eyebrow="AI career intelligence"
        title="Recommendations"
        description={`Personalized high-leverage milestones generated from your target role (${careerGoal}), verified skill gaps, and platform velocity.`}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        {[
          { title: "Target Alignment", value: "92%", icon: BriefcaseBusiness, text: `Your technical competencies are strongly aligned with ${careerGoal}.` },
          { title: "Learning Priority", value: "High", icon: BookOpen, text: "Focus on cloud deployment, scalable system design and automated pipelines." },
          { title: "Project Opportunity", value: "2", icon: Lightbulb, text: "Add live deployment links and unit tests to your primary repository projects." },
        ].map(({ title, value, icon: Icon, text }) => (
          <div key={title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
              <Icon size={19} className="text-indigo-600" />
            </div>
            <p className="mt-4 text-sm text-slate-400">{title}</p>
            <p className="mt-1 text-3xl font-bold">{value}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
          </div>
        ))}
      </div>
      <section className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-6">
        <div className="flex items-start gap-3">
          <Sparkles size={21} className="mt-1 text-indigo-600 shrink-0" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Your Recommended Action Plan</h2>
            <p className="mt-1 text-sm text-slate-500">
              Complete these sequenced recommendations to maximize your AI Placement Readiness score.
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {recs.map((item, index) => (
            <div key={item || index} className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm border border-slate-100 transition hover:border-indigo-200">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {index + 1}
              </span>
              <p className="flex-1 text-sm text-slate-700 font-medium">{item}</p>
              <ArrowRight size={16} className="text-slate-400" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Recommendations;
