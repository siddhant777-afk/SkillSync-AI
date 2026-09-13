import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const InputField = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  autoComplete,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-800 mb-1.5">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>

      <div className="relative">
        <input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 font-medium placeholder:text-slate-400 outline-none transition duration-150 shadow-xs
            ${error
              ? "border-rose-500 focus:border-rose-600 focus:ring-4 focus:ring-rose-100"
              : "border-slate-300 hover:border-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
            }
            ${isPassword ? "pr-11" : ""}
          `}
        />

        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition rounded-lg"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
      )}
    </div>
  );
};

export default InputField;