import React from "react";
import { VenetianMask, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer style={{
      marginTop: "auto",
      backgroundColor: "var(--bg-surface)",
      borderTop: "1px solid var(--border-color)",
      padding: "2rem 0",
      color: "var(--text-secondary)",
      fontSize: "0.875rem"
    }}>
      <div className="container" style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <VenetianMask size={16} color="var(--accent)" />
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>MysteryMe</span>
          <span>— Anonymous messaging with authentic connections.</span>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          color: "var(--text-muted)",
          fontSize: "0.8rem"
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Shield size={14} /> End-to-end anonymity protected
          </span>
          <span>•</span>
          <span>&copy; {new Date().getFullYear()} MysteryMe</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
