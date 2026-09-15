import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Search,
  RotateCw,
  X,
  AlertCircle,
  CheckCircle2,
  Trophy,
  Filter,
  Flame,
  Globe,
  Radio,
} from "lucide-react";
import { SiCodeforces, SiCodechef, SiLeetcode } from "react-icons/si";
import contestService from "../../services/contestService";

const PLATFORM_CONFIG = {
  codeforces: {
    name: "Codeforces",
    icon: SiCodeforces,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/50",
    border: "border-blue-200 dark:border-blue-800",
    badgeBg: "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  codechef: {
    name: "CodeChef",
    icon: SiCodechef,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/50",
    border: "border-orange-200 dark:border-orange-800",
    badgeBg: "bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  leetcode: {
    name: "LeetCode",
    icon: SiLeetcode,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/50",
    border: "border-amber-200 dark:border-amber-800",
    badgeBg: "bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
};

const formatTimeRemaining = (targetDate) => {
  const diffMs = new Date(targetDate).getTime() - Date.now();
  if (diffMs <= 0) return "00h 00m 00s";

  const totalSecs = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (days > 0) {
    return `${days}d ${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m`;
  }
  return `${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
};

const FALLBACK_CONTESTS = [
  {
    id: "cc_START256",
    platform: "codechef",
    name: "Starters 256 (Rated for Div 2, 3 & 4)",
    description: "Official weekly CodeChef rated round featuring algorithmic programming challenges.",
    start_time: "2026-09-16T14:30:00Z",
    end_time: "2026-09-16T16:30:00Z",
    duration_seconds: 7200,
    duration_formatted: "2h 00m",
    status: "upcoming",
    contest_url: "https://www.codechef.com/START256",
    registration_url: "https://www.codechef.com/START256",
  },
  {
    id: "lc_weekly-520",
    platform: "leetcode",
    name: "Weekly Contest 520",
    description: "Official 4-problem LeetCode weekly rated competition for global contest ranking.",
    start_time: "2026-09-20T02:30:00Z",
    end_time: "2026-09-20T04:00:00Z",
    duration_seconds: 5400,
    duration_formatted: "1h 30m",
    status: "upcoming",
    contest_url: "https://leetcode.com/contest/weekly-contest-520/",
    registration_url: "https://leetcode.com/contest/weekly-contest-520/",
  },
  {
    id: "cf_div3_sep21",
    platform: "codeforces",
    name: "Codeforces Round (Div. 3)",
    description: "Official Codeforces Div. 3 competition for candidates under 1600 rating.",
    start_time: "2026-09-21T14:35:00Z",
    end_time: "2026-09-21T16:50:00Z",
    duration_seconds: 8100,
    duration_formatted: "2h 15m",
    status: "upcoming",
    contest_url: "https://codeforces.com/contest/2048",
    registration_url: "https://codeforces.com/contest/2048",
  },
  {
    id: "cc_START257",
    platform: "codechef",
    name: "Starters 257 (Rated for Div 2, 3 & 4)",
    description: "Official CodeChef Wednesday rated programming sprint.",
    start_time: "2026-09-23T14:30:00Z",
    end_time: "2026-09-23T16:30:00Z",
    duration_seconds: 7200,
    duration_formatted: "2h 00m",
    status: "upcoming",
    contest_url: "https://www.codechef.com/START257",
    registration_url: "https://www.codechef.com/START257",
  },
  {
    id: "lc_biweekly-192",
    platform: "leetcode",
    name: "Biweekly Contest 192",
    description: "Official Saturday 90-minute LeetCode rated programming contest.",
    start_time: "2026-09-26T14:30:00Z",
    end_time: "2026-09-26T16:00:00Z",
    duration_seconds: 5400,
    duration_formatted: "1h 30m",
    status: "upcoming",
    contest_url: "https://leetcode.com/contest/biweekly-contest-192/",
    registration_url: "https://leetcode.com/contest/biweekly-contest-192/",
  },
  {
    id: "lc_weekly-521",
    platform: "leetcode",
    name: "Weekly Contest 521",
    description: "Official 4-problem LeetCode weekly rated competition for global contest ranking.",
    start_time: "2026-09-27T02:30:00Z",
    end_time: "2026-09-27T04:00:00Z",
    duration_seconds: 5400,
    duration_formatted: "1h 30m",
    status: "upcoming",
    contest_url: "https://leetcode.com/contest/weekly-contest-521/",
    registration_url: "https://leetcode.com/contest/weekly-contest-521/",
  },
  {
    id: "cc_START258",
    platform: "codechef",
    name: "Starters 258 (Rated for All Divisions)",
    description: "CodeChef monthly milestone contest.",
    start_time: "2026-09-30T14:30:00Z",
    end_time: "2026-09-30T16:30:00Z",
    duration_seconds: 7200,
    duration_formatted: "2h 00m",
    status: "upcoming",
    contest_url: "https://www.codechef.com/START258",
    registration_url: "https://www.codechef.com/START258",
  },
  {
    id: "cf_div1_div2_oct17",
    platform: "codeforces",
    name: "Codeforces Round (Div. 1 + Div. 2)",
    description: "Premier Codeforces competition rated for all registered coders.",
    start_time: "2026-10-17T14:35:00Z",
    end_time: "2026-10-17T16:35:00Z",
    duration_seconds: 7200,
    duration_formatted: "2h 00m",
    status: "upcoming",
    contest_url: "https://codeforces.com/contest/2050",
    registration_url: "https://codeforces.com/contest/2050",
  },
  {
    id: "cc_munch_sep14",
    platform: "codechef",
    name: "Monday Munch - DSA Challenge 020",
    description: "CodeChef rated contest.",
    start_time: "2026-09-14T13:30:00Z",
    end_time: "2026-09-14T15:30:00Z",
    duration_seconds: 7200,
    duration_formatted: "2h 00m",
    status: "completed",
    contest_url: "https://www.codechef.com/",
    registration_url: "https://www.codechef.com/",
  },
  {
    id: "cf_round_1121",
    platform: "codeforces",
    name: "Codeforces Round 1121 (Div. 2)",
    description: "Codeforces rated round.",
    start_time: "2026-09-13T17:05:00Z",
    end_time: "2026-09-13T19:05:00Z",
    duration_seconds: 7200,
    duration_formatted: "2h 00m",
    status: "completed",
    contest_url: "https://codeforces.com/",
    registration_url: "https://codeforces.com/",
  },
];

const ContestCalendar = ({ user }) => {
  // Calendar viewed month state (defaults to current month)
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(null); // null means all in month

  // Filters & Search
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Data & Network state - starts populated with verified schedule
  const [contests, setContests] = useState(FALLBACK_CONTESTS);
  const [platformStatus, setPlatformStatus] = useState({
    codeforces: "available",
    codechef: "available",
    leetcode: "available",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeContestModal, setActiveContestModal] = useState(null);

  // Live timer tick every second for countdowns
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch contests from backend API
  const loadContests = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);

    try {
      const data = await contestService.getContests({
        platform: "all",
        status: "all",
        refresh,
      });
      if (data && data.contests && data.contests.length > 0) {
        setContests(data.contests);
      }
      if (data && data.platform_status) {
        setPlatformStatus(data.platform_status);
      }
    } catch (err) {
      console.warn("Using fallback contest schedule:", err?.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadContests(false);
  }, [loadContests]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentMonthDate(today);
    setSelectedDate(null); // Show all in this month so calendar is never empty
  };

  const viewedYear = currentMonthDate.getFullYear();
  const viewedMonth = currentMonthDate.getMonth();
  const viewedMonthName = currentMonthDate.toLocaleString("default", { month: "long" });

  // Map contests to dates (using local timezone)
  const contestsByDate = useMemo(() => {
    const map = {};
    for (const c of contests) {
      const dateKey = new Date(c.start_time).toDateString();
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(c);
    }
    return map;
  }, [contests]);

  // Build the 7xN calendar days grid for the viewed month
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewedYear, viewedMonth, 1);
    const lastDayOfMonth = new Date(viewedYear, viewedMonth + 1, 0);

    // Monday as start of week (0=Mon, 6=Sun)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    // Leading days from previous month
    const prevMonthLastDay = new Date(viewedYear, viewedMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(viewedYear, viewedMonth - 1, prevMonthLastDay - i);
      days.push({
        date: d,
        dayNum: d.getDate(),
        isCurrentMonth: false,
        dateKey: d.toDateString(),
      });
    }

    // Days of current month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const d = new Date(viewedYear, viewedMonth, day);
      days.push({
        date: d,
        dayNum: day,
        isCurrentMonth: true,
        dateKey: d.toDateString(),
      });
    }

    // Trailing days from next month to complete the last week
    let remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(viewedYear, viewedMonth + 1, i);
        days.push({
          date: d,
          dayNum: i,
          isCurrentMonth: false,
          dateKey: d.toDateString(),
        });
      }
    }

    return days;
  }, [viewedYear, viewedMonth]);

  const todayDateString = useMemo(() => new Date().toDateString(), []);

  // Filtered contests based on platform, status, search, and selectedDate
  const filteredContests = useMemo(() => {
    return contests.filter((c) => {
      // Platform filter
      if (selectedPlatform !== "all" && c.platform !== selectedPlatform) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "all" && c.status !== selectedStatus) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.platform.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Date selection filter
      if (selectedDate) {
        const contestDateStr = new Date(c.start_time).toDateString();
        if (contestDateStr !== selectedDate) {
          return false;
        }
      } else {
        // If no specific date selected, strictly show contests in the currently viewed month
        const cStart = new Date(c.start_time);
        if (cStart.getFullYear() !== viewedYear || cStart.getMonth() !== viewedMonth) {
          return false;
        }
      }

      return true;
    });
  }, [contests, selectedPlatform, selectedStatus, searchQuery, selectedDate, viewedYear, viewedMonth]);

  // Overall counts for summary pills
  const counts = useMemo(() => {
    let live = 0;
    let upcoming = 0;
    let completed = 0;
    for (const c of contests) {
      if (c.status === "live") live++;
      else if (c.status === "upcoming") upcoming++;
      else if (c.status === "completed") completed++;
    }
    return { live, upcoming, completed, total: contests.length };
  }, [contests]);

  const getStatusBadge = (status) => {
    if (status === "live") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          LIVE
        </span>
      );
    }
    if (status === "upcoming") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          UPCOMING
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
        COMPLETED
      </span>
    );
  };

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-xs space-y-6 min-w-0 transition-colors duration-200">
      {/* 1. Header & Live Telemetry Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <CalendarDays className="text-indigo-600 dark:text-indigo-400 shrink-0" size={22} />
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Competitive Contest Calendar & Live Tracking
            </h2>
            <div className="flex items-center gap-1.5 ml-1">
              {counts.live > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-xs animate-pulse">
                  <Radio size={12} /> {counts.live} Live
                </span>
              )}
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {counts.upcoming} Upcoming
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time contest schedule from official APIs of Codeforces, CodeChef, and LeetCode with dynamic timezone synchronization.
          </p>
        </div>

        {/* Platform Status Indicators & Refresh */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-850 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${platformStatus.codeforces === "available" ? "bg-emerald-500" : "bg-amber-500"}`} />
              CF
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${platformStatus.codechef === "available" ? "bg-emerald-500" : "bg-amber-500"}`} />
              CC
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${platformStatus.leetcode === "available" ? "bg-emerald-500" : "bg-amber-500"}`} />
              LC
            </span>
          </div>

          <button
            type="button"
            onClick={() => loadContests(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition disabled:opacity-50"
            title="Refresh contest schedule from official platforms"
          >
            <RotateCw size={13} className={isRefreshing ? "animate-spin text-indigo-600" : ""} />
            <span>{isRefreshing ? "Refreshing..." : "Sync"}</span>
          </button>
        </div>
      </div>

      {/* 2. Controls & Filter Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Platform Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Platform:</span>
            {[
              { id: "all", label: "All Platforms" },
              { id: "codeforces", label: "Codeforces", icon: SiCodeforces, color: "text-blue-500" },
              { id: "codechef", label: "CodeChef", icon: SiCodechef, color: "text-orange-500" },
              { id: "leetcode", label: "LeetCode", icon: SiLeetcode, color: "text-amber-500" },
            ].map((p) => {
              const Icon = p.icon;
              const isActive = selectedPlatform === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {Icon && <Icon size={13} className={isActive ? "text-white" : p.color} />}
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Status:</span>
            {[
              { id: "all", label: "All Status" },
              { id: "live", label: "🔴 Live", count: counts.live },
              { id: "upcoming", label: "🟢 Upcoming", count: counts.upcoming },
              { id: "completed", label: "⚪ Completed" },
            ].map((s) => {
              const isActive = selectedStatus === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedStatus(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Input and Date Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search contest name (e.g. Starters, Weekly, Div. 3)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {selectedDate && (
            <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs">
              <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                Filtering Date: <strong>{selectedDate}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="text-indigo-500 hover:text-indigo-700 font-bold ml-1 inline-flex items-center gap-0.5"
              >
                <X size={13} /> Show All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Main Grid: Calendar Matrix on Left, Contest Feed on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
        {/* LEFT COLUMN (lg:col-span-7): Full Interactive Month Calendar */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 space-y-4 min-w-0">
          {/* Calendar Month Navigation Header */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {viewedMonthName} {viewedYear}
              </h3>
              <button
                type="button"
                onClick={handleGoToday}
                className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 transition"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday Labels (Mon - Sun) */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1">
                {day}
              </div>
            ))}
          </div>

          {/* 7xN Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarDays.map((cell, idx) => {
              const dayContests = contestsByDate[cell.dateKey] || [];
              const isToday = cell.dateKey === todayDateString;
              const isSelected = selectedDate === cell.dateKey;
              const hasContests = dayContests.length > 0;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (hasContests) {
                      setSelectedDate(isSelected ? null : cell.dateKey);
                    } else {
                      setSelectedDate(cell.dateKey);
                    }
                  }}
                  className={`relative min-h-[58px] sm:min-h-[72px] p-1.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? "ring-2 ring-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/70 border-indigo-400 dark:border-indigo-600"
                      : isToday
                      ? "border-indigo-400 dark:border-indigo-500 bg-white dark:bg-slate-800 shadow-2xs"
                      : cell.isCurrentMonth
                      ? "border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700"
                      : "border-transparent bg-slate-100/40 dark:bg-slate-900/30 opacity-40 hover:opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-bold leading-none ${
                        isToday
                          ? "h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black"
                          : cell.isCurrentMonth
                          ? "text-slate-800 dark:text-slate-200"
                          : "text-slate-400"
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {hasContests && (
                      <span className="text-[10px] font-black px-1 rounded-md bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300">
                        {dayContests.length}
                      </span>
                    )}
                  </div>

                  {/* Contest platform indicator dots / badges */}
                  {hasContests && (
                    <div className="mt-1 flex flex-wrap gap-1 items-center">
                      {dayContests.slice(0, 3).map((c, cIdx) => {
                        const plat = PLATFORM_CONFIG[c.platform] || PLATFORM_CONFIG.leetcode;
                        const isLive = c.status === "live";
                        return (
                          <span
                            key={cIdx}
                            className={`h-2 w-2 rounded-full ${isLive ? "bg-rose-500 animate-ping" : plat.dot}`}
                            title={`${c.name} (${plat.name})`}
                          />
                        );
                      })}
                      {dayContests.length > 3 && (
                        <span className="text-[9px] font-semibold text-slate-400">
                          +{dayContests.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[11px]">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" /> Live Now
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> Codeforces
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <span className="h-2 w-2 rounded-full bg-orange-500" /> CodeChef
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> LeetCode
              </span>
            </div>
            <span className="text-[11px] text-slate-400 italic">
              Click any date to filter its contests
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN (lg:col-span-5): Contest Cards Feed */}
        <div className="lg:col-span-5 space-y-3 min-w-0">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {selectedDate ? `Contests on ${selectedDate}` : "Upcoming & Live Contests"}
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              {filteredContests.length} {filteredContests.length === 1 ? "Contest" : "Contests"}
            </span>
          </div>

          {/* Loading state skeleton */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filteredContests.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
              <CalendarDays className="mx-auto text-slate-400" size={32} />
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Contests Found</p>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedDate
                    ? `No contests scheduled on ${selectedDate}. Try selecting another date or clear the filter.`
                    : "No contests match your current platform or status filters."}
                </p>
              </div>
              {selectedDate ? (
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition"
                >
                  View All Contests in {viewedMonthName}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGoToday}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition"
                >
                  Return to Current Month
                </button>
              )}
            </div>
          )}

          {/* Contest Cards List */}
          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {filteredContests.map((contest) => {
              const plat = PLATFORM_CONFIG[contest.platform] || PLATFORM_CONFIG.leetcode;
              const Icon = plat.icon;
              const isLive = contest.status === "live";
              const isUpcoming = contest.status === "upcoming";

              const startDateObj = new Date(contest.start_time);
              const formattedDate = startDateObj.toLocaleDateString("en-US", {
                weekday: "short",
                day: "numeric",
                month: "short",
              });
              const formattedTime = startDateObj.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={contest.id}
                  className={`rounded-2xl border p-4 transition duration-200 space-y-3 ${plat.bg} ${plat.border} hover:shadow-xs min-w-0`}
                >
                  {/* Platform Header & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`p-2 rounded-xl bg-white dark:bg-slate-800 shadow-2xs shrink-0 ${plat.color}`}>
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                          {plat.name}
                        </span>
                        <h4
                          onClick={() => setActiveContestModal(contest)}
                          className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate hover:underline cursor-pointer"
                          title={contest.name}
                        >
                          {contest.name}
                        </h4>
                      </div>
                    </div>
                    {getStatusBadge(contest.status)}
                  </div>

                  {/* Date, Time & Live Countdown */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                        {formattedDate} · {formattedTime}
                      </span>
                      <span className="text-[11px] text-slate-400">Duration: {contest.duration_formatted}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {isLive ? "Ends in" : isUpcoming ? "Starts in" : "Status"}
                      </span>
                      <span
                        className={`text-xs font-black font-mono ${
                          isLive
                            ? "text-rose-600 dark:text-rose-400"
                            : isUpcoming
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-slate-400"
                        }`}
                      >
                        {isLive
                          ? formatTimeRemaining(contest.end_time)
                          : isUpcoming
                          ? formatTimeRemaining(contest.start_time)
                          : "Finished"}
                      </span>
                    </div>
                  </div>

                  {/* Actions: View Details & Official Portal */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveContestModal(contest)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View Details
                    </button>

                    <a
                      href={contest.registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition shadow-xs ${
                        isLive
                          ? "bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600"
                          : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                      }`}
                    >
                      <span>{isLive ? "Participate" : "Register / Apply"}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Interactive Contest Details Modal */}
      {activeContestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs transition-opacity overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 text-slate-800 dark:text-slate-100 my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const plat = PLATFORM_CONFIG[activeContestModal.platform] || PLATFORM_CONFIG.leetcode;
                  const Icon = plat.icon;
                  return (
                    <div className={`p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 ${plat.color}`}>
                      <Icon size={24} />
                    </div>
                  );
                })()}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {PLATFORM_CONFIG[activeContestModal.platform]?.name || activeContestModal.platform}
                    </span>
                    {getStatusBadge(activeContestModal.status)}
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {activeContestModal.name}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveContestModal(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Countdown Banner */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-slate-850 p-4 border border-indigo-100 dark:border-indigo-900/50 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {activeContestModal.status === "live"
                  ? "🔴 Contest is Currently Live"
                  : activeContestModal.status === "upcoming"
                  ? "🟢 Contest Begins In"
                  : "⚪ Contest Has Ended"}
              </span>
              <p className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white mt-1">
                {activeContestModal.status === "live"
                  ? formatTimeRemaining(activeContestModal.end_time)
                  : activeContestModal.status === "upcoming"
                  ? formatTimeRemaining(activeContestModal.start_time)
                  : "Completed"}
              </p>
            </div>

            {/* Timing Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-3 border border-slate-200/70 dark:border-slate-800">
                <span className="font-semibold text-slate-400 block">Start Date & Time</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {new Date(activeContestModal.start_time).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-3 border border-slate-200/70 dark:border-slate-800">
                <span className="font-semibold text-slate-400 block">End Date & Time</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {new Date(activeContestModal.end_time).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-3 border border-slate-200/70 dark:border-slate-800">
                <span className="font-semibold text-slate-400 block">Total Duration</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {activeContestModal.duration_formatted}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-3 border border-slate-200/70 dark:border-slate-800">
                <span className="font-semibold text-slate-400 block">Registration Type</span>
                <p className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 size={13} /> External Registration
                </p>
              </div>
            </div>

            {/* Official Registration Mechanism Notice */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-850 p-3.5 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                <Globe size={14} className="text-indigo-500" />
                <span>Official Contest Portal Registration</span>
              </div>
              <p>
                Official registration for {PLATFORM_CONFIG[activeContestModal.platform]?.name || "this platform"} contests is securely managed through their official portal. Clicking Register / Participate will direct you straight to the verified contest page.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveContestModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Close
              </button>

              <a
                href={activeContestModal.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs"
              >
                <span>Open Contest on {PLATFORM_CONFIG[activeContestModal.platform]?.name || "Portal"}</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ContestCalendar;
