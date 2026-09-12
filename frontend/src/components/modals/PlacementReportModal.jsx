import { X, CheckCircle2, Code2, FolderKanban, BrainCircuit, FileCheck } from "lucide-react";

const PlacementReportModal = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  const score = user?.placementReadiness || 82;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Official Report</span>
              <span className="text-xs text-slate-400">Target: {user?.careerGoal || "AI / ML Engineer"}</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Placement Readiness Report</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 text-center border border-indigo-100">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Composite Readiness Score</p>
          <div className="mt-2 flex items-baseline justify-center gap-1">
            <span className="text-6xl font-black text-indigo-700">{score}</span>
            <span className="text-xl font-bold text-slate-400">/100</span>
          </div>
          <p className="mt-2 text-sm font-medium text-slate-700">
            {score >= 80 ? "🔥 Top 15% Placement Candidate" : "📈 Good candidate with high upward potential"}
          </p>
          <p className="mt-1 text-xs text-slate-500 max-w-md">
            Calculated across competitive coding consistency, portfolio project depth, technical skill breadth, and ATS resume impact.
          </p>
        </div>

        {/* 4 Pillars Breakdown */}
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Evaluation Pillars</h3>

          <div className="rounded-xl border border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Code2 size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Competitive Coding (35%)</h4>
                  <p className="text-xs text-slate-400">{user?.leetcode?.solved || 420} LeetCode solved · Codeforces {user?.codeforces?.rating || 1580}</p>
                </div>
              </div>
              <span className="font-bold text-slate-700">28/35 pts</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FolderKanban size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Project Depth & GitHub (30%)</h4>
                  <p className="text-xs text-slate-400">{user?.github?.contributions || 620} contributions · 3 major projects</p>
                </div>
              </div>
              <span className="font-bold text-slate-700">26/30 pts</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Core Technical Skills (20%)</h4>
                  <p className="text-xs text-slate-400">Python, DSA, ML, SQL verified</p>
                </div>
              </div>
              <span className="font-bold text-slate-700">16/20 pts</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <FileCheck size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">ATS Resume & Profile (15%)</h4>
                  <p className="text-xs text-slate-400">84/100 ATS baseline score</p>
                </div>
              </div>
              <span className="font-bold text-slate-700">12/15 pts</span>
            </div>
          </div>
        </div>

        {/* Actionable Advice */}
        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <h4 className="font-bold text-slate-800 text-sm">Target Next Steps to Reach 90+</h4>
          <ul className="mt-2 space-y-2 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-indigo-600 shrink-0" />
              Solve 50 more LeetCode Medium/Hard DP and Graph problems.
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-indigo-600 shrink-0" />
              Add Docker containerization and a live demo URL to your primary ML project.
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-indigo-600 shrink-0" />
              Incorporate quantifiable performance metrics in your ATS resume summary.
            </li>
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlacementReportModal;
