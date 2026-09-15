import { useEffect, useState, useMemo } from "react";
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Target,
  BrainCircuit,
  Building2,
  BookOpen,
  Code,
  ShieldCheck,
  Cpu,
  Layers,
  Search,
  RefreshCw,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Link } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import careerService from "../../services/careerService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useUser } from "../../hooks/useUser";
import toast from "react-hot-toast";

const JobRecommendations = () => {
  const { user, refreshUser, isSyncing, syncAccounts } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [chartMode, setChartMode] = useState("bar"); // "bar" | "radar"
  const [viewTab, setViewTab] = useState("benchmarks"); // "benchmarks" | "live_openings"
  const [liveJobs, setLiveJobs] = useState([]);
  const [loadingLiveJobs, setLoadingLiveJobs] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const [res, liveRes] = await Promise.allSettled([
        careerService.getJobRecommendations(),
        careerService.getLiveJobs(),
      ]);
      if (res.status === "fulfilled") {
        setData(res.value);
        if (res.value?.roles && res.value.roles.length > 0 && !selectedRoleId) {
          setSelectedRoleId(res.value.roles[0].id);
        }
      }
      if (liveRes.status === "fulfilled" && liveRes.value?.jobs) {
        setLiveJobs(liveRes.value.jobs);
      }
    } catch (err) {
      console.error("Failed to load jobs:", err);
      toast.error("Failed to load real-time job suggestions.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and reactivity to user changes or global updates
  useEffect(() => {
    fetchJobs();
  }, [user]);

  useEffect(() => {
    const handleUpdate = () => {
      fetchJobs();
    };
    window.addEventListener("skillsync:update", handleUpdate);
    return () => window.removeEventListener("skillsync:update", handleUpdate);
  }, []);

  const lcSolved = user?.leetcode?.solved ?? 0;
  const cfSolved = user?.codeforces?.solved ?? 0;
  const ccSolved = user?.codechef?.solved ?? (user?.codechef?.problems?.total_solved ?? 0);
  const totalDsa = data?.totalDsaSolved ?? (lcSolved + cfSolved + ccSolved);

  const sectors = [
    "All",
    "Product Software Engineering",
    "AI & Data Science",
    "Cloud & Infrastructure",
    "Cybersecurity",
    "Mobile Development",
    "Core Systems & Embedded",
    "Backend & Distributed Systems",
  ];

  // Defensive filtering across roles
  const roles = Array.isArray(data?.roles) ? data.roles : [];

  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const matchesSector =
        selectedSector === "All" ||
        (r.sector && r.sector.toLowerCase().includes(selectedSector.toLowerCase()));
      const matchesSearch =
        !searchQuery.trim() ||
        r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.sector?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(r.requiredSkills) &&
          r.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        (Array.isArray(r.companies) &&
          r.companies.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesSector && matchesSearch;
    });
  }, [roles, selectedSector, searchQuery]);

  const selectedRole = useMemo(() => {
    if (!filteredRoles.length) return null;
    return filteredRoles.find((r) => r.id === selectedRoleId) || filteredRoles[0];
  }, [filteredRoles, selectedRoleId]);

  // Comparison Metrics for Selected Role Chart
  const comparisonData = useMemo(() => {
    if (!selectedRole) return [];
    const studentDsa = totalDsa;
    const studentDp =
      data?.dpSolved ??
      user?.leetcode?.topic_counts?.dp_specific ??
      16;
    const matchedCount = Array.isArray(selectedRole.matchedSkills)
      ? selectedRole.matchedSkills.length
      : Array.isArray(selectedRole.skillsHave)
      ? selectedRole.skillsHave.length
      : 0;
    const requiredSkillsCount = Array.isArray(selectedRole.requiredSkills)
      ? selectedRole.requiredSkills.length
      : 8;
    const readiness = data?.currentReadiness ?? user?.placementReadiness ?? 0;

    return [
      {
        metric: "DSA Solved",
        "Your Preparation": studentDsa,
        "Target Benchmark": selectedRole.minDsa || 150,
      },
      {
        metric: "Advanced Topics",
        "Your Preparation": studentDp,
        "Target Benchmark": selectedRole.minDp || 25,
      },
      {
        metric: "Skills Covered",
        "Your Preparation": matchedCount,
        "Target Benchmark": requiredSkillsCount,
      },
      {
        metric: "Readiness %",
        "Your Preparation": readiness,
        "Target Benchmark": 85,
      },
    ];
  }, [selectedRole, data, user, totalDsa]);

  const radarData = useMemo(() => {
    if (!selectedRole) return [];
    const studentDsa = totalDsa;
    const studentDp =
      data?.dpSolved ??
      user?.leetcode?.topic_counts?.dp_specific ??
      16;
    const matchedCount = Array.isArray(selectedRole.matchedSkills)
      ? selectedRole.matchedSkills.length
      : Array.isArray(selectedRole.skillsHave)
      ? selectedRole.skillsHave.length
      : 0;
    const requiredSkillsCount = Array.isArray(selectedRole.requiredSkills)
      ? selectedRole.requiredSkills.length
      : 8;
    const readiness = data?.currentReadiness ?? user?.placementReadiness ?? 0;

    return [
      {
        subject: "DSA Screening",
        Student: Math.min(100, Math.round((studentDsa / (selectedRole.minDsa || 150)) * 100)),
        Benchmark: 100,
        fullMark: 100,
      },
      {
        subject: "Advanced Topics",
        Student: Math.min(100, Math.round((studentDp / (selectedRole.minDp || 25)) * 100)),
        Benchmark: 100,
        fullMark: 100,
      },
      {
        subject: "Tech Stack Coverage",
        Student: Math.min(100, Math.round((matchedCount / requiredSkillsCount) * 100)),
        Benchmark: 100,
        fullMark: 100,
      },
      {
        subject: "Placement Readiness",
        Student: Math.min(100, Math.round((readiness / 85) * 100)),
        Benchmark: 100,
        fullMark: 100,
      },
      {
        subject: "Target Alignment",
        Student: selectedRole.matchPercentage || 50,
        Benchmark: 100,
        fullMark: 100,
      },
    ];
  }, [selectedRole, data, user]);

  const handleSyncAndRefresh = async () => {
    if (syncAccounts) {
      await syncAccounts();
    }
    await fetchJobs();
  };

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Page Header */}
      <PageHeader
        eyebrow="Placement Intelligence"
        title="Real-Time Job Match & Skill Gap Radar"
        description="Dynamic career role matching computed live against your verified DSA depth, advanced topics mastery, technical skills across sectors, and projects."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleSyncAndRefresh}
              disabled={isSyncing || loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-3.5 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-300 transition hover:bg-indigo-100 dark:hover:bg-indigo-900/60 disabled:opacity-50 shadow-xs"
            >
              <RefreshCw size={13} className={isSyncing || loading ? "animate-spin" : ""} />
              {isSyncing ? "Syncing Handles..." : "Sync Live Updates"}
            </button>
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-xs">
              <Sparkles size={14} /> Live Profile Radar Active
            </div>
          </div>
        }
      />

      {/* Top Summary Stats (Live Verified Preparation Metrics) */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Current Readiness</span>
            <Target size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
            {data?.currentReadiness ?? user?.placementReadiness ?? 0}%
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">
            Target: {user?.careerGoal || "Software Engineering"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total DSA Solved</span>
            <Code size={18} className="text-orange-500" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white whitespace-nowrap">
            {totalDsa}
          </p>
          <div className="mt-1 flex items-center gap-1.5 flex-wrap font-semibold text-[11px] text-slate-500 dark:text-slate-400">
            <span className="text-amber-600 dark:text-amber-400">{lcSolved} LC</span> ·
            <span className="text-blue-600 dark:text-blue-400">{cfSolved} CF</span> ·
            <span className="text-orange-600 dark:text-orange-400">{ccSolved} CC</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Advanced Topics Depth</span>
            <BrainCircuit size={18} className="text-purple-600 dark:text-purple-400" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 whitespace-nowrap">
            {data?.dpSolved ?? user?.leetcode?.topic_counts?.dp_specific ?? 16}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">Advanced algorithmic topics</p>
        </div>

        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Skills & Tech Stack</span>
            <Layers size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white whitespace-nowrap">
            {data?.totalSkillsVerified ?? user?.skills?.length ?? 0}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">Verified competencies in matrix</p>
        </div>
      </div>

      {/* Section View Tabs: Benchmarks vs Live Openings */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewTab("benchmarks")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
              viewTab === "benchmarks"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BarChart3 size={16} />
            <span>Role Benchmarks & Skill Gaps</span>
          </button>

          <button
            type="button"
            onClick={() => setViewTab("live_openings")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
              viewTab === "live_openings"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Briefcase size={16} />
            <span>Live Verified Openings ({liveJobs.length > 0 ? liveJobs.length : "Hiring Now"})</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </div>

        {viewTab === "live_openings" && (
          <button
            type="button"
            onClick={fetchJobs}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-indigo-300 transition"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh Openings
          </button>
        )}
      </div>

      {/* Live Openings Tab Content */}
      {viewTab === "live_openings" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase size={18} className="text-indigo-600 dark:text-indigo-400" />
                  Live Engineering Positions from Valid Organisations
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Active job listings matched in real-time against your verified skills. Click &quot;Apply on Company Site&quot; to submit your application directly.
                </p>
              </div>

              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
                {liveJobs.length} Active Positions Found
              </span>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {liveJobs.length === 0 ? (
                <div className="col-span-2 py-12 text-center">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No openings loaded yet. Tapping &quot;Refresh Openings&quot; pulls live vacancies from verified recruitment feeds.
                  </p>
                </div>
              ) : (
                liveJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 p-4 transition hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                            {job.company}
                          </span>
                          <span className="ml-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                            {job.location || "Remote"}
                          </span>
                        </div>
                        <span className="rounded-md bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                          {job.matchScore}% Match
                        </span>
                      </div>

                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                        {job.title}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {job.description || "Active technical engineering role seeking verified proficiencies."}
                      </p>

                      {/* Matched & Missing Skills */}
                      <div className="pt-2 space-y-1.5">
                        {job.matchedSkills && job.matchedSkills.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">You Have:</span>
                            {job.matchedSkills.map((s) => (
                              <span
                                key={s}
                                className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              >
                                <CheckCircle2 size={10} /> {s}
                              </span>
                            ))}
                          </div>
                        )}

                        {job.missingSkills && job.missingSkills.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">To Learn:</span>
                            {job.missingSkills.map((s) => (
                              <span
                                key={s}
                                className="rounded bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                        Source: {job.source || "Legitimate Hiring Board"}
                      </span>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition"
                      >
                        <span>Apply on Company Site</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Visual Preparation vs Benchmark Chart Card */}
      {viewTab === "benchmarks" && (
        <>
          {selectedRole && (
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                  {selectedRole.sector}
                </span>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Live Skill Gap Visualizer</span>
              </div>
              <h3 className="mt-1.5 text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Candidate Preparation vs {selectedRole.title} Benchmark
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time gap comparison using your live LeetCode stats, advanced topics problems, and verified skills.
              </p>
            </div>

            {/* Chart Mode Toggle */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setChartMode("bar")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  chartMode === "bar"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                Benchmark Bar
              </button>
              <button
                type="button"
                onClick={() => setChartMode("radar")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  chartMode === "radar"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                Radar Profile
              </button>
            </div>
          </div>

          {/* Chart Rendering */}
          <div className="h-72 w-full min-w-0">
            {chartMode === "bar" ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b830" vertical={false} />
                  <XAxis dataKey="metric" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #334155",
                      backgroundColor: "#0f172a",
                      color: "#ffffff",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }} />
                  <Bar dataKey="Your Preparation" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  <Bar dataKey="Target Benchmark" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#94a3b840" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b830" />
                  <Radar name="Your Preparation %" dataKey="Student" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                  <Radar name="Target Benchmark (100%)" dataKey="Benchmark" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                  <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #334155",
                      backgroundColor: "#0f172a",
                      color: "#ffffff",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Sector Filters & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap gap-2 min-w-0">
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedSector === sec
                  ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72 shrink-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles, skills, companies..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 pl-9 pr-4 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_1.3fr] min-w-0">
          {/* Roles List */}
          <div className="space-y-3 min-w-0">
            {filteredRoles.map((role) => {
              const reqSkills = Array.isArray(role.requiredSkills)
                ? role.requiredSkills
                : Array.isArray(role.skillsNeed)
                ? [...(role.skillsHave || []), ...(role.skillsNeed || [])]
                : [];
              const isSelected = selectedRole?.id === role.id;

              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`cursor-pointer rounded-2xl border p-5 transition shadow-xs ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm"
                      : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 min-w-0">
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate block">
                        {role.sector}
                      </span>
                      <h3 className="mt-1 font-bold text-base text-slate-900 dark:text-white truncate">{role.title}</h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{role.description}</p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                        {role.matchPercentage}%
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">Match</span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                    {reqSkills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                    {reqSkills.length > 4 && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 self-center">
                        +{reqSkills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Role Skill Gap Radar & Analysis */}
          {selectedRole && (
            <div className="space-y-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs min-w-0">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    {selectedRole.sector}
                  </span>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Benchmark Gap Analysis</span>
                </div>
                <h2 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white truncate">{selectedRole.title}</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400 break-words">{selectedRole.description}</p>
              </div>

              {/* Match Meter */}
              <div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Candidate Preparation Alignment</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{selectedRole.matchPercentage}% Matched</span>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
                    style={{ width: `${selectedRole.matchPercentage}%` }}
                  />
                </div>
              </div>

              {/* Verified vs Missing Skills Breakdown */}
              <div className="grid gap-4 sm:grid-cols-2 min-w-0">
                <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 p-4 min-w-0">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                    <CheckCircle2 size={15} /> Verified Skills You Have
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {Array.isArray(selectedRole.matchedSkills) && selectedRole.matchedSkills.length > 0 ? (
                      selectedRole.matchedSkills.map((s) => (
                        <span key={s} className="rounded-md bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                          {s}
                        </span>
                      ))
                    ) : Array.isArray(selectedRole.skillsHave) && selectedRole.skillsHave.length > 0 ? (
                      selectedRole.skillsHave.map((s) => (
                        <span key={s} className="rounded-md bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500 italic">No matching skills recorded yet</span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 p-4 min-w-0">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300 text-xs">
                    <AlertCircle size={15} /> Identified Skill Gaps to Focus On
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {Array.isArray(selectedRole.missingSkills) && selectedRole.missingSkills.length > 0 ? (
                      selectedRole.missingSkills.map((s) => (
                        <span key={s} className="rounded-md bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shadow-xs">
                          {s}
                        </span>
                      ))
                    ) : Array.isArray(selectedRole.skillsNeed) && selectedRole.skillsNeed.length > 0 ? (
                      selectedRole.skillsNeed.map((s) => (
                        <span key={s} className="rounded-md bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shadow-xs">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">100% Skill Coverage Achieved!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Recommended Immediate Milestone */}
              <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Target Preparation Roadmap for {selectedRole.title}
                </h4>
                <div className="mt-2 space-y-1.5">
                  {(Array.isArray(selectedRole.whatToFocusOn) ? selectedRole.whatToFocusOn : [selectedRole.recommendedAction || "Practice specialized problems and add relevant repositories."]).map((action, idx) => (
                    <p key={idx} className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words flex items-start gap-2">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                      <span>{action}</span>
                    </p>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <Link
                    to="/skills"
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition"
                  >
                    + Add Missing Skills →
                  </Link>
                  <Link
                    to="/projects"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    Add Portfolio Project
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comprehensive Interactive Job Match & Benchmark Comparison Table */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Complete Career Match Matrix & Benchmark Table
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Compare your live profile readiness against hiring requirements across all industry roles.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
            Showing {filteredRoles.length} evaluated roles
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">Role & Sector</th>
                <th className="py-3 px-4">Match Alignment</th>
                <th className="py-3 px-4">Threshold (DSA / Advanced)</th>
                <th className="py-3 px-4">Verified Skills</th>
                <th className="py-3 px-4">Missing Skills (Gaps)</th>
                <th className="py-3 px-4">Top Companies</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRoles.map((r) => {
                const isSelected = selectedRole?.id === r.id;
                const matchedCount = Array.isArray(r.matchedSkills) ? r.matchedSkills.length : Array.isArray(r.skillsHave) ? r.skillsHave.length : 0;
                const missingCount = Array.isArray(r.missingSkills) ? r.missingSkills.length : Array.isArray(r.skillsNeed) ? r.skillsNeed.length : 0;

                return (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRoleId(r.id)}
                    className={`cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-850 ${
                      isSelected ? "bg-indigo-50/40 dark:bg-indigo-950/30" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{r.title}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{r.sector}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              r.matchPercentage >= 75
                                ? "bg-emerald-500"
                                : r.matchPercentage >= 50
                                ? "bg-amber-500"
                                : "bg-indigo-500"
                            }`}
                            style={{ width: `${r.matchPercentage}%` }}
                          />
                        </div>
                        <span className="font-black text-slate-900 dark:text-white whitespace-nowrap">
                          {r.matchPercentage}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {r.minDsa}+ DSA / {r.minDp}+ Adv
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 size={11} /> {matchedCount} verified
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {missingCount > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 font-bold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          <AlertCircle size={11} /> {missingCount} gaps
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">None</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(r.companies || []).slice(0, 3).map((comp) => (
                          <span key={comp} className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                            {comp}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRoleId(r.id);
                        }}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {isSelected ? "Active Radar" : "Inspect"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default JobRecommendations;
