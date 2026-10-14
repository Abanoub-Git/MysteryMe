import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Inbox,
  UserCheck,
  MessageSquare,
  Copy,
  Check,
  Share2,
  ExternalLink,
  ShieldCheck,
  Clock,
  VenetianMask,
  ArrowRight,
  Send
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { messageService } from "../services/message.service.js";
import { requestService } from "../services/request.service.js";
import { Button } from "../components/common/Button.jsx";
import { Badge } from "../components/common/Badge.jsx";
import { EmptyState } from "../components/common/EmptyState.jsx";

export const DashboardPage = () => {
  const { user, unreadCount, setUnreadCount } = useAuth();
  const { showSuccess, showError } = useToast();

  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Compute public share link for anonymous messages using canonical public origin or current browser origin
  const baseAppUrl = (import.meta.env.VITE_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "");
  const shareUrl = user?._id
    ? `${baseAppUrl}/send/${user._id}?name=${encodeURIComponent(user.username || "User")}`
    : "";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [messagesRes, requestsRes] = await Promise.allSettled([
          messageService.getInbox({ type: 0 }),
          requestService.getReceivedRequests()
        ]);

        if (messagesRes.status === "fulfilled") {
          const data = messagesRes.value?.data;
          const list = data?.docs || data?.messages || (Array.isArray(data) ? data : []);
          // Strictly ensure only anonymous messages appear on dashboard
          const anonymousList = Array.isArray(list) ? list.filter((m) => m && !m.conversationId) : [];
          setMessages(anonymousList);
          if (typeof data?.unreadCount === "number" && setUnreadCount) {
            setUnreadCount(data.unreadCount);
          }
        }

        if (requestsRes.status === "fulfilled") {
          const list = requestsRes.value?.data?.docs || requestsRes.value?.data?.requests || (Array.isArray(requestsRes.value?.data) ? requestsRes.value?.data : []);
          setRequests(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const el = document.createElement("textarea");
        el.value = shareUrl;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      showSuccess("Shareable profile link copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      showError("Could not copy link automatically. Please copy it manually.");
    }
  };

  const pendingRequestsCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 16px", marginTop:"20px" }}>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, rgba(224, 90, 71, 0.08) 0%, rgba(217, 119, 6, 0.05) 100%)",
          border: "1px solid rgba(224, 90, 71, 0.15)",
          padding: "32px",
          marginBottom: "32px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px"
        }}
      >
        <div style={{ maxWidth: "540px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <VenetianMask size={20} color="var(--color-primary)" />
            <span style={{ fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-primary)" }}>
              Welcome Back
            </span>
          </div>
          <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>
            Hello, {user?.username || "Mystery Explorer"}
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "15px", lineHeight: "1.5" }}>
            Share your secret link with friends, colleagues, or followers to receive genuine, anonymous feedback and mysterious messages.
          </p>
        </div>

        {/* Share Link Box */}
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            padding: "16px 20px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-sm)",
            width: "100%",
            maxWidth: "380px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
              <Share2 size={14} /> Your Anonymous Link
            </span>
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: "12px", color: "var(--color-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
            >
              Preview <ExternalLink size={12} />
            </a>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              readOnly
              value={shareUrl}
              style={{
                fontSize: "13px",
                padding: "8px 10px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-secondary)",
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            />
            <Button
              id="btn-copy-dashboard-link"
              variant={copied ? "secondary" : "primary"}
              size="sm"
              onClick={handleCopyLink}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "32px"
        }}
      >
        <Link to="/inbox" style={{ textDecoration: "none", color: "inherit" }}>
          <div
            className="card"
            style={{
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              cursor: "pointer"
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(224, 90, 71, 0.1)",
                color: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Inbox size={24} />
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>{loading ? "..." : messages.length}</span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      fontSize: "12px",
                      backgroundColor: "var(--color-danger, #ef4444)",
                      color: "#fff",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      fontWeight: "600"
                    }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
                Received Messages
              </div>
            </div>
          </div>
        </Link>

        <Link to="/requests" style={{ textDecoration: "none", color: "inherit" }}>
          <div
            className="card"
            style={{
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              cursor: "pointer"
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(217, 119, 6, 0.1)",
                color: "var(--color-warning)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <UserCheck size={24} />
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: "700" }}>
                {loading ? "..." : pendingRequestsCount}
              </div>
              <div style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
                Pending Identity Requests
              </div>
            </div>
          </div>
        </Link>

        <Link to="/conversations" style={{ textDecoration: "none", color: "inherit" }}>
          <div
            className="card"
            style={{
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              cursor: "pointer"
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                color: "var(--color-success)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <MessageSquare size={24} />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", marginTop: "2px" }}>
                Chat Direct
              </div>
              <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                Open Conversations
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Content Sections */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {/* Recent Messages */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Inbox size={20} color="var(--color-primary)" /> Recent Messages
            </h2>
            <Link to="/inbox" style={{ fontSize: "13px", color: "var(--color-primary)", textDecoration: "none", fontWeight: "500", display: "flex", alignItems: "center", gap: "4px" }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: "32px", textAlign: "center" }}>
              <div className="spinner" style={{ margin: "0 auto 12px" }}></div>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No messages yet"
              description="Share your link above with others to start receiving anonymous messages."
              actionLabel="Copy My Link"
              onAction={handleCopyLink}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {messages.slice(0, 3).map((msg) => (
                <div
                  key={msg._id}
                  style={{
                    padding: "16px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--color-bg)",
                    border: "1px solid var(--color-border)"
                  }}
                >
                  <p style={{ fontSize: "14px", lineHeight: "1.5", marginBottom: "10px", wordBreak: "break-word" }}>
                    {msg.content}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "var(--color-text-muted)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} /> {new Date(msg.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                    <Link
                      to="/inbox"
                      style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: "500" }}
                    >
                      View in Inbox
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Identity Requests Summary & Quick Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Identity Requests Alert Card */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                <UserCheck size={20} color="var(--color-warning)" /> Identity Requests
              </h2>
              <Link to="/requests" style={{ fontSize: "13px", color: "var(--color-primary)", textDecoration: "none", fontWeight: "500", display: "flex", alignItems: "center", gap: "4px" }}>
                Manage <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div style={{ padding: "24px", textAlign: "center" }}>
                <div className="spinner" style={{ margin: "0 auto" }}></div>
              </div>
            ) : pendingRequestsCount > 0 ? (
              <div
                style={{
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "rgba(217, 119, 6, 0.08)",
                  border: "1px solid rgba(217, 119, 6, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ fontWeight: "600", fontSize: "14px", color: "var(--color-text)" }}>
                    {pendingRequestsCount} Pending Request{pendingRequestsCount > 1 ? "s" : ""}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                    Recipients want to know if you sent them a message.
                  </div>
                </div>
                <Link to="/requests">
                  <Button size="sm" variant="primary">Review</Button>
                </Link>
              </div>
            ) : (
              <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", margin: 0 }}>
                No pending identity requests at the moment. When a recipient asks who sent a message, it will show up here.
              </p>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="card" style={{ padding: "24px" }}>
            <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>Quick Actions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link to="/inbox" style={{ textDecoration: "none" }}>
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: "var(--color-text)",
                    backgroundColor: "var(--color-bg)",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Inbox size={16} color="var(--color-primary)" /> Read Anonymous Messages
                  </span>
                  <ArrowRight size={14} color="var(--color-text-muted)" />
                </div>
              </Link>

              <Link to="/requests" style={{ textDecoration: "none" }}>
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: "var(--color-text)",
                    backgroundColor: "var(--color-bg)",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <UserCheck size={16} color="var(--color-warning)" /> Identity Requests Inbox
                  </span>
                  <ArrowRight size={14} color="var(--color-text-muted)" />
                </div>
              </Link>

              <Link to="/profile" style={{ textDecoration: "none" }}>
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: "var(--color-text)",
                    backgroundColor: "var(--color-bg)",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <ShieldCheck size={16} color="var(--color-success)" /> Account & Security Settings
                  </span>
                  <ArrowRight size={14} color="var(--color-text-muted)" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
