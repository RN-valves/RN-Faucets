"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminShimmer from "@/components/admin/ui/AdminShimmer";
import { useAdminTheme } from "@/app/admin/layout";
import {
  Plus,
  Upload,
  Search,
  Image as ImageIcon,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";

export default function ProductImagesIndexPage() {
  const { theme, toggleTheme } = useAdminTheme();

  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isDark = theme === "dark";

  const cardBg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#21262D" : "#E5E7EB";
  const textMain = isDark ? "#F0F6FC" : "#111827";
  const textMuted = isDark ? "#8B949E" : "#6B7280";
  const inputBg = isDark ? "#161B22" : "#F9FAFB";
  const tableHeaderBg = isDark ? "#161B22" : "#F9FAFB";
  const shadow = isDark ? "none" : "0 2px 10px rgba(0, 0, 0, 0.04)";

  const loadImages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/product-images?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setImages(data.images || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load product images:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [searchQuery, page]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title="Product Images Master"
        subtitle="Manage complete product gallery media assets, SKU code links, and bulk Excel image mappings."
        onRefresh={loadImages}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Top Action Buttons Bar matching PHP Admin */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: inputBg, border: `1px solid ${border}`, borderRadius: "8px", padding: "8px 14px", flex: 1, maxWidth: "420px" }}>
            <Search size={16} style={{ color: textMuted }} />
            <input
              type="text"
              placeholder="Search by SKU Code, Article, or Product Name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              style={{ border: "none", background: "transparent", color: textMain, width: "100%", outline: "none", fontSize: "14px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link
              href="/admin/catalogue/product-images/import"
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "8px", border: `1px solid ${border}`, background: cardBg, color: "#D97706", fontWeight: 700, fontSize: "13px", textDecoration: "none" }}
            >
              <Upload size={15} /> Import Product Images
            </Link>

            <Link
              href="/admin/catalogue/product-images/create"
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
              Add New Product Image
            </Link>
          </div>
        </div>

        {/* Product Images Table List */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", overflow: "hidden", boxShadow: shadow }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: tableHeaderBg, borderBottom: `1px solid ${border}`, color: textMuted }}>
                <th style={{ padding: "14px 20px" }}>Thumbnail</th>
                <th style={{ padding: "14px 20px" }}>SKU Code</th>
                <th style={{ padding: "14px 20px" }}>Article</th>
                <th style={{ padding: "14px 20px" }}>Product Title</th>
                <th style={{ padding: "14px 20px" }}>Image URL</th>
                <th style={{ padding: "14px 20px" }}>Type</th>
                <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={`shimmer-img-${idx}`} style={{ borderBottom: `1px solid ${border}` }}>
                    <td style={{ padding: "14px 20px" }}>
                      <AdminShimmer width={50} height={50} borderRadius={8} isDark={isDark} />
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <AdminShimmer width={90} height={15} isDark={isDark} />
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <AdminShimmer width={60} height={14} isDark={isDark} />
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <AdminShimmer width={idx % 2 === 0 ? "80%" : "65%"} height={15} isDark={isDark} />
                        <AdminShimmer width="35%" height={11} isDark={isDark} />
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <AdminShimmer width={160} height={13} isDark={isDark} />
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <AdminShimmer width={65} height={22} borderRadius={11} isDark={isDark} />
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px", justifyContent: "flex-end" }}>
                        <AdminShimmer width={28} height={28} borderRadius={6} isDark={isDark} />
                        <AdminShimmer width={28} height={28} borderRadius={6} isDark={isDark} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : images.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: textMuted }}>
                    No product images found matching search criteria.
                  </td>
                </tr>
              ) : (
                images.map((item) => (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${border}` }}>
                    <td style={{ padding: "14px 20px" }}>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover", border: `1px solid ${border}` }}
                        />
                      ) : (
                        <div style={{ width: "50px", height: "50px", borderRadius: "8px", background: inputBg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}>
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>

                    <td style={{ padding: "14px 20px", fontWeight: 800, color: "#0077B6" }}>
                      {item.skuCode}
                    </td>

                    <td style={{ padding: "14px 20px", color: textMuted, fontWeight: 700 }}>
                      {item.article || "-"}
                    </td>

                    <td style={{ padding: "14px 20px", fontWeight: 700, color: textMain }}>
                      {item.name}
                    </td>

                    <td style={{ padding: "14px 20px", fontSize: "12px", color: textMuted, maxWidth: "260px", wordBreak: "break-all" }}>
                      {item.image}
                    </td>

                    <td style={{ padding: "14px 20px" }}>
                      <span
                        style={{
                          background: item.isPrimary ? "#0596691A" : "#0077B61A",
                          color: item.isPrimary ? "#059669" : "#0077B6",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: 800,
                        }}
                      >
                        {item.isPrimary ? "Primary Image" : "Gallery Asset"}
                      </span>
                    </td>

                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", alignItems: "center" }}>
                        <Link
                          href={`/admin/catalogue/products/${encodeURIComponent(item.productId)}/edit`}
                          style={{ color: "#0077B6", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                          title="Edit Product Media"
                        >
                          <Edit2 size={16} />
                        </Link>
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
              Showing Page {page} of {totalPages}
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
