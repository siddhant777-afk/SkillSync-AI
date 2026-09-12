import { Award, CalendarDays, Trophy } from "lucide-react";
import { SiLeetcode } from "react-icons/si";
import PageHeader from "../../components/common/PageHeader";
import { useUser } from "../../hooks/useUser";

const Achievements = () => {
  const { user, isLoading } = useUser();

  const achievements = user?.achievements?.length
    ? user.achievements
    : [
        {
          title: "500 LeetCode Problems Solved",
          date: "20 May 2024",
          description: "Consistent algorithmic practice and data structure mastery milestone.",
          icon: "leetcode",
        },
        {
          title: "100 Days Coding Streak",
          date: "18 May 2024",
          description: "Maintained a continuous daily competitive programming problem-solving streak.",
          icon: "streak",
        },
        {
          title: "Top 10% LeetCode Weekly Contest",
          date: "12 May 2024",
          description: "Achieved top decile finish in algorithmic contest under timed competition conditions.",
          icon: "contest",
        },
      ];

  const solved = user?.leetcode?.solved ?? 420;

  return (
    <div>
      <PageHeader
        eyebrow="Proof of progress"
        title="Achievements"
        description="A verified timeline of milestones from coding platforms, competitive rounds, projects and professional growth."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <Trophy className="text-amber-500" size={21} />
          <p className="mt-4 text-2xl font-bold">{achievements.length}</p>
          <p className="text-sm text-slate-400">Verified Milestones</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <SiLeetcode className="text-orange-500" size={21} />
          <p className="mt-4 text-2xl font-bold">{solved}</p>
          <p className="text-sm text-slate-400">Problems Solved</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <Award className="text-indigo-600" size={21} />
          <p className="mt-4 text-2xl font-bold">100</p>
          <p className="text-sm text-slate-400">Day Coding Streak</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4">Milestone Timeline</h2>
        <div className="space-y-4">
          {achievements.map((achievement, idx) => (
            <div key={achievement.title || idx} className="flex gap-4 rounded-xl border border-slate-100 p-5 transition hover:border-indigo-100 hover:shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Award size={20} />
              </div>
              <div className="flex-1">
                <div className="flex flex-col justify-between gap-2 sm:flex-row">
                  <h3 className="font-semibold text-slate-800">{achievement.title}</h3>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <CalendarDays size={13} /> {achievement.date}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{achievement.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Achievements;
