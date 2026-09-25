"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";
import { addToCart } from "@/utils/cart";
import { ChevronLeft, ChevronRight } from "lucide-react";


if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ProductItem {
  id: number;
  name: string;
  price: string;
  sku: string;
  image: string;
  category?: string;
}

const CARD_BG =
  "linear-gradient(180deg, #FFFFFF 0%, #E8E8E8 35%, #9A9A9A 70%, #1A1A1A 100%)";

const STEP = 340 + 48;

const ACTIVE_RING_SIZE = 38;
const INACTIVE_RING_SIZE = 10;
const SVG_VP = ACTIVE_RING_SIZE;
const OUTER_R = 17;          // hollow outer ring track radius
const ARC_R = 12;            // thin animated progress arc radius
const ARC_STROKE = 1.6;
const CIRCUMFERENCE = 2 * Math.PI * ARC_R;

function DarkProgressDot({
  isActive,
  isPaused = false,
  duration = 4500,
  onComplete,
  onClick,
  label,
}: {
  isActive: boolean;
  isPaused?: boolean;
  duration?: number;
  onComplete: () => void;
  onClick: () => void;
  label: string;
}) {
  const circleRef = useRef<SVGCircleElement>(null);
  const rafRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!isActive) {
      elapsedRef.current = 0;
      lastTimeRef.current = null;
      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = String(CIRCUMFERENCE);
      }
      return;
    }

    let active = true;
    lastTimeRef.current = performance.now();

    const updateProgress = (now: number) => {
      if (!active) return;
      if (lastTimeRef.current !== null && !isPaused) {
        elapsedRef.current += now - lastTimeRef.current;
      }
      lastTimeRef.current = now;

      const p = Math.min(elapsedRef.current / duration, 1);
      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = String(
          CIRCUMFERENCE * (1 - p)
        );
      }
      if (p < 1) {
        rafRef.current = requestAnimationFrame(updateProgress);
      } else {
        elapsedRef.current = 0;
        onCompleteRef.current();
      }
    };

    rafRef.current = requestAnimationFrame(updateProgress);

    return () => {
      active = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isActive, isPaused, duration]);

  if (!isActive) {
    /* ── Inactive: sleek hollow dark ring matching homepage style ── */
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        style={{
          width: INACTIVE_RING_SIZE,
          height: INACTIVE_RING_SIZE,
          borderRadius: "50%",
          background: "transparent",
          border: "1.5px solid rgba(0,0,0,0.32)",
          flexShrink: 0,
          padding: 0,
          margin: 0,
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          opacity: 0.65,
          outline: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.borderColor = "rgba(0,0,0,0.7)";
          e.currentTarget.style.transform = "scale(1.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "0.65";
          e.currentTarget.style.borderColor = "rgba(0,0,0,0.32)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      />
    );
  }

  /* ── Active: outer hollow ring + inner animated arc matching homepage hero ── */
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        width: ACTIVE_RING_SIZE,
        height: ACTIVE_RING_SIZE,
        borderRadius: "50%",
        flexShrink: 0,
        padding: 0,
        margin: 0,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        outline: "none",
        position: "relative",
      }}
    >
      <svg
        width={ACTIVE_RING_SIZE}
        height={ACTIVE_RING_SIZE}
        viewBox={`0 0 ${SVG_VP} ${SVG_VP}`}
        style={{ transform: "rotate(-90deg)", display: "block" }}
        aria-hidden="true"
      >
        {/* Hollow outer dark track */}
        <circle
          cx={SVG_VP / 2}
          cy={SVG_VP / 2}
          r={OUTER_R}
          fill="none"
          stroke="rgba(0, 0, 0, 0.16)"
          strokeWidth={1.5}
        />
        {/* Thin dark progress arc inside outer ring */}
        <circle
          ref={circleRef}
          cx={SVG_VP / 2}
          cy={SVG_VP / 2}
          r={ARC_R}
          fill="none"
          stroke="#111111"
          strokeWidth={ARC_STROKE}
          strokeLinecap="butt"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
          style={{ willChange: "stroke-dashoffset" }}
        />
      </svg>
    </button>
  );
}

interface BestSellerCategoriesSectionProps {
  data?: {
    visible?: boolean;
    title?: string;
    description?: string;
    collectionId?: string;
    collectionName?: string;
    products?: any[];
  };
  initialProducts?: any[];
  initialCategories?: any[];
}

