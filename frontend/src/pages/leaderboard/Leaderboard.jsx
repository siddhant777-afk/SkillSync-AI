import { useEffect, useState } from "react";
import { Trophy, Medal, Award, Flame, Search, Filter, CheckCircle2, Sparkles, Code2, GraduationCap, ChevronDown } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import leaderboardService from "../../services/leaderboardService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const Leaderboard = () => {
  const [data, setData] = useState({
    colleges: [],
    branches: [],
    leaderboard: [],
    topPodium: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [sortBy, setSortBy] = useState("dsa");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await leaderboardService.getLeaderboard({
        college: selectedCollege,
        branch: selectedBranch,
        sortBy,
      });
      setData(res);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedCollege, selectedBranch, sortBy]);

  const filteredStudents = data.leaderboard.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.college.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <PageHeader
        eyebrow="Inter-College Competition"
        title="Student Leaderboard & Rankings"
        description="Real-time multi-college rankings evaluated by verified algorithmic problem solving, DP vs basics topic depth, and competitive contest ratings."
        action={
          <div className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-3.5 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-xs">
            <Sparkles size={15} /> Verified Platform Benchmarks
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="grid gap-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">College / University</label>
          <select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500"
          >
            <option value="all">All Colleges</option>
            {data.colleges.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Branch / Specialization</label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500"
          >
            <option value="all">All Branches</option>
            {data.branches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Rank Criteria</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-3.5 py-2.5 text-sm font-medium text-indigo-700 dark:text-indigo-300 outline-none focus:border-indigo-500"
          >
            <option value="dsa">🔥 Total DSA Solved</option>
            <option value="dp_advanced">🧠 DP & Advanced Depth</option>
            <option value="contest">🏆 Contest Rating (Codeforces)</option>
            <option value="readiness">⚡ Placement Readiness</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Search Student</label>
          <div className="relative mt-1">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or college..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Top 3 Podium (Gold, Silver, Bronze) */}
          {data.topPodium.length >= 3 && (
            <div className="grid gap-4 md:grid-cols-3 pt-4 min-w-0">
              {/* Rank 2 (Silver) */}
              <div className="order-2 md:order-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-850 p-6 shadow-xs flex flex-col items-center text-center relative min-w-0">
                <div className="absolute -top-3.5 rounded-full bg-slate-300 dark:bg-slate-700 px-3 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs flex items-center gap-1">
                  <Medal size={13} /> Rank #2 · Silver
                </div>
                <div className="mt-2 h-14 w-14 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-lg">
                  {data.topPodium[1].name.split(" ").map(n => n[0]).join("")}
                </div>
                <h3 className="mt-3 font-bold text-slate-900 dark:text-white flex items-center gap-1 truncate max-w-full">
                  <span className="truncate">{data.topPodium[1].name}</span>
                  {data.topPodium[1].verified && <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-full">{data.topPodium[1].college}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 w-full text-center">
                  <div className="rounded-xl bg-white dark:bg-slate-900 p-2 border border-slate-100 dark:border-slate-800 min-w-0">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase truncate">DSA Solved</p>
                    <p className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-200 whitespace-nowrap">{data.topPodium[1].leetcodeSolved}</p>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-slate-900 p-2 border border-slate-100 dark:border-slate-800 min-w-0">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase truncate">DP / Adv</p>
                    <p className="text-sm sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{data.topPodium[1].dpSolved}</p>
                  </div>
                </div>
                <span className="mt-3 inline-flex text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg truncate">
                  Readiness: {data.topPodium[1].placementReadiness}/100
                </span>
              </div>

              {/* Rank 1 (Gold - Center & Elevated) */}
              <div className="order-1 md:order-2 rounded-2xl border-2 border-amber-300 dark:border-amber-500/50 bg-gradient-to-b from-amber-50/70 via-white to-white dark:from-slate-900 dark:via-slate-850 dark:to-slate-850 p-6 shadow-md flex flex-col items-center text-center relative md:-translate-y-2 min-w-0">
                <div className="absolute -top-4 rounded-full bg-amber-400 dark:bg-amber-500 px-4 py-1 text-xs font-extrabold text-amber-950 dark:text-black shadow-md flex items-center gap-1.5">
                  <Trophy size={14} /> Rank #1 · Gold Champion
                </div>
                <div className="mt-2 h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-400 flex items-center justify-center font-black text-amber-800 dark:text-amber-300 text-xl shadow-inner">
                  {data.topPodium[0].name.split(" ").map(n => n[0]).join("")}
                </div>
                <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1 truncate max-w-full">
                  <span className="truncate">{data.topPodium[0].name}</span>
                  {data.topPodium[0].verified && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                </h3>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate max-w-full">{data.topPodium[0].college}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 w-full text-center">
                  <div className="rounded-xl bg-amber-50/80 dark:bg-slate-900 p-2 border border-amber-100 dark:border-slate-800 min-w-0">
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase truncate">DSA</p>
                    <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white whitespace-nowrap">{data.topPodium[0].leetcodeSolved}</p>
                  </div>
                  <div className="rounded-xl bg-amber-50/80 dark:bg-slate-900 p-2 border border-amber-100 dark:border-slate-800 min-w-0">
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase truncate">DP / Adv</p>
                    <p className="text-sm sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{data.topPodium[0].dpSolved}</p>
                  </div>
                  <div className="rounded-xl bg-amber-50/80 dark:bg-slate-900 p-2 border border-amber-100 dark:border-slate-800 min-w-0">
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase truncate">Rating</p>
                    <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white whitespace-nowrap">{data.topPodium[0].codeforcesRating}</p>
                  </div>
                </div>
                <span className="mt-3 inline-flex text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 px-3 py-1 rounded-lg truncate">
                  Placement Readiness: {data.topPodium[0].placementReadiness}/100
                </span>
              </div>

              {/* Rank 3 (Bronze) */}
              <div className="order-3 rounded-2xl border border-amber-100 dark:border-slate-800 bg-gradient-to-b from-orange-50/40 to-white dark:from-slate-900 dark:to-slate-850 p-6 shadow-xs flex flex-col items-center text-center relative min-w-0">
                <div className="absolute -top-3.5 rounded-full bg-amber-600 text-white px-3 py-1 text-xs font-bold shadow-xs flex items-center gap-1">
                  <Medal size={13} /> Rank #3 · Bronze
                </div>
                <div className="mt-2 h-14 w-14 rounded-full bg-orange-100 dark:bg-orange-950/60 border-2 border-amber-600/30 flex items-center justify-center font-bold text-amber-800 dark:text-amber-300 text-lg">
                  {data.topPodium[2].name.split(" ").map(n => n[0]).join("")}
                </div>
                <h3 className="mt-3 font-bold text-slate-900 dark:text-white flex items-center gap-1 truncate max-w-full">
                  <span className="truncate">{data.topPodium[2].name}</span>
                  {data.topPodium[2].verified && <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-full">{data.topPodium[2].college}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 w-full text-center">
                  <div className="rounded-xl bg-white dark:bg-slate-900 p-2 border border-slate-100 dark:border-slate-800 min-w-0">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase truncate">DSA Solved</p>
                    <p className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-200 whitespace-nowrap">{data.topPodium[2].leetcodeSolved}</p>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-slate-900 p-2 border border-slate-100 dark:border-slate-800 min-w-0">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase truncate">DP / Adv</p>
                    <p className="text-sm sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{data.topPodium[2].dpSolved}</p>
                  </div>
                </div>
                <span className="mt-3 inline-flex text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg truncate">
                  Readiness: {data.topPodium[2].placementReadiness}/100
                </span>
              </div>
            </div>
          )}

          {/* Full College Rankings Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <th className="px-5 py-4">Rank</th>
                    <th className="px-5 py-4">Student & College</th>
                    <th className="px-5 py-4 text-center">DSA Solved</th>
                    <th className="px-5 py-4 text-center">DP / Advanced</th>
                    <th className="px-5 py-4 text-center">Contest Rating</th>
                    <th className="px-5 py-4 text-center">Placement Score</th>
                    <th className="px-5 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="transition hover:bg-slate-50/50 dark:hover:bg-slate-850/50"
                    >
                      <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-200">
                        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs ${
                          student.rank === 1
                            ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-extrabold"
                            : student.rank === 2
                            ? "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold"
                            : student.rank === 3
                            ? "bg-orange-100 dark:bg-orange-950/80 text-amber-800 dark:text-amber-300 font-extrabold"
                            : "bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400"
                        }`}>
                          #{student.rank}
                        </span>
                      </td>

                      <td className="px-5 py-4 min-w-[200px]">
                        <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                          <span className="truncate">{student.name}</span>
                          {student.verified && (
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" title="Verified Profile" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                          {student.college} · {student.branch}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-center font-bold text-slate-800 dark:text-slate-200">
                        {student.leetcodeSolved}
                      </td>

                      <td className="px-5 py-4 text-center font-bold text-purple-700 dark:text-purple-400">
                        {student.dpSolved || 0}
                      </td>

                      <td className="px-5 py-4 text-center font-medium text-slate-600 dark:text-slate-400">
                        {student.codeforcesRating > 0 ? student.codeforcesRating : "—"}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 text-xs font-extrabold text-indigo-700 dark:text-indigo-300">
                          {student.placementReadiness}%
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          student.verified
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        }`}>
                          {student.verified ? "Verified" : "Unconnected"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;
