"use client";

import { useEffect, useState, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminTheme } from "@/app/admin/layout";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminTabs from "@/components/admin/ui/AdminTabs";
import AdminCard from "@/components/admin/ui/AdminCard";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import AdminDataTable, { Column } from "@/components/admin/ui/AdminDataTable";
import AdminShimmer from "@/components/admin/ui/AdminShimmer";
import {
  FileSpreadsheet,
  RefreshCw,
  History,
  TrendingUp,
  Package,
  Search,
  Calendar,
  Filter,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  DollarSign,
  Phone,
  MapPin,
  ExternalLink,
  Layers,
  Clock,
  User,
  ShieldCheck,
} from "lucide-react";
import * as XLSX from "xlsx";

// ── Types ──
interface GlobalSummary {
  totalOrders: number;
  totalProducts: number;
  totalRemarks: number;
  totalRevenue: number;
}

interface OrderReportItem {
  _id?: string;
  id: string;
  legacyId?: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: {
    firstName?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    pinCode?: string;
  };
  items?: {
    name: string;
    code?: string;
    productCode?: string;
    color?: string;
    size?: string;
    price: number;
    quantity: number;
    totalAmount?: number;
    image?: string;
  }[];
  totalAmount: number;
  discountCode?: string;
  discountAmount?: number;
  shippingAmount?: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  courierPartner?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  transportDetails?: {
    transportName?: string;
    trackingNumber?: string;
    trackingUrl?: string;
  };
  orderDate?: string;
  createdAt: string;
}

interface ProductReportItem {
  _id?: string;
  id: string;
  name: string;
  title?: string;
  code?: string;
  article?: string;
  skuCode?: string;
  category: string;
  categoryId?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  brand?: string;
  material?: string;
  colorName?: string;
  size?: string;
  hsn?: string;
  inMrp?: number;
  inSelling?: number;
  price?: number;
  stock: number;
  stockPcs?: number;
  status: string;
  image?: string;
  description?: string;
  residentialWarranty?: number;
}

interface RemarkLogItem {
  _id?: string;
  id: string;
  legacyId?: number;
  customerName: string;
  customerMobile: string;
  adminUserName: string;
  remark: string;
  message: string;
  logableType?: string;
  createdAt: string;
}

export default function AdminReportsPageWrapper() {
  return (
    <Suspense fallback={<div style={{ padding: "40px" }}><AdminShimmer height={300} /></div>}>
      <AdminReportsContent />
    </Suspense>
  );
}

function AdminReportsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === "dark";

  // Active Tab: remarks | orders | products (supports aliases)
  const tabParam = searchParams.get("tab")?.toLowerCase() || searchParams.get("type")?.toLowerCase() || "orders";
  const activeTab: "orders" | "products" | "remarks" =
    tabParam === "sales" || tabParam === "orders"
      ? "orders"
      : tabParam === "inventory" || tabParam === "products"
      ? "products"
      : "remarks";

  // Global metrics summary
  const [globalSummary, setGlobalSummary] = useState<GlobalSummary>({
    totalOrders: 0,
    totalProducts: 0,
    totalRemarks: 0,
    totalRevenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Common Search & Date filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Tab 1 (Orders) specific state
  const [orders, setOrders] = useState<OrderReportItem[]>([]);
  const [orderStatus, setOrderStatus] = useState("All");
  const [paymentStatus, setPaymentStatus] = useState("All");
  const [distinctStatuses, setDistinctStatuses] = useState<string[]>([]);
  const [ordersSummary, setOrdersSummary] = useState({
    totalFilteredOrders: 0,
    totalFilteredAmount: 0,
    paidCount: 0,
    paidAmount: 0,
  });
  const [selectedOrderModal, setSelectedOrderModal] = useState<OrderReportItem | null>(null);

  // Tab 2 (Products) specific state
  const [products, setProducts] = useState<ProductReportItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [subcategories, setSubcategories] = useState<{ id: string; categoryId: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [productStatus, setProductStatus] = useState("All");
  const [productStock, setProductStock] = useState("all");

  // Tab 3 (Remark Logs) specific state
  const [remarkLogs, setRemarkLogs] = useState<RemarkLogItem[]>([]);
  const [selectedRemark, setSelectedRemark] = useState("All");
  const [selectedAdmin, setSelectedAdmin] = useState("All");
  const [distinctRemarks, setDistinctRemarks] = useState<string[]>([]);
  const [distinctAdmins, setDistinctAdmins] = useState<string[]>([]);

  // Tab Change Handler
  const handleTabChange = (newTab: string) => {
    const target =
      newTab === "sales" || newTab === "orders"
        ? "orders"
        : newTab === "inventory" || newTab === "products"
        ? "products"
        : "remarks";
    setCurrentPage(1);
    setSearchQuery("");
    setFromDate("");
    setToDate("");
    router.replace(`/admin/reports?tab=${target}`);
  };

  // Quick Date Range Presets
  const applyDatePreset = (preset: "today" | "7days" | "month" | "30days" | "clear") => {
    if (preset === "clear") {
      setFromDate("");
      setToDate("");
      return;
    }
    const today = new Date();
    const endStr = today.toISOString().split("T")[0];
    let start = new Date();

    if (preset === "today") {
      start = today;
    } else if (preset === "7days") {
      start.setDate(today.getDate() - 7);
    } else if (preset === "month") {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (preset === "30days") {
      start.setDate(today.getDate() - 30);
    }

    setFromDate(start.toISOString().split("T")[0]);
    setToDate(endStr);
  };

  // Fetch Report Data
  async function fetchReports(page: number = currentPage) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("type", activeTab);
      params.set("page", String(page));
      params.set("limit", "50");

      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (fromDate) params.set("fromDate", fromDate);
      if (toDate) params.set("toDate", toDate);

      if (activeTab === "orders") {
        if (orderStatus !== "All") params.set("status", orderStatus);
        if (paymentStatus !== "All") params.set("paymentStatus", paymentStatus);
      } else if (activeTab === "products") {
        if (selectedCategory !== "all") params.set("categoryId", selectedCategory);
        if (selectedSubcategory !== "all") params.set("subcategoryId", selectedSubcategory);
        if (productStatus !== "All") params.set("status", productStatus);
        if (productStock !== "all") params.set("stock", productStock);
      } else if (activeTab === "remarks") {
        if (selectedRemark !== "All") params.set("remark", selectedRemark);
        if (selectedAdmin !== "All") params.set("adminUser", selectedAdmin);
      }

      const res = await fetch(`/api/reports?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.globalSummary) setGlobalSummary(data.globalSummary);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.totalCount || 0);
        }

        if (activeTab === "orders") {
          setOrders(data.orders || []);
          if (data.summary) setOrdersSummary(data.summary);
          if (data.filterOptions?.statuses) setDistinctStatuses(data.filterOptions.statuses);
        } else if (activeTab === "products") {
          setProducts(data.products || []);
          if (data.categories) setCategories(data.categories);
          if (data.subcategories) setSubcategories(data.subcategories);
        } else if (activeTab === "remarks") {
          setRemarkLogs(data.logs || []);
          if (data.filterOptions?.remarks) setDistinctRemarks(data.filterOptions.remarks);
          if (data.filterOptions?.admins) setDistinctAdmins(data.filterOptions.admins);
        }
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  }

  // Trigger fetch on tab change or page change
  useEffect(() => {
    fetchReports(currentPage);
  }, [activeTab, currentPage]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setFromDate("");
    setToDate("");
    setOrderStatus("All");
    setPaymentStatus("All");
    setSelectedCategory("all");
    setSelectedSubcategory("all");
    setProductStatus("All");
    setProductStock("all");
    setSelectedRemark("All");
    setSelectedAdmin("All");
    setCurrentPage(1);
    setTimeout(() => {
      fetchReports(1);
    }, 50);
  };

  // ── Excel Export Generator ──
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      params.set("type", activeTab);
      params.set("export", "true");

      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (fromDate) params.set("fromDate", fromDate);
      if (toDate) params.set("toDate", toDate);

      if (activeTab === "orders") {
        if (orderStatus !== "All") params.set("status", orderStatus);
        if (paymentStatus !== "All") params.set("paymentStatus", paymentStatus);
      } else if (activeTab === "products") {
        if (selectedCategory !== "all") params.set("categoryId", selectedCategory);
        if (selectedSubcategory !== "all") params.set("subcategoryId", selectedSubcategory);
        if (productStatus !== "All") params.set("status", productStatus);
        if (productStock !== "all") params.set("stock", productStock);
      } else if (activeTab === "remarks") {
        if (selectedRemark !== "All") params.set("remark", selectedRemark);
        if (selectedAdmin !== "All") params.set("adminUser", selectedAdmin);
      }

      const res = await fetch(`/api/reports?${params.toString()}`);
      if (!res.ok) throw new Error("Export data fetch failed");
      const data = await res.json();

      const workbook = XLSX.utils.book_new();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

      if (activeTab === "orders") {
        // Order Items breakdown matching Laravel's OrderReportExport
        const rows: any[] = [];
        const rawOrders: OrderReportItem[] = data.orders || [];

        for (const order of rawOrders) {
          const baseOrderInfo = {
            "Invoice No": order.id,
            "Created Date": order.createdAt
              ? new Date(order.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
              : "-",
            "Customer Name": order.customerName,
            "Mobile": order.customerPhone,
            "Email": order.customerEmail || "",
            "State": order.shippingAddress?.state || "",
            "City": order.shippingAddress?.city || "",
            "Pincode": order.shippingAddress?.pinCode || "",
            "Order Amount": order.totalAmount,
            "Is Payment": order.paymentStatus === "Paid" ? "Yes" : "No",
            "Payment Status": order.paymentStatus,
            "Discount Code": order.discountCode || "",
            "Discount Amount": order.discountAmount || 0,
            "Order Status": order.status,
            "Payment Term": order.paymentMethod,
            "Courier Name": order.courierPartner || order.transportDetails?.transportName || "",
            "Tracking Number": order.trackingNumber || order.transportDetails?.trackingNumber || "",
            "Tracking URL": order.trackingUrl || "",
          };

          if (order.items && order.items.length > 0) {
            for (const item of order.items) {
              rows.push({
                ...baseOrderInfo,
                "Product Name": item.name,
                "SKU Code": item.code || item.productCode || "",
                "Color": item.color || "",
                "Size": item.size || "",
                "Quantity": item.quantity,
                "Product Price": item.price,
                "Total Item Amount": item.totalAmount || item.price * item.quantity,
              });
            }
          } else {
            rows.push({
              ...baseOrderInfo,
              "Product Name": "-",
              "SKU Code": "-",
              "Color": "-",
              "Size": "-",
              "Quantity": 1,
              "Product Price": order.totalAmount,
              "Total Item Amount": order.totalAmount,
            });
          }
        }

        const worksheet = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Order Sales Report");
        XLSX.writeFile(workbook, `RN_Order_Sales_Report_${timestamp}.xlsx`);
      } else if (activeTab === "products") {
        // Product master matching Laravel's ProductExport
        const rawProducts: ProductReportItem[] = data.products || [];
        const rows = rawProducts.map((p) => ({
          "ID": p.id,
          "Category": p.category,
          "Subcategory": p.subcategoryName || "",
          "Product Name": p.name,
          "Article": p.article || "",
          "SKU Code": p.skuCode || p.code || "",
          "Brand": p.brand || "RN Valves",
          "Material": p.material || "",
          "Color": p.colorName || "",
          "Size": p.size || "",
          "HSN": p.hsn || "",
          "MRP (₹)": p.inMrp || p.price || 0,
          "Selling Price (₹)": p.inSelling || p.price || 0,
          "Stock (Pcs)": p.stockPcs ?? p.stock ?? 0,
          "Status": p.status,
          "Warranty (Years)": p.residentialWarranty || "",
          "Title": p.title || "",
          "Image URL": p.image || "",
          "Description": p.description || "",
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Product Catalog");
        XLSX.writeFile(workbook, `RN_Products_Report_${timestamp}.xlsx`);
      } else if (activeTab === "remarks") {
        // Remark logs export
        const rawLogs: RemarkLogItem[] = data.logs || [];
        const rows = rawLogs.map((l) => ({
          "Log ID": l.legacyId || l.id,
          "Created Date": l.createdAt
            ? new Date(l.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
            : "-",
          "Customer Name": l.customerName,
          "Customer Mobile": l.customerMobile,
          "Caller / Admin": l.adminUserName,
          "Remark Status": l.remark,
          "Message / Notes": l.message,
          "Type": l.logableType || "General",
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Remark Audit Logs");
        XLSX.writeFile(workbook, `RN_Remark_Logs_Report_${timestamp}.xlsx`);
      }
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export report data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // Styling Constants
  const cardBg = isDark ? "#0D1117" : "#FFFFFF";
  const border = isDark ? "#21262D" : "#E2E8F0";
  const textMain = isDark ? "#F0F6FC" : "#0F172A";
  const textMuted = isDark ? "#8B949E" : "#64748B";
  const inputBg = isDark ? "#161B22" : "#F8FAFC";
  const inputBorder = isDark ? "#30363D" : "#CBD5E1";

  // ── Columns Definitions ──
  const orderColumns: Column<OrderReportItem>[] = [
    {
      header: "Invoice / Order ID",
      accessor: (o) => (
        <div>
          <button
            type="button"
            onClick={() => setSelectedOrderModal(o)}
            style={{
              fontWeight: 800,
              color: "#0077B6",
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 0,
              fontSize: "13px",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>{o.id}</span>
            <Eye size={12} />
          </button>
          <div style={{ fontSize: "11px", color: textMuted, marginTop: "2px", fontFamily: "monospace" }}>
            {o.createdAt
              ? new Date(o.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : o.orderDate || "-"}
          </div>
        </div>
      ),
    },
    {
      header: "Customer Details",
      accessor: (o) => (
        <div>
          <div style={{ fontWeight: 700, color: textMain }}>{o.customerName || "Customer"}</div>
          <div style={{ fontSize: "11.5px", color: textMuted, display: "flex", alignItems: "center", gap: "4px" }}>
            <Phone size={10} />
            <span>{o.customerPhone}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Location",
      accessor: (o) => {
        const city = o.shippingAddress?.city || "";
        const state = o.shippingAddress?.state || "";
        const pin = o.shippingAddress?.pinCode || "";
        return (
          <div style={{ fontSize: "12px", color: textMain }}>
            <div>{city ? `${city}, ${state}` : state || "-"}</div>
            {pin && <div style={{ fontSize: "11px", color: textMuted }}>PIN: {pin}</div>}
          </div>
        );
      },
    },
    {
      header: "Total Amount",
      accessor: (o) => (
        <div>
          <div style={{ fontWeight: 800, color: "#0077B6", fontSize: "14px" }}>
            ₹{o.totalAmount.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "11px", color: textMuted }}>
            {o.paymentMethod || "Online Payment"}
          </div>
        </div>
      ),
    },
    {
      header: "Payment Status",
      accessor: (o) => {
        const isPaid = o.paymentStatus === "Paid";
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "3px 8px",
              borderRadius: "6px",
              fontSize: "11.5px",
              fontWeight: 700,
              background: isPaid ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
              color: isPaid ? "#059669" : "#D97706",
            }}
          >
            {isPaid ? <Check size={11} strokeWidth={3} /> : <Clock size={11} />}
            {o.paymentStatus || "Pending"}
          </span>
        );
      },
    },
    {
      header: "Order Status",
      accessor: (o) => {
        const s = (o.status || "Pending").toLowerCase();
        let variant: "success" | "danger" | "warning" | "info" = "info";
        if (s.includes("deliver") || s.includes("complet")) variant = "success";
        else if (s.includes("cancel") || s.includes("rto")) variant = "danger";
        else if (s.includes("transit") || s.includes("shipp") || s.includes("progress")) variant = "info";
        else variant = "warning";
        return <AdminStatusBadge status={o.status || "Pending"} variant={variant} isDark={isDark} />;
      },
    },
    {
      header: "Logistics",
      accessor: (o) => {
        const courier = o.courierPartner || o.transportDetails?.transportName;
        const tracking = o.trackingNumber || o.transportDetails?.trackingNumber;
        if (!courier && !tracking) return <span style={{ color: textMuted, fontSize: "12px" }}>-</span>;
        return (
          <div style={{ fontSize: "12px" }}>
            <div style={{ fontWeight: 600 }}>{courier || "Transport"}</div>
            {tracking && (
              <div style={{ fontSize: "11px", color: textMuted, fontFamily: "monospace" }}>
                TRK: {tracking}
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const productColumns: Column<ProductReportItem>[] = [
    {
      header: "Product",
      accessor: (p) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {p.image ? (
            <img
              src={p.image}
              alt={p.name}
              style={{ width: "42px", height: "42px", objectFit: "contain", borderRadius: "6px", background: "#f8fafc" }}
            />
          ) : (
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "6px",
                background: isDark ? "#21262D" : "#E2E8F0",
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
            <div style={{ fontWeight: 700, fontSize: "13px", color: textMain }}>{p.name}</div>
            <div style={{ fontSize: "11px", color: textMuted }}>
              {p.brand || "RN Valves"} {p.material ? `• ${p.material}` : ""}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Art / SKU",
      accessor: (p) => (
        <div>
          {p.article && (
            <div style={{ fontWeight: 700, fontSize: "12px", color: "#0077B6", fontFamily: "monospace" }}>
              Art: {p.article}
            </div>
          )}
          <div style={{ fontSize: "11px", color: textMuted, fontFamily: "monospace" }}>
            SKU: {p.skuCode || p.code || p.id}
          </div>
        </div>
      ),
    },
    {
      header: "Category & Subcategory",
      accessor: (p) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: "12px", color: textMain }}>{p.category}</div>
          <div style={{ fontSize: "11px", color: textMuted }}>{p.subcategoryName || "-"}</div>
        </div>
      ),
    },
    {
      header: "Pricing (₹)",
      accessor: (p) => {
        const selling = p.inSelling || p.price || 0;
        const mrp = p.inMrp || 0;
        return (
          <div>
            <div style={{ fontWeight: 800, color: "#059669", fontSize: "13.5px" }}>
              ₹{selling.toLocaleString("en-IN")}
            </div>
            {mrp > selling && (
              <div style={{ fontSize: "11px", color: "#DC2626", textDecoration: "line-through" }}>
                ₹{mrp.toLocaleString("en-IN")}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Stock",
      accessor: (p) => {
        const qty = p.stockPcs ?? p.stock ?? 0;
        const inStock = qty > 0;
        return (
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "11.5px",
              fontWeight: 700,
              background: inStock ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
              color: inStock ? "#059669" : "#DC2626",
            }}
          >
            {inStock ? `${qty} in stock` : "Out of stock"}
          </span>
        );
      },
    },
    {
      header: "Status",
      accessor: (p) => {
        const isActive = p.status === "Active" || p.status === "In Stock";
        return (
          <AdminStatusBadge
            status={p.status || "Active"}
            variant={isActive ? "success" : "danger"}
            isDark={isDark}
          />
        );
      },
    },
  ];

  const remarkColumns: Column<RemarkLogItem>[] = [
    {
      header: "Date & Time",
      accessor: (l) => (
        <div>
          <span style={{ fontSize: "12px", fontWeight: 600, color: textMain }}>
            {l.createdAt
              ? new Date(l.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "-"}
          </span>
          <div style={{ fontSize: "11px", color: textMuted, fontFamily: "monospace" }}>
            {l.createdAt
              ? new Date(l.createdAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </div>
        </div>
      ),
    },
    {
      header: "Customer",
      accessor: (l) => (
        <div>
          <div style={{ fontWeight: 700, color: textMain }}>{l.customerName || "Customer"}</div>
          <div style={{ fontSize: "11.5px", color: textMuted, display: "flex", alignItems: "center", gap: "4px" }}>
            <Phone size={10} />
            <span>{l.customerMobile || "-"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Caller / Admin",
      accessor: (l) => (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "12px",
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: "6px",
            background: isDark ? "rgba(56, 139, 253, 0.15)" : "#E0F2FE",
            color: "#0077B6",
          }}
        >
          <User size={11} />
          {l.adminUserName || "Admin"}
        </span>
      ),
    },
    {
      header: "Remark Status",
      accessor: (l) => {
        const r = (l.remark || "").toLowerCase();
        let variant: "success" | "danger" | "warning" | "info" = "info";
        if (r.includes("order") || r.includes("interest") || r.includes("complet")) variant = "success";
        else if (r.includes("not") || r.includes("cancel") || r.includes("reject")) variant = "danger";
        else if (r.includes("pending") || r.includes("follow")) variant = "warning";
        return <AdminStatusBadge status={l.remark || "Pending"} variant={variant} isDark={isDark} />;
      },
    },
    {
      header: "Content / Conversation Notes",
      accessor: (l) => (
        <div style={{ fontSize: "12px", color: textMain, maxWidth: "380px", lineHeight: "1.4" }}>
          &quot;{l.message || l.remark || "-"}&quot;
        </div>
      ),
    },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%" }}>
      <AdminHeader
        title="Admin Report Center"
        subtitle="Filter, analyze and export comprehensive business reports for Orders, Catalog Products, and Remark Logs."
        onRefresh={() => fetchReports(currentPage)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "28px", maxWidth: "1440px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {/* Metric Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <AdminCard isDark={isDark}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#0077B6", textTransform: "uppercase" }}>
                  Total Sales Orders
                </span>
                <div style={{ fontSize: "26px", fontWeight: 800, marginTop: "4px", color: "#0077B6" }}>
                  {globalSummary.totalOrders.toLocaleString()}
                </div>
              </div>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: isDark ? "rgba(56, 139, 253, 0.15)" : "#E0F2FE",
                  color: "#0077B6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrendingUp size={22} />
              </div>
            </div>
          </AdminCard>

          <AdminCard isDark={isDark}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>
                  Total Order Value
                </span>
                <div style={{ fontSize: "26px", fontWeight: 800, marginTop: "4px", color: "#059669" }}>
                  ₹{Math.round(globalSummary.totalRevenue).toLocaleString("en-IN")}
                </div>
              </div>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: isDark ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DollarSign size={22} />
              </div>
            </div>
          </AdminCard>

          <AdminCard isDark={isDark}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#7C3AED", textTransform: "uppercase" }}>
                  Catalog Products
                </span>
                <div style={{ fontSize: "26px", fontWeight: 800, marginTop: "4px", color: "#7C3AED" }}>
                  {globalSummary.totalProducts.toLocaleString()}
                </div>
              </div>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: isDark ? "rgba(124, 58, 237, 0.15)" : "#EDE9FE",
                  color: "#7C3AED",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Package size={22} />
              </div>
            </div>
          </AdminCard>

          <AdminCard isDark={isDark}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11.5px", fontWeight: 700, opacity: 0.7, textTransform: "uppercase" }}>
                  Remark Log Entries
                </span>
                <div style={{ fontSize: "26px", fontWeight: 800, marginTop: "4px" }}>
                  {globalSummary.totalRemarks.toLocaleString()}
                </div>
              </div>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: isDark ? "#21262D" : "#F1F5F9",
                  color: textMain,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <History size={22} />
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Tab Selection & Export Button */}
        <AdminTabs
          isDark={isDark}
          activeTab={activeTab}
          onChange={handleTabChange}
          tabs={[
            { id: "orders", label: `Order Sales Report (${globalSummary.totalOrders})`, icon: <TrendingUp size={15} /> },
            { id: "products", label: `Product Catalog Report (${globalSummary.totalProducts})`, icon: <Package size={15} /> },
            { id: "remarks", label: `Remark Logs Report (${globalSummary.totalRemarks})`, icon: <History size={15} /> },
          ]}
          rightAction={
            <AdminButton
              variant="secondary"
              size="md"
              icon={<FileSpreadsheet size={15} />}
              isDark={isDark}
              onClick={handleExportExcel}
              disabled={exporting}
            >
              {exporting
                ? "Generating Excel..."
                : activeTab === "orders"
                ? "Export Orders XLS"
                : activeTab === "products"
                ? "Export Products XLS"
                : "Export Remarks XLS"}
            </AdminButton>
          }
        />

        {/* Comprehensive Filter Control Panel */}
        <div
          style={{
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "20px",
            boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
            {/* Search Input */}
            <div style={{ flex: "1 1 260px", position: "relative" }}>
              <input
                type="text"
                placeholder={
                  activeTab === "orders"
                    ? "Search Order ID, Customer, Phone, City, Tracking..."
                    : activeTab === "products"
                    ? "Search Product Name, Article No, SKU, Brand..."
                    : "Search Customer, Phone, Caller, Notes..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchReports(1)}
                style={{
                  width: "100%",
                  height: "38px",
                  padding: "0 12px 0 34px",
                  borderRadius: "8px",
                  border: `1px solid ${inputBorder}`,
                  background: inputBg,
                  color: textMain,
                  fontSize: "13px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
              <Search size={15} style={{ position: "absolute", left: "10px", top: "11px", color: textMuted }} />
            </div>

            {/* Date Pickers (For Orders & Remarks) */}
            {(activeTab === "orders" || activeTab === "remarks") && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: 600, color: textMuted }}>From:</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    style={{
                      height: "38px",
                      padding: "0 8px",
                      borderRadius: "8px",
                      border: `1px solid ${inputBorder}`,
                      background: inputBg,
                      color: textMain,
                      fontSize: "12px",
                      outline: "none",
                    }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: 600, color: textMuted }}>To:</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    style={{
                      height: "38px",
                      padding: "0 8px",
                      borderRadius: "8px",
                      border: `1px solid ${inputBorder}`,
                      background: inputBg,
                      color: textMain,
                      fontSize: "12px",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Tab 1: Orders Dropdown Filters */}
            {activeTab === "orders" && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  style={{
                    height: "38px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: `1px solid ${inputBorder}`,
                    background: inputBg,
                    color: textMain,
                    fontSize: "12.5px",
                    fontWeight: 600,
                    outline: "none",
                  }}
                >
                  <option value="All">All Order Statuses</option>
                  {distinctStatuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>

                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  style={{
                    height: "38px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: `1px solid ${inputBorder}`,
                    background: inputBg,
                    color: textMain,
                    fontSize: "12.5px",
                    fontWeight: 600,
                    outline: "none",
                  }}
                >
                  <option value="All">All Payments</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            )}

            {/* Tab 2: Products Dropdown Filters */}
            {activeTab === "products" && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory("all");
                  }}
                  style={{
                    height: "38px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: `1px solid ${inputBorder}`,
                    background: inputBg,
                    color: textMain,
                    fontSize: "12.5px",
                    fontWeight: 600,
                    outline: "none",
                  }}
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id || c.slug} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  style={{
                    height: "38px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: `1px solid ${inputBorder}`,
                    background: inputBg,
                    color: textMain,
                    fontSize: "12.5px",
                    fontWeight: 600,
                    outline: "none",
                  }}
                >
                  <option value="all">All Subcategories</option>
                  {subcategories
                    .filter((s) => selectedCategory === "all" || s.categoryId === selectedCategory)
                    .map((s) => (
                      <option key={s.id || s.name} value={s.id || s.name}>
                        {s.name}
                      </option>
                    ))}
                </select>

                <select
                  value={productStock}
                  onChange={(e) => setProductStock(e.target.value)}
                  style={{
                    height: "38px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: `1px solid ${inputBorder}`,
                    background: inputBg,
                    color: textMain,
                    fontSize: "12.5px",
                    fontWeight: 600,
                    outline: "none",
                  }}
                >
                  <option value="all">All Stock Status</option>
                  <option value="in_stock">In Stock (&gt; 0)</option>
                  <option value="low_stock">Low Stock (1-10)</option>
                  <option value="out_of_stock">Out of Stock (0)</option>
                </select>

                <select
                  value={productStatus}
                  onChange={(e) => setProductStatus(e.target.value)}
                  style={{
                    height: "38px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: `1px solid ${inputBorder}`,
                    background: inputBg,
                    color: textMain,
                    fontSize: "12.5px",
                    fontWeight: 600,
                    outline: "none",
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            )}

            {/* Tab 3: Remark Logs Dropdown Filters */}
            {activeTab === "remarks" && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <select
                  value={selectedRemark}
                  onChange={(e) => setSelectedRemark(e.target.value)}
                  style={{
                    height: "38px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: `1px solid ${inputBorder}`,
                    background: inputBg,
                    color: textMain,
                    fontSize: "12.5px",
                    fontWeight: 600,
                    outline: "none",
                  }}
                >
                  <option value="All">All Remarks</option>
                  {distinctRemarks.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedAdmin}
                  onChange={(e) => setSelectedAdmin(e.target.value)}
                  style={{
                    height: "38px",
                    padding: "0 10px",
                    borderRadius: "8px",
                    border: `1px solid ${inputBorder}`,
                    background: inputBg,
                    color: textMain,
                    fontSize: "12.5px",
                    fontWeight: 600,
                    outline: "none",
                  }}
                >
                  <option value="All">All Callers / Admins</option>
                  {distinctAdmins.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filter Action Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <AdminButton
                variant="primary"
                size="md"
                icon={<Filter size={14} />}
                isDark={isDark}
                onClick={() => fetchReports(1)}
              >
                Apply Filter
              </AdminButton>

              <AdminButton
                variant="secondary"
                size="md"
                icon={<RotateCcw size={14} />}
                isDark={isDark}
                onClick={handleResetFilters}
                title="Reset Filters"
              >
                Reset
              </AdminButton>
            </div>
          </div>

          {/* Quick Date Presets Row */}
          {(activeTab === "orders" || activeTab === "remarks") && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: textMuted, textTransform: "uppercase" }}>
                Quick Presets:
              </span>
              {[
                { id: "today", label: "Today" },
                { id: "7days", label: "Last 7 Days" },
                { id: "month", label: "This Month" },
                { id: "30days", label: "Last 30 Days" },
                { id: "clear", label: "Clear Dates" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyDatePreset(p.id as any)}
                  style={{
                    padding: "3px 8px",
                    fontSize: "11px",
                    fontWeight: 600,
                    borderRadius: "4px",
                    background: isDark ? "#21262D" : "#F1F5F9",
                    color: textMain,
                    border: `1px solid ${border}`,
                    cursor: "pointer",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab 1: Orders Filtered Summary Banner (Matching Laravel's total row) */}
        {activeTab === "orders" && (
          <div
            style={{
              background: isDark ? "rgba(0, 119, 182, 0.1)" : "#F0F9FF",
              border: "1px solid rgba(0, 119, 182, 0.25)",
              borderRadius: "10px",
              padding: "14px 20px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
              <div>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: textMuted, textTransform: "uppercase" }}>
                  Filtered Orders
                </span>
                <div style={{ fontSize: "18px", fontWeight: 800, color: textMain }}>
                  {ordersSummary.totalFilteredOrders.toLocaleString()} Orders
                </div>
              </div>
              <div style={{ borderLeft: `1px solid ${border}`, paddingLeft: "20px" }}>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: textMuted, textTransform: "uppercase" }}>
                  Total Filtered Amount
                </span>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#0077B6" }}>
                  ₹{ordersSummary.totalFilteredAmount.toLocaleString("en-IN")}
                </div>
              </div>
              <div style={{ borderLeft: `1px solid ${border}`, paddingLeft: "20px" }}>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: textMuted, textTransform: "uppercase" }}>
                  Paid Orders
                </span>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#059669" }}>
                  {ordersSummary.paidCount} (₹{ordersSummary.paidAmount.toLocaleString("en-IN")})
                </div>
              </div>
            </div>

            <AdminButton
              variant="secondary"
              size="sm"
              icon={<FileSpreadsheet size={13} />}
              isDark={isDark}
              onClick={handleExportExcel}
              disabled={exporting}
            >
              Export Filtered XLS
            </AdminButton>
          </div>
        )}

        {/* Data Table */}
        {activeTab === "orders" ? (
          <AdminDataTable
            isDark={isDark}
            loading={loading}
            columns={orderColumns}
            data={orders}
            keyExtractor={(o) => o.id}
          />
        ) : activeTab === "products" ? (
          <AdminDataTable
            isDark={isDark}
            loading={loading}
            columns={productColumns}
            data={products}
            keyExtractor={(p) => p.id}
          />
        ) : (
          <AdminDataTable
            isDark={isDark}
            loading={loading}
            columns={remarkColumns}
            data={remarkLogs}
            keyExtractor={(l, idx) => l._id || l.id || idx}
          />
        )}

        {/* Pagination Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "20px",
            padding: "12px 16px",
            background: cardBg,
            border: `1px solid ${border}`,
            borderRadius: "10px",
            fontSize: "13px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ color: textMuted }}>
            Showing <b>{totalCount === 0 ? 0 : (currentPage - 1) * 50 + 1}</b> to{" "}
            <b>{Math.min(currentPage * 50, totalCount)}</b> of <b>{totalCount}</b> records
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AdminButton
              variant="secondary"
              size="sm"
              icon={<ChevronLeft size={14} />}
              isDark={isDark}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
            >
              Previous
            </AdminButton>

            <span style={{ fontWeight: 700, padding: "0 8px" }}>
              Page {currentPage} of {totalPages}
            </span>

            <AdminButton
              variant="secondary"
              size="sm"
              isDark={isDark}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
            >
              Next
              <ChevronRight size={14} style={{ marginLeft: "4px" }} />
            </AdminButton>
          </div>
        </div>
      </main>

      {/* Order Detail Modal */}
      {selectedOrderModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setSelectedOrderModal(null)}
        >
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "14px",
              maxWidth: "700px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              boxSizing: "border-box",
              color: textMain,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#0077B6" }}>
                  {selectedOrderModal.id}
                </h3>
                <div style={{ fontSize: "12px", color: textMuted, marginTop: "4px" }}>
                  Placed on: {new Date(selectedOrderModal.createdAt).toLocaleString("en-IN")}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderModal(null)}
                style={{
                  background: isDark ? "#21262D" : "#E2E8F0",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  color: textMain,
                  fontWeight: 700,
                }}
              >
                Close
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div style={{ padding: "14px", background: inputBg, borderRadius: "8px", border: `1px solid ${border}` }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: textMuted, textTransform: "uppercase" }}>
                  Customer Information
                </div>
                <div style={{ fontWeight: 700, marginTop: "6px" }}>{selectedOrderModal.customerName}</div>
                <div style={{ fontSize: "12px", color: textMuted }}>{selectedOrderModal.customerPhone}</div>
                {selectedOrderModal.customerEmail && (
                  <div style={{ fontSize: "12px", color: textMuted }}>{selectedOrderModal.customerEmail}</div>
                )}
              </div>

              <div style={{ padding: "14px", background: inputBg, borderRadius: "8px", border: `1px solid ${border}` }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: textMuted, textTransform: "uppercase" }}>
                  Delivery Address
                </div>
                <div style={{ fontSize: "12px", marginTop: "6px", lineHeight: "1.4" }}>
                  {selectedOrderModal.shippingAddress?.address || "-"}
                  <br />
                  {selectedOrderModal.shippingAddress?.city}, {selectedOrderModal.shippingAddress?.state} -{" "}
                  {selectedOrderModal.shippingAddress?.pinCode}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>Ordered Items</div>
              <div style={{ border: `1px solid ${border}`, borderRadius: "8px", overflow: "hidden" }}>
                {(selectedOrderModal.items || []).map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderBottom: idx === (selectedOrderModal.items?.length || 0) - 1 ? "none" : `1px solid ${border}`,
                      fontSize: "12.5px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {it.image && (
                        <img
                          src={it.image}
                          alt={it.name}
                          style={{ width: "36px", height: "36px", objectFit: "contain", borderRadius: "4px" }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 700 }}>{it.name}</div>
                        <div style={{ fontSize: "11px", color: textMuted }}>
                          {it.code || it.productCode || ""} {it.color ? `• ${it.color}` : ""} {it.size ? `• ${it.size}` : ""}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700 }}>
                        ₹{it.price} × {it.quantity}
                      </div>
                      <div style={{ fontWeight: 800, color: "#0077B6" }}>
                        ₹{(it.totalAmount || it.price * it.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 16px",
                borderRadius: "8px",
                background: isDark ? "rgba(56, 139, 253, 0.1)" : "#E0F2FE",
                color: textMain,
              }}
            >
              <div>
                <span style={{ fontSize: "12px", color: textMuted }}>Payment: </span>
                <b>{selectedOrderModal.paymentMethod}</b> ({selectedOrderModal.paymentStatus})
              </div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#0077B6" }}>
                Total: ₹{selectedOrderModal.totalAmount.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
