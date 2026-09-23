"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Hammer,
  Mail,
  MessageCircleMore,
  Phone,
  RefreshCcw,
  ShieldCheck,
  ShoppingCart,
  Truck,
  VolumeX,
  Waves,
} from "lucide-react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import OtherProductsSection from "@/components/OtherProductsSection";
import { addToCart } from "@/utils/cart";

const FEATURE_TILES = [
  {
    icon: Truck,
    title: "Cash on Delivery",
  },
  {
    icon: BadgeCheck,
    title: "Made in India",
  },
  {
    icon: ShieldCheck,
    title: "ISO Certified Quality",
  },
  {
    icon: RefreshCcw,
    title: "30 Days Easy Return",
  },
];

const HELP_ITEMS = [
  {
    icon: Phone,
    text: "Ask Questions on WhatsApp",
  },
  {
    icon: MessageCircleMore,
    text: "Call Support Team",
  },
  {
    icon: Mail,
    text: "Email enquiry@rnvalves.com",
  },
];

const QUALITY_FEATURES = [
  "Lead-Free Spotless Chrome Finish",
  "Smooth Disc Valve",
];

const LUXURY_POINTS = [
  "Stylish Handle",
  "Perfect Water Flow",
  "Low Maintenance",
  "Suitable For Hot & Cold Water",
];

const SPEC_ICONS = [
  { icon: Hammer, label: "Material Brass" },
  { icon: BadgeCheck, label: "Chrome Finish" },
  { icon: ShieldCheck, label: "Gravity Die-Casting" },
  { icon: Droplets, label: "Hot & Cold Water" },
  { icon: VolumeX, label: "Noiseless Movement" },
  { icon: Waves, label: "Leak-Proof Valve" },
  { icon: ShieldCheck, label: "Waterproof & Moisture-Proof" },
  { icon: Truck, label: "Strong Build" },
];

const getFinishSwatchClassName = (name: string) => {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("chrome black") || lowerName.includes("black matte") || lowerName.includes("black")) {
    return "also-like-swatch also-like-swatch-black";
  }

  if (lowerName.includes("white matte") || lowerName.includes("white gloss") || lowerName.includes("white")) {
    return "also-like-swatch also-like-swatch-white";
  }

  if (lowerName.includes("rose gold")) {
    return "also-like-swatch also-like-swatch-rose";
  }

  if (lowerName.includes("gold")) {
    return "also-like-swatch also-like-swatch-gold";
  }

  if (lowerName.includes("chrome")) {
    return "also-like-swatch also-like-swatch-chrome";
  }

  return "also-like-swatch also-like-swatch-metal";
};

