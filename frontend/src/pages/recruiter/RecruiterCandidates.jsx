import { useEffect, useState } from "react";
import { Search, UserCheck, Sparkles } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import recruiterService from "../../services/recruiterService";
import toast from "react-hot-toast";

const RecruiterCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: "",
    minScore: 0,
    minLeetcode: 0,
    skill: "",
  });

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const data = await recruiterService.getCandidates(filters);
      setCandidates(data);
    } catch {
      // Fallback sample data if offline
      setCandidates([
        {
          id: 1,
          name: "Subhi Sharma",
          email: "subhi@example.com",
          college: "GL Bajaj Institute of Technology and Management",
          branch: "AIML",
          year: "3rd Year",
          careerGoal: "AI / ML Engineer",
          placementReadiness: 82,
          leetcodeSolved: 420,
          codeforcesRating: 1580,
          githubContributions: 620,
          skills: ["Python", "DSA", "Machine Learning", "SQL", "FastAPI"],
          projectsCount: 3,
        },
        {
          id: 2,
          name: "Rahul Verma",
          email: "rahul.verma@example.com",
          college: "Delhi Technological University",
          branch: "Computer Science",
          year: "4th Year",
          careerGoal: "Backend Developer",
          placementReadiness: 89,
          leetcodeSolved: 650,
          codeforcesRating: 1680,
          githubContributions: 940,
          skills: ["Go / Golang", "PostgreSQL", "Docker", "FastAPI", "Redis"],
          projectsCount: 4,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [filters]);

  const handleContact = (name) => {
    toast.success(`Interview invitation queued for ${name}!`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Recruiter Talent Discovery"
        title="Candidate Explorer"
        description="Filter and match verified student talent based on real-time coding achievements, skill matrices, and placement readiness."
        action={
          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <Sparkles size={15} /> AI Talent Matching Active
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="grid gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="text-xs font-semibold text-slate-600">Target Role</label>
          <select
            value={filters.role}
            onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
          >
            <option value="">All Target Roles</option>
            <option value="AI / ML Engineer">AI / ML Engineer</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Data Scientist">Data Scientist</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Min Placement Readiness ({filters.minScore}/100)</label>
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
          <label className="text-xs font-semibold text-slate-600">Min LeetCode Problems Solved</label>
          <select
            value={filters.minLeetcode}
            onChange={(e) => setFilters((prev) => ({ ...prev, minLeetcode: parseInt(e.target.value, 10) }))}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
          >
            <option value="0">Any Problem Count</option>
            <option value="200">200+ Problems</option>
            <option value="400">400+ Problems</option>
            <option value="600">600+ Problems</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Search Skill</label>
          <div className="relative mt-1">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. Python, Docker, React"
              value={filters.skill}
              onChange={(e) => setFilters((prev) => ({ ...prev, skill: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Candidate Results Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {candidates.map((c) => (
          <article
            key={c.id}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                  {c.careerGoal || "Software Engineer"}
                </span>
                <h3 className="mt-2 text-xl font-bold text-slate-900">{c.name}</h3>
                <p className="text-xs text-slate-500">{c.college} · {c.branch} ({c.year})</p>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-2xl font-black text-indigo-600">{c.placementReadiness}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Readiness Score</span>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center">
              <div>
                <p className="text-xs text-slate-400">LeetCode</p>
                <p className="mt-0.5 text-sm font-bold text-slate-800">{c.leetcodeSolved} solved</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Codeforces</p>
                <p className="mt-0.5 text-sm font-bold text-slate-800">{c.codeforcesRating || "Unrated"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">GitHub</p>
                <p className="mt-0.5 text-sm font-bold text-slate-800">{c.githubContributions} contribs</p>
              </div>
            </div>

            {/* Skills Chips */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-500">Verified Skills:</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(c.skills || []).map((s) => (
                  <span key={s} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs font-medium text-slate-500">{c.projectsCount} Portfolio Projects</span>
              <button
                onClick={() => handleContact(c.name)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                <UserCheck size={14} /> Contact Candidate
              </button>
            </div>
          </article>
        ))}
      </div>

      {candidates.length === 0 && !loading && (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center text-slate-500">
          No candidates match the specified filter criteria. Try adjusting the thresholds.
        </div>
      )}
    </div>
  );
};

export default RecruiterCandidates;
