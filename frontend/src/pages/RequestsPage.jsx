import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserCheck,
  Check,
  X,
  MessageSquare,
  Clock,
  Shield,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { requestService } from "../services/request.service.js";
import { useToast } from "../context/ToastContext.jsx";
import { Button } from "../components/common/Button.jsx";
import { Badge } from "../components/common/Badge.jsx";
import { Modal } from "../components/common/Modal.jsx";
import { EmptyState } from "../components/common/EmptyState.jsx";

export const RequestsPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Decision Modal State
  const [decisionModal, setDecisionModal] = useState({
    isOpen: false,
    request: null,
    action: null, // "accepted" | "rejected"
    loading: false
  });
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestService.getReceivedRequests({ page, limit: 10 });
      const data = res?.data;
      const list = data?.docs || (Array.isArray(data) ? data : []);
      setRequests(Array.isArray(list) ? list.filter(Boolean) : []);
      setTotalPages(data?.pages || 1);
      setTotalCount(data?.count || list.length);
    } catch (err) {
      setError(err.message || "Failed to load identity requests");
      showError(err.message || "Failed to load identity requests");
    } finally {
      setLoading(false);
    }
  }, [page, showError]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const openDecisionModal = (req, action) => {
    setDecisionModal({
      isOpen: true,
      request: req,
      action,
      loading: false
    });
  };

  const handleConfirmDecision = async () => {
    const { request, action } = decisionModal;
    if (!request || !action) return;

    setDecisionModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await requestService.updateRequestStatus(request._id, action);
      const updated = res.data;

      if (action === "accepted") {
        showSuccess("Identity revealed! A direct conversation was created.");
      } else {
        showSuccess("Request declined. Your identity remains strictly hidden.");
      }

      // Update state locally
      setRequests((prev) =>
        prev.map((r) =>
          r._id === request._id
            ? {
                ...r,
                status: action,
                conversation: updated?.conversation || r.conversation
              }
            : r
        )
      );

      setDecisionModal({ isOpen: false, request: null, action: null, loading: false });

      // If accepted and conversation created, offer to navigate
      if (action === "accepted" && updated?.conversation?._id) {
        navigate(`/conversations/${updated.conversation._id}`);
      }
    } catch (err) {
      showError(err.message || "Failed to process decision");
      setDecisionModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 16px" , marginTop:"20px"}}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Identity Requests</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "15px" }}>
          Recipients of your messages have requested to know your identity. You decide whether to reveal yourself and start a direct conversation.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: "48px", textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }}></div>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
            Loading identity requests...
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
            <ShieldAlert size={24} />
          </div>
          <h3 style={{ fontSize: "16px", marginBottom: "6px" }}>Failed to Load Requests</h3>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", marginBottom: "16px" }}>
            {error}
          </p>
          <Button variant="primary" size="sm" onClick={() => fetchRequests()}>
            Try Again
          </Button>
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No Identity Requests"
          description="When someone requests your identity for a message you sent, it will appear here for your review."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {requests.map((req) => {
            const isPending = req.status === "pending";
            const isAccepted = req.status === "accepted";
            const isRejected = req.status === "rejected";
            const conversationId = req.conversation?._id || (typeof req.conversation === "string" ? req.conversation : null);

            return (
              <div
                key={req._id}
                className="card"
                style={{
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px"
                }}
              >
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: isAccepted
                          ? "rgba(34, 197, 94, 0.1)"
                          : isRejected
                          ? "rgba(220, 38, 38, 0.1)"
                          : "rgba(217, 119, 6, 0.1)",
                        color: isAccepted
                          ? "var(--color-success)"
                          : isRejected
                          ? "var(--color-danger)"
                          : "var(--color-warning)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "600" }}>
                        Recipient requested your identity
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "12px",
                          color: "var(--color-text-muted)"
                        }}
                      >
                        <Clock size={12} />
                        {new Date(req.createdAt || Date.now()).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })}
                      </div>
                    </div>
                  </div>

                  <Badge variant={isAccepted ? "accepted" : isRejected ? "rejected" : "pending"}>
                    {isAccepted ? "Accepted" : isRejected ? "Declined" : "Pending Decision"}
                  </Badge>
                </div>

                {/* Message ID / Reference */}
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                    fontSize: "13px",
                    color: "var(--color-text-secondary)"
                  }}
                >
                  <span style={{ fontWeight: "600", color: "var(--color-text)" }}>Message Reference: </span>
                  {req.messageId && typeof req.messageId === "object" && req.messageId.content ? (
                    <span>"{req.messageId.content}"</span>
                  ) : (
                    <span>ID: {String((req.messageId && typeof req.messageId === "object" ? req.messageId._id : req.messageId) || "Unknown")}</span>
                  )}
                </div>

                {/* Action Controls */}
                <div
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    paddingTop: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "10px"
                  }}
                >
                  {isPending ? (
                    <>
                      <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                        Do you want to reveal your username and start a chat?
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <Button
                          id={`btn-reject-${req._id}`}
                          variant="ghost"
                          size="sm"
                          style={{ color: "var(--color-danger)" }}
                          onClick={() => openDecisionModal(req, "rejected")}
                        >
                          <X size={16} /> Decline
                        </Button>
                        <Button
                          id={`btn-accept-${req._id}`}
                          variant="primary"
                          size="sm"
                          onClick={() => openDecisionModal(req, "accepted")}
                        >
                          <Check size={16} /> Reveal & Chat
                        </Button>
                      </div>
                    </>
                  ) : isAccepted ? (
                    <>
                      <div style={{ fontSize: "13px", color: "var(--color-success)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Shield size={16} /> Your identity was disclosed to the recipient.
                      </div>
                      {conversationId && (
                        <Link to={`/conversations/${conversationId}`}>
                          <Button size="sm" variant="secondary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <MessageSquare size={14} /> Open Conversation <ExternalLink size={12} />
                          </Button>
                        </Link>
                      )}
                    </>
                  ) : (
                    <div style={{ fontSize: "13px", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <ShieldAlert size={16} /> You declined this request. Your identity remains protected.
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
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

      {/* Confirmation Modal */}
      <Modal
        isOpen={decisionModal.isOpen}
        onClose={() => setDecisionModal({ isOpen: false, request: null, action: null, loading: false })}
        title={decisionModal.action === "accepted" ? "Reveal Identity & Chat" : "Decline Identity Request"}
      >
        <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
          {decisionModal.action === "accepted"
            ? "By accepting this request, the recipient will learn your username and you will both enter a 1-on-1 private conversation. Are you sure you want to proceed?"
            : "If you decline, the recipient will be notified that their request was rejected. Your identity will remain permanently hidden. Are you sure?"}
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
          <Button
            variant="secondary"
            onClick={() => setDecisionModal({ isOpen: false, request: null, action: null, loading: false })}
            disabled={decisionModal.loading}
          >
            Cancel
          </Button>
          <Button
            id="btn-confirm-decision"
            variant={decisionModal.action === "accepted" ? "primary" : "danger"}
            loading={decisionModal.loading}
            onClick={handleConfirmDecision}
          >
            {decisionModal.action === "accepted" ? "Yes, Reveal Identity" : "Yes, Decline"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default RequestsPage;
