"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check, Clock, AlertCircle, ExternalLink } from "lucide-react";

export default function RazorpayPaymentStatusPage() {
  const params = useParams();
  const orderId = (params?.id as string) || "";
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/payment/status/${encodeURIComponent(orderId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Unable to load payment details");
        return res.json();
      })
      .then((data) => {
        setOrder(data);
      })
      .catch((err) => {
        setError(err.message || "Failed to load payment status");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orderId]);

  let parsedPayData: any = {};
  if (order?.payment_data) {
    try {
      parsedPayData =
        typeof order.payment_data === "string"
          ? JSON.parse(order.payment_data)
          : order.payment_data;
    } catch {
      parsedPayData = {};
    }
  }

  const isPaid =
    order?.paymentStatus === "Paid" ||
    String(parsedPayData.status || "").toLowerCase() === "captured" ||
    String(parsedPayData.status || "").toLowerCase() === "paid" ||
    String(parsedPayData.razorpay_payment_link_status || "").toLowerCase() === "paid";

  const paymentId =
    parsedPayData.razorpay_payment_id ||
    (typeof parsedPayData.id === "string" && parsedPayData.id.startsWith("pay_")
      ? parsedPayData.id
      : "") ||
    order?.razorpayPaymentId ||
    order?.payment_key ||
    "";

  const cleanPaymentId = paymentId.replace(/^pay_/, "");
  const referenceId =
    parsedPayData.razorpay_payment_link_reference_id ||
    parsedPayData.reference_id ||
    order?.uuid ||
    order?.razorpayOrderId ||
    order?.id ||
    orderId;

  const formattedAmount = Number(order?.totalAmount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: Number(order?.totalAmount || 0) % 1 !== 0 ? 2 : 2,
    maximumFractionDigits: 2,
  });

  const paymentMethod = parsedPayData.method ? String(parsedPayData.method).toUpperCase() : "";
  const upiVpa = parsedPayData.vpa || parsedPayData.upi?.vpa || "";
  const bankRrn = parsedPayData.acquirer_data?.rrn || "";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F6F8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {loading ? (
        <div
          style={{
            background: "#FFFFFF",
            padding: "40px 48px",
            borderRadius: "8px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            textAlign: "center",
            color: "#475569",
            fontSize: "14px",
          }}
        >
          Loading Razorpay payment status...
        </div>
      ) : error || !order ? (
        <div
          style={{
            background: "#FFFFFF",
            padding: "40px 48px",
            borderRadius: "8px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            textAlign: "center",
            color: "#DC2626",
            fontSize: "14px",
          }}
        >
          <AlertCircle size={32} style={{ margin: "0 auto 10px" }} />
          <div>{error || "Payment record not found"}</div>
        </div>
      ) : (
        <>
          {/* Center Razorpay Payment Link Layout (Matching Razorpay Hosted Payment Link UI) */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              maxWidth: "880px",
              width: "100%",
              position: "relative",
              zIndex: 2,
            }}
          >
            {/* Left White Details Card */}
            <div
              style={{
                flex: "1 1 380px",
                background: "#FFFFFF",
                borderRadius: "6px",
                boxShadow: "0 8px 28px rgba(0, 0, 0, 0.06)",
                padding: "36px 40px 28px",
                minWidth: "300px",
                boxSizing: "border-box",
              }}
            >
              <h1
                style={{
                  margin: "0 0 28px 0",
                  fontSize: "19px",
                  fontWeight: 700,
                  color: "#212529",
                  lineHeight: 1.4,
                }}
              >
                Payment Request from RN FAUCETS PRIVATE LIMITED
              </h1>

              <div style={{ marginBottom: "22px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    color: "#868E96",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  PAYMENT FOR
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#212529",
                    fontWeight: 500,
                  }}
                >
                  {referenceId} ({order.id} — {order.customerName})
                </div>
              </div>

              <div style={{ marginBottom: "28px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    color: "#868E96",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  AMOUNT PAYABLE
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#212529",
                  }}
                >
                  INR {formattedAmount}
                </div>
                <div
                  style={{
                    width: "26px",
                    height: "3px",
                    background: isPaid ? "#22C55E" : "#F59E0B",
                    marginTop: "10px",
                    borderRadius: "2px",
                  }}
                />
              </div>

              <div
                style={{
                  borderTop: "1px solid #F1F3F5",
                  paddingTop: "18px",
                  fontSize: "12px",
                  color: "#6C757D",
                  lineHeight: 1.6,
                }}
              >
                <div>
                  For any queries, please contact{" "}
                  <strong style={{ color: "#495057" }}>RN FAUCETS PRIVATE LIMITED</strong>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                  <span>✉</span>
                  <a
                    href="mailto:enquiry@rnvalves.com"
                    style={{ color: "#495057", textDecoration: "none" }}
                  >
                    enquiry@rnvalves.com
                  </a>
                </div>
              </div>
            </div>

            {/* Right Status Card (Overlapping Razorpay Receipt Card) */}
            <div
              style={{
                width: "330px",
                maxWidth: "100%",
                background: "#FFFFFF",
                borderRadius: "8px",
                boxShadow: "0 18px 42px rgba(0, 0, 0, 0.14)",
                overflow: "hidden",
                marginLeft: "-12px",
                zIndex: 3,
                flexShrink: 0,
              }}
            >
              {/* Top Maroon Brand Bar */}
              <div
                style={{
                  background: "#8B1D1D",
                  color: "#FFFFFF",
                  padding: "20px 22px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.45)",
                    background: "rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "18px",
                    flexShrink: 0,
                  }}
                >
                  R
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  RN FAUCETS PRIVATE LI...
                </div>
              </div>

              {/* White Spacer Top */}
              <div style={{ height: "54px", background: "#FFFFFF" }} />

              {/* Status Panel */}
              {isPaid ? (
                <div
                  style={{
                    background: "#ECFDF3",
                    padding: "36px 24px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "#BBF7D0",
                      color: "#16A34A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 14px",
                    }}
                  >
                    <Check size={24} strokeWidth={2.6} />
                  </div>

                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#1E293B",
                      marginBottom: "8px",
                    }}
                  >
                    Payment Completed
                  </div>

                  <div
                    style={{
                      fontSize: "12.5px",
                      color: "#64748B",
                      marginBottom: "8px",
                    }}
                  >
                    You have successfully paid INR {formattedAmount}
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748B",
                      fontWeight: 500,
                    }}
                  >
                    Payment ID: {cleanPaymentId || paymentId || "Verified"}
                  </div>

                  {(paymentMethod || upiVpa || bankRrn) && (
                    <div
                      style={{
                        marginTop: "10px",
                        paddingTop: "10px",
                        borderTop: "1px dashed rgba(22, 163, 74, 0.25)",
                        fontSize: "11.5px",
                        color: "#475569",
                        lineHeight: 1.5,
                      }}
                    >
                      {paymentMethod && <div>Method: {paymentMethod} {upiVpa ? `(${upiVpa})` : ""}</div>}
                      {bankRrn && <div>Bank RRN: {bankRrn}</div>}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    background: "#FFFBEB",
                    padding: "36px 24px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "#FDE68A",
                      color: "#D97706",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 14px",
                    }}
                  >
                    <Clock size={24} strokeWidth={2.4} />
                  </div>

                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#1E293B",
                      marginBottom: "8px",
                    }}
                  >
                    Payment Pending
                  </div>

                  <div
                    style={{
                      fontSize: "12.5px",
                      color: "#64748B",
                      marginBottom: "16px",
                    }}
                  >
                    Amount Payable: INR {formattedAmount}
                  </div>

                  {order.pay_link_url && (
                    <a
                      href={order.pay_link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "9px 20px",
                        background: "#8B1D1D",
                        color: "#FFFFFF",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      <span>Proceed to Pay</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              )}

              {/* White Spacer Bottom */}
              <div style={{ height: "54px", background: "#FFFFFF" }} />
            </div>
          </div>

          {/* Bottom Razorpay / Bank Footer Pill */}
          <div
            style={{
              marginTop: "48px",
              background: "#FFFFFF",
              borderRadius: "8px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
              padding: "10px 24px",
              display: "flex",
              alignItems: "center",
              gap: "24px",
              flexWrap: "wrap",
              justifyContent: "center",
              fontSize: "12px",
              color: "#64748B",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  background: "#991B1B",
                  color: "#FFFFFF",
                  padding: "3px 8px",
                  borderRadius: "3px",
                  fontWeight: 700,
                  fontSize: "10.5px",
                  letterSpacing: "0.03em",
                }}
              >
                IDFC FIRST Bank
              </span>
              <span style={{ fontSize: "11.5px", color: "#475569" }}>
                Powered by <strong style={{ color: "#0F172A", fontStyle: "italic" }}>Razorpay</strong>
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontWeight: 700,
                fontSize: "11.5px",
                color: "#334155",
              }}
            >
              <span>UPI</span>
              <span>VISA</span>
              <span>MasterCard</span>
              <span>RuPay</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
