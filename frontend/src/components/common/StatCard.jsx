const StatCard = ({ label, value, helper, icon: Icon, tone = "indigo" }) => {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400",
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
    blue: "bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400",
    purple: "bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400",
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm min-w-0 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3 min-w-0">
        <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {Icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone] || tones.indigo}`}>
            <Icon size={19} />
          </div>
        )}
      </div>
      <p className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white whitespace-nowrap">{value}</p>
      {helper && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 truncate">{helper}</p>}
    </div>
  );
};

export default StatCard;
