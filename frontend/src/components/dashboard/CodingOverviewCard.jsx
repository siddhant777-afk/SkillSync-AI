import { RefreshCw } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { SiCodechef, SiCodeforces, SiKaggle, SiLeetcode } from "react-icons/si";
import { useUser } from "../../hooks/useUser";

const CodingOverviewCard = ({ user }) => {
  const { syncAccounts, isSyncing } = useUser();

  const profiles = [
    {
      label: "LeetCode",
      value: `${user?.leetcode?.solved ?? 420}`,
      helper: "Solved",
      icon: SiLeetcode,
      iconClass: "text-orange-500",
      badge: user?.leetcode?.rank || "Top 18%",
    },
    {
      label: "Codeforces",
      value: user?.codeforces?.rating ?? 1580,
      helper: "Rating",
      icon: SiCodeforces,
      iconClass: "text-blue-600",
      badge: user?.codeforces?.title || "Pupil",
    },
    {
      label: "CodeChef",
      value: user?.codechef?.rating ?? 1760,
      helper: "Rating",
      icon: SiCodechef,
      iconClass: "text-amber-700",
      badge: user?.codechef?.title || "3★",
    },
    {
      label: "GitHub",
      value: user?.github?.contributions ?? 620,
      helper: "Contributions",
      icon: FaGithub,
      iconClass: "text-slate-900",
      badge: "Active",
    },
    {
      label: "Kaggle",
      value: user?.kaggle?.notebooks ?? 4,
      helper: "Notebooks",
      icon: SiKaggle,
      iconClass: "text-sky-600",
      badge: "Contributor",
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Coding Profiles Overview</h2>
          <p className="mt-1 text-sm text-slate-500">Live signals synced from your developer handles.</p>
        </div>
        <button
          onClick={syncAccounts}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100 disabled:opacity-50"
        >
          <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {profiles.map(({ label, value, helper, icon: Icon, iconClass, badge }) => (
          <div key={label} className="rounded-xl border border-slate-100 p-4">
            <div className="flex items-center gap-2">
              <Icon size={19} className={iconClass} />
              <span className="text-sm font-medium text-slate-600">{label}</span>
            </div>
            <div className="mt-5 flex items-end justify-between gap-2">
              <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-400">{helper}</p>
              </div>
              <span className="text-xs font-medium text-emerald-600">{badge}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CodingOverviewCard;
