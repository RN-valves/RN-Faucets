"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminTheme } from "@/app/admin/layout";
import { AdminAttributeItem } from "@/types/admin";
import { getAdminAttributes, addAdminAttribute, deleteAdminAttribute } from "@/utils/adminStore";
import {
  Plus,
  Trash2,
  Tag,
  Palette,
  Maximize,
  Layers,
  Search,
  Download,
  ListOrdered,
  ChevronLeft,
  ChevronRight,
  Edit2,
  CheckCircle2,
  FolderTree,
} from "lucide-react";
import * as XLSX from "xlsx";

import AdminButton from "@/components/admin/ui/AdminButton";
import AdminTabs from "@/components/admin/ui/AdminTabs";
import AdminDataTable, { Column } from "@/components/admin/ui/AdminDataTable";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";

interface BulletItem {
  id: number;
  bulletId?: string;
  categoryId?: number;
  modelType?: string;
  modelId?: number;
  name: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

type TabType = "Brand" | "Color" | "Size" | "Material" | "Bullets";

function AttributesContent() {
  const { theme, toggleTheme } = useAdminTheme();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialType = searchParams.get("type");
  const validTabs: TabType[] = ["Brand", "Color", "Size", "Material", "Bullets"];
  const matchedTab = validTabs.find((t) => t.toLowerCase() === initialType?.toLowerCase()) || "Bullets";

  const [activeTab, setActiveTab] = useState<TabType>(matchedTab);
  const [bulletSub, setBulletSub] = useState<"product" | "category">("product");

  // Standard Attributes State
  const [attributes, setAttributes] = useState<AdminAttributeItem[]>([]);
  const [loadingAttrs, setLoadingAttrs] = useState(false);

  // Bullets State
  const [bullets, setBullets] = useState<BulletItem[]>([]);
  const [loadingBullets, setLoadingBullets] = useState(false);
  const [bulletTotal, setBulletTotal] = useState(0);
  const [bulletPage, setBulletPage] = useState(1);
  const [bulletLimit] = useState(25);
  const [bulletSearch, setBulletSearch] = useState("");
  const [newBulletName, setNewBulletName] = useState("");
  const [isSubmittingBullet, setIsSubmittingBullet] = useState(false);

  // Edit Bullet State
  const [editingBullet, setEditingBullet] = useState<BulletItem | null>(null);
  const [editBulletName, setEditBulletName] = useState("");

  // Standard Attribute Form State
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

  // Synchronize activeTab with URL param if changed externally
  useEffect(() => {
    const t = searchParams.get("type");
    if (t) {
      const match = validTabs.find((tab) => tab.toLowerCase() === t.toLowerCase());
      if (match && match !== activeTab) {
        setActiveTab(match);
      }
    }
  }, [searchParams]);

  // Load standard attributes
  const loadAttributes = async () => {
    if (activeTab === "Bullets") return;
    setLoadingAttrs(true);
    const data = await getAdminAttributes(activeTab);
    setAttributes(data);
    setLoadingAttrs(false);
  };

  // Load bullets
  const loadBullets = async () => {
    if (activeTab !== "Bullets") return;
    setLoadingBullets(true);
    try {
      const params = new URLSearchParams({
        sub: bulletSub,
        page: bulletPage.toString(),
        limit: bulletLimit.toString(),
      });
      if (bulletSearch.trim()) params.set("q", bulletSearch.trim());

      const res = await fetch(`/api/bullets?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBullets(data.items || []);
        setBulletTotal(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch bullets:", err);
    } finally {
      setLoadingBullets(false);
    }
  };

  useEffect(() => {
    if (activeTab === "Bullets") {
      loadBullets();
    } else {
      loadAttributes();
    }
  }, [activeTab, bulletSub, bulletPage, bulletSearch]);

  const handleTabChange = (newTab: string) => {
    const tab = newTab as TabType;
    setActiveTab(tab);
    setBulletPage(1);
    router.replace(`/admin/attributes?type=${tab}`);
  };

  // --- STANDARD ATTRIBUTE HANDLERS ---
  const handleAddAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addAdminAttribute({
      type: activeTab as any,
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

  const handleDeleteAttribute = async (id: string) => {
    if (confirm(`Are you sure you want to delete this ${activeTab}?`)) {
      await deleteAdminAttribute(id);
      await loadAttributes();
    }
  };

  // --- BULLETS HANDLERS ---
  const handleQuickAddBullet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBulletName.trim()) return;
    setIsSubmittingBullet(true);
    try {
      const res = await fetch("/api/bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBulletName.trim(),
          sub: bulletSub,
          status: "Active",
        }),
      });
      if (res.ok) {
        setNewBulletName("");
        loadBullets();
      }
    } catch (err) {
      console.error("Add bullet failed:", err);
    } finally {
      setIsSubmittingBullet(false);
    }
  };

  const handleDeleteBullet = async (id: number) => {
    if (!confirm(`Are you sure you want to delete bullet point #${id}?`)) return;
    try {
      const res = await fetch(`/api/bullets?id=${id}&sub=${bulletSub}`, { method: "DELETE" });
      if (res.ok) {
        loadBullets();
      }
    } catch (err) {
      console.error("Delete bullet failed:", err);
    }
  };

  const handleSaveEditBullet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBullet || !editBulletName.trim()) return;
    try {
      const res = await fetch("/api/bullets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingBullet.id,
          name: editBulletName.trim(),
          sub: bulletSub,
        }),
      });
      if (res.ok) {
        setEditingBullet(null);
        loadBullets();
      }
    } catch (err) {
      console.error("Update bullet failed:", err);
    }
  };

  const handleExportExcel = () => {
    const exportData = bullets.map((b) => ({
      ID: b.id,
      Bullet_ID: b.bulletId || `PB${b.id}`,
      Name: b.name,
      Status: b.status,
      Created_At: b.createdAt ? new Date(b.createdAt).toLocaleString("en-IN") : "",
      ...(bulletSub === "category" ? { Model_Type: b.modelType, Model_ID: b.modelId } : {}),
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, bulletSub === "category" ? "CategoryBullets" : "ProductBullets");
    XLSX.writeFile(workbook, `${bulletSub}_bullets_export_${Date.now()}.xlsx`);
  };

  // Columns for Standard Attributes
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
          onClick={() => handleDeleteAttribute(attr.id)}
          title="Delete attribute"
        />
      ),
    },
  ];

  // Columns for Bullets
  const bulletColumns: Column<BulletItem>[] = [
    {
      header: "ID",
      width: "90px",
      accessor: (item) => (
        <span
          style={{
            fontFamily: "monospace",
            fontWeight: 700,
            fontSize: "13px",
            color: "#0077B6",
          }}
        >
          {bulletSub === "product" ? `PB${item.id}` : `#${item.id}`}
        </span>
      ),
    },
    {
      header: "Bullet Point Specification",
      accessor: (item) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontWeight: 600, fontSize: "14px", color: textMain }}>{item.name}</span>
          {bulletSub === "category" && item.modelType && (
            <span
              style={{
                fontSize: "11px",
                background: isDark ? "#21262D" : "#E5E7EB",
                padding: "2px 8px",
                borderRadius: "4px",
                color: textMuted,
              }}
            >
              {item.modelType} #{item.modelId}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Created Date",
      width: "180px",
      accessor: (item) => (
        <span style={{ fontSize: "12px", color: textMuted }}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }) : "N/A"}
        </span>
      ),
    },
    {
      header: "Status",
      width: "110px",
      accessor: (item) => <AdminStatusBadge status={item.status} variant="success" isDark={isDark} />,
    },
    {
      header: "Actions",
      align: "right",
      width: "100px",
      accessor: (item) => (
        <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
          <AdminButton
            variant="icon"
            size="sm"
            icon={<Edit2 size={14} style={{ color: isDark ? "#58A6FF" : "#2563EB" }} />}
            isDark={isDark}
            onClick={() => {
              setEditingBullet(item);
              setEditBulletName(item.name);
            }}
            title="Edit bullet point"
          />
          <AdminButton
            variant="icon"
            size="sm"
            icon={<Trash2 size={14} style={{ color: "#DC2626" }} />}
            isDark={isDark}
            onClick={() => handleDeleteBullet(item.id)}
            title="Delete bullet point"
          />
        </div>
      ),
    },
  ];

  const totalBulletPages = Math.ceil(bulletTotal / bulletLimit);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title={activeTab === "Bullets" ? "Bullet Points Master" : "Catalogue Attributes Master"}
        subtitle={
          activeTab === "Bullets"
            ? "Manage product specification bullet points and category feature bullets with real database parity."
            : "Manage brands, color palette swatches, product sizes, and material taxonomies."
        }
        onRefresh={activeTab === "Bullets" ? loadBullets : loadAttributes}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <AdminTabs
          isDark={isDark}
          activeTab={activeTab}
          onChange={handleTabChange}
          tabs={[
            { id: "Bullets", label: "Bullet Points Master (530)", icon: <ListOrdered size={16} /> },
            { id: "Brand", label: "Brands (4)", icon: <Tag size={16} /> },
            { id: "Material", label: "Materials (10)", icon: <Layers size={16} /> },
            { id: "Color", label: "Colors (68)", icon: <Palette size={16} /> },
            { id: "Size", label: "Sizes (182)", icon: <Maximize size={16} /> },
          ]}
          rightAction={
            activeTab !== "Bullets" ? (
              <AdminButton
                variant="primary"
                size="md"
                icon={<Plus size={15} />}
                isDark={isDark}
                onClick={() => setShowAddModal(true)}
              >
                Add New {activeTab}
              </AdminButton>
            ) : null
          }
        />

        {/* BULLETS VIEW */}
        {activeTab === "Bullets" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Sub Tabs: Product Bullets (527) vs Category Bullets (3) */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: "12px",
                padding: "14px 18px",
              }}
            >
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setBulletSub("product");
                    setBulletPage(1);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    border: bulletSub === "product" ? "none" : `1px solid ${border}`,
                    background: bulletSub === "product" ? "#0077B6" : "transparent",
                    color: bulletSub === "product" ? "#FFFFFF" : textMuted,
                  }}
                >
                  <ListOrdered size={15} />
                  Product Bullet Points (527)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBulletSub("category");
                    setBulletPage(1);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    border: bulletSub === "category" ? "none" : `1px solid ${border}`,
                    background: bulletSub === "category" ? "#0077B6" : "transparent",
                    color: bulletSub === "category" ? "#FFFFFF" : textMuted,
                  }}
                >
                  <FolderTree size={15} />
                  Category Bullet Points (3)
                </button>
              </div>

              {/* Excel Export Button */}
              <AdminButton
                variant="secondary"
                size="sm"
                icon={<Download size={14} />}
                isDark={isDark}
                onClick={handleExportExcel}
              >
                Export Excel
              </AdminButton>
            </div>

            {/* Quick Add Form (Matching PHP Laravel ProductBulletsController) */}
            <form
              onSubmit={handleQuickAddBullet}
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: "12px",
                padding: "16px 20px",
                display: "flex",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  type="text"
                  required
                  value={newBulletName}
                  onChange={(e) => setNewBulletName(e.target.value)}
                  placeholder={`Enter new ${bulletSub === "product" ? "product" : "category"} bullet point specification...`}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: `1px solid ${border}`,
                    background: inputBg,
                    color: textMain,
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingBullet}
                style={{
                  padding: "10px 22px",
                  borderRadius: "8px",
                  border: "none",
                  background: isDark ? "#238636" : "#16A34A",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: isSubmittingBullet ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  whiteSpace: "nowrap",
                }}
              >
                <Plus size={15} />
                {isSubmittingBullet ? "Saving..." : "Add/Update Point"}
              </button>
            </form>

            {/* Search Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: inputBg,
                border: `1px solid ${border}`,
                borderRadius: "8px",
                padding: "8px 14px",
              }}
            >
              <Search size={16} style={{ color: textMuted }} />
              <input
                type="text"
                value={bulletSearch}
                onChange={(e) => {
                  setBulletSearch(e.target.value);
                  setBulletPage(1);
                }}
                placeholder="Search bullet points by keyword or ID..."
                style={{
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  color: textMain,
                  fontSize: "14px",
                  width: "100%",
                }}
              />
              {bulletSearch && (
                <button
                  type="button"
                  onClick={() => setBulletSearch("")}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: textMuted,
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Bullets Data Table */}
            <AdminDataTable
              isDark={isDark}
              loading={loadingBullets}
              columns={bulletColumns}
              data={bullets}
              keyExtractor={(b) => b.id.toString()}
            />

            {/* Pagination Controls */}
            {totalBulletPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 18px",
                  background: cardBg,
                  border: `1px solid ${border}`,
                  borderRadius: "10px",
                }}
              >
                <span style={{ fontSize: "13px", color: textMuted }}>
                  Showing {(bulletPage - 1) * bulletLimit + 1} -{" "}
                  {Math.min(bulletPage * bulletLimit, bulletTotal)} of {bulletTotal} items
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    type="button"
                    disabled={bulletPage <= 1}
                    onClick={() => setBulletPage((p) => Math.max(1, p - 1))}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: `1px solid ${border}`,
                      background: inputBg,
                      color: bulletPage <= 1 ? textMuted : textMain,
                      cursor: bulletPage <= 1 ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                    }}
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>

                  <span style={{ fontSize: "13px", fontWeight: 700, color: textMain, padding: "0 8px" }}>
                    Page {bulletPage} of {totalBulletPages}
                  </span>

                  <button
                    type="button"
                    disabled={bulletPage >= totalBulletPages}
                    onClick={() => setBulletPage((p) => Math.min(totalBulletPages, p + 1))}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: `1px solid ${border}`,
                      background: inputBg,
                      color: bulletPage >= totalBulletPages ? textMuted : textMain,
                      cursor: bulletPage >= totalBulletPages ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                    }}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* STANDARD ATTRIBUTES VIEW (Brand, Material, Color, Size) */
          <AdminDataTable
            isDark={isDark}
            loading={loadingAttrs}
            columns={attributeColumns}
            data={attributes}
            keyExtractor={(attr) => attr.id}
          />
        )}
      </main>

      {/* Edit Bullet Modal */}
      {editingBullet && (
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
              maxWidth: "500px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", color: textMain }}>
              Edit Bullet Point #{editingBullet.id}
            </h3>
            <form onSubmit={handleSaveEditBullet} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: textMain, marginBottom: "6px" }}>
                  Bullet Point Text *
                </label>
                <textarea
                  required
                  rows={4}
                  value={editBulletName}
                  onChange={(e) => setEditBulletName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: `1px solid ${border}`,
                    background: inputBg,
                    color: textMain,
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setEditingBullet(null)}
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal for Standard Attributes */}
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

export default function AdminAttributesPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading Attributes Master...</div>}>
      <AttributesContent />
    </Suspense>
  );
}
