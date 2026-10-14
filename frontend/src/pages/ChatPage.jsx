import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Send,
  Image as ImageIcon,
  X,
  ArrowLeft,
  RotateCw,
  ShieldAlert,
  Clock,
  User,
  ExternalLink,
  MessageSquare,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { conversationService } from "../services/conversation.service.js";
import { getImageUrl } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { Button } from "../components/common/Button.jsx";
import { Modal } from "../components/common/Modal.jsx";

const ChatAttachmentItem = ({ att, isMe, onSelect }) => {
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const imgUrl = getImageUrl(att);

  if (!imgUrl || loadError) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 12px",
          borderRadius: "8px",
          backgroundColor: isMe ? "rgba(0, 0, 0, 0.15)" : "rgba(0, 0, 0, 0.05)",
          border: isMe ? "1px dashed rgba(255, 255, 255, 0.4)" : "1px dashed #cbd5e1",
          fontSize: "12px",
          color: isMe ? "#ffffff" : "var(--color-text-secondary, #64748b)"
        }}
      >
        <ImageIcon size={16} />
        <span>Attachment unavailable</span>
        {imgUrl && (
          <a
            href={imgUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              color: isMe ? "#ffffff" : "var(--color-primary, #e05a47)",
              textDecoration: "underline",
              display: "flex",
              alignItems: "center",
              gap: "2px",
              marginLeft: "4px"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            Open <ExternalLink size={10} />
          </a>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        maxWidth: "240px",
        maxHeight: "200px",
        minWidth: "80px",
        minHeight: "80px",
        borderRadius: "8px",
        overflow: "hidden",
        cursor: "pointer",
        border: isMe ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid #e2e8f0",
        backgroundColor: isMe ? "rgba(0,0,0,0.12)" : "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2px"
      }}
      onClick={() => onSelect(imgUrl)}
      title="Click to view full size"
    >
      {loading && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="spinner" style={{ width: "18px", height: "18px" }} />
        </div>
      )}
      <img
        src={imgUrl}
        alt="Attachment"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setLoadError(true);
        }}
        style={{
          maxWidth: "100%",
          maxHeight: "200px",
          width: "auto",
          height: "auto",
          objectFit: "contain",
          display: loading ? "none" : "block",
          borderRadius: "6px"
        }}
      />
    </div>
  );
};

