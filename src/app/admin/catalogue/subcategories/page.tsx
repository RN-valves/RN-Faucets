"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminShimmer from "@/components/admin/ui/AdminShimmer";
import {
  getAdminSubcategories,
  deleteAdminSubcategory,
  getAdminCategories,
  deleteFileFromR2,
  updateAdminSubcategory,
} from "@/utils/adminStore";
import { AdminSubcategory, AdminCategory } from "@/types/admin";
import { useAdminTheme } from "@/app/admin/layout";
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  Image as ImageIcon,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  FileText,
  Check,
  Loader2,
  ArrowUpDown,
} from "lucide-react";

export default function SubcategoriesListingPage() {
  const { theme, toggleTheme } = useAdminTheme();

  const [subcategories, setSubcategories] = useState<AdminSubcategory[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter, Sort & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [visibilityFilter, setVisibilityFilter] = useState<"All" | "Visible" | "Hidden">("All");
  const [sortBy, setSortBy] = useState<"displayOrder" | "name" | "category" | "status">("displayOrder");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [updatingOrderIds, setUpdatingOrderIds] = useState<Record<string, "saving" | "saved">>({});

  const isDark = theme === "dark";

  const cardBg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#21262D" : "#E5E7EB";
  const textMain = isDark ? "#F0F6FC" : "#111827";
  const textMuted = isDark ? "#8B949E" : "#6B7280";
  const inputBg = isDark ? "#161B22" : "#F9FAFB";
  const tableHeaderBg = isDark ? "#161B22" : "#F9FAFB";
  const shadow = isDark ? "none" : "0 2px 10px rgba(0, 0, 0, 0.04)";

  const loadData = async () => {
    setLoading(true);
    try {
      const [subs, cats] = await Promise.all([getAdminSubcategories(), getAdminCategories()]);
      setSubcategories(subs);
      setCategories(cats);
    } catch (err) {
      console.error("Failed to load subcategories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateDisplayOrder = async (id: string, newOrder: number) => {
    setUpdatingOrderIds((prev) => ({ ...prev, [id]: "saving" }));
    try {
      // Optimistic local update
      setSubcategories((prev) =>
        prev.map((s) => (s.id === id ? { ...s, displayOrder: newOrder } : s))
      );
      await updateAdminSubcategory(id, { displayOrder: newOrder });
      setUpdatingOrderIds((prev) => ({ ...prev, [id]: "saved" }));
      setTimeout(() => {
        setUpdatingOrderIds((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }, 2000);
    } catch (err) {
      console.error("Failed to update display order:", err);
      loadData();
    }
  };

  const handleToggleStatus = async (id: string) => {
    const target = subcategories.find((s) => s.id === id);
    if (!target) return;
    const newStatus = target.status === "Active" ? "Inactive" : "Active";
    await updateAdminSubcategory(id, { status: newStatus });
    await loadData();
  };

  const handleToggleVisibility = async (id: string) => {
    const target = subcategories.find((s) => s.id === id);
    if (!target) return;
    const nextVis = !target.isVisibleWebsite;
    await updateAdminSubcategory(id, { isVisibleWebsite: nextVis });
    await loadData();
  };

  const handleDeleteSub = async (id: string, slug: string) => {
    if (confirm(`Are you sure you want to delete subcategory "${slug}"?`)) {
      deleteFileFromR2(`website/catalogue/subcategories/${id}/image.webp`);
      await deleteAdminSubcategory(id);
      await loadData();
    }
  };

  // Filter Subcategories
  const filteredSubcategories = subcategories.filter((sub) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      sub.name.toLowerCase().includes(q) ||
      sub.slug.toLowerCase().includes(q) ||
      (sub.categoryName && sub.categoryName.toLowerCase().includes(q));

    const matchesCat = categoryFilter === "All" || sub.categoryId === categoryFilter;
    const matchesStatus = statusFilter === "All" || sub.status === statusFilter;
    const matchesVis =
      visibilityFilter === "All" ||
      (visibilityFilter === "Visible" ? sub.isVisibleWebsite !== false : sub.isVisibleWebsite === false);

    return matchesQuery && matchesCat && matchesStatus && matchesVis;
  });

  // Sort Subcategories
  filteredSubcategories.sort((a, b) => {
    if (sortBy === "displayOrder") {
      const orderA = a.displayOrder && a.displayOrder > 0 ? a.displayOrder : 999999;
      const orderB = b.displayOrder && b.displayOrder > 0 ? b.displayOrder : 999999;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "category") return (a.categoryName || "").localeCompare(b.categoryName || "");
    if (sortBy === "status") return (a.status || "").localeCompare(b.status || "");
    return 0;
  });

  const totalRecords = filteredSubcategories.length;
  const totalPages = Math.ceil(totalRecords / perPage) || 1;
  const paginatedSubcategories = filteredSubcategories.slice((page - 1) * perPage, page * perPage);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title="RN Subcategory Master"
        subtitle="Manage product range subcategories, parent category associations, SEO fields, and R2 media assets."
        onRefresh={loadData}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Top Action Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: textMain }}>
              Total Subcategories: <span style={{ color: "#0077B6" }}>{subcategories.length}</span>
            </span>
          </div>

          <Link
            href="/admin/catalogue/subcategories/create"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: "#059669",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "14px",
              textDecoration: "none",
            }}
          >
            <Plus size={18} />
            Create New Subcategory
          </Link>
        </div>

        {/* Filter Bar */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", boxShadow: shadow }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: inputBg, border: `1px solid ${border}`, borderRadius: "8px", padding: "8px 14px", flex: 1, minWidth: "260px" }}>
            <Search size={16} style={{ color: textMuted }} />
            <input
              type="text"
              placeholder="Search by subcategory name, slug, or parent category..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              style={{ border: "none", background: "transparent", color: textMain, width: "100%", outline: "none", fontSize: "14px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Sort By Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ArrowUpDown size={14} style={{ color: textMuted }} />
              <label style={{ fontSize: "12px", color: textMuted, fontWeight: 700 }}>Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                style={{ padding: "8px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain, fontSize: "13px", fontWeight: 700 }}
              >
                <option value="displayOrder">Display Order (Rank #1, #2...)</option>
                <option value="name">Name (A-Z)</option>
                <option value="category">Parent Category</option>
                <option value="status">Status</option>
              </select>
            </div>

            {/* Parent Category Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label style={{ fontSize: "12px", color: textMuted, fontWeight: 700 }}>Parent Category:</label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                style={{ padding: "8px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain, fontSize: "13px", fontWeight: 700 }}
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label style={{ fontSize: "12px", color: textMuted, fontWeight: 700 }}>Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as typeof statusFilter);
                  setPage(1);
                }}
                style={{ padding: "8px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain, fontSize: "13px", fontWeight: 700 }}
              >
                <option value="All">All Status</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
            </div>

            {/* Visibility Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label style={{ fontSize: "12px", color: textMuted, fontWeight: 700 }}>Visibility:</label>
              <select
                value={visibilityFilter}
                onChange={(e) => {
                  setVisibilityFilter(e.target.value as typeof visibilityFilter);
                  setPage(1);
                }}
                style={{ padding: "8px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain, fontSize: "13px", fontWeight: 700 }}
              >
                <option value="All">All Visibility</option>
                <option value="Visible">Visible Web</option>
                <option value="Hidden">Hidden Web</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subcategories Table List */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", overflow: "hidden", boxShadow: shadow }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: tableHeaderBg, borderBottom: `1px solid ${border}`, color: textMuted }}>
                <th style={{ padding: "14px 20px" }}>SUB ID / Media</th>
                <th style={{ padding: "14px 20px" }}>Subcategory Name & Slug</th>
                <th style={{ padding: "14px 20px" }}>Parent Category</th>
                <th style={{ padding: "14px 20px" }}>Display Order</th>
                <th style={{ padding: "14px 20px" }}>Catalogue PDF</th>
                <th style={{ padding: "14px 20px" }}>Status</th>
                <th style={{ padding: "14px 20px" }}>Visibility</th>
                <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={`shimmer-sub-${idx}`} style={{ borderBottom: `1px solid ${border}` }}>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <AdminShimmer width={44} height={44} borderRadius={8} isDark={isDark} />
                        <AdminShimmer width={65} height={14} isDark={isDark} />
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <AdminShimmer width={idx % 2 === 0 ? "70%" : "85%"} height={15} isDark={isDark} />
                        <AdminShimmer width="45%" height={11} isDark={isDark} />
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <AdminShimmer width={100} height={14} isDark={isDark} />
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <AdminShimmer width={30} height={14} isDark={isDark} />
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <AdminShimmer width={60} height={20} borderRadius={4} isDark={isDark} />
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <AdminShimmer width={70} height={24} borderRadius={12} isDark={isDark} />
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <AdminShimmer width={70} height={24} borderRadius={12} isDark={isDark} />
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px", justifyContent: "flex-end" }}>
                        <AdminShimmer width={28} height={28} borderRadius={6} isDark={isDark} />
                        <AdminShimmer width={28} height={28} borderRadius={6} isDark={isDark} />
                        <AdminShimmer width={28} height={28} borderRadius={6} isDark={isDark} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : paginatedSubcategories.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: textMuted }}>
                    No subcategories found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedSubcategories.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: `1px solid ${border}` }}>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {sub.image ? (
                          <img
                            src={sub.image}
                            alt={sub.name}
                            style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover", border: `1px solid ${border}` }}
                          />
                        ) : (
                          <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: inputBg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}>
                            <ImageIcon size={18} />
                          </div>
                        )}

                        <div>
                          <Link
                            href={`/admin/catalogue/subcategories/${sub.slug}`}
                            style={{ color: "#0077B6", fontWeight: 800, textDecoration: "none", fontSize: "13px" }}
                          >
                            SUB{sub.id.slice(-6).toUpperCase()}
                          </Link>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "14px 20px" }}>
                      <Link
                        href={`/admin/catalogue/subcategories/${sub.slug}`}
                        style={{ fontWeight: 800, color: textMain, fontSize: "15px", textDecoration: "none" }}
                      >
                        {sub.name}
                      </Link>
                      <div style={{ fontSize: "12px", color: "#0077B6", fontFamily: "monospace" }}>/{sub.slug}</div>
                    </td>

                    <td style={{ padding: "14px 20px", color: "#0077B6", fontWeight: 700 }}>
                      {sub.categoryName || sub.categoryId}
                    </td>

                    {/* Inline Editable Display Order */}
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <input
                          type="number"
                          min="0"
                          defaultValue={sub.displayOrder || 0}
                          key={`${sub.id}-${sub.displayOrder}`}
                          onBlur={(e) => {
                            const val = Number(e.target.value);
                            if (val !== (sub.displayOrder || 0)) {
                              handleUpdateDisplayOrder(sub.id, val);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          title="Set rank (1 for Top, 2 for 2nd place...). Press Enter or click away to save."
                          style={{
                            width: "56px",
                            padding: "4px 6px",
                            borderRadius: "6px",
                            border: `1.5px solid ${sub.displayOrder && sub.displayOrder > 0 ? "#0077B6" : border}`,
                            background: inputBg,
                            color: textMain,
                            fontWeight: 800,
                            fontSize: "13px",
                            textAlign: "center",
                            outline: "none",
                            transition: "all 0.15s ease",
                          }}
                        />

                        {updatingOrderIds[sub.id] === "saving" && (
                          <span title="Saving..." style={{ color: "#0077B6" }}>
                            <Loader2 size={14} className="animate-spin inline" />
                          </span>
                        )}

                        {updatingOrderIds[sub.id] === "saved" && (
                          <span title="Saved successfully" style={{ color: "#059669", display: "inline-flex", alignItems: "center" }}>
                            <Check size={14} />
                          </span>
                        )}

                        {sub.displayOrder && sub.displayOrder > 0 && !updatingOrderIds[sub.id] ? (
                          <span style={{ fontSize: "10px", fontWeight: 800, color: "#0077B6", background: isDark ? "#0077B625" : "#E0F2FE", padding: "2px 6px", borderRadius: "4px" }}>
                            #{sub.displayOrder}
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td style={{ padding: "14px 20px" }}>
                      {sub.pdfCatalogue ? (
                        <a
                          href={sub.pdfCatalogue}
                          target="_blank" rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#0077B6", fontSize: "12px", fontWeight: 700, textDecoration: "none" }}
                        >
                          <FileText size={14} /> PDF
                        </a>
                      ) : (
                        <span style={{ fontSize: "12px", color: textMuted }}>N/A</span>
                      )}
                    </td>

                    <td style={{ padding: "14px 20px" }}>
                      <button
                        onClick={() => handleToggleStatus(sub.id)}
                        style={{
                          background: sub.status === "Active" ? "#0596691A" : "#DC26261A",
                          color: sub.status === "Active" ? "#059669" : "#DC2626",
                          border: "none",
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        {sub.status}
                      </button>
                    </td>

                    <td style={{ padding: "14px 20px" }}>
                      <button
                        onClick={() => handleToggleVisibility(sub.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          background: sub.isVisibleWebsite !== false ? "#0077B61A" : "#6B72801A",
                          color: sub.isVisibleWebsite !== false ? "#0077B6" : textMuted,
                          border: "none",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {sub.isVisibleWebsite !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                        {sub.isVisibleWebsite !== false ? "Visible" : "Hidden"}
                      </button>
                    </td>

                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", alignItems: "center" }}>
                        <Link
                          href={`/admin/catalogue/subcategories/${sub.slug}`}
                          style={{ color: "#6B7280", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                          title="View Subcategory Details"
                        >
                          <Eye size={16} />
                        </Link>

                        <Link
                          href={`/admin/catalogue/subcategories/${sub.slug}/edit`}
                          style={{ color: "#0077B6", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                          title="Edit Subcategory"
                        >
                          <Edit2 size={16} />
                        </Link>

                        <button
                          onClick={() => handleDeleteSub(sub.id, sub.slug)}
                          style={{ background: "transparent", border: "none", color: "#DC2626", cursor: "pointer", padding: 0 }}
                          title="Delete Subcategory"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Bar */}
          <div style={{ padding: "16px 20px", borderTop: `1px solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: textMuted }}>
              Showing {paginatedSubcategories.length} of {totalRecords} subcategories (Page {page} of {totalPages})
            </span>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{ padding: "6px 12px", borderRadius: "6px", border: `1px solid ${border}`, background: inputBg, color: textMain, cursor: page === 1 ? "not-allowed" : "pointer" }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{ padding: "6px 12px", borderRadius: "6px", border: `1px solid ${border}`, background: inputBg, color: textMain, cursor: page >= totalPages ? "not-allowed" : "pointer" }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
