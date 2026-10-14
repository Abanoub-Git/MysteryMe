import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  ArrowRight,
  Search,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { conversationService } from "../services/conversation.service.js";
import { getImageUrl } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { Button } from "../components/common/Button.jsx";
import { Badge } from "../components/common/Badge.jsx";
import { EmptyState } from "../components/common/EmptyState.jsx";
import { Modal } from "../components/common/Modal.jsx";

export const ConversationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError, showSuccess, showInfo } = useToast();

  const [directId, setDirectId] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load active conversations directly from backend API
  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      try {
        const res = await conversationService.getConversations();
        const list = Array.isArray(res.data) ? res.data : (res.data?.docs || []);
        
        const activeList = [];
        const activeIds = new Set();

        list.forEach((c) => {
          if (c?._id) {
            const cidStr = c._id.toString();
            activeIds.add(cidStr);
            const other = c.participants?.find((p) => (p._id || p).toString() !== user?._id?.toString());
            const otherName = other?.username || `${other?.firstName || ""} ${other?.lastName || ""}`.trim() || `User #${cidStr.slice(-6)}`;
            const otherAvatar = getImageUrl(other?.profileImage || other?.image);
            activeList.push({
              _id: cidStr,
              title: `Chat with ${otherName}`,
              avatar: otherAvatar,
              otherName,
              lastActive: c.updatedAt || c.createdAt
            });
          }
        });

        // Prune stale conversations from localStorage so deleted cards never resurface
        try {
          const stored = JSON.parse(localStorage.getItem("mysteryme_recent_conversations") || "[]");
          if (Array.isArray(stored)) {
            const validStored = stored.filter((item) => activeIds.has((item._id || item).toString()));
            localStorage.setItem("mysteryme_recent_conversations", JSON.stringify(validStored));
          }
        } catch (e) {
          console.warn("Could not prune localStorage recent conversations", e);
        }

        setConversations(activeList);
      } catch (err) {
        console.warn("Could not query backend conversations", err);
        showError("Failed to load conversations from server");
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [user]);

  const handleOpenDeleteModal = (conv) => {
    setConversationToDelete(conv);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!conversationToDelete || deleting) return;
    setDeleting(true);
    const convId = conversationToDelete._id;

    try {
      const res = await conversationService.deleteConversation(convId);
      const isAlreadyDeleted = res?.data?.alreadyDeleted || res?.alreadyDeleted;

      if (isAlreadyDeleted) {
        showInfo("Conversation was already deleted");
      } else {
        showSuccess("Conversation and its messages permanently deleted");
      }

      // 1. Remove immediately from current state without refresh
      setConversations((prev) => prev.filter((c) => c._id !== convId));

      // 2. Remove from localStorage cache
      try {
        const stored = JSON.parse(localStorage.getItem("mysteryme_recent_conversations") || "[]");
        if (Array.isArray(stored)) {
          const updated = stored.filter((item) => (item._id || item) !== convId);
          localStorage.setItem("mysteryme_recent_conversations", JSON.stringify(updated));
        }
      } catch (e) {
        console.warn("Could not update local storage after delete", e);
      }

      setDeleteModalOpen(false);
      setConversationToDelete(null);
    } catch (err) {
      // If server returns 404 or indicates already deleted, clean it up gracefully from UI without an error toast
      if (
        err.status === 404 || 
        err.message?.toLowerCase().includes("not found") || 
        err.message?.toLowerCase().includes("invalid conversation id")
      ) {
        setConversations((prev) => prev.filter((c) => c._id !== convId));
        try {
          const stored = JSON.parse(localStorage.getItem("mysteryme_recent_conversations") || "[]");
          if (Array.isArray(stored)) {
            const updated = stored.filter((item) => (item._id || item) !== convId);
            localStorage.setItem("mysteryme_recent_conversations", JSON.stringify(updated));
          }
        } catch {}
        showInfo("Conversation was already deleted");
        setDeleteModalOpen(false);
        setConversationToDelete(null);
        return;
      }
      showError(err.message || "Failed to delete conversation");
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenDirect = (e) => {
    e.preventDefault();
    const cleanId = directId.trim();
    if (!cleanId) return;
    if (cleanId.length !== 24) {
      showError("Conversation ID should be a 24-character hexadecimal identifier");
      return;
    }
    navigate(`/conversations/${cleanId}`);
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 16px" , marginTop:"20px"}}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Conversations</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>
          Private, direct 1-on-1 chats initiated after an identity request is accepted.
        </p>
      </div>

      {/* Direct Open ID Box */}
      <div
        className="card"
        style={{
          padding: "24px",
          marginBottom: "28px",
          background: "linear-gradient(135deg, rgba(224, 90, 71, 0.05) 0%, rgba(217, 119, 6, 0.03) 100%)",
          border: "1px solid rgba(224, 90, 71, 0.15)"
        }}
      >
        <h2 style={{ fontSize: "16px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Search size={18} color="var(--color-primary)" /> Open a Conversation
        </h2>
        <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "16px" }}>
          Have a conversation ID from an accepted request? Enter it here to open the chat room.
        </p>
        <form onSubmit={handleOpenDirect} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            id="input-direct-conv-id"
            type="text"
            placeholder="e.g. 675c9a78120b6e001234abcd"
            value={directId}
            onChange={(e) => setDirectId(e.target.value)}
            style={{
              flex: 1,
              minWidth: "260px",
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              fontSize: "14px",
              fontFamily: "monospace",
              outline: "none"
            }}
          />
          <Button id="btn-open-conversation" type="submit" variant="primary">
            Open Chat <ArrowRight size={16} />
          </Button>
        </form>
      </div>

      {/* Known Conversations List */}
      <div>
        <h2 style={{ fontSize: "18px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <MessageSquare size={20} color="var(--color-primary)" /> Your Recent Conversations
        </h2>

        {loading ? (
          <div style={{ padding: "36px", textAlign: "center" }}>
            <div className="spinner" style={{ margin: "0 auto 12px" }}></div>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
              Loading conversations...
            </p>
          </div>
        ) : conversations.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No Active Conversations"
            description="Conversations are created when an identity request is accepted. Once you reveal your identity or someone reveals theirs, the chat will appear here."
            actionLabel="View Identity Requests"
            onAction={() => navigate("/requests")}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {conversations.map((c) => (
              <div
                key={c._id}
                className="card"
                style={{
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  cursor: "pointer",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease"
                }}
                onClick={() => navigate(`/conversations/${c._id}`)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(224, 90, 71, 0.1)",
                      color: "var(--color-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      flexShrink: 0
                    }}
                  >
                    {c.avatar ? (
                      <img
                        src={c.avatar}
                        alt={c.otherName || "User"}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          if (e.currentTarget.parentElement) {
                            e.currentTarget.parentElement.innerHTML = `<span style="font-weight:600;font-size:16px">${(c.otherName || "U")[0].toUpperCase()}</span>`;
                          }
                        }}
                      />
                    ) : (
                      <MessageSquare size={22} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--color-text)" }}>
                      {c.title || `Conversation #${c._id.slice(-6)}`}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-muted)", fontFamily: "monospace" }}>
                      ID: {c._id}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Badge variant="neutral">Direct Chat</Badge>
                  <Button
                    id={`btn-chat-conv-${c._id}`}
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/conversations/${c._id}`);
                    }}
                  >
                    Chat <ArrowRight size={14} />
                  </Button>
                  <button
                    id={`btn-delete-conv-${c._id}`}
                    title="Delete conversation"
                    type="button"
                    disabled={deleting}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDeleteModal(c);
                    }}
                    style={{
                      background: "none",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-muted)",
                      cursor: deleting ? "not-allowed" : "pointer",
                      padding: "6px 8px",
                      borderRadius: "var(--radius-sm)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      if (!deleting) {
                        e.currentTarget.style.color = "var(--color-danger, #ef4444)";
                        e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
                        e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--color-text-muted)";
                      e.currentTarget.style.borderColor = "var(--color-border)";
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !deleting && setDeleteModalOpen(false)}
        title="Delete Conversation"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--color-danger, #ef4444)" }}>
            <AlertTriangle size={22} />
            <span style={{ fontWeight: 600, fontSize: "15px" }}>Permanent Action</span>
          </div>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: "1.5", margin: 0 }}>
            Are you sure you want to delete this conversation with <strong>{conversationToDelete?.otherName || `Conversation #${conversationToDelete?._id?.slice(-6)}`}</strong>?
          </p>
          <div
            style={{
              padding: "12px 14px",
              backgroundColor: "rgba(239, 68, 68, 0.08)",
              borderRadius: "var(--radius-md)",
              fontSize: "13px",
              color: "var(--color-text-secondary)",
              lineHeight: "1.4"
            }}
          >
            ⚠️ This will <strong>permanently delete the conversation and all its messages</strong> from the database for both participants. This action cannot be reversed.
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              id="btn-confirm-delete-conversation"
              variant="danger"
              loading={deleting}
              onClick={handleConfirmDelete}
            >
              Delete Conversation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ConversationsPage;
