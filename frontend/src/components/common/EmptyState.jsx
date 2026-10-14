import React from "react";
import { VenetianMask } from "lucide-react";
import Button from "./Button";

export function EmptyState({
  icon: Icon = null,
  title = "No items yet",
  description = "There are no records to display at this time.",
  action = null,
  actionLabel = null,
  onAction = null
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "3.5rem 1.5rem",
        backgroundColor: "var(--color-surface)",
        border: "1px dashed var(--color-border)",
        borderRadius: "var(--radius-lg)"
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "rgba(224, 90, 71, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-primary)",
          marginBottom: "1rem"
        }}
      >
        {React.isValidElement(Icon) ? (
          Icon
        ) : Icon ? (
          (() => {
            const Component = Icon;
            return <Component size={28} />;
          })()
        ) : (
          <VenetianMask size={28} />
        )}
      </div>
      <h3 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: "0.4rem" }}>
        {title}
      </h3>
      <p
        style={{
          maxWidth: "380px",
          color: "var(--color-text-secondary)",
          fontSize: "0.9rem",
          marginBottom: action || actionLabel ? "1.25rem" : "0"
        }}
      >
        {description}
      </p>
      {action ? (
        action
      ) : actionLabel && onAction ? (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export default EmptyState;
