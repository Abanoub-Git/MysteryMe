import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  VenetianMask,
  ShieldCheck,
  KeyRound,
  MessagesSquare,
  ArrowRight,
  Send,
  EyeOff
} from "lucide-react";
import Button from "../components/common/Button";

export function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ paddingTop: "2.5rem" }}>
      {/* Hero Section */}
      <section className="container-narrow" style={{ textAlign: "center", marginBottom: "4rem" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.35rem 0.85rem",
          borderRadius: "var(--radius-full)",
          backgroundColor: "var(--accent-subtle)",
          color: "var(--accent-text)",
          border: "1px solid var(--accent-border)",
          fontSize: "0.85rem",
          fontWeight: 500,
          marginBottom: "1.5rem"
        }}>
          <VenetianMask size={14} />
          <span>Honest thoughts, guaranteed anonymity</span>
        </div>

        <h1 style={{
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
          marginBottom: "1.25rem",
          color: "var(--text-primary)"
        }}>
          Send and receive anonymous messages with privacy control.
        </h1>

        <p style={{
          fontSize: "1.15rem",
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          maxWidth: "560px",
          margin: "0 auto 2rem"
        }}>
          MysteryMe lets friends and followers send you anonymous messages. If you’re curious who sent one, you can request their identity — and they decide whether to reveal themselves.
        </p>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          flexWrap: "wrap"
        }}>
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="lg" icon={<ArrowRight size={18} />}>
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/signup">
                <Button size="lg" icon={<ArrowRight size={18} />}>
                  Create Your Link Free
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg">
                  Login
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="container" style={{ marginBottom: "5rem" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem"
        }}>
          <div className="card">
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--accent-subtle)",
              color: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.25rem"
            }}>
              <EyeOff size={22} />
            </div>
            <h3 style={{ marginBottom: "0.5rem" }}>1. Anonymous Messaging</h3>
            <p style={{ fontSize: "0.95rem" }}>
              Share your custom profile link. Anyone can send you genuine feedback, secret questions, or thoughtful notes without revealing who they are.
            </p>
          </div>

          <div className="card">
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "#fef3c7",
              color: "#d97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.25rem"
            }}>
              <KeyRound size={22} />
            </div>
            <h3 style={{ marginBottom: "0.5rem" }}>2. Request Identity</h3>
            <p style={{ fontSize: "0.95rem" }}>
              Want to know who wrote a specific message? You can send an identity request. The sender receives the request and has full control to accept or reject.
            </p>
          </div>

          <div className="card">
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "#dcfce7",
              color: "#16a34a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.25rem"
            }}>
              <MessagesSquare size={22} />
            </div>
            <h3 style={{ marginBottom: "0.5rem" }}>3. Private Conversations</h3>
            <p style={{ fontSize: "0.95rem" }}>
              When an identity request is accepted, a private two-way conversation is unlocked between you both, preserving privacy until consent is granted.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Privacy Banner */}
      <section className="container-narrow" style={{ marginBottom: "3rem" }}>
        <div style={{
          backgroundColor: "var(--bg-subtle)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: "2rem",
          display: "flex",
          alignItems: "flex-start",
          gap: "1.25rem"
        }}>
          <div style={{ color: "var(--accent)", flexShrink: 0, marginTop: "2px" }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h4 style={{ marginBottom: "0.4rem" }}>Built with privacy at the core</h4>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
              Sender identities are strictly protected on the backend. No sender information is exposed to message recipients unless explicitly accepted by the original author.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
