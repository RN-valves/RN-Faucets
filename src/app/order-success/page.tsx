"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import SupportLinksSection from "@/components/SupportLinksSection";
import { saveCartItems, type CartItem } from "@/utils/cart";
import Link from "next/link";

interface OrderInfo {
  id?: string;
  orderId?: string;
  items: CartItem[];
  total: number;
  paymentMethod?: string;
  paymentStatus?: string;
  shipping: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
    email: string;
    phone: string;
  };
}

export default function OrderSuccessPage() {
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [orderNumber, setOrderNumber] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Retrieve order details
    const stored = localStorage.getItem("last_placed_order");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setOrderInfo(parsed);
        setOrderNumber(parsed.orderId || parsed.id || `RN-ORD-${Math.floor(100000 + Math.random() * 900000)}`);
      } catch (e) {
        console.error(e);
        setOrderNumber(`RN-ORD-${Math.floor(100000 + Math.random() * 900000)}`);
      }
    } else {
      setOrderNumber(`RN-ORD-${Math.floor(100000 + Math.random() * 900000)}`);
    }

    // Clear cart items in localStorage
    saveCartItems([]);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!isMounted) {
    return null;
  }

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
          padding: "150px clamp(16px, 5vw, 80px) 80px",
          boxSizing: "border-box",
          fontFamily: "'Manrope', Helvetica, Arial, sans-serif",
          background: "#FFFFFF",
        }}
      >
        <div style={{ maxWidth: "680px", margin: "0 auto", width: "100%", textAlign: "center" }}>
          {/* Centered animated checkmark */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "#F0FDF4",
              border: "2px solid #22C55E",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "28px",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22C55E"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1
            style={{
              fontSize: "clamp(24px, 3vw, 32px)",
              fontWeight: 800,
              color: "#111111",
              margin: "0 0 12px",
            }}
          >
            Order Placed Successfully!
          </h1>

          <p
            style={{
              fontSize: "15px",
              color: "#64748B",
              lineHeight: 1.6,
              margin: "0 0 40px",
              maxWidth: "500px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Thank you for shopping with RN Valves & Faucets. Your order has been received and is being processed.
          </p>

          {/* Order Details Card */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              padding: "24px 28px",
              textAlign: "left",
              marginBottom: "36px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #E2E8F0", paddingBottom: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  ORDER NUMBER
                </span>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "#111111" }}>{orderNumber}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "right" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  ESTIMATED DELIVERY
                </span>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "#0c8f43" }}>3 - 5 Business Days</span>
              </div>
            </div>

            {orderInfo && (
              <>
                {/* Items Summary */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748B" }}>ITEMS ORDERED</span>
                  {orderInfo.items.map((item) => (
                    <div
                      key={`${item.id}-${item.color}`}
                      style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#1A202C" }}
                    >
                      <span>
                        {item.name} <span style={{ color: "#64748B" }}>({item.quantity}x)</span>
                      </span>
                      <span style={{ fontWeight: 600 }}>₹{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#111111",
                    borderTop: "1px solid #E2E8F0",
                    paddingTop: "14px",
                    marginTop: "4px",
                  }}
                >
                  <span>Total Paid</span>
                  <span>₹{formatPrice(orderInfo.total)}</span>
                </div>

                {/* Shipping Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid #E2E8F0", paddingTop: "14px", marginTop: "4px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748B" }}>DELIVERY ADDRESS</span>
                  <div style={{ fontSize: "14px", color: "#475569", lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 600, color: "#111111", marginBottom: "4px" }}>
                      {orderInfo.shipping.firstName} {orderInfo.shipping.lastName}
                    </div>
                    <div>{orderInfo.shipping.address}</div>
                    <div>
                      {orderInfo.shipping.city}, {orderInfo.shipping.state} - {orderInfo.shipping.pinCode}
                    </div>
                    <div style={{ marginTop: "6px", fontSize: "13.5px" }}>
                      Phone: {orderInfo.shipping.phone} | Email: {orderInfo.shipping.email}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <Link
            href="/"
            style={{
              display: "inline-block",
              background: "#000000",
              color: "#FFFFFF",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "14.5px",
              padding: "16px 36px",
              borderRadius: "4px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              transition: "background 0.2s",
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </section>

      <SupportLinksSection />
      <FooterSection />
    </main>
  );
}
