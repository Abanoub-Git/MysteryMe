import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { 
  MessageSquare, 
  Inbox, 
  UserCheck, 
  MessagesSquare, 
  User, 
  LogOut, 
  Menu, 
  X,
  VenetianMask
} from "lucide-react";
import { getImageUrl } from "../../services/api.js";

export function Navbar() {
  const { user, isAuthenticated, loading, logout, unreadCount } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const profileImageUrl = getImageUrl(user?.image || user?.profileImage);

  React.useEffect(() => {
    setAvatarError(false);
  }, [profileImageUrl]);

  return (
    <header style={{
      backgroundColor: "var(--bg-surface)",
      borderBottom: "1px solid var(--border-color)",
      position: "sticky",
      top: 0,
      zIndex: 50,
      boxShadow: "var(--shadow-sm)"
    }}>
      <div className="container" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px"
      }}>
        {/* Brand Logo - Far Left */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          fontWeight: 700,
          fontSize: "1.25rem",
          color: "var(--text-primary)",
          textDecoration: "none"
        }}>
          <div style={{
            width: "34px",
            height: "34px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--accent-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent)",
            border: "1px solid var(--accent-border)"
          }}>
            <VenetianMask  size={20} />
          </div>
          <span>Mystery<span style={{ color: "var(--accent)" }}>Me</span></span>
        </Link>

        {/* Authenticated vs Public Navigation */}
        {loading ? (
          <div style={{ width: "80px", height: "32px" }} />
        ) : isAuthenticated ? (
          <>
            {/* Authenticated Desktop Navigation (Middle) */}
            <nav style={{
              display: "none",
              alignItems: "center",
              gap: "0.5rem"
            }} className="desktop-nav">
              <Link 
                to="/dashboard" 
                className={`btn btn-ghost ${isActive("/dashboard") ? "active-nav" : ""}`}
                style={{ color: isActive("/dashboard") ? "var(--accent)" : "var(--text-secondary)" }}
              >
                Dashboard
              </Link>
              <Link 
                to="/inbox" 
                className={`btn btn-ghost ${isActive("/inbox") ? "active-nav" : ""}`}
                style={{
                  color: isActive("/inbox") ? "var(--accent)" : "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem"
                }}
              >
                <Inbox size={16} />
                <span>Inbox</span>
                {unreadCount > 0 && (
                  <span
                    id="navbar-unread-badge"
                    style={{
                      backgroundColor: "var(--color-danger, #ef4444)",
                      color: "#ffffff",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      borderRadius: "999px",
                      padding: "1px 6px",
                      minWidth: "18px",
                      textAlign: "center",
                      lineHeight: "14px"
                    }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link 
                to="/requests" 
                className={`btn btn-ghost ${isActive("/requests") ? "active-nav" : ""}`}
                style={{ color: isActive("/requests") ? "var(--accent)" : "var(--text-secondary)" }}
              >
                <UserCheck size={16} />
                Requests
              </Link>
              <Link 
                to="/conversations" 
                className={`btn btn-ghost ${isActive("/conversations") ? "active-nav" : ""}`}
                style={{ color: isActive("/conversations") ? "var(--accent)" : "var(--text-secondary)" }}
              >
                <MessagesSquare size={16} />
                Conversations
              </Link>
            </nav>

            {/* Authenticated User Profile & Logout - Far Right */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ display: "none", alignItems: "center", gap: "0.6rem" }} className="desktop-nav">
                <Link
                  to="/profile"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.35rem 0.75rem",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: "var(--bg-subtle)",
                    border: "1px solid var(--border-color)",
                    fontSize: "0.9rem",
                    color: "var(--text-primary)",
                    textDecoration: "none"
                  }}
                >
                  {profileImageUrl && !avatarError ? (
                    <img
                      src={profileImageUrl}
                      alt={user?.username || "Profile"}
                      onError={() => setAvatarError(true)}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        objectFit: "cover"
                      }}
                    />
                  ) : (
                    <div style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      backgroundColor: "var(--accent-subtle)",
                      color: "var(--accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      fontSize: "0.8rem"
                    }}>
                      {user?.username ? user.username[0].toUpperCase() : <User size={16} />}
                    </div>
                  )}
                  <span style={{ fontWeight: 500 }}>{user?.username || "Account"}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="btn btn-ghost btn-sm"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    color: "var(--text-muted)"
                  }}
                  title="Sign out"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="mobile-toggle"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-primary)",
                  padding: "0.4rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </>
        ) : (
          /* Public Desktop Navigation - Log In and Sign Up aligned on Far Right */
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ display: "none", alignItems: "center", gap: "0.75rem" }} className="desktop-nav">
              <Link to="/login" className="btn btn-ghost">Log In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>

            {/* Mobile Menu Button for unauthenticated */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-toggle"
              style={{
                background: "none",
                border: "none",
                color: "var(--text-primary)",
                padding: "0.4rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-color)",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem"
        }}>
          {isAuthenticated ? (
            <>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.5rem 0",
                borderBottom: "1px solid var(--border-color)",
                marginBottom: "0.25rem"
              }}>
                {profileImageUrl && !avatarError ? (
                  <img
                    src={profileImageUrl}
                    alt={user?.username || "Profile"}
                    onError={() => setAvatarError(true)}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      objectFit: "cover"
                    }}
                  />
                ) : (
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "var(--accent-subtle)",
                    color: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600
                  }}>
                    {user?.username ? user.username[0].toUpperCase() : <User size={18} />}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{user?.username || "Account"}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{user?.email}</div>
                </div>
              </div>

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`btn ${isActive("/dashboard") ? "btn-secondary" : "btn-ghost"}`}
                style={{ justifyContent: "flex-start" }}
              >
                Dashboard
              </Link>
              <Link
                to="/inbox"
                onClick={() => setMobileMenuOpen(false)}
                className={`btn ${isActive("/inbox") ? "btn-secondary" : "btn-ghost"}`}
                style={{ justifyContent: "space-between", alignItems: "center" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Inbox size={18} />
                  <span>Inbox</span>
                </div>
                {unreadCount > 0 && (
                  <span
                    style={{
                      backgroundColor: "var(--color-danger, #ef4444)",
                      color: "#ffffff",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      borderRadius: "999px",
                      padding: "2px 8px"
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link
                to="/requests"
                onClick={() => setMobileMenuOpen(false)}
                className={`btn ${isActive("/requests") ? "btn-secondary" : "btn-ghost"}`}
                style={{ justifyContent: "flex-start", gap: "0.5rem" }}
              >
                <UserCheck size={18} />
                Identity Requests
              </Link>
              <Link
                to="/conversations"
                onClick={() => setMobileMenuOpen(false)}
                className={`btn ${isActive("/conversations") ? "btn-secondary" : "btn-ghost"}`}
                style={{ justifyContent: "flex-start", gap: "0.5rem" }}
              >
                <MessagesSquare size={18} />
                Conversations
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`btn ${isActive("/profile") ? "btn-secondary" : "btn-ghost"}`}
                style={{ justifyContent: "flex-start", gap: "0.5rem" }}
              >
                <User size={18} />
                Account Settings
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="btn btn-ghost"
                style={{ justifyContent: "flex-start", gap: "0.5rem", color: "var(--color-danger)" }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ justifyContent: "center" }}
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ justifyContent: "center" }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Embedded CSS for responsive navbar queries */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
        .active-nav {
          background-color: var(--accent-subtle) !important;
          color: var(--accent) !important;
          font-weight: 600 !important;
        }
      `}</style>
    </header>
  );
}

export default Navbar;
