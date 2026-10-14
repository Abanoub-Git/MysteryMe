import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Mail, ArrowLeft, CheckCircle, ShieldCheck } from "lucide-react";
import { authService } from "../services/auth.service.js";
import { useToast } from "../context/ToastContext.jsx";
import { Input } from "../components/common/Input.jsx";
import { Button } from "../components/common/Button.jsx";

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [step, setStep] = useState(1); // 1: enter email, 2: enter otp & new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      await authService.requestForgotPassword({ email: email.trim().toLowerCase() });
      showSuccess("Password reset code sent to your email.");
      setStep(2);
    } catch (err) {
      showError(err.message || "Failed to send reset code. Please check your email.");
      setErrors({ email: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!otp.trim() || otp.trim().length !== 6) {
      errs.otp = "Enter a valid 6-digit OTP code";
    }
    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await authService.resetPassword({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        password,
        confirmPassword
      });
      showSuccess("Password reset successfully! You can now log in.");
      navigate("/login");
    } catch (err) {
      showError(err.message || "Failed to reset password. Code may be invalid or expired.");
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "440px", margin: "40px auto", padding: "0 16px" }}>
      <div className="card" style={{ padding: "36px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "rgba(224, 90, 71, 0.1)",
              color: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px"
            }}
          >
            {step === 1 ? <KeyRound size={28} /> : <ShieldCheck size={28} />}
          </div>
          <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
            {step === 1 ? "Reset your password" : "Enter new password"}
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
            {step === 1
              ? "Enter your account email and we will send you a 6-digit reset code."
              : `Enter the 6-digit code sent to ${email} and set your new password.`}
          </p>
        </div>

        {errors.form && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(220, 38, 38, 0.08)",
              border: "1px solid rgba(220, 38, 38, 0.2)",
              color: "var(--color-danger)",
              fontSize: "14px",
              marginBottom: "20px"
            }}
          >
            {errors.form}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp}>
            <Input
              id="reset-email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
              autoFocus
            />

            <Button
              id="btn-request-reset"
              type="submit"
              variant="primary"
              loading={loading}
              style={{ width: "100%", marginTop: "8px" }}
            >
              Send Reset Code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <Input
              id="reset-otp"
              label="6-Digit Reset Code"
              type="text"
              placeholder="123456"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              error={errors.otp}
              required
              autoFocus
            />

            <Input
              id="reset-new-password"
              label="New Password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
            />

            <Input
              id="reset-confirm-password"
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              required
            />

            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                id="btn-confirm-reset"
                type="submit"
                variant="primary"
                loading={loading}
                style={{ flex: 1 }}
              >
                Reset Password
              </Button>
            </div>
          </form>
        )}

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <Link
            to="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--color-text-secondary)",
              fontSize: "14px",
              textDecoration: "none"
            }}
          >
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
