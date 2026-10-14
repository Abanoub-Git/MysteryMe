import React from "react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  icon = null,
  type = "button",
  onClick,
  style = {},
  className = "",
  ...props
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";
  const fullClass = fullWidth ? "btn-full" : "";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn ${variantClass} ${sizeClass} ${fullClass} ${className}`.trim()}
      style={style}
      {...props}
    >
      {loading ? (
        <span
          className={`spinner ${variant === "secondary" || variant === "ghost" ? "spinner-dark" : ""}`}
        />
      ) : (
        icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
}

export default Button;
