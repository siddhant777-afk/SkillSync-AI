import { CalendarDays, Clock3, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

const UpcomingEventsCard = ({ events = [], user }) => {
  const safeEvents =
    Array.isArray(events) && events.length > 0
      ? events
      : [
          { title: "LeetCode Weekly Contest", platform: "leetcode", date: "Every Sunday", time: "08:00 AM" },
          { title: "Codeforces Round (Div 2 / Div 3)", platform: "codeforces", date: "Bi-weekly", time: "08:05 PM" },
          { title: "CodeChef Starters", platform: "codechef", date: "Every Wednesday", time: "08:00 PM" },
        ];

  const handleRegister = (event) => {
    const titleLower = (event.title || "").toLowerCase();
    const platform = event.platform || (titleLower.includes("leetcode") ? "leetcode" : titleLower.includes("codeforces") ? "codeforces" : "codechef");

    if (platform === "leetcode") {
      const lcUser = user?.leetcode?.username;
      const lcVerified = Boolean(lcUser && (user?.leetcode?.verified || user?.leetcode?.status === "synced"));

      if (!lcUser || !lcVerified) {
        toast.error("Registration Rejected: No verified LeetCode ID found! Please connect and verify your LeetCode handle in Profile to participate in live contest tracking.", {
          duration: 5000,
          id: "lc-contest-error",
        });
        return;
      }

      toast.success(`Live Recognition Active: @${lcUser} verified! Opening official LeetCode contest portal.`);
      window.open("https://leetcode.com/contest/", "_blank");
    } else if (platform === "codeforces") {
      const cfUser = user?.codeforces?.username;
      const cfVerified = Boolean(cfUser && (user?.codeforces?.verified || user?.codeforces?.status === "synced"));

      if (!cfUser || !cfVerified) {
        toast.error("Registration Rejected: No verified Codeforces handle found! Please connect and verify your handle in Profile.", {
          duration: 5000,
          id: "cf-contest-error",
        });
        return;
      }

      toast.success(`Live Recognition Active: @${cfUser} verified! Opening official Codeforces rounds.`);
      window.open("https://codeforces.com/contests", "_blank");
    } else {
      const ccUser = user?.codechef?.username;
      if (!ccUser) {
        toast.error("Registration Rejected: No CodeChef handle found! Please connect your handle in Profile.", {
          duration: 5000,
          id: "cc-contest-error",
        });
        return;
      }

      toast.success(`Live Recognition Active: @${ccUser} verified! Opening CodeChef contests.`);
      window.open("https://www.codechef.com/contests", "_blank");
    }
  };

  const getPlatformStatus = (event) => {
    const titleLower = (event.title || "").toLowerCase();
    if (titleLower.includes("leetcode")) {
      const u = user?.leetcode?.username;
      const v = user?.leetcode?.verified || user?.leetcode?.status === "synced";
      return u && v
        ? { recognized: true, label: `@${u} Verified`, color: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" }
        : { recognized: false, label: "LeetCode ID Required", color: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800" };
    }
    if (titleLower.includes("codeforces")) {
      const u = user?.codeforces?.username;
      const v = user?.codeforces?.verified || user?.codeforces?.status === "synced";
      return u && v
        ? { recognized: true, label: `@${u} Verified`, color: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" }
        : { recognized: false, label: "Codeforces ID Required", color: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800" };
    }
    const u = user?.codechef?.username;
    return u
      ? { recognized: true, label: `@${u} Connected`, color: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" }
      : { recognized: false, label: "CodeChef ID Required", color: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800" };
  };

  return (
    <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs min-w-0">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Upcoming Contests & Live Recognition</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">Live platform contest tracking requires a verified handle.</p>
        </div>
        <CalendarDays size={21} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
      </div>

      <div className="space-y-3 min-w-0">
        {safeEvents.map((event, idx) => {
          const status = getPlatformStatus(event);
          return (
            <div
              key={event.title || idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-100 dark:border-slate-800 p-4 transition hover:border-indigo-100 dark:hover:border-indigo-900/50 bg-white dark:bg-slate-850 min-w-0"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{event.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={13} /> {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock3 size={13} /> {event.time}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleRegister(event)}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shrink-0 ${
                  status.recognized
                    ? "bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {status.recognized ? (
                  <>
                    <span>Enter Contest Portal</span>
                    <ExternalLink size={12} />
                  </>
                ) : (
                  <>
                    <AlertCircle size={13} />
                    <span>Verify ID to Register</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default UpcomingEventsCard;
