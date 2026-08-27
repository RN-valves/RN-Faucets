"use client";

import React from "react";

export type StatusVariant =
  | "success"
  | "pending"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

interface AdminStatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  isDark?: boolean;
}

export default function AdminStatusBadge({
  status,
  variant,
  isDark = false,
}: AdminStatusBadgeProps) {
  // Infer variant automatically if not provided
  let computedVariant: StatusVariant = variant || "neutral";

  if (!variant) {
    const s = status.toLowerCase();
    if (s.includes("approved") || s.includes("delivered") || s.includes("active") || s.includes("paid")) {
      computedVariant = "success";
    } else if (s.includes("pending") || s.includes("processing") || s.includes("unpaid")) {
      computedVariant = "pending";
    } else if (s.includes("shipped") || s.includes("lead") || s.includes("new")) {
      computedVariant = "info";
    } else if (s.includes("cancelled") || s.includes("rejected") || s.includes("inactive")) {
      computedVariant = "danger";
    }
  }

  let bg = "#F3F4F6";
  let color = "#374151";
  let border = "#D1D5DB";

  switch (computedVariant) {
    case "success":
      bg = isDark ? "rgba(35, 134, 54, 0.15)" : "#D1FAE5";
      color = isDark ? "#3FB950" : "#065F46";
      border = isDark ? "rgba(63, 185, 80, 0.3)" : "#A7F3D0";
      break;
    case "pending":
    case "warning":
      bg = isDark ? "rgba(210, 153, 34, 0.15)" : "#FEF3C7";
      color = isDark ? "#D29922" : "#92400E";
      border = isDark ? "rgba(210, 153, 34, 0.3)" : "#FDE68A";
      break;
    case "info":
      bg = isDark ? "rgba(56, 139, 253, 0.15)" : "#E0F2FE";
      color = isDark ? "#58A6FF" : "#0369A1";
      border = isDark ? "rgba(88, 166, 255, 0.3)" : "#BAE6FD";
      break;
    case "danger":
      bg = isDark ? "rgba(248, 81, 73, 0.15)" : "#FEE2E2";
      color = isDark ? "#F85149" : "#991B1B";
      border = isDark ? "rgba(248, 81, 73, 0.3)" : "#FECACA";
      break;
    case "neutral":
    default:
      bg = isDark ? "#21262D" : "#F3F4F6";
      color = isDark ? "#C9D1D9" : "#374151";
      border = isDark ? "#30363D" : "#E5E7EB";
      break;
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 9px",
        borderRadius: "6px",
        fontSize: "11.5px",
        fontWeight: 700,
        background: bg,
        color: color,
        border: `1px solid ${border}`,
        whiteSpace: "nowrap",
        fontFamily: "'Manrope', system-ui, sans-serif",
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: color,
        }}
      />
      {status}
    </span>
  );
}
