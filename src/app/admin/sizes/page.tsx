"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminShimmer from "@/components/admin/ui/AdminShimmer";
import { useAdminTheme } from "@/app/admin/layout";
import {
  AdminSizeItem,
  getAdminSizes,
  addAdminSize,
  updateAdminSize,
  deleteAdminSize,
} from "@/utils/adminStore";
import {
  Plus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  FileText,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Check,
  X,
  RefreshCw,
} from "lucide-react";

export default function AdminSizesPage() {
  const { theme } = useAdminTheme();
  const isDark = theme === "dark";

  // Data state
  const [sizes, setSizes] = useState<AdminSizeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("idNumeric");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Export dropdown
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminSizeItem | null>(null);
  const [sizeName, setSizeName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [, startTransition] = useTransition();

  // Colors based on theme
  const cardBg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#21262D" : "#E5E7EB";
  const textMain = isDark ? "#F0F6FC" : "#1F2937";
  const textMuted = isDark ? "#8B949E" : "#6B7280";
  const inputBg = isDark ? "#161B22" : "#FFFFFF";
  const tableHeaderBg = isDark ? "#161B22" : "#F9FAFB";
  const tableRowHover = isDark ? "#1F242C" : "#F9FAFB";

  const loadData = async () => {
    setLoading(true);
    const data = await getAdminSizes({
      page,
      limit,
      search,
      sortField,
      sortOrder,
    });
    setSizes(data.sizes || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [page, limit, search, sortField, sortOrder]);

  // Close export dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(sizes.map((s) => s._id || s.code));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sizeName.trim()) return;

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const res = await addAdminSize({ name: sizeName.trim() });
      if (res) {
        setShowAddModal(false);
        setSizeName("");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("rn-admin-data-changed"));
        }
        await loadData();
      } else {
        setErrorMessage("Failed to add size. Name may already exist.");
      }
    } catch {
      setErrorMessage("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?._id || !sizeName.trim()) return;

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const res = await updateAdminSize({
        id: editingItem._id,
        name: sizeName.trim(),
      });
      if (res) {
        setShowEditModal(false);
        setEditingItem(null);
        setSizeName("");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("rn-admin-data-changed"));
        }
        await loadData();
      } else {
        setErrorMessage("Failed to update size.");
      }
    } catch {
      setErrorMessage("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete size "${name}"?`)) {
      await deleteAdminSize(id);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("rn-admin-data-changed"));
      }
      await loadData();
    }
  };

  const handleExport = (format: "csv" | "xls") => {
    setExportOpen(false);
    const exportUrl = `/api/sizes/export?format=${format}&search=${encodeURIComponent(search)}`;
    window.open(exportUrl, "_blank");
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#06090E" : "#F4F6F9" }}>
      <AdminHeader title="Sizes Master" />

      <main style={{ padding: "24px 32px", maxWidth: "1600px", margin: "0 auto" }}>
        {/* Breadcrumbs & Title */}
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: textMain, margin: 0 }}>
            Dashboard
          </h1>
          <div style={{ fontSize: "13px", color: textMuted, marginTop: "4px" }}>
            <span>Home</span> / <span style={{ color: "#0077B6", fontWeight: 600 }}>Sizes</span>
          </div>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: cardBg,
            borderRadius: "8px",
            border: `1px solid ${border}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            overflow: "hidden",
          }}
        >
          {/* Top Button Header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: textMain, margin: 0 }}>
              Size Master
            </h2>

            <button
              type="button"
              onClick={() => {
                setSizeName("");
                setErrorMessage("");
                setShowAddModal(true);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#198754",
                color: "#FFFFFF",
                padding: "7px 14px",
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <Plus size={16} />
              <span>Create New Size</span>
            </button>
          </div>

          {/* Search & Export Controls */}
          <div
            style={{
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              borderBottom: `1px solid ${border}`,
            }}
          >
            {/* Export Dropdown Button */}
            <div style={{ position: "relative" }} ref={exportRef}>
              <button
                type="button"
                onClick={() => setExportOpen((prev) => !prev)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: isDark ? "#161B22" : "#F3F4F6",
                  color: textMain,
                  border: `1px solid ${border}`,
                  padding: "7px 12px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
                title="Export Data"
              >
                <FileText size={16} />
                <ChevronDown size={14} />
              </button>

              {exportOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    zIndex: 50,
                    minWidth: "160px",
                    background: cardBg,
                    border: `1px solid ${border}`,
                    borderRadius: "6px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleExport("csv")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "10px 14px",
                      background: "transparent",
                      border: "none",
                      fontSize: "13px",
                      color: textMain,
                      cursor: "pointer",
                      textAlign: "left",
                      borderBottom: `1px solid ${border}`,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = isDark ? "#1F242C" : "#F3F4F6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <FileText size={15} color="#0077B6" />
                    <span>Export to CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExport("xls")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "10px 14px",
                      background: "transparent",
                      border: "none",
                      fontSize: "13px",
                      color: textMain,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = isDark ? "#1F242C" : "#F3F4F6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <FileSpreadsheet size={15} color="#198754" />
                    <span>Export to Excel</span>
                  </button>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div style={{ position: "relative", width: "260px" }}>
              <Search
                size={16}
                color={textMuted}
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{
                  width: "100%",
                  padding: "7px 12px 7px 32px",
                  fontSize: "13px",
                  borderRadius: "4px",
                  border: `1px solid ${border}`,
                  background: inputBg,
                  color: textMain,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr
                  style={{
                    background: tableHeaderBg,
                    borderBottom: `1px solid ${border}`,
                    color: textMuted,
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  <th style={{ padding: "12px 16px", width: "40px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={sizes.length > 0 && selectedIds.length === sizes.length}
                    />
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      userSelect: "none",
                      width: "140px",
                    }}
                    onClick={() => handleSort("idNumeric")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>Id</span>
                      <ArrowUpDown size={13} />
                    </div>
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      userSelect: "none",
                      width: "240px",
                    }}
                    onClick={() => handleSort("createdAt")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>Created at</span>
                      <ArrowUpDown size={13} />
                    </div>
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    onClick={() => handleSort("name")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>Name</span>
                      <ArrowUpDown size={13} />
                    </div>
                  </th>
                  <th style={{ padding: "12px 16px", width: "120px", textAlign: "right" }}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={`shimmer-size-${idx}`} style={{ borderBottom: `1px solid ${border}` }}>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <AdminShimmer width={16} height={16} borderRadius={4} isDark={isDark} />
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <AdminShimmer width={70} height={15} isDark={isDark} />
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <AdminShimmer width={85} height={13} isDark={isDark} />
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <AdminShimmer width={idx % 2 === 0 ? "50%" : "35%"} height={15} isDark={isDark} />
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px", justifyContent: "flex-end" }}>
                          <AdminShimmer width={26} height={26} borderRadius={4} isDark={isDark} />
                          <AdminShimmer width={26} height={26} borderRadius={4} isDark={isDark} />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : sizes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        color: textMuted,
                        fontSize: "14px",
                      }}
                    >
                      No sizes found matching your search.
                    </td>
                  </tr>
                ) : (
                  sizes.map((item) => {
                    const rowId = item._id || item.code;
                    const isSelected = selectedIds.includes(rowId);

                    return (
                      <tr
                        key={rowId}
                        style={{
                          borderBottom: `1px solid ${border}`,
                          fontSize: "13px",
                          color: textMain,
                          background: isSelected
                            ? isDark
                              ? "#1E2A38"
                              : "#EDF5FA"
                            : "transparent",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = tableRowHover;
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(rowId)}
                          />
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem(item);
                              setSizeName(item.name);
                              setErrorMessage("");
                              setShowEditModal(true);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              color: "#0077B6",
                              fontWeight: 700,
                              cursor: "pointer",
                              fontSize: "13px",
                            }}
                          >
                            {item.code || `SZ${item.idNumeric}`}
                          </button>
                        </td>
                        <td style={{ padding: "12px 16px", color: textMuted }}>
                          {formatDate(item.createdAt)}
                        </td>
                        <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                          {item.name}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItem(item);
                                setSizeName(item.name);
                                setErrorMessage("");
                                setShowEditModal(true);
                              }}
                              style={{
                                background: isDark ? "#161B22" : "#F3F4F6",
                                border: `1px solid ${border}`,
                                borderRadius: "4px",
                                padding: "4px 8px",
                                color: "#0077B6",
                                cursor: "pointer",
                              }}
                              title="Edit Size"
                            >
                              <Edit2 size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item._id || "", item.name)}
                              style={{
                                background: isDark ? "#161B22" : "#F3F4F6",
                                border: `1px solid ${border}`,
                                borderRadius: "4px",
                                padding: "4px 8px",
                                color: "#DC2626",
                                cursor: "pointer",
                              }}
                              title="Delete Size"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Controls: Records Per Page + Count + Pagination */}
          <div
            style={{
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "14px",
              borderTop: `1px solid ${border}`,
              background: tableHeaderBg,
              fontSize: "13px",
              color: textMuted,
            }}
          >
            {/* Records per page */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: `1px solid ${border}`,
                  background: inputBg,
                  color: textMain,
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>Records per page</span>
            </div>

            {/* Total Results text */}
            <div>
              Showing {total === 0 ? 0 : (page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, total)} of {total} Results
            </div>

            {/* Pagination buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: `1px solid ${border}`,
                  background: inputBg,
                  color: textMain,
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                  opacity: page <= 1 ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true;
                  if (p === 1 || p === totalPages) return true;
                  if (Math.abs(p - page) <= 2) return true;
                  return false;
                })
                .map((p, idx, arr) => {
                  const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                  return (
                    <div key={p} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      {showEllipsis && <span style={{ padding: "0 4px" }}>...</span>}
                      <button
                        type="button"
                        onClick={() => setPage(p)}
                        style={{
                          minWidth: "28px",
                          height: "28px",
                          padding: "0 6px",
                          borderRadius: "4px",
                          border: `1px solid ${p === page ? "#0077B6" : border}`,
                          background: p === page ? "#0077B6" : inputBg,
                          color: p === page ? "#FFFFFF" : textMain,
                          fontWeight: p === page ? 700 : 500,
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        {p}
                      </button>
                    </div>
                  );
                })}

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: `1px solid ${border}`,
                  background: inputBg,
                  color: textMain,
                  cursor: page >= totalPages ? "not-allowed" : "pointer",
                  opacity: page >= totalPages ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ── Add Modal ── */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              background: cardBg,
              borderRadius: "8px",
              border: `1px solid ${border}`,
              width: "100%",
              maxWidth: "460px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: `1px solid ${border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: textMain, margin: 0 }}>
                Create New Size
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: "none", color: textMuted, cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ padding: "20px" }}>
              {errorMessage && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "#FEE2E2",
                    color: "#B91C1C",
                    borderRadius: "6px",
                    fontSize: "13px",
                    marginBottom: "14px",
                  }}
                >
                  {errorMessage}
                </div>
              )}

              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: textMain,
                    marginBottom: "6px",
                  }}
                >
                  Size Name <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 45*43*139 CM or 8x5.5''"
                  value={sizeName}
                  onChange={(e) => setSizeName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: `1px solid ${border}`,
                    background: inputBg,
                    color: textMain,
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: `1px solid ${border}`,
                    background: isDark ? "#161B22" : "#F3F4F6",
                    color: textMain,
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#198754",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? "Saving..." : "Save Size"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {showEditModal && editingItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              background: cardBg,
              borderRadius: "8px",
              border: `1px solid ${border}`,
              width: "100%",
              maxWidth: "460px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: `1px solid ${border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: textMain, margin: 0 }}>
                Edit Size ({editingItem.code || `SZ${editingItem.idNumeric}`})
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                style={{ background: "none", border: "none", color: textMuted, cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "20px" }}>
              {errorMessage && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "#FEE2E2",
                    color: "#B91C1C",
                    borderRadius: "6px",
                    fontSize: "13px",
                    marginBottom: "14px",
                  }}
                >
                  {errorMessage}
                </div>
              )}

              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: textMain,
                    marginBottom: "6px",
                  }}
                >
                  Size Name <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 45*43*139 CM"
                  value={sizeName}
                  onChange={(e) => setSizeName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: `1px solid ${border}`,
                    background: inputBg,
                    color: textMain,
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: `1px solid ${border}`,
                    background: isDark ? "#161B22" : "#F3F4F6",
                    color: textMain,
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#0077B6",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? "Saving..." : "Update Size"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
