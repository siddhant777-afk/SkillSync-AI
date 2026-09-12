import { CalendarDays, Clock3 } from "lucide-react";
import toast from "react-hot-toast";

const UpcomingEventsCard = ({ events = [] }) => {
  const safeEvents =
    Array.isArray(events) && events.length > 0
      ? events
      : [
          { title: "LeetCode Weekly Contest 395", date: "25 May 2024", time: "08:00 PM" },
          { title: "Codeforces Round #930", date: "26 May 2024", time: "03:35 PM" },
          { title: "CodeChef Starters 133", date: "27 May 2024", time: "11:00 AM" },
        ];

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Upcoming Contests & Events</h2>
          <p className="mt-1 text-sm text-slate-500">Stay consistent with your competitive programming routine.</p>
        </div>
        <CalendarDays size={21} className="text-indigo-600" />
      </div>

      <div className="space-y-3">
        {safeEvents.map((event, idx) => (
          <div key={event.title || idx} className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <CalendarDays size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-800">{event.title}</p>
              <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
                <span>{event.date}</span>
                <span className="flex items-center gap-1"><Clock3 size={13} /> {event.time}</span>
              </div>
            </div>
            <button
              onClick={() => toast.success(`Registered for ${event.title}! Calendar invite saved.`)}
              className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
            >
              Register
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UpcomingEventsCard;
