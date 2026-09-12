import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useUser } from "../../hooks/useUser";
import { ROUTES } from "../../constants/routes";

const UserDropdown = () => {
  const { currentUser, logout } = useAuth();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fullName = currentUser?.fullName || user?.name || "User";
  const email = currentUser?.email || user?.email || "";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 sm:px-3"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
          {fullName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div className="hidden text-left lg:block">
          <p className="max-w-28 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{fullName}</p>
          <p className="max-w-28 truncate text-[11px] text-slate-400 dark:text-slate-400">{email}</p>
        </div>
        <ChevronDown size={16} className="hidden text-slate-500 dark:text-slate-400 sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <p className="font-semibold text-slate-800 dark:text-slate-100">{fullName}</p>
            <p className="mt-1 truncate text-xs text-slate-400">{email}</p>
          </div>
          <Link onClick={() => setOpen(false)} to={ROUTES.PROFILE} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
            <User size={17} /> Profile
          </Link>
          <Link onClick={() => setOpen(false)} to={ROUTES.SETTINGS} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
            <Settings size={17} /> Settings
          </Link>
          <button type="button" onClick={logout} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40">
            <LogOut size={17} /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
