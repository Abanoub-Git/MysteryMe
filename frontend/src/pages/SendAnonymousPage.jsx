import React, { useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  Send,
  Image as ImageIcon,
  X,
  VenetianMask,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import { messageService } from "../services/message.service.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { Button } from "../components/common/Button.jsx";

export const SendAnonymousPage = () => {
  const { receiverId } = useParams();
  const [searchParams] = useSearchParams();
  const receiverName = searchParams.get("name") || "this user";

  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (files.length + selected.length > 3) {
      showError("You can attach at most 3 images");
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

    setFiles((prev) => [...prev, ...validFiles]);
    setFilePreviews((prev) => [...prev, ...validPreviews]);
    e.target.value = "";
  };

  const removeFile = (idx) => {
    URL.revokeObjectURL(filePreviews[idx]);
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setFilePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Please write a message before sending.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await messageService.sendMessage({
        receiverId,
        content: content.trim(),
        attachments: files
      });
      setSentSuccess(true);
      showSuccess("Your secret message has been delivered!");
    } catch (err) {
      setError(err.message || "Failed to send message. Please try again.");
      showError(err.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setContent("");
    setFiles([]);
    setFilePreviews([]);
    setSentSuccess(false);
    setError(null);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "0 16px" }}>
      {sentSuccess ? (
        <div
          className="card"
          style={{
            padding: "48px 32px",
            textAlign: "center",
            background: "linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(224, 90, 71, 0.05) 100%)"
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "rgba(34, 197, 94, 0.12)",
              color: "var(--color-success)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px"
            }}
          >
            <CheckCircle size={36} />
          </div>
          <h1 style={{ fontSize: "24px", marginBottom: "12px" }}>Message Delivered!</h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "15px", lineHeight: "1.6", maxWidth: "440px", margin: "0 auto 28px" }}>
            Your anonymous message was securely sent to <strong>{receiverName}</strong>. They will never know who sent it unless they request your identity and you approve it.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <Button variant="secondary" onClick={handleReset}>
              Send Another Message
            </Button>
            {!isAuthenticated ? (
              <Link to="/signup">
                <Button variant="primary">Create Your MysteryMe Account</Button>
              </Link>
            ) : (
              <Link to="/dashboard">
                <Button variant="primary">Go to Dashboard</Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: "36px 32px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "rgba(224, 90, 71, 0.1)",
                color: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px"
              }}
            >
              <VenetianMask size={28} />
            </div>
            <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
              Send a Secret Message to {receiverName}
            </h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
              Speak your mind anonymously. Your recipient will receive it instantly.
            </p>
          </div>

          {/* Privacy badge */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "13px",
              color: "var(--color-text-secondary)",
              marginBottom: "20px"
            }}
          >
            <ShieldCheck size={18} color="var(--color-success)" style={{ flexShrink: 0 }} />
            <div>
              {isAuthenticated ? (
                <span>
                  You are logged in as <strong>{user?.username}</strong>. Your identity remains strictly secret unless you choose to accept an identity request.
                </span>
              ) : (
                <span>
                  You are sending as an anonymous guest. No account information is attached.
                </span>
              )}
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(220, 38, 38, 0.08)",
                border: "1px solid rgba(220, 38, 38, 0.2)",
                color: "var(--color-danger)",
                fontSize: "14px",
                marginBottom: "20px"
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="anon-message-content"
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "var(--color-text)"
                }}
              >
                Your Message
              </label>
              <textarea
                id="anon-message-content"
                rows={5}
                placeholder={`Write something honest, kind, or fun for ${receiverName}...`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={2000}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  resize: "vertical",
                  lineHeight: "1.5",
                  outline: "none"
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  fontSize: "12px",
                  color: "var(--color-text-muted)",
                  marginTop: "4px"
                }}
              >
                {content.length} / 2000 characters
              </div>
            </div>

            {/* Attachments Section */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "var(--color-text)"
                }}
              >
                <ImageIcon size={16} /> Attach Images (Optional, max 3)
              </label>

              {filePreviews.length > 0 && (
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                  {filePreviews.map((preview, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: "relative",
                        width: "72px",
                        height: "72px",
                        borderRadius: "var(--radius-md)",
                        overflow: "hidden",
                        border: "1px solid var(--color-border)"
                      }}
                    >
                      <img
                        src={preview}
                        alt={`Preview ${idx + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          width: "20px",
                          height: "20px",
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
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {files.length < 3 && (
                <div>
                  <input
                    id="anon-file-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="anon-file-input"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      borderRadius: "var(--radius-md)",
                      border: "1px dashed var(--color-border)",
                      backgroundColor: "var(--color-bg)",
                      fontSize: "13px",
                      color: "var(--color-text-secondary)",
                      cursor: "pointer"
                    }}
                  >
                    <ImageIcon size={16} /> Choose Image
                  </label>
                </div>
              )}
            </div>

            <Button
              id="btn-send-anon-message"
              type="submit"
              variant="primary"
              loading={loading}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              <Send size={16} /> Send Anonymously
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SendAnonymousPage;
