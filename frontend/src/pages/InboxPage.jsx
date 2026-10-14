import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Inbox,
  Send,
  Trash2,
  UserCheck,
  Clock,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MessageSquare
} from "lucide-react";
import { messageService } from "../services/message.service.js";
import { requestService } from "../services/request.service.js";
import { getImageUrl } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { Button } from "../components/common/Button.jsx";
import { Badge } from "../components/common/Badge.jsx";
import { Modal } from "../components/common/Modal.jsx";
import { EmptyState } from "../components/common/EmptyState.jsx";

export const InboxPage = () => {
  const { user, refreshUnreadCount, setUnreadCount } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [activeTab, setActiveTab] = useState("0"); // "0": received, "1": sent
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Identity requests map keyed by messageId
  const [requestStatusMap, setRequestStatusMap] = useState({});
  const [requestingMap, setRequestingMap] = useState({});

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Selected image modal for attachment preview
  const [selectedImage, setSelectedImage] = useState(null);

  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [msgRes, reqRes] = await Promise.allSettled([
        messageService.getInbox({ type: activeTab, page, limit: 10 }),
        requestService.getSentRequests({ page: 1, limit: 50 })
      ]);

      if (msgRes.status === "fulfilled") {
        const data = msgRes.value?.data;
        const list = data?.docs || (Array.isArray(data) ? data : []);
        // Strictly ensure only anonymous messages (without conversationId) appear in the Inbox
        const anonymousList = Array.isArray(list) ? list.filter((m) => m && !m.conversationId) : [];
        setMessages(anonymousList);
        setTotalPages(data?.pages || 1);
        setTotalCount(data?.count || anonymousList.length);
        if (typeof data?.unreadCount === "number" && setUnreadCount) {
          setUnreadCount(data.unreadCount);
        }
      } else {
        throw msgRes.reason;
      }

      if (reqRes.status === "fulfilled") {
        const reqDocs = reqRes.value?.data?.docs || (Array.isArray(reqRes.value?.data) ? reqRes.value?.data : []);
        const map = {};
        reqDocs.forEach((r) => {
          const mId = r.messageId?._id || r.messageId;
          if (mId) map[mId] = r;
        });
        setRequestStatusMap(map);
      }
    } catch (err) {
      setError(err.message || "Failed to load messages");
      showError(err.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, showError, setUnreadCount]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleTabChange = (newTab) => {
    if (newTab !== activeTab) {
      setActiveTab(newTab);
      setPage(1);
    }
  };

  const handleMarkAsRead = async (msgId) => {
    try {
      await messageService.markAsRead(msgId);
      setMessages((prev) =>
        prev.map((m) => (m._id === msgId ? { ...m, isRead: true } : m))
      );
      if (setUnreadCount) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      // silently ignore mark error
    }
  };

  const handleRequestIdentity = async (msg) => {
    setRequestingMap((prev) => ({ ...prev, [msg._id]: true }));
    try {
      const res = await requestService.createRequest({ messageId: msg._id });
      showSuccess("Identity requested! The sender has been notified.");
      setRequestStatusMap((prev) => ({
        ...prev,
        [msg._id]: { status: "pending", _id: res.data?._id }
      }));
    } catch (err) {
      const msgLower = (err.message || "").toLowerCase();
      if (msgLower.includes("unregistered") || msgLower.includes("anonymous")) {
        showInfo("This message was sent completely anonymously without an account. Identity cannot be requested.");
      } else if (msgLower.includes("already exists")) {
        showInfo("An identity request for this message is already pending or processed.");
        setRequestStatusMap((prev) => ({
          ...prev,
          [msg._id]: { status: "pending" }
        }));
      } else {
        showError(err.message || "Failed to request sender identity");
      }
    } finally {
      setRequestingMap((prev) => ({ ...prev, [msg._id]: false }));
    }
  };

  const confirmDelete = (msg) => {
    setMessageToDelete(msg);
    setDeleteModalOpen(true);
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;
    setDeleting(true);
    try {
      await messageService.deleteMessage(messageToDelete._id);
      showSuccess("Message deleted successfully");
      setMessages((prev) => prev.filter((m) => m._id !== messageToDelete._id));
      setDeleteModalOpen(false);
      setMessageToDelete(null);
    } catch (err) {
      showError(err.message || "Failed to delete message");
    } finally {
      setDeleting(false);
    }
  };

  const getAttachmentUrl = (path) => {
    return getImageUrl(path) || "";
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 16px" , marginTop:"20px"}}>
      {/* Header & Tabs */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Inbox</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>
          Read anonymous messages sent to you or review messages you previously sent.
        </p>

        {/* Tab Buttons */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            borderBottom: "1px solid var(--color-border)",
            marginTop: "20px",
            paddingBottom: "1px"
          }}
        >
          <button
            id="tab-received-messages"
            onClick={() => handleTabChange("0")}
            style={{
              padding: "10px 18px",
              fontSize: "14px",
              fontWeight: "600",
              background: "none",
              border: "none",
              borderBottom: activeTab === "0" ? "2px solid var(--color-primary)" : "2px solid transparent",
              color: activeTab === "0" ? "var(--color-primary)" : "var(--color-text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.15s ease"
            }}
          >
            <Inbox size={18} /> Received Messages
          </button>

          <button
            id="tab-sent-messages"
            onClick={() => handleTabChange("1")}
            style={{
              padding: "10px 18px",
              fontSize: "14px",
              fontWeight: "600",
              background: "none",
              border: "none",
              borderBottom: activeTab === "1" ? "2px solid var(--color-primary)" : "2px solid transparent",
              color: activeTab === "1" ? "var(--color-primary)" : "var(--color-text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.15s ease"
            }}
          >
            <Send size={18} /> Sent Messages
          </button>
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div style={{ padding: "48px", textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }}></div>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
            Loading your messages...
          </p>
        </div>
      ) : error ? (
        <div className="card" style={{ padding: "36px 24px", textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "rgba(220, 38, 38, 0.1)",
              color: "var(--color-danger)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px"
            }}
          >
            <AlertCircle size={24} />
          </div>
          <h3 style={{ fontSize: "16px", marginBottom: "6px" }}>Failed to Load Messages</h3>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginBottom: "16px" }}>
            {error}
          </p>
          <Button variant="primary" size="sm" onClick={() => fetchMessages()}>
            Try Again
          </Button>
        </div>
      ) : messages.length === 0 ? (
        <EmptyState
          icon={activeTab === "0" ? Inbox : Send}
          title={activeTab === "0" ? "Your inbox is empty" : "No sent messages"}
          description={
            activeTab === "0"
              ? "When people send you anonymous messages, they will show up here."
              : "Messages you send to other users will be listed here."
          }
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {messages.map((msg) => {
            const reqStatus = requestStatusMap[msg._id];
            const isRequesting = requestingMap[msg._id];
            const hasAttachments = Array.isArray(msg.attachments) && msg.attachments.length > 0;

            return (
              <div
                key={msg._id}
                className="card"
                onClick={() => {
                  if (activeTab === "0" && msg.isRead === false) {
                    handleMarkAsRead(msg._id);
                  }
                }}
                style={{
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  borderLeft: activeTab === "0" && msg.isRead === false ? "4px solid var(--color-primary)" : undefined,
                  backgroundColor: activeTab === "0" && msg.isRead === false ? "rgba(224, 90, 71, 0.03)" : undefined
                }}
              >
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {/* <Badge variant="neutral">
                      {activeTab === "0" ? "Anonymous Sender" : "To User"}
                    </Badge> */}
                    {activeTab === "0" && msg.isRead === false && (
                      <span
                        style={{
                          backgroundColor: "#ff6f6fff",
                          color: "#000000ff",
                          fontSize: "11px",
                          fontWeight: "700",
                          borderRadius: "4px",
                          padding: "2px 6px",
                          letterSpacing: "0.05em"
                        }}
                      >
                        NEW
                      </span>
                    )}
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        color: "var(--color-text-muted)"
                      }}
                    >
                      <Clock size={12} />
                      {new Date(msg.createdAt || Date.now()).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short"
                      })}
                    </span>
                  </div>

                  {/* Actions: Mark read & Delete */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {activeTab === "0" && msg.isRead === false && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(msg._id);
                        }}
                        style={{
                          background: "none",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-sm)",
                          padding: "3px 8px",
                          fontSize: "11px",
                          color: "var(--color-text-secondary)",
                          cursor: "pointer"
                        }}
                      >
                        Mark read
                      </button>
                    )}
                    {activeTab === "0" && (
                      <button
                        title="Delete message"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(msg);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--color-text-muted)",
                          cursor: "pointer",
                          padding: "6px",
                          borderRadius: "var(--radius-sm)",
                          display: "flex",
                          alignItems: "center",
                          transition: "color 0.15s ease"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-danger)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <p
                  style={{
                    fontSize: "15px",
                    lineHeight: "1.6",
                    color: "var(--color-text)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    margin: 0
                  }}
                >
                  {msg.content}
                </p>

                {/* Attachments Preview */}
                {hasAttachments && (
                  <div style={{ marginTop: "6px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-text-secondary)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <ImageIcon size={14} /> Attachments ({msg.attachments.length})
                    </div>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {msg.attachments.map((att, idx) => {
                        const imgUrl = getAttachmentUrl(att);
                        return (
                          <div
                            key={idx}
                            style={{
                              position: "relative",
                              width: "80px",
                              height: "80px",
                              borderRadius: "var(--radius-md)",
                              overflow: "hidden",
                              border: "1px solid var(--color-border)",
                              cursor: "pointer",
                              backgroundColor: "var(--color-bg)"
                            }}
                            onClick={() => setSelectedImage(imgUrl)}
                          >
                            <img
                              src={imgUrl}
                              alt={`Attachment ${idx + 1}`}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.parentElement.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:11px;color:gray;">Attachment</div>`;
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Request Identity Bar (Only for Received tab) */}
                {activeTab === "0" && (
                  <div
                    style={{
                      borderTop: "1px solid var(--color-border)",
                      paddingTop: "12px",
                      marginTop: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "10px"
                    }}
                  >
                    <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                      {reqStatus?.status === "accepted"
                        ? `Identity Revealed: ${reqStatus.sender?.username || "Original Sender"}`
                        : "Curious who sent this?"}
                    </div>

                    {reqStatus ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Badge variant={reqStatus.status === "accepted" ? "accepted" : reqStatus.status === "rejected" ? "rejected" : "pending"}>
                          {reqStatus.status === "accepted"
                            ? "Identity Accepted"
                            : reqStatus.status === "rejected"
                            ? "Identity Declined"
                            : "Identity Request Pending"}
                        </Badge>
                        {reqStatus.status === "accepted" && reqStatus.conversation && (
                          <Link to={`/conversations/${reqStatus.conversation._id || reqStatus.conversation}`}>
                            <Button size="sm" variant="primary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <MessageSquare size={14} /> Open Chat
                            </Button>
                          </Link>
                        )}
                      </div>
                    ) : (
                      <Button
                        id={`btn-request-identity-${msg._id}`}
                        variant="secondary"
                        size="sm"
                        loading={isRequesting}
                        onClick={() => handleRequestIdentity(msg)}
                        style={{ display: "flex", alignItems: "center", gap: "6px" }}
                      >
                        <UserCheck size={14} /> Request Sender Identity
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                marginTop: "20px"
              }}
            >
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} /> Prev
              </Button>
              <span style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Anonymous Message"
      >
        <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: "1.5" }}>
          Are you sure you want to permanently delete this message? This action cannot be reversed.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button id="btn-confirm-delete" variant="danger" loading={deleting} onClick={handleDeleteMessage}>
            Delete Message
          </Button>
        </div>
      </Modal>

      {/* Attachment Image Preview Modal */}
      {selectedImage && (
        <Modal
          isOpen={Boolean(selectedImage)}
          onClose={() => setSelectedImage(null)}
          title="Attachment Preview"
          maxWidth="680px"
        >
          <div style={{ textAlign: "center", padding: "10px" }}>
            <img
              src={selectedImage}
              alt="Attachment Full View"
              style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: "var(--radius-md)", objectFit: "contain" }}
            />
            <div style={{ marginTop: "16px", display: "flex", justifyContent: "center" }}>
              <a
                href={selectedImage}
                target="_blank"
                rel="noreferrer"
                download
                style={{
                  fontSize: "13px",
                  color: "var(--color-primary)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  textDecoration: "none"
                }}
              >
                Open original image <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InboxPage;
