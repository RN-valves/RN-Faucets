"use client";

import React from "react";

export type AdminButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "icon";

export type AdminButtonSize = "sm" | "md" | "lg";

interface AdminButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  icon?: React.ReactNode;
  isDark?: boolean;
}

export default function AdminButton({
  children,
  variant = "primary",
  size = "md",
  icon,
  isDark = false,
  disabled,
  style,
  className,
  ...props
}: AdminButtonProps) {
  let bg = "#0077B6";
  let color = "#FFFFFF";
  let border = "1px solid transparent";

  switch (variant) {
    case "primary":
      bg = "#0077B6";
      color = "#FFFFFF";
      border = "1px solid transparent";
      break;
    case "secondary":
      bg = isDark ? "#21262D" : "#E5E7EB";
      color = isDark ? "#F0F6FC" : "#111827";
      border = isDark ? "1px solid #30363D" : "1px solid #D1D5DB";
      break;
    case "outline":
      bg = "transparent";
      color = isDark ? "#58A6FF" : "#0077B6";
      border = isDark ? "1px solid #30363D" : "1px solid #0077B6";
      break;
    case "ghost":
      bg = "transparent";
      color = isDark ? "#C9D1D9" : "#4B5563";
      border = "1px solid transparent";
      break;
    case "danger":
      bg = "#DC2626";
      color = "#FFFFFF";
      border = "1px solid transparent";
      break;
    case "icon":
      bg = isDark ? "#161B22" : "#F3F4F6";
      color = isDark ? "#C9D1D9" : "#4B5563";
      border = isDark ? "1px solid #30363D" : "1px solid #E5E7EB";
      break;
  }

  let height = "36px";
  let padding = "0 14px";
  let fontSize = "13px";

  if (size === "sm") {
    height = "30px";
    padding = "0 10px";
    fontSize = "12px";
  } else if (size === "lg") {
    height = "42px";
    padding = "0 18px";
    fontSize = "14px";
  }

  if (variant === "icon") {
    padding = "0";
    height = size === "sm" ? "28px" : size === "lg" ? "40px" : "34px";
  }

  return (
    <button
      {...props}
      className={className}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        height: variant === "icon" ? height : height,
        width: variant === "icon" ? height : "auto",
        padding: padding,
        borderRadius: "8px",
        fontSize: fontSize,
        fontWeight: 600,
        fontFamily: "'Manrope', system-ui, sans-serif",
        background: disabled ? (isDark ? "#21262D" : "#E5E7EB") : bg,
        color: disabled ? (isDark ? "#6E7681" : "#9CA3AF") : color,
        border: border,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s ease",
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
