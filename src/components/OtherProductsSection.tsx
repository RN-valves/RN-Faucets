"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
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
    const card = el.querySelector(".other-product-card-wrapper") as HTMLElement | null;
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
        {/* Luxury Section Header matching RN Brand Guidelines */}
        <div className="other-products-header">
          <div>
            <span className="other-products-subtitle">EXPLORE SIMILAR DESIGNS</span>
            <h2 className="other-products-title">{title}</h2>
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
            const itemCode = item.code || item.skuCode || item.id || item.article || String(idx);
            const articleNo = item.article || item.code || item.skuCode || "";
            const sizeVal = (item.size && item.size.trim() !== "-") ? item.size.trim() : "";
            const priceVal = Number(item.inSelling ?? item.price ?? 0);
            const mrpVal = Number(item.inMrp ?? item.originalPrice ?? 0);
            const isAdded = Boolean(addedIds[itemCode]);
            const targetUrl = `/faucets/${categorySlug}/${encodeURIComponent(item.code || item.id || itemCode)}`;

            return (
              <div key={itemCode} className="other-product-card-wrapper">
                <Link
                  href={targetUrl}
                  className="product-card other-card-body group"
                  onClick={(e) => {
                    if (hasMovedRef.current) {
                      e.preventDefault();
                    }
                  }}
                >
                  {/* Category / Collection Tag */}
                  <div className="other-card-category-tag">
                    {item.category || "RN"}
                    {item.subcategoryName ? ` | ${item.subcategoryName}` : ""}
                  </div>

                  {/* Product Image on Continuous Paper Texture */}
                  <div className="product-card__image-panel other-card-img-panel">
                    <img
                      src={item.image || "/api/media/website/catalogue/products/default/image.webp"}
                      alt={item.name}
                      className="other-card-img group-hover:scale-[1.14]"
                      loading="lazy"
                    />
                  </div>

                  {/* Title & Info Block */}
                  <div className="other-card-meta-block">
                    <h3 className="other-card-name" title={item.name}>
                      {item.name}
                    </h3>

                    {/* Size & Article Number info row */}
                    {(articleNo || sizeVal) && (
                      <div className="other-card-specs-row">
                        {articleNo ? (
                          <span className="other-card-art">
                            <span className="other-card-art-label">Art:</span>
                            <span className="other-card-art-val">{articleNo}</span>
                          </span>
                        ) : (
                          <span />
                        )}

                        {sizeVal && (
                          <span className="other-card-size-badge">
                            Size: {sizeVal}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Price Row */}
                    <div className="other-card-price-row">
                      <span className="other-card-price">
                        ₹{priceVal.toLocaleString("en-IN")}/-
                      </span>
                      {mrpVal > priceVal && (
                        <del className="other-card-mrp">
                          ₹{mrpVal.toLocaleString("en-IN")}
                        </del>
                      )}
                    </div>
                  </div>

                  {/* Add To Cart Button */}
                  <div className="other-card-btn-wrap">
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, item)}
                      className={`other-card-cart-btn ${isAdded ? "added" : ""}`}
                      aria-label={`Add ${item.name} to cart`}
                    >
                      {isAdded ? (
                        <>
                          <Check size={14} /> Added to Cart
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={14} /> Add To Cart
                        </>
                      )}
                    </button>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .other-products-section {
          width: 100%;
          background: #FFFFFF;
          border-top: 1px solid #E2E8F0;
          padding: clamp(64px, 8vh, 96px) 0 clamp(48px, 6vh, 80px);
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
          margin-bottom: 36px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .other-products-subtitle {
          display: block;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #64748B;
          margin-bottom: 6px;
        }

        .other-products-title {
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: clamp(26px, 2.8vw, 36px);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #0F172A;
          margin: 0;
          line-height: 1.15;
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
          padding: 8px 4px 28px;
          cursor: grab;
          box-sizing: border-box;
        }

        .other-products-track::-webkit-scrollbar {
          display: none;
        }

        .other-product-card-wrapper {
          flex: 0 0 clamp(270px, calc((100% - 72px) / 4), 320px);
          width: clamp(270px, calc((100% - 72px) / 4), 320px);
          display: flex;
          box-sizing: border-box;
        }

        /* Continuous Luxury Paper Card matching catalog design */
        .other-card-body {
          width: 100%;
          text-decoration: none;
          padding: 22px 20px 18px;
          display: flex;
          flex-direction: column;
          min-height: 520px;
          box-sizing: border-box;
          cursor: pointer;
          position: relative;
          transition: transform 0.35s ease, box-shadow 0.35s ease;
          border: 1px solid rgba(15, 23, 42, 0.08);
        }

        .other-card-body:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(18, 42, 62, 0.12);
        }

        .other-card-category-tag {
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: #4B5563;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }

        .other-card-img-panel {
          flex: 1 1 auto;
          width: 100%;
          min-height: 250px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 10px 4px 14px;
          box-sizing: border-box;
        }

        .other-card-img {
          width: 100%;
          height: 100%;
          max-width: 94%;
          max-height: 100%;
          object-fit: contain;
          transform: scale(1.08);
          transition: transform 0.45s ease;
          user-select: none;
          filter: drop-shadow(0 14px 22px rgba(20, 36, 52, 0.14));
        }

        .other-card-meta-block {
          flex-shrink: 0;
          margin-top: 8px;
          padding: 0 2px;
        }

        .other-card-name {
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 600;
          line-height: 1.4;
          color: #1A1A1A;
          margin: 0 0 10px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 42px;
        }

        .other-card-specs-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 10px;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 11.5px;
          line-height: 1.2;
        }

        .other-card-art {
          color: #4B5563;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }

        .other-card-art-label {
          color: #8C96A3;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          fontWeight: 700;
        }

        .other-card-art-val {
          font-weight: 700;
          color: #1F2937;
        }

        .other-card-size-badge {
          color: #334155;
          font-weight: 700;
          font-size: 10.5px;
          background-color: rgba(0, 0, 0, 0.05);
          padding: 2px 7px;
          border-radius: 4px;
          white-space: nowrap;
        }

        .other-card-price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 14px;
        }

        .other-card-price {
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 20px;
          font-weight: 800;
          line-height: 1;
          color: #111111;
        }

        .other-card-mrp {
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 13px;
          color: #94A3B8;
        }

        .other-card-btn-wrap {
          margin-top: auto;
          padding-top: 4px;
        }

        .other-card-cart-btn {
          width: 100%;
          height: 42px;
          border-radius: 6px;
          border: 1px solid #111827;
          background: #111827;
          color: #FFFFFF;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .other-card-cart-btn:hover {
          background: #003366;
          border-color: #003366;
        }

        .other-card-cart-btn.added {
          background: #059669;
          border-color: #059669;
          color: #FFFFFF;
        }

        @media (max-width: 1024px) {
          .other-product-card-wrapper {
            flex: 0 0 260px;
            width: 260px;
          }
          .other-card-body {
            min-height: 480px;
            padding: 18px 14px 14px;
          }
          .other-card-img-panel {
            min-height: 200px;
          }
        }

        @media (max-width: 640px) {
          .other-products-section {
            padding: 45px 0 35px;
          }
          .other-product-card-wrapper {
            flex: 0 0 230px;
            width: 230px;
          }
          .other-card-body {
            min-height: 420px;
            padding: 14px 12px 12px;
          }
          .other-card-img-panel {
            min-height: 160px;
          }
          .other-card-name {
            font-size: 14px;
            min-height: 36px;
          }
        }
      `}</style>
    </section>
  );
}
