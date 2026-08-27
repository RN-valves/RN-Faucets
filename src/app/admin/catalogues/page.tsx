"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminTheme } from "@/app/admin/layout";
import { AdminCataloguePdf } from "@/types/admin";
import { getAdminCatalogues, addAdminCatalogue, deleteAdminCatalogue } from "@/utils/adminStore";
import { Plus, Trash2, Download, FileText, QrCode } from "lucide-react";

import AdminButton from "@/components/admin/ui/AdminButton";
import AdminDataTable, { Column } from "@/components/admin/ui/AdminDataTable";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";

export default function AdminCataloguesPage() {
  const { theme, toggleTheme } = useAdminTheme();
  const [catalogues, setCatalogues] = useState<AdminCataloguePdf[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

  const isDark = theme === "dark";

  const cardBg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#21262D" : "#E5E7EB";
  const textMain = isDark ? "#F0F6FC" : "#111827";
  const textMuted = isDark ? "#8B949E" : "#6B7280";
  const inputBg = isDark ? "#161B22" : "#F9FAFB";

  const loadCatalogues = async () => {
    setLoading(true);
    const data = await getAdminCatalogues();
    setCatalogues(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCatalogues();
  }, []);

  const handleAddCatalogue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !pdfUrl.trim()) return;

    await addAdminCatalogue({
      name: name.trim(),
      pdf: pdfUrl.trim(),
      status: "Active",
    });

    setName("");
    setPdfUrl("");
    setShowAddModal(false);
    await loadCatalogues();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this catalogue PDF?")) {
      await deleteAdminCatalogue(id);
      await loadCatalogues();
    }
  };

  const catalogueColumns: Column<AdminCataloguePdf>[] = [
    {
      header: "Brochure Name",
      accessor: (cat) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FileText size={18} style={{ color: "#0077B6" }} />
          <span style={{ fontWeight: 700 }}>{cat.name}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (cat) => <AdminStatusBadge status={cat.status} variant="success" isDark={isDark} />,
    },
    {
      header: "Actions",
      align: "right",
      accessor: (cat) => (
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <AdminButton
            variant="outline"
            size="sm"
            icon={<Download size={13} />}
            isDark={isDark}
            onClick={() => window.open(cat.pdf, "_blank")}
          >
            Download PDF
          </AdminButton>

          <AdminButton
            variant="icon"
            size="sm"
            icon={<Trash2 size={15} style={{ color: "#DC2626" }} />}
            isDark={isDark}
            onClick={() => handleDelete(cat.id)}
            title="Delete Catalogue"
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title="RN E-Catalogue & Brochure PDFs"
        subtitle="Manage downloadable product brochures, collection catalogues, and QR code assets."
        onRefresh={loadCatalogues}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
          <AdminButton
            variant="primary"
            size="md"
            icon={<Plus size={15} />}
            isDark={isDark}
            onClick={() => setShowAddModal(true)}
          >
            Upload New PDF Catalogue
          </AdminButton>
        </div>

        <AdminDataTable
          isDark={isDark}
          loading={loading}
          columns={catalogueColumns}
          data={catalogues}
          keyExtractor={(cat) => cat.id}
        />
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "16px",
              padding: "28px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", color: textMain }}>Upload Catalogue PDF</h3>
            <form onSubmit={handleAddCatalogue} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: textMain, marginBottom: "6px" }}>
                  Catalogue Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. RN Faucets Master Brochure 2026"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: `1px solid ${border}`,
                    background: inputBg,
                    color: textMain,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: textMain, marginBottom: "6px" }}>
                  PDF File URL / Relative Path *
                </label>
                <input
                  type="text"
                  required
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="e.g. /uploads/catalogue/RN_Master_Catalogue.pdf"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: `1px solid ${border}`,
                    background: inputBg,
                    color: textMain,
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: `1px solid ${border}`,
                    background: "transparent",
                    color: textMuted,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#0077B6",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Save & Generate QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
