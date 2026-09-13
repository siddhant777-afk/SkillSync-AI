import { useState } from "react";
import { Link2, Mail, MapPin, Pencil, Target, RefreshCw, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { FaGithub, FaKaggle } from "react-icons/fa";
import { SiCodechef, SiCodeforces, SiLeetcode } from "react-icons/si";

import PageHeader from "../../components/common/PageHeader";
import EditProfileModal from "../../components/modals/EditProfileModal";
import PlatformVerificationModal from "../../components/modals/PlatformVerificationModal";
import { useUser } from "../../hooks/useUser";

const Profile = () => {
  const { user, updateProfile, updateCodingProfiles, syncAccounts, isSyncing, refetch } = useUser();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);

  const handleSaveProfile = async (formData) => {
    await updateProfile({
      full_name: formData.name,
      college: formData.college,
      year: formData.year,
      branch: formData.branch,
      career_goal: formData.careerGoal,
    });
    await updateCodingProfiles({
      github_username: formData.github,
      leetcode_username: formData.leetcode,
      codeforces_username: formData.codeforces,
      codechef_username: formData.codechef,
      kaggle_username: formData.kaggle,
    });
  };

  const lcUser = user?.leetcode?.username || user?.connectedAccounts?.leetcode || "";
  const ghUser = user?.github?.username || user?.connectedAccounts?.github || "";
  const cfUser = user?.codeforces?.username || user?.connectedAccounts?.codeforces || "";
  const ccUser = user?.codechef?.username || user?.connectedAccounts?.codechef || "";
  const kgUser = user?.kaggle?.username || user?.connectedAccounts?.kaggle || "";

  const lcVerified = Boolean(lcUser && (user?.leetcode?.verified || user?.leetcode?.status === "synced"));
  const ghVerified = Boolean(ghUser && (user?.github?.verified || user?.github?.status === "synced"));
  const cfVerified = Boolean(cfUser && (user?.codeforces?.verified || user?.codeforces?.status === "synced"));
  const ccVerified = Boolean(ccUser && (user?.codechef?.verified || user?.codechef?.status === "synced"));
  const kgVerified = Boolean(kgUser && (user?.kaggle?.verified || user?.kaggle?.status === "synced"));

  const platforms = [
    {
      id: "leetcode",
      name: "LeetCode",
      handle: lcUser,
      verified: lcVerified,
      icon: SiLeetcode,
      iconColor: "text-amber-500",
      stats: lcUser ? `${user?.leetcode?.solved ?? 0} solved · ${user?.leetcode?.rank || "Unranked"}` : "0 activity recorded",
    },
    {
      id: "github",
      name: "GitHub",
      handle: ghUser,
      verified: ghVerified,
      icon: FaGithub,
      iconColor: "text-slate-900 dark:text-white",
      stats: ghUser ? `${user?.github?.contributions ?? 0} contribs · ${user?.github?.repositories ?? 0} repos` : "0 activity recorded",
    },
    {
      id: "codeforces",
      name: "Codeforces",
      handle: cfUser,
      verified: cfVerified,
      icon: SiCodeforces,
      iconColor: "text-blue-600 dark:text-blue-400",
      stats: cfUser ? `Rating: ${user?.codeforces?.rating ?? 0} (${user?.codeforces?.title || "Unrated"})` : "0 activity recorded",
    },
    {
      id: "codechef",
      name: "CodeChef",
      handle: ccUser,
      verified: ccVerified,
      icon: SiCodechef,
      iconColor: "text-amber-700 dark:text-amber-500",
      stats: ccUser ? `Rating: ${user?.codechef?.rating ?? 0} (${user?.codechef?.title || "Unrated"})` : "0 activity recorded",
    },
    {
      id: "kaggle",
      name: "Kaggle",
      handle: kgUser,
      verified: kgVerified,
      icon: FaKaggle,
      iconColor: "text-sky-500",
      stats: kgUser ? `${user?.kaggle?.notebooks ?? 0} notebooks` : "0 activity recorded",
    },
  ];

  const profilePct = user?.profileCompletion ?? 0;

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <PageHeader
        eyebrow="Student profile"
        title="Your Career Profile"
        description="Keep your professional identity, goals and verified coding platform handles up to date."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setVerificationModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-200 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-indigo-700 shadow-xs hover:bg-indigo-100 transition dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/60"
            >
              <ShieldCheck size={16} />
              Verify Coding IDs
            </button>
            <button
              type="button"
              onClick={syncAccounts}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"
            >
              <RefreshCw size={15} className={isSyncing ? "animate-spin" : ""} />
              {isSyncing ? "Syncing..." : "Sync Platforms"}
            </button>
            <button
              type="button"
              onClick={() => setEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
            >
              <Pencil size={15} />
              Edit Profile
            </button>
          </div>
        }
      />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] min-w-0">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white shadow-md shrink-0">
              {user?.initials || (user?.name ? user.name[0].toUpperCase() : "SS")}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white break-words">
                {user?.name || "Student"}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 break-words">
                {user?.year ? `${user.year} · ` : ""}{user?.branch || "Computer Science"}
              </p>

              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1 break-all">
                  <Mail size={14} className="shrink-0" />
                  {user?.email || "student@example.com"}
                </span>

                <span className="flex items-center gap-1">
                  <MapPin size={14} className="shrink-0" />
                  India
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 dark:border dark:border-slate-800">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">College / University</p>
              <p className="mt-1.5 font-semibold text-slate-800 dark:text-slate-200 break-words">
                {user?.college || "College not set yet"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 dark:border dark:border-slate-800">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Target Career Goal</p>
              <p className="mt-1.5 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 break-words">
                <Target size={16} className="text-indigo-600 shrink-0" />
                {user?.careerGoal || "Goal not selected yet"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Profile Completion
            </h2>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Computed from verified platforms, skills, and academic profile.
            </p>
          </div>

          <div className="my-6 flex items-center gap-5">
            <div className="relative h-20 w-20 shrink-0">
              <svg className="-rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * profilePct) / 100}
                />
              </svg>

              <span className="absolute inset-0 flex items-center justify-center text-lg font-extrabold text-slate-900 dark:text-white">
                {profilePct}%
              </span>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {profilePct >= 80
                ? "Your profile is well optimized! Live sync maintains your latest coding metrics automatically."
                : "Connect and verify your LeetCode and GitHub IDs in the Verification Hub to boost your score."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setVerificationModalOpen(true)}
            className="w-full rounded-xl bg-indigo-50 py-2.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition dark:bg-indigo-950/60 dark:text-indigo-400 dark:hover:bg-indigo-900/60"
          >
            Open Verification Hub →
          </button>
        </section>
      </div>

      {/* Connected Platforms Section */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link2 size={19} className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Connected Platforms & Verification Status
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setVerificationModalOpen(true)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 self-start sm:self-auto"
          >
            <ShieldCheck size={14} /> Manage & Verify IDs
          </button>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 min-w-0">
          {platforms.map(({ id, name, handle, verified, icon: Icon, iconColor, stats }) => (
            <div
              key={id}
              className="rounded-xl border border-slate-100 p-4 transition hover:border-indigo-100 dark:border-slate-800 dark:bg-slate-850/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon size={18} className={iconColor} />
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{name}</span>
                  </div>
                  {verified ? (
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" title="Verified Handle" />
                  ) : (
                    <AlertCircle size={14} className="text-slate-400 dark:text-slate-500 shrink-0" title="Not Verified" />
                  )}
                </div>

                <p className="mt-3 text-sm font-bold text-slate-800 dark:text-white truncate">
                  {handle ? `@${handle}` : "Not connected"}
                </p>

                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 truncate">{stats}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span
                  className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                    verified
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
                      : handle
                      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800"
                      : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                  }`}
                >
                  {verified ? "Verified" : handle ? "Unverified" : "Not Added"}
                </span>

                <button
                  type="button"
                  onClick={() => setVerificationModalOpen(true)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  {verified ? "Sync" : "Verify"} →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Profile Edit Modal */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={user}
        onSave={handleSaveProfile}
      />

      {/* Platform Verification Hub Modal */}
      <PlatformVerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        user={user}
        onSyncSuccess={() => {
          if (refetch) refetch();
        }}
      />
    </div>
  );
};

export default Profile;