import { useState } from "react";
import { Link2, Mail, MapPin, Pencil, Target, RefreshCw } from "lucide-react";
import { FaGithub, FaKaggle } from "react-icons/fa";
import { SiCodechef, SiCodeforces, SiLeetcode } from "react-icons/si";

import PageHeader from "../../components/common/PageHeader";
import EditProfileModal from "../../components/modals/EditProfileModal";
import { useUser } from "../../hooks/useUser";

const Profile = () => {
  const { user, updateProfile, updateCodingProfiles, syncAccounts, isSyncing } = useUser();
  const [editModalOpen, setEditModalOpen] = useState(false);

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

  const platforms = [
    {
      name: "GitHub",
      handle: user?.github?.username || "",
      icon: FaGithub,
      iconColor: "text-slate-900",
      stats: `${user?.github?.contributions ?? 620} contribs · ${user?.github?.repositories ?? 18} repos`,
    },
    {
      name: "LeetCode",
      handle: user?.leetcode?.username || "",
      icon: SiLeetcode,
      iconColor: "text-amber-500",
      stats: `${user?.leetcode?.solved ?? 420} solved · ${user?.leetcode?.rank || "Top 18%"}`,
    },
    {
      name: "Codeforces",
      handle: user?.codeforces?.username || "",
      icon: SiCodeforces,
      iconColor: "text-blue-600",
      stats: `Rating: ${user?.codeforces?.rating ?? 1580} (${user?.codeforces?.title || "Pupil"})`,
    },
    {
      name: "CodeChef",
      handle: user?.codechef?.username || "",
      icon: SiCodechef,
      iconColor: "text-amber-700",
      stats: `Rating: ${user?.codechef?.rating ?? 1760} (${user?.codechef?.title || "3★"})`,
    },
    {
      name: "Kaggle",
      handle: user?.kaggle?.username || "",
      icon: FaKaggle,
      iconColor: "text-sky-600",
      stats: `${user?.kaggle?.notebooks ?? 4} notebooks`,
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Student profile"
        title="Your Career Profile"
        description="Keep your professional identity, goals and connected platforms up to date."
        action={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={syncAccounts}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
              {isSyncing ? "Syncing..." : "Sync Platforms"}
            </button>
            <button
              type="button"
              onClick={() => setEditModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              <Pencil size={16} />
              Edit Profile
            </button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white shadow-md">
              {user?.initials || "SS"}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {user?.name || "Student"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {user?.year || "3rd Year"} · {user?.branch || "AIML"}
              </p>

              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Mail size={14} />
                  {user?.email || "student@example.com"}
                </span>

                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  India
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">College</p>
              <p className="mt-2 font-semibold text-slate-800">
                {user?.college || "GL Bajaj Institute of Technology and Management"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">Target Role</p>
              <p className="mt-2 flex items-center gap-2 font-semibold text-slate-800">
                <Target size={16} className="text-indigo-600" />
                {user?.careerGoal || "AI / ML Engineer"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Profile Completion
          </h2>

          <div className="mt-6 flex items-center gap-4">
            <div className="relative h-20 w-20">
              <svg className="-rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="10"
                />

                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  strokeDashoffset={
                    251.2 - (251.2 * (user?.profileCompletion || 90)) / 100
                  }
                />
              </svg>

              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                {user?.profileCompletion || 90}%
              </span>
            </div>

            <p className="text-sm leading-6 text-slate-500">
              Your profile is optimized. Live sync maintains your latest coding metrics automatically.
            </p>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 size={19} className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              Connected Platforms
            </h2>
          </div>
          <span className="text-xs text-slate-400">Syncs daily & on-demand</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {platforms.map(({ name, handle, icon: Icon, iconColor, stats }) => (
            <div key={name} className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center gap-2">
                <Icon size={18} className={iconColor} />
                <span className="font-semibold text-slate-800">{name}</span>
              </div>

              <p className="mt-3 text-sm font-medium text-slate-700">
                {handle ? `@${handle}` : "Not connected"}
              </p>

              <p className="mt-1 text-[11px] text-slate-400">{stats}</p>

              <span
                className={`mt-3 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  handle ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                }`}
              >
                {handle ? "Connected" : "Disconnected"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={user}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default Profile;