function processCategoryProducts(
  items: any[],
  catData: any[],
  collectionId?: string,
  collectionName?: string
): ProductItem[] {
  if (!Array.isArray(items)) return [];
  const active = items.filter(
    (p: any) =>
      p.status !== "Inactive" &&
      p.isVisibleWebsite !== false &&
      p.isVisible !== false
  );

  // If a specific collection is selected by admin, filter for that collection first
  if (collectionId && collectionId !== "all") {
    const targetCat = Array.isArray(catData)
      ? catData.find(
          (c) =>
            String(c.id) === String(collectionId) ||
            String(c._id) === String(collectionId) ||
            c.slug === collectionId
        )
      : null;
    const catName = targetCat?.name || collectionName || "";

    const collectionProducts = active.filter((p: any) => {
      const matchId = p.categoryId && String(p.categoryId) === String(collectionId);
      const matchName =
        catName &&
        p.category &&
        p.category.toLowerCase().trim() === catName.toLowerCase().trim();
      return matchId || matchName;
    });

    if (collectionProducts.length > 0) {
      return collectionProducts.slice(0, 12).map((p: any, idx: number) => {
        const priceNum = Number(p.inSelling ?? p.price ?? 0);
        const formattedPrice =
          priceNum > 0 ? `₹${priceNum.toLocaleString("en-IN")}` : "₹1,490";
        const sku = p.skuCode || p.code || p.article || `RN-${p.id || idx}`;
        const rawImage =
          p.image ||
          (Array.isArray(p.gallery) && p.gallery[0]) ||
          "/api/media/website/catalogue/products/default/image.webp";
        return {
          id: idx,
          name: p.name,
          category: catName || p.category || "Best Seller",
          price: formattedPrice,
          sku: sku,
          image: rawImage,
        };
      });
    }
  }

  const priority = [
    "cp faucet",
    "faucet",
    "shower",
    "spray",
    "health",
    "mixer",
    "diverter",
    "polymer",
    "ptmt",
    "valve",
    "cistern",
    "accessori",
  ];

  const getCategoryScore = (name: string) => {
    const lower = (name || "").toLowerCase();
    for (let i = 0; i < priority.length; i++) {
      if (lower.includes(priority[i])) return i;
    }
    return 99;
  };

  const seenCategories = new Set<string>();
  const uniqueCategoryProducts: any[] = [];

  if (Array.isArray(catData) && catData.length > 0) {
    for (const cat of catData) {
      const catName = cat.name || cat.title || "";
      const catId = cat.id || cat._id || "";
      const matching = active.filter(
        (p: any) =>
          (p.category && p.category.toLowerCase().trim() === catName.toLowerCase().trim()) ||
          (p.categoryId && String(p.categoryId) === String(catId))
      );

      if (matching.length > 0) {
        const randomProd = matching[Math.floor(Math.random() * matching.length)];
        if (!uniqueCategoryProducts.some((x: any) => x.id === randomProd.id || x._id === randomProd._id)) {
          uniqueCategoryProducts.push({
            ...randomProd,
            categoryDisplay: catName,
          });
          if (randomProd.category) seenCategories.add(randomProd.category.toLowerCase().trim());
          seenCategories.add(catName.toLowerCase().trim());
        }
      }
    }
  }

  for (const p of active) {
    const catKey = (p.category || "Other").toLowerCase().trim();
    if (!seenCategories.has(catKey)) {
      const matching = active.filter(
        (item: any) => (item.category || "Other").toLowerCase().trim() === catKey
      );
      const randomProd = matching[Math.floor(Math.random() * matching.length)];
      seenCategories.add(catKey);
      if (!uniqueCategoryProducts.some((x: any) => x.id === randomProd.id || x._id === randomProd._id)) {
        uniqueCategoryProducts.push({
          ...randomProd,
          categoryDisplay: p.category || "Bath Fittings",
        });
      }
    }
  }

  for (let i = uniqueCategoryProducts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uniqueCategoryProducts[i], uniqueCategoryProducts[j]] = [
      uniqueCategoryProducts[j],
      uniqueCategoryProducts[i],
    ];
  }

  const finalProducts =
    uniqueCategoryProducts.length >= 6
      ? uniqueCategoryProducts
      : active.slice(0, 12);

  return finalProducts.slice(0, 12).map((p: any, idx: number) => {
    const priceNum = Number(p.inSelling ?? p.price ?? 0);
    const formattedPrice = priceNum > 0 ? `₹${priceNum.toLocaleString("en-IN")}` : "₹1,490";
    const sku = p.skuCode || p.code || p.article || `RN-${p.id || idx}`;
    const rawImage =
      p.image || (Array.isArray(p.gallery) && p.gallery[0]) || "/api/media/website/catalogue/products/default/image.webp";
    const image =
      rawImage && !rawImage.includes("postimg") && !rawImage.includes("postimage")
        ? rawImage
        : "/api/media/website/catalogue/products/default/image.webp";
    return {
      id: idx,
      name: p.name,
      category: p.categoryDisplay || p.category || "Bath Fittings",
      price: formattedPrice,
      sku: sku,
      image: image,
    };
  });
}

