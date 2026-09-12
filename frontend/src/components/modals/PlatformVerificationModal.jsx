import { useState } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { FaGithub, FaKaggle } from "react-icons/fa";
import { SiCodechef, SiCodeforces, SiLeetcode } from "react-icons/si";
import userService from "../../services/userService";
import { useUser } from "../../hooks/useUser";
import toast from "react-hot-toast";

const PLATFORM_CONFIGS = [
  {
    id: "leetcode",
    name: "LeetCode",
    icon: SiLeetcode,
    iconColor: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50",
    urlPrefix: "leetcode.com/u/",
    placeholder: "e.g. neal_wu or your handle",
    instructions: [
      "Open your profile settings at leetcode.com/profile/.",
      "Under Privacy Settings, ensure your profile visibility is set to Public.",
      "Enter your exact LeetCode username (not your email).",
      "Click 'Verify & Extract Live Stats' to sync your total problems, DP depth, and rank.",
    ],
  },
  {
    id: "github",
    name: "GitHub",
    icon: FaGithub,
    iconColor: "text-slate-900 dark:text-white",
    bgColor: "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700",
    urlPrefix: "github.com/",
    placeholder: "e.g. torvalds or your username",
    instructions: [
      "Ensure your GitHub account and repository activity are public.",
      "Check that your commits are associated with your primary public email.",
      "Enter your GitHub username (from github.com/username).",
      "Click 'Verify & Extract Live Stats' to pull commit streaks, repositories, and stars.",
    ],
  },
  {
    id: "codeforces",
    name: "Codeforces",
    icon: SiCodeforces,
    iconColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50",
    urlPrefix: "codeforces.com/profile/",
    placeholder: "e.g. tourist or your handle",
    instructions: [
      "Make sure you have participated in at least one contest or have an active handle.",
      "Enter your exact Codeforces handle.",
      "Click 'Verify & Extract Live Stats' to pull your live competitive rating and title.",
    ],
  },
  {
    id: "codechef",
    name: "CodeChef",
    icon: SiCodechef,
    iconColor: "text-amber-700 dark:text-amber-500",
    bgColor: "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40",
    urlPrefix: "codechef.com/users/",
    placeholder: "e.g. your_handle",
    instructions: [
      "Ensure your CodeChef profile page is publicly reachable.",
      "Enter your CodeChef handle.",
      "Click 'Verify & Extract Live Stats' to verify stars and global rating.",
    ],
  },
  {
    id: "kaggle",
    name: "Kaggle",
    icon: FaKaggle,
    iconColor: "text-sky-500",
    bgColor: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/50",
    urlPrefix: "kaggle.com/",
    placeholder: "e.g. your_handle",
    instructions: [
      "Ensure your Kaggle profile is public.",
      "Enter your Kaggle username.",
      "Click 'Verify & Extract Live Stats' to extract notebooks and tier badges.",
    ],
  },
];