export const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null); // 403, 404, or general error message

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteConversation = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await conversationService.deleteConversation(conversationId);
      const isAlreadyDeleted = res?.data?.alreadyDeleted || res?.alreadyDeleted;
      if (isAlreadyDeleted) {
        showInfo("Conversation was already deleted");
      } else {
        showSuccess("Conversation permanently deleted");
      }
      try {
        const stored = JSON.parse(localStorage.getItem("mysteryme_recent_conversations") || "[]");
        const filtered = stored.filter((c) => (c._id || c) !== conversationId);
        localStorage.setItem("mysteryme_recent_conversations", JSON.stringify(filtered));
      } catch {}
      navigate("/conversations");
    } catch (err) {
      if (
        err.status === 404 || 
        err.message?.toLowerCase().includes("not found") || 
        err.message?.toLowerCase().includes("invalid conversation id")
      ) {
        try {
          const stored = JSON.parse(localStorage.getItem("mysteryme_recent_conversations") || "[]");
          const filtered = stored.filter((c) => (c._id || c) !== conversationId);
          localStorage.setItem("mysteryme_recent_conversations", JSON.stringify(filtered));
        } catch {}
        showInfo("Conversation was already deleted");
        navigate("/conversations");
        return;
      }
      showError(err.message || "Failed to delete conversation");
      setDeleting(false);
    }
  };

  // Composer state
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [sending, setSending] = useState(false);

  // Attachment image modal
  const [selectedImage, setSelectedImage] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await conversationService.getMessages(conversationId);
      const list = res.data?.messages || res.data?.docs || (Array.isArray(res.data) ? res.data : []);
      // Sort chronologically (oldest first)
      const sorted = [...list].sort(
        (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      );
      setMessages(sorted);
      setErrorStatus(null);

      // Cache this conversation in recent list
      try {
        const stored = JSON.parse(localStorage.getItem("mysteryme_recent_conversations") || "[]");
        const filtered = stored.filter((c) => c._id !== conversationId);
        filtered.unshift({
          _id: conversationId,
          title: `Conversation #${conversationId.slice(-6)}`,
          lastActive: new Date().toISOString()
        });
        localStorage.setItem("mysteryme_recent_conversations", JSON.stringify(filtered.slice(0, 20)));
      } catch (e) {
        // ignore storage errors
      }
    } catch (err) {
      if (err.status === 403 || (err.message && err.message.toLowerCase().includes("forbidden"))) {
        setErrorStatus(403);
      } else if (err.status === 404 || (err.message && err.message.toLowerCase().includes("not found"))) {
        setErrorStatus(404);
        try {
          const stored = JSON.parse(localStorage.getItem("mysteryme_recent_conversations") || "[]");
          const filtered = stored.filter((c) => (c._id || c) !== conversationId);
          localStorage.setItem("mysteryme_recent_conversations", JSON.stringify(filtered));
        } catch {}
      } else {
        setErrorStatus(err.message || "Failed to load conversation");
      }
    } finally {
      if (!silent) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [conversationId]);

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchMessages(false);
  }, [fetchMessages]);

  // Periodic polling every 5 seconds for new incoming messages
  useEffect(() => {
    if (errorStatus) return;
    const interval = setInterval(() => {
      fetchMessages(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages, errorStatus]);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (attachments.length + selected.length > 3) {
      showError("Maximum 3 attachments allowed per message");
      return;
    }

    const validFiles = [];
    const validPreviews = [];

    for (const f of selected) {
      if (!f.type.startsWith("image/")) {
        showError(`${f.name} is not an image`);
        continue;
      }
      if (f.size > 5 * 1024 * 1024) {
        showError(`${f.name} exceeds 5MB size limit`);
        continue;
      }
      validFiles.push(f);
      validPreviews.push(URL.createObjectURL(f));
    }

    setAttachments((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...validPreviews]);
    e.target.value = "";
  };

  const removeAttachment = (idx) => {
    URL.revokeObjectURL(previews[idx]);
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!content.trim() && attachments.length === 0) return;

    setSending(true);
    try {
      const res = await conversationService.sendMessage(conversationId, {
        content: content.trim(),
        attachments
      });

      const newMsg = res.data;
      if (newMsg) {
        setMessages((prev) => [...prev, newMsg]);
      } else {
        // Re-fetch to get complete object
        await fetchMessages(true);
      }

      setContent("");
      setAttachments([]);
      setPreviews([]);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      showError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const getAttachmentUrl = (path) => {
    return getImageUrl(path) || "";
  };

  if (errorStatus === 403) {
    return (
      <div style={{ maxWidth: "560px", margin: "60px auto", padding: "0 16px", textAlign: "center" }}>
        <div className="card" style={{ padding: "40px 24px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "rgba(220, 38, 38, 0.1)",
              color: "var(--color-danger)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px"
            }}
          >
            <ShieldAlert size={32} />
          </div>
          <h2 style={{ fontSize: "22px", marginBottom: "8px" }}>Access Restricted (403)</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
            You are not a participant in this conversation. In MysteryMe, only the original message sender and the recipient who accepted the identity request can view and send messages.
          </p>
          <Link to="/conversations">
            <Button variant="primary">Back to Conversations</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (errorStatus === 404) {
    return (
      <div style={{ maxWidth: "560px", margin: "60px auto", padding: "0 16px", textAlign: "center" }}>
        <div className="card" style={{ padding: "40px 24px" }}>
          <h2 style={{ fontSize: "22px", marginBottom: "8px" }}>Conversation Not Found (404)</h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
            This conversation does not exist or has an invalid identifier.
          </p>
          <Link to="/conversations">
            <Button variant="primary">Back to Conversations</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 16px" }}>
      {/* Top Header Card */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link to="/conversations" style={{ color: "var(--color-text-secondary)", display: "flex" }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div style={{ fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
              <MessageSquare size={18} color="var(--color-primary)" />
              Direct Conversation
            </div>
            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", fontFamily: "monospace" }}>
              ID: {conversationId}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchMessages(false)}
            disabled={refreshing}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <RotateCw size={14} className={refreshing ? "spinner" : ""} />
            {refreshing ? "Updating..." : "Refresh"}
          </Button>

          <Button
            id="btn-delete-chat-conversation"
            variant="ghost"
            size="sm"
            onClick={() => setDeleteModalOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--color-danger, #ef4444)"
            }}
          >
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        className="card"
        style={{
          padding: "20px",
          minHeight: "420px",
          maxHeight: "580px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          marginBottom: "16px",
          backgroundColor: "var(--color-bg)"
        }}
      >
        {loading ? (
          <div style={{ margin: "auto", textAlign: "center" }}>
            <div className="spinner" style={{ margin: "0 auto 12px" }}></div>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ margin: "auto", textAlign: "center", maxWidth: "340px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "rgba(224, 90, 71, 0.1)",
                color: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px"
              }}
            >
              <MessageSquare size={24} />
            </div>
            <h3 style={{ fontSize: "16px", marginBottom: "6px" }}>No messages yet</h3>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
              The conversation has been opened. Break the ice by sending the first message!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const senderObj = typeof msg.senderId === "object" ? msg.senderId : null;
            const senderId = senderObj?._id || msg.senderId;
            const isMe = String(senderId) === String(user?._id);
            const senderName = isMe
              ? "You"
              : senderObj?.username || (senderObj?.firstName ? `${senderObj.firstName} ${senderObj.lastName || ""}`.trim() : "Participant");
            const senderAvatar = !isMe && senderObj ? getImageUrl(senderObj.profileImage || senderObj.image) : null;
            const hasAttachments = Array.isArray(msg.attachments) && msg.attachments.length > 0;

            return (
              <div
                key={msg._id || index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMe ? "flex-end" : "flex-start",
                  maxWidth: "100%",
                  marginBottom: "4px"
                }}
              >
                {/* Sender label & time */}
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--color-text-muted)",
                    marginBottom: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    paddingLeft: isMe ? "0" : "38px"
                  }}
                >
                  <span style={{ fontWeight: "600", color: isMe ? "var(--color-primary)" : "var(--color-text)" }}>
                    {senderName}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>

                {/* Message Row with Avatar for other participant */}
                <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", maxWidth: "85%" }}>
                  {!isMe && (
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(224, 90, 71, 0.1)",
                        color: "var(--color-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: "12px",
                        overflow: "hidden",
                        flexShrink: 0,
                        border: "1px solid var(--color-border)"
                      }}
                    >
                      {senderAvatar ? (
                        <img
                          src={senderAvatar}
                          alt={senderName}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            if (e.currentTarget.parentElement) {
                              e.currentTarget.parentElement.innerText = (senderName || "P")[0].toUpperCase();
                            }
                          }}
                        />
                      ) : (
                        (senderName || "P")[0].toUpperCase()
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      backgroundColor: isMe ? "var(--color-primary, #e05a47)" : "#f1f5f9",
                      color: isMe ? "#ffffff" : "#0f172a",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                      border: isMe ? "none" : "1px solid #e2e8f0",
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                      fontSize: "14px",
                      lineHeight: "1.5"
                    }}
                  >
                    {msg.content}

                    {/* Attachments within bubble */}
                    {hasAttachments && (
                      <div style={{ marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {msg.attachments.map((att, idx) => (
                          <ChatAttachmentItem
                            key={idx}
                            att={att}
                            isMe={isMe}
                            onSelect={(url) => setSelectedImage(url)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer Card */}
      <div className="card" style={{ padding: "16px 20px" }}>
        {previews.length > 0 && (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
            {previews.map((prev, idx) => (
              <div
                key={idx}
                style={{
                  position: "relative",
                  width: "60px",
                  height: "60px",
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  border: "1px solid var(--color-border)"
                }}
              >
                <img src={prev} alt="Upload preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button
                  type="button"
                  onClick={() => removeAttachment(idx)}
                  style={{
                    position: "absolute",
                    top: "2px",
                    right: "2px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSendMessage} style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
          {attachments.length < 3 && (
            <>
              <input
                id="chat-file-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <label
                htmlFor="chat-file-input"
                style={{
                  padding: "10px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                title="Attach images (up to 3)"
              >
                <ImageIcon size={20} />
              </label>
            </>
          )}

          <textarea
            id="chat-message-input"
            rows={2}
            placeholder="Type your message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            disabled={sending}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              fontSize: "14px",
              fontFamily: "inherit",
              resize: "none",
              outline: "none"
            }}
          />

          <Button
            id="btn-send-chat-message"
            type="submit"
            variant="primary"
            loading={sending}
            disabled={!content.trim() && attachments.length === 0}
            style={{ height: "42px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Send size={16} /> Send
          </Button>
        </form>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <Modal isOpen={Boolean(selectedImage)} onClose={() => setSelectedImage(null)} title="Attachment View">
          <div style={{ textAlign: "center", padding: "10px" }}>
            <img
              src={selectedImage}
              alt="Attachment"
              style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: "var(--radius-md)", objectFit: "contain" }}
            />
            <div style={{ marginTop: "14px" }}>
              <a
                href={selectedImage}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: "13px", color: "var(--color-primary)", display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                Open in new tab <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </Modal>
      )}

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
            Are you sure you want to permanently delete this entire conversation and all of its messages?
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
            ⚠️ This will <strong>permanently delete all messages</strong> in this chat from the database for both participants. This action cannot be reversed.
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
              id="btn-confirm-delete-chat-conversation"
              variant="danger"
              loading={deleting}
              onClick={handleDeleteConversation}
            >
              Delete Conversation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChatPage;