export default function BestSellerCategoriesSection({
  data,
  initialProducts = [],
  initialCategories = [],
}: BestSellerCategoriesSectionProps) {
  const [dbProducts, setDbProducts] = useState<ProductItem[]>(() =>
    initialProducts && initialProducts.length > 0
      ? processCategoryProducts(initialProducts, initialCategories, data?.collectionId, data?.collectionName)
      : []
  );
  const [isLoaded, setIsLoaded] = useState(() => Boolean(initialProducts && initialProducts.length > 0));

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setDbProducts(processCategoryProducts(initialProducts, initialCategories, data?.collectionId, data?.collectionName));
      setIsLoaded(true);
      return;
    }
    Promise.all([
      fetch("/api/products").then((res) => res.json()),
      fetch("/api/categories").then((res) => res.json()).catch(() => []),
    ])
      .then(([resData, catData]) => {
        const items = resData.products || resData;
        setDbProducts(processCategoryProducts(items, catData, data?.collectionId, data?.collectionName));
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to load products for BestSellerCategoriesSection:", err);
        setIsLoaded(true);
      });
  }, [initialProducts, initialCategories, data?.collectionId, data?.collectionName]);

  const validPropsProducts: ProductItem[] = Array.isArray(data?.products)
    ? data.products
        .filter((p: any) => Boolean(p.image && p.name))
        .map((p: any, idx: number) => ({
          id: idx,
          name: p.name,
          category: p.category || (p as any).categoryDisplay || "Best Seller",
          price:
            typeof p.price === "number"
              ? `₹${p.price.toLocaleString("en-IN")}`
              : String(p.price || "₹1,490"),
          sku: p.sku || p.skuCode || p.code || p.article || `RN-${idx}`,
          image: p.image,
        }))
    : [];

  const productsList =
    data?.collectionId && data.collectionId !== "all"
      ? dbProducts.length > 0
        ? dbProducts
        : validPropsProducts
      : validPropsProducts.length > 0
      ? validPropsProducts
      : dbProducts.length > 0
      ? dbProducts
      : [];

  const productsSequence = productsList.length > 0 ? [
    ...productsList,
    ...productsList.map((p, i) => ({ ...p, id: (p.id || i) + productsList.length })),
    ...productsList.map((p, i) => ({ ...p, id: (p.id || i) + productsList.length * 2 })),
  ] : [];

  const sectionTitle =
    data?.title &&
    data.title !== "New Arrivals" &&
    data.title !== "New\nArrivals" &&
    data.title !== "Best seller\nCategories" &&
    data.title !== "Best seller Categories"
      ? data.title
      : "Best\nSeller";

  const sectionDesc =
    data?.description &&
    data.description !==
      "Discover our latest precision-engineered designs and innovative bath fittings."
      ? data.description
      : "Top-rated, best-selling products trusted and loved by our customers.";

  const router = useRouter();
  const [virtualIndex, setVirtualIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const rightContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startTrackXRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const lastWheelTimeRef = useRef(0);

  const isMobile = useCallback(() => {
    return typeof window !== "undefined" && window.innerWidth <= 900;
  }, []);

  const slideTo = useCallback(
    (index: number) => {
      const targetIndex = Math.max(0, index);
      setVirtualIndex(targetIndex);

      if (isMobile()) {
        const cardEl = cardRefs.current[targetIndex % (productsList.length || 1)];
        if (cardEl && rightContainerRef.current) {
          const scrollTarget = cardEl.offsetLeft - (window.innerWidth < 640 ? 16 : 24);
          rightContainerRef.current.scrollTo({
            left: Math.max(0, scrollTarget),
            behavior: "smooth",
          });
        }
        return;
      }

      if (!sliderTrackRef.current) return;

      const xOffset = targetIndex * STEP;

      gsap.to(sliderTrackRef.current, {
        x: -xOffset,
        duration: 0.75,
        ease: "power3.out",
        overwrite: "auto",
        onComplete: () => {
          if (targetIndex >= productsList.length * 2) {
            const resetIdx =
              (targetIndex % productsList.length) + productsList.length;
            setVirtualIndex(resetIdx);
            gsap.set(sliderTrackRef.current, { x: -(resetIdx * STEP) });
          }
        },
      });
    },
    [isMobile, productsList.length]
  );

  const handleNext = useCallback(() => {
    slideTo(virtualIndex + 1);
  }, [slideTo, virtualIndex]);

  const handlePrev = useCallback(() => {
    slideTo(Math.max(0, virtualIndex - 1));
  }, [slideTo, virtualIndex]);

  const handleMobileScroll = () => {
    if (!isMobile() || !rightContainerRef.current || productsList.length === 0) return;
    const scrollLeft = rightContainerRef.current.scrollLeft;
    const cardWidth = 285; // approx mobile card width + gap
    const activeIdx = Math.round(scrollLeft / cardWidth) % productsList.length;
    if (activeIdx >= 0 && activeIdx < productsList.length) {
      setVirtualIndex(activeIdx);
    }
  };

  // ── Drag & Touch Handlers with real-time responsive tracking on desktop ──
  const handlePointerDown = (clientX: number) => {
    if (isMobile()) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = clientX;
    dragDistanceRef.current = 0;
    startTrackXRef.current = -(virtualIndex * STEP);
  };

  const handlePointerMove = (clientX: number) => {
    if (!isDraggingRef.current || !sliderTrackRef.current || isMobile()) return;
    const dx = clientX - startXRef.current;
    dragDistanceRef.current = dx;
    // Live spring translation during drag
    gsap.set(sliderTrackRef.current, { x: startTrackXRef.current + dx });
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current || isMobile()) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    const threshold = 45;
    if (dragDistanceRef.current < -threshold) {
      slideTo(virtualIndex + 1);
    } else if (dragDistanceRef.current > threshold) {
      slideTo(Math.max(0, virtualIndex - 1));
    } else {
      // Snap back smoothly
      slideTo(virtualIndex);
    }
  };

  // ── Horizontal wheel gesture only (Never locks vertical page scroll) ──
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 25) {
      const now = Date.now();
      if (now - lastWheelTimeRef.current < 350) return;
      lastWheelTimeRef.current = now;

      if (e.deltaX > 0) {
        handleNext();
      } else {
        handlePrev();
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

  const activeCategoryIdx = virtualIndex % (productsList.length || 1);

  if (data?.visible === false) return null;
  if (isLoaded && productsList.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      data-header-theme="light"
      className="best-seller-section"
      onMouseLeave={handlePointerUp}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        background: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        padding: "110px 56px 40px",
        boxSizing: "border-box",
      }}
      aria-label="Best Sellers"
    >
      <style>{`
        .best-seller-card {
          transition:
            width 0.6s cubic-bezier(0.16, 1, 0.3, 1),
            height 0.6s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.5s cubic-bezier(0.215, 0.61, 0.355, 1);
        }
        .best-seller-card:hover {
          transform: translateY(-6px);
        }
        .best-seller-card:hover .best-seller-image-wrap {
          transform: translateX(-50%) translateY(-8px) scale(1.03);
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

        .best-seller-nav-arrow {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #ffffff;
          border: 1.5px solid rgba(0,0,0,0.12);
          padding: 0;
          margin: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #111111;
          cursor: pointer;
          outline: none;
          box-sizing: border-box;
          box-shadow: 0 4px 14px rgba(0,0,0,0.06);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .best-seller-nav-arrow:hover {
          background: #111111;
          color: #ffffff;
          border-color: #111111;
          transform: scale(1.06);
          box-shadow: 0 6px 18px rgba(0,0,0,0.15);
        }
        .best-seller-nav-arrow:active {
          transform: scale(0.96);
        }

        @media (max-width: 1200px) {
          .best-seller-section {
            padding: 100px 36px 40px !important;
          }
          .best-seller-left {
            width: 32% !important;
            padding-right: 24px !important;
          }
          .best-seller-right {
            width: 68% !important;
          }
          .best-seller-heading {
            font-size: clamp(32px, 4.2vw, 48px) !important;
          }
          .best-seller-desc {
            font-size: clamp(15px, 1.8vw, 18px) !important;
          }
        }
        @media (max-width: 900px) {
          .best-seller-section {
            flex-direction: column !important;
            height: auto !important;
            min-height: auto !important;
            padding: 96px 20px 48px !important;
            align-items: flex-start !important;
            overflow: visible !important;
          }
          .best-seller-left {
            width: 100% !important;
            height: auto !important;
            padding-right: 0 !important;
            margin-bottom: 28px !important;
          }
          .best-seller-heading {
            font-size: clamp(30px, 7vw, 42px) !important;
          }
          .best-seller-desc {
            font-size: 15px !important;
            margin-top: 14px !important;
            max-width: 100% !important;
          }
          .best-seller-right {
            width: 100% !important;
            height: auto !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            scroll-snap-type: x mandatory;
            padding: 8px 4px 20px !important;
          }
          .best-seller-right::-webkit-scrollbar {
            display: none;
          }
          .best-seller-track {
            padding-bottom: 8px;
            transform: none !important;
            gap: 18px !important;
          }
          .best-seller-card {
            width: 275px !important;
            height: 420px !important;
            scroll-snap-align: start;
          }
          .best-seller-card.is-featured {
            width: 275px !important;
            height: 420px !important;
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
          {sectionTitle}
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
          {sectionDesc}
        </p>

        {/* Indicators + Arrow Navigation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: "320px",
            marginTop: "44px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            role="group"
            aria-label="Best sellers navigation indicators"
          >
            {productsList.map((cat, i) => (
              <DarkProgressDot
                key={cat.id || i}
                isActive={activeCategoryIdx === i}
                isPaused={isDragging}
                duration={4500}
                onComplete={handleNext}
                onClick={() => {
                  const currentGroup = Math.floor(
                    virtualIndex / productsList.length
                  );
                  slideTo(currentGroup * productsList.length + i);
                }}
                label={`Show product ${i + 1}: ${cat.name}`}
              />
            ))}
          </div>

          {/* Prev / Next Smooth Arrow Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={handlePrev}
              className="best-seller-nav-arrow"
              aria-label="Previous Product"
            >
              <ChevronLeft size={20} strokeWidth={1.8} style={{ display: "block", marginLeft: "-1px" }} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="best-seller-nav-arrow"
              aria-label="Next Product"
            >
              <ChevronRight size={20} strokeWidth={1.8} style={{ display: "block", marginRight: "-1px" }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDE: Horizontal Category Cards Slider (72% width) ── */}
      <div
        ref={rightContainerRef}
        className="best-seller-right"
        onScroll={handleMobileScroll}
        onMouseDown={(e) => handlePointerDown(e.clientX)}
        onMouseMove={(e) => handlePointerMove(e.clientX)}
        onMouseUp={handlePointerUp}
        onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
        onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
        onTouchEnd={handlePointerUp}
        onWheel={handleWheel}
        style={{
          width: "72%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          position: "relative",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          touchAction: "pan-y",
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
          {!isLoaded ? (
            [0, 1, 2].map((n) => (
              <div
                key={n}
                className="animate-pulse"
                style={{
                  width: n === 0 ? "500px" : "340px",
                  height: n === 0 ? "660px" : "520px",
                  borderRadius: "24px",
                  background: "linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)",
                  flexShrink: 0,
                }}
              />
            ))
          ) : (
            productsSequence.map((product, i) => {
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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    {product.category && (
                      <span
                        style={{
                          fontFamily: "'Manrope', system-ui, sans-serif",
                          fontSize: isFeatured ? "11px" : "10px",
                          fontWeight: 700,
                          letterSpacing: "0.10em",
                          textTransform: "uppercase",
                          color: "#FFFFFF",
                          background: "rgba(255, 255, 255, 0.16)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          WebkitFontSmoothing: "antialiased",
                        }}
                      >
                        {product.category}
                      </span>
                    )}
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
                  </div>

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
          })
        )}
        </div>
      </div>
    </section>
  );
}
