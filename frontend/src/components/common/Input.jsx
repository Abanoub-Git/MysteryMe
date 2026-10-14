import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function Input({
  label,
  type = "text",
  error,
  hint,
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
  disabled = false,
  className = "",
  style = {},
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  const inputId = id || name || `input-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <div className="form-group" style={style}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          <span>{label} {required && <span style={{ color: "var(--accent)" }}>*</span>}</span>
          {hint && <span className="form-hint">{hint}</span>}
        </label>
      )}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <input
          id={inputId}
          name={name}
          type={actualType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          className={`form-input ${error ? "error" : ""} ${className}`.trim()}
          style={isPassword ? { paddingRight: "2.5rem" } : {}}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            style={{
              position: "absolute",
              right: "0.75rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.2rem"
            }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

export default Input;
