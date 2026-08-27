"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getAdminProductByCode,
  getAdminBPoints,
  addAdminBPoint,
  deleteAdminBPoint,
  AdminBPoint,
} from "@/utils/adminStore";
import { AdminProduct } from "@/types/admin";
import { useAdminTheme } from "@/app/admin/layout";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Plus,
  ExternalLink,
  Package,
  Video,
  ShoppingCart,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawCode = params?.code as string;
  const code = decodeURIComponent(rawCode || "");

  const { theme, toggleTheme } = useAdminTheme();

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [bpoints, setBpoints] = useState<AdminBPoint[]>([]);
  const [newBPointName, setNewBPointName] = useState("");
  const [loading, setLoading] = useState(true);
  const [bpointSubmitting, setBpointSubmitting] = useState(false);

  const isDark = theme === "dark";

  const cardBg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#21262D" : "#E5E7EB";
  const textMain = isDark ? "#F0F6FC" : "#111827";
  const textMuted = isDark ? "#8B949E" : "#6B7280";
  const inputBg = isDark ? "#161B22" : "#F9FAFB";
  const shadow = isDark ? "none" : "0 2px 10px rgba(0, 0, 0, 0.04)";

  const loadProductData = async () => {
    if (!code) return;
    setLoading(true);
    const prodData = await getAdminProductByCode(code);

    if (prodData) {
      setProduct(prodData);
      const bps = await getAdminBPoints(prodData.id);
      setBpoints(bps);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProductData();
  }, [code]);

  const handleAddBPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBPointName.trim() || !product) return;

    setBpointSubmitting(true);
    const created = await addAdminBPoint({
      modelId: product.id,
      name: newBPointName.trim(),
    });
    setBpointSubmitting(false);

    if (created) {
      setNewBPointName("");
      const updatedBps = await getAdminBPoints(product.id);
      setBpoints(updatedBps);
    } else {
      alert("Failed to add bullet point.");
    }
  };

  const handleDeleteBPoint = async (id: string) => {
    if (confirm("Delete this bullet point?")) {
      const ok = await deleteAdminBPoint(id);
      if (ok && product) {
        const updatedBps = await getAdminBPoints(product.id);
        setBpoints(updatedBps);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AdminHeader title="Product Details" theme={theme} onToggleTheme={toggleTheme} />
        <div style={{ padding: "60px", textAlign: "center", color: textMuted }}>Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AdminHeader title="Product Not Found" theme={theme} onToggleTheme={toggleTheme} />
        <div style={{ padding: "60px", textAlign: "center", color: textMuted }}>
          <h3>Product "{code}" not found.</h3>
          <Link href="/admin/catalogue/products" style={{ color: "#0077B6", fontWeight: 700, marginTop: "12px", display: "inline-block" }}>
            Back to Product Listing
          </Link>
        </div>
      </div>
    );
  }

  const itemCode = product.code || product.id;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title={`CODE: ${itemCode} | ${product.name}`}
        subtitle={`Product Details, Pricing & Specifications for ${product.name}`}
        onRefresh={loadProductData}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Top Control Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <Link
            href="/admin/catalogue/products"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: textMuted, textDecoration: "none", fontWeight: 700, fontSize: "14px" }}
          >
            <ArrowLeft size={16} /> Back to Products
          </Link>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Link
              href={`/admin/catalogue/products/${encodeURIComponent(itemCode)}/edit`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "8px",
                background: "#0077B6",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              <Edit2 size={16} /> Edit Product
            </Link>
          </div>
        </div>

        {/* Header Summary Card */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "24px", boxShadow: shadow, display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: textMain }}>
                  {itemCode} : {product.name}
                </h2>
                <span style={{ background: product.status === "In Stock" || product.status === "Active" ? "#0596691A" : "#DC26261A", color: product.status === "In Stock" || product.status === "Active" ? "#059669" : "#DC2626", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: 800 }}>
                  {product.status}
                </span>
              </div>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: textMuted, fontFamily: "monospace" }}>
                Category: <strong style={{ color: "#0077B6" }}>{product.category || "Unassigned"}</strong> {product.subcategoryName ? `> ${product.subcategoryName}` : ""} | SKU: {product.skuCode || itemCode}
              </p>
            </div>

            <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: 700, color: textMuted }}>
                IN MRP: <span style={{ textDecoration: "line-through" }}>₹{product.inMrp || product.price || 0}</span>
              </div>

              <div style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: "8px", padding: "8px 14px", fontSize: "14px", fontWeight: 800, color: "#059669" }}>
                IN Selling: ₹{product.inSelling || product.price || 0}
              </div>

              <div style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: 700, color: textMain }}>
                Stock: {product.stock || 0} Pcs
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout (2 Columns) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>
          {/* Left Column: Specifications, Bullet Points & SEO */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Technical Specifications Grid */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "24px", boxShadow: shadow }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 800, color: textMain }}>
                Product Specifications & Logistics
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "14px" }}>
                <div style={{ background: inputBg, border: `1px solid ${border}`, padding: "12px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "11px", color: textMuted, display: "block" }}>Brand</span>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: textMain }}>{product.brand || "RN"}</span>
                </div>

                <div style={{ background: inputBg, border: `1px solid ${border}`, padding: "12px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "11px", color: textMuted, display: "block" }}>Material</span>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: textMain }}>{product.material || "Brass"}</span>
                </div>

                <div style={{ background: inputBg, border: `1px solid ${border}`, padding: "12px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "11px", color: textMuted, display: "block" }}>Color / Finish</span>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: textMain }}>{product.colorName || "Chrome"}</span>
                </div>

                <div style={{ background: inputBg, border: `1px solid ${border}`, padding: "12px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "11px", color: textMuted, display: "block" }}>Size</span>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: textMain }}>{product.size || "Standard"}</span>
                </div>
              </div>
            </div>

            {/* Add Bullet Point Card */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "24px", boxShadow: shadow }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 800, color: textMain }}>
                Add Product Bullet Point
              </h3>

              <form onSubmit={handleAddBPoint} style={{ display: "flex", gap: "12px" }}>
                <input
                  type="text"
                  required
                  value={newBPointName}
                  onChange={(e) => setNewBPointName(e.target.value)}
                  placeholder="Enter feature bullet point (e.g. Mirror Chrome Finish, 10-Year Warranty)..."
                  style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain, fontSize: "14px" }}
                />
                <button
                  type="submit"
                  disabled={bpointSubmitting}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "8px", border: "none", background: "#111827", color: "#FFFFFF", fontWeight: 700, cursor: bpointSubmitting ? "not-allowed" : "pointer" }}
                >
                  <Plus size={16} /> Add Bullet Point
                </button>
              </form>

              {/* Bullet Points Table */}
              <div style={{ marginTop: "20px", border: `1px solid ${border}`, borderRadius: "12px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ background: inputBg, borderBottom: `1px solid ${border}`, color: textMuted }}>
                      <th style={{ padding: "12px 16px", width: "80px" }}>Id</th>
                      <th style={{ padding: "12px 16px" }}>Bullet Title</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", width: "90px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bpoints.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ padding: "20px", textAlign: "center", color: textMuted }}>
                          No bullet points added yet for this product.
                        </td>
                      </tr>
                    ) : (
                      bpoints.map((bp, idx) => (
                        <tr key={bp.id} style={{ borderBottom: `1px solid ${border}` }}>
                          <td style={{ padding: "12px 16px", color: textMuted, fontWeight: 700 }}>#{idx + 1}</td>
                          <td style={{ padding: "12px 16px", color: textMain, fontWeight: 600 }}>{bp.name}</td>
                          <td style={{ padding: "12px 16px", textAlign: "right" }}>
                            <button
                              onClick={() => handleDeleteBPoint(bp.id)}
                              style={{ background: "transparent", border: "none", color: "#DC2626", cursor: "pointer" }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SEO & Marketplace Links */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "24px", boxShadow: shadow, display: "flex", flexDirection: "column", gap: "14px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0077B6" }}>
                SEO Metadata & E-Commerce Links
              </h3>

              <div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: textMuted, display: "block", marginBottom: "2px" }}>SEO Title:</span>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: textMain }}>{product.title || "N/A"}</p>
              </div>

              <div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: textMuted, display: "block", marginBottom: "2px" }}>SEO Keywords:</span>
                <p style={{ margin: 0, fontSize: "14px", color: textMain }}>{product.keywords || "N/A"}</p>
              </div>

              <div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: textMuted, display: "block", marginBottom: "2px" }}>SEO Description:</span>
                <p style={{ margin: 0, fontSize: "14px", color: textMuted, lineHeight: 1.5 }}>{product.description || "N/A"}</p>
              </div>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", paddingTop: "12px", borderTop: `1px solid ${border}` }}>
                {product.videoUrl && (
                  <a href={product.videoUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#DC2626", fontWeight: 700, fontSize: "13px", textDecoration: "none" }}>
                    <Video size={16} /> YouTube Video
                  </a>
                )}
                {product.amazonLink && (
                  <a href={product.amazonLink} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#D97706", fontWeight: 700, fontSize: "13px", textDecoration: "none" }}>
                    <ShoppingCart size={16} /> Amazon India
                  </a>
                )}
                {product.flipkartLink && (
                  <a href={product.flipkartLink} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#2563EB", fontWeight: 700, fontSize: "13px", textDecoration: "none" }}>
                    <ShoppingCart size={16} /> Flipkart
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Main Image & Gallery */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "16px", boxShadow: shadow }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 800, color: textMain, textAlign: "center" }}>
                Product Main Image
              </h4>
              {product.image ? (
                <img src={product.image} alt={product.name} style={{ width: "100%", height: "240px", objectFit: "cover", borderRadius: "10px", border: `1px solid ${border}` }} />
              ) : (
                <div style={{ height: "200px", background: inputBg, borderRadius: "10px", border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}>No Image</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
