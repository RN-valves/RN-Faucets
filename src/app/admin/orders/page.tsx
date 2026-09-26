"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  ChevronLeft,
  Download,
  ExternalLink,
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
  // Razorpay & Shipping Integration
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  shippingProvider?: string;
  shiprocketOrderId?: string | number;
  shipwayOrderId?: string | number;
  awbCode?: string;
  orderDate: string;
  deliveryEstimate?: string;
  createdAt?: string;
}

interface PaymentItem {
  _id?: string;
  id: number;
  paymentId?: string;
  orderId?: number | null;
  customerName: string;
  payLinkId?: string;
  shortUrl?: string;
  mobile: string;
  email: string;
  state: string;
  city: string;
  zipcode: string;
  paymentGateway: string;
  paymentKey?: string;
  gatewayPaymentId?: string;
  status: string;
  paymentData?: string;
  amount: number;
  createdAt: string;
}

function OrdersContent() {
  const { theme, toggleTheme } = useAdminTheme();
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlTab = searchParams.get("tab")?.toLowerCase();
  const [mainTab, setMainTab] = useState<"orders" | "payments">(urlTab === "payments" ? "payments" : "orders");

  // Sync with URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab")?.toLowerCase();
    if (tabParam === "payments" && mainTab !== "payments") {
      setMainTab("payments");
    } else if (tabParam !== "payments" && mainTab === "payments" && !tabParam) {
      setMainTab("orders");
    }
  }, [searchParams]);

  const handleMainTabChange = (newTab: string) => {
    const tab = newTab as "orders" | "payments";
    setMainTab(tab);
    if (tab === "payments") {
      router.replace("/admin/orders?tab=payments");
    } else {
      router.replace("/admin/orders");
    }
  };

  // --- ORDERS STATE ---
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
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
  const [isShippingShiprocket, setIsShippingShiprocket] = useState(false);
  const [isShippingShipway, setIsShippingShipway] = useState(false);

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

  // --- PAYMENTS STATE ---
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);

  const isDark = theme === "dark";
  const cardBg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#21262D" : "#E5E7EB";
  const textMain = isDark ? "#F0F6FC" : "#111827";
  const textMuted = isDark ? "#8B949E" : "#6B7280";
  const inputBg = isDark ? "#161B22" : "#F9FAFB";

  async function fetchOrders() {
    setLoadingOrders(true);
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
      setLoadingOrders(false);
    }
  }

  async function fetchPayments() {
    setLoadingPayments(true);
    try {
      const params = new URLSearchParams({
        page: paymentPage.toString(),
        limit: "50",
      });
      if (paymentSearch.trim()) params.set("q", paymentSearch.trim());
      if (paymentStatusFilter) params.set("status", paymentStatusFilter);

      const res = await fetch(`/api/payments?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
        setPaymentTotal(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoadingPayments(false);
    }
  }

  useEffect(() => {
    fetchOrders();
    fetchPayments();
  }, []);

  useEffect(() => {
    if (mainTab === "orders") {
      fetchOrders();
    } else {
      fetchPayments();
    }
  }, [mainTab, statusTab, searchQuery, paymentPage, paymentSearch, paymentStatusFilter]);

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
        fetchOrders();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleSaveTransport = async (e: React.FormEvent) => {
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
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (err) {
      console.error("Failed to update transport:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const exportOrdersToExcel = () => {
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

  const exportPaymentsToExcel = () => {
    const exportData = payments.map((p) => ({
      "Payment ID": p.paymentId || `PAY-${p.id}`,
      "Order ID": p.orderId || "-",
      "Customer Name": p.customerName,
      "Mobile": p.mobile,
      "Email": p.email,
      "City": p.city,
      "State": p.state,
      "Pincode": p.zipcode,
      "Amount (₹)": p.amount,
      "Status": p.status,
      "Gateway": p.paymentGateway,
      "Pay Link ID": p.payLinkId,
      "Short URL": p.shortUrl,
      "Created At": p.createdAt ? new Date(p.createdAt).toLocaleString("en-IN") : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, `RN_Payments_Transactions_${Date.now()}.xlsx`);
  };

  // Orders Columns
  const orderColumns: Column<OrderData>[] = [
    {
      header: "Order ID & Date",
      accessor: (o: OrderData) => (
        <div
          onClick={() => router.push(`/admin/orders/${o._id || o.id}`)}
          style={{ cursor: "pointer" }}
          title="Click to view full order & dispatch details"
        >
          <div style={{ fontWeight: 800, color: "#0077B6", textDecoration: "underline", textUnderlineOffset: "3px" }}>
            {o.id}
          </div>
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
      header: "Delivery Destination",
      accessor: (o: OrderData) => (
        <div style={{ fontSize: "12px", maxWidth: "200px" }}>
          <div style={{ fontWeight: 600 }}>{o.shippingAddress?.city}, {o.shippingAddress?.state}</div>
          <div style={{ opacity: 0.7, fontSize: "11px" }}>PIN: {o.shippingAddress?.pinCode}</div>
        </div>
      ),
    },
    {
      header: "Amount & Payment",
      accessor: (o: OrderData) => (
        <div>
          <div style={{ fontWeight: 800 }}>₹{o.totalAmount.toLocaleString("en-IN")}</div>
          <div style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
            <span
              style={{
                color: o.paymentStatus === "Paid" ? "#16A34A" : o.paymentStatus === "Refunded" ? "#DC2626" : "#D97706",
                fontWeight: 800,
                fontSize: "11px",
              }}
            >
              ● {o.paymentStatus === "Paid" ? "PAID" : "UNPAID"}
            </span>
            <span style={{ color: textMuted, fontSize: "10.5px" }}>({o.paymentMethod === "Online Payment" ? "Prepaid" : "COD"})</span>
          </div>
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
            padding: "5px 10px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 700,
            border: `1px solid ${border}`,
            background: inputBg,
            color: textMain,
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
          onClick={() => router.push(`/admin/orders/${o._id || o.id}`)}
        >
          View & Manage
        </AdminButton>
      ),
    },
  ];

  // Payments Columns
  const paymentColumns: Column<PaymentItem>[] = [
    {
      header: "Payment ID",
      width: "100px",
      accessor: (p) => (
        <div>
          <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#0077B6" }}>
            {p.paymentId || `PAY-${p.id}`}
          </span>
          {p.orderId && (
            <div style={{ fontSize: "11px", color: textMuted }}>Ord #{p.orderId}</div>
          )}
        </div>
      ),
    },
    {
      header: "Customer Information",
      accessor: (p) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <span style={{ fontWeight: 700, fontSize: "13.5px", color: textMain }}>{p.customerName}</span>
          <div style={{ display: "flex", gap: "10px", fontSize: "12px", color: textMuted }}>
            {p.mobile && <span><Phone size={11} style={{ display: "inline" }} /> {p.mobile}</span>}
            {p.email && <span><Mail size={11} style={{ display: "inline" }} /> {p.email}</span>}
          </div>
        </div>
      ),
    },
    {
      header: "City / State",
      width: "160px",
      accessor: (p) => (
        <div style={{ fontSize: "12px" }}>
          <div style={{ fontWeight: 600, color: textMain }}>{p.city || "-"}</div>
          <div style={{ color: textMuted, fontSize: "11px" }}>{p.state} {p.zipcode ? `(${p.zipcode})` : ""}</div>
        </div>
      ),
    },
    {
      header: "Amount (₹)",
      width: "120px",
      accessor: (p) => (
        <span style={{ fontWeight: 800, fontSize: "14px", color: textMain }}>
          ₹{p.amount ? p.amount.toLocaleString("en-IN") : "0"}
        </span>
      ),
    },
    {
      header: "Status",
      width: "110px",
      accessor: (p) => {
        const s = (p.status || "").toLowerCase();
        let variant: "success" | "warning" | "danger" | "neutral" = "neutral";
        if (s === "captured" || s === "paid" || s === "success") variant = "success";
        else if (s === "cancelled" || s === "failed") variant = "danger";
        else if (s === "pending" || s === "created") variant = "warning";
        return <AdminStatusBadge status={p.status} variant={variant} isDark={isDark} />;
      },
    },
    {
      header: "Gateway",
      width: "110px",
      accessor: (p) => (
        <span style={{ fontSize: "12px", fontWeight: 600, color: textMuted }}>
          {p.paymentGateway || "Razorpay"}
        </span>
      ),
    },
    {
      header: "Date & Time",
      width: "140px",
      accessor: (p) => (
        <span style={{ fontSize: "12px", color: textMuted }}>
          {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }) : "-"}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      width: "80px",
      accessor: (p) => (
        <AdminButton
          variant="icon"
          size="sm"
          icon={<Eye size={14} style={{ color: "#0077B6" }} />}
          isDark={isDark}
          onClick={() => setSelectedPayment(p)}
          title="Inspect Payment Details"
        />
      ),
    },
  ];

  const totalPaymentPages = Math.ceil(paymentTotal / 50);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%" }}>
      <AdminHeader
        title={mainTab === "payments" ? "Razorpay Payment Gateway Transactions" : "Orders & Transport Tracking Management"}
        subtitle={
          mainTab === "payments"
            ? "View and inspect live and legacy customer payment transactions, gateway link logs, and payment settlements."
            : "Track live customer orders, update transport dispatch details, and manage payment statuses."
        }
        onRefresh={mainTab === "payments" ? fetchPayments : fetchOrders}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {/* Main Tab Switcher: Orders vs Payments */}
        <AdminTabs
          isDark={isDark}
          activeTab={mainTab}
          onChange={handleMainTabChange}
          tabs={[
            { id: "orders", label: `Customer Orders (${counts.total || orders.length})`, icon: <ShoppingCart size={16} /> },
            { id: "payments", label: `Payment Transactions (${paymentTotal || 559})`, icon: <CreditCard size={16} /> },
          ]}
          rightAction={
            <AdminButton
              variant="secondary"
              size="md"
              icon={<Download size={14} />}
              isDark={isDark}
              onClick={mainTab === "payments" ? exportPaymentsToExcel : exportOrdersToExcel}
            >
              Export {mainTab === "payments" ? "Payments" : "Orders"} Excel
            </AdminButton>
          }
        />

        {/* --- ORDERS TAB VIEW --- */}
        {mainTab === "orders" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Status KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
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
                    <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#16A34A", textTransform: "uppercase" }}>Delivered</span>
                    <div style={{ fontSize: "24px", fontWeight: 800, color: "#16A34A", marginTop: "4px" }}>{counts.delivered}</div>
                  </div>
                  <CheckCircle2 size={20} />
                </div>
              </AdminCard>
            </div>

            {/* Filter Bar */}
            <AdminFilterBar
              isDark={isDark}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Search orders by customer name, phone, email, or order ID..."
              actions={
                <AdminButton
                  variant="icon"
                  size="md"
                  icon={<RefreshCw size={15} />}
                  isDark={isDark}
                  onClick={fetchOrders}
                  title="Refresh Orders"
                />
              }
            />

            {/* Orders Table */}
            <AdminDataTable
              isDark={isDark}
              loading={loadingOrders}
              columns={orderColumns}
              data={orders}
              keyExtractor={(o) => o._id || o.id}
            />
          </div>
        )}

        {/* --- PAYMENTS TAB VIEW --- */}
        {mainTab === "payments" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Summary Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <AdminCard isDark={isDark}>
                <span style={{ fontSize: "11.5px", fontWeight: 700, opacity: 0.7, textTransform: "uppercase" }}>Total Payments</span>
                <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "4px", color: "#0077B6" }}>{paymentTotal}</div>
              </AdminCard>
              <AdminCard isDark={isDark}>
                <span style={{ fontSize: "11.5px", fontWeight: 700, opacity: 0.7, textTransform: "uppercase" }}>Gateway Provider</span>
                <div style={{ fontSize: "20px", fontWeight: 800, marginTop: "4px", color: textMain }}>Razorpay Standard</div>
              </AdminCard>
              <AdminCard isDark={isDark}>
                <span style={{ fontSize: "11.5px", fontWeight: 700, opacity: 0.7, textTransform: "uppercase" }}>Bank Settlement</span>
                <div style={{ fontSize: "20px", fontWeight: 800, marginTop: "4px", color: "#16A34A" }}>IDFC First Bank</div>
              </AdminCard>
            </div>

            {/* Filter / Search Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: cardBg,
                border: `1px solid ${border}`,
                borderRadius: "10px",
                padding: "10px 16px",
              }}
            >
              <Search size={16} style={{ color: textMuted }} />
              <input
                type="text"
                value={paymentSearch}
                onChange={(e) => {
                  setPaymentSearch(e.target.value);
                  setPaymentPage(1);
                }}
                placeholder="Search payments by customer name, phone, email, city, or ID..."
                style={{
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  color: textMain,
                  fontSize: "14px",
                  flex: 1,
                }}
              />
              <select
                value={paymentStatusFilter}
                onChange={(e) => {
                  setPaymentStatusFilter(e.target.value);
                  setPaymentPage(1);
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: `1px solid ${border}`,
                  background: inputBg,
                  color: textMain,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                <option value="">All Statuses</option>
                <option value="captured">Captured / Success</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Payments Table */}
            <AdminDataTable
              isDark={isDark}
              loading={loadingPayments}
              columns={paymentColumns}
              data={payments}
              keyExtractor={(p) => p.id.toString()}
            />

            {/* Payments Pagination */}
            {totalPaymentPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 20px",
                  background: cardBg,
                  border: `1px solid ${border}`,
                  borderRadius: "10px",
                }}
              >
                <span style={{ fontSize: "13px", color: textMuted }}>
                  Showing {(paymentPage - 1) * 50 + 1} - {Math.min(paymentPage * 50, paymentTotal)} of {paymentTotal} payments
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    type="button"
                    disabled={paymentPage <= 1}
                    onClick={() => setPaymentPage((p) => Math.max(1, p - 1))}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "6px",
                      border: `1px solid ${border}`,
                      background: inputBg,
                      color: paymentPage <= 1 ? textMuted : textMain,
                      cursor: paymentPage <= 1 ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                    }}
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>

                  <span style={{ fontSize: "13px", fontWeight: 700, color: textMain, padding: "0 8px" }}>
                    Page {paymentPage} of {totalPaymentPages}
                  </span>

                  <button
                    type="button"
                    disabled={paymentPage >= totalPaymentPages}
                    onClick={() => setPaymentPage((p) => Math.min(totalPaymentPages, p + 1))}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "6px",
                      border: `1px solid ${border}`,
                      background: inputBg,
                      color: paymentPage >= totalPaymentPages ? textMuted : textMain,
                      cursor: paymentPage >= totalPaymentPages ? "not-allowed" : "pointer",
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
        )}
      </main>

      {/* --- INSPECT PAYMENT MODAL --- */}
      {selectedPayment && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
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
              maxWidth: "580px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ margin: 0, color: textMain }}>
                Payment Transaction #{selectedPayment.id}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                style={{ background: "transparent", border: "none", fontSize: "18px", color: textMuted, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${border}` }}>
                <span style={{ color: textMuted }}>Amount:</span>
                <span style={{ fontWeight: 800, fontSize: "16px", color: textMain }}>₹{selectedPayment.amount.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${border}` }}>
                <span style={{ color: textMuted }}>Status:</span>
                <AdminStatusBadge status={selectedPayment.status} variant={selectedPayment.status === "captured" ? "success" : "warning"} isDark={isDark} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${border}` }}>
                <span style={{ color: textMuted }}>Customer:</span>
                <span style={{ fontWeight: 700, color: textMain }}>{selectedPayment.customerName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${border}` }}>
                <span style={{ color: textMuted }}>Contact:</span>
                <span style={{ color: textMain }}>{selectedPayment.mobile} | {selectedPayment.email}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${border}` }}>
                <span style={{ color: textMuted }}>Destination:</span>
                <span style={{ color: textMain }}>{selectedPayment.city}, {selectedPayment.state} {selectedPayment.zipcode}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${border}` }}>
                <span style={{ color: textMuted }}>Gateway & Key:</span>
                <span style={{ fontFamily: "monospace", color: textMain }}>{selectedPayment.paymentGateway} ({selectedPayment.paymentKey || "Live IDFC"})</span>
              </div>
              {selectedPayment.payLinkId && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${border}` }}>
                  <span style={{ color: textMuted }}>Pay Link ID:</span>
                  <span style={{ fontFamily: "monospace", color: textMain }}>{selectedPayment.payLinkId}</span>
                </div>
              )}
              {selectedPayment.shortUrl && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                  <span style={{ color: textMuted }}>Payment Link URL:</span>
                  <a href={selectedPayment.shortUrl} target="_blank" rel="noreferrer" style={{ color: "#0077B6", display: "flex", alignItems: "center", gap: "4px" }}>
                    {selectedPayment.shortUrl} <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                style={{ padding: "8px 18px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: textMain, cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading Orders & Payments...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
