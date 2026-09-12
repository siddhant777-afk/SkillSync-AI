const ScoreRing = ({ value, label = "/100", size = "lg" }) => {
  const radius = size === "lg" ? 48 : 40;
  const viewBox = size === "lg" ? 120 : 100;
  const stroke = size === "lg" ? 10 : 9;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={`relative ${size === "lg" ? "h-44 w-44" : "h-36 w-36"}`}>
      <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${viewBox} ${viewBox}`}>
        <circle
          cx={viewBox / 2}
          cy={viewBox / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          strokeWidth={stroke}
        />
        <circle
          cx={viewBox / 2}
          cy={viewBox / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-emerald-500 dark:text-emerald-400"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${size === "lg" ? "text-4xl" : "text-3xl"} font-bold text-slate-900 dark:text-white`}>
          {value}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">{label}</span>
      </div>
    </div>
  );
};

export default ScoreRing;
