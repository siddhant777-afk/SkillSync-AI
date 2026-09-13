import { useState, useEffect } from "react";
import { Bell, Lock, Palette, Save, UserRound, CheckCircle2, Sun, Moon, Monitor } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { useUser } from "../../hooks/useUser";
import { useTheme } from "../../hooks/useTheme";
import toast from "react-hot-toast";

const Settings = () => {
  const { user, updateProfile } = useUser();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("Profile");
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [careerGoal, setCareerGoal] = useState(user?.careerGoal || "Software Engineer");
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.name) setDisplayName(user.name);
    if (user?.careerGoal) setCareerGoal(user.careerGoal);
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (updateProfile) {
        await updateProfile({
          full_name: displayName,
          career_goal: careerGoal,
        });
      }
      toast.success("Preferences updated successfully!");
    } catch {
      toast.error("Failed to save preferences.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    ["Profile", UserRound],
    ["Notifications", Bell],
    ["Appearance", Palette],
    ["Security", Lock],
  ];

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <PageHeader
        eyebrow="Account"
        title="Settings & Preferences"
        description="Control your professional profile preferences, notifications, theme appearance, and security parameters."
      />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] min-w-0">
        <section className="h-fit rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 sm:p-4 shadow-xs flex flex-row overflow-x-auto lg:flex-col gap-1 min-w-0">
          {tabs.map(([label, Icon]) => (
            <button
              key={label}
              onClick={() => setActiveTab(label)}
              className={`flex items-center gap-2 sm:gap-3 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm font-semibold transition whitespace-nowrap shrink-0 lg:shrink lg:w-full ${
                activeTab === label
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <Icon size={16} className="sm:w-[18px] sm:h-[18px]" /> {label}
            </button>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs min-w-0">
          {activeTab === "Profile" && (
            <div className="space-y-4 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profile Preferences</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Manage how your name and target role appear to recruiters.</p>

              <div className="pt-2 space-y-4">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Display Name</span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Career Goal / Target Role</span>
                  <select
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  >
                    <option value="AI / ML Engineer">AI / ML Engineer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Cloud / DevOps Engineer">Cloud / DevOps Engineer</option>
                    <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Mobile App Developer">Mobile App Developer</option>
                  </select>
                </label>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Weekly Placement Digest</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Receive algorithmic skill gaps & contest performance via email.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={weeklyDigest}
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                    className="h-5 w-5 rounded accent-indigo-600"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={loading}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 dark:bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 transition"
              >
                <Save size={16} />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

          {activeTab === "Notifications" && (
            <div className="space-y-4 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notification Channels</h2>
              <div className="space-y-3 pt-2">
                {[
                  ["Contest Reminders", "Alerts for LeetCode, Codeforces and CodeChef rounds"],
                  ["Skill Gap Updates", "Notifications when new role requirements are benchmarked"],
                  ["Recruiter Matches", "When a recruiter filters or views your candidate profile"],
                ].map(([title, desc]) => (
                  <label key={title} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5 accent-indigo-600" />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Appearance" && (
            <div className="space-y-4 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Theme & Display Settings</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose how SkillSync AI looks across your devices. Theme preference is automatically saved.
              </p>

              <div className="grid gap-3 pt-2 sm:grid-cols-3">
                {[
                  { id: "light", label: "Light Mode", icon: Sun, desc: "Clean bright interface for daylight coding." },
                  { id: "dark", label: "Dark Mode", icon: Moon, desc: "Ultra low-glare deep theme for long sessions." },
                  { id: "system", label: "System Auto", icon: Monitor, desc: "Syncs automatically with OS settings." },
                ].map(({ id, label, icon: Icon, desc }) => {
                  const isActive = theme === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTheme(id)}
                      className={`flex flex-col items-start p-4 rounded-xl border text-left transition ${
                        isActive
                          ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Icon size={20} className={isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"} />
                        {isActive && <CheckCircle2 size={16} className="text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      <span className="mt-3 text-sm font-bold text-slate-900 dark:text-white">{label}</span>
                      <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">{desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "Security" && (
            <div className="space-y-4 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Account Security</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Authentication is secured via JWT bearer tokens and PostgreSQL bcrypt hashes.</p>
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-4 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Your session is authenticated, encrypted, and active.</span>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Settings;
