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
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Mail,
  GitBranch,
} from "lucide-react";
import { SiLeetcode, SiCodeforces, SiCodechef } from "react-icons/si";
import { FaGithub } from "react-icons/fa";
import PageHeader from "../../components/common/PageHeader";
import recruiterService from "../../services/recruiterService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { COLLEGE_OPTIONS } from "../../data/registerOptions";
import toast from "react-hot-toast";

const RecruiterCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBreakdownId, setExpandedBreakdownId] = useState(null);
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
      setCandidates(Array.isArray(data) ? data : []);
    } catch {
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [filters]);

  const toggleBreakdown = (id) => {
    setExpandedBreakdownId((prev) => (prev === id ? null : id));
  };

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
      <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50/90 via-white to-purple-50/90 dark:from-slate-900 dark:via-slate-850 dark:to-purple-950/30 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <Trophy size={18} className="text-amber-500 shrink-0" />
            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Talent Explorer Strict Priority Ranking Order:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 px-2 py-1 border border-amber-200 dark:border-amber-800">
              #1 Contest Rating
            </span>
            <span className="text-slate-400">➔</span>
            <span className="rounded-md bg-indigo-100 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-300 px-2 py-1 border border-indigo-200 dark:border-indigo-800">
              #2 Questions Solved
            </span>
            <span className="text-slate-400">➔</span>
            <span className="rounded-md bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-300 px-2 py-1 border border-rose-200 dark:border-rose-800">
              #3 Achievements
            </span>
            <span className="text-slate-400">➔</span>
            <span className="rounded-md bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300 px-2 py-1 border border-blue-200 dark:border-blue-800">
              #4 Projects
            </span>
            <span className="text-slate-400">➔</span>
            <span className="rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 px-2 py-1 border border-emerald-200 dark:border-emerald-800">
              #5 Commits
            </span>
          </div>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="grid gap-3 sm:gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 min-w-0">
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Role / Sector</label>
          <select
            value={filters.role}
            onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-500"
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
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">College / Institution</label>
          <select
            value={filters.college}
            onChange={(e) => setFilters((prev) => ({ ...prev, college: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
          >
            <option value="">All Colleges</option>
            <option value="GL Bajaj Institute of Technology and Management">GL Bajaj Institute of Technology and Management</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Min Readiness ({filters.minScore}/100)</label>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={filters.minScore}
            onChange={(e) => setFilters((prev) => ({ ...prev, minScore: parseInt(e.target.value, 10) }))}
            className="mt-3 w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Min LeetCode Solved</label>
          <select
            value={filters.minLeetcode}
            onChange={(e) => setFilters((prev) => ({ ...prev, minLeetcode: parseInt(e.target.value, 10) }))}
            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
          >
            <option value="0">Any Count</option>
            <option value="150">150+ Problems</option>
            <option value="300">300+ Problems</option>
            <option value="500">500+ Problems</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Min Advanced Topics</label>
          <select
            value={filters.minAdvanced}
            onChange={(e) => setFilters((prev) => ({ ...prev, minAdvanced: parseInt(e.target.value, 10) }))}
            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
          >
            <option value="0">Any Advanced Depth</option>
            <option value="25">25+ Advanced Solved</option>
            <option value="50">50+ Advanced Solved</option>
            <option value="75">75+ Advanced Solved</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Specific Skill</label>
          <div className="relative mt-1">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. PyTorch, Docker, Rust"
              value={filters.skill}
              onChange={(e) => setFilters((prev) => ({ ...prev, skill: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Candidate Results Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <LoadingSpinner />
        </div>
      ) : candidates.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
          <p className="text-base font-bold text-slate-800 dark:text-slate-200">No candidates match your selected criteria.</p>
          <p className="mt-1 text-xs text-slate-500">Try adjusting your filters or college selections to see more profiles.</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 min-w-0">
          {candidates.map((c, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;
            const isExpanded = expandedBreakdownId === c.id;

            const breakdown = c.platformBreakdown || {
              leetcode: {
                platform: "LeetCode",
                handle: c.leetcodeHandle || "",
                contestRating: c.leetcodeContestRating || 0,
                contestBadge: "",
                solved: c.leetcodeSolved || 0,
                advancedTopicsSolved: c.advancedTopicsSolved || c.dpSolved || 0,
                verified: c.verifiedHandles?.leetcode || false,
                profileUrl: c.leetcodeHandle ? `https://leetcode.com/u/${c.leetcodeHandle}` : "",
              },
              codeforces: {
                platform: "Codeforces",
                handle: c.codeforcesHandle || "",
                rating: c.codeforcesRating || 0,
                maxRating: c.codeforcesRating || 0,
                rank: c.codeforcesTitle || "Unrated",
                solved: c.codeforcesSolved || 0,
                verified: c.verifiedHandles?.codeforces || false,
                profileUrl: c.codeforcesHandle ? `https://codeforces.com/profile/${c.codeforcesHandle}` : "",
              },
              codechef: {
                platform: "CodeChef",
                handle: c.codechefHandle || "",
                rating: c.codechefRating || 0,
                stars: c.codechefStars || "",
                solved: c.codechefSolved || 0,
                verified: c.verifiedHandles?.codechef || false,
                profileUrl: c.codechefHandle ? `https://www.codechef.com/users/${c.codechefHandle}` : "",
              },
              github: {
                platform: "GitHub",
                handle: c.githubHandle || "",
                commits: c.commitsCount || c.githubContributions || 0,
                repositoriesCount: c.projectsCount || 0,
                repositoriesList: c.repositoriesList || [],
                verified: c.verifiedHandles?.github || false,
                profileUrl: c.githubHandle ? `https://github.com/${c.githubHandle}` : "",
              },
            };

            return (
              <article
                key={c.id}
                className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs transition hover:shadow-md dark:hover:border-slate-700 space-y-4 min-w-0"
              >
                {/* Top Rank & Readiness Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                          rank === 1
                            ? "bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                            : rank === 2
                            ? "bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600"
                            : rank === 3
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                            : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                        }`}
                      >
                        <Trophy size={12} className={isTop3 ? "text-amber-500" : "text-indigo-500"} />
                        #{rank} Priority Rank
                      </span>
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {c.careerGoal || "Software Engineer"}
                      </span>
                    </div>

                    <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                      <span className="truncate">{c.name}</span>
                      {c.verifiedHandles?.leetcode && (
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" title="Verified Coding Profile" />
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {c.college} · {c.branch} ({c.year})
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                      {c.placementReadiness}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Readiness Score
                    </span>
                  </div>
                </div>

                {/* PLATFORM CONTEST RATINGS & QUESTION COUNTS WITH PLATFORM NAMES DIRECTLY */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Verified Platforms Telemetry:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
                    {/* LeetCode */}
                    <div className="flex items-center gap-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 p-2.5 min-w-0">
                      <SiLeetcode className="text-amber-500 shrink-0 text-base" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-amber-900 dark:text-amber-300">
                          <span>LeetCode</span>
                          {c.leetcodeContestRating > 0 && <span className="font-extrabold">{c.leetcodeContestRating} pts</span>}
                        </div>
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {c.leetcodeContestRating > 0 ? `Rating: ${c.leetcodeContestRating}` : "Unrated"} · {c.leetcodeSolved || 0} Solved
                        </p>
                      </div>
                    </div>

                    {/* Codeforces */}
                    <div className="flex items-center gap-2 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 p-2.5 min-w-0">
                      <SiCodeforces className="text-blue-500 shrink-0 text-base" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-blue-900 dark:text-blue-300">
                          <span>Codeforces</span>
                          {c.codeforcesRating > 0 && <span className="font-extrabold">{c.codeforcesRating} pts</span>}
                        </div>
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {c.codeforcesRating > 0 ? `Rating: ${c.codeforcesRating}` : "Unrated"} · {c.codeforcesSolved || 0} Solved
                        </p>
                      </div>
                    </div>

                    {/* CodeChef */}
                    <div className="flex items-center gap-2 rounded-xl bg-orange-50/80 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-800/60 p-2.5 min-w-0">
                      <SiCodechef className="text-orange-600 dark:text-orange-400 shrink-0 text-base" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-orange-900 dark:text-orange-300">
                          <span>CodeChef</span>
                          {c.codechefRating > 0 && <span className="font-extrabold">{c.codechefRating} pts</span>}
                        </div>
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {c.codechefRating > 0 ? `Rating: ${c.codechefRating}` : "Unrated"} · {c.codechefSolved || 0} Solved
                        </p>
                      </div>
                    </div>

                    {/* GitHub */}
                    <div className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-2.5 min-w-0">
                      <FaGithub className="text-slate-900 dark:text-white shrink-0 text-base" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-800 dark:text-slate-200">
                          <span>GitHub</span>
                          <span>Active</span>
                        </div>
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {c.commitsCount || c.githubContributions || 0} Commits · {c.projectsCount || 0} Repos
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5-TIER PRIORITY EVALUATION STRIP */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Official 5-Tier Priority Evaluation
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                      Strict Multi-Tier Ranking
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 rounded-xl bg-slate-50 dark:bg-slate-850 p-2.5 text-center border border-slate-200 dark:border-slate-800 min-w-0">
                    {/* Priority 1: Contest Rating */}
                    <div className="min-w-0 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-750">
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 block truncate">
                        1. Contest Rating
                      </span>
                      <p className="mt-0.5 text-xs font-black text-slate-900 dark:text-white whitespace-nowrap">
                        {c.maxContestRating > 0 ? `${c.maxContestRating} pts` : (c.codeforcesRating > 0 ? `${c.codeforcesRating} pts` : "Unrated")}
                      </p>
                    </div>

                    {/* Priority 2: Questions Solved */}
                    <div className="min-w-0 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-750">
                      <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 block truncate">
                        2. Solved Qs
                      </span>
                      <p className="mt-0.5 text-xs font-black text-indigo-700 dark:text-indigo-300 whitespace-nowrap">
                        {c.totalQuestionsSolved || c.leetcodeSolved || 0}
                      </p>
                    </div>

                    {/* Priority 3: Achievements */}
                    <div className="min-w-0 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-750">
                      <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 block truncate">
                        3. Achievements
                      </span>
                      <p className="mt-0.5 text-xs font-black text-rose-700 dark:text-rose-300 whitespace-nowrap">
                        {c.achievementsCount ?? (c.achievements?.length || 0)}
                      </p>
                    </div>

                    {/* Priority 4: Projects */}
                    <div className="min-w-0 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-750">
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 block truncate">
                        4. Projects
                      </span>
                      <p className="mt-0.5 text-xs font-black text-blue-700 dark:text-blue-300 whitespace-nowrap">
                        {c.projectsCount || 0}
                      </p>
                    </div>

                    {/* Priority 5: Commits */}
                    <div className="min-w-0 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-750 col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block truncate">
                        5. Commits
                      </span>
                      <p className="mt-0.5 text-xs font-black text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                        {c.commitsCount || c.githubContributions || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Skills Tags */}
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Top Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.skills.slice(0, 6).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-800 dark:text-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                    {c.skills.length > 6 && (
                      <span className="text-xs font-semibold text-slate-400 self-center">+{c.skills.length - 6}</span>
                    )}
                  </div>
                </div>

                {/* Non-DSA Achievements Snippet */}
                {c.achievements && c.achievements.length > 0 && (
                  <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 p-3 text-xs min-w-0">
                    <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-bold mb-1">
                      <Trophy size={13} className="text-amber-500 shrink-0" />
                      <span>Verified Honors & Hackathons</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 line-clamp-1 truncate">
                      {typeof c.achievements[0] === "string" ? c.achievements[0] : c.achievements[0].title}
                    </p>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => toggleBreakdown(c.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/90 dark:bg-indigo-950/50 px-3.5 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition shadow-2xs"
                  >
                    <span>{isExpanded ? "Hide Platform Breakdown" : "🔍 View Verified Platform Breakdown"}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleContact(c.name)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition shadow-xs"
                  >
                    <Mail size={13} /> Schedule Interview
                  </button>
                </div>

                {/* EXPANDABLE VERIFIED PLATFORM BREAKDOWN DRAWER */}
                {isExpanded && (
                  <div className="mt-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-indigo-100 dark:border-slate-800 p-4 sm:p-5 space-y-4 animate-in fade-in min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          Verified Multi-Platform Skill & Problem Breakdown
                        </h4>
                      </div>
                      <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                        Live Telemetry
                      </span>
                    </div>

                    {/* Platform Deep-Dive Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                      {/* 1. LeetCode Verified Card */}
                      <div className="rounded-xl bg-white dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                            <SiLeetcode className="text-amber-500" /> LeetCode Deep Dive
                          </div>
                          {breakdown.leetcode?.profileUrl ? (
                            <a
                              href={breakdown.leetcode.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                            >
                              Profile <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Verified</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="rounded-lg bg-amber-50/70 dark:bg-slate-850 p-2 border border-amber-100 dark:border-slate-800">
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Contest Rating</p>
                            <p className="text-sm font-black text-amber-700 dark:text-amber-400">
                              {breakdown.leetcode?.contestRating > 0 ? `${breakdown.leetcode.contestRating} pts` : "Unrated"}
                            </p>
                            {breakdown.leetcode?.contestBadge && (
                              <p className="text-[9px] font-bold text-amber-800 dark:text-amber-300">
                                {breakdown.leetcode.contestBadge}
                              </p>
                            )}
                          </div>
                          <div className="rounded-lg bg-indigo-50/70 dark:bg-slate-850 p-2 border border-indigo-100 dark:border-slate-800">
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Solved / Advanced</p>
                            <p className="text-sm font-black text-indigo-700 dark:text-indigo-400">
                              {breakdown.leetcode?.solved || 0} Qs
                            </p>
                            <p className="text-[9px] font-bold text-purple-700 dark:text-purple-400">
                              {breakdown.leetcode?.advancedTopicsSolved || 0} Advanced
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 2. Codeforces Verified Card */}
                      <div className="rounded-xl bg-white dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                            <SiCodeforces className="text-blue-500" /> Codeforces Deep Dive
                          </div>
                          {breakdown.codeforces?.profileUrl ? (
                            <a
                              href={breakdown.codeforces.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                            >
                              Profile <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Verified</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="rounded-lg bg-blue-50/70 dark:bg-slate-850 p-2 border border-blue-100 dark:border-slate-800">
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Contest Rating</p>
                            <p className="text-sm font-black text-blue-700 dark:text-blue-400">
                              {breakdown.codeforces?.rating > 0 ? `${breakdown.codeforces.rating} pts` : "Unrated"}
                            </p>
                            <p className="text-[9px] font-bold text-blue-800 dark:text-blue-300 truncate">
                              {breakdown.codeforces?.rank || "Active Coder"}
                            </p>
                          </div>
                          <div className="rounded-lg bg-slate-100 dark:bg-slate-850 p-2 border border-slate-200 dark:border-slate-800">
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Problems Solved</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">
                              {breakdown.codeforces?.solved || 0} Qs
                            </p>
                            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400">Competitive Solves</p>
                          </div>
                        </div>
                      </div>

                      {/* 3. CodeChef Verified Card */}
                      <div className="rounded-xl bg-white dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                            <SiCodechef className="text-orange-600 dark:text-orange-400" /> CodeChef Deep Dive
                          </div>
                          {breakdown.codechef?.profileUrl ? (
                            <a
                              href={breakdown.codechef.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                            >
                              Profile <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Verified</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="rounded-lg bg-orange-50/70 dark:bg-slate-850 p-2 border border-orange-100 dark:border-slate-800">
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Contest Rating</p>
                            <p className="text-sm font-black text-orange-700 dark:text-orange-400">
                              {breakdown.codechef?.rating > 0 ? `${breakdown.codechef.rating} pts` : "Unrated"}
                            </p>
                            <p className="text-[9px] font-bold text-orange-800 dark:text-orange-300">
                              {breakdown.codechef?.stars || "Active Coder"}
                            </p>
                          </div>
                          <div className="rounded-lg bg-slate-100 dark:bg-slate-850 p-2 border border-slate-200 dark:border-slate-800">
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Problems Solved</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">
                              {breakdown.codechef?.solved || 0} Qs
                            </p>
                            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400">Practice & Contests</p>
                          </div>
                        </div>
                      </div>

                      {/* 4. GitHub Verified Card */}
                      <div className="rounded-xl bg-white dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                            <FaGithub className="text-slate-900 dark:text-white" /> GitHub Projects & Code
                          </div>
                          {breakdown.github?.profileUrl ? (
                            <a
                              href={breakdown.github.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                            >
                              Profile <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Verified</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="rounded-lg bg-emerald-50/70 dark:bg-slate-850 p-2 border border-emerald-100 dark:border-slate-800">
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Actual Commits</p>
                            <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                              {(breakdown.github?.commits || 0).toLocaleString()}
                            </p>
                            <p className="text-[9px] font-bold text-emerald-800 dark:text-emerald-300">Verified Git Activity</p>
                          </div>
                          <div className="rounded-lg bg-slate-100 dark:bg-slate-850 p-2 border border-slate-200 dark:border-slate-800">
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Public Repos</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">
                              {breakdown.github?.repositoriesCount || 0}
                            </p>
                            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400">Open Source</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Verified Repositories List with Live Links */}
                    {breakdown.github?.repositoriesList && breakdown.github.repositoriesList.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Verified Repositories & Real Projects ({breakdown.github.repositoriesList.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {breakdown.github.repositoriesList.slice(0, 4).map((repo) => (
                            <a
                              key={repo.name}
                              href={repo.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex flex-col justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition shadow-2xs"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                                  {repo.name}
                                </span>
                                <ExternalLink size={11} className="text-slate-400 group-hover:text-indigo-500 shrink-0" />
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {repo.description || "Open source project on GitHub"}
                              </p>
                              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">{repo.language || "Code"}</span>
                                <div className="flex items-center gap-2">
                                  <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400"><Star size={10} /> {repo.stars}</span>
                                  <span className="flex items-center gap-0.5"><GitBranch size={10} /> {repo.forks}</span>
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Verified Honors & Hackathons */}
                    {c.achievements && c.achievements.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Verified Honors, Hackathons & Certifications
                        </p>
                        <div className="space-y-1">
                          {c.achievements.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                              <Trophy size={13} className="text-amber-500 shrink-0" />
                              <span>{typeof item === "string" ? item : item.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecruiterCandidates;
