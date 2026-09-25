"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminShimmer from "@/components/admin/ui/AdminShimmer";
import {
  getAdminCategories,
  deleteAdminCategory,
  getAdminSubcategories,
  addAdminSubcategory,
  deleteAdminSubcategory,
  deleteFileFromR2,
  updateAdminCategory,
} from "@/utils/adminStore";
import { AdminCategory, AdminSubcategory } from "@/types/admin";
import { useAdminTheme } from "@/app/admin/layout";
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Sparkles,
  FileText,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function AdminCategoriesListingPage() {
  const { theme, toggleTheme } = useAdminTheme();
  const searchParams = useSearchParams();
  const isSubcategoryTab = searchParams.get("tab") === "subcategories";

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [subcategories, setSubcategories] = useState<AdminSubcategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [visibilityFilter, setVisibilityFilter] = useState<"All" | "Visible" | "Hidden">("All");
  const [sortBy, setSortBy] = useState<"displayOrder" | "createdAt" | "name" | "discount" | "tax">("displayOrder");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Subcategory Modal State
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [subCategoryId, setSubCategoryId] = useState("");
  const [subName, setSubName] = useState("");
  const [subDisplayOrder, setSubDisplayOrder] = useState(0);

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
      const [cats, subs] = await Promise.all([getAdminCategories(), getAdminSubcategories()]);
      setCategories(cats);
      setSubcategories(subs);
      if (cats.length > 0 && !subCategoryId) {
        setSubCategoryId(cats[0].id);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSeedDummy = async () => {
    try {
      const res = await fetch("/api/categories/seed");
      if (res.ok) {
        await loadData();
        alert("Successfully seeded 4 realistic dummy Categories!");
      }
    } catch {
      alert("Failed to seed dummy categories.");
    }
  };

  const handleUpdateDisplayOrder = async (id: string, newOrder: number) => {
    await updateAdminCategory(id, { displayOrder: newOrder });
    await loadData();
  };

  const handleToggleStatus = async (id: string) => {
    const target = categories.find((c) => c.id === id);
    if (!target) return;
    const newStatus = target.status === "Active" ? "Inactive" : "Active";
    await updateAdminCategory(id, { status: newStatus });
    await loadData();
  };

  const handleToggleVisibility = async (id: string) => {
    const target = categories.find((c) => c.id === id);
    if (!target) return;
    const nextVis = !target.isVisibleWebsite;
    await updateAdminCategory(id, { isVisibleWebsite: nextVis });
    await loadData();
  };

  const handleDeleteCat = async (id: string, slug: string) => {
    if (confirm(`Are you sure you want to delete category "${slug}"?`)) {
      deleteFileFromR2(`website/catalogue/categories/${id}/image.webp`);
      await deleteAdminCategory(id);
      await loadData();
    }
  };

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || !subCategoryId) return;

    const parentCat = categories.find((c) => c.id === subCategoryId);

    await addAdminSubcategory({
      categoryId: subCategoryId,
      categoryName: parentCat?.name || "",
      name: subName.trim(),
      slug: subName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      displayOrder: Number(subDisplayOrder),
      status: "Active",
      isVisibleWebsite: true,
    });

    setShowAddSubModal(false);
    setSubName("");
    setSubDisplayOrder(0);
    await loadData();
  };

  const handleDeleteSub = async (id: string) => {
    if (confirm("Delete this Subcategory?")) {
      await deleteAdminSubcategory(id);
      await loadData();
    }
  };

  // Advanced Filtering, Searching & Sorting
  const filteredCategories = categories
    .filter((cat) => {
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !q ||
        cat.name.toLowerCase().includes(q) ||
        cat.slug.toLowerCase().includes(q) ||
        (cat.title && cat.title.toLowerCase().includes(q)) ||
        (cat.keywords && cat.keywords.toLowerCase().includes(q));

      const matchesStatus = statusFilter === "All" || cat.status === statusFilter;
      const matchesVis =
        visibilityFilter === "All" ||
        (visibilityFilter === "Visible" ? cat.isVisibleWebsite !== false : cat.isVisibleWebsite === false);

      return matchesQuery && matchesStatus && matchesVis;
    })
    .sort((a, b) => {
      if (sortBy === "displayOrder") {
        const orderA = a.displayOrder && a.displayOrder > 0 ? a.displayOrder : 999999;
        const orderB = b.displayOrder && b.displayOrder > 0 ? b.displayOrder : 999999;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "discount") return (b.discount || 0) - (a.discount || 0);
      if (sortBy === "tax") return (b.tax || 0) - (a.tax || 0);
      return 0;
    });

  const totalRecords = filteredCategories.length;
  const totalPages = Math.ceil(totalRecords / perPage) || 1;
  const paginatedCategories = filteredCategories.slice((page - 1) * perPage, page * perPage);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title={isSubcategoryTab ? "RN Subcategory Master" : "RN Category Master"}
        subtitle={
          isSubcategoryTab
            ? "Manage product subcategories and parent category associations."
            : "Manage product categories, tax rates, discounts, SEO metadata, and R2 media assets."
        }
        onRefresh={loadData}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Top Action Bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px" }}>
          {!isSubcategoryTab && (
            <button
              onClick={handleSeedDummy}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 16px",
                borderRadius: "8px",
                border: "1px solid #7C3AED",
                background: "#F3E8FF",
                color: "#7C3AED",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              <Sparkles size={16} /> Seed 4 Dummy Categories
            </button>
          )}

          {!isSubcategoryTab ? (
            <Link
              href="/admin/catalogue/categories/create"
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
              Create New Category
            </Link>
          ) : (
            <button
              onClick={() => setShowAddSubModal(true)}
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
                cursor: "pointer",
              }}
            >
              <Plus size={18} />
              Add New Subcategory
            </button>
          )}
        </div>

        {/* Content View */}
        {!isSubcategoryTab ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Search & Filter Bar */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", boxShadow: shadow }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: inputBg, border: `1px solid ${border}`, borderRadius: "8px", padding: "8px 14px", flex: 1, minWidth: "280px" }}>
                <Search size={16} style={{ color: textMuted }} />
                <input
                  type="text"
                  placeholder="Search by category name, slug, or SEO keywords..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  style={{ border: "none", background: "transparent", color: textMain, width: "100%", outline: "none", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                {/* Status Filter */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <label style={{ fontSize: "12px", color: textMuted, fontWeight: 700 }}>Status:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
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
                    onChange={(e) => setVisibilityFilter(e.target.value as typeof visibilityFilter)}
                    style={{ padding: "8px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain, fontSize: "13px", fontWeight: 700 }}
                  >
                    <option value="All">All Visibility</option>
                    <option value="Visible">Visible Web</option>
                    <option value="Hidden">Hidden Web</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <label style={{ fontSize: "12px", color: textMuted, fontWeight: 700 }}>Sort:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    style={{ padding: "8px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain, fontSize: "13px", fontWeight: 700 }}
                  >
                    <option value="displayOrder">Display Order (Rank #1, #2, #3...)</option>
                    <option value="createdAt">Date Created</option>
                    <option value="name">Category Name</option>
                    <option value="discount">Discount %</option>
                    <option value="tax">Tax %</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Categories Table List */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", overflow: "hidden", boxShadow: shadow }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: tableHeaderBg, borderBottom: `1px solid ${border}`, color: textMuted }}>
                    <th style={{ padding: "14px 20px" }}>CAT ID / Media</th>
                    <th style={{ padding: "14px 20px" }}>Rank / Order</th>
                    <th style={{ padding: "14px 20px" }}>Name & Slug</th>
                    <th style={{ padding: "14px 20px" }}>SEO Title</th>
                    <th style={{ padding: "14px 20px" }}>Tax %</th>
                    <th style={{ padding: "14px 20px" }}>Discount %</th>
                    <th style={{ padding: "14px 20px" }}>Catalogue PDF</th>
                    <th style={{ padding: "14px 20px" }}>Status</th>
                    <th style={{ padding: "14px 20px" }}>Visibility</th>
                    <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, idx) => (
                      <tr key={`shimmer-cat-${idx}`} style={{ borderBottom: `1px solid ${border}` }}>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <AdminShimmer width={44} height={44} borderRadius={8} isDark={isDark} />
                            <AdminShimmer width={65} height={14} isDark={isDark} />
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <AdminShimmer width={50} height={26} borderRadius={6} isDark={isDark} />
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <AdminShimmer width={idx % 2 === 0 ? "70%" : "85%"} height={15} isDark={isDark} />
                            <AdminShimmer width="45%" height={11} isDark={isDark} />
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <AdminShimmer width={120} height={14} isDark={isDark} />
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <AdminShimmer width={40} height={14} isDark={isDark} />
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <AdminShimmer width={40} height={14} isDark={isDark} />
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
                  ) : paginatedCategories.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ padding: "32px", textAlign: "center", color: textMuted }}>
                        No categories found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedCategories.map((cat) => (
                      <tr key={cat.id} style={{ borderBottom: `1px solid ${border}` }}>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {cat.image ? (
                              <img
                                src={cat.image}
                                alt={cat.name}
                                style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover", border: `1px solid ${border}` }}
                              />
                            ) : (
                              <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: inputBg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}>
                                <ImageIcon size={18} />
                              </div>
                            )}

                            <div>
                              <Link
                                href={`/admin/catalogue/categories/${cat.slug}`}
                                style={{ color: "#0077B6", fontWeight: 800, textDecoration: "none", fontSize: "13px" }}
                              >
                                CAT{cat.id.slice(-6).toUpperCase()}
                              </Link>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <input
                              type="number"
                              min="0"
                              defaultValue={cat.displayOrder || 0}
                              onBlur={(e) => {
                                const val = Number(e.target.value);
                                if (val !== (cat.displayOrder || 0)) {
                                  handleUpdateDisplayOrder(cat.id, val);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  (e.target as HTMLInputElement).blur();
                                }
                              }}
                              title="Set rank (1 for Top, 2 for 2nd place...). Press Enter or click away to save."
                              style={{
                                width: "54px",
                                padding: "4px 6px",
                                borderRadius: "6px",
                                border: `1.5px solid ${cat.displayOrder && cat.displayOrder > 0 ? "#0077B6" : border}`,
                                background: inputBg,
                                color: textMain,
                                fontWeight: 800,
                                fontSize: "13px",
                                textAlign: "center",
                              }}
                            />
                            {cat.displayOrder && cat.displayOrder > 0 ? (
                              <span style={{ fontSize: "10px", fontWeight: 800, color: "#0077B6", background: "#E0F2FE", padding: "2px 6px", borderRadius: "4px" }}>
                                #{cat.displayOrder}
                              </span>
                            ) : null}
                          </div>
                        </td>

                        <td style={{ padding: "14px 20px" }}>
                          <Link
                            href={`/admin/catalogue/categories/${cat.slug}`}
                            style={{ fontWeight: 800, color: textMain, fontSize: "15px", textDecoration: "none" }}
                          >
                            {cat.name}
                          </Link>
                          <div style={{ fontSize: "12px", color: "#0077B6", fontFamily: "monospace" }}>/{cat.slug}</div>
                        </td>

                        <td style={{ padding: "14px 20px", maxWidth: "220px" }}>
                          <div style={{ fontWeight: 700, fontSize: "12.5px", color: textMain, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {cat.title || "No SEO title"}
                          </div>
                        </td>

                        <td style={{ padding: "14px 20px", fontWeight: 700, color: textMain }}>
                          {cat.tax ?? 18}%
                        </td>

                        <td style={{ padding: "14px 20px", fontWeight: 700, color: "#059669" }}>
                          {cat.discount ?? 0}%
                        </td>

                        <td style={{ padding: "14px 20px" }}>
                          {cat.pdfCatalogue ? (
                            <a
                              href={cat.pdfCatalogue}
                              target="_blank"
                              rel="noreferrer"
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
                            onClick={() => handleToggleStatus(cat.id)}
                            style={{
                              background: cat.status === "Active" ? "#0596691A" : "#DC26261A",
                              color: cat.status === "Active" ? "#059669" : "#DC2626",
                              border: "none",
                              padding: "4px 12px",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            {cat.status}
                          </button>
                        </td>

                        <td style={{ padding: "14px 20px" }}>
                          <button
                            onClick={() => handleToggleVisibility(cat.id)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              background: cat.isVisibleWebsite !== false ? "#0077B61A" : "#6B72801A",
                              color: cat.isVisibleWebsite !== false ? "#0077B6" : textMuted,
                              border: "none",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {cat.isVisibleWebsite !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                            {cat.isVisibleWebsite !== false ? "Visible" : "Hidden"}
                          </button>
                        </td>

                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", alignItems: "center" }}>
                            <Link
                              href={`/admin/catalogue/categories/${cat.slug}`}
                              style={{ color: "#6B7280", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                              title="View Category Details"
                            >
                              <Eye size={16} />
                            </Link>

                            <Link
                              href={`/admin/catalogue/categories/${cat.slug}/edit`}
                              style={{ color: "#0077B6", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                              title="Edit Category"
                            >
                              <Edit2 size={16} />
                            </Link>

                            <button
                              onClick={() => handleDeleteCat(cat.id, cat.slug)}
                              style={{ background: "transparent", border: "none", color: "#DC2626", cursor: "pointer", padding: 0 }}
                              title="Delete Category"
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
                  Showing {paginatedCategories.length} of {totalRecords} categories (Page {page} of {totalPages})
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
          </div>
        ) : (
          /* Subcategories Tab Content */
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", overflow: "hidden", boxShadow: shadow }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: tableHeaderBg, borderBottom: `1px solid ${border}`, color: textMuted }}>
                  <th style={{ padding: "14px 20px" }}>Subcategory Name</th>
                  <th style={{ padding: "14px 20px" }}>Parent Category</th>
                  <th style={{ padding: "14px 20px" }}>Slug</th>
                  <th style={{ padding: "14px 20px" }}>Display Order</th>
                  <th style={{ padding: "14px 20px" }}>Status</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subcategories.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: `1px solid ${border}` }}>
                    <td style={{ padding: "14px 20px", fontWeight: 700, color: textMain }}>{sub.name}</td>
                    <td style={{ padding: "14px 20px", color: "#0077B6", fontWeight: 600 }}>{sub.categoryName || sub.categoryId}</td>
                    <td style={{ padding: "14px 20px", color: textMuted }}>/{sub.slug}</td>
                    <td style={{ padding: "14px 20px", color: textMuted }}>{sub.displayOrder || 0}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ background: "#0596691A", color: "#059669", fontSize: "11px", fontWeight: 800, padding: "3px 8px", borderRadius: "12px" }}>
                        {sub.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <button onClick={() => handleDeleteSub(sub.id)} style={{ background: "transparent", border: "none", color: "#DC2626", cursor: "pointer" }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Add Subcategory Modal */}
      {showAddSubModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "480px" }}>
            <h3 style={{ margin: "0 0 16px 0", color: textMain }}>Add New Subcategory</h3>
            <form onSubmit={handleAddSubcategory} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <select value={subCategoryId} onChange={(e) => setSubCategoryId(e.target.value)} style={{ padding: "10px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input type="text" required value={subName} onChange={(e) => setSubName(e.target.value)} placeholder="Subcategory Name *" style={{ padding: "10px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }} />
              <input type="number" value={subDisplayOrder} onChange={(e) => setSubDisplayOrder(Number(e.target.value))} placeholder="Display Order" style={{ padding: "10px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain }} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button type="button" onClick={() => setShowAddSubModal(false)} style={{ padding: "8px 16px", borderRadius: "8px", border: `1px solid ${border}`, background: "transparent", color: textMuted }}>Cancel</button>
                <button type="submit" style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "#0077B6", color: "#FFFFFF", fontWeight: 700 }}>Save Subcategory</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
