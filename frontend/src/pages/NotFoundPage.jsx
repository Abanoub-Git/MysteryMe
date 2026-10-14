import React from "react";
import { Link } from "react-router-dom";
import { HelpCircle, ArrowLeft, Home } from "lucide-react";
import { Button } from "../components/common/Button.jsx";

export const NotFoundPage = () => {
  return (
    <div style={{ maxWidth: "480px", margin: "80px auto", padding: "0 16px", textAlign: "center" }}>
      <div className="card" style={{ padding: "48px 32px" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "rgba(224, 90, 71, 0.1)",
            color: "var(--color-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px"
          }}
        >
          <HelpCircle size={36} />
        </div>
        <h1 style={{ fontSize: "36px", marginBottom: "8px", fontWeight: "800" }}>404</h1>
        <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>Page Not Found</h2>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: "1.6", marginBottom: "28px" }}>
          The page or mystery link you are looking for doesn't exist, has been deleted, or is temporarily unavailable.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
          <Link to="/">
            <Button variant="primary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Home size={16} /> Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
