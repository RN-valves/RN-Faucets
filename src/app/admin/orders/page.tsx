"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminTheme } from "@/app/admin/layout";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminTabs from "@/components/admin/ui/AdminTabs";
import AdminFilterBar from "@/components/admin/ui/AdminFilterBar";
import AdminDataTable, { Column } from "@/components/admin/ui/AdminDataTable";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import AdminCard from "@/components/admin/ui/AdminCard";
import {
  ShoppingCart,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  FileSpreadsheet,
  RefreshCw,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Building2,
  FileText,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";
import * as XLSX from "xlsx";

interface OrderItem {
  id: string;
  name: string;
  code?: string;
  color: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShippingAddress {
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
}

interface OrderData {
  _id: string;
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: "Online Payment" | "Cash on Delivery";
  paymentStatus: "Paid" | "Pending" | "Refunded";
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  shippingAddress: ShippingAddress;
  courierPartner?: string;
  trackingNumber?: string;
  lrNumber?: string;
  dispatchDate?: string;
  vehicleNumber?: string;
  transportNotes?: string;
  orderDate: string;
  deliveryEstimate?: string;
  createdAt?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState<"All" | "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled">("All");

  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });

  // Modal inspection & tracking state
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [transportForm, setTransportForm] = useState({
    status: "Shipped" as OrderData["status"],
    paymentStatus: "Paid" as OrderData["paymentStatus"],
    courierPartner: "VRL Logistics",
    trackingNumber: "",
    lrNumber: "",
    dispatchDate: new Date().toISOString().split("T")[0],
    vehicleNumber: "",
    transportNotes: "",
  });

  async function fetchOrders() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (statusTab !== "All") params.set("status", statusTab);

      const res = await fetch(`/api/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, [statusTab]);

  const handleOpenInspect = (ord: OrderData) => {
    setSelectedOrder(ord);
    setTransportForm({
      status: ord.status,
      paymentStatus: ord.paymentStatus,
      courierPartner: ord.courierPartner || "VRL Logistics",
      trackingNumber: ord.trackingNumber || "",
      lrNumber: ord.lrNumber || "",
      dispatchDate: ord.dispatchDate || new Date().toISOString().split("T")[0],
      vehicleNumber: ord.vehicleNumber || "",
      transportNotes: ord.transportNotes || "",
    });
  };

  const handleQuickStatusChange = async (ord: OrderData, newStatus: OrderData["status"]) => {
    try {
      const res = await fetch(`/api/orders/${ord._id || ord.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === ord._id || o.id === ord.id ? { ...o, status: newStatus } : o))
        );
        fetchOrders();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleSaveTransportDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/orders/${selectedOrder._id || selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transportForm),
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedOrder(updated);
        fetchOrders();
        alert("Transport & tracking details updated successfully!");
      }
    } catch (err) {
      console.error("Failed to save transport details:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const exportToExcel = () => {
    const exportData = orders.map((o) => ({
      "Order ID": o.id,
      "Order Date": o.orderDate,
      "Customer Name": o.customerName,
      "Customer Phone": o.customerPhone,
      "Customer Email": o.customerEmail,
      "Total Amount (₹)": o.totalAmount,
      "Payment Method": o.paymentMethod,
      "Payment Status": o.paymentStatus,
      "Order Status": o.status,
      "Courier Partner": o.courierPartner || "-",
      "Tracking Number": o.trackingNumber || "-",
      "LR Number": o.lrNumber || "-",
      "Dispatch Date": o.dispatchDate || "-",
      "Vehicle Number": o.vehicleNumber || "-",
      "Address": `${o.shippingAddress?.address || ""}, ${o.shippingAddress?.city || ""}, ${o.shippingAddress?.state || ""} - ${o.shippingAddress?.pinCode || ""}`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders Master");
    XLSX.writeFile(workbook, `RN_Orders_Master_${Date.now()}.xlsx`);
  };

  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === "dark";
  const textMain = isDark ? "#FFFFFF" : "#1E293B";

  const orderColumns: Column<OrderData>[] = [
    {
      header: "Order ID & Date",
      accessor: (o: OrderData) => (
        <div>
          <div style={{ fontWeight: 800, color: "#0077B6" }}>{o.id}</div>
          <div style={{ fontSize: "11.5px", opacity: 0.7 }}>{o.orderDate}</div>
        </div>
      ),
    },
    {
      header: "Customer Info",
      accessor: (o: OrderData) => (
        <div style={{ fontSize: "12.5px" }}>
          <div style={{ fontWeight: 700 }}>{o.customerName}</div>
          <div style={{ display: "flex", gap: "10px", opacity: 0.7, fontSize: "11.5px" }}>
            <span><Phone size={11} /> {o.customerPhone}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Items Summary",
      accessor: (o: OrderData) => (
        <div style={{ fontSize: "12.5px", maxWidth: "260px" }}>
          <div style={{ fontWeight: 600 }}>{o.items?.[0]?.name || "Item"}</div>
          {o.items?.length > 1 && <span style={{ fontSize: "11px", opacity: 0.7 }}>+ {o.items.length - 1} more</span>}
        </div>
      ),
    },
    {
      header: "Amount & Payment",
      accessor: (o: OrderData) => (
        <div style={{ fontSize: "12.5px" }}>
          <div style={{ fontWeight: 800 }}>₹{o.totalAmount?.toLocaleString("en-IN")}</div>
          <AdminStatusBadge status={`${o.paymentMethod || "Online"} - ${o.paymentStatus}`} isDark={isDark} />
        </div>
      ),
    },
    {
      header: "Order Status",
      accessor: (o: OrderData) => (
        <select
          value={o.status}
          onChange={(e) => handleQuickStatusChange(o, e.target.value as any)}
          style={{
            background: isDark ? "#161B22" : "#F9FAFB",
            color: textMain,
            border: isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
            borderRadius: "6px",
            padding: "4px 8px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      ),
    },
    {
      header: "Transport Tracking",
      accessor: (o: OrderData) => (
        <div style={{ fontSize: "11.5px", opacity: 0.8 }}>
          {o.courierPartner ? (
            <div>
              <div style={{ fontWeight: 600 }}>{o.courierPartner}</div>
              <div style={{ fontFamily: "monospace", fontSize: "11px" }}>LR: {o.trackingNumber || "N/A"}</div>
            </div>
          ) : (
            <span style={{ fontStyle: "italic", opacity: 0.6 }}>Not dispatched</span>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      align: "right",
      accessor: (o: OrderData) => (
        <AdminButton
          variant="secondary"
          size="sm"
          icon={<Eye size={13} />}
          isDark={isDark}
          onClick={() => setSelectedOrder(o)}
        >
          Inspect & Dispatch
        </AdminButton>
      ),
    },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%" }}>
      <AdminHeader
        title="Orders & Transport Tracking Management"
        subtitle="Track live customer orders, update transport dispatch details, and manage payment statuses."
        onRefresh={fetchOrders}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <AdminCard isDark={isDark} style={{ cursor: "pointer" }} onClick={() => setStatusTab("All")}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11.5px", fontWeight: 700, opacity: 0.7, textTransform: "uppercase" }}>All Orders</span>
                <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "4px" }}>{counts.total}</div>
              </div>
              <ShoppingCart size={20} />
            </div>
          </AdminCard>
          <AdminCard isDark={isDark} style={{ cursor: "pointer" }} onClick={() => setStatusTab("Pending")}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#F59E0B", textTransform: "uppercase" }}>Pending</span>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#F59E0B", marginTop: "4px" }}>{counts.pending}</div>
              </div>
              <Clock size={20} />
            </div>
          </AdminCard>
          <AdminCard isDark={isDark} style={{ cursor: "pointer" }} onClick={() => setStatusTab("Processing")}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#0EA5E9", textTransform: "uppercase" }}>Processing</span>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#0EA5E9", marginTop: "4px" }}>{counts.processing}</div>
              </div>
              <Package size={20} />
            </div>
          </AdminCard>
          <AdminCard isDark={isDark} style={{ cursor: "pointer" }} onClick={() => setStatusTab("Shipped")}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#4F46E5", textTransform: "uppercase" }}>Shipped</span>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#4F46E5", marginTop: "4px" }}>{counts.shipped}</div>
              </div>
              <Truck size={20} />
            </div>
          </AdminCard>
          <AdminCard isDark={isDark} style={{ cursor: "pointer" }} onClick={() => setStatusTab("Delivered")}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#10B981", textTransform: "uppercase" }}>Delivered</span>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#10B981", marginTop: "4px" }}>{counts.delivered}</div>
              </div>
              <CheckCircle2 size={20} />
            </div>
          </AdminCard>
        </div>

        <AdminTabs
          isDark={isDark}
          activeTab={statusTab}
          onChange={(t) => setStatusTab(t as any)}
          tabs={[
            { id: "All", label: "All Orders" },
            { id: "Pending", label: "Pending" },
            { id: "Processing", label: "Processing" },
            { id: "Shipped", label: "Shipped" },
            { id: "Delivered", label: "Delivered" },
            { id: "Cancelled", label: "Cancelled" },
          ]}
          rightAction={
            <AdminButton variant="secondary" size="md" icon={<FileSpreadsheet size={15} />} isDark={isDark} onClick={exportToExcel}>
              Export Excel
            </AdminButton>
          }
        />

        <AdminFilterBar
          isDark={isDark}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by ID, Customer, Courier..."
          actions={
            <AdminButton variant="icon" size="md" icon={<RefreshCw size={15} />} isDark={isDark} onClick={fetchOrders} />
          }
        />

        <AdminDataTable
          isDark={isDark}
          loading={loading}
          columns={orderColumns}
          data={orders}
          keyExtractor={(o) => o._id}
        />
      </main>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Order: {selectedOrder.id}</h3>
                <p className="text-xs text-slate-500 font-mono">Date: {selectedOrder.orderDate}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="space-y-1">
                <p className="font-semibold text-slate-500 uppercase tracking-wider">Customer Contact</p>
                <p className="font-bold text-sm text-slate-900">{selectedOrder.customerName}</p>
                <p className="text-slate-700 flex items-center gap-1">
                  <Phone size={12} className="text-slate-400" />
                  {selectedOrder.customerPhone}
                </p>
                {selectedOrder.customerEmail && (
                  <p className="text-slate-700 flex items-center gap-1">
                    <Mail size={12} className="text-slate-400" />
                    {selectedOrder.customerEmail}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-slate-500 uppercase tracking-wider">Delivery Shipping Address</p>
                <p className="text-slate-800 leading-relaxed">
                  {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - <strong>{selectedOrder.shippingAddress?.pinCode}</strong>
                </p>
              </div>
            </div>

            {/* Purchased Items List */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Purchased Items ({selectedOrder.items?.length})</p>
              <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-white">
                {selectedOrder.items?.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={it.image} alt={it.name} className="w-10 h-10 object-contain border border-slate-200 rounded p-1 bg-slate-50" />
                      <div>
                        <p className="font-bold text-slate-900">{it.name}</p>
                        <p className="text-slate-500">Color: {it.color || "Standard"} • SKU: {it.code || it.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">₹{(it.price * it.quantity).toLocaleString("en-IN")}</p>
                      <p className="text-slate-500">₹{it.price} x {it.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transport & Dispatch Tracking Form */}
            <form onSubmit={handleSaveTransportDetails} className="space-y-4 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Truck size={18} className="text-indigo-600" />
                  Order Transport & Dispatch Tracking Details
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Order Workflow Status</label>
                  <select
                    value={transportForm.status}
                    onChange={(e) => setTransportForm({ ...transportForm, status: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white font-semibold text-xs"
                  >
                    <option value="Pending">⏳ Pending</option>
                    <option value="Processing">📦 Processing</option>
                    <option value="Shipped">🚚 Shipped / In Transit</option>
                    <option value="Delivered">✅ Delivered</option>
                    <option value="Cancelled">❌ Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Payment Status</label>
                  <select
                    value={transportForm.paymentStatus}
                    onChange={(e) => setTransportForm({ ...transportForm, paymentStatus: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white font-semibold text-xs"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Courier / Transport Partner</label>
                  <input
                    type="text"
                    placeholder="e.g. VRL Logistics, BlueDart, Safexpress, Delhivery"
                    value={transportForm.courierPartner}
                    onChange={(e) => setTransportForm({ ...transportForm, courierPartner: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">AWB / Tracking Number</label>
                  <input
                    type="text"
                    placeholder="e.g. VRL-89471928"
                    value={transportForm.trackingNumber}
                    onChange={(e) => setTransportForm({ ...transportForm, trackingNumber: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Lorry Receipt (LR) No.</label>
                  <input
                    type="text"
                    placeholder="e.g. LR-481920"
                    value={transportForm.lrNumber}
                    onChange={(e) => setTransportForm({ ...transportForm, lrNumber: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Vehicle No.</label>
                  <input
                    type="text"
                    placeholder="e.g. DL 01 AB 1234"
                    value={transportForm.vehicleNumber}
                    onChange={(e) => setTransportForm({ ...transportForm, vehicleNumber: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Dispatch Date</label>
                  <input
                    type="date"
                    value={transportForm.dispatchDate}
                    onChange={(e) => setTransportForm({ ...transportForm, dispatchDate: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Special Transport / Handling Notes</label>
                <textarea
                  rows={2}
                  value={transportForm.transportNotes}
                  onChange={(e) => setTransportForm({ ...transportForm, transportNotes: e.target.value })}
                  placeholder="e.g. Handle with care - Glass/Ceramic items fragile. Dispatch via Express Cargo."
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {isUpdating ? "Saving Transport Details..." : "Save Transport & Dispatch Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
