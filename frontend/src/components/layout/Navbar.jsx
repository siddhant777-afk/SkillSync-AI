import { ArrowLeft, Bell, LogOut, Menu, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import UserDropdown from "./UserDropdown";
import { useSidebar } from "../../hooks/useSidebar";
import { useAuth } from "../../hooks/useAuth";

const Navbar = () => {
  const { toggleSidebar } = useSidebar();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/" || location.pathname === "";

  return (
    <header className="flex min-h-16 items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <Menu size={22} />
        </button>

        {!isHome && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            title="Go back to previous page"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-indigo-600"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
        )}

        <div className="relative hidden w-[min(380px,35vw)] md:block">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search anything..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100"
        >
          <Bell size={20} />
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">3</span>
        </button>

        <button
          type="button"
          onClick={logout}
          title="Sign Out / Return to Login"
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200/80 bg-rose-50/70 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 hover:text-rose-700"
        >
          <LogOut size={15} />
          <span className="hidden md:inline">Logout</span>
        </button>

        <UserDropdown />
      </div>
    </header>
  );
};

export default Navbar;
