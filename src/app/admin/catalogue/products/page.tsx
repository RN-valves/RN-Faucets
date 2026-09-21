"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getAdminProducts,
  deleteAdminProduct,
  getAdminCategories,
  deleteFileFromR2,
  updateAdminProduct,
  bulkPerformProductAction,
  importProductsJSON,
} from "@/utils/adminStore";
import AdminShimmer from "@/components/admin/ui/AdminShimmer";
import { AdminProduct, AdminCategory } from "@/types/admin";
import { useAdminTheme } from "@/app/admin/layout";
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  Image as ImageIcon,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  CheckSquare,
  Layers,
  Tag,
  DollarSign,
  Box,
} from "lucide-react";

export default function ProductsListingPage() {
  const { theme, toggleTheme } = useAdminTheme();

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Bulk Action Fields
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkStock, setBulkStock] = useState<string>("");
  const [bulkPriceType, setBulkPriceType] = useState<"selling" | "mrp">("selling");
  const [bulkPriceVal, setBulkPriceVal] = useState<string>("");
  const [bulkPriceIsPercent, setBulkPriceIsPercent] = useState(false);

  const importInputRef = useRef<HTMLInputElement>(null);

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
      const [prods, cats] = await Promise.all([getAdminProducts(), getAdminCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "In Stock" || currentStatus === "Active" ? "Out of Stock" : "In Stock";
    await updateAdminProduct(id, { status: nextStatus as any });
    await loadData();
  };

  const handleDeleteProduct = async (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete product "${code}"?`)) {
      deleteFileFromR2(`website/catalogue/products/${id}/image.webp`);
      await deleteAdminProduct(id);
      await loadData();
    }
  };

  // Filter Products
  const filteredProducts = products.filter((prod) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      prod.name.toLowerCase().includes(q) ||
      (prod.code && prod.code.toLowerCase().includes(q)) ||
      (prod.skuCode && prod.skuCode.toLowerCase().includes(q)) ||
      (prod.category && prod.category.toLowerCase().includes(q));

    const matchesCat = categoryFilter === "All" || prod.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || prod.status === statusFilter;

    return matchesQuery && matchesCat && matchesStatus;
  });

  const totalRecords = filteredProducts.length;
  const totalPages = Math.ceil(totalRecords / perPage) || 1;
  const paginatedProducts = filteredProducts.slice((page - 1) * perPage, page * perPage);

  // Checkbox handlers
  const isAllPaginatedSelected =
    paginatedProducts.length > 0 && paginatedProducts.every((p) => selectedIds.includes(p.id));

  const handleSelectAllPaginated = () => {
    if (isAllPaginatedSelected) {
      const pageIds = paginatedProducts.map((p) => p.id);
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      const pageIds = paginatedProducts.map((p) => p.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Operations
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to BULK DELETE ${selectedIds.length} products?`)) return;

    setBulkActionLoading(true);
    const ok = await bulkPerformProductAction({ action: "delete", ids: selectedIds });
    setBulkActionLoading(false);

    if (ok) {
      alert(`Successfully deleted ${selectedIds.length} products.`);
      setSelectedIds([]);
      await loadData();
    } else {
      alert("Failed to delete selected products.");
    }
  };

  const handleBulkStatusChange = async (statusVal: string) => {
    if (!statusVal || selectedIds.length === 0) return;
    setBulkActionLoading(true);
    const ok = await bulkPerformProductAction({ action: "status", ids: selectedIds, status: statusVal });
    setBulkActionLoading(false);

    if (ok) {
      setSelectedIds([]);
      setBulkStatus("");
      await loadData();
    } else {
      alert("Failed to bulk update status.");
    }
  };

  const handleBulkCategoryChange = async (catVal: string) => {
    if (!catVal || selectedIds.length === 0) return;
    setBulkActionLoading(true);
    const ok = await bulkPerformProductAction({ action: "category", ids: selectedIds, category: catVal });
    setBulkActionLoading(false);

    if (ok) {
      setSelectedIds([]);
      setBulkCategory("");
      await loadData();
    } else {
      alert("Failed to bulk update category.");
    }
  };

  const handleBulkVisibilityChange = async (visibleVal: boolean) => {
    if (selectedIds.length === 0) return;
    setBulkActionLoading(true);
    const ok = await bulkPerformProductAction({ action: "visibility", ids: selectedIds, isVisibleWebsite: visibleVal });
    setBulkActionLoading(false);

    if (ok) {
      setSelectedIds([]);
      await loadData();
    } else {
      alert("Failed to bulk update visibility.");
    }
  };

  const handleBulkStockApply = async () => {
    const val = parseInt(bulkStock, 10);
    if (isNaN(val) || selectedIds.length === 0) return;

    setBulkActionLoading(true);
    const ok = await bulkPerformProductAction({ action: "stock", ids: selectedIds, stock: val });
    setBulkActionLoading(false);

    if (ok) {
      setSelectedIds([]);
      setBulkStock("");
      await loadData();
    } else {
      alert("Failed to bulk update stock.");
    }
  };

  const handleBulkPriceApply = async () => {
    const val = parseFloat(bulkPriceVal);
    if (isNaN(val) || selectedIds.length === 0) return;

    setBulkActionLoading(true);
    const ok = await bulkPerformProductAction({
      action: "price",
      ids: selectedIds,
      priceType: bulkPriceType,
      priceValue: val,
      isPercentage: bulkPriceIsPercent,
    });
    setBulkActionLoading(false);

    if (ok) {
      setSelectedIds([]);
      setBulkPriceVal("");
      await loadData();
    } else {
      alert("Failed to bulk adjust prices.");
    }
  };

  // Export JSON / CSV
  const handleExportJSON = () => {
    const exportItems = selectedIds.length > 0
      ? products.filter((p) => selectedIds.includes(p.id))
      : filteredProducts;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportItems, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `rn_products_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);
        const res = await importProductsJSON(parsed);
        alert(res.message);
        await loadData();
      } catch (err) {
        alert("Invalid JSON file uploaded.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title="RN Product Catalogue Master"
        subtitle="Manage complete RN bathware product items, codes, multi-currency pricing, inventory, and R2 media assets."
        onRefresh={loadData}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Top Action Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              onClick={handleExportJSON}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "8px", border: `1px solid ${border}`, background: cardBg, color: textMain, fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
            >
              <Download size={15} /> Export {selectedIds.length > 0 ? `Selected (${selectedIds.length})` : "All Products"}
            </button>

            <Link
              href="/admin/catalogue/products/import"
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "8px", border: `1px solid ${border}`, background: cardBg, color: "#0077B6", fontWeight: 700, fontSize: "13px", textDecoration: "none" }}
            >
              <Upload size={15} /> Bulk Upload Page
            </Link>
          </div>

          <Link
            href="/admin/catalogue/products/create"
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
            Create New Product
          </Link>
        </div>

        {/* Filter Bar */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", boxShadow: shadow }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: inputBg, border: `1px solid ${border}`, borderRadius: "8px", padding: "8px 14px", flex: 1, minWidth: "280px" }}>
            <Search size={16} style={{ color: textMuted }} />
            <input
              type="text"
              placeholder="Search by product name, item code, SKU, or category..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              style={{ border: "none", background: "transparent", color: textMain, width: "100%", outline: "none", fontSize: "14px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Category Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label style={{ fontSize: "12px", color: textMuted, fontWeight: 700 }}>Category:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain, fontSize: "13px", fontWeight: 700 }}
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
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
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain, fontSize: "13px", fontWeight: 700 }}
              >
                <option value="All">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Active">Active</option>
                <option value="InActive">InActive</option>
              </select>
            </div>
          </div>
        </div>

        {/* BULK UPDATE STICKY ACTION BAR */}
        {selectedIds.length > 0 && (
          <div
            style={{
              background: "#0077B6",
              color: "#FFFFFF",
              borderRadius: "12px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "14px",
              boxShadow: "0 4px 20px rgba(0, 119, 182, 0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "14px" }}>
              <CheckSquare size={18} />
              <span>{selectedIds.length} Products Selected for Bulk Update</span>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              {/* Bulk Status */}
              <select
                disabled={bulkActionLoading}
                value={bulkStatus}
                onChange={(e) => {
                  setBulkStatus(e.target.value);
                  handleBulkStatusChange(e.target.value);
                }}
                style={{ padding: "7px 12px", borderRadius: "6px", border: "none", background: "#FFFFFF", color: "#111827", fontWeight: 700, fontSize: "12px" }}
              >
                <option value="">Bulk Status...</option>
                <option value="In Stock">Set In Stock</option>
                <option value="Low Stock">Set Low Stock</option>
                <option value="Out of Stock">Set Out of Stock</option>
                <option value="Active">Set Active</option>
                <option value="InActive">Set InActive</option>
              </select>

              {/* Bulk Category */}
              <select
                disabled={bulkActionLoading}
                value={bulkCategory}
                onChange={(e) => {
                  setBulkCategory(e.target.value);
                  handleBulkCategoryChange(e.target.value);
                }}
                style={{ padding: "7px 12px", borderRadius: "6px", border: "none", background: "#FFFFFF", color: "#111827", fontWeight: 700, fontSize: "12px" }}
              >
                <option value="">Bulk Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>

              {/* Bulk Visibility */}
              <button
                disabled={bulkActionLoading}
                onClick={() => handleBulkVisibilityChange(true)}
                style={{ padding: "7px 12px", borderRadius: "6px", border: "none", background: "#059669", color: "#FFFFFF", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}
              >
                Set Web Visible
              </button>

              <button
                disabled={bulkActionLoading}
                onClick={() => handleBulkVisibilityChange(false)}
                style={{ padding: "7px 12px", borderRadius: "6px", border: "none", background: "#374151", color: "#FFFFFF", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}
              >
                Set InVisible
              </button>

              {/* Bulk Stock Input */}
              <div style={{ display: "flex", alignItems: "center", background: "#FFFFFF", borderRadius: "6px", overflow: "hidden" }}>
                <input
                  type="number"
                  placeholder="Set Stock Pcs"
                  value={bulkStock}
                  onChange={(e) => setBulkStock(e.target.value)}
                  style={{ width: "90px", padding: "7px 8px", border: "none", outline: "none", color: "#111827", fontSize: "12px" }}
                />
                <button
                  disabled={bulkActionLoading}
                  onClick={handleBulkStockApply}
                  style={{ padding: "7px 10px", border: "none", background: "#0284C7", color: "#FFFFFF", fontWeight: 800, fontSize: "12px", cursor: "pointer" }}
                >
                  Apply
                </button>
              </div>

              {/* Bulk Price Adjustment */}
              <div style={{ display: "flex", alignItems: "center", background: "#FFFFFF", borderRadius: "6px", overflow: "hidden" }}>
                <select
                  value={bulkPriceType}
                  onChange={(e) => setBulkPriceType(e.target.value as any)}
                  style={{ border: "none", background: "#F3F4F6", padding: "7px 6px", color: "#111827", fontSize: "11px", fontWeight: 700 }}
                >
                  <option value="selling">Selling (₹)</option>
                  <option value="mrp">MRP (₹)</option>
                </select>

                <input
                  type="number"
                  placeholder={bulkPriceIsPercent ? "+/- %" : "Price ₹"}
                  value={bulkPriceVal}
                  onChange={(e) => setBulkPriceVal(e.target.value)}
                  style={{ width: "80px", padding: "7px 8px", border: "none", outline: "none", color: "#111827", fontSize: "12px" }}
                />

                <button
                  onClick={() => setBulkPriceIsPercent((prev) => !prev)}
                  style={{ padding: "7px 8px", border: "none", background: bulkPriceIsPercent ? "#7C3AED" : "#9CA3AF", color: "#FFFFFF", fontWeight: 800, fontSize: "11px", cursor: "pointer" }}
                  title="Toggle Percentage / Flat value"
                >
                  {bulkPriceIsPercent ? "%" : "₹"}
                </button>

                <button
                  disabled={bulkActionLoading}
                  onClick={handleBulkPriceApply}
                  style={{ padding: "7px 10px", border: "none", background: "#059669", color: "#FFFFFF", fontWeight: 800, fontSize: "12px", cursor: "pointer" }}
                >
                  Apply Price
                </button>
              </div>

              {/* Bulk Delete */}
              <button
                disabled={bulkActionLoading}
                onClick={handleBulkDelete}
                style={{ padding: "7px 14px", borderRadius: "6px", border: "none", background: "#EF4444", color: "#FFFFFF", fontWeight: 800, fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Trash2 size={14} /> Bulk Delete
              </button>

              <button
                onClick={() => setSelectedIds([])}
                style={{ padding: "7px 10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.4)", background: "transparent", color: "#FFFFFF", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}
              >
                Deselect All
              </button>
            </div>
          </div>
        )}

        {/* Products Table List */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", overflow: "hidden", boxShadow: shadow }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: tableHeaderBg, borderBottom: `1px solid ${border}`, color: textMuted }}>
                <th style={{ padding: "14px 20px", width: "40px" }}>
                  <input
                    type="checkbox"
                    checked={isAllPaginatedSelected}
                    onChange={handleSelectAllPaginated}
                    style={{ cursor: "pointer", width: "16px", height: "16px" }}
                  />
                </th>
                <th style={{ padding: "14px 20px" }}>Item Code / Media</th>
                <th style={{ padding: "14px 20px" }}>Product Name</th>
                <th style={{ padding: "14px 20px" }}>Category / Range</th>
                <th style={{ padding: "14px 20px" }}>IN MRP (₹)</th>
                <th style={{ padding: "14px 20px" }}>IN Selling (₹)</th>
                <th style={{ padding: "14px 20px" }}>Stock (Pcs)</th>
                <th style={{ padding: "14px 20px" }}>Status</th>
                <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={`shimmer-prod-${idx}`} style={{ borderBottom: `1px solid ${border}` }}>
                    <td style={{ padding: "14px 20px" }}>
                      <AdminShimmer width={18} height={18} borderRadius={4} isDark={isDark} />
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <AdminShimmer width={44} height={44} borderRadius={8} isDark={isDark} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <AdminShimmer width={70} height={14} isDark={isDark} />
                          <AdminShimmer width={45} height={11} isDark={isDark} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <AdminShimmer width={idx % 2 === 0 ? "75%" : "60%"} height={15} isDark={isDark} />
                        <AdminShimmer width="40%" height={12} isDark={isDark} />
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <AdminShimmer width={90} height={14} isDark={isDark} />
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <AdminShimmer width={55} height={14} isDark={isDark} />
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <AdminShimmer width={55} height={14} isDark={isDark} />
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <AdminShimmer width={40} height={14} isDark={isDark} />
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <AdminShimmer width={75} height={24} borderRadius={12} isDark={isDark} />
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px", justifyContent: "flex-end" }}>
                        <AdminShimmer width={30} height={30} borderRadius={6} isDark={isDark} />
                        <AdminShimmer width={30} height={30} borderRadius={6} isDark={isDark} />
                        <AdminShimmer width={30} height={30} borderRadius={6} isDark={isDark} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: "32px", textAlign: "center", color: textMuted }}>
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((prod) => {
                  const productCode = prod.code || prod.id;
                  const isSelected = selectedIds.includes(prod.id);

                  return (
                    <tr
                      key={prod.id}
                      style={{
                        borderBottom: `1px solid ${border}`,
                        background: isSelected ? (isDark ? "#1C2128" : "#F0F9FF") : "transparent",
                      }}
                    >
                      <td style={{ padding: "14px 20px" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(prod.id)}
                          style={{ cursor: "pointer", width: "16px", height: "16px" }}
                        />
                      </td>

                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {prod.image ? (
                            <img
                              src={prod.image}
                              alt={prod.name}
                              style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover", border: `1px solid ${border}` }}
                            />
                          ) : (
                            <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: inputBg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}>
                              <ImageIcon size={18} />
                            </div>
                          )}

                          <div>
                            <Link
                              href={`/admin/catalogue/products/${encodeURIComponent(productCode)}`}
                              style={{ color: "#0077B6", fontWeight: 800, textDecoration: "none", fontSize: "13px" }}
                            >
                              {productCode}
                            </Link>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "14px 20px" }}>
                        <Link
                          href={`/admin/catalogue/products/${encodeURIComponent(productCode)}`}
                          style={{ fontWeight: 800, color: textMain, fontSize: "15px", textDecoration: "none" }}
                        >
                          {prod.name}
                        </Link>
                        {prod.skuCode && <div style={{ fontSize: "12px", color: textMuted }}>SKU: {prod.skuCode}</div>}
                      </td>

                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ color: "#0077B6", fontWeight: 700 }}>{prod.category || "Unassigned"}</div>
                        {prod.subcategoryName && <div style={{ fontSize: "12px", color: textMuted }}>{prod.subcategoryName}</div>}
                      </td>

                      <td style={{ padding: "14px 20px", fontWeight: 700, color: textMuted, textDecoration: prod.inSelling ? "line-through" : "none" }}>
                        ₹{prod.inMrp || prod.price || 0}
                      </td>

                      <td style={{ padding: "14px 20px", fontWeight: 800, color: "#059669" }}>
                        ₹{prod.inSelling || prod.price || 0}
                      </td>

                      <td style={{ padding: "14px 20px", fontWeight: 700, color: textMain }}>
                        {prod.stock || 0} pcs
                      </td>

                      <td style={{ padding: "14px 20px" }}>
                        <button
                          onClick={() => handleToggleStatus(prod.id, prod.status)}
                          style={{
                            background: prod.status === "In Stock" || prod.status === "Active" ? "#0596691A" : "#DC26261A",
                            color: prod.status === "In Stock" || prod.status === "Active" ? "#059669" : "#DC2626",
                            border: "none",
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                        >
                          {prod.status}
                        </button>
                      </td>

                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", alignItems: "center" }}>
                          <Link
                            href={`/admin/catalogue/products/${encodeURIComponent(productCode)}`}
                            style={{ color: "#6B7280", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                            title="View Product Details"
                          >
                            <Eye size={16} />
                          </Link>

                          <Link
                            href={`/admin/catalogue/products/${encodeURIComponent(productCode)}/edit`}
                            style={{ color: "#0077B6", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                            title="Edit Product"
                          >
                            <Edit2 size={16} />
                          </Link>

                          <button
                            onClick={() => handleDeleteProduct(prod.id, productCode)}
                            style={{ background: "transparent", border: "none", color: "#DC2626", cursor: "pointer", padding: 0 }}
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination Bar */}
          <div style={{ padding: "16px 20px", borderTop: `1px solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: textMuted }}>
              Showing {paginatedProducts.length} of {totalRecords} products (Page {page} of {totalPages})
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