const PlatformVerificationModal = ({ isOpen, onClose, user, onSyncSuccess }) => {
  const { refreshUser, notifyGlobalUpdate } = useUser();
  const [handles, setHandles] = useState({
    leetcode: user?.leetcode?.username || user?.connectedAccounts?.leetcode || "",
    github: user?.github?.username || user?.connectedAccounts?.github || "",
    codeforces: user?.codeforces?.username || user?.connectedAccounts?.codeforces || "",
    codechef: user?.codechef?.username || user?.connectedAccounts?.codechef || "",
    kaggle: user?.kaggle?.username || user?.connectedAccounts?.kaggle || "",
  });

  const [expandedInstructions, setExpandedInstructions] = useState({});
  const [verifyingPlatform, setVerifyingPlatform] = useState(null);
  const [extractedStats, setExtractedStats] = useState({});

  if (!isOpen) return null;

  const handleClose = () => {
    if (refreshUser) refreshUser();
    if (notifyGlobalUpdate) notifyGlobalUpdate();
    if (onSyncSuccess) onSyncSuccess();
    onClose();
  };

  const toggleInstructions = (id) => {
    setExpandedInstructions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleVerify = async (platformId) => {
    const handle = (handles[platformId] || "").trim();
    if (!handle) {
      toast.error(`Please enter your ${platformId.toUpperCase()} username first.`);
      return;
    }

    setVerifyingPlatform(platformId);
    const toastId = toast.loading(`Verifying @${handle} on ${platformId.toUpperCase()} & extracting live stats...`);

    try {
      const res = await userService.verifyPlatform(platformId, handle);
      if (res.verified && res.success) {
        toast.success(`@${handle} verified successfully! Extracted live metrics.`, { id: toastId });
        setExtractedStats((prev) => ({ ...prev, [platformId]: res.stats }));
        if (refreshUser) refreshUser();
        if (notifyGlobalUpdate) notifyGlobalUpdate();
        if (onSyncSuccess) onSyncSuccess();
      } else {
        toast.error(res.message || `Could not verify handle on ${platformId}.`, { id: toastId, duration: 5000 });
      }
    } catch (err) {
      toast.error(`Failed to verify handle. Please check connection and try again.`, { id: toastId });
    } finally {
      setVerifyingPlatform(null);
    }
  };

  const getPlatformVerifiedStatus = (id) => {
    if (extractedStats[id]) return true;
    if (id === "leetcode") return Boolean(user?.leetcode?.verified || user?.leetcode?.status === "synced");
    if (id === "github") return Boolean(user?.github?.verified || user?.github?.status === "synced");
    if (id === "codeforces") return Boolean(user?.codeforces?.verified || user?.codeforces?.status === "synced");
    if (id === "codechef") return Boolean(user?.codechef?.verified || user?.codechef?.status === "synced");
    if (id === "kaggle") return Boolean(user?.kaggle?.verified || user?.kaggle?.status === "synced");
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs transition-opacity overflow-y-auto">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-5 sm:p-7 shadow-2xl border border-slate-100 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-slate-100 my-8">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800 gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                <ShieldCheck size={13} /> Official Platform Verification Hub
              </span>
            </div>
            <h2 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white break-words">
              Verify Your Coding IDs & Extract Live Stats
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 break-words">
              Follow the instructions below to verify your handles. SkillSync AI extracts verified problems, algorithmic topic depth, and contest ratings directly from official platform APIs.
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close modal"
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Platform Cards List */}
        <div className="mt-6 space-y-4">
          {PLATFORM_CONFIGS.map((p) => {
            const Icon = p.icon;
            const isVerified = getPlatformVerifiedStatus(p.id);
            const isVerifying = verifyingPlatform === p.id;
            const isExpanded = Boolean(expandedInstructions[p.id]);
            const liveStats = extractedStats[p.id];

            return (
              <div
                key={p.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition-all dark:border-slate-800 dark:bg-slate-850/60"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                      <Icon size={22} className={p.iconColor} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{p.name}</h3>
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                            isVerified
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
                              : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                          }`}
                        >
                          {isVerified ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                          {isVerified ? "Verified & Synced" : "Not Verified"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                        {p.urlPrefix}
                        {handles[p.id] || "username"}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Instructions Button */}
                  <button
                    type="button"
                    onClick={() => toggleInstructions(p.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 self-start sm:self-auto shrink-0"
                  >
                    <span>{isExpanded ? "Hide instructions" : "How to verify?"}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {/* Expandable Step-by-Step Instructions */}
                {isExpanded && (
                  <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 text-xs text-slate-700 dark:border-indigo-950 dark:bg-indigo-950/30 dark:text-slate-300 transition-all space-y-2">
                    <p className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                      <Sparkles size={13} /> Step-by-Step Verification Guide for {p.name}:
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 leading-relaxed">
                      {p.instructions.map((step, sIdx) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Handle Input & Verify Action Bar */}
                <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative flex-1 min-w-0">
                    <input
                      type="text"
                      placeholder={p.placeholder}
                      value={handles[p.id]}
                      onChange={(e) => setHandles((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-indigo-950"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVerify(p.id)}
                    disabled={isVerifying}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition shrink-0"
                  >
                    <RefreshCw size={14} className={isVerifying ? "animate-spin" : ""} />
                    {isVerifying ? "Verifying..." : isVerified ? "Re-Verify & Sync" : "Verify & Extract Live Stats"}
                  </button>
                </div>

                {/* Extracted Stats Preview Pill */}
                {liveStats && (
                  <div className="mt-3 rounded-xl bg-emerald-50/70 border border-emerald-100 p-3 text-xs dark:bg-emerald-950/30 dark:border-emerald-900/50">
                    <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 mb-1">
                      <CheckCircle2 size={13} /> Live Stats Extracted:
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                      {liveStats.solved !== undefined && (
                        <span className="rounded-md bg-white dark:bg-slate-800 px-2 py-0.5 border border-emerald-200 dark:border-emerald-800">
                          {liveStats.solved} Problems Solved
                        </span>
                      )}
                      {liveStats.algorithmic_depth_score !== undefined && (
                        <span className="rounded-md bg-white dark:bg-slate-800 px-2 py-0.5 border border-emerald-200 dark:border-emerald-800 text-purple-700 dark:text-purple-400">
                          Depth: {liveStats.algorithmic_depth_score}/100
                        </span>
                      )}
                      {liveStats.contributions !== undefined && (
                        <span className="rounded-md bg-white dark:bg-slate-800 px-2 py-0.5 border border-emerald-200 dark:border-emerald-800">
                          {liveStats.contributions} GitHub Contributions
                        </span>
                      )}
                      {liveStats.rating !== undefined && liveStats.rating > 0 && (
                        <span className="rounded-md bg-white dark:bg-slate-800 px-2 py-0.5 border border-emerald-200 dark:border-emerald-800">
                          Rating: {liveStats.rating} ({liveStats.title || "Rated"})
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center sm:text-left">
            Platform stats automatically refresh your Placement Readiness Score and Inter-College Ranking.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto rounded-xl bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
          >
            Done & Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlatformVerificationModal;
