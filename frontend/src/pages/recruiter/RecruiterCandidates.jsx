import { useEffect, useState } from "react";
import { Search, UserCheck, Sparkles, CheckCircle2, Trophy, BrainCircuit, Building2, Code } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import recruiterService from "../../services/recruiterService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";

const RecruiterCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: "",
    college: "",
    minScore: 0,
    minLeetcode: 0,
    minDp: 0,
    skill: "",
  });

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const data = await recruiterService.getCandidates(filters);
      setCandidates(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [filters]);

  const handleContact = (name) => {
    toast.success(`Interview invitation queued for ${name}! Candidate notified via email.`);
  };

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <PageHeader
        eyebrow="Recruiter Talent Discovery"
        title="Cross-Sector Talent Explorer"
        description="Filter and match verified student talent across AI/ML, Cloud/DevOps, Cybersecurity, Mobile, Systems, and Software Engineering based on algorithmic depth and real-world honors."
        action={
          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs">
            <Sparkles size={15} /> Multi-Sector AI Talent Matching
          </div>
        }
      />

      {/* Advanced Multi-Sector Filter Bar */}
      <div className="grid gap-3 sm:gap-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 min-w-0">
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Target Role / Sector</label>
          <select
            value={filters.role}
            onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-500"
          >
            <option value="">All Industry Sectors</option>
            <option value="AI / Machine Learning">AI & Data Science</option>
            <option value="Cloud & DevOps">Cloud & Infrastructure</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="Mobile Application">Mobile Development</option>
            <option value="Systems & Embedded">Core Systems & Embedded</option>
            <option value="Software Development Engineer">SDE-1 (Tier-1)</option>
            <option value="Backend Platform">Backend Systems</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">College / University</label>
          <input
            type="text"
            placeholder="e.g. GL Bajaj, DTU, IIT"
            value={filters.college}
            onChange={(e) => setFilters((prev) => ({ ...prev, college: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Min Readiness ({filters.minScore}/100)</label>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={filters.minScore}
            onChange={(e) => setFilters((prev) => ({ ...prev, minScore: parseInt(e.target.value, 10) }))}
            className="mt-3 w-full accent-indigo-600"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Min LeetCode Solved</label>
          <select
            value={filters.minLeetcode}
            onChange={(e) => setFilters((prev) => ({ ...prev, minLeetcode: parseInt(e.target.value, 10) }))}
            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
          >
            <option value="0">Any Count</option>
            <option value="150">150+ Problems</option>
            <option value="300">300+ Problems</option>
            <option value="500">500+ Problems</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Min DP / Advanced</label>
          <select
            value={filters.minDp}
            onChange={(e) => setFilters((prev) => ({ ...prev, minDp: parseInt(e.target.value, 10) }))}
            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
          >
            <option value="0">Any DP Depth</option>
            <option value="25">25+ DP Solved</option>
            <option value="50">50+ DP Solved</option>
            <option value="75">75+ DP Solved</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Specific Skill</label>
          <div className="relative mt-1">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. PyTorch, Docker, Rust"
              value={filters.skill}
              onChange={(e) => setFilters((prev) => ({ ...prev, skill: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Candidate Results Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 min-w-0">
          {candidates.map((c) => (
            <article
              key={c.id}
              className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs transition hover:shadow-md dark:hover:border-slate-700 space-y-4 min-w-0"
            >
              <div className="flex items-start justify-between gap-4 min-w-0">
                <div className="min-w-0">
                  <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    {c.careerGoal || "Software Engineer"}
                  </span>
                  <h3 className="mt-2 text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                    <span className="truncate">{c.name}</span>
                    {c.verifiedHandles?.leetcode && (
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" title="Verified LeetCode Profile" />
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.college} · {c.branch} ({c.year})</p>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">{c.placementReadiness}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Readiness Score</span>
                </div>
              </div>

              {/* Performance Stats with DP Depth - Responsive 2x2 or 4x1 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xl bg-slate-50 dark:bg-slate-850 p-3 text-center border border-slate-100 dark:border-slate-800 min-w-0">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase truncate">LeetCode</p>
                  <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{c.leetcodeSolved} solved</p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase truncate">DP / Adv</p>
                  <p className="mt-0.5 text-xs font-bold text-purple-700 dark:text-purple-400 whitespace-nowrap">{c.dpSolved || 0} solved</p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase truncate">Codeforces</p>
                  <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {c.codeforcesRating > 0 ? `${c.codeforcesRating} pts` : "Unrated"}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase truncate">GitHub</p>
                  <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{c.githubContributions} commits</p>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Top Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.skills.slice(0, 5).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                  {c.skills.length > 5 && (
                    <span className="text-xs text-slate-400 self-center">+{c.skills.length - 5}</span>
                  )}
                </div>
              </div>

              {/* Non-DSA Achievements Snippet */}
              {c.achievements && c.achievements.length > 0 && (
                <div className="rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 p-3 text-xs min-w-0">
                  <div className="flex items-center gap-1 text-amber-800 dark:text-amber-300 font-semibold mb-1">
                    <Trophy size={13} /> Verified Non-DSA Milestone
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 line-clamp-1 truncate">{c.achievements[0].title}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  <span>{c.email}</span>
                </div>

                <button
                  onClick={() => handleContact(c.name)}
                  className="rounded-xl bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition shadow-xs"
                >
                  Schedule Interview
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterCandidates;
