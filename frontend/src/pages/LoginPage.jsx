import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authService } from "../services/auth.service";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import GoogleAuthButton from "../components/common/GoogleAuthButton";
import { LogIn, Key, VenetianMask, ArrowLeft } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Two-step verification state
  const [isTwoStepRequired, setIsTwoStepRequired] = useState(false);
  const [twoStepOtp, setTwoStepOtp] = useState("");
  const [twoStepLoading, setTwoStepLoading] = useState(false);

  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, from]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!email.trim() || !password) {
      setFormError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({ email: email.trim(), password });

      // Check if 2-step verification is triggered
      if (response?.data?.twoStepVerification) {
        setIsTwoStepRequired(true);
        showSuccess("Two-step verification code sent to your email.");
        return;
      }

      if (response?.data?.access_token) {
        await login({
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          user: response.data.user || null
        });
        showSuccess("Welcome back!");
        navigate(from, { replace: true });
      }
    } catch (err) {
      setFormError(err.message || "Failed to log in. Please check your credentials.");
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTwoStepSubmit = async (e) => {
    e.preventDefault();
    if (!twoStepOtp.trim() || twoStepOtp.trim().length !== 6) {
      setFormError("Please enter the 6-digit verification code.");
      return;
    }

    setTwoStepLoading(true);
    setFormError("");
    try {
      const response = await authService.loginConfirmation({
        email: email.trim(),
        otp: twoStepOtp.trim()
      });

      if (response?.data?.access_token) {
        await login({
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          user: response.data.user || null
        });
        showSuccess("Verified successfully!");
        navigate(from, { replace: true });
      }
    } catch (err) {
      setFormError(err.message || "Invalid or expired verification code.");
      showError(err.message);
    } finally {
      setTwoStepLoading(false);
    }
  };

  return (
    <div className="container-form" style={{ paddingTop: "3rem" }}>
      <div className="card">
        {/* Header */}
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
            {isTwoStepRequired ? <Key size={24} /> : <LogIn size={24} />}
          </div>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>
            {isTwoStepRequired ? "Two-Step Verification" : "Login to MysteryMe"}
          </h2>
          <p style={{ fontSize: "0.9rem" }}>
            {isTwoStepRequired
              ? `Enter the 6-digit code sent to ${email}`
              : "Access your messages, identity requests, and conversations."
            }
          </p>
        </div>

        {/* Error message alert */}
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

        {isTwoStepRequired ? (
          /* Two-Step Verification Form */
          <form onSubmit={handleTwoStepSubmit}>
            <Input
              label="6-Digit Verification Code"
              type="text"
              name="otp"
              value={twoStepOtp}
              onChange={(e) => setTwoStepOtp(e.target.value)}
              placeholder="123456"
              maxLength={6}
              required
              autoFocus
            />

            <Button
              type="submit"
              loading={twoStepLoading}
              fullWidth
              style={{ marginTop: "1rem" }}
            >
              Confirm and Log In
            </Button>

            <button
              type="button"
              onClick={() => { setIsTwoStepRequired(false); setFormError(""); }}
              className="btn btn-ghost btn-full"
              style={{ marginTop: "0.5rem" }}
            >
              <ArrowLeft size={16} /> Back to Login
            </button>
          </form>
        ) : (
          /* Normal Login Form */
          <>
            <form onSubmit={handleLoginSubmit}>
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                autoFocus
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                hint={<Link to="/forgot-password" style={{ color: "var(--accent)", fontSize: "0.85rem" }}>Forgot?</Link>}
              />

              <Button
                type="submit"
                loading={loading}
                fullWidth
                style={{ marginTop: "0.75rem" }}
              >
                Login
              </Button>
            </form>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                margin: "1.25rem 0",
                color: "var(--text-muted)",
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}
            >
              <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)" }} />
              <span style={{ padding: "0 0.75rem", fontWeight: 500 }}>or</span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)" }} />
            </div>

            <GoogleAuthButton
              text="continue_with"
              isSignup={false}
              onError={(msg) => setFormError(msg)}
              disabled={loading}
              from={from}
            />
          </>
        )}

        {/* Footer links */}
        <div style={{
          marginTop: "1.75rem",
          paddingTop: "1.25rem",
          borderTop: "1px solid var(--border-color)",
          textAlign: "center",
          fontSize: "0.9rem",
          color: "var(--text-secondary)"
        }}>
          Don’t have an account?{" "}
          <Link to="/signup" style={{ color: "var(--accent)", fontWeight: 600 }}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
