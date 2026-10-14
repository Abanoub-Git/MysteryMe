import React, { Component } from "react";
import { AlertTriangle, RotateCw, Home } from "lucide-react";
import Button from "./Button";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ maxWidth: "560px", margin: "60px auto", padding: "0 16px", textAlign: "center" }}>
          <div className="card" style={{ padding: "40px 24px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "rgba(220, 38, 38, 0.1)",
                color: "var(--color-danger)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px"
              }}
            >
              <AlertTriangle size={28} />
            </div>
            <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>Something went wrong</h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
              {this.state.error?.message || "An unexpected error occurred while rendering this page."}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.location.reload()}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <RotateCw size={14} /> Reload Page
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={this.handleReset}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Home size={14} /> Back to Safety
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
