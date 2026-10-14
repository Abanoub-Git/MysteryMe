import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext.jsx";
import { authService } from "../services/auth.service";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import GoogleAuthButton from "../components/common/GoogleAuthButton";
import { UserPlus, VenetianMask } from "lucide-react";

export function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "+20",
    gender: "0",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const { showSuccess, showError } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateClient = () => {
    const errors = {};
    if (!formData.username.trim()) {
      errors.username = "Full name / username is required.";
    } else if (!formData.username.trim().includes(" ")) {
      errors.username = "Please provide both first and last name separated by a space (e.g. John Doe).";
    }
    if (!formData.email.trim()) errors.email = "Email is required.";

    // E.164 phone validation (starts with +, minimum 8 digits)
    const phoneRegex = /^\+[1-9]\d{6,14}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      errors.phone = "Phone must be in international format (e.g., +201012345678).";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 8 || formData.password.length > 16) {
      errors.password = "Password must be between 8 and 16 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const errors = validateClient();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await authService.signup({
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gender: Number(formData.gender),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      showSuccess("Account created! Please enter the verification code sent to your email.");
      navigate(`/verify-email?email=${encodeURIComponent(formData.email.trim())}`);
    } catch (err) {
      setFormError(err.message || "Registration failed. Please check your details.");
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-form" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
      <div className="card">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
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
            <UserPlus size={24} />
          </div>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>Create Your Account</h2>
          <p style={{ fontSize: "0.9rem" }}>
            Start receiving anonymous messages and feedback in seconds.
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

        <form onSubmit={handleSubmit}>
          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="e.g. mystery_alex"
            error={fieldErrors.username}
            required
            autoFocus
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            error={fieldErrors.email}
            required
            autoComplete="email"
          />

          <Input
            label="Phone (International E.164)"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+201001234567"
            hint="Include country code (+20...)"
            error={fieldErrors.phone}
            required
          />

          {/* Gender Selection */}
          <div className="form-group">
            <label className="form-label">
              <span>Gender <span style={{ color: "var(--accent)" }}>*</span></span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="form-select"
            >
              <option value="0">Male</option>
              <option value="1">Female</option>
            </select>
          </div>

          <Input
            label="Password (8-16 characters)"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Choose a strong password"
            error={fieldErrors.password}
            required
            autoComplete="new-password"
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            error={fieldErrors.confirmPassword}
            required
            autoComplete="new-password"
          />

          <Button
            type="submit"
            loading={loading}
            fullWidth
            style={{ marginTop: "0.5rem" }}
          >
            Create Free Account
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
          isSignup={true}
          onError={(msg) => setFormError(msg)}
          disabled={loading}
          from="/dashboard"
        />

        <div style={{
          marginTop: "1.5rem",
          paddingTop: "1.25rem",
          borderTop: "1px solid var(--border-color)",
          textAlign: "center",
          fontSize: "0.9rem",
          color: "var(--text-secondary)"
        }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
