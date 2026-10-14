import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { authService } from "../../services/auth.service";

export function GoogleAuthButton({
  text = "continue_with",
  isSignup = false,
  onError,
  disabled = false,
  from = "/dashboard"
}) {
  const containerRef = useRef(null);
  const submittingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");

  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleCredentialResponse = useCallback(
    async (response) => {
      if (!response?.credential) {
        const msg = "No credential received from Google.";
        if (onError) onError(msg);
        showError(msg);
        return;
      }

      if (submittingRef.current) return;
      submittingRef.current = true;
      setSubmitting(true);
      if (onError) onError("");

      try {
        const res = await authService.loginWithGmail({ idToken: response.credential });

        if (res?.data?.access_token) {
          await login({
            access_token: res.data.access_token,
            refresh_token: res.data.refresh_token,
            user: res.data.user || null
          });
          showSuccess(isSignup ? "Account created successfully with Google!" : "Welcome back!");
          navigate(from, { replace: true });
        } else {
          throw new Error(res?.message || "Authentication with Google failed.");
        }
      } catch (err) {
        const errorMessage = err.message || "Failed to authenticate with Google.";
        if (onError) onError(errorMessage);
        showError(errorMessage);
      } finally {
        submittingRef.current = false;
        setSubmitting(false);
      }
    },
    [login, showSuccess, showError, navigate, from, isSignup, onError]
  );

  const callbackRef = useRef(handleCredentialResponse);
  useEffect(() => {
    callbackRef.current = handleCredentialResponse;
  }, [handleCredentialResponse]);

  // Monitor Google Identity Services script availability
  useEffect(() => {
    if (!clientId) {
      setLoadError("Google Client ID is not configured (missing VITE_GOOGLE_CLIENT_ID).");
      return;
    }

    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    // Check if script tag is in document or poll briefly
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.google?.accounts?.id) {
        setScriptLoaded(true);
        clearInterval(interval);
      } else if (attempts > 30) {
        clearInterval(interval);
        setLoadError("Google Sign-In failed to load. Please disable ad-blockers and refresh.");
      }
    }, 200);

    return () => clearInterval(interval);
  }, [clientId]);

  // Render Google button once script is ready and container is mounted
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.google?.accounts?.id || !clientId) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (res) => callbackRef.current?.(res),
        cancel_on_tap_outside: true,
        auto_select: false
      });

      // Calculate width clamped between 240px and 400px (Google GIS constraints)
      const containerWidth = containerRef.current.clientWidth || 360;
      const buttonWidth = Math.min(400, Math.max(240, Math.floor(containerWidth)));

      // Clear previous rendered button iframe if any
      containerRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(containerRef.current, {
        type: "standard",
        shape: "rectangular",
        theme: "outline",
        text: text, // 'continue_with', 'signin_with', 'signup_with'
        size: "large",
        logo_alignment: "left",
        width: buttonWidth
      });
    } catch (err) {
      console.error("Failed to render Google button:", err);
      setLoadError("Unable to initialize Google Sign-In.");
    }
  }, [scriptLoaded, clientId, text]);

  if (loadError) {
    return (
      <div
        style={{
          padding: "0.6rem 0.85rem",
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--bg-subtle)",
          border: "1px solid var(--border-color)",
          color: "var(--text-muted)",
          fontSize: "0.8rem",
          textAlign: "center"
        }}
      >
        {loadError}
      </div>
    );
  }

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {/* Loading overlay during token exchange */}
      {submitting && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            borderRadius: "var(--radius-md)",
            zIndex: 10,
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            backdropFilter: "blur(1px)"
          }}
        >
          <span className="spinner spinner-dark" />
          <span>Authenticating with Google...</span>
        </div>
      )}

      {/* Disabled overlay when form is submitting */}
      {disabled && !submitting && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            zIndex: 5,
            cursor: "not-allowed"
          }}
        />
      )}

      {/* Google button mounting target */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          minHeight: "44px"
        }}
      >
        {/* Placeholder skeleton while GIS script initializes */}
        {!scriptLoaded && (
          <div
            style={{
              width: "100%",
              height: "44px",
              borderRadius: "4px",
              backgroundColor: "var(--bg-subtle)",
              border: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem",
              color: "var(--text-muted)",
              fontSize: "0.9rem"
            }}
          >
            <span className="spinner spinner-dark" style={{ width: "1rem", height: "1rem" }} />
            <span>Loading Google Sign-In...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default GoogleAuthButton;
