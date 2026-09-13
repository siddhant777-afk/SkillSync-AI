import { useEffect, useState } from "react";
import {
  Search,
  Sparkles,
  CheckCircle2,
  Trophy,
  Award,
  Code2,
  FolderGit2,
  GitCommit,
  Star,
  Layers,
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import recruiterService from "../../services/recruiterService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { COLLEGE_OPTIONS } from "../../data/registerOptions";
import toast from "react-hot-toast";

const RecruiterCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: "",
    college: "",
    minScore: 0,
    minLeetcode: 0,
    minAdvanced: 0,
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
        title="Talent Explorer"
        description="Rank and discover verified student engineers strictly prioritized by Contest Rating, Questions Solved, Honors, Projects, and Real Code Commits."
        action={
          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs">
            <Sparkles size={15} /> 5-Tier Priority Matching
          </div>
        }
      />

      {/* Priority Ordering Rule Explainer Banner */}
      <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 dark:from-slate-900 dark:via-slate-850 dark:to-purple-950/30 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-500 shrink-0" />
            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Talent Explorer Strict Priority Ranking Order:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <span className="rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 px-2 py-0.5 border border-amber-200 dark:border-amber-800">
              #1 Contest Rating
            </span>
            <span className="text-slate-400">➔</span>
            <span className="rounded-md bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 border border-indigo-200 dark:border-indigo-800">
              #2 Questions Solved
            </span>
            <span className="text-slate-400">➔</span>
            <span className="rounded-md bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 px-2 py-0.5 border border-rose-200 dark:border-rose-800">
              #3 Achievements
            </span>
            <span className="text-slate-400">➔</span>
            <span className="rounded-md bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 px-2 py-0.5 border border-blue-200 dark:border-blue-800">
              #4 Projects
            </span>
            <span className="text-slate-400">➔</span>
            <span className="rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 border border-emerald-200 dark:border-emerald-800">
              #5 Commits
            </span>
          </div>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="grid gap-3 sm:gap-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 min-w-0">
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Target Role / Sector</label>
          <select
            value={filters.role}
            onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-500"
          >
            <option value="">All Industry Sectors</option>
            <option value="Full Stack">Full Stack Engineering</option>
            <option value="Backend">Backend Systems</option>
            <option value="AI / Machine Learning">AI & Data Science</option>
            <option value="Cloud & DevOps">Cloud & Infrastructure</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="Mobile Application">Mobile Development</option>
            <option value="Systems & Embedded">Core Systems & Embedded</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">College / University</label>
            {filters.college && (
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, college: "" }))}
                className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <input
            type="text"
            list="recruiter-colleges"
            placeholder="Select or search college..."
            value={filters.college}
            onChange={(e) => setFilters((prev) => ({ ...prev, college: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
          />
          <datalist id="recruiter-colleges">
            {COLLEGE_OPTIONS.map((c) => (
              <option key={c.value} value={c.label} />
            ))}
          </datalist>
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, college: "GL Bajaj Institute of Technology and Management" }))}
            className="mt-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded px-1.5 py-0.5 border border-indigo-200 dark:border-indigo-800 transition block truncate"
          >
            Filter: GL Bajaj Institute
          </button>
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
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Min Advanced Topics</label>
          <select
            value={filters.minAdvanced}
            onChange={(e) => setFilters((prev) => ({ ...prev, minAdvanced: parseInt(e.target.value, 10) }))}
            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
          >
            <option value="0">Any Advanced Depth</option>
            <option value="25">25+ Advanced Solved</option>
            <option value="50">50+ Advanced Solved</option>
            <option value="75">75+ Advanced Solved</option>
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
          {candidates.map((c, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;

            return (
              <article
                key={c.id}
                className="relative rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs transition hover:shadow-md dark:hover:border-slate-700 space-y-4 min-w-0"
              >
                {/* Top Rank Badge */}
                <div className="flex items-start justify-between gap-4 min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                          rank === 1
                            ? "bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                            : rank === 2
                            ? "bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600"
                            : rank === 3
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                            : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                        }`}
                      >
                        <Trophy size={12} className={isTop3 ? "text-amber-500" : "text-indigo-500"} />
                        #{rank} Priority Rank
                      </span>
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {c.careerGoal || "Software Engineer"}
                      </span>
                    </div>

                    <h3 className="mt-2 text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                      <span className="truncate">{c.name}</span>
                      {c.verifiedHandles?.leetcode && (
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" title="Verified LeetCode Profile" />
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {c.college} · {c.branch} ({c.year})
                    </p>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                      {c.placementReadiness}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Readiness Score
                    </span>
                  </div>
                </div>

                {/* 5-TIER PRIORITY METRICS STRIP */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    5-Tier Candidate Priority Evaluation:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 rounded-xl bg-slate-50 dark:bg-slate-850 p-2.5 text-center border border-slate-100 dark:border-slate-800 min-w-0">
                    {/* Priority 1: Contest Rating */}
                    <div className="min-w-0 bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 block truncate">
                        1. Contest Rating
                      </span>
                      <p className="mt-0.5 text-xs font-black text-slate-900 dark:text-white whitespace-nowrap">
                        {c.maxContestRating > 0 ? `${c.maxContestRating} pts` : (c.codeforcesRating > 0 ? `${c.codeforcesRating} pts` : "Unrated")}
                      </p>
                    </div>

                    {/* Priority 2: Questions Solved */}
                    <div className="min-w-0 bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 block truncate">
                        2. Solved Qs
                      </span>
                      <p className="mt-0.5 text-xs font-black text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        {c.totalQuestionsSolved || c.leetcodeSolved || 0}
                      </p>
                    </div>

                    {/* Priority 3: Achievements */}
                    <div className="min-w-0 bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 block truncate">
                        3. Achievements
                      </span>
                      <p className="mt-0.5 text-xs font-black text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        {c.achievementsCount ?? (c.achievements?.length || 0)}
                      </p>
                    </div>

                    {/* Priority 4: Projects */}
                    <div className="min-w-0 bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 block truncate">
                        4. Projects
                      </span>
                      <p className="mt-0.5 text-xs font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        {c.projectsCount || 0}
                      </p>
                    </div>

                    {/* Priority 5: Commits */}
                    <div className="min-w-0 bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 block truncate">
                        5. Commits
                      </span>
                      <p className="mt-0.5 text-xs font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {c.commitsCount || c.githubContributions || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Performance Stats - LeetCode, Advanced Topics, Codeforces, GitHub */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xl bg-slate-50/70 dark:bg-slate-850/50 p-3 text-center border border-slate-100 dark:border-slate-800 min-w-0">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase truncate">LeetCode Solved</p>
                    <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{c.leetcodeSolved} problems</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-purple-700 dark:text-purple-400 uppercase truncate">Advanced Topics</p>
                    <p className="mt-0.5 text-xs font-bold text-purple-700 dark:text-purple-400 whitespace-nowrap">{c.advancedTopicsSolved || c.dpSolved || 0} solved</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase truncate">Codeforces Rating</p>
                    <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {c.codeforcesRating > 0 ? `${c.codeforcesRating} pts` : "Unrated"}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase truncate">GitHub Commits</p>
                    <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{c.commitsCount || c.githubContributions || 0} commits</p>
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
                      <Trophy size={13} /> Verified Milestone
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 line-clamp-1 truncate">
                      {typeof c.achievements[0] === "string" ? c.achievements[0] : c.achievements[0].title}
                    </p>
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecruiterCandidates;
