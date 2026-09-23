"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import SupportLinksSection from "@/components/SupportLinksSection";
import { getCustomerSession, clearCustomerSession, type CustomerSession } from "@/utils/customerAuth";
import { getCartItems, saveCartItems, type CartItem } from "@/utils/cart";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  LogOut,
  ChevronDown,
  ChevronUp,
  FileText,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Search,
  Copy,
  Check,
  Printer,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  X,
} from "lucide-react";

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
}

type TabType = "all" | "shipped" | "processing" | "delivered" | "pending";

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const activeSession = getCustomerSession();
    if (!activeSession) {
      router.push("/login-user");
      return;
    }
    setSession(activeSession);
    const userMobile = activeSession.mobile;

    // Fetch orders matching customer mobile
    async function fetchCustomerOrders() {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders?phone=${encodeURIComponent(userMobile)}`);
        if (res.ok) {
          const data = await res.json();
          const list: OrderData[] = data.orders || [];
          setOrders(list);
          if (list.length > 0) {
            setExpandedOrderId(list[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch customer orders:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomerOrders();
  }, [router]);

  const handleLogout = () => {
    clearCustomerSession();
    if (typeof window !== "undefined") {
      localStorage.removeItem("rn_admin_session");
      localStorage.removeItem("rn_user_session");
      localStorage.removeItem("rn_customer_session");
      window.location.href = "/";
    }
  };

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedTracking(id);
      setTimeout(() => setCopiedTracking(null), 2000);
    }
  };

  const handleReorder = (order: OrderData) => {
    if (!order.items || order.items.length === 0) return;
    const existing = getCartItems();
    const newItems: CartItem[] = order.items.map((it) => ({
      id: it.id || it.code || `PROD-${Date.now()}`,
      name: it.name,
      code: it.code || "",
      price: it.price,
      quantity: it.quantity || 1,
      image: it.image || "",
      color: it.color || "Standard",
      slug: it.id?.toLowerCase().replace(/\s+/g, "-") || "faucets",
    }));

    // Merge cart
    const merged = [...existing];
    for (const item of newItems) {
      const idx = merged.findIndex((m) => m.id === item.id && m.color === item.color);
      if (idx > -1) {
        merged[idx].quantity += item.quantity;
      } else {
        merged.push(item);
      }
    }
    saveCartItems(merged);
    router.push("/cart");
  };

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    // Tab filter
    if (activeTab === "shipped" && order.status !== "Shipped") return false;
    if (activeTab === "processing" && order.status !== "Processing") return false;
    if (activeTab === "delivered" && order.status !== "Delivered") return false;
    if (activeTab === "pending" && order.status !== "Pending") return false;

    // Search query filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesId = order.id.toLowerCase().includes(q);
    const matchesItems = order.items?.some(
      (i) => i.name.toLowerCase().includes(q) || i.code?.toLowerCase().includes(q)
    );
    const matchesTracking =
      order.trackingNumber?.toLowerCase().includes(q) || order.lrNumber?.toLowerCase().includes(q);
    return matchesId || matchesItems || matchesTracking;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!isMounted || !session) return null;

  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#FFFFFF",
        overflowX: "hidden",
      }}
    >
      <Header />

      <section
        data-header-theme="light"
        style={{
          width: "100vw",
          padding: "130px clamp(16px, 5vw, 80px) 70px",
          boxSizing: "border-box",
          fontFamily: "'Manrope', Helvetica, Arial, sans-serif",
          background: "#FFFFFF",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
          {/* Breadcrumbs Navigation */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "#888888",
              marginBottom: "32px",
            }}
          >
            <Link href="/" style={{ color: "#888888", textDecoration: "none" }}>
              Home
            </Link>
            <span>&gt;</span>
            <span style={{ color: "#111111", fontWeight: 500 }}>My Orders &amp; Dispatch Tracking</span>
          </nav>

          {/* Clean Luxury Account Header Banner */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "24px",
              paddingBottom: "32px",
              borderBottom: "1px solid #E5E5E5",
              marginBottom: "36px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <h1
                style={{
                  fontSize: "clamp(26px, 3.2vw, 36px)",
                  fontWeight: 600,
                  color: "#111111",
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                My Orders ({orders.length})
              </h1>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "14px",
                  color: "#666666",
                }}
              >
                <span>
                  Customer: <strong style={{ color: "#111111", fontWeight: 600 }}>{session.name || "Customer"}</strong>
                </span>
                <span>•</span>
                <span>+91 {session.mobile}</span>
                {session.email && (
                  <>
                    <span>•</span>
                    <span>{session.email}</span>
                  </>
                )}
                <span>•</span>
                <span
                  style={{
                    background: "#F1F5F9",
                    padding: "3px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  {session.userType === "Business" ? "B2B Channel Partner" : "Retail Customer"}
                </span>
                {session.userCode && (
                  <span style={{ fontSize: "12px", color: "#888888" }}>Code: {session.userCode}</span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Link
                href="/catalogues"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  border: "1px solid #E5E5E5",
                  background: "#FFFFFF",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#111111",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
              >
                <FileText size={15} />
                Catalogues
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  border: "1px solid #E5E5E5",
                  background: "#FFFFFF",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#dc2626",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          </div>

          {/* Filter Tabs & Search Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            {/* Filter Buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {[
                { key: "all" as const, label: `All Orders (${orders.length})` },
                {
                  key: "shipped" as const,
                  label: `In Transit (${orders.filter((o) => o.status === "Shipped").length})`,
                },
                {
                  key: "processing" as const,
                  label: `Processing (${orders.filter((o) => o.status === "Processing").length})`,
                },
                {
                  key: "delivered" as const,
                  label: `Delivered (${orders.filter((o) => o.status === "Delivered").length})`,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    border: activeTab === tab.key ? "1px solid #000000" : "1px solid #E5E5E5",
                    background: activeTab === tab.key ? "#000000" : "#FFFFFF",
                    color: activeTab === tab.key ? "#FFFFFF" : "#555555",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div style={{ position: "relative", minWidth: "280px" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#999999",
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID or Product Name..."
                style={{
                  width: "100%",
                  padding: "10px 38px 10px 38px",
                  borderRadius: "6px",
                  border: "1px solid #E2E8F0",
                  fontSize: "13.5px",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                  color: "#111111",
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#999999",
                    padding: 0,
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Orders Body */}
          {loading ? (
            /* Loading State */
            <div style={{ textAlign: "center", padding: "80px 20px", color: "#666666" }}>
              <p style={{ fontSize: "15px", fontWeight: 500 }}>Loading your order history...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            /* Empty State */
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                border: "1px dashed #E2E8F0",
                borderRadius: "12px",
                margin: "20px 0",
              }}
            >
              <ShoppingBag size={48} style={{ color: "#94A3B8", margin: "0 auto 16px" }} />
              <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#111111", marginBottom: "8px" }}>
                {searchQuery ? "No matching orders found" : "No orders found"}
              </h2>
              <p style={{ fontSize: "14px", color: "#666666", maxWidth: "480px", margin: "0 auto 24px" }}>
                {searchQuery
                  ? `No orders matching "${searchQuery}". Please check the spelling or Order ID.`
                  : `You have not placed any orders with mobile number +91 ${session.mobile} yet.`}
              </p>
              <Link
                href="/faucets"
                style={{
                  display: "inline-block",
                  padding: "12px 28px",
                  background: "#000000",
                  color: "#FFFFFF",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                  borderRadius: "6px",
                  transition: "background 0.2s",
                }}
              >
                Browse Faucets Collection
              </Link>
            </div>
          ) : (
            /* Orders List */
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {filteredOrders.map((ord) => {
                const isExpanded = expandedOrderId === ord.id;

                return (
                  <div
                    key={ord._id || ord.id}
                    style={{
                      border: "1px solid #E5E5E5",
                      borderRadius: "8px",
                      background: "#FFFFFF",
                      overflow: "hidden",
                    }}
                  >
                    {/* Order Bar Top Header */}
                    <div
                      onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                      style={{
                        padding: "20px 28px",
                        background: "#FAFAFA",
                        borderBottom: isExpanded ? "1px solid #E5E5E5" : "none",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "16px",
                      }}
                    >
                      {/* Left info: Order ID, Date & Status */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "16px", fontWeight: 700, color: "#111111", letterSpacing: "-0.01em" }}>
                            Order #{ord.id}
                          </span>

                          {/* Status Badge */}
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "4px 12px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: 600,
                              background:
                                ord.status === "Delivered"
                                  ? "#F0FDF4"
                                  : ord.status === "Shipped"
                                  ? "#EFF6FF"
                                  : ord.status === "Processing"
                                  ? "#FFFBEB"
                                  : "#F8FAFC",
                              color:
                                ord.status === "Delivered"
                                  ? "#15803D"
                                  : ord.status === "Shipped"
                                  ? "#1D4ED8"
                                  : ord.status === "Processing"
                                  ? "#B45309"
                                  : "#475569",
                              border:
                                ord.status === "Delivered"
                                  ? "1px solid #BBF7D0"
                                  : ord.status === "Shipped"
                                  ? "1px solid #BFDBFE"
                                  : ord.status === "Processing"
                                  ? "1px solid #FDE68A"
                                  : "1px solid #E2E8F0",
                            }}
                          >
                            <span
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                backgroundColor:
                                  ord.status === "Delivered"
                                    ? "#16A34A"
                                    : ord.status === "Shipped"
                                    ? "#2563EB"
                                    : ord.status === "Processing"
                                    ? "#D97706"
                                    : "#64748B",
                              }}
                            />
                            {ord.status === "Shipped"
                              ? "In Transit / Dispatched"
                              : ord.status === "Processing"
                              ? "Processing & QC"
                              : ord.status}
                          </span>
                        </div>

                        <div style={{ fontSize: "13px", color: "#777777", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <span>Placed on {ord.orderDate}</span>
                          <span>•</span>
                          <span>{ord.items?.length || 0} item{(ord.items?.length || 0) !== 1 ? "s" : ""}</span>
                          {ord.deliveryEstimate && (
                            <>
                              <span>•</span>
                              <span style={{ color: "#333333", fontWeight: 500 }}>
                                Est. Delivery: {ord.deliveryEstimate}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right info: Price, Payment Status & Expand Chevron */}
                      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: "18px", fontWeight: 700, color: "#111111", margin: 0 }}>
                            ₹{formatPrice(ord.totalAmount)}
                          </p>
                          <p style={{ fontSize: "12.5px", color: "#666666", margin: "2px 0 0" }}>
                            {ord.paymentMethod} •{" "}
                            <span
                              style={{
                                fontWeight: 600,
                                color: ord.paymentStatus === "Paid" ? "#16A34A" : "#D97706",
                              }}
                            >
                              {ord.paymentStatus}
                            </span>
                          </p>
                        </div>

                        <button
                          type="button"
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "#FFFFFF",
                            border: "1px solid #E5E5E5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#555555",
                            cursor: "pointer",
                          }}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Order Details Body */}
                    {isExpanded && (
                      <div style={{ padding: "28px" }}>
                        {/* ── 1. Clean Logistics Tracking Timeline ── */}
                        <div
                          style={{
                            background: "#F8FAFC",
                            border: "1px solid #EAEAEA",
                            borderRadius: "8px",
                            padding: "24px 28px",
                            marginBottom: "28px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "24px",
                            }}
                          >
                            <h3
                              style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "#111111",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                margin: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <Truck size={16} color="#000000" />
                              Live Consignment Tracking
                            </h3>
                            <span style={{ fontSize: "12px", color: "#888888", fontFamily: "monospace" }}>
                              Consignment ID: {ord.id}
                            </span>
                          </div>

                          {/* 4 Steps Visual Tracker */}
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(4, 1fr)",
                              gap: "12px",
                              textAlign: "center",
                              position: "relative",
                            }}
                          >
                            {/* Step 1 */}
                            <div>
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  background: "#16A34A",
                                  color: "#FFFFFF",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  fontSize: "13px",
                                  margin: "0 auto",
                                }}
                              >
                                ✓
                              </div>
                              <p style={{ fontSize: "13px", fontWeight: 600, color: "#111111", margin: "8px 0 2px" }}>
                                Order Placed
                              </p>
                              <p style={{ fontSize: "11.5px", color: "#777777", margin: 0 }}>{ord.orderDate}</p>
                            </div>

                            {/* Step 2 */}
                            <div>
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  background:
                                    ord.status === "Processing" || ord.status === "Shipped" || ord.status === "Delivered"
                                      ? "#16A34A"
                                      : "#E2E8F0",
                                  color:
                                    ord.status === "Processing" || ord.status === "Shipped" || ord.status === "Delivered"
                                      ? "#FFFFFF"
                                      : "#64748B",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  fontSize: "13px",
                                  margin: "0 auto",
                                }}
                              >
                                {ord.status === "Processing" || ord.status === "Shipped" || ord.status === "Delivered"
                                  ? "✓"
                                  : "2"}
                              </div>
                              <p style={{ fontSize: "13px", fontWeight: 600, color: "#111111", margin: "8px 0 2px" }}>
                                Quality Check
                              </p>
                              <p style={{ fontSize: "11.5px", color: "#777777", margin: 0 }}>Packaging Passed</p>
                            </div>

                            {/* Step 3 */}
                            <div>
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  background:
                                    ord.status === "Shipped"
                                      ? "#1D4ED8"
                                      : ord.status === "Delivered"
                                      ? "#16A34A"
                                      : "#E2E8F0",
                                  color:
                                    ord.status === "Shipped" || ord.status === "Delivered" ? "#FFFFFF" : "#64748B",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  fontSize: "13px",
                                  margin: "0 auto",
                                }}
                              >
                                {ord.status === "Delivered" ? "✓" : "3"}
                              </div>
                              <p style={{ fontSize: "13px", fontWeight: 600, color: "#111111", margin: "8px 0 2px" }}>
                                In Transit
                              </p>
                              <p style={{ fontSize: "11.5px", color: "#1D4ED8", fontWeight: 600, margin: 0 }}>
                                {ord.courierPartner || "Dispatched"}
                              </p>
                            </div>

                            {/* Step 4 */}
                            <div>
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  background: ord.status === "Delivered" ? "#16A34A" : "#E2E8F0",
                                  color: ord.status === "Delivered" ? "#FFFFFF" : "#64748B",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  fontSize: "13px",
                                  margin: "0 auto",
                                }}
                              >
                                {ord.status === "Delivered" ? "✓" : "4"}
                              </div>
                              <p style={{ fontSize: "13px", fontWeight: 600, color: "#111111", margin: "8px 0 2px" }}>
                                Delivered
                              </p>
                              <p style={{ fontSize: "11.5px", color: "#777777", margin: 0 }}>Destination</p>
                            </div>
                          </div>

                          {/* Carrier LR / AWB Information Panel */}
                          {(ord.courierPartner || ord.trackingNumber || ord.lrNumber) && (
                            <div
                              style={{
                                background: "#FFFFFF",
                                border: "1px solid #E5E5E5",
                                borderRadius: "6px",
                                padding: "16px 20px",
                                marginTop: "24px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: "16px",
                                fontSize: "13px",
                              }}
                            >
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <p style={{ margin: 0, fontWeight: 700, color: "#111111" }}>
                                  Carrier Partner: {ord.courierPartner || "RN Logistics"}
                                </p>
                                {ord.trackingNumber && (
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#555555" }}>
                                    <span>AWB No:</span>
                                    <strong style={{ fontFamily: "monospace", color: "#111111" }}>
                                      {ord.trackingNumber}
                                    </strong>
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(ord.trackingNumber!, ord.id + "-track")}
                                      style={{
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#666666",
                                        padding: 0,
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                      title="Copy Tracking Number"
                                    >
                                      {copiedTracking === ord.id + "-track" ? (
                                        <Check size={14} color="#16A34A" />
                                      ) : (
                                        <Copy size={14} />
                                      )}
                                    </button>
                                  </div>
                                )}
                                {ord.lrNumber && (
                                  <p style={{ margin: 0, color: "#555555" }}>
                                    Lorry Receipt (LR) No:{" "}
                                    <strong style={{ fontFamily: "monospace", color: "#111111" }}>{ord.lrNumber}</strong>
                                  </p>
                                )}
                                {ord.vehicleNumber && (
                                  <p style={{ margin: 0, color: "#555555" }}>
                                    Vehicle No: <strong style={{ color: "#111111" }}>{ord.vehicleNumber}</strong>
                                  </p>
                                )}
                              </div>

                              {ord.transportNotes && (
                                <div
                                  style={{
                                    background: "#F8FAFC",
                                    border: "1px solid #E2E8F0",
                                    borderRadius: "6px",
                                    padding: "10px 14px",
                                    fontSize: "12.5px",
                                    color: "#334155",
                                    maxWidth: "340px",
                                  }}
                                >
                                  <strong>Note: </strong>&quot;{ord.transportNotes}&quot;
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* ── 2. Ordered Items List ── */}
                        <div style={{ marginBottom: "28px" }}>
                          <h3
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "#111111",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              margin: "0 0 16px",
                            }}
                          >
                            Items In This Order ({ord.items?.length || 0})
                          </h3>

                          <div
                            style={{
                              border: "1px solid #E5E5E5",
                              borderRadius: "6px",
                              overflow: "hidden",
                            }}
                          >
                            {ord.items?.map((it, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "16px 20px",
                                  borderBottom: idx < (ord.items?.length || 0) - 1 ? "1px solid #EFEFEF" : "none",
                                  background: "#FFFFFF",
                                  flexWrap: "wrap",
                                  gap: "16px",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={it.image || "/rn-header-logo.svg"}
                                    alt={it.name}
                                    style={{
                                      width: "70px",
                                      height: "70px",
                                      objectFit: "contain",
                                      border: "1px solid #EAEAEA",
                                      borderRadius: "6px",
                                      padding: "6px",
                                      background: "#FAFAFA",
                                    }}
                                  />
                                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                    <p style={{ fontSize: "14.5px", fontWeight: 600, color: "#111111", margin: 0 }}>
                                      {it.name}
                                    </p>
                                    <p style={{ fontSize: "12.5px", color: "#666666", margin: 0 }}>
                                      {it.color && <span>Finish: {it.color} • </span>}
                                      {it.code && <span style={{ fontFamily: "monospace" }}>SKU: {it.code}</span>}
                                    </p>
                                    <p style={{ fontSize: "13px", color: "#444444", margin: 0 }}>
                                      Qty: <strong>{it.quantity}</strong> × ₹{formatPrice(it.price)}
                                    </p>
                                  </div>
                                </div>

                                <div style={{ textAlign: "right" }}>
                                  <p style={{ fontSize: "15.5px", fontWeight: 700, color: "#111111", margin: 0 }}>
                                    ₹{formatPrice(it.price * it.quantity)}
                                  </p>
                                  <span style={{ fontSize: "11.5px", color: "#16A34A", fontWeight: 600 }}>
                                    Genuine RN Product
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* ── 3. Shipping Address & Action Buttons ── */}
                        <div
                          style={{
                            background: "#FAFAFA",
                            border: "1px solid #EAEAEA",
                            borderRadius: "6px",
                            padding: "20px 24px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "20px",
                          }}
                        >
                          {/* Address info */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxWidth: "540px" }}>
                            <p
                              style={{
                                fontSize: "11.5px",
                                fontWeight: 700,
                                color: "#111111",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                margin: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <MapPin size={14} color="#000000" />
                              Delivery Destination
                            </p>
                            <p style={{ fontSize: "13.5px", fontWeight: 600, color: "#111111", margin: "2px 0 0" }}>
                              {ord.shippingAddress?.firstName} {ord.shippingAddress?.lastName || ""}
                            </p>
                            <p style={{ fontSize: "13px", color: "#555555", margin: 0, lineHeight: 1.4 }}>
                              {ord.shippingAddress?.address}, {ord.shippingAddress?.city},{" "}
                              {ord.shippingAddress?.state} - {ord.shippingAddress?.pinCode}
                            </p>
                            <p style={{ fontSize: "12.5px", color: "#777777", margin: 0 }}>
                              Contact: +91 {ord.shippingAddress?.phone}
                            </p>
                          </div>

                          {/* Buttons */}
                          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceOrder(ord)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "9px 18px",
                                border: "1px solid #000000",
                                background: "#FFFFFF",
                                color: "#000000",
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <Printer size={14} />
                              View Invoice
                            </button>

                            <button
                              type="button"
                              onClick={() => handleReorder(ord)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "9px 18px",
                                border: "none",
                                background: "#000000",
                                color: "#FFFFFF",
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "background 0.2s ease",
                              }}
                            >
                              <RefreshCw size={14} />
                              Buy Again
                            </button>

                            <Link
                              href="/enquire-now"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "9px 16px",
                                border: "1px solid #E5E5E5",
                                background: "#FFFFFF",
                                color: "#555555",
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontWeight: 600,
                                textDecoration: "none",
                                transition: "all 0.2s ease",
                              }}
                            >
                              Help Desk
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Printable Invoice Modal */}
      {selectedInvoiceOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "10px",
              maxWidth: "680px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "36px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              position: "relative",
              fontFamily: "'Manrope', Helvetica, Arial, sans-serif",
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedInvoiceOrder(null)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#F1F5F9",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#475569",
              }}
            >
              <X size={16} />
            </button>

            {/* Invoice Top */}
            <div
              style={{
                borderBottom: "1px solid #E5E5E5",
                paddingBottom: "24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", margin: "0 0 4px" }}>
                  RN Valves &amp; Faucets
                </h2>
                <p style={{ fontSize: "12.5px", color: "#666666", margin: 0 }}>Official Consignment Invoice</p>
                <p style={{ fontSize: "12px", color: "#888888", margin: "4px 0 0" }}>
                  B-68 Site-4 Sahibabad, Ghaziabad, UP 201010
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: 700, color: "#111111", margin: "0 0 2px" }}>
                  {selectedInvoiceOrder.id}
                </p>
                <p style={{ fontSize: "12px", color: "#666666", margin: 0 }}>{selectedInvoiceOrder.orderDate}</p>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "6px",
                    padding: "2px 8px",
                    fontSize: "11px",
                    fontWeight: 600,
                    background: "#F0FDF4",
                    color: "#16A34A",
                    border: "1px solid #BBF7D0",
                    borderRadius: "4px",
                  }}
                >
                  {selectedInvoiceOrder.paymentStatus}
                </span>
              </div>
            </div>

            {/* Bill / Ship To */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                padding: "20px 0",
                fontSize: "13px",
                color: "#555555",
                borderBottom: "1px solid #E5E5E5",
              }}
            >
              <div>
                <p style={{ fontWeight: 700, color: "#111111", textTransform: "uppercase", fontSize: "11px", margin: "0 0 6px" }}>
                  Customer Details
                </p>
                <p style={{ fontWeight: 600, color: "#111111", margin: "0 0 2px" }}>{selectedInvoiceOrder.customerName}</p>
                <p style={{ margin: "0 0 2px" }}>+91 {selectedInvoiceOrder.customerPhone}</p>
                <p style={{ margin: 0 }}>{selectedInvoiceOrder.customerEmail}</p>
              </div>

              <div>
                <p style={{ fontWeight: 700, color: "#111111", textTransform: "uppercase", fontSize: "11px", margin: "0 0 6px" }}>
                  Shipping Address
                </p>
                <p style={{ fontWeight: 600, color: "#111111", margin: "0 0 2px" }}>
                  {selectedInvoiceOrder.shippingAddress?.firstName} {selectedInvoiceOrder.shippingAddress?.lastName || ""}
                </p>
                <p style={{ margin: 0 }}>
                  {selectedInvoiceOrder.shippingAddress?.address}, {selectedInvoiceOrder.shippingAddress?.city},{" "}
                  {selectedInvoiceOrder.shippingAddress?.state} - {selectedInvoiceOrder.shippingAddress?.pinCode}
                </p>
              </div>
            </div>

            {/* Invoice Table */}
            <table
              style={{
                width: "100%",
                fontSize: "13px",
                borderCollapse: "collapse",
                margin: "24px 0",
              }}
            >
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                  <th style={{ padding: "10px 12px", textAlign: "left", color: "#111111" }}>Item</th>
                  <th style={{ padding: "10px 12px", textAlign: "center", color: "#111111" }}>Qty</th>
                  <th style={{ padding: "10px 12px", textAlign: "right", color: "#111111" }}>Unit Price</th>
                  <th style={{ padding: "10px 12px", textAlign: "right", color: "#111111" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoiceOrder.items?.map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "12px" }}>
                      <p style={{ fontWeight: 600, color: "#111111", margin: 0 }}>{it.name}</p>
                      <p style={{ fontSize: "11.5px", color: "#777777", margin: "2px 0 0" }}>
                        Color: {it.color || "Standard"} • SKU: {it.code || "-"}
                      </p>
                    </td>
                    <td style={{ padding: "12px", textAlign: "center", fontWeight: 600 }}>{it.quantity}</td>
                    <td style={{ padding: "12px", textAlign: "right", fontFamily: "monospace" }}>
                      ₹{formatPrice(it.price)}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", fontFamily: "monospace", fontWeight: 700 }}>
                      ₹{formatPrice(it.price * it.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid #E2E8F0" }}>
                  <td colSpan={3} style={{ padding: "14px 12px", textAlign: "right", fontWeight: 700, color: "#111111" }}>
                    Grand Total:
                  </td>
                  <td style={{ padding: "14px 12px", textAlign: "right", fontFamily: "monospace", fontSize: "16px", fontWeight: 700, color: "#111111" }}>
                    ₹{formatPrice(selectedInvoiceOrder.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Action buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "20px",
                borderTop: "1px solid #E5E5E5",
              }}
            >
              <span style={{ fontSize: "12.5px", color: "#666666" }}>
                Payment Mode: <strong>{selectedInvoiceOrder.paymentMethod}</strong>
              </span>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    padding: "10px 22px",
                    background: "#000000",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Printer size={15} />
                  Print Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceOrder(null)}
                  style={{
                    padding: "10px 18px",
                    background: "#F1F5F9",
                    color: "#334155",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SupportLinksSection />
      <FooterSection />
    </main>
  );
}
