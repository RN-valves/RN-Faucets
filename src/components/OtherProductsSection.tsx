"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingBag, Check } from "lucide-react";
import { addToCart } from "@/utils/cart";

export interface OtherProductItem {
  id?: string;
  _id?: string;
  name: string;
  code?: string;
  skuCode?: string;
  article?: string;
  price?: number;
  inSelling?: number;
  originalPrice?: number;
  inMrp?: number;
  image: string;
  category?: string;
  subcategoryName?: string;
  subcategoryId?: string;
  size?: string;
  colorName?: string;
}

interface OtherProductsSectionProps {
  products: OtherProductItem[];
  categorySlug: string;
  title?: string;
}

export default function OtherProductsSection({
  products,
  categorySlug,
  title = "Other Products in this section",
}: OtherProductsSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [addedIds, setAddedIds] = useState<{ [key: string]: boolean }>({});

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const checkScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    checkScrollState();
    el.addEventListener("scroll", checkScrollState, { passive: true });
    window.addEventListener("resize", checkScrollState);
    return () => {
      el.removeEventListener("scroll", checkScrollState);
      window.removeEventListener("resize", checkScrollState);
    };
  }, [checkScrollState, products]);

  const scroll = (direction: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(".other-product-card") as HTMLElement | null;
    const cardWidth = card?.offsetWidth || 300;
    const gap = 24;
    const amount = (cardWidth + gap) * 2;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = trackRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const el = trackRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.3;
    if (Math.abs(walk) > 5) {
      hasMovedRef.current = true;
    }
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    const el = trackRef.current;
    if (!el) return;
    isDraggingRef.current = false;
    el.style.cursor = "grab";
    el.style.removeProperty("user-select");
  };

  const handleAddToCart = (e: React.MouseEvent, item: OtherProductItem) => {
    e.preventDefault();
    e.stopPropagation();

    const itemId = String(item.code || item.id || item.article || "prod");
    const sellingPrice = Number(item.inSelling ?? item.price ?? 0);

    addToCart({
      id: itemId,
      name: item.name,
      code: item.code || itemId,
      price: sellingPrice,
      image: item.image || "/api/media/website/catalogue/products/default/image.webp",
      color: item.colorName || "Standard",
      size: item.size || undefined,
      quantity: 1,
    });

    setAddedIds((prev) => ({ ...prev, [itemId]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [itemId]: false }));
    }, 2000);
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="other-products-section" aria-label="Other Products in this section">
      <div className="other-products-container">
        {/* Header with Title & Navigation Controls */}
        <div className="other-products-header">
          <div>
            <span className="other-products-subtitle">EXPLORE SIMILAR</span>
            <h3 className="other-products-title">{title}</h3>
          </div>

          <div className="other-products-nav">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="other-products-arrow-btn"
              aria-label="Previous products"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="other-products-arrow-btn"
              aria-label="Next products"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Carousel Slider Track */}
        <div
          ref={trackRef}
          className="other-products-track"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        >
          {products.map((item, idx) => {
            const itemKey = item.code || item.id || item.article || String(idx);
            const sellingPrice = Number(item.inSelling ?? item.price ?? 0);
            const mrp = Number(item.inMrp ?? item.originalPrice ?? 0);
            const hasDiscount = mrp > sellingPrice && sellingPrice > 0;
            const discountPercent = hasDiscount
              ? Math.round(((mrp - sellingPrice) / mrp) * 100)
              : 0;
            const isAdded = Boolean(addedIds[itemKey]);
            const targetUrl = `/faucets/${categorySlug}/${encodeURIComponent(item.code || item.id || itemKey)}`;

            return (
              <div key={itemKey} className="other-product-card">
                <Link
                  href={targetUrl}
                  className="other-product-card-link"
                  onClick={(e) => {
                    if (hasMovedRef.current) {
                      e.preventDefault();
                    }
                  }}
                >
                  {/* Thumbnail Image */}
                  <div className="other-product-image-wrap">
                    {hasDiscount && (
                      <span className="other-product-badge">
                        {discountPercent}% OFF
                      </span>
                    )}
                    <img
                      src={item.image || "/api/media/website/catalogue/products/default/image.webp"}
                      alt={item.name}
                      className="other-product-image"
                      loading="lazy"
                    />
                  </div>

                  {/* Card Content Info */}
                  <div className="other-product-info">
                    {/* Category & Subcategory line matching PHP */}
                    <div className="other-product-category">
                      {item.category || "RN"}
                      {item.subcategoryName ? ` | ${item.subcategoryName}` : ""}
                    </div>

                    {/* Product Name */}
                    <h4 className="other-product-name" title={item.name}>
                      {item.name}
                    </h4>

                    {/* Product Code */}
                    <div className="other-product-meta">
                      Product Code : <strong>{item.article || item.code || "—"}</strong>
                    </div>

                    {/* Product Size (if present) */}
                    {item.size && item.size.trim() !== "-" && (
                      <div className="other-product-meta">
                        Product Size : <strong>{item.size}</strong>
                      </div>
                    )}

                    {/* Price Section */}
                    <div className="other-product-price-row">
                      <span className="other-product-selling-price">
                        ₹{sellingPrice.toLocaleString("en-IN")}
                      </span>
                      {hasDiscount && (
                        <del className="other-product-mrp">
                          ₹{mrp.toLocaleString("en-IN")}
                        </del>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Add To Cart Button */}
                <div className="other-product-btn-wrap">
                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(e, item)}
                    className={`other-product-add-btn ${isAdded ? "added" : ""}`}
                    aria-label={`Add ${item.name} to cart`}
                  >
                    {isAdded ? (
                      <>
                        <Check size={16} /> Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={16} /> Add To Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .other-products-section {
          width: 100%;
          background: #FAFAFA;
          border-top: 1px solid #E5E7EB;
          padding: clamp(60px, 8vh, 85px) 0 clamp(50px, 7vh, 75px);
          overflow: hidden;
          box-sizing: border-box;
        }

        .other-products-container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 clamp(20px, 4vw, 56px);
          box-sizing: border-box;
        }

        .other-products-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .other-products-subtitle {
          display: block;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #64748B;
          margin-bottom: 4px;
        }

        .other-products-title {
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: clamp(24px, 2.5vw, 32px);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #0F172A;
          margin: 0;
          line-height: 1.2;
        }

        .other-products-nav {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .other-products-arrow-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid #D1D5DB;
          background: #FFFFFF;
          color: #0F172A;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        }

        .other-products-arrow-btn:hover:not(:disabled) {
          background: #0F172A;
          color: #FFFFFF;
          border-color: #0F172A;
          transform: translateY(-1px);
        }

        .other-products-arrow-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .other-products-track {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scroll-behavior: smooth;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 8px 4px 24px;
          cursor: grab;
          box-sizing: border-box;
        }

        .other-products-track::-webkit-scrollbar {
          display: none;
        }

        .other-product-card {
          flex: 0 0 clamp(260px, calc((100% - 72px) / 4), 320px);
          width: clamp(260px, calc((100% - 72px) / 4), 320px);
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
          box-sizing: border-box;
        }

        .other-product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.08);
          border-color: #CBD5E1;
        }

        .other-product-card-link {
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .other-product-image-wrap {
          position: relative;
          width: 100%;
          height: 240px;
          background: #F8FAFC;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
          overflow: hidden;
          border-bottom: 1px solid #F1F5F9;
        }

        .other-product-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: #059669;
          color: #FFFFFF;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 8px;
          border-radius: 4px;
          letter-spacing: 0.04em;
          z-index: 2;
        }

        .other-product-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: transform 0.35s ease;
          user-select: none;
        }

        .other-product-card:hover .other-product-image {
          transform: scale(1.06);
        }

        .other-product-info {
          padding: 16px 18px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .other-product-category {
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .other-product-name {
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 40px;
        }

        .other-product-meta {
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 12px;
          color: #64748B;
          line-height: 1.3;
        }

        .other-product-meta strong {
          color: #1E293B;
          font-weight: 700;
        }

        .other-product-price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-top: 6px;
        }

        .other-product-selling-price {
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: #0F172A;
        }

        .other-product-mrp {
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 13px;
          color: #94A3B8;
        }

        .other-product-btn-wrap {
          padding: 0 18px 16px;
        }

        .other-product-add-btn {
          width: 100%;
          height: 42px;
          border-radius: 8px;
          border: 1px solid #0F172A;
          background: #0F172A;
          color: #FFFFFF;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .other-product-add-btn:hover {
          background: #003366;
          border-color: #003366;
          transform: translateY(-1px);
        }

        .other-product-add-btn.added {
          background: #059669;
          border-color: #059669;
          color: #FFFFFF;
        }

        @media (max-width: 1024px) {
          .other-product-card {
            flex: 0 0 260px;
            width: 260px;
          }
        }

        @media (max-width: 640px) {
          .other-products-section {
            padding: 45px 0 35px;
          }
          .other-product-card {
            flex: 0 0 230px;
            width: 230px;
          }
          .other-product-image-wrap {
            height: 200px;
          }
          .other-product-name {
            font-size: 14px;
            min-height: 36px;
          }
        }
      `}</style>
    </section>
  );
}
