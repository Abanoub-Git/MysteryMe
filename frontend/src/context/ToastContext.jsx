import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    let safeMessage = "Notification";
    if (typeof message === "string") {
      safeMessage = message;
    } else if (message?.message && typeof message.message === "string") {
      safeMessage = message.message;
    } else if (message?.error_message && typeof message.error_message === "string") {
      safeMessage = message.error_message;
    } else if (message) {
      try {
        safeMessage = JSON.stringify(message);
      } catch {
        safeMessage = String(message);
      }
    }
    const newToast = { id, message: safeMessage, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const showSuccess = useCallback((msg) => addToast(msg, "success"), [addToast]);
  const showError = useCallback((msg) => addToast(msg, "error", 5000), [addToast]);
  const showWarning = useCallback((msg) => addToast(msg, "warning"), [addToast]);
  const showInfo = useCallback((msg) => addToast(msg, "info"), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, showSuccess, showError, showWarning, showInfo, removeToast }}>
      {children}
      <div style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        zIndex: 9999,
        maxWidth: "420px",
        width: "calc(100% - 3rem)"
      }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              padding: "0.85rem 1rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-surface)",
              boxShadow: "var(--shadow-lg)",
              border: `1px solid ${
                toast.type === "success" ? "var(--success-border)" :
                toast.type === "error" ? "var(--danger-border)" :
                toast.type === "warning" ? "var(--warning-border)" :
                "var(--info-border)"
              }`,
              color: "var(--text-primary)",
              animation: "slideUp 180ms ease"
            }}
          >
            <div style={{ marginTop: "2px", flexShrink: 0 }}>
              {toast.type === "success" && <CheckCircle2 size={18} color="var(--success)" />}
              {toast.type === "error" && <AlertCircle size={18} color="var(--danger)" />}
              {toast.type === "warning" && <AlertTriangle size={18} color="var(--warning)" />}
              {toast.type === "info" && <Info size={18} color="var(--info)" />}
            </div>
            <div style={{ flex: 1, fontSize: "0.9rem", lineHeight: 1.4 }}>
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                color: "var(--text-muted)",
                padding: "2px",
                display: "flex",
                alignItems: "center"
              }}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
