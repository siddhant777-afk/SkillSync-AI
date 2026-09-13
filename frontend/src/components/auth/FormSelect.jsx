const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  error,
  disabled = false,
  required = false,
}) => {
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

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 font-medium outline-none transition duration-150 shadow-xs
          ${
            error
              ? "border-rose-500 focus:border-rose-600 focus:ring-4 focus:ring-rose-100"
              : "border-slate-300 hover:border-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
          }
          ${
            disabled
              ? "cursor-not-allowed bg-slate-100 text-slate-500"
              : "cursor-pointer text-slate-900 bg-white"
          }
        `}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const label = typeof option === "string" ? option : option.label;

          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>

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

export default FormSelect;