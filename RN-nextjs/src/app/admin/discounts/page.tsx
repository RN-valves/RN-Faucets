"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminTheme } from "@/app/admin/layout";
import {
  Tag,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Calendar,
  Percent,
  IndianRupee,
  Edit2,
  Trash2,
  RefreshCw,
  Sparkles,
  Layers,
} from "lucide-react";

interface DiscountItem {
  _id: string;
  id: string;
  name: string;
  type: "Amount" | "Percent";
  value: number;
  startValue: number;
  endValue: number;
  expiredAt: string;
  status: "Active" | "Inactive";
  createdAt?: string;
}

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DiscountItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "Percent" as "Amount" | "Percent",
    value: 10,
    startValue: 1500,
    endValue: 1000,
    expiredAt: "2026-12-31",
    status: "Active" as "Active" | "Inactive",
  });

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
      endValue: 1000,
      expiredAt: "2026-12-31",
      status: "Active",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: DiscountItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      type: item.type,
      value: item.value,
      startValue: item.startValue,
      endValue: item.endValue,
      expiredAt: item.expiredAt,
      status: item.status,
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
    if (!formData.name) return;

    try {
      if (editingItem) {
        const res = await fetch(`/api/discounts/${editingItem._id || editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setShowModal(false);
          fetchDiscounts();
        }
      } else {
        const res = await fetch("/api/discounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setShowModal(false);
          fetchDiscounts();
        }
      }
    } catch (err) {
      console.error("Failed to save discount:", err);
    }
  };

  const activeCount = discounts.filter((d) => d.status === "Active").length;

  const { theme, toggleTheme } = useAdminTheme();

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title="Discounts & Coupon Promo Engine"
        subtitle="Create promo codes, set percentage/flat discounts, and manage coupon validity."
        onRefresh={fetchDiscounts}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-[1400px] w-full mx-auto font-sans">
          {/* Header Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Tag className="text-rose-600" size={26} />
                Discounts & Coupon Promo Codes
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Configure promotional promo codes, minimum cart value rules, percentage & flat discounts
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-sm transition"
            >
              <Plus size={16} />
              Create Promo Code
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Coupons</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{discounts.length}</p>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
                <Tag size={22} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Active Promo Codes</p>
                <p className="text-2xl font-bold text-emerald-900 mt-1">{activeCount}</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle2 size={22} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Rule Types</p>
                <p className="text-2xl font-bold text-indigo-900 mt-1">Flat ₹ & % OFF</p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                <Sparkles size={22} />
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search promo code (e.g. RN05OFF)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchDiscounts()}
                className="w-full pl-10 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Status:</span>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {(["All", "Active", "Inactive"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                      statusFilter === st ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={fetchDiscounts}
                className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {/* Promo Code Cards Grid */}
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200">
              Loading promo codes...
            </div>
          ) : discounts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200">
              No promo codes found. Click &quot;Create Promo Code&quot; to add one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discounts.map((item) => (
                <div
                  key={item._id || item.id}
                  className={`bg-white p-5 rounded-2xl border transition relative space-y-4 shadow-sm ${
                    item.status === "Active" ? "border-slate-200 hover:border-rose-300" : "border-slate-200 bg-slate-50/70 opacity-75"
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-extrabold tracking-wider bg-rose-50 text-rose-700 px-3 py-1 rounded-lg border border-rose-200">
                        {item.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(item.name)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 transition"
                        title="Copy Promo Code"
                      >
                        {copiedCode === item.name ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition ${
                        item.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {item.status}
                    </button>
                  </div>

                  {/* Value Highlight */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {item.type === "Percent" ? `${item.value}%` : `₹${item.value}`}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 uppercase">OFF</span>
                  </div>

                  {/* Rules Summary */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Min Cart Amount:</span>
                      <span className="font-semibold text-slate-800">₹{item.startValue.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Max Discount Cap:</span>
                      <span className="font-semibold text-slate-800">₹{item.endValue.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Calendar size={12} />
                        Expiry Date:
                      </span>
                      <span className="font-semibold text-slate-800">{item.expiredAt}</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition inline-flex items-center gap-1"
                    >
                      <Edit2 size={13} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Promo Code"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

      {/* Create / Edit Promo Code Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 relative border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingItem ? `Edit Promo Code: ${editingItem.name}` : "Create New Promo Code"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDiscount} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Promo Code Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RN05OFF or FESTIVE20"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm font-mono uppercase font-bold tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Discount Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    <option value="Percent">Percentage % OFF</option>
                    <option value="Amount">Flat Amount ₹ OFF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Discount Value ({formData.type === "Percent" ? "%" : "₹"}) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.startValue}
                    onChange={(e) => setFormData({ ...formData, startValue: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={formData.endValue}
                    onChange={(e) => setFormData({ ...formData, endValue: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiredAt}
                    onChange={(e) => setFormData({ ...formData, expiredAt: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold text-sm rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg"
                >
                  Save Promo Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
