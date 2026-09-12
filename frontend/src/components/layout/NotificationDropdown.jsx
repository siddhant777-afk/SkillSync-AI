import { useEffect, useState, useRef } from "react";
import {
  Bell,
  CheckCircle2,
  ExternalLink,
  Briefcase,
  Sparkles,
  Code2,
  Trash2,
  RefreshCw,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import notificationService from "../../services/notificationService";
import toast from "react-hot-toast";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Keep state clean
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleUpdate = () => fetchNotifications();
    window.addEventListener("skillsync:update", handleUpdate);
    return () => window.removeEventListener("skillsync:update", handleUpdate);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error("Could not mark as read.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Failed to mark all as read.");
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      const target = notifications.find((n) => n.id === id);
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification dismissed.");
    } catch {
      toast.error("Could not dismiss notification.");
    }
  };

  const handleSyncJobs = async () => {
    setSyncing(true);
    const toastId = toast.loading("Scanning verified openings matching your skills...");
    try {
      const res = await notificationService.syncJobs();
      await fetchNotifications();
      toast.success(res.message || "Live job matching complete!", { id: toastId });
    } catch {
      toast.error("Could not sync live job postings.", { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "jobs") return n.type === "job_alert";
    if (activeFilter === "milestones") return n.type !== "job_alert";
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-extrabold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-[340px] sm:w-[420px] max-h-[580px] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-all">
          {/* Header */}
          <div className="border-b border-slate-100 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-850/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                {unreadCount}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Notifications & Live Alerts
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Verified hiring matches & momentum updates
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleSyncJobs}
                disabled={syncing}
                title="Sync live job openings"
                className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
              </button>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-white transition"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
            {[
              ["all", "All"],
              ["jobs", "Live Job Matches"],
              ["milestones", "Milestones"],
            ].map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setActiveFilter(k)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  activeFilter === k
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Notifications Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2 space-y-1.5">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 mb-3">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  You are all caught up!
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[240px]">
                  When new jobs match your skills or platform milestones are reached, alerts will appear here.
                </p>
                <button
                  type="button"
                  onClick={handleSyncJobs}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
                >
                  <RefreshCw size={12} /> Scan Live Openings
                </button>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const isJob = n.type === "job_alert";
                return (
                  <div
                    key={n.id}
                    className={`rounded-xl p-3.5 transition border ${
                      !n.isRead
                        ? "bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-100/80 dark:border-indigo-900/50"
                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850/60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          isJob
                            ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                            : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {isJob ? <Briefcase size={16} /> : <Sparkles size={16} />}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                              isJob
                                ? "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300"
                                : "bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300"
                            }`}
                          >
                            {isJob ? n.company || "Hiring Match" : "Milestone"}
                          </span>

                          <div className="flex items-center gap-1 shrink-0">
                            {!n.isRead && (
                              <button
                                type="button"
                                onClick={(e) => handleMarkAsRead(n.id, e)}
                                title="Mark as read"
                                className="rounded-md p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                              >
                                <CheckCircle2 size={13} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleDelete(n.id, e)}
                              title="Dismiss"
                              className="rounded-md p-1 text-slate-400 hover:text-rose-500 transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight break-words">
                          {n.title}
                        </h4>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words">
                          {n.message}
                        </p>

                        {/* Tags / Matched Skills */}
                        {n.tags && n.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {n.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Action Link Button */}
                        {n.link && (
                          <div className="pt-2">
                            {n.link.startsWith("http") ? (
                              <a
                                href={n.link}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => handleMarkAsRead(n.id, e)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition"
                              >
                                <span>{n.linkLabel || "Apply on Company Site"}</span>
                                <ExternalLink size={12} />
                              </a>
                            ) : (
                              <Link
                                to={n.link}
                                onClick={(e) => {
                                  handleMarkAsRead(n.id, e);
                                  setIsOpen(false);
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 transition"
                              >
                                <span>{n.linkLabel || "View Details"}</span> →
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer View All Jobs Link */}
          <div className="border-t border-slate-100 dark:border-slate-800 p-2.5 bg-slate-50/70 dark:bg-slate-850/70 text-center">
            <Link
              to="/jobs"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <Briefcase size={13} />
              <span>Explore All Live Industry Openings & Benchmarks →</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
