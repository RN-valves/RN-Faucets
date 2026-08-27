"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";
import { addToCart } from "@/utils/cart";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ProductItem {
  id: number;
  name: string;
  price: string;
  sku: string;
  image: string;
}

const BASE_PRODUCTS: ProductItem[] = [
  {
    id: 0,
    name: "Obsidian Deck Mounted Faucet",
    price: "₹18,490",
    sku: "HW-FAU-OBS-01",
    image:
      "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2F894ffe93-b067-44c2-b45d-455047b4448b.png&w=1200&q=75",
  },
  {
    id: 1,
    name: "Rainfall Overhead Shower",
    price: "₹24,990",
    sku: "HW-SHW-RF-02",
    image:
      "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2F00fb3464-ede4-477a-a0a5-1f00cf80aac3.png&w=1200&q=75",
  },
  {
    id: 2,
    name: "Aura Wall Hung Closet",
    price: "₹32,750",
    sku: "HW-WC-AUR-03",
    image:
      "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2Fffce0ec1-9d9b-42a0-af1d-7e179eed4aa3.png&w=1200&q=75",
  },
  {
    id: 3,
    name: "Smart Kitchen Chimney",
    price: "₹28,999",
    sku: "HW-APP-CHM-04",
    image:
      "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2Fdb1b8c16-b65b-4293-bc97-c6f1b510b42d.webp&w=1200&q=75",
  },
  {
    id: 4,
    name: "Optimus iPro BLDC Cooler",
    price: "₹21,490",
    sku: "HW-CLR-OPT-05",
    image:
      "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2FWebsite-Homepage-Banners-640x990px-optimus-iPro-BLDC-Blk-1761904192697-1762151279642.webp&w=1920&q=75",
  },
  {
    id: 5,
    name: "Ceramic Counter Wash Basin",
    price: "₹12,890",
    sku: "HW-BAS-CER-06",
    image:
      "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2Fe6628fa2-ac78-4b19-a704-4b441cd6ddaa.png&w=1200&q=75",
  },
];

const DISPLAY_ITEMS: ProductItem[] = [
  ...BASE_PRODUCTS,
  ...BASE_PRODUCTS.map((c) => ({ ...c, id: c.id + 6 })),
  ...BASE_PRODUCTS.map((c) => ({ ...c, id: c.id + 12 })),
];

const CARD_BG =
  "linear-gradient(180deg, #FFFFFF 0%, #E8E8E8 35%, #9A9A9A 70%, #1A1A1A 100%)";

const STEP = 340 + 48;

function DarkProgressDot({
  isActive,
  duration = 4000,
  onComplete,
  onClick,
  label,
}: {
  isActive: boolean;
  duration?: number;
  onComplete: () => void;
  onClick: () => void;
  label: string;
}) {
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) return;

    let active = true;
    const startTime = performance.now();

    const tick = (now: number) => {
      if (!active) return;
      if (now - startTime >= duration) {
        onComplete();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      active = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isActive, duration, onComplete]);

  if (!isActive) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        style={{
          padding: 0,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          outline: "none",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "rgba(0,0,0,0.2)",
            transition: "all 0.35s ease-in-out",
          }}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        padding: 0,
        background: "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        outline: "none",
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        boxSizing: "border-box",
        border: "2px solid #111111",
      }}
    >
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#111111",
        }}
      />
    </button>
  );
}

interface BestSellerCategoriesSectionProps {
  data?: {
    visible?: boolean;
    title?: string;
    description?: string;
    products?: ProductItem[];
  };
}

