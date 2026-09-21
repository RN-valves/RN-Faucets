"use client";

import React from "react";
import AdminEmptyState from "./AdminEmptyState";
import AdminShimmer from "./AdminShimmer";

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  align?: "left" | "center" | "right";
  width?: string;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  loading?: boolean;
  emptyState?: React.ReactNode;
  isDark?: boolean;
}

export default function AdminDataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyState,
  isDark = false,
}: AdminDataTableProps<T>) {
  const bg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#21262D" : "#E5E7EB";
  const headerBg = isDark ? "#161B22" : "#F9FAFB";
  const textMain = isDark ? "#F0F6FC" : "#111827";
  const textMuted = isDark ? "#8B949E" : "#6B7280";

  return (
    <div
      style={{
        width: "100%",
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "12px",
        overflow: "hidden",
        boxSizing: "border-box",
        fontFamily: "'Manrope', system-ui, sans-serif",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "13.5px",
          }}
        >
          <thead>
            <tr
              style={{
                background: headerBg,
                borderBottom: `1px solid ${border}`,
                color: textMuted,
              }}
            >
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: "12px 16px",
                    fontWeight: 700,
                    fontSize: "12px",
                    letterSpacing: "0.02em",
                    textAlign: col.align || "left",
                    width: col.width || "auto",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, rowIdx) => (
                <tr
                  key={`shimmer-row-${rowIdx}`}
                  style={{
                    borderBottom: `1px solid ${border}`,
                    background: bg,
                  }}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={`shimmer-col-${colIdx}`}
                      style={{
                        padding: "14px 16px",
                        textAlign: col.align || "left",
                        width: col.width || "auto",
                      }}
                    >
                      <AdminShimmer
                        width={
                          colIdx === 0
                            ? "45%"
                            : colIdx === columns.length - 1
                            ? "70%"
                            : colIdx % 2 === 0
                            ? "60%"
                            : "85%"
                        }
                        height={18}
                        borderRadius={5}
                        isDark={isDark}
                        style={col.align === "right" ? { marginLeft: "auto" } : undefined}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  {emptyState || <AdminEmptyState isDark={isDark} />}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={keyExtractor(row, rowIdx)}
                  style={{
                    borderBottom: `1px solid ${border}`,
                    color: textMain,
                    transition: "background 0.15s ease",
                  }}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      style={{
                        padding: "14px 16px",
                        textAlign: col.align || "left",
                        verticalAlign: "middle",
                      }}
                    >
                      {typeof col.accessor === "function"
                        ? col.accessor(row)
                        : col.accessor
                        ? (row[col.accessor] as unknown as React.ReactNode)
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
