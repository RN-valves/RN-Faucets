"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import SupportLinksSection from "@/components/SupportLinksSection";
import { getCartItems, saveCartItems, type CartItem } from "@/utils/cart";
import { getCustomerSession } from "@/utils/customerAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Pencil,
  Plus,
  Check,
  Truck,
  MapPin,
  Phone,
  Download,
  Headset,
  Tag,
  ShieldCheck,
  CreditCard,
  Banknote,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface Address {
  id: string;
  name: string;
  label: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pinCode: string;
}

const SAVED_ADDRESSES_KEY = "rn_saved_addresses";

function generateOrderId(): string {
  return `RN-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountFixedAmount, setDiscountFixedAmount] = useState(0);
  const [appliedCouponName, setAppliedCouponName] = useState("");
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online"); // online or cod

  // Address creation / edit form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [newAddr, setNewAddr] = useState({
    name: "",
    label: "HOME",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pinCode: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Dynamic delivery date states
  const [minDeliveryDate, setMinDeliveryDate] = useState("");
  const [maxDeliveryDate, setMaxDeliveryDate] = useState("");

  useEffect(() => {
    setIsMounted(true);
    const session = getCustomerSession();
    if (!session) {
      router.replace("/login-user?redirect=/checkout");
      return;
    }
    setIsAuthChecking(false);

    const items = getCartItems();
    if (items.length === 0) {
      router.push("/cart");
      return;
    }
    setCartItems(items);

    const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
    const today = new Date();

    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 4);

    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 8);

    setMinDeliveryDate(minDate.toLocaleDateString("en-GB", options));
    setMaxDeliveryDate(maxDate.toLocaleDateString("en-GB", options));

    // Load dynamic saved addresses
    let loadedAddresses: Address[] = [];
    const stored = localStorage.getItem(SAVED_ADDRESSES_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedAddresses = parsed;
        }
      } catch (err) {
        console.error("Failed to parse saved addresses:", err);
      }
    }

    if (loadedAddresses.length > 0) {
      setAddresses(loadedAddresses);
      setSelectedAddressId(loadedAddresses[0].id);
    } else {
      setAddresses([]);
      setShowAddForm(true);
      if (session) {
        setNewAddr((prev) => ({
          ...prev,
          name: session.name || "",
          phone: session.mobile || "",
        }));
      }
    }
  }, [router]);

  const handleApplyCoupon = async () => {
    if (isCouponApplied) {
      setIsCouponApplied(false);
      setCouponCode("");
      setDiscountPercent(0);
      setDiscountFixedAmount(0);
      setAppliedCouponName("");
      return;
    }

    const code = couponCode.trim().toUpperCase();
    if (!code) {
      alert("Please enter a coupon code");
      return;
    }

    setIsCheckingCoupon(true);
    try {
      const res = await fetch(`/api/discounts?q=${encodeURIComponent(code)}`);
      if (res.ok) {
        const data = await res.json();
        const found = data.discounts?.find(
          (d: any) => d.name.toUpperCase() === code && d.status === "Active"
        );

        if (found) {
          if (found.startValue && totalMRP < found.startValue) {
            alert(`Coupon ${code} requires a minimum cart value of ₹${found.startValue}`);
            setIsCheckingCoupon(false);
            return;
          }

          if (found.type === "Amount") {
            setDiscountFixedAmount(Number(found.value));
            setDiscountPercent(0);
          } else {
            setDiscountPercent(Number(found.value));
            setDiscountFixedAmount(0);
          }
          setIsCouponApplied(true);
          setAppliedCouponName(code);
          setIsCheckingCoupon(false);
          return;
        }
      }

      // Default promo code
      if (code === "RN05OFF") {
        setDiscountPercent(5);
        setDiscountFixedAmount(0);
        setIsCouponApplied(true);
        setAppliedCouponName("RN05OFF");
      } else {
        alert("Invalid or inactive coupon code.");
      }
    } catch (err) {
      console.error("Coupon verification error:", err);
      if (code === "RN05OFF") {
        setDiscountPercent(5);
        setDiscountFixedAmount(0);
        setIsCouponApplied(true);
        setAppliedCouponName("RN05OFF");
      } else {
        alert("Invalid coupon code.");
      }
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const handleEditAddress = (addr: Address) => {
    setEditingAddrId(addr.id);
    setNewAddr({
      name: addr.name,
      label: addr.label,
      phone: addr.phone,
      addressLine: addr.addressLine,
      city: addr.city,
      state: addr.state,
      pinCode: addr.pinCode,
    });
    setShowAddForm(true);
  };

  const handleAddressFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!newAddr.name.trim()) errors.name = "Name is required";
    if (!newAddr.phone.trim() || newAddr.phone.replace(/[^\d]/g, "").length < 10) {
      errors.phone = "Valid 10-digit phone is required";
    }
    if (!newAddr.addressLine.trim()) errors.addressLine = "Address is required";
    if (!newAddr.city.trim()) errors.city = "City is required";
    if (!newAddr.state.trim()) errors.state = "State is required";
    if (!newAddr.pinCode.trim() || !/^\d{6}$/.test(newAddr.pinCode.trim())) {
      errors.pinCode = "6-digit PIN code is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    let updatedList: Address[];
    if (editingAddrId) {
      // Update existing address
      updatedList = addresses.map((a) => (a.id === editingAddrId ? { ...a, ...newAddr } : a));
      setEditingAddrId(null);
    } else {
      // Create new address
      const created: Address = {
        id: `addr-${Date.now()}`,
        ...newAddr,
      };
      updatedList = [...addresses, created];
      setSelectedAddressId(created.id);
    }

    setAddresses(updatedList);
    if (typeof window !== "undefined") {
      localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(updatedList));
    }

    setShowAddForm(false);
    const session = getCustomerSession();
    setNewAddr({
      name: session?.name || "",
      label: "HOME",
      phone: session?.mobile || "",
      addressLine: "",
      city: "",
      state: "",
      pinCode: "",
    });
    setFormErrors({});
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (isProcessing) return;

    const session = getCustomerSession();
    if (!session) {
      alert("Please log in with your mobile number to place your order.");
      router.push("/login-user?redirect=/checkout");
      return;
    }

    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!selectedAddress) {
      alert("Please select or add a delivery address.");
      return;
    }

    const customerEmail = session?.email || "customer@rnvalves.com";
    const customerPhone = selectedAddress.phone || session?.mobile || "9999999999";
    const customerName = selectedAddress.name || session?.name || "Customer";

    const generatedOrderId = generateOrderId();

    const orderPayload = {
      id: generatedOrderId,
      customerName,
      customerPhone,
      customerEmail,
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        code: item.id,
        color: item.color || "Standard",
        price: item.price,
        quantity: item.quantity,
        image: item.image || "",
      })),
      totalAmount: finalTotal,
      paymentMethod: paymentMethod === "online" ? "Online Payment" : "Cash on Delivery",
      paymentStatus: paymentMethod === "online" ? "Paid" : "Pending",
      status: "Pending",
      shippingAddress: {
        firstName: selectedAddress.name,
        lastName: `(${selectedAddress.label})`,
        phone: selectedAddress.phone,
        email: customerEmail,
        address: selectedAddress.addressLine,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pinCode: selectedAddress.pinCode,
      },
      transportNotes: orderNote || "",
      orderDate: new Date().toLocaleString("en-IN", {
        dateStyle: "short",
        timeStyle: "short",
      }),
      deliveryEstimate: `${minDeliveryDate} - ${maxDeliveryDate}`,
    };

    if (paymentMethod === "online") {
      setIsProcessing(true);
      try {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          alert("Unable to load Razorpay payment gateway. Please check your internet connection.");
          setIsProcessing(false);
          return;
        }

        const res = await fetch("/api/payment/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: finalTotal,
            receipt: generatedOrderId,
            notes: {
              customer_name: customerName,
              customer_phone: customerPhone,
              order_id: generatedOrderId,
            },
          }),
        });

        const orderData = await res.json();
        if (!res.ok) {
          throw new Error(orderData.error || "Failed to initialize Razorpay payment");
        }

        const options = {
          key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_suYcAnCphr9CQ8",
          amount: orderData.amount,
          currency: orderData.currency || "INR",
          name: "RN Valves & Faucets",
          description: `Order ${generatedOrderId} - ${cartItems.length} item(s)`,
          image: "/images/logo.png",
          order_id: orderData.orderId,
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch("/api/payment/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderData: {
                    ...orderPayload,
                    id: generatedOrderId,
                  },
                }),
              });

              const verifyResult = await verifyRes.json();
              if (verifyRes.ok && verifyResult.success) {
                localStorage.setItem(
                  "last_placed_order",
                  JSON.stringify({
                    items: cartItems,
                    total: finalTotal,
                    paymentMethod: "Online Payment",
                    paymentStatus: "Paid",
                    orderId: generatedOrderId,
                    paymentId: response.razorpay_payment_id,
                    orderNote,
                    shipping: orderPayload.shippingAddress,
                  })
                );
                saveCartItems([]);
                router.push("/order-success");
              } else {
                alert(verifyResult.error || "Payment verification failed. Please contact support.");
              }
            } catch (err: any) {
              console.error("Payment verification error:", err);
              alert("Payment verification error: " + (err.message || "Please contact support"));
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: customerName,
            contact: customerPhone,
            email: customerEmail,
          },
          notes: {
            address: `${selectedAddress.addressLine}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pinCode}`,
            account_bank: "IDFC FIRST Bank",
          },
          theme: {
            color: "#dc2626",
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          alert(`Payment failed: ${response.error?.description || "Transaction declined"}`);
          setIsProcessing(false);
        });
        rzp.open();
      } catch (error: any) {
        console.error("Online payment error:", error);
        alert(error.message || "Failed to start payment. Please try again or choose Cash on Delivery.");
        setIsProcessing(false);
      }
    } else {
      // Cash on Delivery Flow
      setIsProcessing(true);
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to place COD order");
        }

        localStorage.setItem(
          "last_placed_order",
          JSON.stringify({
            items: cartItems,
            total: finalTotal,
            paymentMethod: "Cash on Delivery",
            paymentStatus: "Pending",
            orderId: generatedOrderId,
            orderNote,
            shipping: orderPayload.shippingAddress,
          })
        );

        saveCartItems([]);
        router.push("/order-success");
      } catch (err: any) {
        console.error("COD order error:", err);
        alert(err.message || "Failed to place order. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Pricing calculations
  const totalMRP = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const calculatedDiscount =
    discountFixedAmount > 0
      ? discountFixedAmount
      : discountPercent > 0
      ? Math.round(totalMRP * (discountPercent / 100))
      : 0;
  const discountAmount = isCouponApplied ? calculatedDiscount : 0;
  const finalTotal = Math.max(0, totalMRP - discountAmount);
  const progressToDiscount = Math.max(0, 1500 - totalMRP);

  if (!isMounted || isAuthChecking) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#64748b", fontSize: "14px", fontFamily: "sans-serif" }}>
          <Loader2 className="animate-spin" size={20} />
          Verifying account & loading checkout...
        </div>
      </main>
    );
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

      {/* Global & Responsive Checkout Styles */}
      <style jsx global>{`
        .checkout-page-section {
          width: 100vw;
          padding: 130px clamp(16px, 5vw, 80px) 70px;
          box-sizing: border-box;
          font-family: 'Manrope', system-ui, -apple-system, sans-serif;
          background-color: #ffffff;
        }
        @media (max-width: 768px) {
          .checkout-page-section {
            padding: 100px 16px 50px;
          }
        }

        .checkout-main-grid {
          display: grid;
          grid-template-columns: 1.65fr 1fr;
          gap: 40px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .checkout-main-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }

        .checkout-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .checkout-card-header {
          padding: 16px 22px;
          font-size: 13px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #fafafa;
        }

        .address-item-card {
          padding: 20px 22px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          gap: 16px;
          align-items: flex-start;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }
        .address-item-card:hover {
          background-color: #f8fafc;
        }
        .address-item-card.selected {
          background-color: #f8fafc;
        }

        .custom-radio-circle {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        .custom-radio-circle.active {
          border-color: #111111;
          background-color: #111111;
        }
        .custom-radio-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #ffffff;
        }

        .checkout-input-field {
          width: 100%;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 13.5px;
          outline: none;
          background-color: #ffffff;
          color: #111111;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          box-sizing: border-box;
        }
        .checkout-input-field:focus {
          border-color: #111111;
          box-shadow: 0 0 0 1px #111111;
        }
        .checkout-input-field.error {
          border-color: #ef4444;
        }

        .checkout-btn-primary {
          background-color: #111111;
          color: #ffffff;
          border: none;
          padding: 14px 28px;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.02em;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.1s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
        }
        .checkout-btn-primary:hover {
          background-color: #262626;
        }
        .checkout-btn-primary:active {
          transform: scale(0.99);
        }

        .payment-method-card {
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.2s ease;
          background-color: #ffffff;
        }
        .payment-method-card:hover {
          border-color: #94a3b8;
        }
        .payment-method-card.active {
          border-color: #111111;
          background-color: #f8fafc;
        }
      `}</style>

      <section data-header-theme="light" className="checkout-page-section">
        <div style={{ maxWidth: "1320px", margin: "0 auto", width: "100%" }}>
          {/* Breadcrumbs */}
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
            <Link href="/cart" style={{ color: "#888888", textDecoration: "none" }}>
              Your Cart
            </Link>
            <span>&gt;</span>
            <span style={{ color: "#111111", fontWeight: 600 }}>Checkout</span>
          </nav>

          {/* Page Title */}
          <div style={{ marginBottom: "36px" }}>
            <h1
              style={{
                fontSize: "clamp(26px, 3.2vw, 36px)",
                fontWeight: 600,
                color: "#111111",
                margin: "0 0 6px 0",
                letterSpacing: "-0.02em",
              }}
            >
              Secure Checkout
            </h1>
            <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
              Review your delivery details and choose a payment method to complete your order.
            </p>
          </div>

          <div className="checkout-main-grid">
            {/* ════════ LEFT COLUMN: Addresses & Order Items ════════ */}
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {/* ── 1. Delivery Address Card ── */}
              <div className="checkout-card">
                <div className="checkout-card-header">
                  <span>Delivery Address</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddrId(null);
                      setNewAddr({
                        name: "",
                        label: "HOME",
                        phone: "",
                        addressLine: "",
                        city: "",
                        state: "",
                        pinCode: "",
                      });
                      setShowAddForm(!showAddForm);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#111111",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      textTransform: "none",
                      letterSpacing: "normal",
                    }}
                  >
                    <Plus size={15} />
                    <span>{showAddForm ? "Close Form" : "Add Address"}</span>
                  </button>
                </div>

                {/* Add / Edit Address Form */}
                {showAddForm && (
                  <form
                    onSubmit={handleAddressFormSubmit}
                    style={{
                      padding: "24px",
                      backgroundColor: "#fafafa",
                      borderBottom: "1px solid #e5e7eb",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#111111" }}>
                      {editingAddrId ? "Edit Delivery Address" : "Add New Delivery Address"}
                    </h4>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "4px" }}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={newAddr.name}
                          onChange={(e) => setNewAddr((prev) => ({ ...prev, name: e.target.value }))}
                          className={`checkout-input-field ${formErrors.name ? "error" : ""}`}
                          placeholder="e.g. John Doe"
                        />
                        {formErrors.name && <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "2px", display: "block" }}>{formErrors.name}</span>}
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "4px" }}>
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={newAddr.phone}
                          onChange={(e) => setNewAddr((prev) => ({ ...prev, phone: e.target.value }))}
                          className={`checkout-input-field ${formErrors.phone ? "error" : ""}`}
                          placeholder="10-digit mobile"
                        />
                        {formErrors.phone && <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "2px", display: "block" }}>{formErrors.phone}</span>}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "4px" }}>
                        Street Address / Flat / Building *
                      </label>
                      <input
                        type="text"
                        value={newAddr.addressLine}
                        onChange={(e) => setNewAddr((prev) => ({ ...prev, addressLine: e.target.value }))}
                        className={`checkout-input-field ${formErrors.addressLine ? "error" : ""}`}
                        placeholder="House / Flat no, Street, Landmark"
                      />
                      {formErrors.addressLine && <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "2px", display: "block" }}>{formErrors.addressLine}</span>}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "4px" }}>
                          City *
                        </label>
                        <input
                          type="text"
                          value={newAddr.city}
                          onChange={(e) => setNewAddr((prev) => ({ ...prev, city: e.target.value }))}
                          className={`checkout-input-field ${formErrors.city ? "error" : ""}`}
                          placeholder="City"
                        />
                        {formErrors.city && <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "2px", display: "block" }}>{formErrors.city}</span>}
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "4px" }}>
                          State *
                        </label>
                        <input
                          type="text"
                          value={newAddr.state}
                          onChange={(e) => setNewAddr((prev) => ({ ...prev, state: e.target.value }))}
                          className={`checkout-input-field ${formErrors.state ? "error" : ""}`}
                          placeholder="State"
                        />
                        {formErrors.state && <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "2px", display: "block" }}>{formErrors.state}</span>}
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "4px" }}>
                          PIN Code *
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={newAddr.pinCode}
                          onChange={(e) => setNewAddr((prev) => ({ ...prev, pinCode: e.target.value }))}
                          className={`checkout-input-field ${formErrors.pinCode ? "error" : ""}`}
                          placeholder="6-digit PIN"
                        />
                        {formErrors.pinCode && <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "2px", display: "block" }}>{formErrors.pinCode}</span>}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginTop: "6px" }}>
                      <button
                        type="submit"
                        style={{
                          backgroundColor: "#111111",
                          color: "#ffffff",
                          border: "none",
                          padding: "10px 22px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {editingAddrId ? "Save Changes" : "Save Address"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false);
                          setEditingAddrId(null);
                          setFormErrors({});
                        }}
                        style={{
                          backgroundColor: "transparent",
                          color: "#475569",
                          border: "1px solid #d1d5db",
                          padding: "10px 18px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Addresses List */}
                <div>
                  {addresses.length === 0 && !showAddForm && (
                    <div style={{ textAlign: "center", padding: "28px 16px", color: "#64748b" }}>
                      <MapPin size={28} style={{ margin: "0 auto 8px", color: "#94a3b8" }} />
                      <p style={{ margin: "0 0 6px", fontSize: "13.5px", fontWeight: 700, color: "#1e293b" }}>
                        No delivery address saved yet
                      </p>
                      <p style={{ margin: "0 0 14px", fontSize: "12.5px" }}>
                        Please add a delivery address to complete your order.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(true)}
                        className="checkout-btn-secondary"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                      >
                        <Plus size={14} />
                        <span>Add New Address</span>
                      </button>
                    </div>
                  )}

                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`address-item-card ${isSelected ? "selected" : ""}`}
                      >
                        <div className={`custom-radio-circle ${isSelected ? "active" : ""}`}>
                          {isSelected && <div className="custom-radio-dot" />}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "4px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>
                                {addr.name}
                              </span>
                              <span
                                style={{
                                  backgroundColor: "#1e293b",
                                  color: "#ffffff",
                                  fontSize: "10.5px",
                                  fontWeight: 700,
                                  padding: "2px 7px",
                                  borderRadius: "4px",
                                  letterSpacing: "0.03em",
                                }}
                              >
                                {addr.label}
                              </span>
                              <span style={{ fontSize: "13px", fontWeight: 500, color: "#64748b" }}>
                                {addr.phone}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAddress(addr);
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#0284c7",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: 0,
                              }}
                            >
                              <Pencil size={12} />
                              <span>Edit</span>
                            </button>
                          </div>

                          <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: 1.5 }}>
                            {addr.addressLine}, {addr.city}, {addr.state} —{" "}
                            <strong style={{ color: "#111111", fontWeight: 600 }}>{addr.pinCode}</strong>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── 2. Estimated Delivery & Order Items Preview ── */}
              <div className="checkout-card">
                <div className="checkout-card-header">
                  <span>Estimated Delivery</span>
                </div>

                {/* Delivery Estimate Bar */}
                <div
                  style={{
                    padding: "14px 22px",
                    backgroundColor: "#f8fafc",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    color: "#334155",
                    fontWeight: 500,
                  }}
                >
                  <Truck size={16} style={{ color: "#059669" }} />
                  <span>
                    Expected Delivery: By{" "}
                    <strong style={{ color: "#059669", fontWeight: 700 }}>{minDeliveryDate}</strong> –{" "}
                    <strong style={{ color: "#059669", fontWeight: 700 }}>{maxDeliveryDate}</strong>
                  </span>
                </div>

                {/* Products List in Cart */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {cartItems.map((item, idx) => (
                    <div
                      key={`${item.id}-${item.color}-${idx}`}
                      style={{
                        padding: "18px 22px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                        borderBottom: idx === cartItems.length - 1 ? "none" : "1px solid #f1f5f9",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
                        <div
                          style={{
                            width: "68px",
                            height: "68px",
                            borderRadius: "8px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            flexShrink: 0,
                            padding: "4px",
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image || "/api/media/website/catalogue/products/default/image.webp"}
                            alt={item.name}
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          />
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <h4
                            style={{
                              margin: "0 0 4px 0",
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#111111",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.name}
                          </h4>

                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", fontSize: "11.5px", color: "#64748b" }}>
                            {item.size && <span>Size: <strong style={{ color: "#334155" }}>{item.size}</strong></span>}
                            {item.color && item.color !== "Standard" && (
                              <span>Color: <strong style={{ color: "#334155" }}>{item.color}</strong></span>
                            )}
                            <span>Qty: <strong style={{ color: "#334155" }}>{item.quantity}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#111111", flexShrink: 0 }}>
                        ₹{formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ════════ RIGHT COLUMN: Coupon, Notes, Summary & Payment ════════ */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Order Note */}
              <div className="checkout-card" style={{ padding: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>
                  Order Notes (Optional)
                </label>
                <textarea
                  placeholder="Any special instructions for packaging or delivery..."
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  style={{
                    width: "100%",
                    height: "64px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    padding: "10px",
                    fontSize: "13px",
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    color: "#111111",
                    outline: "none",
                    resize: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Promo Banner */}
              {progressToDiscount > 0 ? (
                <div
                  style={{
                    backgroundColor: "#fef3c7",
                    border: "1px solid #fde68a",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#92400e",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Tag size={15} />
                  <span>Add products worth ₹{formatPrice(progressToDiscount)} more to unlock 10% OFF!</span>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#065f46",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Check size={15} />
                  <span>🎉 You have unlocked a 10% discount on your order!</span>
                </div>
              )}

              {/* Coupon Code Input Box */}
              <div className="checkout-card" style={{ padding: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>
                  Have a Coupon Code?
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="e.g. RN05OFF"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={isCouponApplied}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: "13px",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      fontWeight: 600,
                      outline: "none",
                      backgroundColor: isCouponApplied ? "#f1f5f9" : "#ffffff",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    style={{
                      backgroundColor: isCouponApplied ? "#ef4444" : "#111111",
                      color: "#ffffff",
                      border: "none",
                      padding: "10px 18px",
                      borderRadius: "6px",
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    {isCouponApplied ? "REMOVE" : "APPLY"}
                  </button>
                </div>
              </div>

              {/* Price Summary & Payment Selection */}
              <div className="checkout-card" style={{ padding: "20px" }}>
                <h3
                  style={{
                    margin: "0 0 16px 0",
                    fontSize: "13px",
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    color: "#0f172a",
                    textTransform: "uppercase",
                    borderBottom: "1px solid #f1f5f9",
                    paddingBottom: "12px",
                  }}
                >
                  Price Summary
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13.5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                    <span>Total MRP (Inc. of Taxes)</span>
                    <span style={{ fontWeight: 600, color: "#111111" }}>₹{formatPrice(totalMRP)}.00</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                    <span>Shipping Fee</span>
                    <span style={{ fontWeight: 700, color: "#059669" }}>FREE</span>
                  </div>

                  {discountAmount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#059669" }}>
                      <span>Coupon Discount</span>
                      <span style={{ fontWeight: 700 }}>- ₹{formatPrice(discountAmount)}.00</span>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderTop: "1px solid #e2e8f0",
                      paddingTop: "12px",
                      marginTop: "6px",
                      fontSize: "16px",
                      fontWeight: 800,
                      color: "#111111",
                    }}
                  >
                    <span>Sub Total</span>
                    <span>₹{formatPrice(finalTotal)}.00</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>
                    Select Payment Method
                  </span>

                  <div
                    onClick={() => setPaymentMethod("online")}
                    className={`payment-method-card ${paymentMethod === "online" ? "active" : ""}`}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className={`custom-radio-circle ${paymentMethod === "online" ? "active" : ""}`}>
                        {paymentMethod === "online" && <div className="custom-radio-dot" />}
                      </div>
                      <div>
                        <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#111111" }}>
                          Online Payment
                        </span>
                        <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>
                          UPI, Credit/Debit Cards, NetBanking
                        </p>
                      </div>
                    </div>
                    <CreditCard size={18} style={{ color: "#64748b" }} />
                  </div>

                  <div
                    onClick={() => setPaymentMethod("cod")}
                    className={`payment-method-card ${paymentMethod === "cod" ? "active" : ""}`}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className={`custom-radio-circle ${paymentMethod === "cod" ? "active" : ""}`}>
                        {paymentMethod === "cod" && <div className="custom-radio-dot" />}
                      </div>
                      <div>
                        <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#111111" }}>
                          Cash on Delivery
                        </span>
                        <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>
                          Pay via cash or UPI upon delivery
                        </p>
                      </div>
                    </div>
                    <Banknote size={18} style={{ color: "#64748b" }} />
                  </div>
                </div>

                {/* Place Order CTA Button */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handlePlaceOrder}
                  className="checkout-btn-primary"
                  style={{
                    marginTop: "24px",
                    opacity: isProcessing ? 0.75 : 1,
                    cursor: isProcessing ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>PROCESSING {paymentMethod === "online" ? "PAYMENT" : "ORDER"}...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>
                        {paymentMethod === "online" ? "PROCEED TO PAY" : "PLACE ORDER"} (₹{formatPrice(finalTotal)})
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Luxury Bottom Support / Dealer Strip */}
      <div
        style={{
          width: "100%",
          backgroundColor: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          borderBottom: "1px solid #e2e8f0",
          padding: "24px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-around",
            alignItems: "center",
            gap: "20px",
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontSize: "13px",
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          <a href="#" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "inherit" }}>
            <MapPin size={17} style={{ color: "#0284c7" }} />
            <span>Dealer Locator</span>
          </a>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "inherit" }}>
            <Phone size={17} style={{ color: "#0284c7" }} />
            <span>Talk to an Expert</span>
          </a>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "inherit" }}>
            <Download size={17} style={{ color: "#0284c7" }} />
            <span>Download Catalogue</span>
          </a>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "inherit" }}>
            <Headset size={17} style={{ color: "#0284c7" }} />
            <span>Customer Service Request</span>
          </a>
        </div>
      </div>

      <SupportLinksSection />
      <FooterSection />
    </main>
  );
}
