import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Password field with optional left icon and show/hide toggle.
 * Matches auth page styling (gray-100 inputs, teal focus ring).
 */
export default function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  leftIcon,
  className = "",
  id,
  name,
  autoComplete,
  disabled = false,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-4 top-3.5 text-gray-400 pointer-events-none">
          {leftIcon}
        </div>
      )}
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        disabled={disabled}
        className={`w-full ${leftIcon ? "pl-12" : "pl-4"} pr-12 py-3 bg-gray-100 border-none rounded-lg text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/40 disabled:opacity-50"
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}