export default function BestSellerCategoriesSection({ data }: BestSellerCategoriesSectionProps) {
  if (data?.visible === false) return null;

  const validProducts = data?.products?.filter((p) => Boolean(p.image));
  const productsList = validProducts && validProducts.length > 0 ? validProducts : BASE_PRODUCTS;
  const productsSequence = [
    ...productsList,
    ...productsList.map((p, i) => ({ ...p, id: (p.id || i) + productsList.length })),
    ...productsList.map((p, i) => ({ ...p, id: (p.id || i) + productsList.length * 2 })),
  ];

  const router = useRouter();
  const [virtualIndex, setVirtualIndex] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const dragDistanceRef = useRef(0);

  const isMobile = useCallback(() => {
    return typeof window !== "undefined" && window.innerWidth <= 900;
  }, []);

  const slideTo = useCallback(
    (index: number) => {
      setVirtualIndex(index);

      if (!sliderTrackRef.current || isMobile()) return;

      const xOffset = index * STEP;

      gsap.to(sliderTrackRef.current, {
        x: -xOffset,
        duration: 0.8,
        ease: "power3.out",
        onComplete: () => {
          if (index >= BASE_PRODUCTS.length * 2) {
            const resetIdx =
              (index % BASE_PRODUCTS.length) + BASE_PRODUCTS.length;
            setVirtualIndex(resetIdx);
            gsap.set(sliderTrackRef.current, { x: -(resetIdx * STEP) });
          }
        },
      });
    },
    [isMobile]
  );

  const handleNext = useCallback(() => {
    slideTo(virtualIndex + 1);
  }, [slideTo, virtualIndex]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    dragDistanceRef.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    dragDistanceRef.current = e.clientX - startXRef.current;
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (Math.abs(dragDistanceRef.current) > 40) {
      if (dragDistanceRef.current < 0) {
        slideTo(virtualIndex + 1);
      } else {
        slideTo(Math.max(0, virtualIndex - 1));
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > 20 || Math.abs(e.deltaY) > 20) {
      if (e.deltaX > 0 || e.deltaY > 0) {
        slideTo(virtualIndex + 1);
      } else {
        slideTo(Math.max(0, virtualIndex - 1));
      }
    }
  };

  useEffect(() => {
    if (
      !sectionRef.current ||
      !leftContentRef.current ||
      !sliderTrackRef.current
    )
      return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        leftContentRef.current,
        { x: -80, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );

      const validCards = cardRefs.current.slice(0, 6).filter(Boolean);
      if (validCards.length > 0) {
        gsap.fromTo(
          validCards,
          { x: 120, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.1,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const activeCategoryIdx = virtualIndex % BASE_PRODUCTS.length;

  return (
    <section
      ref={sectionRef}
      data-header-theme="light"
      className="best-seller-section"
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        padding: "110px 56px 40px",
        boxSizing: "border-box",
      }}
      aria-label="Best Seller Categories"
    >
      <style>{`
        .best-seller-card {
          transition:
            width 0.6s cubic-bezier(0.16, 1, 0.3, 1),
            height 0.6s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.5s cubic-bezier(0.215, 0.61, 0.355, 1);
        }
        .best-seller-card:hover {
          transform: scale(1.03);
        }
        .best-seller-card:hover .best-seller-image-wrap {
          transform: translateX(-50%) translateY(-10px);
        }
        .best-seller-image-wrap {
          transition:
            width 0.6s cubic-bezier(0.16, 1, 0.3, 1),
            height 0.6s cubic-bezier(0.16, 1, 0.3, 1),
            top 0.6s ease,
            transform 0.5s cubic-bezier(0.215, 0.61, 0.355, 1);
        }
        .best-seller-card:hover .best-seller-cart-btn {
          background: #111111;
          color: #FFFFFF;
        }
        .best-seller-cart-btn {
          transition: background 0.35s ease, color 0.35s ease;
        }
        @media (max-width: 1200px) {
          .best-seller-section {
            padding: 0 40px !important;
          }
          .best-seller-left {
            width: 30% !important;
            padding-right: 24px !important;
          }
          .best-seller-right {
            width: 70% !important;
          }
          .best-seller-heading {
            font-size: clamp(32px, 4.2vw, 48px) !important;
          }
          .best-seller-desc {
            font-size: clamp(15px, 1.8vw, 20px) !important;
          }
        }
        @media (max-width: 900px) {
          .best-seller-section {
            flex-direction: column !important;
            height: auto !important;
            min-height: 100vh;
            padding: 64px 24px 48px !important;
            align-items: flex-start !important;
            overflow: visible !important;
          }
          .best-seller-left {
            width: 100% !important;
            height: auto !important;
            padding-right: 0 !important;
            margin-bottom: 40px;
          }
          .best-seller-right {
            width: 100% !important;
            height: auto !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            -webkit-overflow-scrolling: touch;
            cursor: grab !important;
            scrollbar-width: none;
          }
          .best-seller-right::-webkit-scrollbar {
            display: none;
          }
          .best-seller-track {
            padding-bottom: 8px;
            transform: none !important;
          }
          .best-seller-card {
            width: 280px !important;
            height: 420px !important;
          }
          .best-seller-card.is-featured {
            width: 320px !important;
            height: 480px !important;
          }
        }
      `}</style>

      {/* ── LEFT CONTENT (28% width) ── */}
      <div
        ref={leftContentRef}
        className="best-seller-left"
        style={{
          width: "28%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          zIndex: 10,
          paddingRight: "32px",
          flexShrink: 0,
        }}
      >
        <h2
          className="best-seller-heading"
          style={{
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontWeight: 600,
            fontSize: "clamp(36px, 3.8vw, 58px)",
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            color: "#111111",
            whiteSpace: "pre-line",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          Best seller{"\n"}Categories
        </h2>

        <p
          className="best-seller-desc"
          style={{
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontSize: "clamp(16px, 1.5vw, 24px)",
            fontWeight: 400,
            color: "#666666",
            maxWidth: "320px",
            marginTop: "28px",
            lineHeight: 1.4,
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          Top-rated, best-selling products trusted and loved by our customers.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            marginTop: "44px",
          }}
          role="group"
          aria-label="Best seller category navigation indicators"
        >
          {BASE_PRODUCTS.map((cat, i) => (
            <DarkProgressDot
              key={cat.id}
              isActive={activeCategoryIdx === i}
              duration={4000}
              onComplete={handleNext}
              onClick={() => {
                const currentGroup = Math.floor(
                  virtualIndex / BASE_PRODUCTS.length
                );
                slideTo(currentGroup * BASE_PRODUCTS.length + i);
              }}
              label={`Show product ${i + 1}: ${cat.name}`}
            />
          ))}
        </div>
      </div>

      {/* ── RIGHT SIDE: Horizontal Category Cards Slider (72% width) ── */}
      <div
        className="best-seller-right"
        onMouseLeave={() => {
          isDraggingRef.current = false;
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{
          width: "72%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          position: "relative",
          cursor: isDraggingRef.current ? "grabbing" : "grab",
          userSelect: "none",
        }}
      >
        <div
          ref={sliderTrackRef}
          className="best-seller-track"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "48px",
            willChange: "transform",
          }}
        >
          {DISPLAY_ITEMS.map((product, i) => {
            const isFeatured = virtualIndex === i;
            const cardWidth = isFeatured ? 500 : 340;
            const cardHeight = isFeatured ? 660 : 520;
            const infoPad = isFeatured ? "28px 32px 32px" : "20px 22px 24px";

            return (
              <div
                key={`${product.sku}-${i}`}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                onClick={() => slideTo(i)}
                className={`best-seller-card${isFeatured ? " is-featured" : ""}`}
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  borderRadius: 0,
                  background: CARD_BG,
                  position: "relative",
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  justifyContent: "flex-end",
                  cursor: "pointer",
                  border: "none",
                  boxShadow: "none",
                  overflow: "hidden",
                }}
              >
                {/* Product Image */}
                <div
                  className="best-seller-image-wrap"
                  style={{
                    position: "absolute",
                    top: isFeatured ? "40px" : "28px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: isFeatured ? "82%" : "86%",
                    height: isFeatured ? "62%" : "58%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes={`${cardWidth}px`}
                    unoptimized
                    style={{
                      objectFit: "contain",
                      objectPosition: "center",
                      pointerEvents: "none",
                    }}
                  />
                </div>

                {/* Product info panel — name, SKU, price, Add to Cart */}
                <div
                  style={{
                    position: "relative",
                    zIndex: 2,
                    width: "100%",
                    padding: infoPad,
                    background:
                      "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.55) 28%, rgba(0,0,0,0.92) 100%)",
                    display: "flex",
                    flexDirection: "column",
                    gap: isFeatured ? "10px" : "8px",
                    boxSizing: "border-box",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: isFeatured ? "11px" : "10px",
                      fontWeight: 500,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.5)",
                      WebkitFontSmoothing: "antialiased",
                    }}
                  >
                    SKU {product.sku}
                  </span>

                  <h3
                    style={{
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: isFeatured
                        ? "clamp(20px, 1.8vw, 28px)"
                        : "clamp(16px, 1.4vw, 20px)",
                      fontWeight: 600,
                      color: "#FFFFFF",
                      lineHeight: 1.2,
                      letterSpacing: "-0.02em",
                      margin: 0,
                      WebkitFontSmoothing: "antialiased",
                      MozOsxFontSmoothing: "grayscale",
                    }}
                  >
                    {product.name}
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      marginTop: isFeatured ? "8px" : "4px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Manrope', system-ui, sans-serif",
                        fontSize: isFeatured ? "22px" : "18px",
                        fontWeight: 600,
                        color: "#FFFFFF",
                        letterSpacing: "-0.02em",
                        WebkitFontSmoothing: "antialiased",
                      }}
                    >
                      {product.price}
                    </span>

                    <button
                      type="button"
                      className="best-seller-cart-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        const numericPrice = parseFloat(product.price.replace(/[^\d]/g, ""));
                        addToCart({
                          id: `bestseller-${product.id}`,
                          name: product.name,
                          price: isNaN(numericPrice) ? 0 : numericPrice,
                          image: product.image,
                          color: "Star White",
                          quantity: 1
                        });
                        router.push("/cart");
                      }}
                      aria-label={`Add ${product.name} to cart`}
                      style={{
                        fontFamily: "'Manrope', system-ui, sans-serif",
                        fontSize: isFeatured ? "13px" : "12px",
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "#111111",
                        background: "#FFFFFF",
                        border: "none",
                        borderRadius: 0,
                        padding: isFeatured ? "14px 22px" : "12px 16px",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
