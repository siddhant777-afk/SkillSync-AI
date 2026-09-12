
import {
  Award,
  BarChart3,
  BrainCircuit,
  Briefcase,
  Compass,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Settings,
  Star,
  Trophy,
  User,
} from "lucide-react";

import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { useSidebar } from "../../hooks/useSidebar";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../constants/routes";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: ROUTES.DASHBOARD,
  },
  {
    title: "Profile",
    icon: User,
    path: ROUTES.PROFILE,
  },
  {
    title: "My Progress",
    icon: BarChart3,
    path: ROUTES.PROGRESS,
  },
  {
    title: "Skills",
    icon: BrainCircuit,
    path: ROUTES.SKILLS,
  },
  {
    title: "Projects",
    icon: FolderKanban,
    path: ROUTES.PROJECTS,
  },
  {
    title: "Achievements",
    icon: Award,
    path: ROUTES.ACHIEVEMENTS,
  },
  {
    title: "Leaderboard",
    icon: Trophy,
    path: ROUTES.LEADERBOARD,
  },
  {
    title: "Job Matches",
    icon: Compass,
    path: ROUTES.JOBS,
  },
  {
    title: "Recommendations",
    icon: Star,
    path: ROUTES.RECOMMENDATIONS,
  },
  {
    title: "Resume Builder",
    icon: FileText,
    path: ROUTES.RESUME,
  },
  {
    title: "Talent Explorer",
    icon: Briefcase,
    path: ROUTES.RECRUITER,
  },
  {
    title: "Settings",
    icon: Settings,
    path: ROUTES.SETTINGS,
  },
];


const Sidebar = () => {
  const { collapsed, toggleSidebar, closeSidebar } = useSidebar();
  const { logout } = useAuth();
  const location = useLocation();

  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      closeSidebar();
    }
  }, [location.pathname]);

  return (
    <>
      {!collapsed && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-xs lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col justify-between border-r border-slate-200 bg-white shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          collapsed ? "-translate-x-full lg:w-20" : "translate-x-0"
        }`}
      >
        <div>
          <div
            className={`flex h-20 items-center px-5 ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            {!collapsed && (
              <div>
                <p className="text-2xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">
                  SkillSync AI
                </p>

                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                  Career Intelligence
                </p>
              </div>
            )}

            {collapsed && (
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                S
              </span>
            )}
          </div>

          <nav className="space-y-1 px-3 py-2">
            {menuItems.map(({ title, icon: Icon, path }) => (
              <NavLink
                key={title}
                to={path}
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth < 1024) {
                    closeSidebar();
                  }
                }}
                title={collapsed ? title : undefined}
                className={({ isActive }) =>
                  `group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
                  } ${collapsed ? "justify-center" : "gap-3"}`
                }
              >
                <Icon size={19} />

                {!collapsed && <span>{title}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-slate-100 p-3 dark:border-slate-800">
          <button
            type="button"
            onClick={logout}
            title={collapsed ? "Logout" : undefined}
            className={`flex w-full items-center rounded-xl px-3 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <LogOut size={19} />

            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;