function AlsoLikeProductCard({
  item,
  category,
}: {
  item: any;
  category: string;
}) {
  const itemKey = item.id || item.code || item.skuCode;
  return (
    <Link
      href={`/faucets/${category}/${itemKey}`}
      className="also-like-card"
      aria-label={`View ${item.name}`}
      style={{
        textDecoration: "none",
        padding: "40px 32px 28px",
        display: "flex",
        flexDirection: "column",
        height: "580px",
        boxSizing: "border-box",
        cursor: "pointer",
        position: "relative",
        transition: "transform 0.35s ease, box-shadow 0.35s ease",
      }}
    >
      <article className="product-card group" style={{ display: "contents" }}>
        <div
          className="product-card__image-panel"
          style={{
            flex: "1 1 auto",
            width: "100%",
            minHeight: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            padding: "12px 8px 16px",
            boxSizing: "border-box",
          }}
        >
          <img
            src={item.image}
            alt={item.name}
            style={{
              maxWidth: "88%",
              maxHeight: "100%",
              objectFit: "contain",
              transition: "transform 0.45s ease",
            }}
            className="group-hover:scale-[1.04]"
          />
        </div>

        <div style={{ flexShrink: 0, marginTop: "8px" }}>
          <h3
            style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: "16px",
              fontWeight: 500,
              lineHeight: 1.4,
              color: "#1a1a1a",
              margin: "0 0 8px 0",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "44px",
            }}
          >
            {item.name}
          </h3>

          {/* Size & Article Number info row */}
          {((item as any).article || (item as any).code || (item as any).size) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "6px",
                marginBottom: "12px",
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: "12px",
                lineHeight: 1.2,
              }}
            >
              {((item as any).article || (item as any).code) ? (
                <span
                  style={{
                    color: "#4b5563",
                    fontWeight: 500,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      color: "#8c96a3",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      fontWeight: 600,
                    }}
                  >
                    Art:
                  </span>
                  <span style={{ fontWeight: 600, color: "#1f2937" }}>
                    {(item as any).article || (item as any).code}
                  </span>
                </span>
              ) : (
                <span />
              )}

              {(item as any).size && (
                <span
                  style={{
                    color: "#334155",
                    fontWeight: 600,
                    fontSize: "11px",
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Size: {(item as any).size}
                </span>
              )}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: "22px",
                fontWeight: 700,
                lineHeight: 1,
                color: "#1a1a1a",
              }}
            >
              ₹{item.price.toLocaleString("en-IN")}/-
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function FaucetProductPage({
  params,
}: {
  params: Promise<{ category: string; productId: string }>;
}) {
  const router = useRouter();
  const { category, productId } = use(params);

  const [dbProduct, setDbProduct] = useState<any>(null);
  const [dbVariants, setDbVariants] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [parentCategory, setParentCategory] = useState<{ name: string; slug: string } | null>(null);
  const [subcategoryInfo, setSubcategoryInfo] = useState<{ name: string; slug: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        let loadedProd: any = null;
        const res = await fetch(`/api/products/${productId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) {
            loadedProd = data;
            setDbProduct(data);
          }
        }

        // Fetch categories list to dynamically resolve parent category
        let allCats: any[] = [];
        try {
          const catListRes = await fetch("/api/categories");
          if (catListRes.ok) {
            const catListData = await catListRes.json();
            if (Array.isArray(catListData)) {
              allCats = catListData;
            }
          }
        } catch (e) {
          console.error("Error fetching categories:", e);
        }

        // Fetch subcategory data
        let subcatData: any = null;
        const subcatQuery = category || loadedProd?.subcategoryId || loadedProd?.subcategoryName;
        if (subcatQuery) {
          try {
            const subRes = await fetch(`/api/subcategories/${encodeURIComponent(subcatQuery)}`);
            if (subRes.ok) {
              const sData = await subRes.json();
              if (sData && !sData.error) {
                subcatData = sData;
                setSubcategoryInfo({
                  name: sData.name,
                  slug: sData.slug || category,
                });
              }
            }
          } catch (e) {
            console.error("Error fetching subcategory:", e);
          }
        }

        // Match parent category from subcategory or product
        let matchedCat: any = null;
        if (subcatData) {
          matchedCat = allCats.find(
            (c) =>
              (subcatData.categoryId && String(c.id) === String(subcatData.categoryId)) ||
              (subcatData.categoryName && c.name?.toLowerCase().trim() === subcatData.categoryName?.toLowerCase().trim())
          );
        }
        if (!matchedCat && loadedProd) {
          matchedCat = allCats.find(
            (c) =>
              (loadedProd.categoryId && String(c.id) === String(loadedProd.categoryId)) ||
              (loadedProd.category && (
                c.name?.toLowerCase().trim() === loadedProd.category?.toLowerCase().trim() ||
                c.slug?.toLowerCase().trim() === loadedProd.category?.toLowerCase().trim()
              ))
          );
        }

        if (matchedCat) {
          setParentCategory({
            name: matchedCat.name,
            slug: matchedCat.slug,
          });
        }

        // Fetch products in same subcategory or category matching PHP logic
        const rangeQuery = loadedProd?.subcategoryId || loadedProd?.subcategoryName || category;
        const rangeRes = await fetch(`/api/products?subcategory=${encodeURIComponent(rangeQuery)}&limit=24`);
        let items: any[] = [];
        if (rangeRes.ok) {
          const rangeData = await rangeRes.json();
          items = rangeData.products || rangeData;
        }

        // Fallback to category if fewer than 2 items in subcategory
        if ((!Array.isArray(items) || items.length < 2) && loadedProd?.category) {
          const catRes = await fetch(`/api/products?category=${encodeURIComponent(loadedProd.category)}&limit=24`);
          if (catRes.ok) {
            const catData = await catRes.json();
            const catItems = catData.products || catData;
            if (Array.isArray(catItems) && catItems.length > 0) {
              items = catItems;
            }
          }
        }

        if (Array.isArray(items) && items.length > 0) {
          setDbVariants(items);
        }
      } catch (err) {
        console.error("Error loading product detail data:", err);
      }
    }
    loadData();
  }, [productId, category]);

  const rawProduct = dbProduct;

  const product = {
    id: rawProduct?.id || rawProduct?.code || productId,
    name: rawProduct?.name || "RN Bathware Product",
    code: rawProduct?.code || rawProduct?.skuCode || productId,
    price: Number(rawProduct?.inSelling ?? rawProduct?.price ?? 1018),
    originalPrice: Number(rawProduct?.inMrp ?? rawProduct?.originalPrice ?? 1390),
    image: rawProduct?.image || "/api/media/website/catalogue/products/default/image.webp",
    gallery: Array.isArray(rawProduct?.gallery) && rawProduct.gallery.length > 0
      ? rawProduct.gallery
      : rawProduct?.image ? [rawProduct.image] : ["/api/media/website/catalogue/products/default/image.webp"],
    brand: rawProduct?.brand || "RN Valves & Faucets",
    material: rawProduct?.material || "Brass",
    colorName: rawProduct?.colorName || "Chrome",
    size: (rawProduct?.size && rawProduct.size !== "-" ? rawProduct.size : "").trim(),
    article: rawProduct?.article || "",
    skuCode: rawProduct?.skuCode || rawProduct?.code || "",
    productSizeId: rawProduct?.productSizeId || "",
    colorGroupId: rawProduct?.colorGroupId || "",
    productComboId: rawProduct?.productComboId || "",
    bullets: rawProduct?.bullets || [],
    description: rawProduct?.description || "",
    category: rawProduct?.category || "",
    subcategoryId: rawProduct?.subcategoryId || "",
    subcategoryName: rawProduct?.subcategoryName || "",
    stock: typeof rawProduct?.stock === "number" ? rawProduct.stock : (typeof rawProduct?.stockPcs === "number" ? rawProduct.stockPcs : 10),
  };

  const hasDiscount = product.originalPrice > product.price && product.price > 0;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const inStock = product.stock > 0;

  const hierarchyBreadcrumb = useMemo(() => {
    const parts: string[] = [];
    if (product.material) parts.push(product.material);
    else if (product.category) parts.push(product.category);

    if (product.subcategoryName && !parts.includes(product.subcategoryName)) {
      parts.push(product.subcategoryName);
    } else if (product.category && !parts.includes(product.category)) {
      parts.push(product.category);
    }

    if (product.brand && !parts.includes(product.brand)) {
      parts.push(product.brand);
    }
    return parts.length > 0 ? parts.join(" | ") : "RN Valves & Faucets";
  }, [product.material, product.category, product.subcategoryName, product.brand]);

  // Helper to strictly identify color variants of THIS specific product only
  const isSameProductColorVariant = (item: any, currentProd: any) => {
    if (!item || !currentProd) return false;
    const itemId = String(item.id || item.code);
    const currentId = String(currentProd.id || currentProd.code);
    if (itemId === currentId) return false;

    // 1. Explicit Color Group ID match
    if (item.colorGroupId && currentProd.colorGroupId && item.colorGroupId === currentProd.colorGroupId) {
      return true;
    }
    // 2. Article match
    if (item.article && currentProd.article && item.article.trim().toLowerCase() === currentProd.article.trim().toLowerCase()) {
      return true;
    }
    // 3. Product Combo ID match
    if (item.productComboId && currentProd.productComboId && item.productComboId === currentProd.productComboId) {
      return true;
    }

    // 4. Base name match (e.g. "Edge Single Lever Basin Mixer - Chrome" vs "Edge Single Lever Basin Mixer - Matte Black")
    const currentBaseName = (currentProd.name || "").split("-")[0].trim().toLowerCase();
    const itemBaseName = (item.name || "").split("-")[0].trim().toLowerCase();
    if (currentBaseName && itemBaseName && currentBaseName.length > 3 && currentBaseName === itemBaseName) {
      return true;
    }

    return false;
  };

  // Helper to identify size variants of THIS specific product
  const isSameProductSizeVariant = (item: any, currentProd: any) => {
    if (!item || !currentProd) return false;
    const itemId = String(item.id || item.code);
    const currentId = String(currentProd.id || currentProd.code);
    if (itemId === currentId) return false;

    const itemSize = (item.size || "").trim();
    const currentSize = (currentProd.size || "").trim();
    if (!itemSize || itemSize === "-" || itemSize === currentSize) return false;

    // 1. Explicit Product Size ID match (when shared grouping key)
    if (
      item.productSizeId &&
      currentProd.productSizeId &&
      item.productSizeId === currentProd.productSizeId &&
      item.productSizeId !== item.skuCode
    ) {
      return true;
    }

    // 2. Same colorGroupId / same article with different size
    if (
      item.colorGroupId &&
      currentProd.colorGroupId &&
      item.colorGroupId === currentProd.colorGroupId
    ) {
      return true;
    }

    // 3. Same base name & same color with different size
    const currentBaseName = (currentProd.name || "").split("-")[0].trim().toLowerCase();
    const itemBaseName = (item.name || "").split("-")[0].trim().toLowerCase();
    if (
      currentBaseName &&
      itemBaseName &&
      currentBaseName.length > 3 &&
      currentBaseName === itemBaseName &&
      item.colorName === currentProd.colorName
    ) {
      return true;
    }

    return false;
  };

  const colorVariants = dbVariants.filter((item: any) => isSameProductColorVariant(item, rawProduct));
  const distinctColorMap = new Map<string, any>();
  if (product.colorName) {
    distinctColorMap.set(product.colorName.trim().toLowerCase(), product);
  }
  colorVariants.forEach((item: any) => {
    const cName = (item.colorName || "").trim().toLowerCase();
    if (cName && !distinctColorMap.has(cName)) {
      distinctColorMap.set(cName, item);
    }
  });
  const variantProducts = distinctColorMap.size > 1 ? Array.from(distinctColorMap.values()) : [];

  // Compute distinct size options available
  const rawSizeVariants = dbVariants.filter((item: any) => isSameProductSizeVariant(item, rawProduct));
  const sizeOptionsMap = new Map<string, any>();
  if (product.size) {
    sizeOptionsMap.set(product.size, product);
  }
  rawSizeVariants.forEach((v: any) => {
    const s = (v.size || "").trim();
    if (s && s !== "-" && !sizeOptionsMap.has(s)) {
      sizeOptionsMap.set(s, v);
    }
  });
  const sizeProducts = Array.from(sizeOptionsMap.values());
  const otherProducts = useMemo(() => {
    const currentCode = String(product.code || product.id || productId).trim().toLowerCase();
    const currentId = String(rawProduct?._id || rawProduct?.id || "").trim();

    return dbVariants
      .filter((item: any) => {
        const itemCode = String(item.code || item.id || item.skuCode || "").trim().toLowerCase();
        const itemId = String(item._id || item.id || "").trim();
        if (itemCode && itemCode === currentCode) return false;
        if (currentId && itemId && itemId === currentId) return false;
        return true;
      })
      .slice(0, 12);
  }, [dbVariants, product.code, product.id, productId, rawProduct]);

  const alsoLikeProducts = otherProducts;

  const alsoLikeTrackRef = useRef<HTMLDivElement | null>(null);
  const [alsoLikePage, setAlsoLikePage] = useState(0);
  const [alsoLikePages, setAlsoLikePages] = useState(1);

  useEffect(() => {
    const track = alsoLikeTrackRef.current;
    if (!track) return;

    const computePages = () => {
      const pageWidth = track.clientWidth || 1;
      const pages = Math.max(1, Math.ceil(track.scrollWidth / pageWidth));
      setAlsoLikePages(pages);
      setAlsoLikePage(Math.round(track.scrollLeft / pageWidth));
    };

    computePages();

    const handleScroll = () => {
      const pageWidth = track.clientWidth || 1;
      setAlsoLikePage(Math.round(track.scrollLeft / pageWidth));
    };

    track.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", computePages);

    return () => {
      track.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", computePages);
    };
  }, [alsoLikeProducts.length]);

  const scrollAlsoLikeByPage = (direction: -1 | 1) => {
    const track = alsoLikeTrackRef.current;
    if (!track) return;
    const pageWidth = track.clientWidth || 1;
    track.scrollBy({ left: direction * pageWidth, behavior: "smooth" });
  };

  const goToAlsoLikePage = (page: number) => {
    const track = alsoLikeTrackRef.current;
    if (!track) return;
    const pageWidth = track.clientWidth || 1;
    track.scrollTo({ left: page * pageWidth, behavior: "smooth" });
  };

  const formatCategoryTitle = (cat: string) =>
    cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, " ");

  const displayParentCatName =
    parentCategory?.name ||
    rawProduct?.category ||
    "Faucets";

  const displayParentCatHref = parentCategory?.slug
    ? `/${parentCategory.slug}`
    : rawProduct?.category
    ? `/${rawProduct.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
    : "/faucets";

  const displaySubcatName =
    subcategoryInfo?.name ||
    rawProduct?.subcategoryName ||
    formatCategoryTitle(category);

  const displaySubcatHref = `/faucets/${category}`;

  const activeGalleryImage = product.gallery[selectedImage] ?? product.image;

  return (
    <main style={{ width: "100%", minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <Header />

      <section
        data-header-theme="light"
        style={{
          maxWidth: "1360px",
          margin: "0 auto",
          padding: "115px 28px 80px",
          boxSizing: "border-box",
        }}
      >
        {/* Top Navigation & Breadcrumbs Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontSize: "13px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => window.history.back()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                color: "#0f172a",
                cursor: "pointer",
                padding: "6px 12px",
                borderRadius: "6px",
                fontFamily: "inherit",
                fontSize: "13px",
                fontWeight: 700,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                transition: "all 0.2s ease",
              }}
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <nav
              aria-label="Breadcrumb"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#64748b",
                fontSize: "13px",
                overflowX: "auto",
                whiteSpace: "nowrap",
              }}
            >
              <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>
                Home
              </Link>
              <span style={{ color: "#cbd5e1" }}>/</span>
              <Link href={displayParentCatHref} style={{ color: "#64748b", textDecoration: "none" }}>
                {displayParentCatName}
              </Link>
              <span style={{ color: "#cbd5e1" }}>/</span>
              <Link
                href={displaySubcatHref}
                style={{ color: "#64748b", textDecoration: "none" }}
              >
                {displaySubcatName}
              </Link>
              <span style={{ color: "#cbd5e1" }}>/</span>
              <span style={{ color: "#0f172a", fontWeight: 600 }}>{product.name}</span>
            </nav>
          </div>

          <span
            style={{
              fontWeight: 700,
              color: "#0f172a",
              fontSize: "12px",
              background: "#f8fafc",
              padding: "5px 12px",
              borderRadius: "999px",
              border: "1px solid #e2e8f0",
              letterSpacing: "0.02em",
            }}
          >
            Get ₹200 OFF On Orders Above ₹2500
          </span>
        </div>

        <div className="product-detail-layout">
          <div className="product-media-column">
            <div className="product-gallery-column">
              <div className="product-thumbs">
                {product.gallery.map((image: string, index: number) => (
                  <button
                    key={`${product.id}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    style={{
                      width: "68px",
                      height: "68px",
                      padding: "5px",
                      border:
                        selectedImage === index ? "2px solid #0f172a" : "1px solid #e2e8f0",
                      background: "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "8px",
                      boxShadow: selectedImage === index ? "0 2px 8px rgba(15, 23, 42, 0.1)" : "none",
                      transition: "all 0.2s ease",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </button>
                ))}
              </div>

              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1 / 1",
                  maxHeight: "490px",
                  background: "#ffffff",
                  border: "1px solid #f1f5f9",
                  borderRadius: "16px",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
                }}
              >
                <Image
                  src={activeGalleryImage}
                  alt={product.name}
                  fill
                  unoptimized
                  priority
                  style={{
                    objectFit: "contain",
                    padding: "24px",
                  }}
                />

                {product.gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImage((current) =>
                          current === 0 ? product.gallery.length - 1 : current - 1,
                        )
                      }
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        zIndex: 2,
                        color: "#0f172a",
                      }}
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImage((current) =>
                          current === product.gallery.length - 1 ? 0 : current + 1,
                        )
                      }
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        zIndex: 2,
                        color: "#0f172a",
                      }}
                      aria-label="Next image"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <aside className="product-summary-column">
            <div className="product-summary-sticky">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "11.5px",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "#64748b",
                    fontWeight: 700,
                  }}
                >
                  {hierarchyBreadcrumb}
                </div>
              </div>

              <h1
                style={{
                  margin: "0 0 10px",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "clamp(24px, 2.2vw, 32px)",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1.25,
                  letterSpacing: "-0.02em",
                }}
              >
                {product.name}
              </h1>

              {/* Article & Stock Status Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "13px",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ color: "#64748b", fontWeight: 600 }}>
                  Article : <strong style={{ color: "#0f172a", background: "#f1f5f9", padding: "3px 8px", borderRadius: "4px", border: "1px solid #e2e8f0", fontFamily: "ui-monospace, monospace" }}>{product.article || product.code}</strong>
                </span>

                <span style={{ color: "#cbd5e1" }}>•</span>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "3px 9px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 700,
                    background: inStock ? "#ecfdf5" : "#fef2f2",
                    color: inStock ? "#059669" : "#dc2626",
                    border: `1px solid ${inStock ? "#a7f3d0" : "#fecaca"}`,
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: inStock ? "#10b981" : "#ef4444",
                    }}
                  />
                  {inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              {/* Price & Discount */}
              <div style={{ marginBottom: "18px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: "32px",
                      fontWeight: 800,
                      color: "#0f172a",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    ₹ {product.price.toLocaleString("en-IN")}.00
                  </span>
                  {hasDiscount && (
                    <>
                      <span
                        style={{
                          fontFamily: "'Manrope', system-ui, sans-serif",
                          fontSize: "16px",
                          color: "#94a3b8",
                          textDecoration: "line-through",
                          fontWeight: 500,
                        }}
                      >
                        ₹{product.originalPrice.toLocaleString("en-IN")}.00
                      </span>
                      <span
                        style={{
                          fontFamily: "'Manrope', system-ui, sans-serif",
                          fontSize: "12px",
                          fontWeight: 800,
                          color: "#059669",
                          background: "#ecfdf5",
                          border: "1px solid #a7f3d0",
                          padding: "2px 8px",
                          borderRadius: "999px",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {discountPercent}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Product Meta Details Box */}
              <div
                style={{
                  background: "#fbfbfc",
                  border: "1px solid #eaeaea",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  marginBottom: "20px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px 18px",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "12.5px",
                }}
              >
                <div>
                  <span style={{ color: "#64748b", fontWeight: 500 }}>Product Code: </span>
                  <strong style={{ color: "#0f172a", fontFamily: "ui-monospace, monospace" }}>{product.skuCode || product.code}</strong>
                </div>

                {(product.subcategoryName || product.category) && (
                  <div>
                    <span style={{ color: "#64748b", fontWeight: 500 }}>Category: </span>
                    <Link
                      href={displaySubcatHref}
                      style={{
                        color: "#0284c7",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      {displaySubcatName}
                    </Link>
                  </div>
                )}

                {product.size && (
                  <div>
                    <span style={{ color: "#64748b", fontWeight: 500 }}>Product Size: </span>
                    <strong style={{ color: "#0f172a" }}>{product.size}</strong>
                  </div>
                )}

                <div>
                  <span style={{ color: "#64748b", fontWeight: 500 }}>Offers: </span>
                  <span
                    style={{
                      color: "#0369a1",
                      background: "#f0f9ff",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    Tiered bulk discounts
                  </span>
                </div>
              </div>

              {variantProducts.length > 1 && (
                <div style={{ marginBottom: "26px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Manrope', system-ui, sans-serif",
                        fontSize: "14px",
                        fontWeight: 800,
                        color: "#111111",
                      }}
                    >
                      Available Colours
                    </span>
                    <span
                      style={{
                        fontFamily: "'Manrope', system-ui, sans-serif",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#64748b",
                      }}
                    >
                      Color Name: <strong style={{ color: "#0f172a" }}>{product.colorName || "Standard"}</strong>
                    </span>
                  </div>
                  <div className="variant-grid">
                    {variantProducts.map((variant: any) => {
                      const vId = variant.id || variant.code;
                      const vName = variant.colorName || variant.name?.split(" - ")[0] || "Standard";
                      const vImg = variant.image || "/api/media/website/catalogue/products/default/image.webp";

                      return (
                        <Link
                          key={vId}
                          href={`/faucets/${category}/${encodeURIComponent(vId)}`}
                          style={{
                            textDecoration: "none",
                            border:
                              vId === product.id ? "2px solid #111111" : "1px solid #d8d8d8",
                            backgroundColor: "#ffffff",
                            padding: "8px 6px 6px",
                            color: "#111111",
                            borderRadius: "6px",
                          }}
                        >
                          <div
                            style={{
                              height: "64px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginBottom: "6px",
                            }}
                          >
                            <img
                              src={vImg}
                              alt={vName}
                              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                            />
                          </div>
                          <div
                            style={{
                              fontFamily: "'Manrope', system-ui, sans-serif",
                              fontSize: "11px",
                              fontWeight: 600,
                              lineHeight: 1.2,
                              minHeight: "24px",
                              color: "#333333",
                              textAlign: "center",
                            }}
                          >
                            {vName}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Available Sizes Section */}
              {(sizeProducts.length > 0 || product.size) && (
                <div style={{ marginBottom: "26px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Manrope', system-ui, sans-serif",
                        fontSize: "14px",
                        fontWeight: 800,
                        color: "#111111",
                      }}
                    >
                      Available Sizes
                    </span>
                    {product.size && (
                      <span
                        style={{
                          fontFamily: "'Manrope', system-ui, sans-serif",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#666666",
                        }}
                      >
                        Size: <strong style={{ color: "#111111" }}>{product.size}</strong>
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {sizeProducts.length > 0 ? (
                      sizeProducts.map((variant: any) => {
                        const vId = String(variant.id || variant.code);
                        const vSize = (variant.size || "Standard").trim();
                        const isSelected = String(product.id) === vId || vSize === product.size;
                        const vPrice = Number(variant.inSelling ?? variant.price ?? product.price);

                        return (
                          <Link
                            key={vId || vSize}
                            href={`/faucets/${category}/${encodeURIComponent(vId)}`}
                            style={{
                              textDecoration: "none",
                              display: "inline-flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "10px 20px",
                              borderRadius: "6px",
                              border: isSelected ? "2px solid #111111" : "1px solid #d4d4d4",
                              backgroundColor: isSelected ? "#111111" : "#ffffff",
                              color: isSelected ? "#ffffff" : "#111111",
                              transition: "all 0.15s ease",
                              cursor: "pointer",
                              minWidth: "85px",
                              boxShadow: isSelected ? "0 4px 12px rgba(0,0,0,0.12)" : "none",
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "'Manrope', system-ui, sans-serif",
                                fontSize: "13px",
                                fontWeight: 700,
                                letterSpacing: "0.02em",
                              }}
                            >
                              {vSize}
                            </span>
                            {sizeProducts.length > 1 && vPrice > 0 && (
                              <span
                                style={{
                                  fontFamily: "'Manrope', system-ui, sans-serif",
                                  fontSize: "11px",
                                  fontWeight: 500,
                                  opacity: isSelected ? 0.85 : 0.65,
                                  marginTop: "2px",
                                }}
                              >
                                ₹{vPrice.toLocaleString("en-IN")}
                              </span>
                            )}
                          </Link>
                        );
                      })
                    ) : (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "10px 20px",
                          borderRadius: "6px",
                          border: "2px solid #111111",
                          backgroundColor: "#111111",
                          color: "#ffffff",
                          fontFamily: "'Manrope', system-ui, sans-serif",
                          fontSize: "13px",
                          fontWeight: 700,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                        }}
                      >
                        {product.size}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  gap: "10px",
                  marginBottom: "24px",
                  flexWrap: "wrap",
                }}
              >
                {/* Stepper */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    border: "1px solid #dcdfe4",
                    borderRadius: "8px",
                    background: "#f8fafc",
                    width: "108px",
                    height: "48px",
                    justifyContent: "space-between",
                    padding: "0 8px",
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: "20px",
                      color: "#0f172a",
                      lineHeight: 1,
                      padding: "4px 8px",
                    }}
                  >
                    -
                  </button>
                  <span
                    style={{
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => current + 1)}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: "20px",
                      color: "#0f172a",
                      lineHeight: 1,
                      padding: "4px 8px",
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Add To Cart */}
                <button
                  type="button"
                  onClick={() => {
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      color: product.colorName || "Standard",
                      size: product.size || undefined,
                      quantity: quantity,
                    });
                    router.push("/cart");
                  }}
                  style={{
                    flex: "1 1 140px",
                    height: "48px",
                    border: "1.5px solid #0f172a",
                    borderRadius: "8px",
                    background: "#ffffff",
                    color: "#0f172a",
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "14px",
                    fontWeight: 800,
                    letterSpacing: "0.02em",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <ShoppingCart size={17} />
                  Add To Cart
                </button>

                {/* Buy Now */}
                <button
                  type="button"
                  onClick={() => {
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      color: product.colorName || "Standard",
                      size: product.size || undefined,
                      quantity: quantity,
                    });
                    router.push("/checkout");
                  }}
                  style={{
                    flex: "1 1 140px",
                    height: "48px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#0f172a",
                    color: "#ffffff",
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "14px",
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                  }}
                >
                  Buy Now
                </button>
              </div>

              {/* ── Estimated Delivery (Commented out per user request) ──
              <div
                style={{
                  borderTop: "1px solid #ececec",
                  paddingTop: "22px",
                  marginBottom: "22px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "#111111",
                    marginBottom: "10px",
                  }}
                >
                  Estimated Delivery
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Enter pincode to check"
                    style={{
                      flex: 1,
                      height: "50px",
                      border: "1px solid #cccccc",
                      borderRadius: "6px",
                      padding: "0 16px",
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    style={{
                      height: "50px",
                      padding: "0 22px",
                      border: "1px solid #111111",
                      borderRadius: "6px",
                      background: "#ffffff",
                      color: "#111111",
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: "13px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Check
                  </button>
                </div>
              </div>
              ── */}

              <div className="feature-grid">
                {FEATURE_TILES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      style={{
                        border: "1px solid #e2e2e2",
                        minHeight: "108px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        textAlign: "center",
                        padding: "20px 14px",
                      }}
                    >
                      <Icon size={22} color="#111111" />
                      <span
                        style={{
                          fontFamily: "'Manrope', system-ui, sans-serif",
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#111111",
                          lineHeight: 1.35,
                        }}
                      >
                        {item.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── A++ Content Column (Commented out per user request) ──
            <div className="a-plus-content-column">
              <div className="a-plus-help-card">
                <div
                  style={{
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "15px",
                    fontWeight: 900,
                    color: "#111111",
                    marginBottom: "8px",
                  }}
                >
                  NEED HELP?
                </div>
                <p
                  style={{
                    margin: "0 0 12px",
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "13px",
                    color: "#5e6870",
                    fontWeight: 500,
                  }}
                >
                  Mon to Sat 9 AM to 6 PM
                </p>
                <div style={{ display: "grid", gap: "10px" }}>
                  {HELP_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.text}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          fontFamily: "'Manrope', system-ui, sans-serif",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#1e293b",
                        }}
                      >
                        <Icon size={16} />
                        <span>{item.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="a-plus-card a-plus-hero-card">
                <div>
                  <div className="a-plus-brand">{product.brand || "RN Valves & Faucets"}</div>
                  <h2 className="a-plus-title">{product.name}</h2>
                  <p className="a-plus-copy">
                    Precision-engineered for durable performance, flawless aesthetics, and seamless water flow.
                  </p>
                </div>
                <div className="a-plus-product-visual">
                  <img src={product.image} alt={product.name} />
                </div>
              </div>

              <div className="a-plus-card a-plus-quality-card">
                <div>
                  <h3 className="a-plus-heading">Modern Design Premium Quality Faucet</h3>
                  <div className="a-plus-feature-list">
                    {QUALITY_FEATURES.map((item) => (
                      <div key={item} className="a-plus-feature-item">
                        <span className="a-plus-mini-icon" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="a-plus-side-product">
                  <img src={product.image} alt={`${product.name} premium view`} />
                </div>
              </div>

              <div className="a-plus-card a-plus-luxury-card">
                <div className="a-plus-luxury-product">
                  <img src={product.image} alt={`${product.name} luxury view`} />
                  <div className="a-plus-handle-tag">Stylish Handle</div>
                </div>
                <div className="a-plus-bullet-column">
                  {LUXURY_POINTS.slice(1).map((item) => (
                    <div key={item} className="a-plus-pill">
                      {item}
                    </div>
                  ))}
                </div>
                <div className="a-plus-luxury-copy">
                  Give your home a <strong>LUXURIOUS FEEL</strong>
                </div>
              </div>

              <div className="a-plus-card a-plus-spec-card">
                <div className="a-plus-spec-grid">
                  {product.article && (
                    <div className="a-plus-spec-item">
                      <div className="a-plus-spec-icon">
                        <BadgeCheck size={22} />
                      </div>
                      <span>Article: {product.article}</span>
                    </div>
                  )}
                  {product.size && (
                    <div className="a-plus-spec-item">
                      <div className="a-plus-spec-icon">
                        <Waves size={22} />
                      </div>
                      <span>Size: {product.size}</span>
                    </div>
                  )}
                  {SPEC_ICONS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="a-plus-spec-item">
                        <div className="a-plus-spec-icon">
                          <Icon size={22} />
                        </div>
                        <span>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            ── */}
          </aside>
        </div>
      </section>

      {/* ── Other Products in this section (matching PHP Laravel) ── */}
      {otherProducts.length > 0 && (
        <OtherProductsSection
          products={otherProducts}
          categorySlug={category}
          title="Other Products in this section"
        />
      )}

      <FooterSection />

      <style jsx>{`
        .product-detail-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
          gap: 48px;
          align-items: start;
        }

        .product-gallery-column {
          display: grid;
          grid-template-columns: 78px minmax(0, 1fr);
          gap: 16px;
          align-items: start;
        }

        .product-media-column {
          min-width: 0;
          position: sticky;
          top: 96px;
          align-self: start;
        }

        .product-summary-column {
          min-width: 0;
          padding-left: 4px;
        }

        .product-summary-sticky {
          position: static;
        }

        .also-like-section {
          margin: 108px -28px 0;
          padding: 96px 56px 112px;
          background: #f5f5f5;
        }

        .also-like-shell {
          max-width: 1440px;
          margin: 0 auto;
        }

        .also-like-title {
          margin: 0 0 54px;
          font-family: 'Inter', 'Helvetica Now', 'Neue Haas Grotesk Text Pro', 'Manrope', system-ui,
            sans-serif;
          font-size: clamp(38px, 4.2vw, 52px);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.02;
          color: #0f0f0f;
          text-align: center;
        }

        .also-like-carousel {
          position: relative;
        }

        .also-like-track {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          padding: 0;
          scroll-padding-inline: 56px;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .also-like-track::-webkit-scrollbar {
          display: none;
        }

        .also-like-card {
          flex: 0 0 calc((100% - 72px) / 4);
          display: block;
          text-decoration: none;
          color: inherit;
          scroll-snap-align: start;
          cursor: pointer;
        }

        .also-like-card-inner {
          position: relative;
          overflow: hidden;
          height: 620px;
          background: #dde6ea;
          border-radius: 0;
          box-shadow: none;
          outline: 1px solid rgba(15, 15, 15, 0.06);
          display: grid;
          grid-template-rows: 70% 30%;
          transition: all 300ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* Premium paper texture (visible grain + fibers) */
        .also-like-card-inner::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.32;
          pointer-events: none;
          background-image:
            radial-gradient(ellipse 80% 60% at 50% 22%, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0)
                  58%),
            radial-gradient(ellipse 70% 55% at 18% 12%, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0)
                  55%),
            radial-gradient(ellipse 75% 60% at 86% 92%, rgba(150, 168, 182, 0.22) 0%, rgba(150, 168, 182, 0)
                  55%),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='6' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.55 0 0 0 0 0.6 0 0 0 0 0.66 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)' opacity='0.85'/%3E%3C/svg%3E"),
            linear-gradient(180deg, #e9f0f3 0%, #dde6ea 52%, #d5e0e6 100%);
          background-size: auto, auto, auto, 180px 180px, auto;
          background-repeat: no-repeat, no-repeat, no-repeat, repeat, no-repeat;
          mix-blend-mode: multiply;
        }

        .also-like-card-inner::after {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.45;
          pointer-events: none;
          background-image:
            repeating-linear-gradient(
              0deg,
              transparent 0,
              transparent 2px,
              rgba(255, 255, 255, 0.11) 2px,
              rgba(255, 255, 255, 0.11) 3px
            ),
            repeating-linear-gradient(
              90deg,
              transparent 0,
              transparent 4px,
              rgba(123, 141, 154, 0.09) 4px,
              rgba(123, 141, 154, 0.09) 5px
            );
          mix-blend-mode: soft-light;
        }

        .also-like-card-inner > * {
          position: relative;
          z-index: 1;
        }

        .also-like-card:hover .also-like-card-inner {
          transform: translateY(-4px);
        }

        .also-like-card-image {
          position: relative;
          padding: 56px 34px 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .also-like-card-photo {
          width: 100%;
          max-width: 88%;
          max-height: 360px;
          object-fit: contain;
          filter: drop-shadow(0 14px 22px rgba(26, 41, 52, 0.16));
          transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .also-like-card:hover .also-like-card-photo {
          transform: scale(1.03);
        }

        .also-like-card-meta {
          padding: 18px 22px 22px;
          font-family: 'Inter', 'Helvetica Now', 'Neue Haas Grotesk Text Pro', 'Manrope', system-ui,
            sans-serif;
        }

        .also-like-card-name {
          font-size: clamp(18px, 1.35vw, 20px);
          font-weight: 600;
          line-height: 1.35;
          letter-spacing: -0.01em;
          color: #111;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .also-like-card-price {
          margin-top: 16px;
          font-size: clamp(28px, 2.2vw, 32px);
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.02em;
          color: #000;
        }

        .also-like-swatch {
          position: absolute;
          right: 18px;
          bottom: 18px;
          width: 14px;
          height: 14px;
          border-radius: 999px;
        }

        .also-like-swatch-black {
          background: #141414;
        }

        .also-like-swatch-white {
          background: #f8f8f6;
          border: 1px solid rgba(143, 143, 143, 0.48);
        }

        .also-like-swatch-chrome {
          background: linear-gradient(135deg, #cfd5d9 0%, #eef2f4 45%, #aeb6bc 100%);
          border: 1px solid rgba(130, 138, 144, 0.34);
        }

        .also-like-swatch-metal {
          background: linear-gradient(135deg, #9ca7b0 0%, #dfe6ea 100%);
          border: 1px solid rgba(122, 132, 140, 0.24);
        }

        .also-like-swatch-gold {
          background: linear-gradient(135deg, #b88314 0%, #efd67b 48%, #a56f08 100%);
        }

        .also-like-swatch-rose {
          background: linear-gradient(135deg, #b87463 0%, #f4c8b8 50%, #956150 100%);
        }

        .also-like-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 999px;
          border: 1px solid #e5e5e5;
          background: rgba(255, 255, 255, 0.96);
          color: #111111;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2;
          transition:
            background-color 200ms ease,
            transform 200ms ease,
            border-color 200ms ease;
        }

        .also-like-arrow:hover {
          background: #f0f0f0;
          border-color: #d9d9d9;
          transform: translateY(-50%) scale(1.04);
        }

        .also-like-arrow-left {
          left: -22px;
        }

        .also-like-arrow-right {
          right: -22px;
        }

        .also-like-dots {
          margin-top: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .also-like-dot {
          position: relative;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          border: none;
          background: #c8c8c8;
          cursor: pointer;
          padding: 0;
          transition: all 200ms ease;
        }

        .also-like-dot.active {
          width: 18px;
          height: 18px;
          background: transparent;
          border: 1px solid rgba(15, 15, 15, 0.3);
        }

        .also-like-dot.active::after {
          content: '';
          position: absolute;
          inset: 5px;
          border-radius: 999px;
          background: #1a1a1a;
        }

        .product-thumbs {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 520px;
          overflow-y: auto;
          scrollbar-width: thin;
          padding-right: 6px;
        }

        .product-thumbs::-webkit-scrollbar {
          width: 4px;
        }

        .product-thumbs::-webkit-scrollbar-thumb {
          background: rgba(17, 17, 17, 0.18);
          border-radius: 999px;
        }

        .variant-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 8px;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0;
        }

        .a-plus-content-column {
          display: grid;
          gap: 8px;
          margin-top: 22px;
        }

        .a-plus-help-card {
          background: #eaf1f3;
          border: 1px solid #dce7ea;
          padding: 18px 18px 16px;
        }

        .a-plus-card {
          position: relative;
          overflow: hidden;
          border: 1px solid #d5e1e7;
          background: radial-gradient(circle at 30% 30%, #edf6fb 0%, #d7e6ef 45%, #c5d9e5 100%);
          min-height: 220px;
        }

        .a-plus-brand {
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 22px;
        }

        .a-plus-hero-card {
          padding: 24px 24px 20px;
          display: grid;
          grid-template-columns: 1fr;
        }

        .a-plus-title {
          margin: 0 0 12px;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 38px;
          font-weight: 700;
          letter-spacing: -0.04em;
          color: #1f2937;
          text-align: right;
        }

        .a-plus-copy {
          margin: 0;
          max-width: 210px;
          margin-left: auto;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 14px;
          line-height: 1.45;
          color: #364152;
          text-align: right;
        }

        .a-plus-product-visual {
          position: relative;
          margin-top: 12px;
          height: 170px;
          display: flex;
          align-items: flex-end;
          justify-content: flex-start;
        }

        .a-plus-product-visual img,
        .a-plus-side-product img,
        .a-plus-luxury-product img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 10px 24px rgba(74, 85, 104, 0.18));
        }

        .a-plus-quality-card {
          padding: 22px 22px 16px;
          display: grid;
          grid-template-columns: 1fr 132px;
          gap: 18px;
          align-items: end;
        }

        .a-plus-heading {
          margin: 0 0 18px;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 30px;
          font-weight: 700;
          letter-spacing: -0.04em;
          color: #1f2937;
          line-height: 1.08;
        }

        .a-plus-feature-list {
          display: grid;
          gap: 14px;
        }

        .a-plus-feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 13px;
          color: #1f2937;
        }

        .a-plus-mini-icon {
          width: 38px;
          height: 38px;
          border: 1px solid rgba(31, 41, 55, 0.35);
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.65);
          display: inline-block;
          position: relative;
        }

        .a-plus-mini-icon::before {
          content: '';
          position: absolute;
          inset: 11px 14px;
          border-radius: 2px;
          background: #6b7280;
          transform: rotate(-20deg);
        }

        .a-plus-side-product {
          height: 170px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .a-plus-luxury-card {
          padding: 20px 18px 14px;
          display: grid;
          grid-template-columns: 1fr 112px;
          gap: 12px;
        }

        .a-plus-luxury-product {
          position: relative;
          height: 170px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .a-plus-handle-tag {
          position: absolute;
          top: 10px;
          left: 68%;
          transform: translateX(-20%);
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: #1f2937;
        }

        .a-plus-handle-tag::before {
          content: '';
          position: absolute;
          left: -58px;
          top: 11px;
          width: 52px;
          height: 1px;
          background: #1f2937;
          transform: rotate(-20deg);
          transform-origin: right center;
        }

        .a-plus-bullet-column {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: stretch;
          margin-top: 18px;
        }

        .a-plus-pill {
          background: rgba(255, 255, 255, 0.85);
          border-radius: 8px;
          padding: 8px 10px;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 11px;
          line-height: 1.25;
          color: #1f2937;
          box-shadow: 0 4px 10px rgba(148, 163, 184, 0.14);
        }

        .a-plus-luxury-copy {
          grid-column: 1 / -1;
          display: flex;
          justify-content: flex-end;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 14px;
          color: #1f2937;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-top: 4px;
        }

        .a-plus-luxury-copy strong {
          margin-left: 6px;
          font-size: 24px;
          letter-spacing: -0.03em;
        }

        .a-plus-spec-card {
          padding: 18px 16px 14px;
        }

        .a-plus-spec-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px 12px;
        }

        .a-plus-spec-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
          font-family: 'Manrope', system-ui, sans-serif;
          font-size: 11px;
          color: #1f2937;
          line-height: 1.25;
        }

        .a-plus-spec-icon {
          width: 48px;
          height: 48px;
          border-radius: 999px;
          border: 1px solid rgba(31, 41, 55, 0.45);
          background: rgba(255, 255, 255, 0.55);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 1024px) {
          .product-detail-layout {
            grid-template-columns: 1fr;
            gap: 36px;
          }

          .product-media-column {
            position: static;
          }

          .product-gallery-column {
            grid-template-columns: 1fr;
          }

          .product-thumbs {
            flex-direction: row;
            order: 2;
            overflow-x: auto;
            max-height: none;
            padding-bottom: 4px;
          }

          .product-summary-column {
            max-width: 100%;
            padding-left: 0;
          }

          .also-like-section {
            margin-top: 96px;
            padding: 88px 40px 100px;
          }

          .also-like-arrow-left,
          .also-like-arrow-right {
            display: none;
          }
        }

          .variant-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .a-plus-quality-card,
          .a-plus-luxury-card {
            grid-template-columns: 1fr;
          }

          .a-plus-title,
          .a-plus-copy,
          .a-plus-luxury-copy {
            text-align: left;
            justify-content: flex-start;
            margin-left: 0;
          }

          .a-plus-spec-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .also-like-section {
            margin-inline: -28px;
            padding: 76px 28px 88px;
          }

          .also-like-title {
            margin-bottom: 40px;
          }

          .also-like-card {
            flex-basis: calc((100% - 24px) / 2);
          }

          .also-like-card-inner {
            height: 540px;
          }

          .also-like-card-image {
            padding: 38px 24px 14px;
          }

          .also-like-card-meta {
            padding: 18px 20px 22px;
          }
        }

        @media (max-width: 640px) {
          .variant-grid,
          .feature-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .a-plus-spec-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .a-plus-title {
            font-size: 30px;
          }

          .a-plus-heading {
            font-size: 26px;
          }

          .also-like-section {
            margin-inline: -28px;
            padding: 64px 16px 72px;
          }

          .also-like-title {
            margin-bottom: 34px;
            font-size: 26px;
          }

          .also-like-card {
            flex-basis: 84vw;
            min-width: 84vw;
          }

          .also-like-card-inner {
            height: 500px;
          }

          .also-like-card-image {
            padding: 32px 20px 12px;
          }

          .also-like-card-photo {
            max-width: 90%;
            max-height: 290px;
          }

          .also-like-card-meta {
            padding: 16px 18px 20px;
          }

          .also-like-card-footer {
            align-items: center;
          }

          .also-like-card-price {
            font-size: 28px;
          }
        }
      `}</style>
    </main>
  );
}
