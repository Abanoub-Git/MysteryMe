import React, { useState, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Camera,
  LogOut,
  Save,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { userService } from "../services/user.service.js";
import { authService } from "../services/auth.service.js";
import { getImageUrl } from "../services/api.js";
import { Input } from "../components/common/Input.jsx";
import { Button } from "../components/common/Button.jsx";
import { Badge } from "../components/common/Badge.jsx";
import { Modal } from "../components/common/Modal.jsx";

export const ProfilePage = () => {
  const { user, updateUser, refreshProfile, logout } = useAuth();
  const { showSuccess, showError } = useToast();

  const fileInputRef = useRef(null);

  // Profile Edit State
  const [username, setUsername] = useState(user?.username || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [gender, setGender] = useState(user?.gender !== undefined ? String(user.gender) : "0");
  const [savingProfile, setSavingProfile] = useState(false);

  // Avatar Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarError, setAvatarError] = useState(false);

  // 2FA Modal & State
  const [twoFaModalOpen, setTwoFaModalOpen] = useState(false);
  const [twoFaOtp, setTwoFaOtp] = useState("");
  const [twoFaLoading, setTwoFaLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      showError("Username is required");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await userService.updateProfile({
        username: username.trim(),
        phone: phone.trim() || undefined,
        gender: Number(gender)
      });
      const updatedData = res.data?.account || res.data?.user || res.data;
      updateUser(updatedData || { username, phone, gender: Number(gender) });
      showSuccess("Profile updated successfully!");
    } catch (err) {
      showError(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("Please select a valid image file");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showError("Profile image must be less than 3MB");
      return;
    }

    // Set temporary preview
    setAvatarPreview(URL.createObjectURL(file));

    setUploadingImage(true);
    try {
      const res = await userService.uploadProfileImage(file);
      const updatedUser = res.data?.user || res.data;
      if (updatedUser) {
        updateUser(updatedUser);
      }
      setAvatarPreview(null);
      setAvatarError(false);
      try {
        await refreshProfile();
      } catch {
        // ignore secondary refresh error
      }
      showSuccess("Profile photo updated successfully!");
    } catch (err) {
      showError(err.message || "Failed to upload profile image");
      setAvatarPreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEnable2FA = async () => {
    setTwoFaLoading(true);
    try {
      await authService.enableTwoStep();
      showSuccess("A verification code was sent to your email.");
      setTwoFaModalOpen(true);
    } catch (err) {
      showError(err.message || "Failed to initiate two-step verification");
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleConfirm2FA = async (e) => {
    e.preventDefault();
    if (!twoFaOtp.trim() || twoFaOtp.trim().length !== 6) {
      showError("Enter a valid 6-digit code");
      return;
    }

    setTwoFaLoading(true);
    try {
      await authService.confirmTwoStep({ email: user?.email, otp: twoFaOtp.trim() });
      updateUser({ twoStepVerification: true });
      showSuccess("Two-step verification is now enabled!");
      setTwoFaModalOpen(false);
      setTwoFaOtp("");
    } catch (err) {
      showError(err.message || "Invalid or expired OTP code");
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setTwoFaLoading(true);
    try {
      await authService.disableTwoStep();
      updateUser({ twoStepVerification: false });
      showSuccess("Two-step verification disabled.");
    } catch (err) {
      showError(err.message || "Failed to disable two-step verification");
    } finally {
      setTwoFaLoading(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setPhone(user.phone || "");
      setGender(user.gender !== undefined ? String(user.gender) : "0");
    }
  }, [user]);

  const currentImg = avatarPreview || getImageUrl(user?.image || user?.profileImage);

  React.useEffect(() => {
    setAvatarError(false);
  }, [currentImg]);

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 16px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Account Settings</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>
          Manage your personal details, profile picture, and account security.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Profile Card */}
        <div className="card" style={{ padding: "32px" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <User size={20} color="var(--color-primary)" /> Personal Profile
          </h2>

          {/* Avatar Section */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px" }}>
            <div
              style={{
                position: "relative",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid var(--color-border)",
                backgroundColor: "var(--color-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              {currentImg && !avatarError ? (
                <img
                  src={currentImg}
                  alt="Avatar"
                  onError={() => setAvatarError(true)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : user?.username ? (
                <span style={{ fontSize: "28px", fontWeight: 700, color: "var(--color-primary)" }}>
                  {user.username.trim()[0].toUpperCase()}
                </span>
              ) : (
                <User size={40} color="var(--color-text-muted)" />
              )}
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: "none" }}
              />
              <Button
                id="btn-change-avatar"
                variant="secondary"
                size="sm"
                loading={uploadingImage}
                onClick={() => fileInputRef.current?.click()}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Camera size={14} /> Change Photo
              </Button>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "6px" }}>
                JPG, PNG, or WebP. Maximum 3MB.
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              <Input
                id="profile-username"
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <Input
                id="profile-email"
                label="Email Address"
                type="email"
                value={user?.email || ""}
                disabled
                hint={user?.isVerified ? "✓ Email Verified" : "Email Pending Verification"}
              />

              <Input
                id="profile-phone"
                label="Phone (Egyptian Format)"
                type="tel"
                placeholder="+201234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="profile-gender"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "var(--color-text)"
                  }}
                >
                  Gender
                </label>
                <select
                  id="profile-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    fontSize: "14px",
                    outline: "none"
                  }}
                >
                  <option value="0">Male</option>
                  <option value="1">Female</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
              <Button
                id="btn-save-profile"
                type="submit"
                variant="primary"
                loading={savingProfile}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Save size={16} /> Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Security & 2FA Card */}
        <div className="card" style={{ padding: "32px" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={20} color="var(--color-primary)" /> Security & Two-Step Verification
          </h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: "1.5", marginBottom: "20px" }}>
            Add an extra layer of protection to your account by requiring an OTP sent to your email every time you log in.
          </p>

          <div
            style={{
              padding: "16px 20px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "14px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: user?.twoStepVerification ? "rgba(34, 197, 94, 0.1)" : "rgba(100, 116, 139, 0.1)",
                  color: user?.twoStepVerification ? "var(--color-success)" : "var(--color-text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {user?.twoStepVerification ? <ShieldCheck size={22} /> : <ShieldAlert size={22} />}
              </div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: "600" }}>
                  Two-Step Verification
                </div>
                <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                  {user?.twoStepVerification
                    ? "Active: Your account requires an email OTP on Login."
                    : "Inactive: Protect your account by enabling email OTP."}
                </div>
              </div>
            </div>

            {user?.twoStepVerification ? (
              <Button
                id="btn-disable-2fa"
                variant="ghost"
                size="sm"
                style={{ color: "var(--color-danger)" }}
                loading={twoFaLoading}
                onClick={handleDisable2FA}
              >
                Disable 2FA
              </Button>
            ) : (
              <Button
                id="btn-enable-2fa"
                variant="primary"
                size="sm"
                loading={twoFaLoading}
                onClick={handleEnable2FA}
              >
                Enable 2FA
              </Button>
            )}
          </div>
        </div>

        {/* Sessions & Logout */}
        <div className="card" style={{ padding: "32px" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-danger)" }}>
            <LogOut size={20} /> Sessions & Sign Out
          </h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginBottom: "20px" }}>
            Sign out of this browser or invalidate all active sessions across all devices.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button
              id="btn-logout-device"
              variant="secondary"
              onClick={() => logout(false)}
            >
              Log Out of This Device
            </Button>
            <Button
              id="btn-logout-all"
              variant="danger"
              onClick={() => logout(true)}
            >
              Log Out All Devices
            </Button>
          </div>
        </div>
      </div>

      {/* 2FA Confirmation Modal */}
      <Modal
        isOpen={twoFaModalOpen}
        onClose={() => setTwoFaModalOpen(false)}
        title="Confirm Two-Step Verification"
      >
        <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: "1.5", marginBottom: "16px" }}>
          We sent a 6-digit verification code to <strong>{user?.email}</strong>. Enter it below to activate Two-Step Verification.
        </p>

        <form onSubmit={handleConfirm2FA}>
          <Input
            id="otp-2fa-input"
            label="6-Digit Verification Code"
            type="text"
            placeholder="123456"
            maxLength={6}
            value={twoFaOtp}
            onChange={(e) => setTwoFaOtp(e.target.value.replace(/\D/g, ""))}
            required
            autoFocus
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <Button variant="secondary" onClick={() => setTwoFaModalOpen(false)} disabled={twoFaLoading}>
              Cancel
            </Button>
            <Button id="btn-submit-confirm-2fa" type="submit" variant="primary" loading={twoFaLoading}>
              Verify & Enable
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
