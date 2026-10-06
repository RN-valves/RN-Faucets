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
  category: string;
  categoryId?: string;
  subcategory?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  contentId?: string;
  content_id?: string;
  brand?: string;
  material?: string;
  colorName?: string;
  color_name?: string;
  name: string;
  article?: string;
  skuCode?: string;
  sku_code?: string;
  code?: string;
  size?: string;
  hsn?: string;
  image?: string;
  title?: string;
  keywords?: string;
  description?: string;
  searchKeywords?: string;
  search_keywords?: string;
  isVisibleWebsite?: boolean | number;
  is_visible_website?: boolean | number;
  isVisibleApi?: boolean | number;
  is_visible_api?: boolean | number;
  newArrival?: boolean | number;
  new_arrival?: boolean | number;
  isFeatured?: boolean | number;
  is_featured?: boolean | number;
  saleType?: string;
  sale_type?: string;
  inMrp?: number;
  in_mrp?: number;
  inSelling?: number;
  in_selling?: number;
  inV1Mrp?: number;
  in_v1_mrp?: number;
  othMrp?: number;
  oth_mrp?: number;
  othSelling?: number;
  oth_selling?: number;
  othV1Mrp?: number;
  oth_v1_mrp?: number;
  colorGroupId?: string;
  color_group_id?: string;
  productComboId?: string;
  product_combo_id?: string;
  productSizeId?: string;
  product_size_id?: string;
  ctnPcs?: number;
  ctn_pcs?: number;
  midCtnPcs?: number;
  mid_ctn_pcs?: number;
  innerPcs?: number;
  inner_pcs?: number;
  stockPcs?: number;
  stock_pcs?: number;
  stock?: number;
  onlyProductWtGm?: number;
  only_product_wt_gm?: number;
  productLength?: number;
  product_length?: number;
  productBreadth?: number;
  product_breadth?: number;
  productHeight?: number;
  product_height?: number;
  productLbhWeightGm?: number;
  product_lbh_weight_gm?: number;
  midCtnLbhWeightKg?: number;
  mid_ctn_lbh_weight_kg?: number;
  residentialWarranty?: number;
  residential_warranty?: number;
  commercialWarranty?: number;
  commercial_warranty?: number;
  amazonLink?: string;
  amazon_link?: string;
  flipkartLink?: string;
  flipkart_link?: string;
  shortDescription?: string;
  short_description?: string;
  videoUrl?: string;
  video_url?: string;
  isFullTurn?: boolean | number;
  is_full_turn?: boolean | number;
  fullTurnCode?: string;
  full_turn_code?: string;
  masterCtnLbhWeightKg?: number;
  master_ctn_lbh_weight_kg?: number;
  status: string;
  price?: number;
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
        // Product master matching Laravel's exact 51-column ProductExport.php
        const rawProducts: ProductReportItem[] = data.products || [];
        const rows = rawProducts.map((p: any) => ({
          "id": p.id,
          "category": p.category || "",
          "subcategory": p.subcategoryName || p.subcategory || "",
          "content_id": p.contentId || p.content_id || "",
          "brand": p.brand || "RN Valves",
          "material": p.material || "",
          "color_name": p.colorName || p.color_name || "",
          "name": p.name,
          "article": p.article || "",
          "sku_code": p.skuCode || p.sku_code || p.code || "",
          "size": p.size || "",
          "hsn": p.hsn || "",
          "image": p.image || "",
          "title": p.title || p.name || "",
          "keywords": p.keywords || "",
          "description": p.description || "",
          "search_keywords": p.searchKeywords || p.search_keywords || "",
          "is_visible_website": p.isVisibleWebsite !== undefined ? (p.isVisibleWebsite ? 1 : 0) : p.is_visible_website ?? 1,
          "is_visible_api": p.isVisibleApi !== undefined ? (p.isVisibleApi ? 1 : 0) : p.is_visible_api ?? 1,
          "new_arrival": p.newArrival ? 1 : (p.new_arrival ? 1 : 0),
          "is_featured": p.isFeatured ? 1 : (p.is_featured ? 1 : 0),
          "sale_type": p.saleType || p.sale_type || "",
          "in_mrp": p.inMrp ?? p.in_mrp ?? p.price ?? 0,
          "in_selling": p.inSelling ?? p.in_selling ?? p.price ?? 0,
          "in_v1_mrp": p.inV1Mrp ?? p.in_v1_mrp ?? (p.inMrp ? p.inMrp * 2 : 0),
          "oth_mrp": p.othMrp ?? p.oth_mrp ?? p.inMrp ?? 0,
          "oth_selling": p.othSelling ?? p.oth_selling ?? p.inSelling ?? 0,
          "oth_v1_mrp": p.othV1Mrp ?? p.oth_v1_mrp ?? p.inV1Mrp ?? 0,
          "color_group_id": p.colorGroupId || p.color_group_id || "",
          "product_combo_id": p.productComboId || p.product_combo_id || "",
          "product_size_id": p.productSizeId || p.product_size_id || "",
          "ctn_pcs": p.ctnPcs ?? p.ctn_pcs ?? 0,
          "mid_ctn_pcs": p.midCtnPcs ?? p.mid_ctn_pcs ?? 0,
          "inner_pcs": p.innerPcs ?? p.inner_pcs ?? 0,
          "stock_pcs": p.stockPcs ?? p.stock_pcs ?? p.stock ?? 0,
          "only_product_wt_gm": p.onlyProductWtGm ?? p.only_product_wt_gm ?? 0,
          "product_length": p.productLength ?? p.product_length ?? 0,
          "product_breadth": p.productBreadth ?? p.product_breadth ?? 0,
          "product_height": p.productHeight ?? p.product_height ?? 0,
          "product_lbh_weight_gm": p.productLbhWeightGm ?? p.product_lbh_weight_gm ?? 0,
          "mid_ctn_lbh_weight_kg": p.midCtnLbhWeightKg ?? p.mid_ctn_lbh_weight_kg ?? 0,
          "residential_warranty": p.residentialWarranty ?? p.residential_warranty ?? 0,
          "commercial_warranty": p.commercialWarranty ?? p.commercial_warranty ?? 0,
          "amazon_link": p.amazonLink || p.amazon_link || "",
          "flipkart_link": p.flipkartLink || p.flipkart_link || "",
          "short_description": p.shortDescription || p.short_description || p.description || "",
          "video_url": p.videoUrl || p.video_url || "",
          "is_full_turn": p.isFullTurn ? 1 : (p.is_full_turn ? 1 : 0),
          "full_turn_code": p.fullTurnCode || p.full_turn_code || "",
          "master_ctn_lbh_weight_kg": p.masterCtnLbhWeightKg ?? p.master_ctn_lbh_weight_kg ?? 0,
          "status": p.status || "In Stock",
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, worksheet, "products");
        XLSX.writeFile(workbook, `${new Date().toISOString().split("T")[0]}_products.xlsx`);
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

        {/* Comprehensive Filter Control Panel (For Orders & Remarks) */}
        {activeTab !== "products" && (
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
          </div>
        )}

        {/* Tab 1: Orders Filtered Summary Banner */}
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

        {/* Tab 2: Products Dedicated Pure Laravel Style Export Box (Option A) */}
        {activeTab === "products" && (
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "14px",
              padding: "28px",
              boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "24px", paddingBottom: "20px", borderBottom: `1px solid ${border}` }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: textMain }}>
                    Product Data Export
                  </h3>
                  <span
                    style={{
                      fontSize: "11.5px",
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: "20px",
                      background: isDark ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5",
                      color: "#059669",
                    }}
                  >
                    {globalSummary.totalProducts.toLocaleString()} Total Products
                  </span>
                </div>
                <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: textMuted }}>
                  Select Category and Subcategory filters to download comprehensive 51-column Excel report matching the RN Laravel Product Schema.
                </p>
              </div>

              <AdminButton
                variant="primary"
                size="lg"
                icon={<FileSpreadsheet size={16} />}
                isDark={isDark}
                onClick={handleExportExcel}
                disabled={exporting}
                style={{ backgroundColor: "#059669", borderColor: "#059669", color: "#FFFFFF", fontWeight: 700 }}
              >
                {exporting ? "Generating 51-Column Excel..." : "Export Products XLS"}
              </AdminButton>
            </div>

            {/* Selection Form */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "28px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "8px" }}>
                  Select Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory("all");
                  }}
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    border: `1px solid ${inputBorder}`,
                    background: inputBg,
                    color: textMain,
                    fontSize: "13.5px",
                    fontWeight: 600,
                    outline: "none",
                  }}
                >
                  <option value="all">All Categories ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c.id || c.slug} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "8px" }}>
                  Select SubCategory
                </label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    border: `1px solid ${inputBorder}`,
                    background: inputBg,
                    color: textMain,
                    fontSize: "13.5px",
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
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "8px" }}>
                  Stock Status (Optional)
                </label>
                <select
                  value={productStock}
                  onChange={(e) => setProductStock(e.target.value)}
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    border: `1px solid ${inputBorder}`,
                    background: inputBg,
                    color: textMain,
                    fontSize: "13.5px",
                    fontWeight: 600,
                    outline: "none",
                  }}
                >
                  <option value="all">All Stock Status</option>
                  <option value="in_stock">In Stock (&gt; 0)</option>
                  <option value="low_stock">Low Stock (1-10)</option>
                  <option value="out_of_stock">Out of Stock (0)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "8px" }}>
                  Catalog Status (Optional)
                </label>
                <select
                  value={productStatus}
                  onChange={(e) => setProductStatus(e.target.value)}
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    border: `1px solid ${inputBorder}`,
                    background: inputBg,
                    color: textMain,
                    fontSize: "13.5px",
                    fontWeight: 600,
                    outline: "none",
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Quick Export Summary Box */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
                background: isDark ? "#161B22" : "#F8FAFC",
                border: `1px solid ${border}`,
                borderRadius: "10px",
                padding: "18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <Layers size={18} style={{ color: "#0077B6", marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: textMain }}>51 Standard Columns</div>
                  <div style={{ fontSize: "12px", color: textMuted }}>Complete RN Laravel schema mapping</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <DollarSign size={18} style={{ color: "#059669", marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: textMain }}>Multi-Tier Pricing</div>
                  <div style={{ fontSize: "12px", color: textMuted }}>India MRP, Selling, Tier 1, Export rates</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <Package size={18} style={{ color: "#7C3AED", marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: textMain }}>Cartons & Logistics</div>
                  <div style={{ fontSize: "12px", color: textMuted }}>Inner pcs, Mid/Master Carton, LBH wt</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <ShieldCheck size={18} style={{ color: "#D97706", marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: textMain }}>Warranty & Marketplaces</div>
                  <div style={{ fontSize: "12px", color: textMuted }}>Warranty years, Amazon & Flipkart links</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Tables (For Orders & Remarks) */}
        {activeTab === "orders" ? (
          <AdminDataTable
            isDark={isDark}
            loading={loading}
            columns={orderColumns}
            data={orders}
            keyExtractor={(o) => o.id}
          />
        ) : activeTab === "remarks" ? (
          <AdminDataTable
            isDark={isDark}
            loading={loading}
            columns={remarkColumns}
            data={remarkLogs}
            keyExtractor={(l, idx) => l._id || l.id || idx}
          />
        ) : null}

        {/* Pagination Bar (For Orders & Remarks) */}
        {activeTab !== "products" && (
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
        )}
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
