import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const FormInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  required = false,
  autoComplete,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <div className="w-full">
      {/* Label */}
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-semibold text-slate-800"
      >
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={isPassword && showPassword ? "text" : type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 font-medium placeholder:text-slate-400 transition duration-150 outline-none shadow-xs
            ${
              error
                ? "border-rose-500 focus:border-rose-600 focus:ring-4 focus:ring-rose-100"
                : "border-slate-300 hover:border-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
            }
            ${
              disabled
                ? "cursor-not-allowed bg-slate-100 text-slate-500"
                : "bg-white text-slate-900"
            }
            ${isPassword ? "pr-11" : ""}
          `}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
        )}
      </div>

      {error && (
        <p
          id={`${name}-error`}
          className="mt-1 text-sm text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;