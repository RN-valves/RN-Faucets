"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getAdminOrders,
  getAdminProducts,
  getAdminEnquiries,
  updateOrderStatus,
} from "@/utils/adminStore";
import { AdminOrder, AdminProduct, AdminEnquiry } from "@/types/admin";
import { useAdminTheme } from "@/app/admin/layout";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  MessageSquare,
  ArrowUpRight,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  DollarSign,
  ChevronRight,
  X,
} from "lucide-react";
import Link from "next/link";
import AdminShimmer from "@/components/admin/ui/AdminShimmer";

export default function AdminDashboardPage() {
  const { theme, toggleTheme } = useAdminTheme();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [enquiries, setEnquiries] = useState<AdminEnquiry[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const isDark = theme === "dark";

  // Dynamic Theme Colors
  const cardBg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#21262D" : "#E5E7EB";
  const textMain = isDark ? "#F0F6FC" : "#111827";
  const textMuted = isDark ? "#8B949E" : "#6B7280";
  const tableHeaderBg = isDark ? "#161B22" : "#F9FAFB";
  const shadow = isDark ? "none" : "0 2px 10px rgba(0, 0, 0, 0.04)";

  const loadData = async () => {
    setLoading(true);
    try {
      const [ords, prods, enqs] = await Promise.all([
        getAdminOrders(),
        getAdminProducts(),
        getAdminEnquiries(),
      ]);
      setOrders(Array.isArray(ords) ? ords : (ords as any)?.orders || []);
      setProducts(Array.isArray(prods) ? prods : (prods as any)?.products || []);
      setEnquiries(Array.isArray(enqs) ? enqs : (enqs as any)?.enquiries || []);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: AdminOrder["status"]) => {
    await updateOrderStatus(orderId, newStatus);
    await loadData();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeEnquiries = Array.isArray(enquiries) ? enquiries : [];

  // Filter out corrupted / spam test orders with integer-overflow quantities (e.g. legacy test orders with 2.68e21)
  const validOrders = safeOrders.filter(
    (o) =>
      typeof o.totalAmount === "number" &&
      isFinite(o.totalAmount) &&
      o.totalAmount < 10000000 &&
      o.customerPhone !== "9350285800"
  );

  // Non-cancelled orders revenue
  const nonCancelledOrders = validOrders.filter(
    (o) => !["Cancelled", "CANCELED"].includes(o.status)
  );
  const totalRevenue = nonCancelledOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  // Verified & fulfilled sales (Delivered, Shipped, Processing, matching Laravel PHP logic)
  const verifiedOrders = validOrders.filter(
    (o) => !["Cancelled", "CANCELED", "Pending"].includes(o.status)
  );
  const verifiedRevenue = verifiedOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  const pendingOrdersCount = validOrders.filter((o) => o.status === "Pending").length;
  const processingOrdersCount = validOrders.filter((o) => o.status === "Processing").length;
  const shippedOrdersCount = validOrders.filter((o) =>
    ["Shipped", "Out for Pickup", "IN TRANSIT"].includes(o.status)
  ).length;
  const deliveredOrdersCount = validOrders.filter((o) =>
    ["Delivered", "DELIVERED", "RTO Delivered", "RTO DELIVERED"].includes(o.status)
  ).length;
  const newEnquiriesCount = safeEnquiries.filter((e) => e.status === "New").length;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getStatusColor = (status: AdminOrder["status"]) => {
    switch (status) {
      case "Delivered":
        return { bg: isDark ? "rgba(35, 134, 54, 0.15)" : "#D1FAE5", text: isDark ? "#3FB950" : "#065F46", border: "#10B981" };
      case "Shipped":
        return { bg: isDark ? "rgba(56, 139, 253, 0.15)" : "#E0F2FE", text: isDark ? "#58A6FF" : "#0369A1", border: "#0284C7" };
      case "Processing":
        return { bg: isDark ? "rgba(210, 153, 34, 0.15)" : "#FEF3C7", text: isDark ? "#D29922" : "#92400E", border: "#F59E0B" };
      case "Pending":
        return { bg: isDark ? "rgba(163, 113, 247, 0.15)" : "#EDE9FE", text: isDark ? "#BC8CFF" : "#5B21B6", border: "#8B5CF6" };
      case "Cancelled":
        return { bg: isDark ? "rgba(248, 81, 73, 0.15)" : "#FEE2E2", text: isDark ? "#F85149" : "#991B1B", border: "#EF4444" };
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title="RN Valves & Faucets Dashboard"
        subtitle="Real-time performance analytics for RN luxury bathware sales."
        onRefresh={loadData}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main
        style={{
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
          fontFamily: "'Manrope', system-ui, sans-serif",
        }}
      >
        {/* KPI Metrics Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
          }}
        >
          {/* Revenue */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "12px",
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              boxShadow: shadow,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: textMuted }}>
                Total Revenue
              </span>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: isDark ? "rgba(56, 139, 253, 0.12)" : "#E0F2FE",
                  color: "#0077B6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DollarSign size={18} />
              </div>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: textMain, minHeight: "38px", display: "flex", alignItems: "center" }}>
              {loading ? (
                <AdminShimmer width={150} height={28} borderRadius={6} isDark={isDark} />
              ) : (
                formatCurrency(totalRevenue)
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", minHeight: "20px" }}>
              {loading ? (
                <AdminShimmer width={180} height={14} borderRadius={4} isDark={isDark} />
              ) : (
                <>
                  <span style={{ color: "#059669", fontWeight: 700, display: "flex", alignItems: "center", gap: "2px" }}>
                    <ArrowUpRight size={14} /> {formatCurrency(verifiedRevenue)}
                  </span>
                  <span style={{ color: textMuted }}>verified fulfilled sales</span>
                </>
              )}
            </div>
          </div>

          {/* Orders */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "12px",
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              boxShadow: shadow,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: textMuted }}>
                Total Orders
              </span>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: isDark ? "rgba(35, 134, 54, 0.12)" : "#D1FAE5",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShoppingCart size={18} />
              </div>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: textMain, minHeight: "38px", display: "flex", alignItems: "center" }}>
              {loading ? (
                <AdminShimmer width={80} height={28} borderRadius={6} isDark={isDark} />
              ) : (
                validOrders.length
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", minHeight: "20px" }}>
              {loading ? (
                <AdminShimmer width={140} height={14} borderRadius={4} isDark={isDark} />
              ) : (
                <>
                  <span style={{ color: "#059669", fontWeight: 700, display: "flex", alignItems: "center", gap: "2px" }}>
                    <ArrowUpRight size={14} /> +8.5%
                  </span>
                  <span style={{ color: textMuted }}>active fulfillment</span>
                </>
              )}
            </div>
          </div>

          {/* Products */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "12px",
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              boxShadow: shadow,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: textMuted }}>
                Catalog Products
              </span>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: isDark ? "rgba(210, 153, 34, 0.12)" : "#FEF3C7",
                  color: "#D97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Package size={18} />
              </div>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: textMain, minHeight: "38px", display: "flex", alignItems: "center" }}>
              {loading ? (
                <AdminShimmer width={100} height={28} borderRadius={6} isDark={isDark} />
              ) : (
                safeProducts.length
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", minHeight: "20px" }}>
              {loading ? (
                <AdminShimmer width={150} height={14} borderRadius={4} isDark={isDark} />
              ) : (
                <>
                  <span style={{ color: "#D97706", fontWeight: 700 }}>RN Edge Range</span>
                  <span style={{ color: textMuted }}>In Stock</span>
                </>
              )}
            </div>
          </div>

          {/* Enquiries */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "12px",
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              boxShadow: shadow,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: textMuted }}>
                Customer Enquiries
              </span>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: isDark ? "rgba(163, 113, 247, 0.12)" : "#EDE9FE",
                  color: "#7C3AED",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MessageSquare size={18} />
              </div>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: textMain, minHeight: "38px", display: "flex", alignItems: "center" }}>
              {loading ? (
                <AdminShimmer width={90} height={28} borderRadius={6} isDark={isDark} />
              ) : (
                `${newEnquiriesCount} New`
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", minHeight: "20px" }}>
              {loading ? (
                <AdminShimmer width={140} height={14} borderRadius={4} isDark={isDark} />
              ) : (
                <>
                  <span style={{ color: "#7C3AED", fontWeight: 700 }}>{safeEnquiries.length} Total Leads</span>
                  <span style={{ color: textMuted }}>received</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sales Chart & Pipeline */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
          {/* Revenue Velocity SVG Graph */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "12px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              boxShadow: shadow,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: textMain, margin: 0 }}>
                  Sales & Order Velocity
                </h3>
                <span style={{ fontSize: "12px", color: textMuted }}>RN Valves store monthly revenue (INR ₹)</span>
              </div>
              <span
                style={{
                  background: isDark ? "#161B22" : "#F3F4F6",
                  border: `1px solid ${border}`,
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontSize: "12px",
                  color: "#0077B6",
                  fontWeight: 700,
                }}
              >
                August 2026
              </span>
            </div>

            {/* Custom SVG Line Chart */}
            <div style={{ width: "100%", height: "220px", position: "relative" }}>
              {loading ? (
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "10px 0" }}>
                  <AdminShimmer width="100%" height={160} borderRadius={8} isDark={isDark} />
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <AdminShimmer width={50} height={12} borderRadius={3} isDark={isDark} />
                    <AdminShimmer width={50} height={12} borderRadius={3} isDark={isDark} />
                    <AdminShimmer width={50} height={12} borderRadius={3} isDark={isDark} />
                    <AdminShimmer width={50} height={12} borderRadius={3} isDark={isDark} />
                    <AdminShimmer width={70} height={12} borderRadius={3} isDark={isDark} />
                  </div>
                </div>
              ) : (
                <>
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 500 200"
                    preserveAspectRatio="none"
                    style={{ overflow: "visible" }}
                  >
                    <defs>
                      <linearGradient id="rnChartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0077B6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#0077B6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="40" x2="500" y2="40" stroke={border} strokeDasharray="4 4" />
                    <line x1="0" y1="90" x2="500" y2="90" stroke={border} strokeDasharray="4 4" />
                    <line x1="0" y1="140" x2="500" y2="140" stroke={border} strokeDasharray="4 4" />

                    <path
                      d="M 0,160 Q 70,120 140,140 T 280,70 T 400,100 T 500,30 L 500,190 L 0,190 Z"
                      fill="url(#rnChartGrad)"
                    />

                    <path
                      d="M 0,160 Q 70,120 140,140 T 280,70 T 400,100 T 500,30"
                      fill="none"
                      stroke="#0077B6"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    <circle cx="0" cy="160" r="5" fill="#0077B6" />
                    <circle cx="140" cy="140" r="5" fill="#0077B6" />
                    <circle cx="280" cy="70" r="6" fill="#FFFFFF" stroke="#0077B6" strokeWidth="3" />
                    <circle cx="400" cy="100" r="5" fill="#0077B6" />
                    <circle cx="500" cy="30" r="6" fill="#059669" stroke="#FFFFFF" strokeWidth="2" />
                  </svg>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "11px",
                      color: textMuted,
                      marginTop: "12px",
                    }}
                  >
                    <span>01 Aug</span>
                    <span>04 Aug</span>
                    <span>07 Aug</span>
                    <span>10 Aug</span>
                    <span>12 Aug (Today)</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Fulfillment Pipeline */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "12px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: shadow,
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: textMain, margin: 0 }}>
              Fulfillment Pipeline
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: isDark ? "#161B22" : "#F9FAFB",
                  borderRadius: "8px",
                  borderLeft: "4px solid #8B5CF6",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Clock size={16} style={{ color: "#8B5CF6" }} />
                  <span style={{ fontSize: "13px", fontWeight: 700, color: textMain }}>Pending</span>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 800, color: textMain, minWidth: "32px", display: "inline-flex", justifyContent: "flex-end" }}>
                  {loading ? (
                    <AdminShimmer width={32} height={18} borderRadius={4} isDark={isDark} />
                  ) : (
                    pendingOrdersCount
                  )}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: isDark ? "#161B22" : "#F9FAFB",
                  borderRadius: "8px",
                  borderLeft: "4px solid #F59E0B",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Package size={16} style={{ color: "#F59E0B" }} />
                  <span style={{ fontSize: "13px", fontWeight: 700, color: textMain }}>Processing</span>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 800, color: textMain, minWidth: "32px", display: "inline-flex", justifyContent: "flex-end" }}>
                  {loading ? (
                    <AdminShimmer width={32} height={18} borderRadius={4} isDark={isDark} />
                  ) : (
                    processingOrdersCount
                  )}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: isDark ? "#161B22" : "#F9FAFB",
                  borderRadius: "8px",
                  borderLeft: "4px solid #0284C7",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Truck size={16} style={{ color: "#0284C7" }} />
                  <span style={{ fontSize: "13px", fontWeight: 700, color: textMain }}>Shipped</span>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 800, color: textMain, minWidth: "32px", display: "inline-flex", justifyContent: "flex-end" }}>
                  {loading ? (
                    <AdminShimmer width={32} height={18} borderRadius={4} isDark={isDark} />
                  ) : (
                    shippedOrdersCount
                  )}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: isDark ? "#161B22" : "#F9FAFB",
                  borderRadius: "8px",
                  borderLeft: "4px solid #10B981",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <CheckCircle size={16} style={{ color: "#10B981" }} />
                  <span style={{ fontSize: "13px", fontWeight: 700, color: textMain }}>Delivered</span>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 800, color: textMain, minWidth: "32px", display: "inline-flex", justifyContent: "flex-end" }}>
                  {loading ? (
                    <AdminShimmer width={32} height={18} borderRadius={4} isDark={isDark} />
                  ) : (
                    deliveredOrdersCount
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: "12px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            boxShadow: shadow,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: textMain, margin: 0 }}>
                Recent RN Orders
              </h3>
              <span style={{ fontSize: "12.5px", color: textMuted }}>
                Customer orders placed on RN Valves & Faucets store
              </span>
            </div>
            <Link
              href="/admin/orders"
              style={{
                color: "#0077B6",
                fontSize: "13px",
                fontWeight: 700,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              View All Orders <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "13.5px",
              }}
            >
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}`, background: tableHeaderBg, color: textMuted }}>
                  <th style={{ padding: "12px 16px", fontWeight: 700 }}>Order ID</th>
                  <th style={{ padding: "12px 16px", fontWeight: 700 }}>Customer</th>
                  <th style={{ padding: "12px 16px", fontWeight: 700 }}>Date</th>
                  <th style={{ padding: "12px 16px", fontWeight: 700 }}>Payment</th>
                  <th style={{ padding: "12px 16px", fontWeight: 700 }}>Total</th>
                  <th style={{ padding: "12px 16px", fontWeight: 700 }}>Status</th>
                  <th style={{ padding: "12px 16px", fontWeight: 700, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={`shimmer-row-${idx}`} style={{ borderBottom: `1px solid ${border}` }}>
                      <td style={{ padding: "16px" }}>
                        <AdminShimmer width={100} height={18} borderRadius={4} isDark={isDark} />
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <AdminShimmer width={130} height={16} borderRadius={4} isDark={isDark} />
                          <AdminShimmer width={90} height={12} borderRadius={3} isDark={isDark} />
                        </div>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <AdminShimmer width={90} height={14} borderRadius={4} isDark={isDark} />
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <AdminShimmer width={100} height={14} borderRadius={4} isDark={isDark} />
                          <AdminShimmer width={50} height={12} borderRadius={3} isDark={isDark} />
                        </div>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <AdminShimmer width={70} height={18} borderRadius={4} isDark={isDark} />
                      </td>
                      <td style={{ padding: "16px" }}>
                        <AdminShimmer width={90} height={28} borderRadius={6} isDark={isDark} />
                      </td>
                      <td style={{ padding: "16px", textAlign: "right" }}>
                        <AdminShimmer width={65} height={28} borderRadius={6} isDark={isDark} style={{ marginLeft: "auto" }} />
                      </td>
                    </tr>
                  ))
                ) : validOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: textMuted }}>
                      No recent orders found.
                    </td>
                  </tr>
                ) : (
                  validOrders.slice(0, 5).map((order) => {
                  const statusStyle = getStatusColor(order.status);
                  return (
                    <tr key={order.id} style={{ borderBottom: `1px solid ${border}`, color: textMain }}>
                      <td style={{ padding: "16px", fontWeight: 800, color: "#0077B6" }}>
                        {order.id}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ fontWeight: 700, color: textMain }}>{order.customerName}</div>
                        <div style={{ fontSize: "11.5px", color: textMuted }}>{order.customerPhone}</div>
                      </td>
                      <td style={{ padding: "16px", color: textMuted, fontSize: "12.5px" }}>
                        {order.orderDate}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ fontSize: "12.5px", fontWeight: 600 }}>{order.paymentMethod}</div>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 800,
                            color: order.paymentStatus === "Paid" ? "#059669" : "#D97706",
                          }}
                        >
                          ● {order.paymentStatus}
                        </span>
                      </td>
                      <td style={{ padding: "16px", fontWeight: 800, color: textMain }}>
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as AdminOrder["status"])
                          }
                          style={{
                            background: statusStyle.bg,
                            color: statusStyle.text,
                            border: `1px solid ${statusStyle.border}`,
                            borderRadius: "6px",
                            padding: "4px 10px",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td style={{ padding: "16px", textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          style={{
                            background: isDark ? "#161B22" : "#F3F4F6",
                            border: `1px solid ${border}`,
                            color: "#0077B6",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.65)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: "20px",
            }}
          >
            <div
              style={{
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: "16px",
                padding: "28px",
                width: "100%",
                maxWidth: "600px",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.3)",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: `1px solid ${border}`,
                  paddingBottom: "16px",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: textMain, margin: 0 }}>
                    Order Details: {selectedOrder.id}
                  </h3>
                  <span style={{ fontSize: "12px", color: textMuted }}>
                    Placed on {selectedOrder.orderDate}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    background: isDark ? "#161B22" : "#F3F4F6",
                    border: `1px solid ${border}`,
                    color: textMuted,
                    borderRadius: "6px",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Customer & Address */}
              <div
                style={{
                  background: isDark ? "#161B22" : "#F9FAFB",
                  borderRadius: "10px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  fontSize: "13px",
                  border: `1px solid ${border}`,
                }}
              >
                <span style={{ fontWeight: 800, color: "#0077B6" }}>Shipping & Customer Info</span>
                <div style={{ color: textMain, fontWeight: 700 }}>{selectedOrder.customerName}</div>
                <div style={{ color: textMuted }}>Phone: {selectedOrder.customerPhone}</div>
                <div style={{ color: textMuted }}>Email: {selectedOrder.customerEmail}</div>
                <div style={{ color: textMain, marginTop: "4px" }}>
                  Address: {selectedOrder.shippingAddress.address},{" "}
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{" "}
                  {selectedOrder.shippingAddress.pinCode}
                </div>
              </div>

              {/* Items List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: textMain }}>
                  Purchased Items ({selectedOrder.items.length})
                </span>
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      background: isDark ? "#161B22" : "#F9FAFB",
                      padding: "12px",
                      borderRadius: "8px",
                      border: `1px solid ${border}`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "contain",
                        borderRadius: "6px",
                        background: "#FFFFFF",
                        padding: "4px",
                        border: `1px solid ${border}`,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13.5px", fontWeight: 700, color: textMain }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: "11.5px", color: textMuted }}>
                        Qty: {item.quantity} × ₹{item.price} ({item.color})
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: textMain, fontSize: "14px" }}>
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div
                style={{
                  borderTop: `1px solid ${border}`,
                  paddingTop: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <span style={{ fontSize: "12px", color: textMuted }}>Payment: </span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: textMain }}>
                    {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})
                  </span>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#059669" }}>
                  Total: {formatCurrency(selectedOrder.totalAmount)}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
