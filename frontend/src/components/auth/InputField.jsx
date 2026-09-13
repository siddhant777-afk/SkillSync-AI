import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const InputField = ({
  label,
  type,
  placeholder,
  value,
  onChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <div className="mb-5">

      <label className="block text-sm font-semibold mb-2 text-slate-800 dark:text-slate-200">
        {label}
      </label>

      <div className="relative">

        <input
          type={
            isPassword
              ? (showPassword ? "text" : "password")
              : type
          }
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950"
        />

        {isPassword && (

          <button
            type="button"
            className="absolute right-4 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            onClick={() =>
              setShowPassword(!showPassword)
            }
          >
            {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
          </button>

        )}

      </div>

    </div>
  );
};

export default InputField;