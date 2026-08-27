"use client";

import React from "react";
import { Search } from "lucide-react";

interface AdminInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isDark?: boolean;
  isSearch?: boolean;
}

export default function AdminInput({
  label,
  error,
  isDark = false,
  isSearch = false,
  style,
  className,
  ...props
}: AdminInputProps) {
  const bg = isDark ? "#161B22" : "#FFFFFF";
  const border = error
    ? "1px solid #EF4444"
    : isDark
    ? "1px solid #30363D"
    : "1px solid #E5E7EB";
  const color = isDark ? "#F0F6FC" : "#111827";
  const labelColor = isDark ? "#8B949E" : "#4B5563";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", width: "100%" }}>
      {label && (
        <label
          style={{
            fontSize: "12.5px",
            fontWeight: 600,
            color: labelColor,
            fontFamily: "'Manrope', system-ui, sans-serif",
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: "relative", width: "100%" }}>
        {isSearch && (
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: isDark ? "#8B949E" : "#9CA3AF",
              pointerEvents: "none",
            }}
          />
        )}

        <input
          {...props}
          style={{
            width: "100%",
            height: "38px",
            borderRadius: "8px",
            border: border,
            background: bg,
            color: color,
            paddingLeft: isSearch ? "36px" : "12px",
            paddingRight: "12px",
            fontSize: "13.5px",
            fontFamily: "'Manrope', system-ui, sans-serif",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s ease",
            ...style,
          }}
        />
      </div>

      {error && (
        <span style={{ fontSize: "11.5px", color: "#EF4444", fontWeight: 500 }}>
          {error}
        </span>
      )}
    </div>
  );
}
