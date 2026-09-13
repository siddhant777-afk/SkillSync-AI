const ScoreRing = ({ value = 0, label = "/100", size = "lg" }) => {
  const radius = size === "lg" ? 50 : 40;
  const viewBox = size === "lg" ? 128 : 104;
  const stroke = size === "lg" ? 10 : 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  const gradientId = `score-gradient-${size}`;

  return (
    <div className={`relative ${size === "lg" ? "h-40 w-40 sm:h-44 sm:w-44" : "h-32 w-32"} shrink-0`}>
      <svg className="h-full w-full -rotate-90 drop-shadow-xs" viewBox={`0 0 ${viewBox} ${viewBox}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <circle
          cx={viewBox / 2}
          cy={viewBox / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-slate-100 dark:text-slate-800"
          strokeWidth={stroke}
        />
        <circle
          cx={viewBox / 2}
          cy={viewBox / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${size === "lg" ? "text-3xl sm:text-4xl" : "text-2xl"} font-black text-slate-900 dark:text-white tracking-tight`}>
          {value}
        </span>
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
};

export default ScoreRing;
