import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { authService } from "../services/auth.service";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { MailCheck, RotateCcw, ArrowRight } from "lucide-react";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [formError, setFormError] = useState("");

  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!email.trim()) {
      setFormError("Email address is required.");
      return;
    }

    if (!otp.trim() || otp.trim().length !== 6) {
      setFormError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      await authService.confirmEmail({
        email: email.trim(),
        otp: otp.trim()
      });

      showSuccess("Email confirmed successfully! You can now log in.");
      navigate("/login");
    } catch (err) {
      setFormError(err.message || "Invalid or expired code. Please try again.");
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setFormError("Please provide an email address to resend code.");
      return;
    }
    if (cooldown > 0) return;

    setResending(true);
    setFormError("");
    try {
      await authService.resendConfirmEmail({ email: email.trim() });
      showSuccess("A new verification code has been sent to your email.");
      setCooldown(60);
    } catch (err) {
      setFormError(err.message || "Failed to resend code.");
      showError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container-form" style={{ paddingTop: "3rem" }}>
      <div className="card">
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--accent-subtle)",
            color: "var(--accent)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "0.75rem"
          }}>
            <MailCheck size={24} />
          </div>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>Verify Your Email</h2>
          <p style={{ fontSize: "0.9rem" }}>
            Enter the 6-digit confirmation code sent to your inbox.
          </p>
        </div>

        {formError && (
          <div style={{
            backgroundColor: "var(--danger-bg)",
            border: "1px solid var(--danger-border)",
            color: "var(--danger)",
            borderRadius: "var(--radius-md)",
            padding: "0.75rem 1rem",
            fontSize: "0.85rem",
            marginBottom: "1.25rem",
            lineHeight: 1.4
          }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <Input
            label="6-Digit Verification Code"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            maxLength={6}
            required
            autoFocus
          />

          <Button
            type="submit"
            loading={loading}
            fullWidth
            icon={<ArrowRight size={16} />}
            style={{ marginTop: "0.5rem" }}
          >
            Confirm Email
          </Button>

          <div style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "1.25rem"
          }}>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="btn btn-ghost btn-sm"
              style={{ color: cooldown > 0 ? "var(--text-muted)" : "var(--accent)" }}
            >
              <RotateCcw size={14} />
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend verification code"}
            </button>
          </div>
        </form>

        <div style={{
          marginTop: "1.5rem",
          paddingTop: "1.25rem",
          borderTop: "1px solid var(--border-color)",
          textAlign: "center",
          fontSize: "0.9rem",
          color: "var(--text-secondary)"
        }}>
          Already verified?{" "}
          <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
