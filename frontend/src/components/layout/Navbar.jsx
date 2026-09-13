import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Award,
  BarChart3,
  BrainCircuit,
  Briefcase,
  Compass,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Moon,
  MoreHorizontal,
  Search,
  Settings,
  Sparkles,
  Star,
  Sun,
  Trophy,
  User,
  X,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import UserDropdown from "./UserDropdown";
import NotificationDropdown from "./NotificationDropdown";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { ROUTES } from "../../constants/routes";

const PRIMARY_NAV = [
  { title: "Dashboard", icon: LayoutDashboard, path: ROUTES.DASHBOARD },
  { title: "Profile", icon: User, path: ROUTES.PROFILE },
  { title: "My Progress", icon: BarChart3, path: ROUTES.PROGRESS },
  { title: "Skills", icon: BrainCircuit, path: ROUTES.SKILLS },
  { title: "Projects", icon: FolderKanban, path: ROUTES.PROJECTS },
  { title: "Leaderboard", icon: Trophy, path: ROUTES.LEADERBOARD },
];

const OVERFLOW_NAV = [
  { title: "Achievements", icon: Award, path: ROUTES.ACHIEVEMENTS, desc: "Hackathons & verified badges" },
  { title: "Job Matches", icon: Compass, path: ROUTES.JOBS, desc: "AI career alignment & live roles" },
  { title: "Recommendations", icon: Star, path: ROUTES.RECOMMENDATIONS, desc: "Targeted skill improvement roadmap" },
  { title: "Resume Builder", icon: FileText, path: ROUTES.RESUME, desc: "ATS-optimized printable resume" },
  { title: "Talent Explorer", icon: Briefcase, path: ROUTES.RECRUITER, desc: "Candidate ranking & discovery" },
  { title: "Settings", icon: Settings, path: ROUTES.SETTINGS, desc: "Preferences & account sync" },
];

const ALL_NAV = [...PRIMARY_NAV, ...OVERFLOW_NAV];

const Navbar = () => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const moreRef = useRef(null);

  const isHome = location.pathname === "/" || location.pathname === "";

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMoreOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isOverflowActive = OVERFLOW_NAV.some((item) => item.path === location.pathname);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Top Row: Brand, Search, Top Actions */}
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand & Back Button */}
          <div className="flex items-center gap-3 shrink-0">
            {!isHome && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                title="Go back to previous page"
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            <NavLink to={ROUTES.DASHBOARD} className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition shrink-0">
                <Sparkles size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-lg sm:text-xl font-black tracking-tight text-indigo-600 dark:text-indigo-400 block leading-tight truncate">
                  SkillSync AI
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 hidden sm:block">
                  Career Intelligence
                </span>
              </div>
            </NavLink>
          </div>

          {/* Center: Search Bar */}
          <div className="relative hidden md:block w-72 lg:w-96">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="search"
              placeholder="Search skills, platforms, metrics..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs sm:text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-900 dark:focus:ring-indigo-950"
            />
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 dark:text-amber-400 dark:hover:bg-slate-800"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} className="text-slate-600" />}
            </button>

            {/* Notification Bell */}
            <NotificationDropdown />

            {/* Logout */}
            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-rose-200/80 bg-rose-50/70 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 hover:text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>

            {/* User Profile Dropdown */}
            <UserDropdown />

            {/* Mobile Three-Dots / Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="xl:hidden rounded-xl p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {mobileMenuOpen ? <X size={22} /> : <MoreHorizontal size={22} />}
            </button>
          </div>
        </div>

        {/* Bottom Row: Desktop Horizontal Navigation Bar with Three Dots (...) More Menu */}
        <nav className="hidden xl:flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 py-1.5">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {PRIMARY_NAV.map(({ title, icon: Icon, path }) => (
              <NavLink
                key={title}
                to={path}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition whitespace-nowrap ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`
                }
              >
                <Icon size={15} />
                <span>{title}</span>
              </NavLink>
            ))}

            {/* Three Dots (...) More Menu Button */}
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition whitespace-nowrap ${
                  isOverflowActive || moreOpen
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title="View more pages"
              >
                <MoreHorizontal size={17} />
                <span>More</span>
              </button>

              {/* Three Dots Dropdown Panel */}
              {moreOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Explore More Intelligence
                    </p>
                  </div>
                  <div className="space-y-1 mt-1">
                    {OVERFLOW_NAV.map(({ title, icon: Icon, path, desc }) => (
                      <NavLink
                        key={title}
                        to={path}
                        onClick={() => setMoreOpen(false)}
                        className={({ isActive }) =>
                          `flex items-start gap-3 rounded-xl p-2.5 text-xs transition ${
                            isActive
                              ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold"
                              : "hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200"
                          }`
                        }
                      >
                        <div className="mt-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 p-1.5 text-indigo-600 dark:text-indigo-400 shrink-0">
                          <Icon size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold truncate">{title}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">{desc}</p>
                        </div>
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span>AI Telemetry Active</span>
          </div>
        </nav>
      </div>

      {/* Mobile / Tablet Full Navigation Drawer (When Three Dots / Menu is Tapped) */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3 shadow-lg max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Navigation Menu
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {ALL_NAV.map(({ title, icon: Icon, path }) => (
              <NavLink
                key={title}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`
                }
              >
                <Icon size={16} />
                <span>{title}</span>
              </NavLink>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
            >
              <LogOut size={14} /> Sign Out
            </button>
            <span className="text-[10px] text-slate-400">SkillSync AI v2.0</span>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
