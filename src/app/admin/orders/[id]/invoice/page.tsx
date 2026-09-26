"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, Download } from "lucide-react";

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
  paymentStatus: string;
  status: string;
  shippingAddress: ShippingAddress;
  orderDate: string;
  discountCode?: string;
  discountAmount?: number;
  shippingAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function OrderInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.id as string) || "";

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    fetch(`/api/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Order not found");
        return res.json();
      })
      .then((data) => {
        setOrder(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const subtotal = (order?.items || []).reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  );

  const discountVal = order?.discountAmount || 0;
  const shippingVal = order?.shippingAmount || 0;
  const grandTotal = order?.totalAmount || (subtotal - discountVal + shippingVal);

  const paymentTerm =
    order?.paymentMethod === "Cash on Delivery"
      ? "COD"
      : order?.paymentStatus === "Paid"
      ? "Prepaid"
      : order?.paymentMethod || "Prepaid";

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center", fontFamily: "'Manrope', sans-serif" }}>
        Loading Invoice #{orderId}...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ padding: "60px", textAlign: "center", fontFamily: "'Manrope', sans-serif", color: "#dc2626" }}>
        <h3>Error: {error || "Order not found"}</h3>
        <Link href="/admin/orders" style={{ color: "#0077b6", marginTop: "12px", display: "inline-block" }}>
          ← Back to Orders List
        </Link>
      </div>
    );
  }

  const orderNum = order.id.replace(/-/g, "").replace(/^RNORD|^RNOD|^ORD|^OD|^#/i, "");

  return (
    <div className="invoice-page-wrapper">
      {/* Top Action Header (Hidden when printing) */}
      <div className="invoice-action-bar no-print">
        <Link href={`/admin/orders/${order._id || order.id}`} className="btn-back">
          <ArrowLeft size={16} /> Back to Order Management
        </Link>
        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" onClick={handlePrint} className="btn-print">
            <Printer size={16} /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Main Proforma Bill / Invoice Container */}
      <div className="invoice-container">
        {/* Header Section */}
        <header className="invoice-header">
          <div className="company-info">
            <h4>RN FAUCETS PRIVATE LIMITED</h4>
            <p>Address: B-68 Site-4 Industrial Area, Sahibabad Ghaziabad-201010</p>
            <p>Phone: 1800123400400</p>
            <p>Email: enquiry@rnvalves.com</p>
            <p>
              website: <a href="https://www.rnvalves.com" target="_blank" rel="noreferrer">www.rnvalves.com</a>
            </p>
            <p>
              <strong>GSTIN No.: 09AAKCR3772K1ZR</strong>
            </p>
          </div>

          <div className="invoice-info">
            <div className="logo-box">
              <img
                src="/users/images/logoc.png"
                alt="RN Valves & Faucets"
                width={100}
                style={{ width: "100px", height: "auto", display: "block", marginLeft: "auto", objectFit: "contain" }}
              />
            </div>
            <h2>RNOD #{orderNum}</h2>
            <p className="invoice-date">Date: {formatDate(order.createdAt || order.orderDate)}</p>
          </div>
        </header>

        {/* Bill To Section */}
        <section className="customer-info">
          <h2>Bill To:</h2>
          <p className="customer-name">{order.shippingAddress?.firstName || order.customerName} {order.shippingAddress?.lastName || ""}</p>
          <p className="customer-address">
            {order.shippingAddress?.address ? `${order.shippingAddress.address}, ` : ""}
            {order.shippingAddress?.city ? `${order.shippingAddress.city}, ` : ""}
            {order.shippingAddress?.state ? `${order.shippingAddress.state} ` : ""}
            {order.shippingAddress?.pinCode ? `${order.shippingAddress.pinCode}` : ""}
          </p>
          <p>Phone: {order.shippingAddress?.phone || order.customerPhone}</p>
          <p>Email: {order.shippingAddress?.email || order.customerEmail || "noreply@rnvalves.com"}</p>
        </section>

        {/* Order Details Table */}
        <section className="order-details">
          <h2>Order Details:</h2>
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: "left", paddingLeft: "14px" }}>Product Description</th>
                <th style={{ width: "120px" }}>Code</th>
                <th style={{ width: "90px" }}>HSN</th>
                <th style={{ width: "60px" }}>QTY</th>
                <th style={{ width: "90px" }}>Unit Price</th>
                <th style={{ width: "90px" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, idx) => (
                <tr key={idx}>
                  <td style={{ textAlign: "left", paddingLeft: "14px" }}>
                    {item.name} {item.color ? `(${item.color})` : ""}
                  </td>
                  <td>{item.code || item.id || "RNALP28G19"}</td>
                  <td>84818090</td>
                  <td>{item.quantity}</td>
                  <td>{item.price}</td>
                  <td>{(item.price * item.quantity).toFixed(item.price % 1 === 0 ? 0 : 2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={5} style={{ textAlign: "right", paddingRight: "16px" }}>
                  Subtotal:
                </th>
                <td>{subtotal.toFixed(subtotal % 1 === 0 ? 0 : 2)}</td>
              </tr>
              {discountVal > 0 && (
                <tr>
                  <th colSpan={5} style={{ textAlign: "right", paddingRight: "16px" }}>
                    Discount:
                  </th>
                  <td style={{ color: "#16a34a", fontWeight: "bold" }}>- {discountVal.toFixed(2)}</td>
                </tr>
              )}
              <tr>
                <th colSpan={5} style={{ textAlign: "right", paddingRight: "16px" }}>
                  Shipping Charges:
                </th>
                <td>{shippingVal}</td>
              </tr>
              <tr>
                <th colSpan={5} style={{ textAlign: "right", paddingRight: "16px" }}>
                  Total:
                </th>
                <td style={{ fontWeight: "bold" }}>{grandTotal.toFixed(grandTotal % 1 === 0 ? 0 : 2)}</td>
              </tr>
            </tfoot>
          </table>
        </section>

        {/* Payment Information Section */}
        <section className="payment-info">
          <h2>Payment Terms:</h2>
          <p>
            Payment Method: <strong>{paymentTerm}</strong>
          </p>
        </section>
      </div>

      {/* Embedded CSS matching Laravel PDF view */}
      <style jsx global>{`
        @page {
          size: A4;
          margin: 10mm;
        }

        .invoice-page-wrapper {
          min-height: 100vh;
          background: #f8fafc;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: 'Times New Roman', Times, serif;
          color: #111827;
        }

        .invoice-action-bar {
          width: 100%;
          max-width: 800px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          font-family: 'Manrope', system-ui, sans-serif;
        }

        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          color: #374151;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .btn-back:hover {
          background: #f3f4f6;
        }

        .btn-print {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 20px;
          background: #0284c7;
          border: 1px solid #0284c7;
          border-radius: 8px;
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-print:hover {
          background: #0369a1;
        }

        .invoice-container {
          width: 100%;
          max-width: 800px;
          background: #ffffff;
          border: 1px solid #cccccc;
          border-radius: 12px;
          padding: 28px 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          box-sizing: border-box;
          font-size: 13.5px;
          line-height: 1.45;
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid transparent;
          padding-bottom: 12px;
        }

        .company-info {
          width: 58%;
        }

        .company-info h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.3px;
          color: #000000;
        }

        .company-info p {
          margin: 3px 0;
          font-size: 13px;
          color: #222222;
        }

        .company-info a {
          color: #0044cc;
          text-decoration: underline;
        }

        .invoice-info {
          width: 40%;
          text-align: right;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .logo-box {
          margin-bottom: 8px;
        }

        .invoice-info h2 {
          margin: 4px 0 2px 0;
          font-size: 22px;
          font-weight: 800;
          color: #000000;
        }

        .invoice-date {
          margin: 2px 0;
          font-size: 13px;
          color: #333333;
        }

        .customer-info {
          margin-top: 24px;
        }

        .customer-info h2,
        .order-details h2,
        .payment-info h2 {
          font-size: 18px;
          font-weight: 800;
          margin: 0 0 8px 0;
          color: #000000;
        }

        .customer-info p {
          margin: 3px 0;
          font-size: 13px;
          color: #222222;
        }

        .customer-name {
          font-weight: 600;
        }

        .order-details {
          margin-top: 24px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        th, td {
          border: 1px solid #cccccc;
          padding: 8px 10px;
          text-align: center;
          font-size: 12.5px;
        }

        th {
          background-color: #f0f0f0;
          font-weight: 800;
          color: #000000;
        }

        tfoot th {
          background-color: #f0f0f0;
          font-weight: 800;
        }

        tfoot td {
          font-weight: 800;
        }

        .payment-info {
          margin-top: 24px;
          padding-top: 6px;
        }

        .payment-info p {
          margin: 4px 0;
          font-size: 13px;
        }

        @media print {
          .no-print {
            display: none !important;
          }
          body, .invoice-page-wrapper {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .invoice-container {
            width: 100% !important;
            max-width: 100% !important;
            border: 1px solid #cccccc !important;
            border-radius: 8px !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 18px 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
