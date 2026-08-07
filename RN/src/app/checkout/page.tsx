"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import SupportLinksSection from "@/components/SupportLinksSection";
import { getCartItems, type CartItem } from "@/utils/cart";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Plus, Check, Truck, MapPin, Phone, Download, Headset } from "lucide-react";

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

const DEFAULT_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    name: "Test.",
    label: "HOME",
    phone: "7845124575",
    addressLine: "Mandi, MANDI, Himachal Pradesh",
    city: "MANDI",
    state: "Himachal Pradesh",
    pinCode: "175020"
  },
  {
    id: "addr-2",
    name: "Test.",
    label: "HOME",
    phone: "8545152645",
    addressLine: "Mandi, MANDI, Himachal Pradesh",
    city: "MANDI",
    state: "Himachal Pradesh",
    pinCode: "175020"
  },
  {
    id: "addr-3",
    name: "test abc.",
    label: "HOME",
    phone: "8888888888",
    addressLine: "3224 & 3227, Hakim Baka Street, near Chaumukha Mandir, Chawri Chawri Bazar, Old Delhi",
    city: "Old Delhi",
    state: "PUNE, Maharashtra",
    pinCode: "411060"
  }
];

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>(DEFAULT_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState("addr-1");
  const [orderNote, setOrderNote] = useState("");
  const [couponCode, setCouponCode] = useState("RN05OFF");
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online"); // online or cod

  // Address creation form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: "",
    label: "HOME",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pinCode: ""
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Dynamic delivery date states
  const [minDeliveryDate, setMinDeliveryDate] = useState("");
  const [maxDeliveryDate, setMaxDeliveryDate] = useState("");

  useEffect(() => {
    setIsMounted(true);
    const items = getCartItems();
    if (items.length === 0) {
      router.push("/cart");
    }
    setCartItems(items);

    // Compute dynamic delivery dates (Min: +4 days, Max: +8 days)
    const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
    const today = new Date();
    
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 4);
    
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 8);

    setMinDeliveryDate(minDate.toLocaleDateString("en-GB", options));
    setMaxDeliveryDate(maxDate.toLocaleDateString("en-GB", options));
  }, [router]);

  const handleApplyCoupon = () => {
    if (isCouponApplied) {
      setIsCouponApplied(false);
      setCouponCode("");
    } else {
      if (couponCode.trim().toUpperCase() === "RN05OFF") {
        setIsCouponApplied(true);
      } else {
        alert("Invalid coupon code. Try RN05OFF");
      }
    }
  };

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!newAddr.name.trim()) errors.name = "Name is required";
    if (!newAddr.phone.trim() || newAddr.phone.replace(/[^\d]/g, "").length < 10) {
      errors.phone = "Valid phone is required";
    }
    if (!newAddr.addressLine.trim()) errors.addressLine = "Address is required";
    if (!newAddr.city.trim()) errors.city = "City is required";
    if (!newAddr.state.trim()) errors.state = "State is required";
    if (!newAddr.pinCode.trim() || !/^\d{6}$/.test(newAddr.pinCode.trim())) {
      errors.pinCode = "6-digit pincode is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const created: Address = {
      id: `addr-${Date.now()}`,
      ...newAddr
    };

    setAddresses((prev) => [...prev, created]);
    setSelectedAddressId(created.id);
    setShowAddForm(false);
    setNewAddr({
      name: "",
      label: "HOME",
      phone: "",
      addressLine: "",
      city: "",
      state: "",
      pinCode: ""
    });
    setFormErrors({});
  };

  const handlePlaceOrder = () => {
    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!selectedAddress) {
      alert("Please select or add a delivery address.");
      return;
    }

    localStorage.setItem("last_placed_order", JSON.stringify({
      items: cartItems,
      total: finalTotal,
      shipping: {
        firstName: selectedAddress.name,
        lastName: `(${selectedAddress.label})`,
        address: selectedAddress.addressLine,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pinCode: selectedAddress.pinCode,
        phone: selectedAddress.phone,
        email: "registered-user@hindware.com"
      }
    }));

    router.push("/order-success");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Pricing calculations
  const totalMRP = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = isCouponApplied ? Math.round(totalMRP * 0.05) : 0;
  const finalTotal = totalMRP - discountAmount;
  const progressToDiscount = Math.max(0, 1500 - totalMRP);

  if (!isMounted) {
    return null;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#F4F5F7",
        overflowX: "hidden",
      }}
    >
      <Header />

      <section
        data-header-theme="light"
        style={{
          width: "100vw",
          padding: "120px clamp(16px, 4vw, 60px) 40px",
          boxSizing: "border-box",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#F4F5F7",
        }}
      >
        <div style={{ maxWidth: "1340px", margin: "0 auto", width: "100%" }}>
          
          <div className="checkout-container">
            <style>{`
              .checkout-container {
                display: grid;
                grid-template-columns: 1.75fr 1fr;
                gap: 36px;
                align-items: start;
              }
              .left-pane {
                display: flex;
                flex-direction: column;
                gap: 28px;
              }
              .section-card {
                border: 1px solid #E2E8F0;
                background: #FFFFFF;
                border-radius: 4px;
                overflow: hidden;
              }
              .section-header {
                background: #F7F7F7;
                padding: 14px 20px;
                font-size: 13px;
                font-weight: 700;
                color: #2D3748;
                text-transform: uppercase;
                letter-spacing: 0.04em;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #E2E8F0;
              }
              .address-list {
                display: flex;
                flex-direction: column;
              }
              .address-card {
                padding: 24px 24px 0 24px;
                border-bottom: 1px solid #E2E8F0;
                display: grid;
                grid-template-columns: 36px 1fr;
                align-items: start;
                cursor: pointer;
                background: #FFFFFF;
                transition: background-color 0.2s;
              }
              .address-card:hover {
                background: #FAFBFD;
              }
              .address-radio {
                margin-top: 5px;
                width: 18px;
                height: 18px;
                accent-color: #00AEEF;
              }
              .address-details {
                display: flex;
                flex-direction: column;
                gap: 6px;
              }
              .address-title-row {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 14px;
                font-weight: 700;
                color: #2D3748;
              }
              .address-tag {
                background: #EAF7FF;
                color: #00AEEF;
                font-size: 11px;
                font-weight: 700;
                padding: 2px 8px;
                border-radius: 3px;
              }
              .address-text {
                font-size: 13.5px;
                color: #4A5568;
                line-height: 1.5;
                margin-bottom: 16px;
              }
              .address-edit-panel {
                grid-column: 1 / span 2;
                border-top: 1px solid #E2E8F0;
                padding: 10px;
                text-align: center;
                font-size: 12px;
                font-weight: 600;
                color: #718096;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                background: #FDFDFD;
                cursor: pointer;
                transition: background-color 0.2s, color 0.2s;
              }
              .address-edit-panel:hover {
                background: #F7F7F7;
                color: #000000;
              }
              .add-address-btn {
                background: transparent;
                border: none;
                padding: 18px 24px;
                font-size: 13.5px;
                font-weight: 700;
                color: #2D3748;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                text-align: left;
                width: 100%;
                transition: background-color 0.2s;
              }
              .add-address-btn:hover {
                background: #FAFBFD;
              }
              .delivery-estimate-bar {
                background: #FFFFFF;
                padding: 16px 20px;
                font-size: 13px;
                font-weight: 600;
                color: #4A5568;
                border-bottom: 1px solid #E2E8F0;
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
              }
              .delivery-estimate-bar span.date-accent {
                color: #05B851;
                font-weight: 700;
              }
              .checkout-product-card {
                padding: 24px 20px;
                display: grid;
                grid-template-columns: 1fr 100px;
                gap: 20px;
                align-items: center;
                border-bottom: 1px solid #E2E8F0;
                background: #FFFFFF;
              }
              .checkout-product-card:last-child {
                border-bottom: none;
              }
              .checkout-product-info {
                display: flex;
                flex-direction: column;
                gap: 6px;
              }
              .checkout-product-title {
                font-size: 14.5px;
                font-weight: 600;
                color: #1A202C;
                line-height: 1.4;
                margin: 0;
              }
              .checkout-product-price {
                font-size: 15px;
                font-weight: 700;
                color: #111111;
              }
              .checkout-product-badges {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                margin-top: 4px;
              }
              .checkout-badge {
                border: 1px solid #E2E8F0;
                background: #FFFFFF;
                font-size: 11.5px;
                font-weight: 600;
                color: #4A5568;
                padding: 4px 10px;
                border-radius: 4px;
              }
              .checkout-product-image {
                width: 80px;
                height: 80px;
                object-fit: contain;
                border: 1px solid #E2E8F0;
                padding: 4px;
                background: #FFFFFF;
                justify-self: end;
              }
              
              /* Address creation form */
              .address-form {
                padding: 24px;
                background: #FCFCFD;
                border-top: 1px solid #E2E8F0;
                display: flex;
                flex-direction: column;
                gap: 16px;
              }
              .address-form-title {
                font-size: 15px;
                font-weight: 700;
                color: #2D3748;
                margin: 0 0 4px;
              }
              .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
              }
              .form-group {
                display: flex;
                flex-direction: column;
                gap: 6px;
              }
              .form-label {
                font-size: 12px;
                font-weight: 700;
                color: #4A5568;
              }
              .form-input {
                border: 1px solid #D1D5DB;
                border-radius: 4px;
                padding: 10px 12px;
                font-size: 13.5px;
                outline: none;
                background: #FFFFFF;
                font-family: inherit;
              }
              .form-input:focus {
                border-color: #00AEEF;
              }
              .form-input.error {
                border-color: #EF4444;
              }
              .form-error {
                font-size: 11.5px;
                color: #EF4444;
              }
              .form-submit-row {
                display: flex;
                gap: 12px;
                margin-top: 8px;
              }
              .form-btn-submit {
                background: #00AEEF;
                color: #FFFFFF;
                border: none;
                padding: 10px 24px;
                font-weight: 700;
                border-radius: 4px;
                cursor: pointer;
                font-size: 13.5px;
              }
              .form-btn-cancel {
                background: transparent;
                border: 1px solid #CCCCCC;
                color: #4A5568;
                padding: 10px 20px;
                font-weight: 600;
                border-radius: 4px;
                cursor: pointer;
                font-size: 13.5px;
              }

              /* Sidebar elements */
              .sidebar-pane {
                display: flex;
                flex-direction: column;
                gap: 20px;
              }
              .note-textarea {
                width: 100%;
                height: 76px;
                border: 1px solid #E2E8F0;
                background: #FFFFFF;
                border-radius: 4px;
                padding: 12px;
                font-size: 13.5px;
                outline: none;
                resize: none;
                font-family: inherit;
                color: #2D3748;
              }
              .note-textarea::placeholder {
                color: #A0AEC0;
              }
              
              /* Promo boxes */
              .promo-bar-1 {
                background: #A31F24;
                color: #FFFFFF;
                font-size: 13px;
                font-weight: 700;
                padding: 14px 18px;
                border-radius: 4px;
                text-align: center;
                line-height: 1.4;
              }
              .promo-bar-2 {
                background: #D1E7DD;
                color: #0F5132;
                font-size: 13px;
                font-weight: 700;
                padding: 14px 18px;
                border-radius: 4px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .promo-bar-3 {
                background: #00AEEF;
                color: #FFFFFF;
                font-size: 13.5px;
                font-weight: 700;
                padding: 12px 18px;
                border-radius: 4px;
                text-align: center;
              }
              .promo-badge-yellow {
                background: #FFD43B;
                color: #1A202C;
                font-size: 11px;
                font-weight: 800;
                padding: 3px 8px;
                border-radius: 2px;
                letter-spacing: 0.05em;
              }
              .coupon-apply-box {
                border: 1px solid #E2E8F0;
                background: #FFFFFF;
                border-radius: 4px;
                display: flex;
                overflow: hidden;
              }
              .coupon-input {
                flex: 1;
                border: none;
                padding: 14px 16px;
                font-size: 14px;
                font-weight: 700;
                outline: none;
                color: #2D3748;
                text-transform: uppercase;
              }
              .coupon-apply-btn {
                background: #00AEEF;
                color: #FFFFFF;
                border: none;
                padding: 0 24px;
                font-size: 13.5px;
                font-weight: 800;
                cursor: pointer;
                transition: background-color 0.2s;
              }
              .coupon-apply-btn:hover {
                background: #009CD6;
              }
              .coupon-apply-btn.applied {
                background: #EF4444;
              }
              .coupon-apply-btn.applied:hover {
                background: #DC2626;
              }

              /* Price summary card */
              .price-summary-card {
                border: 1px solid #E2E8F0;
                border-radius: 4px;
                padding: 24px;
                background: #FFFFFF;
                display: flex;
                flex-direction: column;
                gap: 16px;
              }
              .summary-row {
                display: flex;
                justify-content: space-between;
                font-size: 13.5px;
                color: #4A5568;
              }
              .summary-row.total {
                border-top: 1px solid #E2E8F0;
                padding-top: 16px;
                font-size: 15px;
                font-weight: 700;
                color: #1A202C;
              }
              .discount-text {
                color: #05B851;
                font-weight: 600;
              }
              
              /* Payment choices */
              .payment-choices {
                display: flex;
                flex-direction: column;
                gap: 10px;
                border-top: 1px solid #E2E8F0;
                padding-top: 16px;
              }
              .payment-choice-label {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 13.5px;
                font-weight: 700;
                color: #2D3748;
                cursor: pointer;
              }
              .payment-choice-radio {
                accent-color: #000000;
                width: 16px;
                height: 16px;
              }
              .payment-icons {
                display: flex;
                gap: 4px;
                align-items: center;
                margin-left: auto;
              }
              .payment-icon-img {
                height: 16px;
                width: auto;
              }

              /* Free shipping box */
              .free-shipping-box {
                background: #D1E7DD;
                color: #0F5132;
                font-size: 13px;
                font-weight: 700;
                padding: 12px 16px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                gap: 8px;
              }

              /* Bottom sticky bar for price & place order */
              .order-submit-panel {
                border: 1px solid #EAEAEA;
                border-radius: 4px;
                padding: 20px;
                background: #FFFFFF;
                display: grid;
                grid-template-columns: 1fr auto;
                align-items: center;
                gap: 16px;
              }
              .order-total-label {
                display: flex;
                flex-direction: column;
                gap: 4px;
              }
              .order-total-price {
                font-size: 20px;
                font-weight: 800;
                color: #1A202C;
              }
              .order-total-lbl {
                font-size: 12px;
                font-weight: 600;
                color: #718096;
              }
              .place-order-btn {
                background: #05B851;
                color: #FFFFFF;
                border: none;
                padding: 16px 48px;
                font-size: 14.5px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.2s;
              }
              .place-order-btn:hover {
                background: #049F44;
              }

              @media (max-width: 980px) {
                .checkout-container {
                  grid-template-columns: 1fr;
                  gap: 32px;
                }
              }
              @media (max-width: 600px) {
                .form-row {
                  grid-template-columns: 1fr;
                }
                .order-submit-panel {
                  grid-template-columns: 1fr;
                  text-align: center;
                }
                .place-order-btn {
                  width: 100%;
                }
              }
            `}</style>

            {/* Left Column: Delivery Address & Shipment */}
            <div className="left-pane">
              
              {/* Delivery Address Card */}
              <div className="section-card">
                <div className="section-header">
                  <span>Delivery Address</span>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #CCCCCC",
                      borderRadius: "4px",
                      padding: "5px 10px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#4A5568",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      cursor: "pointer"
                    }}
                  >
                    <Plus size={11} /> ADD ADDRESS
                  </button>
                </div>

                <div className="address-list">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="address-card"
                      onClick={() => setSelectedAddressId(addr.id)}
                    >
                      <input
                        type="radio"
                        name="delivery_address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="address-radio"
                      />
                      <div className="address-details">
                        <div className="address-title-row">
                          <span>{addr.name}</span>
                          <span className="address-tag">{addr.label}</span>
                          <span style={{ fontSize: "14px", fontWeight: 700 }}>{addr.phone}</span>
                        </div>
                        <div className="address-text">
                          {addr.addressLine}, {addr.city}, {addr.state} Pincode - {addr.pinCode}
                        </div>
                      </div>
                      
                      <div className="address-edit-panel">
                        <Pencil size={11} />
                        <span>EDIT</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new Address Trigger */}
                {!showAddForm && (
                  <button type="button" className="add-address-btn" onClick={() => setShowAddForm(true)}>
                    <Plus size={16} />
                    <span>ADD NEW ADDRESS</span>
                  </button>
                )}

                {/* Inline Address Creation Form */}
                {showAddForm && (
                  <form onSubmit={handleAddAddressSubmit} className="address-form">
                    <h3 className="address-form-title">Create Address</h3>
                    
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        value={newAddr.name}
                        onChange={(e) => setNewAddr((prev) => ({ ...prev, name: e.target.value }))}
                        className={`form-input ${formErrors.name ? "error" : ""}`}
                        placeholder="John Doe"
                      />
                      {formErrors.name && <span className="form-error">{formErrors.name}</span>}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Mobile Number</label>
                        <input
                          type="tel"
                          value={newAddr.phone}
                          onChange={(e) => setNewAddr((prev) => ({ ...prev, phone: e.target.value }))}
                          className={`form-input ${formErrors.phone ? "error" : ""}`}
                          placeholder="10-digit phone"
                        />
                        {formErrors.phone && <span className="form-error">{formErrors.phone}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Address Tag</label>
                        <input
                          type="text"
                          value={newAddr.label}
                          onChange={(e) => setNewAddr((prev) => ({ ...prev, label: e.target.value.toUpperCase() }))}
                          className="form-input"
                          placeholder="HOME, OFFICE, etc."
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Street Address / Locality</label>
                      <input
                        type="text"
                        value={newAddr.addressLine}
                        onChange={(e) => setNewAddr((prev) => ({ ...prev, addressLine: e.target.value }))}
                        className={`form-input ${formErrors.addressLine ? "error" : ""}`}
                        placeholder="House no, Building, Area"
                      />
                      {formErrors.addressLine && <span className="form-error">{formErrors.addressLine}</span>}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          value={newAddr.city}
                          onChange={(e) => setNewAddr((prev) => ({ ...prev, city: e.target.value }))}
                          className={`form-input ${formErrors.city ? "error" : ""}`}
                        />
                        {formErrors.city && <span className="form-error">{formErrors.city}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">State</label>
                        <input
                          type="text"
                          value={newAddr.state}
                          onChange={(e) => setNewAddr((prev) => ({ ...prev, state: e.target.value }))}
                          className={`form-input ${formErrors.state ? "error" : ""}`}
                        />
                        {formErrors.state && <span className="form-error">{formErrors.state}</span>}
                      </div>
                    </div>

                    <div className="form-group" style={{ maxWidth: "50%" }}>
                      <label className="form-label">Pin Code</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={newAddr.pinCode}
                        onChange={(e) => setNewAddr((prev) => ({ ...prev, pinCode: e.target.value }))}
                        className={`form-input ${formErrors.pinCode ? "error" : ""}`}
                        placeholder="6-digit PIN"
                      />
                      {formErrors.pinCode && <span className="form-error">{formErrors.pinCode}</span>}
                    </div>

                    <div className="form-submit-row">
                      <button type="submit" className="form-btn-submit">
                        Save Address
                      </button>
                      <button
                        type="button"
                        className="form-btn-cancel"
                        onClick={() => {
                          setShowAddForm(false);
                          setFormErrors({});
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Estimated Delivery Section */}
              <div className="section-card">
                <div className="section-header">
                  <span>Estimated Delivery</span>
                </div>
                
                <div className="delivery-estimate-bar">
                  <span>Shipment : By Min - </span>
                  <span className="date-accent">{minDeliveryDate}</span>
                  <span> Max - </span>
                  <span className="date-accent">{maxDeliveryDate}</span>
                </div>

                <div className="checkout-products-list">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.color}`} className="checkout-product-card">
                      
                      <div className="checkout-product-info">
                        <h3 className="checkout-product-title">{item.name}</h3>
                        <div className="checkout-product-price">
                          ₹{formatPrice(item.price)}
                        </div>
                        <div className="checkout-product-badges">
                          <span className="checkout-badge">Size: 20mm(3/4&quot;)</span>
                          <span className="checkout-badge">Qty: {item.quantity}</span>
                        </div>
                      </div>

                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="checkout-product-image" />
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Order Summary, Note, Coupon, Prices */}
            <div className="sidebar-pane">
              
              {/* Note input */}
              <textarea
                placeholder="Note (Opt.)"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                className="note-textarea"
              />

              {/* Promo Bars */}
              {progressToDiscount > 0 ? (
                <div className="promo-bar-1">
                  Add products worth ₹ {formatPrice(progressToDiscount)} more to unlock a discount of 10%!
                </div>
              ) : (
                <div className="promo-bar-1" style={{ background: "#05B851" }}>
                  🎉 You have unlocked a 10% discount on your order!
                </div>
              )}

              <div className="promo-bar-2">
                <span>You are eligible 5 % OFF</span>
                <span className="promo-badge-yellow">RN05OFF</span>
              </div>

              <div className="promo-bar-3">
                Get Discount with using coupon code!
              </div>

              {/* Coupon Box */}
              <div className="coupon-apply-box">
                <input
                  type="text"
                  placeholder="Enter Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="coupon-input"
                  disabled={isCouponApplied}
                />
                <button
                  type="button"
                  className={`coupon-apply-btn ${isCouponApplied ? "applied" : ""}`}
                  onClick={handleApplyCoupon}
                >
                  {isCouponApplied ? "REMOVE" : "APPLY"}
                </button>
              </div>

              {/* Price Summary Panel */}
              <div className="price-summary-card">
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#1A202C", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px" }}>
                  PRICE SUMMARY
                </div>

                <div className="summary-row">
                  <span>Total MRP (Inc. of Taxes)</span>
                  <span>₹{formatPrice(totalMRP)}.00</span>
                </div>

                <div className="summary-row">
                  <span>Shipping Fee</span>
                  <span>₹0.00</span>
                </div>

                <div className="summary-row">
                  <span>Cart Discount</span>
                  <span className="discount-text">- ₹{formatPrice(discountAmount)}.00</span>
                </div>

                <div className="summary-row total">
                  <span>Sub Total</span>
                  <span>₹{formatPrice(finalTotal)}.00</span>
                </div>

                {/* Payment choices */}
                <div className="payment-choices">
                  <label className="payment-choice-label">
                    <input
                      type="radio"
                      name="payment_choice"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                      className="payment-choice-radio"
                    />
                    <span>Online Pay</span>
                    <div className="payment-icons">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://hindware.com/images/payment-icons.png" alt="cards" className="payment-icon-img" onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }} />
                    </div>
                  </label>

                  <label className="payment-choice-label">
                    <input
                      type="radio"
                      name="payment_choice"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="payment-choice-radio"
                    />
                    <span>Cash On Delivery</span>
                    <Truck size={14} style={{ color: "#718096" }} />
                  </label>
                </div>
              </div>

              {/* Free shipping message banner */}
              <div className="free-shipping-box">
                <Check size={14} />
                <span>Congratulations! You&apos;ve unlocked FREE shipping!</span>
              </div>

              {/* Sticky total / submit block */}
              <div className="order-submit-panel">
                <div className="order-total-label">
                  <span className="order-total-lbl">Total Amount</span>
                  <span className="order-total-price">₹{formatPrice(finalTotal)}.00</span>
                </div>
                <button
                  type="button"
                  className="place-order-btn"
                  onClick={handlePlaceOrder}
                >
                  PLACE ORDER
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Yellow Bottom sticky/info strip */}
      <div
        style={{
          width: "100%",
          background: "#FFFBEB",
          borderTop: "1px solid #FEF3C7",
          borderBottom: "1px solid #FEF3C7",
          padding: "20px 24px",
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
            fontFamily: "system-ui, sans-serif",
            fontSize: "14px",
            fontWeight: 700,
            color: "#1E293B",
          }}
        >
          <a href="#" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "inherit" }}>
            <MapPin size={18} style={{ color: "#D97706" }} />
            <span>Dealer Locator</span>
          </a>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "inherit" }}>
            <Phone size={18} style={{ color: "#D97706" }} />
            <span>Talk to an Expert</span>
          </a>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "inherit" }}>
            <Download size={18} style={{ color: "#D97706" }} />
            <span>Download Catalogue</span>
          </a>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "inherit" }}>
            <Headset size={18} style={{ color: "#D97706" }} />
            <span>Customer Service Request</span>
          </a>
        </div>
      </div>

      <SupportLinksSection />
      <FooterSection />
    </main>
  );
}
