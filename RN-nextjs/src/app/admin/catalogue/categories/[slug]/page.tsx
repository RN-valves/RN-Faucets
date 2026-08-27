"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getAdminCategoryBySlug,
  getAdminSubcategories,
  getAdminBPoints,
  addAdminBPoint,
  deleteAdminBPoint,
  AdminBPoint,
} from "@/utils/adminStore";
import { AdminCategory, AdminSubcategory } from "@/types/admin";
import { useAdminTheme } from "@/app/admin/layout";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Plus,
  FileText,
  CheckCircle2,
  Globe,
  Tag,
  Layers,
  Image as ImageIcon,
} from "lucide-react";

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { theme, toggleTheme } = useAdminTheme();

  const [category, setCategory] = useState<AdminCategory | null>(null);
  const [subcategories, setSubcategories] = useState<AdminSubcategory[]>([]);
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

  const loadCategoryData = async () => {
    if (!slug) return;
    setLoading(true);
    const catData = await getAdminCategoryBySlug(slug);

    if (catData) {
      setCategory(catData);
      const [subs, bps] = await Promise.all([
        getAdminSubcategories(catData.id),
        getAdminBPoints(catData.id),
      ]);
      setSubcategories(subs);
      setBpoints(bps);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategoryData();
  }, [slug]);

  const handleAddBPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBPointName.trim() || !category) return;

    setBpointSubmitting(true);
    const created = await addAdminBPoint({
      modelId: category.id,
      name: newBPointName.trim(),
    });
    setBpointSubmitting(false);

    if (created) {
      setNewBPointName("");
      const updatedBps = await getAdminBPoints(category.id);
      setBpoints(updatedBps);
    } else {
      alert("Failed to add bullet point.");
    }
  };

  const handleDeleteBPoint = async (id: string) => {
    if (confirm("Delete this bullet point?")) {
      const ok = await deleteAdminBPoint(id);
      if (ok && category) {
        const updatedBps = await getAdminBPoints(category.id);
        setBpoints(updatedBps);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AdminHeader title="Category Details" theme={theme} onToggleTheme={toggleTheme} />
        <div style={{ padding: "60px", textAlign: "center", color: textMuted }}>Loading category details...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AdminHeader title="Category Not Found" theme={theme} onToggleTheme={toggleTheme} />
        <div style={{ padding: "60px", textAlign: "center", color: textMuted }}>
          <h3>Category "{slug}" not found.</h3>
          <Link href="/admin/catalogue/categories" style={{ color: "#0077B6", fontWeight: 700, marginTop: "12px", display: "inline-block" }}>
            Back to Category Listing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title={`CAT${category.id.slice(-6).toUpperCase()} : ${category.name}`}
        subtitle={`Category Details & Management for ${category.name}`}
        onRefresh={loadCategoryData}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Top Control Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <Link
            href="/admin/catalogue/categories"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: textMuted, textDecoration: "none", fontWeight: 700, fontSize: "14px" }}
          >
            <ArrowLeft size={16} /> Back to Categories
          </Link>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Link
              href={`/admin/catalogue/categories/${category.slug}/edit`}
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
              <Edit2 size={16} /> Edit Category
            </Link>
          </div>
        </div>

        {/* Header Summary Card */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "24px", boxShadow: shadow, display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: textMain }}>
                  CAT{category.id.slice(-6).toUpperCase()} : {category.name}
                </h2>
                <span style={{ background: category.status === "Active" ? "#0596691A" : "#DC26261A", color: category.status === "Active" ? "#059669" : "#DC2626", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: 800 }}>
                  {category.status}
                </span>
              </div>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: textMuted, fontFamily: "monospace" }}>
                UUID: {category.uuid || category.id} | Slug: /{category.slug}
              </p>
            </div>

            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: 700, color: textMain }}>
                Discount: <span style={{ color: "#059669" }}>{category.discount ?? 0}%</span>
              </div>

              <div style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: 700, color: textMain }}>
                Tax GST: <span>{category.tax ?? 18}%</span>
              </div>

              <div style={{ background: category.isVisibleWebsite !== false ? "#0077B61A" : "#6B72801A", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: 800, color: category.isVisibleWebsite !== false ? "#0077B6" : textMuted }}>
                is_visible_website? {category.isVisibleWebsite !== false ? "Yes (1)" : "No (0)"}
              </div>
            </div>
          </div>

          {/* Subcategories Badges List */}
          <div style={{ paddingTop: "12px", borderTop: `1px solid ${border}` }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: textMuted, display: "block", marginBottom: "8px" }}>
              Subcategories ({subcategories.length}):
            </span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {subcategories.length === 0 ? (
                <span style={{ fontSize: "13px", color: textMuted }}>No subcategories assigned.</span>
              ) : (
                subcategories.map((sub) => (
                  <span key={sub.id} style={{ background: "#0077B61A", color: "#0077B6", border: "1px solid #0077B633", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: 700 }}>
                    {sub.name}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content Layout (2 Columns) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }}>
          {/* Left Column: Bullet Points & SEO Metadata */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Add Bullet Point Card */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "24px", boxShadow: shadow }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 800, color: textMain }}>
                Add Category Bullet Point
              </h3>

              <form onSubmit={handleAddBPoint} style={{ display: "flex", gap: "12px" }}>
                <input
                  type="text"
                  required
                  value={newBPointName}
                  onChange={(e) => setNewBPointName(e.target.value)}
                  placeholder="Enter feature bullet point (e.g. 10 Year Warranty Brass Body)..."
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
                          No bullet points added yet for this category.
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

            {/* SEO Metadata Card */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "24px", boxShadow: shadow, display: "flex", flexDirection: "column", gap: "14px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0077B6" }}>
                SEO Metadata & Information
              </h3>

              <div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: textMuted, display: "block", marginBottom: "2px" }}>SEO Title:</span>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: textMain }}>{category.title || "N/A"}</p>
              </div>

              <div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: textMuted, display: "block", marginBottom: "2px" }}>SEO Keywords:</span>
                <p style={{ margin: 0, fontSize: "14px", color: textMain }}>{category.keywords || "N/A"}</p>
              </div>

              <div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: textMuted, display: "block", marginBottom: "2px" }}>SEO Description:</span>
                <p style={{ margin: 0, fontSize: "14px", color: textMuted, lineHeight: 1.5 }}>{category.description || "N/A"}</p>
              </div>

              {category.pdfCatalogue && (
                <div style={{ paddingTop: "12px", borderTop: `1px solid ${border}` }}>
                  <a
                    href={category.pdfCatalogue}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#0077B6", fontWeight: 800, fontSize: "14px", textDecoration: "none" }}
                  >
                    <FileText size={18} /> View PDF Catalogue Document
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Media Previews */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Category Main Image */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "16px", boxShadow: shadow }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 800, color: textMain, textAlign: "center" }}>
                Category Main Image
              </h4>
              {category.image ? (
                <img src={category.image} alt={category.name} style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "10px", border: `1px solid ${border}` }} />
              ) : (
                <div style={{ height: "160px", background: inputBg, borderRadius: "10px", border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}>No Image</div>
              )}
            </div>

            {/* Category Banner */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "16px", boxShadow: shadow }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 800, color: textMain, textAlign: "center" }}>
                Category Banner
              </h4>
              {category.banner ? (
                <img src={category.banner} alt="Banner" style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "10px", border: `1px solid ${border}` }} />
              ) : (
                <div style={{ height: "100px", background: inputBg, borderRadius: "10px", border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}>No Banner</div>
              )}
            </div>

            {/* Category Mobile Banner */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "16px", boxShadow: shadow }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 800, color: textMain, textAlign: "center" }}>
                Mobile Banner
              </h4>
              {category.mobileBanner ? (
                <img src={category.mobileBanner} alt="Mobile Banner" style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "10px", border: `1px solid ${border}` }} />
              ) : (
                <div style={{ height: "80px", background: inputBg, borderRadius: "10px", border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}>No Mobile Banner</div>
              )}
            </div>

            {/* Category Icon */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "16px", boxShadow: shadow }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 800, color: textMain, textAlign: "center" }}>
                Category Icon
              </h4>
              {category.icon ? (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <img src={category.icon} alt="Icon" style={{ width: "80px", height: "80px", objectFit: "contain", borderRadius: "10px", border: `1px solid ${border}`, padding: "6px" }} />
                </div>
              ) : (
                <div style={{ height: "80px", background: inputBg, borderRadius: "10px", border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}>No Icon</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
