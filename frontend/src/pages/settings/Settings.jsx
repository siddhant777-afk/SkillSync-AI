import { useState } from "react";
import { Bell, Lock, Palette, Save, UserRound, CheckCircle2 } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { useUser } from "../../hooks/useUser";
import toast from "react-hot-toast";

const Settings = () => {
  const { user, updateProfile } = useUser();
  const [activeTab, setActiveTab] = useState("Profile");
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [careerGoal, setCareerGoal] = useState(user?.careerGoal || "AI / ML Engineer");
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.name) setDisplayName(user.name);
    if (user?.careerGoal) setCareerGoal(user.careerGoal);
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({
        full_name: displayName,
        career_goal: careerGoal,
      });
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
    <div>
      <PageHeader
        eyebrow="Account"
        title="Settings & Preferences"
        description="Control your professional profile preferences, notifications and security parameters."
      />

      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <section className="h-fit rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-1">
          {tabs.map(([label, Icon]) => (
            <button
              key={label}
              onClick={() => setActiveTab(label)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                activeTab === label
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          {activeTab === "Profile" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Profile Preferences</h2>
              <p className="text-xs text-slate-400">Manage how your name and target role appear to recruiters.</p>

              <div className="pt-2 space-y-4">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-600">Display Name</span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-slate-600">Career Goal / Target Role</span>
                  <select
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option>AI / ML Engineer</option>
                    <option>Backend Developer</option>
                    <option>Data Scientist</option>
                    <option>Full Stack Developer</option>
                    <option>Cloud / DevOps Engineer</option>
                  </select>
                </label>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Weekly Placement Digest</p>
                    <p className="text-xs text-slate-400">Receive algorithmic skill gaps & contest performance via email.</p>
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
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save size={16} />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

          {activeTab === "Notifications" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Notification Channels</h2>
              <div className="space-y-3 pt-2">
                {[
                  ["Contest Reminders", "Alerts for LeetCode, Codeforces and CodeChef rounds"],
                  ["Skill Gap Updates", "Notifications when new role requirements are benchmarked"],
                  ["Recruiter Matches", "When a recruiter filters or views your candidate profile"],
                ].map(([title, desc]) => (
                  <label key={title} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{title}</p>
                      <p className="text-xs text-slate-400">{desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5 accent-indigo-600" />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Appearance" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Theme & Display</h2>
              <p className="text-xs text-slate-500">SkillSync AI uses the high-contrast modern indigo theme.</p>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
                  ✓
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Light / High Contrast (Active)</p>
                  <p className="text-xs text-slate-400">Optimized for dashboard analytics and code reviews.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Security" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Account Security</h2>
              <p className="text-xs text-slate-400">Authentication is secured via JWT token authorization and PostgreSQL bcrypt hashes.</p>
              <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Your connection is authenticated and active.</span>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Settings;
