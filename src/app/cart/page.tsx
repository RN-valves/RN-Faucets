"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import SupportLinksSection from "@/components/SupportLinksSection";
import { getCartItems, removeFromCart, updateCartQuantity, type CartItem } from "@/utils/cart";
import { Trash2, Send, MapPin, Headset, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setCartItems(getCartItems());

    const handleCartUpdate = () => {
      setCartItems(getCartItems());
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, []);

  const handleQuantityChange = (id: string, color: string, newQty: number) => {
    if (newQty < 1) return;
    updateCartQuantity(id, color, newQty);
  };

  const handleRemove = (id: string, color: string) => {
    removeFromCart(id, color);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate totals
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (!isMounted) {
    return null; // Avoid hydration mismatch
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

      {/* Cart Content wrapper */}
      <section
        data-header-theme="light"
        style={{
          width: "100vw",
          padding: "130px clamp(16px, 5vw, 80px) 60px",
          boxSizing: "border-box",
          fontFamily: "'Manrope', Helvetica, Arial, sans-serif",
          background: "#FFFFFF",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
          {/* Breadcrumbs */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "#888888",
              marginBottom: "36px",
            }}
          >
            <Link href="/" style={{ color: "#888888", textDecoration: "none" }}>
              Home
            </Link>
            <span>&gt;</span>
            <span style={{ color: "#111111", fontWeight: 500 }}>Your Cart</span>
          </nav>

          {/* Title */}
          <h1
            style={{
              fontSize: "clamp(26px, 3.2vw, 36px)",
              fontWeight: 600,
              color: "#111111",
              margin: "0 0 40px",
            }}
          >
            My Cart ({totalQuantity})
          </h1>

          {cartItems.length === 0 ? (
            /* Empty State */
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                border: "1px dashed #E2E8F0",
                borderRadius: "12px",
                margin: "40px 0",
              }}
            >
              <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#64748B", marginBottom: "20px" }}>
                Your cart is empty
              </h2>
              <Link
                href="/"
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
                Continue Shopping
              </Link>
            </div>
          ) : (
            /* Columns Layout */
            <div className="cart-grid">
              <style>{`
                .cart-grid {
                  display: grid;
                  grid-template-columns: 1.7fr 1fr;
                  gap: 48px;
                  align-items: start;
                }
                .cart-items-list {
                  display: flex;
                  flex-direction: column;
                  gap: 32px;
                }
                .cart-item-row {
                  display: grid;
                  grid-template-columns: 140px 1fr;
                  gap: 28px;
                  padding-bottom: 32px;
                  border-bottom: 1px solid #E5E5E5;
                  align-items: start;
                }
                .cart-item-details {
                  display: flex;
                  flex-direction: column;
                  gap: 12px;
                }
                .qty-selector {
                  display: inline-flex;
                  align-items: center;
                  border: 1px solid #D0D0D0;
                  background: #FFFFFF;
                  border-radius: 6px;
                  overflow: hidden;
                  align-self: flex-start;
                  height: 38px;
                }
                .qty-btn {
                  background: #F1F5F9;
                  border: none;
                  cursor: pointer;
                  font-size: 18px;
                  font-weight: 700;
                  color: #111111;
                  width: 36px;
                  height: 38px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  transition: background 0.15s ease;
                }
                .qty-btn:hover {
                  background: #E2E8F0;
                }
                .qty-val {
                  min-width: 40px;
                  text-align: center;
                  font-size: 16px;
                  font-weight: 800;
                  color: #111111;
                  line-height: 1;
                  padding: 0 4px;
                }
                .remove-btn {
                  display: inline-flex;
                  align-items: center;
                  gap: 6px;
                  background: transparent;
                  border: none;
                  cursor: pointer;
                  color: #111111;
                  font-size: 13.5px;
                  font-weight: 600;
                  text-decoration: underline;
                  text-underline-offset: 3px;
                  padding: 0;
                  align-self: flex-start;
                  margin-top: 6px;
                }
                .summary-card {
                  background: #F8FAFC;
                  padding: 36px 32px;
                  border: 1px solid #E2E8F0;
                  display: flex;
                  flex-direction: column;
                  gap: 24px;
                }
                .summary-title {
                  font-size: 19px;
                  fontWeight: 700;
                  color: #111111;
                  margin: 0;
                }
                .summary-row {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  font-size: 14px;
                  color: #475569;
                }
                .summary-row.total {
                  font-size: 16px;
                  font-weight: 700;
                  color: #111111;
                  border-top: 1px solid #E2E8F0;
                  padding-top: 20px;
                  margin-top: 8px;
                }
                .download-btn {
                  background: transparent;
                  color: #000000;
                  border: 1px solid #000000;
                  padding: 14px;
                  font-size: 14px;
                  font-weight: 700;
                  text-align: center;
                  cursor: pointer;
                  text-transform: capitalize;
                  letter-spacing: 0.02em;
                  transition: background-color 0.2s, color 0.2s;
                }
                .download-btn:hover {
                  background: #000000;
                  color: #FFFFFF;
                }
                .checkout-btn {
                  background: #000000;
                  color: #FFFFFF;
                  border: none;
                  padding: 16px;
                  font-size: 14px;
                  font-weight: 700;
                  text-align: center;
                  cursor: pointer;
                  text-transform: capitalize;
                  letter-spacing: 0.02em;
                  transition: background-color 0.2s;
                  width: 100%;
                }
                .checkout-btn:hover {
                  background: #222222;
                }
                .action-links {
                  display: flex;
                  justify-content: space-between;
                  border-top: 1px solid #E2E8F0;
                  padding-top: 18px;
                  gap: 12px;
                }
                .action-link {
                  display: inline-flex;
                  align-items: center;
                  gap: 5px;
                  font-size: 13px;
                  font-weight: 600;
                  color: #111111;
                  text-decoration: underline;
                  text-underline-offset: 3px;
                }
                @media (max-width: 980px) {
                  .cart-grid {
                    grid-template-columns: 1fr;
                    gap: 40px;
                  }
                }
                @media (max-width: 600px) {
                  .cart-item-row {
                    grid-template-columns: 100px 1fr;
                    gap: 18px;
                  }
                  .action-links {
                    flex-direction: column;
                    gap: 14px;
                  }
                }
              `}</style>

              {/* Items List */}
              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.color}`} className="cart-item-row">
                    {/* Item Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: "100%",
                        aspectRatio: "1/1",
                        objectFit: "contain",
                        border: "1px solid #F1F5F9",
                        background: "#F8FAFC",
                      }}
                    />

                    {/* Item Details */}
                    <div className="cart-item-details">
                      <h2
                        style={{
                          fontSize: "17px",
                          fontWeight: 500,
                          color: "#111111",
                          margin: 0,
                        }}
                      >
                        {item.name}
                      </h2>

                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: 700,
                          color: "#111111",
                        }}
                      >
                        ₹{formatPrice(item.price)}/-
                      </div>

                      {/* Color & Size info */}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: "14px",
                          fontSize: "13.5px",
                          color: "#64748B",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>Color : {item.color}</span>
                          <span
                            style={{
                              width: "14px",
                              height: "14px",
                              borderRadius: "50%",
                              background: item.color.toLowerCase() === "star white" ? "#EAEAEA" : "#111111",
                              border: "1px solid #D0D0D0",
                              display: "inline-block",
                            }}
                          />
                        </div>
                        {item.size && (
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span>Size:</span>
                            <strong style={{ color: "#111111" }}>{item.size}</strong>
                          </div>
                        )}
                      </div>

                      {/* Quantity Select and Remove Row */}
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "24px", marginTop: "4px" }}>
                        <div className="qty-selector">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => handleQuantityChange(item.id, item.color, (item.quantity || 1) - 1)}
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="qty-val">{item.quantity || 1}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => handleQuantityChange(item.id, item.color, (item.quantity || 1) + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => handleRemove(item.id, item.color)}
                        >
                          <Trash2 size={15} style={{ verticalAlign: "middle" }} />
                          Remove Item
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary Column */}
              <div className="summary-card">
                <h2 className="summary-title">Order Summary ({totalQuantity} Item{totalQuantity > 1 ? "s" : ""})</h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.color}`} className="summary-row">
                      <span style={{ maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.name}
                      </span>
                      <span>₹{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}

                  <div className="summary-row total">
                    <span>Total Amount</span>
                    <span>₹{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="checkout-btn"
                  onClick={() => router.push("/checkout")}
                >
                  Proceed to Checkout
                </button>

                <div className="action-links">
                  <a href="/enquire-now" className="action-link">
                    <Send size={14} />
                    Enquire Now
                  </a>
                  <a href="/contact-us" className="action-link">
                    <Headset size={14} />
                    Support
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <SupportLinksSection />
      <FooterSection />
    </main>
  );
}
