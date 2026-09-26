"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminTheme } from "@/app/admin/layout";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminCard from "@/components/admin/ui/AdminCard";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import {
  ArrowLeft,
  Printer,
  Truck,
  Package,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Save,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileText,
} from "lucide-react";

interface OrderItem {
  id?: string;
  name: string;
  code?: string;
  color?: string;
  price: number;
  quantity: number;
  image?: string;
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
  country?: string;
}

interface OrderData {
  _id: string;
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: "Paid" | "Pending" | "Refunded";
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  shippingAddress: ShippingAddress;
  courierPartner?: string;
  trackingNumber?: string;
  lrNumber?: string;
  dispatchDate?: string;
  vehicleNumber?: string;
  transportNotes?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  orderDate: string;
  deliveryEstimate?: string;
  discountCode?: string;
  discountAmount?: number;
  shippingAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === "dark";

  const orderId = (params?.id as string) || "";

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    status: "Pending" as OrderData["status"],
    paymentStatus: "Pending" as OrderData["paymentStatus"],
    courierPartner: "VRL Logistics",
    trackingNumber: "",
    lrNumber: "",
    dispatchDate: "",
    vehicleNumber: "",
    transportNotes: "",
  });

  const cardBg = isDark ? "#111827" : "#FFFFFF";
  const border = isDark ? "#1F2937" : "#E5E7EB";
  const textMain = isDark ? "#F9FAFB" : "#111827";
  const textMuted = isDark ? "#9CA3AF" : "#6B7280";
  const inputBg = isDark ? "#1F2937" : "#F9FAFB";
  const tableHeaderBg = isDark ? "#1E293B" : "#F8FAFC";

  const fetchOrder = async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) {
        throw new Error("Order not found or access denied");
      }
      const data: OrderData = await res.json();
      setOrder(data);
      setFormData({
        status: data.status || "Pending",
        paymentStatus: data.paymentStatus || "Pending",
        courierPartner: data.courierPartner || "VRL Logistics",
        trackingNumber: data.trackingNumber || "",
        lrNumber: data.lrNumber || "",
        dispatchDate: data.dispatchDate || new Date().toISOString().split("T")[0],
        vehicleNumber: data.vehicleNumber || "",
        transportNotes: data.transportNotes || "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!order) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/orders/${order._id || order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save order");
      }

      const updated = await res.json();
      setOrder(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
    if (!order) return;
    if (!confirm(`Are you sure you want to delete order ${order.id}? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/orders/${order._id || order.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Order deleted successfully.");
        router.push("/admin/orders");
      } else {
        alert("Failed to delete order.");
      }
    } catch (err: any) {
      alert("Error deleting order: " + err.message);
    }
  };

  const subtotal = (order?.items || []).reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  );

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%" }}>
      {/* Header Bar */}
      <AdminHeader
        title={`Order Details: ${order?.id || orderId}`}
        subtitle="Manage dispatch tracking, fulfillment status, payment confirmation, and delivery details."
        onRefresh={fetchOrder}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {/* Navigation & Actions Top Bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
          className="no-print"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/admin/orders">
              <AdminButton variant="secondary" size="md" icon={<ArrowLeft size={16} />} isDark={isDark}>
                Back to Orders List
              </AdminButton>
            </Link>
            {order && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AdminStatusBadge
                  status={order.status}
                  variant={
                    order.status === "Delivered"
                      ? "success"
                      : order.status === "Cancelled"
                      ? "danger"
                      : "warning"
                  }
                  isDark={isDark}
                />
                <AdminStatusBadge
                  status={order.paymentStatus === "Paid" ? "Payment Paid" : "Payment Pending"}
                  variant={order.paymentStatus === "Paid" ? "success" : "warning"}
                  isDark={isDark}
                />
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link href={`/admin/orders/${order?._id || order?.id || orderId}/invoice`} target="_blank">
              <AdminButton variant="secondary" size="md" icon={<FileText size={16} />} isDark={isDark}>
                View Proforma Bill
              </AdminButton>
            </Link>
            <AdminButton
              variant="primary"
              size="md"
              icon={<Printer size={16} />}
              isDark={isDark}
              onClick={() => {
                window.open(`/admin/orders/${order?._id || order?.id || orderId}/invoice`, "_blank");
              }}
            >
              Print Invoice / Slip
            </AdminButton>
            <AdminButton variant="danger" size="md" icon={<Trash2 size={16} />} isDark={isDark} onClick={handleDelete}>
              Delete Order
            </AdminButton>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "14px",
              color: textMuted,
            }}
          >
            <Clock size={32} style={{ margin: "0 auto 12px", animation: "spin 2s linear infinite" }} />
            <div>Loading order #{orderId}...</div>
          </div>
        )}

        {error && !loading && (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              background: cardBg,
              border: "1px solid #EF4444",
              borderRadius: "14px",
              color: "#EF4444",
            }}
          >
            <AlertCircle size={36} style={{ margin: "0 auto 12px" }} />
            <h3>{error}</h3>
            <div style={{ marginTop: "16px" }}>
              <Link href="/admin/orders">
                <AdminButton variant="primary" size="md" isDark={isDark}>
                  Return to Orders
                </AdminButton>
              </Link>
            </div>
          </div>
        )}

        {/* Order Full View Content */}
        {order && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* KPI Summary Strip */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
              }}
            >
              <AdminCard isDark={isDark}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: textMuted, textTransform: "uppercase" }}>
                  Total Order Value
                </div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#0077B6", marginTop: "4px" }}>
                  ₹{order.totalAmount ? order.totalAmount.toLocaleString("en-IN") : "0"}
                </div>
                <div style={{ fontSize: "11px", color: textMuted, marginTop: "2px" }}>
                  Payment: <strong style={{ color: textMain }}>{order.paymentMethod}</strong>
                </div>
              </AdminCard>

              <AdminCard isDark={isDark}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: textMuted, textTransform: "uppercase" }}>
                  Placed Date & Time
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: textMain, marginTop: "4px" }}>
                  {order.orderDate || new Date(order.createdAt || "").toLocaleDateString("en-IN")}
                </div>
                <div style={{ fontSize: "11px", color: textMuted, marginTop: "2px" }}>
                  Est Delivery: {order.deliveryEstimate || "4-8 business days"}
                </div>
              </AdminCard>

              <AdminCard isDark={isDark}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: textMuted, textTransform: "uppercase" }}>
                  Customer Name
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: textMain, marginTop: "4px" }}>
                  {order.customerName}
                </div>
                <div style={{ fontSize: "11px", color: textMuted, marginTop: "2px" }}>
                  {order.customerPhone}
                </div>
              </AdminCard>

              <AdminCard isDark={isDark}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: textMuted, textTransform: "uppercase" }}>
                  Transport Carrier
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: textMain, marginTop: "4px" }}>
                  {order.courierPartner || "Not Assigned"}
                </div>
                <div style={{ fontSize: "11px", color: textMuted, marginTop: "2px" }}>
                  LR / AWB: {order.trackingNumber || "Pending"}
                </div>
              </AdminCard>
            </div>

            {/* Save Success Alert */}
            {saveSuccess && (
              <div
                style={{
                  padding: "14px 20px",
                  background: isDark ? "#064E3B" : "#ECFDF5",
                  border: "1px solid #10B981",
                  borderRadius: "10px",
                  color: isDark ? "#A7F3D0" : "#065F46",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <CheckCircle2 size={18} /> Order and Transport Tracking details updated successfully!
              </div>
            )}

            {/* 2-Column Main Workspace */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                gap: "24px",
                alignItems: "start",
              }}
            >
              {/* LEFT COLUMN: Items, Customer, Delivery Address */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Ordered Items Table */}
                <div
                  style={{
                    background: cardBg,
                    border: `1px solid ${border}`,
                    borderRadius: "14px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "16px 20px",
                      borderBottom: `1px solid ${border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "15px", color: textMain }}>
                      <Package size={18} style={{ color: "#0077B6" }} />
                      Ordered Items ({order.items?.length || 0})
                    </div>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                      <thead>
                        <tr style={{ background: tableHeaderBg, borderBottom: `1px solid ${border}`, textAlign: "left" }}>
                          <th style={{ padding: "12px 16px", color: textMuted }}>Item</th>
                          <th style={{ padding: "12px 16px", color: textMuted }}>Finish</th>
                          <th style={{ padding: "12px 16px", color: textMuted, textAlign: "center" }}>Qty</th>
                          <th style={{ padding: "12px 16px", color: textMuted, textAlign: "right" }}>Price</th>
                          <th style={{ padding: "12px 16px", color: textMuted, textAlign: "right" }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(order.items || []).map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: `1px solid ${border}` }}>
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "6px", border: `1px solid ${border}` }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: "42px",
                                      height: "42px",
                                      borderRadius: "6px",
                                      background: inputBg,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: textMuted,
                                    }}
                                  >
                                    <Package size={18} />
                                  </div>
                                )}
                                <div>
                                  <div style={{ fontWeight: 700, color: textMain }}>{item.name}</div>
                                  {item.code && <div style={{ fontSize: "11px", color: textMuted }}>SKU: {item.code}</div>}
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "14px 16px", color: textMain }}>
                              {item.color || "Standard"}
                            </td>
                            <td style={{ padding: "14px 16px", textAlign: "center", fontWeight: 700, color: textMain }}>
                              {item.quantity}
                            </td>
                            <td style={{ padding: "14px 16px", textAlign: "right", color: textMain }}>
                              ₹{item.price ? item.price.toLocaleString("en-IN") : "0"}
                            </td>
                            <td style={{ padding: "14px 16px", textAlign: "right", fontWeight: 800, color: textMain }}>
                              ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Financial Summary */}
                  <div style={{ padding: "18px 20px", background: inputBg, borderTop: `1px solid ${border}` }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "340px", marginLeft: "auto", fontSize: "13px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", color: textMuted }}>
                        <span>Subtotal:</span>
                        <span style={{ fontWeight: 600, color: textMain }}>₹{subtotal.toLocaleString("en-IN")}</span>
                      </div>
                      {order.discountAmount ? (
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#10B981" }}>
                          <span>Discount {order.discountCode ? `(${order.discountCode})` : ""}:</span>
                          <span>-₹{order.discountAmount.toLocaleString("en-IN")}</span>
                        </div>
                      ) : null}
                      <div style={{ display: "flex", justifyContent: "space-between", color: textMuted }}>
                        <span>Shipping & Delivery:</span>
                        <span style={{ fontWeight: 600, color: textMain }}>
                          {order.shippingAmount ? `₹${order.shippingAmount.toLocaleString("en-IN")}` : "FREE"}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          paddingTop: "8px",
                          borderTop: `1px solid ${border}`,
                          fontSize: "16px",
                          fontWeight: 800,
                          color: textMain,
                        }}
                      >
                        <span>Grand Total:</span>
                        <span style={{ color: "#0077B6" }}>₹{order.totalAmount ? order.totalAmount.toLocaleString("en-IN") : "0"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Information Card */}
                <div
                  style={{
                    background: cardBg,
                    border: `1px solid ${border}`,
                    borderRadius: "14px",
                    padding: "20px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "15px", color: textMain, marginBottom: "16px" }}>
                    <User size={18} style={{ color: "#0077B6" }} />
                    Customer & Contact Details
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "13px" }}>
                    <div>
                      <div style={{ color: textMuted, fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Full Name</div>
                      <div style={{ fontWeight: 700, color: textMain, marginTop: "2px" }}>{order.customerName}</div>
                    </div>
                    <div>
                      <div style={{ color: textMuted, fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Phone Number</div>
                      <a href={`tel:${order.customerPhone}`} style={{ color: "#0077B6", fontWeight: 700, marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Phone size={12} /> {order.customerPhone}
                      </a>
                    </div>
                    <div>
                      <div style={{ color: textMuted, fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Email Address</div>
                      <a href={`mailto:${order.customerEmail || ""}`} style={{ color: textMain, marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Mail size={12} /> {order.customerEmail || "N/A"}
                      </a>
                    </div>
                    <div>
                      <div style={{ color: textMuted, fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Order Identification</div>
                      <div style={{ fontFamily: "monospace", fontWeight: 700, color: textMain, marginTop: "2px" }}>{order.id}</div>
                    </div>
                  </div>
                </div>

                {/* Shipping & Delivery Address Card */}
                <div
                  style={{
                    background: cardBg,
                    border: `1px solid ${border}`,
                    borderRadius: "14px",
                    padding: "20px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "15px", color: textMain, marginBottom: "16px" }}>
                    <MapPin size={18} style={{ color: "#0077B6" }} />
                    Shipping & Delivery Destination
                  </div>
                  <div style={{ fontSize: "13.5px", color: textMain, lineHeight: 1.6 }}>
                    <div style={{ fontWeight: 800, fontSize: "14px" }}>
                      {order.shippingAddress?.firstName} {order.shippingAddress?.lastName || ""}
                    </div>
                    <div style={{ color: textMuted }}>{order.shippingAddress?.address}</div>
                    <div style={{ color: textMain, fontWeight: 600 }}>
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pinCode}
                    </div>
                    <div style={{ color: textMuted, fontSize: "12px", marginTop: "4px" }}>
                      Country: {order.shippingAddress?.country || "India"} | Contact: {order.shippingAddress?.phone}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Dispatch & Transport Management Form */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Form Card */}
                <form
                  onSubmit={handleSave}
                  style={{
                    background: cardBg,
                    border: `1px solid ${border}`,
                    borderRadius: "14px",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${border}`, paddingBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "16px", color: textMain }}>
                      <Truck size={20} style={{ color: "#0077B6" }} />
                      Order Fulfillment & Dispatch Control
                    </div>
                  </div>

                  {/* Order Status & Payment Status */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "6px" }}>
                        Fulfillment Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: `1px solid ${border}`,
                          background: inputBg,
                          color: textMain,
                          fontSize: "13px",
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
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "6px" }}>
                        Payment Status
                      </label>
                      <select
                        value={formData.paymentStatus}
                        onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: `1px solid ${border}`,
                          background: inputBg,
                          color: textMain,
                          fontSize: "13px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        <option value="Pending">Pending (Unpaid)</option>
                        <option value="Paid">Paid / Captured</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </div>
                  </div>

                  {/* Transport Carrier & LR / Tracking */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "6px" }}>
                        Courier / Transport Partner
                      </label>
                      <input
                        type="text"
                        value={formData.courierPartner}
                        onChange={(e) => setFormData({ ...formData, courierPartner: e.target.value })}
                        placeholder="e.g. VRL Logistics, DTDC, Delhivery..."
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: `1px solid ${border}`,
                          background: inputBg,
                          color: textMain,
                          fontSize: "13px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "6px" }}>
                        LR Number / Tracking AWB
                      </label>
                      <input
                        type="text"
                        value={formData.trackingNumber}
                        onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                        placeholder="e.g. VRL-987654321 / AWB-..."
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: `1px solid ${border}`,
                          background: inputBg,
                          color: textMain,
                          fontSize: "13px",
                          fontFamily: "monospace",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  {/* Dispatch Date & Vehicle */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "6px" }}>
                        Dispatch Date
                      </label>
                      <input
                        type="date"
                        value={formData.dispatchDate}
                        onChange={(e) => setFormData({ ...formData, dispatchDate: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: `1px solid ${border}`,
                          background: inputBg,
                          color: textMain,
                          fontSize: "13px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "6px" }}>
                        Vehicle / Carrier Number
                      </label>
                      <input
                        type="text"
                        value={formData.vehicleNumber}
                        onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                        placeholder="e.g. DL-01-AB-1234"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: `1px solid ${border}`,
                          background: inputBg,
                          color: textMain,
                          fontSize: "13px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  {/* Transport Notes */}
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "6px" }}>
                      Internal Dispatch & Transport Notes
                    </label>
                    <textarea
                      rows={3}
                      value={formData.transportNotes}
                      onChange={(e) => setFormData({ ...formData, transportNotes: e.target.value })}
                      placeholder="Add any instructions, invoice docket references, or notes for the transport team..."
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: `1px solid ${border}`,
                        background: inputBg,
                        color: textMain,
                        fontSize: "13px",
                        boxSizing: "border-box",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>

                  {/* Save Button */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                    <AdminButton
                      type="submit"
                      variant="primary"
                      size="lg"
                      icon={<Save size={16} />}
                      isDark={isDark}
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving Changes..." : "Save Transport & Status Details"}
                    </AdminButton>
                  </div>
                </form>

                {/* Gateway & Online Payment Card */}
                {order.paymentMethod === "Online Payment" && (
                  <div
                    style={{
                      background: cardBg,
                      border: `1px solid ${border}`,
                      borderRadius: "14px",
                      padding: "20px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "15px", color: textMain, marginBottom: "14px" }}>
                      <CreditCard size={18} style={{ color: "#0077B6" }} />
                      Razorpay Gateway Transaction
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", color: textMuted }}>
                        <span>Payment Status:</span>
                        <AdminStatusBadge
                          status={order.paymentStatus}
                          variant={order.paymentStatus === "Paid" ? "success" : "warning"}
                          isDark={isDark}
                        />
                      </div>
                      {order.razorpayOrderId && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: textMuted }}>Razorpay Order ID:</span>
                          <span style={{ fontFamily: "monospace", fontWeight: 700, color: textMain }}>{order.razorpayOrderId}</span>
                        </div>
                      )}
                      {order.razorpayPaymentId && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: textMuted }}>Razorpay Payment ID:</span>
                          <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0077B6" }}>{order.razorpayPaymentId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print, nav, header, aside {
            display: none !important;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          main {
            padding: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
