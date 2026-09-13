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

      <label className="block text-sm font-semibold mb-2">
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
          className="w-full border rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
        />

        {isPassword && (

          <button
            type="button"
            className="absolute right-4 top-3"
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