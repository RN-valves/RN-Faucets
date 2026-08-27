"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminTheme } from "@/app/admin/layout";
import { AdminAttributeItem } from "@/types/admin";
import { getAdminAttributes, addAdminAttribute, deleteAdminAttribute } from "@/utils/adminStore";
import { Plus, Trash2, Tag, Palette, Maximize, Layers } from "lucide-react";

import AdminButton from "@/components/admin/ui/AdminButton";
import AdminTabs from "@/components/admin/ui/AdminTabs";
import AdminDataTable, { Column } from "@/components/admin/ui/AdminDataTable";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";

export default function AdminAttributesPage() {
  const { theme, toggleTheme } = useAdminTheme();
  const [activeTab, setActiveTab] = useState<"Brand" | "Color" | "Size" | "Material">("Brand");
  const [attributes, setAttributes] = useState<AdminAttributeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [hexCode, setHexCode] = useState("#0077B6");
  const [icon, setIcon] = useState("");

  const isDark = theme === "dark";
  const cardBg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#21262D" : "#E5E7EB";
  const textMain = isDark ? "#F0F6FC" : "#111827";
  const textMuted = isDark ? "#8B949E" : "#6B7280";
  const inputBg = isDark ? "#161B22" : "#F9FAFB";

  const loadAttributes = async () => {
    setLoading(true);
    const data = await getAdminAttributes(activeTab);
    setAttributes(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAttributes();
  }, [activeTab]);

  const handleAddAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addAdminAttribute({
      type: activeTab,
      name: name.trim(),
      hexCode: activeTab === "Color" ? hexCode : undefined,
      icon: icon.trim() || undefined,
      status: "Active",
    });

    setName("");
    setHexCode("#0077B6");
    setIcon("");
    setShowAddModal(false);
    await loadAttributes();
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Are you sure you want to delete this ${activeTab}?`)) {
      await deleteAdminAttribute(id);
      await loadAttributes();
    }
  };

  const attributeColumns: Column<AdminAttributeItem>[] = [
    {
      header: `${activeTab} Name`,
      accessor: (attr) => <span style={{ fontWeight: 700 }}>{attr.name}</span>,
    },
    ...(activeTab === "Color"
      ? [
          {
            header: "Color Swatch / Hex",
            accessor: (attr: AdminAttributeItem) => (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: attr.hexCode || "#0077B6",
                    border: "1px solid #CCC",
                  }}
                />
                <span style={{ fontSize: "12px", opacity: 0.8, fontFamily: "monospace" }}>{attr.hexCode || "N/A"}</span>
              </div>
            ),
          } as Column<AdminAttributeItem>,
        ]
      : []),
    {
      header: "Status",
      accessor: (attr) => <AdminStatusBadge status={attr.status} variant="success" isDark={isDark} />,
    },
    {
      header: "Actions",
      align: "right",
      accessor: (attr) => (
        <AdminButton
          variant="icon"
          size="sm"
          icon={<Trash2 size={15} style={{ color: "#DC2626" }} />}
          isDark={isDark}
          onClick={() => handleDelete(attr.id)}
          title="Delete attribute"
        />
      ),
    },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title="Catalogue Attributes Master"
        subtitle="Manage brands, color palette swatches, product sizes, and material taxonomies."
        onRefresh={loadAttributes}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <AdminTabs
          isDark={isDark}
          activeTab={activeTab}
          onChange={(t) => setActiveTab(t as any)}
          tabs={[
            { id: "Brand", label: "Brands Master", icon: <Tag size={16} /> },
            { id: "Color", label: "Colors Master", icon: <Palette size={16} /> },
            { id: "Size", label: "Sizes Master", icon: <Maximize size={16} /> },
            { id: "Material", label: "Materials Master", icon: <Layers size={16} /> },
          ]}
          rightAction={
            <AdminButton
              variant="primary"
              size="md"
              icon={<Plus size={15} />}
              isDark={isDark}
              onClick={() => setShowAddModal(true)}
            >
              Add New {activeTab}
            </AdminButton>
          }
        />

        <AdminDataTable
          isDark={isDark}
          loading={loading}
          columns={attributeColumns}
          data={attributes}
          keyExtractor={(attr) => attr.id}
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
              maxWidth: "460px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", color: textMain }}>Add New {activeTab}</h3>
            <form onSubmit={handleAddAttribute} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: textMain, marginBottom: "6px" }}>
                  {activeTab} Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`e.g. ${activeTab === "Color" ? "Matte Black" : activeTab === "Brand" ? "RN Premium" : "Standard"}`}
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

              {activeTab === "Color" && (
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: textMain, marginBottom: "6px" }}>
                    Color Hex Code / Swatch *
                  </label>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                      type="color"
                      value={hexCode}
                      onChange={(e) => setHexCode(e.target.value)}
                      style={{ width: "42px", height: "42px", border: "none", borderRadius: "6px", cursor: "pointer" }}
                    />
                    <input
                      type="text"
                      value={hexCode}
                      onChange={(e) => setHexCode(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: `1px solid ${border}`,
                        background: inputBg,
                        color: textMain,
                      }}
                    />
                  </div>
                </div>
              )}

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
                  Save {activeTab}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
