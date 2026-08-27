"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getAdminSubcategoryBySlug,
  getAdminBPoints,
  addAdminBPoint,
  deleteAdminBPoint,
  AdminBPoint,
} from "@/utils/adminStore";
import { AdminSubcategory } from "@/types/admin";
import { useAdminTheme } from "@/app/admin/layout";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Plus,
  FileText,
} from "lucide-react";

export default function SubcategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { theme, toggleTheme } = useAdminTheme();

  const [subcategory, setSubcategory] = useState<AdminSubcategory | null>(null);
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

  const loadSubcategoryData = async () => {
    if (!slug) return;
    setLoading(true);
    const subData = await getAdminSubcategoryBySlug(slug);

    if (subData) {
      setSubcategory(subData);
      const bps = await getAdminBPoints(subData.id);
      setBpoints(bps);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSubcategoryData();
  }, [slug]);

  const handleAddBPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBPointName.trim() || !subcategory) return;

    setBpointSubmitting(true);
    const created = await addAdminBPoint({
      modelId: subcategory.id,
      name: newBPointName.trim(),
    });
    setBpointSubmitting(false);

    if (created) {
      setNewBPointName("");
      const updatedBps = await getAdminBPoints(subcategory.id);
      setBpoints(updatedBps);
    } else {
      alert("Failed to add bullet point.");
    }
  };

  const handleDeleteBPoint = async (id: string) => {
    if (confirm("Delete this bullet point?")) {
      const ok = await deleteAdminBPoint(id);
      if (ok && subcategory) {
        const updatedBps = await getAdminBPoints(subcategory.id);
        setBpoints(updatedBps);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AdminHeader title="Subcategory Details" theme={theme} onToggleTheme={toggleTheme} />
        <div style={{ padding: "60px", textAlign: "center", color: textMuted }}>Loading subcategory details...</div>
      </div>
    );
  }

  if (!subcategory) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AdminHeader title="Subcategory Not Found" theme={theme} onToggleTheme={toggleTheme} />
        <div style={{ padding: "60px", textAlign: "center", color: textMuted }}>
          <h3>Subcategory "{slug}" not found.</h3>
          <Link href="/admin/catalogue/subcategories" style={{ color: "#0077B6", fontWeight: 700, marginTop: "12px", display: "inline-block" }}>
            Back to Subcategories Listing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title={`SUB${subcategory.id.slice(-6).toUpperCase()} : ${subcategory.name}`}
        subtitle={`Subcategory Details & Management for ${subcategory.name}`}
        onRefresh={loadSubcategoryData}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Top Control Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <Link
            href="/admin/catalogue/subcategories"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: textMuted, textDecoration: "none", fontWeight: 700, fontSize: "14px" }}
          >
            <ArrowLeft size={16} /> Back to Subcategories
          </Link>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Link
              href={`/admin/catalogue/subcategories/${subcategory.slug}/edit`}
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
              <Edit2 size={16} /> Edit Subcategory
            </Link>
          </div>
        </div>

        {/* Header Summary Card */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "24px", boxShadow: shadow, display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: textMain }}>
                  SUB{subcategory.id.slice(-6).toUpperCase()} : {subcategory.name}
                </h2>
                <span style={{ background: subcategory.status === "Active" ? "#0596691A" : "#DC26261A", color: subcategory.status === "Active" ? "#059669" : "#DC2626", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: 800 }}>
                  {subcategory.status}
                </span>
              </div>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: textMuted, fontFamily: "monospace" }}>
                Parent Category: <strong style={{ color: "#0077B6" }}>{subcategory.categoryName || subcategory.categoryId}</strong> | Slug: /{subcategory.slug}
              </p>
            </div>

            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <div style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: 700, color: textMain }}>
                Display Order: <span>{subcategory.displayOrder || 0}</span>
              </div>

              <div style={{ background: subcategory.isVisibleWebsite !== false ? "#0077B61A" : "#6B72801A", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: 800, color: subcategory.isVisibleWebsite !== false ? "#0077B6" : textMuted }}>
                is_visible_website? {subcategory.isVisibleWebsite !== false ? "Yes (1)" : "No (0)"}
              </div>
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
                Add Subcategory Bullet Point
              </h3>

              <form onSubmit={handleAddBPoint} style={{ display: "flex", gap: "12px" }}>
                <input
                  type="text"
                  required
                  value={newBPointName}
                  onChange={(e) => setNewBPointName(e.target.value)}
                  placeholder="Enter feature bullet point..."
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
                          No bullet points added yet for this subcategory.
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
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: textMain }}>{subcategory.title || "N/A"}</p>
              </div>

              <div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: textMuted, display: "block", marginBottom: "2px" }}>SEO Keywords:</span>
                <p style={{ margin: 0, fontSize: "14px", color: textMain }}>{subcategory.keywords || "N/A"}</p>
              </div>

              <div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: textMuted, display: "block", marginBottom: "2px" }}>SEO Description:</span>
                <p style={{ margin: 0, fontSize: "14px", color: textMuted, lineHeight: 1.5 }}>{subcategory.description || "N/A"}</p>
              </div>

              {subcategory.pdfCatalogue && (
                <div style={{ paddingTop: "12px", borderTop: `1px solid ${border}` }}>
                  <a
                    href={subcategory.pdfCatalogue}
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
            {/* Subcategory Main Image */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "16px", boxShadow: shadow }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 800, color: textMain, textAlign: "center" }}>
                Subcategory Image
              </h4>
              {subcategory.image ? (
                <img src={subcategory.image} alt={subcategory.name} style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "10px", border: `1px solid ${border}` }} />
              ) : (
                <div style={{ height: "160px", background: inputBg, borderRadius: "10px", border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}>No Image</div>
              )}
            </div>

            {/* Subcategory Banner */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "16px", boxShadow: shadow }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 800, color: textMain, textAlign: "center" }}>
                Subcategory Banner
              </h4>
              {subcategory.banner ? (
                <img src={subcategory.banner} alt="Banner" style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "10px", border: `1px solid ${border}` }} />
              ) : (
                <div style={{ height: "100px", background: inputBg, borderRadius: "10px", border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", color: textMuted }}>No Banner</div>
              )}
            </div>

            {/* Subcategory Icon */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "16px", boxShadow: shadow }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 800, color: textMain, textAlign: "center" }}>
                Subcategory Icon
              </h4>
              {subcategory.icon ? (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <img src={subcategory.icon} alt="Icon" style={{ width: "80px", height: "80px", objectFit: "contain", borderRadius: "10px", border: `1px solid ${border}`, padding: "6px" }} />
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
