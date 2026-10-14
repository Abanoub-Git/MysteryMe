import React from "react";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

export function Badge({ status, variant = "neutral", children }) {
  const normStatus = String(status || variant || "neutral").toLowerCase();

  let icon = null;
  let badgeClass = "badge-neutral";

  if (normStatus === "pending") {
    icon = <Clock size={12} />;
    badgeClass = "badge-pending";
  } else if (normStatus === "accepted") {
    icon = <CheckCircle2 size={12} />;
    badgeClass = "badge-accepted";
  } else if (normStatus === "rejected") {
    icon = <XCircle size={12} />;
    badgeClass = "badge-rejected";
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {icon}
      <span>{children || status || variant}</span>
    </span>
  );
}

export default Badge;
