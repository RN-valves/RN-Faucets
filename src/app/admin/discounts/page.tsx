"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminTheme } from "@/app/admin/layout";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminFilterBar from "@/components/admin/ui/AdminFilterBar";
import AdminDataTable, { Column } from "@/components/admin/ui/AdminDataTable";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import AdminCard from "@/components/admin/ui/AdminCard";
import {
  Tag,
  Plus,
  Copy,
  Check,
  Percent,
  IndianRupee,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  X,
  Clock,
  ShieldCheck,
} from "lucide-react";

interface DiscountItem {
  _id: string;
  id: string;
  name: string;
  type: "Amount" | "Percent" | string;
  value: number;
  startValue: number;
  endValue: number;
  expiredAt: string;
  status: "Active" | "Inactive" | string;
  createdAt?: string;
}

export default function AdminDiscountsPage() {
  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === "dark";

  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [typeFilter, setTypeFilter] = useState<"All" | "Percent" | "Amount">("All");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DiscountItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "Percent" as "Amount" | "Percent",
    value: 10,
    startValue: 1500,
    endValue: 4999,
    expiredAt: "2026-12-31",
    status: "Active" as "Active" | "Inactive",
  });
  const [isSaving, setIsSaving] = useState(false);

  async function fetchDiscounts() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (statusFilter !== "All") params.set("status", statusFilter);

      const res = await fetch(`/api/discounts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDiscounts(data.discounts || []);
      }
    } catch (err) {
      console.error("Failed to fetch discounts:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDiscounts();
  }, [statusFilter]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      type: "Percent",
      value: 10,
      startValue: 1500,
      endValue: 4999,
      expiredAt: "2026-12-31",
      status: "Active",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: DiscountItem) => {
    setEditingItem(item);
    const expDate = item.expiredAt
      ? item.expiredAt.split("T")[0]
      : "2026-12-31";

    setFormData({
      name: item.name,
      type: (item.type?.toLowerCase().includes("amount") ? "Amount" : "Percent") as "Amount" | "Percent",
      value: Number(item.value) || 0,
      startValue: Number(item.startValue) || 0,
      endValue: Number(item.endValue) || 999999,
      expiredAt: expDate,
      status: (item.status === "Active" ? "Active" : "Inactive") as "Active" | "Inactive",
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (item: DiscountItem) => {
    const nextStatus = item.status === "Active" ? "Inactive" : "Active";
    try {
      const res = await fetch(`/api/discounts/${item._id || item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setDiscounts((prev) =>
          prev.map((d) => (d._id === item._id || d.id === item.id ? { ...d, status: nextStatus } : d))
        );
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDelete = async (item: DiscountItem) => {
    if (!confirm(`Are you sure you want to delete promo code ${item.name}?`)) return;
    try {
      const res = await fetch(`/api/discounts/${item._id || item.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchDiscounts();
      }
    } catch (err) {
      console.error("Failed to delete discount:", err);
    }
  };

  const handleSaveDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name.trim().toUpperCase(),
        type: formData.type,
        value: Number(formData.value),
        startValue: Number(formData.startValue),
        endValue: Number(formData.endValue),
        expiredAt: formData.expiredAt,
        status: formData.status,
      };

      let res;
      if (editingItem) {
        res = await fetch(`/api/discounts/${editingItem._id || editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/discounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setShowModal(false);
        fetchDiscounts();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save discount promo code.");
      }
    } catch (err: any) {
      console.error("Save discount error:", err);
      alert(err.message || "Something went wrong while saving discount.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Never";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr.split("T")[0] || dateStr;
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Filtered List
  const filteredDiscounts = discounts.filter((d) => {
    const matchesSearch =
      !searchQuery ||
      d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(d.value).includes(searchQuery);

    const matchesType =
      typeFilter === "All" ||
      (typeFilter === "Percent" && d.type?.toLowerCase().includes("percent")) ||
      (typeFilter === "Amount" && d.type?.toLowerCase().includes("amount"));

    return matchesSearch && matchesType;
  });

  // Metrics
  const totalCount = discounts.length;
  const activeCount = discounts.filter((d) => d.status === "Active").length;
  const percentCount = discounts.filter((d) => d.type?.toLowerCase().includes("percent")).length;
  const amountCount = discounts.filter((d) => d.type?.toLowerCase().includes("amount")).length;

  const cardBg = isDark ? "#0D1117" : "#FFFFFF";
  const cardBorder = isDark ? "1px solid #21262D" : "1px solid #E5E7EB";
  const textMuted = isDark ? "#8B949E" : "#6B7280";
  const textMain = isDark ? "#F0F6FC" : "#111827";

  const columns: Column<DiscountItem>[] = [
    {
      header: "Promo Code",
      accessor: (d) => {
        const isCopied = copiedCode === d.name;
        const isPercent = (d.type || "").toLowerCase().includes("percent");

        return (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: isPercent
                  ? (isDark ? "rgba(56, 189, 248, 0.15)" : "#E0F2FE")
                  : (isDark ? "rgba(16, 185, 129, 0.15)" : "#ECFDF5"),
                color: isPercent ? (isDark ? "#38BDF8" : "#0284C7") : (isDark ? "#34D399" : "#059669"),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {isPercent ? <Percent size={18} /> : <IndianRupee size={18} />}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 800,
                    fontSize: "14px",
                    letterSpacing: "0.04em",
                    color: textMain,
                  }}
                >
                  {d.name}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(d.name)}
                  title="Copy Code"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "2px",
                    color: isCopied ? "#10B981" : textMuted,
                  }}
                >
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <div style={{ fontSize: "11px", color: textMuted }}>
                {isPercent ? "Percentage Rule" : "Flat Amount Rule"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Benefit / Value",
      accessor: (d) => {
        const isPercent = (d.type || "").toLowerCase().includes("percent");
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color: isPercent ? (isDark ? "#38BDF8" : "#0284C7") : (isDark ? "#34D399" : "#059669"),
              }}
            >
              {isPercent ? `${d.value}% OFF` : `₹${Number(d.value).toLocaleString("en-IN")} OFF`}
            </span>
          </div>
        );
      },
    },
    {
      header: "Cart Slab Tier",
      accessor: (d) => (
        <div style={{ fontSize: "12.5px" }}>
          <div style={{ color: textMain, fontWeight: 600 }}>
            Min: <strong>₹{Number(d.startValue || 0).toLocaleString("en-IN")}</strong>
          </div>
          <div style={{ color: textMuted, fontSize: "11.5px" }}>
            Max: {d.endValue && Number(d.endValue) < 900000 ? `₹${Number(d.endValue).toLocaleString("en-IN")}` : "No Limit"}
          </div>
        </div>
      ),
    },
    {
      header: "Expiry Date",
      accessor: (d) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: textMain }}>
          <Calendar size={13} style={{ color: textMuted }} />
          <span>{formatDate(d.expiredAt)}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (d) => {
        const isActive = d.status === "Active";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AdminStatusBadge
              status={isActive ? "Active" : "Inactive"}
              variant={isActive ? "success" : "danger"}
              isDark={isDark}
            />
            <button
              type="button"
              onClick={() => handleToggleStatus(d)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "11.5px",
                fontWeight: 600,
                color: isActive ? "#DC2626" : "#059669",
                textDecoration: "underline",
                padding: "0 4px",
              }}
            >
              {isActive ? "Disable" : "Enable"}
            </button>
          </div>
        );
      },
    },
    {
      header: "Actions",
      align: "right",
      accessor: (d) => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
          <AdminButton
            variant="secondary"
            size="sm"
            icon={<Edit2 size={13} />}
            isDark={isDark}
            onClick={() => handleOpenEdit(d)}
          >
            Edit
          </AdminButton>
          <AdminButton
            variant="danger"
            size="sm"
            icon={<Trash2 size={13} />}
            isDark={isDark}
            onClick={() => handleDelete(d)}
          >
            Delete
          </AdminButton>
        </div>
      ),
    },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title="Discounts & Coupon Promo Engine"
        subtitle="Configure promotional discount promo codes, cart-level threshold slabs, percentage deductions, and coupon validity."
        onRefresh={fetchDiscounts}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {/* Top Metric Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              background: cardBg,
              border: cardBorder,
              borderRadius: "12px",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: textMuted, letterSpacing: "0.04em" }}>
                Total Promo Codes
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: textMain, marginTop: "4px" }}>
                {totalCount}
              </div>
            </div>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: isDark ? "rgba(56, 189, 248, 0.15)" : "#E0F2FE",
                color: isDark ? "#38BDF8" : "#0284C7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Tag size={22} />
            </div>
          </div>

          <div
            style={{
              background: cardBg,
              border: cardBorder,
              borderRadius: "12px",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: textMuted, letterSpacing: "0.04em" }}>
                Active Coupons
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#10B981", marginTop: "4px" }}>
                {activeCount}
              </div>
            </div>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: isDark ? "rgba(16, 185, 129, 0.15)" : "#ECFDF5",
                color: "#10B981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 size={22} />
            </div>
          </div>

          <div
            style={{
              background: cardBg,
              border: cardBorder,
              borderRadius: "12px",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: textMuted, letterSpacing: "0.04em" }}>
                Percentage Rules
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: isDark ? "#38BDF8" : "#0284C7", marginTop: "4px" }}>
                {percentCount}
              </div>
            </div>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: isDark ? "rgba(56, 189, 248, 0.15)" : "#E0F2FE",
                color: isDark ? "#38BDF8" : "#0284C7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Percent size={22} />
            </div>
          </div>

          <div
            style={{
              background: cardBg,
              border: cardBorder,
              borderRadius: "12px",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: textMuted, letterSpacing: "0.04em" }}>
                Flat Amount Rules
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: isDark ? "#A78BFA" : "#7C3AED", marginTop: "4px" }}>
                {amountCount}
              </div>
            </div>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: isDark ? "rgba(167, 139, 250, 0.15)" : "#F3E8FF",
                color: isDark ? "#A78BFA" : "#7C3AED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IndianRupee size={22} />
            </div>
          </div>
        </div>

        {/* Filter & Action Bar */}
        <AdminFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search promo code (e.g. RN05OFF, WELCOME200)..."
          isDark={isDark}
          filters={
            <>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                style={{
                  padding: "9px 14px",
                  borderRadius: "8px",
                  border: isDark ? "1px solid #30363D" : "1px solid #D1D5DB",
                  background: isDark ? "#161B22" : "#FFFFFF",
                  color: textMain,
                  fontSize: "13px",
                  fontWeight: 600,
                  outline: "none",
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                style={{
                  padding: "9px 14px",
                  borderRadius: "8px",
                  border: isDark ? "1px solid #30363D" : "1px solid #D1D5DB",
                  background: isDark ? "#161B22" : "#FFFFFF",
                  color: textMain,
                  fontSize: "13px",
                  fontWeight: 600,
                  outline: "none",
                }}
              >
                <option value="All">All Rule Types</option>
                <option value="Percent">Percentage (% OFF)</option>
                <option value="Amount">Flat Amount (₹ OFF)</option>
              </select>
            </>
          }
          actions={
            <AdminButton
              variant="primary"
              icon={<Plus size={16} />}
              isDark={isDark}
              onClick={handleOpenAdd}
            >
              Create New Promo Code
            </AdminButton>
          }
        />

        {/* Main Data Table */}
        <AdminDataTable
          columns={columns}
          data={filteredDiscounts}
          keyExtractor={(d) => d._id || d.id}
          loading={loading}
          isDark={isDark}
          emptyState={
            <div style={{ padding: "48px 20px", textAlign: "center" }}>
              <Tag size={36} style={{ color: textMuted, margin: "0 auto 12px auto" }} />
              <div style={{ fontSize: "16px", fontWeight: 700, color: textMain }}>No Discount Promo Codes Found</div>
              <div style={{ fontSize: "13px", color: textMuted, marginTop: "4px" }}>
                Create your first promotional discount slab code by clicking the &ldquo;Create New Promo Code&rdquo; button above.
              </div>
            </div>
          }
        />
      </main>

      {/* Create / Edit Promo Code Modal Dialog */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            boxSizing: "border-box",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: isDark ? "#161B22" : "#FFFFFF",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "580px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              border: isDark ? "1px solid #30363D" : "1px solid #E5E7EB",
              fontFamily: "'Manrope', system-ui, sans-serif",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: isDark ? "1px solid #21262D" : "1px solid #E5E7EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: isDark ? "#0D1117" : "#F9FAFB",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Tag size={20} color={isDark ? "#38BDF8" : "#0284C7"} />
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: textMain }}>
                  {editingItem ? "Edit Discount Promo Code" : "Create New Promo Code Slab"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: textMuted,
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveDiscount} style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "18px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: textMain, marginBottom: "6px" }}>
                    Promo Code Name <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RN05OFF, FESTIVE10, B2BBULK15"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      border: isDark ? "1px solid #30363D" : "1px solid #D1D5DB",
                      background: isDark ? "#0D1117" : "#FFFFFF",
                      color: textMain,
                      fontFamily: "monospace",
                      fontWeight: 800,
                      fontSize: "14px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <span style={{ display: "block", fontSize: "11px", color: textMuted, marginTop: "4px" }}>
                    Unique promo coupon entered by customers during checkout.
                  </span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: textMain, marginBottom: "6px" }}>
                    Discount Type <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      border: isDark ? "1px solid #30363D" : "1px solid #D1D5DB",
                      background: isDark ? "#0D1117" : "#FFFFFF",
                      color: textMain,
                      fontSize: "13.5px",
                      fontWeight: 600,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="Percent">Percentage (% OFF)</option>
                    <option value="Amount">Fixed Amount (₹ OFF)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: textMain, marginBottom: "6px" }}>
                    Discount Value ({formData.type === "Percent" ? "%" : "₹"}) <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={formData.type === "Percent" ? 100 : 999999}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      border: isDark ? "1px solid #30363D" : "1px solid #D1D5DB",
                      background: isDark ? "#0D1117" : "#FFFFFF",
                      color: textMain,
                      fontSize: "13.5px",
                      fontWeight: 700,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: textMain, marginBottom: "6px" }}>
                    Min Cart Order (₹) <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.startValue}
                    onChange={(e) => setFormData({ ...formData, startValue: Number(e.target.value) })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      border: isDark ? "1px solid #30363D" : "1px solid #D1D5DB",
                      background: isDark ? "#0D1117" : "#FFFFFF",
                      color: textMain,
                      fontSize: "13.5px",
                      fontWeight: 600,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: textMain, marginBottom: "6px" }}>
                    Max Cart Order (₹)
                  </label>
                  <input
                    type="number"
                    min={formData.startValue}
                    value={formData.endValue}
                    onChange={(e) => setFormData({ ...formData, endValue: Number(e.target.value) })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      border: isDark ? "1px solid #30363D" : "1px solid #D1D5DB",
                      background: isDark ? "#0D1117" : "#FFFFFF",
                      color: textMain,
                      fontSize: "13.5px",
                      fontWeight: 600,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: textMain, marginBottom: "6px" }}>
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiredAt}
                    onChange={(e) => setFormData({ ...formData, expiredAt: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      border: isDark ? "1px solid #30363D" : "1px solid #D1D5DB",
                      background: isDark ? "#0D1117" : "#FFFFFF",
                      color: textMain,
                      fontSize: "13.5px",
                      fontWeight: 600,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: textMain, marginBottom: "6px" }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      border: isDark ? "1px solid #30363D" : "1px solid #D1D5DB",
                      background: isDark ? "#0D1117" : "#FFFFFF",
                      color: textMain,
                      fontSize: "13.5px",
                      fontWeight: 600,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="Active">Active (Available for checkout)</option>
                    <option value="Inactive">Inactive (Disabled)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "24px",
                  paddingTop: "18px",
                  borderTop: isDark ? "1px solid #21262D" : "1px solid #E5E7EB",
                }}
              >
                <AdminButton
                  variant="secondary"
                  isDark={isDark}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </AdminButton>
                <AdminButton
                  variant="primary"
                  isDark={isDark}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : editingItem ? "Update Promo Code" : "Save Promo Code"}
                </AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
