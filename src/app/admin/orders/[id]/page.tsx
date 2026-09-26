"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminTheme } from "@/app/admin/layout";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  ArrowLeft,
  FileText,
  Printer,
  Edit,
  Download,
  Clock,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface OrderItem {
  id?: string | number;
  order_id?: string | number;
  name: string;
  code?: string;
  color?: string;
  size?: string;
  price: number;
  quantity: number;
  lbhWeight?: string | number;
  total_amount?: number;
  image?: string;
  createdAt?: string;
}

interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  country?: string;
}

interface OrderLog {
  id?: string | number;
  user_name?: string;
  created_at?: string;
  change_value?: string;
  change_type?: string;
}

interface OrderData {
  _id: string;
  id: string;
  uuid?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus: "Paid" | "Pending" | "Refunded";
  status: "Pending" | "Processing" | "In-Progress" | "In-Transit" | "Shipped" | "Delivered" | "Cancelled";
  fulfillment_type?: string;
  payment_term?: string;
  payment_key?: string;
  pay_link_id?: string;
  pay_link_url?: string;
  payment_data?: string;
  shippingAddress?: ShippingAddress;
  courierPartner?: string;
  trackingNumber?: string;
  lrNumber?: string;
  dispatchDate?: string;
  vehicleNumber?: string;
  transportNotes?: string;
  note?: string;
  courierSlipUrl?: string;
  packageLength?: number;
  packageBreadth?: number;
  packageHeight?: number;
  packageWeight?: number;
  shippingProvider?: string;
  carrierId?: string;
  deliveryCharge?: number;
  gstCharge?: number;
  totalDeliveryCharge?: number;
  codCharge?: number;
  transportContact?: string;
  transportUrl?: string;
  transportAttachment?: string;
  manifest_ids?: string | number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  orderDate?: string;
  deliveryEstimate?: string;
  discountCode?: string;
  discountAmount?: number;
  shippingAmount?: number;
  timeline?: OrderLog[];
  logs?: OrderLog[];
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
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingManifest, setIsDownloadingManifest] = useState(false);

  // Form States
  const [status, setStatus] = useState("Pending");
  const [paymentNote, setPaymentNote] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [boxLength, setBoxLength] = useState<number>(10);
  const [boxBreadth, setBoxBreadth] = useState<number>(10);
  const [boxHeight, setBoxHeight] = useState<number>(10);
  const [boxWeight, setBoxWeight] = useState<number>(0.5);
  const [shippingGateway, setShippingGateway] = useState<"shiprocket" | "shipway">("shipway");
  const [isCalculatingRate, setIsCalculatingRate] = useState(false);
  const [carrierOptions, setCarrierOptions] = useState<any[]>([]);
  const [selectedCarrierId, setSelectedCarrierId] = useState("");

  const cardBg = isDark ? "#111827" : "#FFFFFF";
  const border = isDark ? "#1F2937" : "#DEE2E6";
  const textMain = isDark ? "#F9FAFB" : "#212529";
  const textMuted = isDark ? "#9CA3AF" : "#6C757D";
  const headerBg = isDark ? "#1F2937" : "#F8F9FA";
  const inputBg = isDark ? "#1F2937" : "#FFFFFF";

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
      setStatus(data.status || "Pending");
      setBoxLength(data.packageLength || 10);
      setBoxBreadth(data.packageBreadth || 10);
      setBoxHeight(data.packageHeight || 10);
      setBoxWeight(data.packageWeight || 0.5);
    } catch (err: any) {
      setError(err.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Status update
  const handleUpdateStatus = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!order) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/orders/${order._id || order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          packageLength: boxLength,
          packageBreadth: boxBreadth,
          packageHeight: boxHeight,
          packageWeight: boxWeight,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Generate live Razorpay payment link dynamically
  const handleGeneratePaymentLink = async () => {
    if (!order) return;
    setIsGeneratingLink(true);
    try {
      const res = await fetch(`/api/orders/${order._id || order.id}/payment-link`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate payment link");
      }
      if (data.order) {
        setOrder(data.order);
      } else {
        fetchOrder();
      }
      alert(`Razorpay Payment Link generated successfully!\nURL: ${data.pay_link_url}`);
    } catch (err: any) {
      alert("Error generating payment link: " + err.message);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  // Confirm payment received manually
  const handleMarkPaymentReceived = async () => {
    if (!order) return;
    if (!confirm("Confirm payment received?")) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/orders/${order._id || order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: "Paid",
          payment_key: paymentNote || "Direct Confirmed",
          note: paymentNote ? `${order.note || ""}\n[Payment Received: ${paymentNote}]`.trim() : order.note,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
        setPaymentNote("");
        alert("Payment marked as received successfully!");
      }
    } catch (err: any) {
      alert("Failed to mark payment: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Store pickup complete
  const handleCompleteStorePickup = async () => {
    if (!order) return;
    if (!confirm("Customer collected from shop?")) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/orders/${order._id || order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Delivered",
          fulfillment_type: "Store Pickup",
          courierPartner: "Store Counter Pickup",
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
        alert("Order marked as Completed (Store Pickup).");
      }
    } catch (err: any) {
      alert("Failed to update pickup: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Complete without shipway
  const handleCompleteWithoutShipway = async () => {
    if (!order) return;
    if (!confirm("Complete order without Shipway?")) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/orders/${order._id || order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Shipped",
          fulfillment_type: "Direct Delivery",
          courierPartner: "Direct Courier / Hand Delivery",
          transportNotes: deliveryNote || "Direct hand delivery / own courier",
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
        setDeliveryNote("");
        alert("Order completed without Shipway.");
      }
    } catch (err: any) {
      alert("Failed to complete order: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Live Carrier Rate calculation
  const handleCalculateCarrierRates = async () => {
    if (!order) return;
    if (boxLength <= 0 || boxBreadth <= 0 || boxHeight <= 0 || boxWeight <= 0) {
      alert("Please enter valid package Length, Breadth, Height and Weight.");
      return;
    }
    setIsCalculatingRate(true);
    try {
      const res = await fetch(`/api/orders/${order._id || order.id}/carrier-rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          length: boxLength,
          breadth: boxBreadth,
          height: boxHeight,
          weight: boxWeight,
          shipping_provider: shippingGateway,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to calculate carrier rates");
      if (data.rates && data.rates.length > 0) {
        setCarrierOptions(data.rates);
        setSelectedCarrierId(data.rates[0].carrier_id);
      } else {
        alert("No carrier rates found for destination pincode.");
      }
    } catch (err: any) {
      alert("Error calculating rates: " + err.message);
    } finally {
      setIsCalculatingRate(false);
    }
  };

  // Assign Carrier and generate shipment label
  const handleAssignCarrierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    const selected = carrierOptions.find((c) => c.carrier_id === selectedCarrierId) || carrierOptions[0];
    if (!selected) {
      alert("Please click 'Calculate Rates' and select a courier partner first.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/orders/${order._id || order.id}/carrier-assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          box_length: boxLength,
          box_breadth: boxBreadth,
          box_height: boxHeight,
          box_weight: boxWeight,
          carrier_id: selected.carrier_id,
          courier_name: selected.courier_name,
          delivery_charge: selected.delivery_charge,
          cod_charge: selected.cod_charge || 0,
          shipping_provider: shippingGateway,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign carrier");
      if (data.order) setOrder(data.order);
      else fetchOrder();
      alert(data.message || "Shipping label generated successfully!");
    } catch (err: any) {
      alert("Failed to assign carrier: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Direct Download PDF Handler (Invoice)
  const handleDirectDownloadPDF = async () => {
    if (!order) return;
    setIsDownloadingPdf(true);
    const orderNum = order.id.replace(/-/g, "").replace(/^RNORD|^RNOD|^ORD|^OD|^#/i, "");
    const cleanId = order.id ? (order.id.startsWith("RNOD") ? order.id : `RNOD${orderNum}`) : `RNOD${orderNum}`;
    const filename = `${cleanId}_Invoice.pdf`;

    try {
      if (!(window as any).html2canvas) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }
      if (!(window as any).jspdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const element = document.getElementById("direct-order-invoice-template");
      if (!element) throw new Error("Invoice template element not found");

      // Wait for any images to complete loading
      const images = Array.from(element.querySelectorAll("img"));
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((res) => {
            img.onload = res;
            img.onerror = res;
          });
        })
      );

      // Temporarily bring to viewport top:0 at z-index 999999 for snapshot
      element.style.left = "0px";
      element.style.top = "0px";
      element.style.visibility = "visible";
      element.style.opacity = "1";

      await new Promise((r) => setTimeout(r, 60));

      const html2canvas = (window as any).html2canvas;
      const jspdfModule = (window as any).jspdf || window;
      const jsPDF = jspdfModule.jsPDF || (window as any).jsPDF;

      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: "#FFFFFF",
        width: element.offsetWidth || 800,
        height: element.offsetHeight,
      });

      element.style.left = "-99999px";

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfW = pdf.internal.pageSize.getWidth ? pdf.internal.pageSize.getWidth() : 210;
      const pdfH = pdf.internal.pageSize.getHeight ? pdf.internal.pageSize.getHeight() : 297;
      const imgH = (canvas.height * (pdfW - 10)) / canvas.width;

      pdf.addImage(imgData, "JPEG", 5, 5, pdfW - 10, Math.min(imgH, pdfH - 10));
      pdf.save(filename);
    } catch (e: any) {
      console.error("Direct PDF download failed, falling back to window print:", e);
      const oldTitle = document.title;
      document.title = filename.replace(/\.pdf$/, "");
      window.print();
      document.title = oldTitle;
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Direct Download Manifest / Shipping Label Handler
  const handleDirectDownloadManifest = async () => {
    if (!order) return;
    setIsDownloadingManifest(true);
    const orderNum = order.id.replace(/-/g, "").replace(/^RNORD|^RNOD|^ORD|^OD|^#/i, "");
    const cleanId = order.id ? (order.id.startsWith("RNOD") ? order.id : `RNOD${orderNum}`) : `RNOD${orderNum}`;
    const awbCode = order.trackingNumber || `JH${orderNum.padStart(8, "0")}IN`;
    const filename = `${cleanId}_Shipping_Label.pdf`;

    try {
      // 1. Ensure JsBarcode is loaded
      if (!(window as any).JsBarcode) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      // 2. Ensure html2canvas and jspdf are loaded
      if (!(window as any).html2canvas) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }
      if (!(window as any).jspdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const element = document.getElementById("direct-order-manifest-template");
      if (!element) throw new Error("Manifest template element not found");

      // Temporarily bring to viewport top:0 at z-index 999999 for snapshot
      element.style.left = "0px";
      element.style.top = "0px";
      element.style.visibility = "visible";
      element.style.opacity = "1";

      // Render Barcodes
      try {
        (window as any).JsBarcode("#manifest-barcode-awb", awbCode, {
          format: "CODE128",
          width: 2,
          height: 44,
          displayValue: false,
          margin: 0,
        });
        (window as any).JsBarcode("#manifest-barcode-order", cleanId, {
          format: "CODE128",
          width: 2,
          height: 44,
          displayValue: false,
          margin: 0,
        });
      } catch (err) {
        console.error("Barcode rendering error:", err);
      }

      await new Promise((r) => setTimeout(r, 80));

      const html2canvas = (window as any).html2canvas;
      const jspdfModule = (window as any).jspdf || window;
      const jsPDF = jspdfModule.jsPDF || (window as any).jsPDF;

      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: "#FFFFFF",
        width: element.offsetWidth || 500,
        height: element.offsetHeight,
      });

      element.style.left = "-99999px";

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [105, 150], // 4x6 inch thermal shipping label
      });

      const pdfW = pdf.internal.pageSize.getWidth ? pdf.internal.pageSize.getWidth() : 105;
      const pdfH = pdf.internal.pageSize.getHeight ? pdf.internal.pageSize.getHeight() : 150;
      const imgH = (canvas.height * (pdfW - 4)) / canvas.width;

      pdf.addImage(imgData, "JPEG", 2, 2, pdfW - 4, Math.min(imgH, pdfH - 4));
      pdf.save(filename);
    } catch (e: any) {
      console.error("Direct Manifest download failed, falling back to window print:", e);
      window.print();
    } finally {
      setIsDownloadingManifest(false);
    }
  };

  // Pre-render barcodes when order loads
  useEffect(() => {
    if (!order) return;
    const renderBarcodes = async () => {
      try {
        if (!(window as any).JsBarcode) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js";
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        }
        const orderNum = order.id.replace(/-/g, "").replace(/^RNORD|^RNOD|^ORD|^OD|^#/i, "");
        const cleanId = order.id ? (order.id.startsWith("RNOD") ? order.id : `RNOD${orderNum}`) : `RNOD${orderNum}`;
        const awbCode = order.trackingNumber || `JH${orderNum.padStart(8, "0")}IN`;
        (window as any).JsBarcode("#manifest-barcode-awb", awbCode, {
          format: "CODE128",
          width: 2,
          height: 44,
          displayValue: false,
          margin: 0,
        });
        (window as any).JsBarcode("#manifest-barcode-order", cleanId, {
          format: "CODE128",
          width: 2,
          height: 44,
          displayValue: false,
          margin: 0,
        });
      } catch {}
    };
    renderBarcodes();
  }, [order]);

  const isPaid = order?.paymentStatus === "Paid";
  const hasShippingAssigned = Boolean(order?.trackingNumber || (order?.deliveryCharge && order.deliveryCharge > 0));

  // Customer personal fields
  const customerName = order?.customerName || order?.shippingAddress?.firstName || "—";
  const customerPhone = order?.customerPhone || order?.shippingAddress?.phone || "—";
  const customerEmail = order?.customerEmail || order?.shippingAddress?.email || "—";
  const customerCity = order?.shippingAddress?.city || "";
  const customerState = order?.shippingAddress?.state || "";
  const customerCountry = order?.shippingAddress?.country || "India";
  const customerPincode = order?.shippingAddress?.pinCode || "—";
  const customerUUID = order?.uuid || order?.id || "—";

  // Shipping recipient fields
  const shipName = `${order?.shippingAddress?.firstName || ""} ${order?.shippingAddress?.lastName || ""}`.trim() || customerName;
  const shipPhone = order?.shippingAddress?.phone || customerPhone;
  const shipEmail = order?.shippingAddress?.email || customerEmail;
  const shipCity = order?.shippingAddress?.city || "";
  const shipState = order?.shippingAddress?.state || "";
  const shipPincode = order?.shippingAddress?.pinCode || "—";
  const shipBookingAddress = order?.shippingAddress?.address
    ? `${order.shippingAddress.address}, ${shipCity} - ${shipState} - ${shipPincode}`
    : "—";

  // Combined logs
  const logsList = order?.timeline || order?.logs || [];

  // Parse payment_data if present as JSON
  let parsedPayData: any = {};
  if (order?.payment_data) {
    try {
      parsedPayData = typeof order.payment_data === "string" ? JSON.parse(order.payment_data) : order.payment_data;
    } catch {
      parsedPayData = {};
    }
  }

  const effectivePayLinkId = order?.pay_link_id || parsedPayData.razorpay_payment_link_id || "";
  const effectivePaymentId =
    parsedPayData.razorpay_payment_id || order?.razorpayPaymentId || order?.payment_key || "";
  const effectivePaymentRefId =
    parsedPayData.razorpay_payment_link_reference_id || order?.uuid || order?.id || "";
  const effectivePaymentStatus =
    parsedPayData.razorpay_payment_link_status || (isPaid ? "paid" : "pending");

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#0B0F17" : "#F4F6F9" }}>
      <AdminHeader
        title="Dashboard"
        subtitle="Home / Order Details"
        onRefresh={fetchOrder}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div style={{ padding: "16px 32px 6px", fontSize: "13px", color: textMuted }}>
        <Link href="/admin/dashboard" style={{ color: "#0077B6", textDecoration: "none" }}>Dashboard</Link>
        <span style={{ margin: "0 6px" }}>/</span>
        <Link href="/admin/orders" style={{ color: "#0077B6", textDecoration: "none" }}>Home</Link>
        <span style={{ margin: "0 6px" }}>/</span>
        <span style={{ color: textMain, fontWeight: 600 }}>Order Details</span>
      </div>

      <div style={{ padding: "16px 32px 32px", maxWidth: "1500px", margin: "0 auto" }}>
        {loading && (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "4px",
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
              border: "1px solid #DC3545",
              borderRadius: "4px",
              color: "#DC3545",
            }}
          >
            <AlertCircle size={36} style={{ margin: "0 auto 12px" }} />
            <h3>{error}</h3>
            <div style={{ marginTop: "16px" }}>
              <Link
                href="/admin/orders"
                style={{
                  padding: "8px 16px",
                  background: "#0077B6",
                  color: "#FFF",
                  borderRadius: "4px",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Return to Orders
              </Link>
            </div>
          </div>
        )}

        {order && !loading && (
          <div
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "4px",
              padding: "20px 24px",
              boxShadow: "0 0 1px rgba(0,0,0,.125), 0 1px 3px rgba(0,0,0,.2)",
            }}
          >
            {/* Top Action Bar */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                borderBottom: `1px solid ${border}`,
                paddingBottom: "14px",
                gap: "12px",
              }}
            >
              <h4 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: textMain }}>
                #RNOD{order.id.replace(/\D/g, "") || order.id}
              </h4>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                <Link
                  href="/admin/orders"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    background: "#FFC107",
                    color: "#212529",
                    borderRadius: "4px",
                    fontSize: "13px",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  <ArrowLeft size={14} /> Back
                </Link>

                <button
                  type="button"
                  onClick={handleDirectDownloadPDF}
                  disabled={isDownloadingPdf}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    background: "#0077B6",
                    color: "#FFF",
                    border: "1px solid #0077B6",
                    borderRadius: "4px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: isDownloadingPdf ? "not-allowed" : "pointer",
                    opacity: isDownloadingPdf ? 0.7 : 1,
                  }}
                >
                  {isDownloadingPdf ? (
                    <>
                      <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Downloading PDF...
                    </>
                  ) : (
                    <>
                      <Download size={14} /> Download Order PDF
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDirectDownloadManifest}
                  disabled={isDownloadingManifest}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    background: "#DC3545",
                    color: "#FFF",
                    border: "1px solid #DC3545",
                    borderRadius: "4px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: isDownloadingManifest ? "not-allowed" : "pointer",
                    opacity: isDownloadingManifest ? 0.7 : 1,
                  }}
                >
                  {isDownloadingManifest ? (
                    <>
                      <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Generating Manifest...
                    </>
                  ) : (
                    <>
                      <FileText size={14} /> Generate Manifest
                    </>
                  )}
                </button>

                {order.status === "Pending" && (
                  <button
                    onClick={() => {
                      const noteInput = prompt("Edit internal note for order:", order.note || "");
                      if (noteInput !== null) {
                        fetch(`/api/orders/${order._id || order.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ note: noteInput }),
                        }).then(() => fetchOrder());
                      }
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 14px",
                      background: "#212529",
                      color: "#FFF",
                      borderRadius: "4px",
                      fontSize: "13px",
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Edit Order <Edit size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* SECTION 1: Personal Details & Shipping Details (2-Column Table Format) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              {/* Personal Details */}
              <div>
                <div
                  style={{
                    border: `1px solid ${border}`,
                    borderBottom: "none",
                    padding: "8px 12px",
                    textAlign: "center",
                    background: headerBg,
                  }}
                >
                  <strong style={{ color: textMain, fontSize: "14px" }}>Personal Details</strong>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${border}`, fontSize: "13px" }}>
                  <tbody>
                    <tr style={{ borderBottom: `1px solid ${border}` }}>
                      <th style={{ width: "180px", padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                        Name
                      </th>
                      <td style={{ padding: "8px 12px", color: textMain, fontWeight: 600 }}>{customerName}</td>
                    </tr>
                    <tr style={{ borderBottom: `1px solid ${border}` }}>
                      <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                        Mobile
                      </th>
                      <td style={{ padding: "8px 12px", color: textMain }}>{customerPhone}</td>
                    </tr>
                    <tr style={{ borderBottom: `1px solid ${border}` }}>
                      <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                        Email
                      </th>
                      <td style={{ padding: "8px 12px", color: textMain }}>{customerEmail}</td>
                    </tr>
                    <tr style={{ borderBottom: `1px solid ${border}` }}>
                      <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                        City-State-Country
                      </th>
                      <td style={{ padding: "8px 12px", color: textMain }}>
                        {customerCity || customerState ? `${customerCity.toUpperCase()} - ${customerState.toUpperCase()} - ${customerCountry}` : "—"}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: `1px solid ${border}` }}>
                      <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                        Pincode
                      </th>
                      <td style={{ padding: "8px 12px", color: textMain }}>{customerPincode}</td>
                    </tr>
                    <tr>
                      <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                        UUID
                      </th>
                      <td style={{ padding: "8px 12px", color: textMain, fontFamily: "monospace" }}>
                        {customerUUID}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Shipping Details */}
              <div>
                <div
                  style={{
                    border: `1px solid ${border}`,
                    borderBottom: "none",
                    padding: "8px 12px",
                    textAlign: "center",
                    background: headerBg,
                  }}
                >
                  <strong style={{ color: textMain, fontSize: "14px" }}>Shipping Details</strong>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${border}`, fontSize: "13px" }}>
                  <tbody>
                    <tr style={{ borderBottom: `1px solid ${border}` }}>
                      <th style={{ width: "180px", padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                        Name
                      </th>
                      <td style={{ padding: "8px 12px", color: textMain, fontWeight: 600 }}>{shipName}</td>
                    </tr>
                    <tr style={{ borderBottom: `1px solid ${border}` }}>
                      <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                        Mobile
                      </th>
                      <td style={{ padding: "8px 12px", color: textMain }}>{shipPhone}</td>
                    </tr>
                    <tr style={{ borderBottom: `1px solid ${border}` }}>
                      <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                        Email
                      </th>
                      <td style={{ padding: "8px 12px", color: textMain }}>{shipEmail}</td>
                    </tr>
                    <tr style={{ borderBottom: `1px solid ${border}` }}>
                      <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                        City-State
                      </th>
                      <td style={{ padding: "8px 12px", color: textMain }}>
                        {shipCity || shipState ? `${shipCity.toUpperCase()} - ${shipState.toUpperCase()}` : "—"}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: `1px solid ${border}` }}>
                      <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                        Pincode
                      </th>
                      <td style={{ padding: "8px 12px", color: textMain }}>{shipPincode}</td>
                    </tr>
                    <tr>
                      <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                        Booking Address
                      </th>
                      <td style={{ padding: "8px 12px", color: textMain, fontSize: "12px", lineHeight: 1.4 }}>
                        {shipBookingAddress}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 2: Order Details Table */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  border: `1px solid ${border}`,
                  borderBottom: "none",
                  padding: "8px 12px",
                  textAlign: "center",
                  background: headerBg,
                }}
              >
                <strong style={{ color: textMain, fontSize: "14px" }}>Order Details</strong>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${border}`, fontSize: "13px" }}>
                <tbody>
                  <tr style={{ borderBottom: `1px solid ${border}` }}>
                    <th style={{ width: "180px", padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                      Order Number
                    </th>
                    <td style={{ width: "32%", padding: "8px 12px", color: textMain, fontWeight: 700, borderRight: `1px solid ${border}` }}>
                      #OD{order.id.replace(/\D/g, "") || order.id}
                    </td>
                    <th style={{ width: "180px", padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                      Order Unique Id
                    </th>
                    <td style={{ padding: "8px 12px", color: textMain, fontFamily: "monospace" }}>
                      {order.uuid || order.id}
                    </td>
                  </tr>

                  <tr style={{ borderBottom: `1px solid ${border}` }}>
                    <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                      Discount Code
                    </th>
                    <td style={{ padding: "8px 12px", color: textMain, borderRight: `1px solid ${border}` }}>
                      {order.discountCode || "—"}
                    </td>
                    <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                      Discount Amount
                    </th>
                    <td style={{ padding: "8px 12px", color: "#198754", fontWeight: 700, fontSize: "15px" }}>
                      ₹{order.discountAmount ? Number(order.discountAmount).toLocaleString("en-IN") : "0"}
                    </td>
                  </tr>

                  <tr style={{ borderBottom: `1px solid ${border}` }}>
                    <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                      Shipping Amount
                    </th>
                    <td style={{ padding: "8px 12px", color: textMain, fontWeight: 700, fontSize: "15px", borderRight: `1px solid ${border}` }}>
                      ₹{order.shippingAmount || "0"}
                    </td>
                    <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                      Total Amount
                    </th>
                    <td style={{ padding: "8px 12px", color: textMain, fontWeight: 800, fontSize: "20px" }}>
                      ₹{order.totalAmount ? Number(order.totalAmount).toLocaleString("en-IN") : "0"}
                    </td>
                  </tr>

                  <tr style={{ borderBottom: `1px solid ${border}` }}>
                    <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                      Status
                    </th>
                    <td
                      style={{
                        padding: "8px 12px",
                        fontSize: "17px",
                        fontWeight: 800,
                        color: order.status === "Cancelled" ? "#DC3545" : order.status === "Delivered" ? "#198754" : "#0D6EFD",
                        borderRight: `1px solid ${border}`,
                      }}
                    >
                      {order.status}
                    </td>
                    <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                      Fulfillment
                    </th>
                    <td style={{ padding: "8px 12px", color: textMain, fontWeight: 700, fontSize: "15px" }}>
                      {order.fulfillment_type || "Delivery"}
                    </td>
                  </tr>

                  <tr style={{ borderBottom: `1px solid ${border}` }}>
                    <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                      Is Payment?
                    </th>
                    <td style={{ padding: "8px 12px", color: textMain, fontWeight: 700, borderRight: `1px solid ${border}` }}>
                      {isPaid ? "Yes" : "No"}
                    </td>
                    <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                      Payment Terms
                    </th>
                    <td style={{ padding: "8px 12px", color: textMain, fontWeight: 700, fontSize: "15px" }}>
                      {order.payment_term || (order.paymentMethod === "Online Payment" ? "Prepaid" : "COD")}
                    </td>
                  </tr>

                  <tr style={{ borderBottom: `1px solid ${border}` }}>
                    <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                      Payment Key
                    </th>
                    <td colSpan={3} style={{ padding: "8px 12px", color: textMain, fontFamily: "monospace", fontSize: "12px" }}>
                      {order.razorpayPaymentId || order.payment_key || "—"}
                    </td>
                  </tr>

                  <tr>
                    <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                      Note
                    </th>
                    <td style={{ padding: "8px 12px", borderRight: `1px solid ${border}` }}>
                      <textarea
                        rows={4}
                        disabled
                        value={order.note || order.transportNotes || ""}
                        placeholder="No notes added"
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: "4px",
                          border: `1px solid ${border}`,
                          background: inputBg,
                          color: textMuted,
                          fontSize: "12px",
                          boxSizing: "border-box",
                        }}
                      />
                    </td>
                    <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                      Courier Slip
                    </th>
                    <td style={{ padding: "8px 12px" }}>
                      {order.courierSlipUrl || order.transportAttachment ? (
                        <a href={order.courierSlipUrl || order.transportAttachment} target="_blank">
                          <img
                            src={order.courierSlipUrl || order.transportAttachment}
                            alt="Courier Slip"
                            style={{ width: "120px", border: `1px solid ${border}`, borderRadius: "4px" }}
                          />
                        </a>
                      ) : (
                        <span style={{ color: textMuted, fontSize: "12px" }}>No slip attached</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Payment Details Subtable */}
              <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${border}`, borderTop: "none", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: headerBg, borderBottom: `1px solid ${border}` }}>
                    <th colSpan={4} style={{ padding: "8px", textAlign: "center", color: textMain, fontSize: "14px" }}>
                      <strong>Payment Details</strong>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: `1px solid ${border}` }}>
                    <th style={{ width: "180px", padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                      Payment Link Id
                    </th>
                    <td style={{ width: "32%", padding: "8px 12px", color: textMain, borderRight: `1px solid ${border}`, fontFamily: "monospace" }}>
                      {effectivePayLinkId || "—"}
                    </td>
                    <th style={{ width: "180px", padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                      Payment URL
                    </th>
                    <td style={{ padding: "8px 12px", color: textMain }}>
                      {order.pay_link_url ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontFamily: "monospace", fontSize: "12px" }}>{order.pay_link_url}</span>
                          <a
                            href={order.pay_link_url}
                            target="_blank"
                            style={{
                              padding: "4px 10px",
                              background: "#212529",
                              color: "#FFF",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: 700,
                              textDecoration: "none",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Click for Payment
                          </a>
                        </div>
                      ) : (
                        <span style={{ color: textMuted }}>—</span>
                      )}
                    </td>
                  </tr>

                  {effectivePaymentId || effectivePaymentRefId ? (
                    <tr style={{ borderBottom: `1px solid ${border}` }}>
                      <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                        Payment Id
                      </th>
                      <td style={{ padding: "8px 12px", color: textMain, borderRight: `1px solid ${border}`, fontFamily: "monospace" }}>
                        {effectivePaymentId || "—"}
                      </td>
                      <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                        Payment Ref. Id
                      </th>
                      <td style={{ padding: "8px 12px", color: textMain }}>
                        <span style={{ fontFamily: "monospace" }}>{effectivePaymentRefId}</span>
                        <strong
                          style={{
                            color: effectivePaymentStatus.toLowerCase().includes("paid") ? "#198754" : "#DC3545",
                            marginLeft: "6px",
                          }}
                        >
                          ({effectivePaymentStatus})
                        </strong>
                      </td>
                    </tr>
                  ) : null}

                  {order.payment_data ? (
                    <tr style={{ borderBottom: `1px solid ${border}` }}>
                      <td colSpan={4} style={{ padding: "10px 12px", background: isDark ? "#0D1117" : "#F8F9FA", color: textMuted, fontFamily: "monospace", fontSize: "11.5px", wordBreak: "break-all" }}>
                        {typeof order.payment_data === "object" ? JSON.stringify(order.payment_data) : order.payment_data}
                      </td>
                    </tr>
                  ) : null}

                  {!effectivePayLinkId && (
                    <tr>
                      <td colSpan={2} style={{ padding: "8px 12px", color: textMuted }}>
                        Generate Payment Link
                      </td>
                      <td colSpan={2} style={{ padding: "8px 12px" }}>
                        <button
                          onClick={handleGeneratePaymentLink}
                          disabled={isGeneratingLink}
                          style={{
                            padding: "4px 14px",
                            background: "#212529",
                            color: "#FFF",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: 700,
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          {isGeneratingLink ? "Generating Link..." : "Generate"}
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* SECTION 3: Order Products Detail (col-lg-9) & Order Logs (col-lg-3) */}
            <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "20px", marginBottom: "20px" }}>
              {/* Order Products Detail */}
              <div>
                <div
                  style={{
                    border: `1px solid ${border}`,
                    borderBottom: "none",
                    padding: "8px 12px",
                    textAlign: "center",
                    background: headerBg,
                  }}
                >
                  <strong style={{ color: textMain, fontSize: "14px" }}>Order Products Detail</strong>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${border}`, fontSize: "12.5px" }}>
                    <thead>
                      <tr style={{ background: headerBg, borderBottom: `1px solid ${border}` }}>
                        <th style={{ padding: "8px", borderRight: `1px solid ${border}`, color: textMain }}>Id</th>
                        <th style={{ padding: "8px", borderRight: `1px solid ${border}`, color: textMain }}>OrderId</th>
                        <th style={{ padding: "8px", borderRight: `1px solid ${border}`, color: textMain, textAlign: "left" }}>Product Name</th>
                        <th style={{ padding: "8px", borderRight: `1px solid ${border}`, color: textMain }}>Product Code</th>
                        <th style={{ padding: "8px", borderRight: `1px solid ${border}`, color: textMain }}>Color</th>
                        <th style={{ padding: "8px", borderRight: `1px solid ${border}`, color: textMain }}>Size</th>
                        <th style={{ padding: "8px", borderRight: `1px solid ${border}`, color: textMain }}>Price</th>
                        <th style={{ padding: "8px", borderRight: `1px solid ${border}`, color: textMain }}>LBH-Weight</th>
                        <th style={{ padding: "8px", borderRight: `1px solid ${border}`, color: textMain }}>Qty</th>
                        <th style={{ padding: "8px", borderRight: `1px solid ${border}`, color: textMain }}>Amount</th>
                        <th style={{ padding: "8px", color: textMain }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: `1px solid ${border}` }}>
                            <td style={{ padding: "8px", textAlign: "center", borderRight: `1px solid ${border}`, color: textMain }}>
                              {item.id || idx + 1}
                            </td>
                            <td style={{ padding: "8px", textAlign: "center", borderRight: `1px solid ${border}`, color: textMain }}>
                              {order.id.replace(/\D/g, "") || order.id}
                            </td>
                            <td style={{ padding: "8px", textAlign: "left", borderRight: `1px solid ${border}`, color: textMain, fontWeight: 600 }}>
                              {item.name}
                            </td>
                            <td style={{ padding: "8px", textAlign: "center", borderRight: `1px solid ${border}`, color: textMain, fontFamily: "monospace" }}>
                              {item.code || "—"}
                            </td>
                            <td style={{ padding: "8px", textAlign: "center", borderRight: `1px solid ${border}`, color: textMain }}>
                              {item.color || "—"}
                            </td>
                            <td style={{ padding: "8px", textAlign: "center", borderRight: `1px solid ${border}`, color: textMain }}>
                              {item.size || "—"}
                            </td>
                            <td style={{ padding: "8px", textAlign: "right", borderRight: `1px solid ${border}`, color: textMain }}>
                              {item.price}
                            </td>
                            <td style={{ padding: "8px", textAlign: "center", borderRight: `1px solid ${border}`, color: textMain }}>
                              {item.lbhWeight || "0"}
                            </td>
                            <td style={{ padding: "8px", textAlign: "center", borderRight: `1px solid ${border}`, color: textMain, fontWeight: 700 }}>
                              {item.quantity}
                            </td>
                            <td style={{ padding: "8px", textAlign: "right", borderRight: `1px solid ${border}`, color: textMain, fontWeight: 700 }}>
                              {item.price * item.quantity}
                            </td>
                            <td style={{ padding: "8px", textAlign: "center", color: textMain, fontSize: "11px", whiteSpace: "nowrap" }}>
                              {order.orderDate || new Date(order.createdAt || "").toLocaleDateString("en-IN")}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={11} style={{ padding: "16px", textAlign: "center", color: textMuted }}>
                            No items found for this order.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Logs */}
              <div>
                <div
                  style={{
                    border: `1px solid ${border}`,
                    borderBottom: "none",
                    padding: "8px 12px",
                    textAlign: "center",
                    background: headerBg,
                  }}
                >
                  <strong style={{ color: textMain, fontSize: "14px" }}>Order Logs</strong>
                </div>
                <div
                  style={{
                    border: `1px solid ${border}`,
                    maxHeight: "260px",
                    overflowY: "auto",
                    padding: "10px",
                    fontSize: "12px",
                    lineHeight: 1.6,
                    background: inputBg,
                  }}
                >
                  {logsList.length > 0 ? (
                    logsList.map((log, idx) => (
                      <div key={idx} style={{ paddingBottom: "8px", borderBottom: `1px solid ${border}`, marginBottom: "8px" }}>
                        <div style={{ fontWeight: 700, color: textMain }}>{log.user_name || "System"}</div>
                        <div style={{ color: textMuted, fontSize: "11px" }}>{log.created_at ? new Date(log.created_at).toLocaleString("en-IN") : "—"}</div>
                        <div style={{ color: textMain }}>
                          <strong>{log.change_value}</strong> ({log.change_type})
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>
                      <div style={{ fontWeight: 700, color: textMain }}>{customerName}</div>
                      <div style={{ color: textMuted, fontSize: "11px" }}>{order.orderDate || new Date(order.createdAt || "").toLocaleString("en-IN")}</div>
                      <div style={{ color: textMain }}>
                        <strong>{order.status}</strong> (status)
                      </div>
                      {isPaid && (
                        <div style={{ paddingTop: "8px", borderTop: `1px solid ${border}`, marginTop: "8px" }}>
                          <div style={{ fontWeight: 700, color: textMain }}>RAZORPAY</div>
                          <div style={{ color: "#198754" }}>
                            <strong>Paid</strong> (paymentStatus)
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 4: Transport Details Table */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  border: `1px solid ${border}`,
                  borderBottom: "none",
                  padding: "8px 12px",
                  textAlign: "center",
                  background: headerBg,
                }}
              >
                <strong style={{ color: textMain, fontSize: "14px" }}>Transport Details</strong>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${border}`, fontSize: "13px" }}>
                <tbody>
                  <tr style={{ borderBottom: `1px solid ${border}` }}>
                    <th style={{ width: "180px", padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                      Transport Name
                    </th>
                    <td style={{ width: "32%", padding: "8px 12px", color: textMain, fontWeight: 700, borderRight: `1px solid ${border}` }}>
                      {order.courierPartner || "—"}
                    </td>
                    <th style={{ width: "180px", padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                      Transport Contact
                    </th>
                    <td style={{ padding: "8px 12px", color: textMain }}>
                      {order.transportContact || "—"}
                    </td>
                  </tr>

                  <tr style={{ borderBottom: `1px solid ${border}` }}>
                    <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                      Transport Tracking URL
                    </th>
                    <td colSpan={3} style={{ padding: "8px 12px", color: textMain }}>
                      {order.transportUrl ? (
                        <a
                          href={order.transportUrl}
                          target="_blank"
                          style={{ color: "#0D6EFD", textDecoration: "none" }}
                        >
                          {order.transportUrl}
                        </a>
                      ) : (
                        <span style={{ color: textMuted }}>—</span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                      Transport Slip
                    </th>
                    <td style={{ padding: "8px 12px", borderRight: `1px solid ${border}` }}>
                      {order.transportAttachment ? (
                        <a
                          href={order.transportAttachment}
                          target="_blank"
                          style={{ color: "#0D6EFD", fontWeight: 600 }}
                        >
                          Download Slip
                        </a>
                      ) : (
                        <span style={{ color: textMuted }}>—</span>
                      )}
                    </td>
                    <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                      Transport Tracking ID
                    </th>
                    <td style={{ padding: "8px 12px", color: textMain, fontFamily: "monospace", fontWeight: 700 }}>
                      {order.trackingNumber || "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION 5: Payment & Fulfillment Action Card */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  border: `1px solid ${border}`,
                  borderBottom: "none",
                  padding: "8px 12px",
                  background: headerBg,
                }}
              >
                <strong style={{ color: textMain, fontSize: "14px" }}>Payment &amp; Fulfillment</strong>
              </div>
              <div style={{ border: `1px solid ${border}`, padding: "16px", background: cardBg }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <tbody>
                    <tr style={{ borderBottom: `1px solid ${border}` }}>
                      <th style={{ width: "200px", padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                        Payment
                      </th>
                      <td style={{ padding: "8px 12px", borderRight: `1px solid ${border}` }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: "4px",
                            background: isPaid ? "#198754" : "#DC3545",
                            color: "#FFF",
                            fontWeight: 700,
                            fontSize: "12px",
                          }}
                        >
                          {isPaid ? "Received" : "Pending"}
                        </span>
                      </td>
                      <th style={{ width: "200px", padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                        Fulfillment
                      </th>
                      <td style={{ padding: "8px 12px", color: textMain, fontWeight: 600 }}>
                        {order.fulfillment_type || "Delivery"}
                      </td>
                    </tr>

                    {!isPaid && (
                      <tr style={{ borderBottom: `1px solid ${border}` }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                          Confirm Payment
                        </th>
                        <td colSpan={3} style={{ padding: "8px 12px" }}>
                          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <input
                              type="text"
                              placeholder="Payment note (Cash / UPI / bank ref)"
                              value={paymentNote}
                              onChange={(e) => setPaymentNote(e.target.value)}
                              style={{
                                flex: 1,
                                padding: "6px 10px",
                                borderRadius: "4px",
                                border: `1px solid ${border}`,
                                background: inputBg,
                                color: textMain,
                                fontSize: "13px",
                              }}
                            />
                            <button
                              onClick={handleMarkPaymentReceived}
                              style={{
                                padding: "6px 16px",
                                background: "#198754",
                                color: "#FFF",
                                border: "none",
                                borderRadius: "4px",
                                fontWeight: 700,
                                fontSize: "13px",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Mark Payment Received
                            </button>
                          </div>
                          <div style={{ fontSize: "11px", color: textMuted, marginTop: "4px" }}>
                            Use when payment done but Razorpay link was not created.
                          </div>
                        </td>
                      </tr>
                    )}

                    <tr style={{ borderBottom: `1px solid ${border}` }}>
                      <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                        Store Pickup
                      </th>
                      <td colSpan={3} style={{ padding: "8px 12px" }}>
                        <button
                          onClick={handleCompleteStorePickup}
                          style={{
                            padding: "6px 14px",
                            background: "#0DCAF0",
                            color: "#000",
                            border: "none",
                            borderRadius: "4px",
                            fontWeight: 700,
                            fontSize: "13px",
                            cursor: "pointer",
                          }}
                        >
                          Complete — Picked Up from Shop
                        </button>
                        <span style={{ fontSize: "11.5px", color: textMuted, marginLeft: "10px" }}>
                          Paid online, customer collects at shop. No Shipway.
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                        Without Shipway
                      </th>
                      <td colSpan={3} style={{ padding: "8px 12px" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <input
                            type="text"
                            placeholder="Delivery note (optional)"
                            value={deliveryNote}
                            onChange={(e) => setDeliveryNote(e.target.value)}
                            style={{
                              flex: 1,
                              padding: "6px 10px",
                              borderRadius: "4px",
                              border: `1px solid ${border}`,
                              background: inputBg,
                              color: textMain,
                              fontSize: "13px",
                            }}
                          />
                          <button
                            onClick={handleCompleteWithoutShipway}
                            style={{
                              padding: "6px 16px",
                              background: "#0D6EFD",
                              color: "#FFF",
                              border: "none",
                              borderRadius: "4px",
                              fontWeight: 700,
                              fontSize: "13px",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Complete — No Shipway
                          </button>
                        </div>
                        <div style={{ fontSize: "11px", color: textMuted, marginTop: "4px" }}>
                          Hand delivery / own courier. No Shipway label needed.
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 6: Process Order Shipping (Shiprocket & Shipway) */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  border: `1px solid ${border}`,
                  borderBottom: "none",
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: headerBg,
                }}
              >
                <strong style={{ color: textMain, fontSize: "14px" }}>
                  Process Order Shipping (Shiprocket &amp; Shipway)
                </strong>
                <button
                  type="button"
                  onClick={handleDirectDownloadManifest}
                  disabled={isDownloadingManifest}
                  style={{
                    padding: "5px 14px",
                    background: "#198754",
                    color: "#FFF",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: "none",
                    cursor: isDownloadingManifest ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {isDownloadingManifest ? (
                    <>
                      <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Generating Label...
                    </>
                  ) : (
                    <>
                      <Download size={12} /> Download Shipping Label (Thermal / PDF)
                    </>
                  )}
                </button>
              </div>

              <div style={{ border: `1px solid ${border}`, padding: "16px", background: cardBg }}>
                <form onSubmit={handleAssignCarrierSubmit}>
                  {/* Gateway Radio Selector (when not assigned yet) */}
                  {!hasShippingAssigned && (
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: textMain, marginBottom: "6px" }}>
                        Choose Shipping Gateway:
                      </label>
                      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: 700, color: "#0D6EFD" }}>
                          <input
                            type="radio"
                            name="shipping_gateway"
                            value="shiprocket"
                            checked={shippingGateway === "shiprocket"}
                            onChange={() => {
                              setShippingGateway("shiprocket");
                              setCarrierOptions([]);
                            }}
                          />
                          Shiprocket
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: 700, color: "#198754" }}>
                          <input
                            type="radio"
                            name="shipping_gateway"
                            value="shipway"
                            checked={shippingGateway === "shipway"}
                            onChange={() => {
                              setShippingGateway("shipway");
                              setCarrierOptions([]);
                            }}
                          />
                          Shipway
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Dimension Inputs */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "14px", marginBottom: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                        Package Length (CM)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        disabled={hasShippingAssigned}
                        value={boxLength}
                        onChange={(e) => setBoxLength(parseFloat(e.target.value) || 0)}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: "4px",
                          border: `1px solid ${border}`,
                          background: inputBg,
                          color: textMain,
                          fontSize: "13px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                        Package Breadth (CM)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        disabled={hasShippingAssigned}
                        value={boxBreadth}
                        onChange={(e) => setBoxBreadth(parseFloat(e.target.value) || 0)}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: "4px",
                          border: `1px solid ${border}`,
                          background: inputBg,
                          color: textMain,
                          fontSize: "13px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                        Package Height (CM)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        disabled={hasShippingAssigned}
                        value={boxHeight}
                        onChange={(e) => setBoxHeight(parseFloat(e.target.value) || 0)}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: "4px",
                          border: `1px solid ${border}`,
                          background: inputBg,
                          color: textMain,
                          fontSize: "13px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                        Package Weight (Kg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        disabled={hasShippingAssigned}
                        value={boxWeight}
                        onChange={(e) => setBoxWeight(parseFloat(e.target.value) || 0)}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: "4px",
                          border: `1px solid ${border}`,
                          background: inputBg,
                          color: textMain,
                          fontSize: "13px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    {!hasShippingAssigned && (
                      <div style={{ display: "flex", alignItems: "flex-end" }}>
                        <button
                          type="button"
                          onClick={handleCalculateCarrierRates}
                          disabled={isCalculatingRate}
                          style={{
                            width: "100%",
                            padding: "8px 14px",
                            background: "#FFC107",
                            color: "#212529",
                            border: "none",
                            borderRadius: "4px",
                            fontWeight: 700,
                            fontSize: "13px",
                            cursor: "pointer",
                          }}
                        >
                          {isCalculatingRate ? "Calculating..." : "Calculate Rates"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Courier selection dropdown (when rates are fetched and not yet assigned) */}
                  {!hasShippingAssigned && carrierOptions.length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "4px" }}>
                        Select Courier Partner
                      </label>
                      <select
                        value={selectedCarrierId}
                        onChange={(e) => setSelectedCarrierId(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: "4px",
                          border: `1px solid ${border}`,
                          background: inputBg,
                          color: textMain,
                          fontSize: "13px",
                          fontWeight: 700,
                          marginBottom: "12px",
                        }}
                      >
                        {carrierOptions.map((opt) => (
                          <option key={opt.carrier_id} value={opt.carrier_id}>
                            {opt.courier_name} — Delivery: ₹{opt.delivery_charge} | Total: ₹{opt.total_delivery_charge}
                          </option>
                        ))}
                      </select>

                      <button
                        type="submit"
                        disabled={isSaving}
                        style={{
                          padding: "8px 20px",
                          background: "#0D6EFD",
                          color: "#FFF",
                          border: "none",
                          borderRadius: "4px",
                          fontSize: "13px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {isSaving ? "Generating..." : "Generate Shipping Label"}
                      </button>
                    </div>
                  )}

                  {/* Calculated Rates / Assigned Carrier Details */}
                  {hasShippingAssigned && (
                    <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${border}`, fontSize: "13px" }}>
                      <tbody>
                        <tr style={{ borderBottom: `1px solid ${border}` }}>
                          <th style={{ width: "200px", padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                            Gateway
                          </th>
                          <td style={{ padding: "8px 12px" }}>
                            <span
                              style={{
                                padding: "4px 10px",
                                borderRadius: "4px",
                                background: order.shippingProvider === "Shiprocket" ? "#0D6EFD" : "#198754",
                                color: "#FFF",
                                fontWeight: 700,
                                fontSize: "12px",
                              }}
                            >
                              {order.shippingProvider || "Shipway"}
                            </span>
                          </td>
                        </tr>

                        <tr style={{ borderBottom: `1px solid ${border}` }}>
                          <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                            Carrier ID / Code
                          </th>
                          <td style={{ padding: "8px 12px", color: textMain }}>
                            {order.carrierId || "—"}
                          </td>
                        </tr>

                        <tr style={{ borderBottom: `1px solid ${border}` }}>
                          <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                            Courier Name
                          </th>
                          <td style={{ padding: "8px 12px", color: textMain, fontWeight: 700 }}>
                            {order.courierPartner || "—"}
                          </td>
                        </tr>

                        <tr style={{ borderBottom: `1px solid ${border}` }}>
                          <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                            AWB / Tracking Number
                          </th>
                          <td style={{ padding: "8px 12px", color: textMain }}>
                            <strong style={{ fontFamily: "monospace" }}>{order.trackingNumber || "—"}</strong>
                            {order.transportUrl && (
                              <>
                                <span style={{ margin: "0 8px" }}>|</span>
                                <a href={order.transportUrl} target="_blank" style={{ color: "#0DCAF0", fontWeight: 700 }}>
                                  Track Parcel
                                </a>
                              </>
                            )}
                          </td>
                        </tr>

                        <tr style={{ borderBottom: `1px solid ${border}` }}>
                          <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                            Delivery Charge
                          </th>
                          <td style={{ padding: "8px 12px", color: textMain }}>
                            ₹{order.deliveryCharge ?? "0"}
                          </td>
                        </tr>

                        <tr style={{ borderBottom: `1px solid ${border}` }}>
                          <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                            GST Charge (18%)
                          </th>
                          <td style={{ padding: "8px 12px", color: textMain }}>
                            ₹{order.gstCharge ?? "0"}
                          </td>
                        </tr>

                        <tr style={{ borderBottom: `1px solid ${border}` }}>
                          <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                            Total Delivery Amount
                          </th>
                          <td style={{ padding: "8px 12px", color: "#0D6EFD", fontWeight: 800, fontSize: "16px" }}>
                            ₹{order.totalDeliveryCharge ?? (order.deliveryCharge ? (order.deliveryCharge * 1.18).toFixed(2) : "0")}
                          </td>
                        </tr>

                        <tr>
                          <th style={{ padding: "8px 12px", textAlign: "left", background: headerBg, borderRight: `1px solid ${border}`, color: textMain }}>
                            Shipping Label PDF
                          </th>
                          <td style={{ padding: "8px 12px" }}>
                            <button
                              type="button"
                              onClick={handleDirectDownloadManifest}
                              disabled={isDownloadingManifest}
                              style={{
                                padding: "4px 14px",
                                border: "1px solid #198754",
                                background: "#198754",
                                color: "#FFF",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontWeight: 700,
                                cursor: isDownloadingManifest ? "not-allowed" : "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              {isDownloadingManifest ? (
                                <>
                                  <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Generating...
                                </>
                              ) : (
                                <>
                                  <Download size={12} /> Download Label PDF
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </form>
              </div>
            </div>

            {/* SECTION 7: Order Actions Card */}
            <div>
              <div
                style={{
                  border: `1px solid ${border}`,
                  borderBottom: "none",
                  padding: "8px 12px",
                  background: headerBg,
                }}
              >
                <strong style={{ color: textMain, fontSize: "14px" }}>Order Actions</strong>
              </div>

              <div style={{ border: `1px solid ${border}`, padding: "16px", background: cardBg }}>
                <form onSubmit={handleUpdateStatus}>
                  <div style={{ maxWidth: "320px", marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: textMain, marginBottom: "6px" }}>
                      Order Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "4px",
                        border: `1px solid ${border}`,
                        background: inputBg,
                        color: textMain,
                        fontSize: "13px",
                        fontWeight: 700,
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="In-Progress">In-Progress</option>
                      <option value="In-Transit">In-Transit</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    style={{
                      padding: "8px 20px",
                      background: "#212529",
                      color: "#FFF",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {isSaving ? "Saving Details..." : "Save Details"}
                  </button>

                  {saveSuccess && (
                    <span style={{ color: "#198754", fontSize: "13px", fontWeight: 700, marginLeft: "12px" }}>
                      ✓ Saved successfully!
                    </span>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Invoice Template for Direct 1-Click PDF Generation */}
      {order && (
        <div
          id="direct-order-invoice-template"
          style={{
            position: "fixed",
            left: "-99999px",
            top: 0,
            width: "800px",
            background: "#FFFFFF",
            color: "#111827",
            fontFamily: "'Times New Roman', Times, serif",
            fontSize: "13.5px",
            lineHeight: 1.45,
            padding: "28px 32px",
            boxSizing: "border-box",
            zIndex: 999999,
            pointerEvents: "none",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "12px" }}>
            <div style={{ width: "58%" }}>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 800, color: "#000000", letterSpacing: "0.3px" }}>
                RN FAUCETS PRIVATE LIMITED
              </h4>
              <p style={{ margin: "3px 0", fontSize: "13px", color: "#222222" }}>Address: B-68 Site-4 Industrial Area, Sahibabad Ghaziabad-201010</p>
              <p style={{ margin: "3px 0", fontSize: "13px", color: "#222222" }}>Phone: 1800123400400</p>
              <p style={{ margin: "3px 0", fontSize: "13px", color: "#222222" }}>Email: enquiry@rnvalves.com</p>
              <p style={{ margin: "3px 0", fontSize: "13px", color: "#222222" }}>
                website: <span style={{ color: "#0044cc", textDecoration: "underline" }}>www.rnvalves.com</span>
              </p>
              <p style={{ margin: "3px 0", fontSize: "13px", color: "#222222" }}>
                <strong>GSTIN No.: 09AAKCR3772K1ZR</strong>
              </p>
            </div>

            <div style={{ width: "40%", textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ marginBottom: "8px" }}>
                <img
                  src="/users/images/logoc.png"
                  alt="RN Valves & Faucets"
                  width={100}
                  style={{ width: "100px", height: "auto", display: "block", marginLeft: "auto", objectFit: "contain" }}
                />
              </div>
              <h2 style={{ margin: "4px 0 2px 0", fontSize: "22px", fontWeight: 800, color: "#000000" }}>
                RNOD #{order.id ? (order.id.replace(/\D/g, "") || order.id) : ""}
              </h2>
              <p style={{ margin: "2px 0", fontSize: "13px", color: "#333333" }}>
                Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Bill To */}
          <div style={{ marginTop: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 8px 0", color: "#000000" }}>Bill To:</h2>
            <p style={{ margin: "3px 0", fontSize: "13px", fontWeight: 600, color: "#222222" }}>
              {order.shippingAddress?.firstName || order.customerName || "—"} {order.shippingAddress?.lastName || ""}
            </p>
            <p style={{ margin: "3px 0", fontSize: "13px", color: "#222222" }}>
              {order.shippingAddress?.address ? `${order.shippingAddress.address}, ` : ""}
              {order.shippingAddress?.city ? `${order.shippingAddress.city}, ` : ""}
              {order.shippingAddress?.state ? `${order.shippingAddress.state} ` : ""}
              {order.shippingAddress?.pinCode ? `${order.shippingAddress.pinCode}` : ""}
            </p>
            <p style={{ margin: "3px 0", fontSize: "13px", color: "#222222" }}>
              Phone: {order.shippingAddress?.phone || order.customerPhone || "—"}
            </p>
            <p style={{ margin: "3px 0", fontSize: "13px", color: "#222222" }}>
              Email: {order.shippingAddress?.email || order.customerEmail || "noreply@rnvalves.com"}
            </p>
          </div>

          {/* Order Details Table */}
          <div style={{ marginTop: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 8px 0", color: "#000000" }}>Order Details:</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #cccccc", padding: "8px 10px", textAlign: "left", paddingLeft: "14px", backgroundColor: "#f0f0f0", fontWeight: 800, color: "#000000", fontSize: "12.5px" }}>
                    Product Description
                  </th>
                  <th style={{ border: "1px solid #cccccc", padding: "8px 10px", width: "120px", textAlign: "center", backgroundColor: "#f0f0f0", fontWeight: 800, color: "#000000", fontSize: "12.5px" }}>
                    Code
                  </th>
                  <th style={{ border: "1px solid #cccccc", padding: "8px 10px", width: "90px", textAlign: "center", backgroundColor: "#f0f0f0", fontWeight: 800, color: "#000000", fontSize: "12.5px" }}>
                    HSN
                  </th>
                  <th style={{ border: "1px solid #cccccc", padding: "8px 10px", width: "60px", textAlign: "center", backgroundColor: "#f0f0f0", fontWeight: 800, color: "#000000", fontSize: "12.5px" }}>
                    QTY
                  </th>
                  <th style={{ border: "1px solid #cccccc", padding: "8px 10px", width: "90px", textAlign: "center", backgroundColor: "#f0f0f0", fontWeight: 800, color: "#000000", fontSize: "12.5px" }}>
                    Unit Price
                  </th>
                  <th style={{ border: "1px solid #cccccc", padding: "8px 10px", width: "90px", textAlign: "center", backgroundColor: "#f0f0f0", fontWeight: 800, color: "#000000", fontSize: "12.5px" }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ border: "1px solid #cccccc", padding: "8px 10px", textAlign: "left", paddingLeft: "14px", fontSize: "12.5px", color: "#111827" }}>
                      {item.name} {item.color ? `(${item.color})` : ""}
                    </td>
                    <td style={{ border: "1px solid #cccccc", padding: "8px 10px", textAlign: "center", fontSize: "12.5px", color: "#111827" }}>
                      {item.code || item.id || "—"}
                    </td>
                    <td style={{ border: "1px solid #cccccc", padding: "8px 10px", textAlign: "center", fontSize: "12.5px", color: "#111827" }}>
                      84818090
                    </td>
                    <td style={{ border: "1px solid #cccccc", padding: "8px 10px", textAlign: "center", fontSize: "12.5px", color: "#111827" }}>
                      {item.quantity}
                    </td>
                    <td style={{ border: "1px solid #cccccc", padding: "8px 10px", textAlign: "center", fontSize: "12.5px", color: "#111827" }}>
                      {item.price}
                    </td>
                    <td style={{ border: "1px solid #cccccc", padding: "8px 10px", textAlign: "center", fontSize: "12.5px", color: "#111827" }}>
                      {(item.price * item.quantity).toFixed(item.price % 1 === 0 ? 0 : 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={5} style={{ border: "1px solid #cccccc", padding: "8px 10px", textAlign: "right", paddingRight: "16px", backgroundColor: "#f0f0f0", fontWeight: 800, fontSize: "12.5px", color: "#000000" }}>
                    Subtotal:
                  </th>
                  <td style={{ border: "1px solid #cccccc", padding: "8px 10px", textAlign: "center", fontWeight: 800, fontSize: "12.5px", color: "#111827" }}>
                    {(order.items || []).reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0).toFixed((order.items || []).reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0) % 1 === 0 ? 0 : 2)}
                  </td>
                </tr>
                {(order.discountAmount || 0) > 0 && (
                  <tr>
                    <th colSpan={5} style={{ border: "1px solid #cccccc", padding: "8px 10px", textAlign: "right", paddingRight: "16px", backgroundColor: "#f0f0f0", fontWeight: 800, fontSize: "12.5px", color: "#000000" }}>
                      Discount:
                    </th>
                    <td style={{ border: "1px solid #cccccc", padding: "8px 10px", textAlign: "center", color: "#16a34a", fontWeight: "bold", fontSize: "12.5px" }}>
                      - {(order.discountAmount || 0).toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr>
                  <th colSpan={5} style={{ border: "1px solid #cccccc", padding: "8px 10px", textAlign: "right", paddingRight: "16px", backgroundColor: "#f0f0f0", fontWeight: 800, fontSize: "12.5px", color: "#000000" }}>
                    Shipping Charges:
                  </th>
                  <td style={{ border: "1px solid #cccccc", padding: "8px 10px", textAlign: "center", fontWeight: 800, fontSize: "12.5px", color: "#111827" }}>
                    {order.shippingAmount || order.deliveryCharge || 0}
                  </td>
                </tr>
                <tr>
                  <th colSpan={5} style={{ border: "1px solid #cccccc", padding: "8px 10px", textAlign: "right", paddingRight: "16px", backgroundColor: "#f0f0f0", fontWeight: 800, fontSize: "12.5px", color: "#000000" }}>
                    Total:
                  </th>
                  <td style={{ border: "1px solid #cccccc", padding: "8px 10px", textAlign: "center", fontWeight: "bold", fontSize: "12.5px", color: "#111827" }}>
                    {(order.totalAmount || (order.items || []).reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0)).toFixed((order.totalAmount || 0) % 1 === 0 ? 0 : 2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Terms */}
          <div style={{ marginTop: "24px", paddingTop: "6px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 8px 0", color: "#000000" }}>Payment Terms:</h2>
            <p style={{ margin: "4px 0", fontSize: "13px", color: "#222222" }}>
              Payment Method: <strong>{order.paymentMethod === "Cash on Delivery" ? "COD" : order.paymentStatus === "Paid" ? "Prepaid" : order.paymentMethod || "Prepaid"}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Hidden Shipping Manifest / Thermal Label Template (Matches Exact Shipping Label Design) */}
      {order && (
        <div
          id="direct-order-manifest-template"
          style={{
            position: "fixed",
            left: "-99999px",
            top: 0,
            width: "500px",
            backgroundColor: "#FFFFFF",
            color: "#000000",
            fontFamily: "Arial, Helvetica, sans-serif",
            boxSizing: "border-box",
            border: "2.5px solid #000000",
            zIndex: 999999,
            pointerEvents: "none",
            fontSize: "11.5px",
            lineHeight: "1.35",
          }}
        >
          {/* 1. TOP SECTION: Ship To & RN Logo */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 14px", borderBottom: "2px solid #000000" }}>
            <div style={{ width: "68%" }}>
              <div style={{ fontSize: "14px", fontWeight: "900", color: "#000000", marginBottom: "3px" }}>
                Ship To
              </div>
              <div style={{ fontSize: "13px", fontWeight: "700", fontStyle: "italic", color: "#000000", marginBottom: "3px" }}>
                {order.shippingAddress?.firstName || order.customerName || "Valued Customer"} {order.shippingAddress?.lastName || ""}
              </div>
              <div style={{ fontSize: "11.5px", fontStyle: "italic", color: "#000000", lineHeight: "1.35" }}>
                {order.shippingAddress?.address ? `${order.shippingAddress.address}, ` : ""}
                {order.shippingAddress?.city ? `${order.shippingAddress.city}, ` : ""}
                {order.shippingAddress?.state ? `${order.shippingAddress.state} ` : ""}
                {order.shippingAddress?.pinCode ? `${order.shippingAddress.pinCode} ` : ""}
                {order.shippingAddress?.state ? `${order.shippingAddress.state}-${order.shippingAddress.pinCode || ''} ` : ""}
                {order.shippingAddress?.city ? `${order.shippingAddress.city}, ` : ""}
                {order.shippingAddress?.state ? `${order.shippingAddress.state}, ` : ""}
                {order.shippingAddress?.country || "India"} {order.shippingAddress?.pinCode || ""}
              </div>
              <div style={{ fontSize: "12px", fontStyle: "italic", fontWeight: "600", marginTop: "4px", color: "#000000" }}>
                Phone No.: {order.shippingAddress?.phone || order.customerPhone || "—"}
              </div>
            </div>

            <div style={{ width: "30%", textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <img
                src="/users/images/logoc.png"
                alt="RN Valves & Faucets"
                style={{ width: "95px", height: "auto", objectFit: "contain", display: "block", marginLeft: "auto" }}
              />
            </div>
          </div>

          {/* 2. MIDDLE SECTION: Dimensions, Payment & Tracking Barcode */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "2px solid #000000" }}>
            <div style={{ width: "48%", fontSize: "11px", lineHeight: "1.4" }}>
              <div>
                Dimensions: {(order.packageLength || 17).toFixed(2)}*{(order.packageBreadth || 11).toFixed(2)}*{(order.packageHeight || 10).toFixed(2)}(cm)
              </div>
              <div style={{ margin: "2px 0" }}>
                Payment: <strong>{order.paymentMethod === "Cash on Delivery" ? "COD" : "PREPAID"}</strong>
              </div>
              <div>
                ORDER TOTAL: {Math.round(order.totalAmount || (order.items || []).reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0))} INR
              </div>
              <div style={{ margin: "2px 0" }}>
                Weight: {(order.packageWeight || 0.5).toFixed(2)} kg
              </div>
              <div>eWaybill No.: N/A</div>
            </div>

            <div style={{ width: "50%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>
                {order.courierPartner || "India Post-Business Parcel_2.0"}
              </div>
              <div style={{ display: "flex", justifyContent: "center", margin: "2px 0" }}>
                <canvas id="manifest-barcode-awb" style={{ maxHeight: "42px", maxWidth: "100%" }}></canvas>
              </div>
              <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px" }}>
                {order.trackingNumber || `JH${(order.id.replace(/\D/g, "") || "04277305").padStart(8, "0")}IN`}
              </div>
              <div style={{ fontSize: "10.5px", color: "#333", marginTop: "2px" }}>Routing Code: NA</div>
            </div>
          </div>

          {/* 3. SHIPPED BY & ORDER BARCODE SECTION */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 14px", borderBottom: "2px solid #000000" }}>
            <div style={{ width: "52%", fontSize: "11px", lineHeight: "1.3" }}>
              <div style={{ fontSize: "12px", fontWeight: "900", marginBottom: "2px" }}>
                Shipped By <span style={{ fontSize: "10.5px", fontWeight: "400" }}>(If undelivered, return to)</span>
              </div>
              <div style={{ fontStyle: "italic", fontWeight: "700", marginBottom: "2px" }}>
                Shivam Dubey
              </div>
              <div style={{ fontStyle: "italic", color: "#111", fontSize: "10.5px" }}>
                Basement, B-68, site-4, Sahibabad Ghaziabad 201010 Site 4, Sahibabad Industrial Area Site 4, Sahibabad, Ghaziabad, Uttar Pradesh 201010, India Ghaziabad 201010
              </div>
              <div style={{ fontStyle: "italic", fontWeight: "700", marginTop: "3px" }}>
                GSTIN: 09AAKCR3772K1ZR
              </div>
              <div style={{ fontStyle: "italic" }}>
                Phone No.: 9315603920
              </div>
            </div>

            <div style={{ width: "46%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>
                Order #: RNOD{order.id.replace(/\D/g, "") || order.id}
              </div>
              <div style={{ display: "flex", justifyContent: "center", margin: "2px 0" }}>
                <canvas id="manifest-barcode-order" style={{ maxHeight: "42px", maxWidth: "100%" }}></canvas>
              </div>
              <div style={{ fontSize: "11px", marginTop: "3px" }}>
                Invoice No.: Retail000{order.id.replace(/\D/g, "") || "16"}
              </div>
              <div style={{ fontSize: "11px" }}>
                Invoice Date: {new Date(order.createdAt || Date.now()).toISOString().split("T")[0]}
              </div>
            </div>
          </div>

          {/* 4. PRODUCTS BREAKDOWN TABLE */}
          <div style={{ borderBottom: "2px solid #000000" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5px", textAlign: "center" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid #000000", fontWeight: "800" }}>
                  <th style={{ borderRight: "1.5px solid #000000", padding: "5px 6px", textAlign: "left", width: "40%" }}>Product Name &amp; SKU</th>
                  <th style={{ borderRight: "1.5px solid #000000", padding: "5px 4px", width: "14%" }}>HSN</th>
                  <th style={{ borderRight: "1.5px solid #000000", padding: "5px 4px", width: "8%" }}>Qty</th>
                  <th style={{ borderRight: "1.5px solid #000000", padding: "5px 4px", width: "12%" }}>Unit Price</th>
                  <th style={{ borderRight: "1.5px solid #000000", padding: "5px 4px", width: "12%" }}>Taxable Value</th>
                  <th style={{ borderRight: "1.5px solid #000000", padding: "5px 4px", width: "7%" }}>IGST</th>
                  <th style={{ padding: "5px 4px", width: "12%" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ borderRight: "1.5px solid #000000", padding: "5px 6px", textAlign: "left" }}>
                      {item.name} {item.color ? `(${item.color})` : ""}<br />
                      <span style={{ fontSize: "9.5px", color: "#333" }}>SKU: {item.code || item.id || "RNALP28G19"}</span>
                    </td>
                    <td style={{ borderRight: "1.5px solid #000000", padding: "5px 4px" }}>84818090</td>
                    <td style={{ borderRight: "1.5px solid #000000", padding: "5px 4px", fontWeight: "700" }}>{item.quantity}</td>
                    <td style={{ borderRight: "1.5px solid #000000", padding: "5px 4px" }}>{item.price.toFixed(2)}</td>
                    <td style={{ borderRight: "1.5px solid #000000", padding: "5px 4px" }}>{(item.price * item.quantity).toFixed(2)}</td>
                    <td style={{ borderRight: "1.5px solid #000000", padding: "5px 4px" }}>0.00</td>
                    <td style={{ padding: "5px 4px", fontWeight: "700" }}>{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5. LEGAL NOTICE */}
          <div style={{ padding: "8px 12px", fontSize: "10px", lineHeight: "1.35", borderBottom: "2px solid #000000", color: "#111" }}>
            All disputes are subject to Uttar Pradesh jurisdiction only. Goods once sold will only be taken back or exchanged as per the store&apos;s exchange/return policy.
          </div>

          {/* 6. BOTTOM FOOTER & POWERED BY */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px" }}>
            <div style={{ fontSize: "9.5px", fontWeight: "800", color: "#000" }}>
              THIS IS AN AUTO-GENERATED LABEL AND DOES NOT NEED SIGNATURE.
            </div>
            <div style={{ textAlign: "right", fontSize: "9px", color: "#444" }}>
              Powered By:<br />
              <strong style={{ fontSize: "11px", color: "#6b21a8" }}>Shiprocket</strong>
            </div>
          </div>

          <div style={{ textAlign: "center", fontSize: "13px", fontWeight: "700", padding: "4px 0 6px" }}>
            1/1
          </div>
        </div>
      )}
    </div>
  );
}
