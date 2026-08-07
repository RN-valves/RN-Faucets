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
  Star,
  Truck,
  VolumeX,
  Waves,
} from "lucide-react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import {
  getFaucetProductById,
  getFaucetRangeProducts,
} from "@/data/faucetProducts";
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
    text: "Email help@gloxy.in",
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

type FaucetRangeProduct = ReturnType<typeof getFaucetRangeProducts>[number];

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
  item: FaucetRangeProduct;
  category: string;
}) {
  return (
    <Link
      href={`/faucets/${category}/${item.id}`}
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
              margin: "0 0 12px 0",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "44px",
            }}
          >
            {item.name}
          </h3>

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

            <span className={getFinishSwatchClassName(item.name)} aria-hidden="true" />
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
  const product = getFaucetProductById(productId);

  if (!product) {
    notFound();
  }

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const products = getFaucetRangeProducts();
  const variantProducts = [product, ...products.filter((item) => item.id !== product.id)].slice(0, 6);
  const alsoLikeProducts = useMemo(
    () => products.filter((item) => item.id !== product.id).slice(0, 12),
    [products, product.id],
  );

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

  const activeGalleryImage = product.gallery[selectedImage] ?? product.image;

  return (
    <main style={{ width: "100%", minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <Header />

      <section
        data-header-theme="light"
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "98px 28px 80px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "18px",
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontSize: "12px",
            color: "#5f5f5f",
            marginBottom: "18px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => window.history.back()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              border: "none",
              background: "transparent",
              color: "#222222",
              cursor: "pointer",
              padding: 0,
              fontFamily: "inherit",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <ChevronLeft size={14} />
            Back
          </button>

          <span style={{ fontWeight: 500 }}>Get ₹200 OFF On Orders Above ₹2500</span>
        </div>

        <nav
          aria-label="Breadcrumb"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "6px",
            marginBottom: "18px",
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontSize: "12px",
            color: "#7b7b7b",
          }}
        >
          <Link href="/" style={{ color: "#7b7b7b", textDecoration: "none" }}>
            Home
          </Link>
          <span>›</span>
          <Link href="/faucets" style={{ color: "#7b7b7b", textDecoration: "none" }}>
            Faucets
          </Link>
          <span>›</span>
          <Link
            href={`/faucets/${category}`}
            style={{ color: "#7b7b7b", textDecoration: "none" }}
          >
            {formatCategoryTitle(category)}
          </Link>
          <span>›</span>
          <span style={{ color: "#111111", fontWeight: 600 }}>{product.name}</span>
        </nav>

        <div className="product-detail-layout">
          <div className="product-media-column">
            <div className="product-gallery-column">
              <div className="product-thumbs">
                {product.gallery.map((image, index) => (
                  <button
                    key={`${product.id}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    style={{
                      width: "74px",
                      height: "74px",
                      padding: "6px",
                      border:
                        selectedImage === index ? "1px solid #111111" : "1px solid #d7d7d7",
                      background: "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
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
                  minHeight: "640px",
                  background: "linear-gradient(145deg, #f8f8f8 0%, #efefef 100%)",
                  border: "1px solid #ececec",
                  overflow: "hidden",
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
                    padding: "56px",
                  }}
                />
              </div>
            </div>
          </div>

          <aside className="product-summary-column">
            <div className="product-summary-sticky">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "12px",
                  marginBottom: "10px",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "11px",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "#757575",
                  }}
                >
                  SKU: {product.code}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedImage((current) =>
                      current === product.gallery.length - 1 ? 0 : current + 1,
                    )
                  }
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "999px",
                    border: "1px solid #d6d6d6",
                    background: "#ffffff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#111111",
                  }}
                  aria-label="Next gallery image"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <h1
                style={{
                  margin: "0 0 14px",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "clamp(28px, 2.2vw, 40px)",
                  fontWeight: 700,
                  color: "#111111",
                  lineHeight: 1.12,
                  letterSpacing: "-0.03em",
                }}
              >
                {product.name}
              </h1>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "12px",
                  color: "#4a4a4a",
                }}
              >
                <div style={{ display: "flex", gap: "3px", color: "#111111" }}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={13} fill="currentColor" />
                  ))}
                </div>
                <span>0 Reviews</span>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  backgroundColor: "#0c8f43",
                  color: "#ffffff",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "11px",
                  fontWeight: 700,
                  borderRadius: "4px",
                  padding: "5px 10px",
                  marginBottom: "14px",
                }}
              >
                1 Year Warranty
              </div>

              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: "34px",
                      fontWeight: 800,
                      color: "#ef4c23",
                      letterSpacing: "-0.04em",
                    }}
                  >
                    ₹ {product.price.toLocaleString("en-IN")}.00
                  </span>
                  <span
                    style={{
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: "14px",
                      color: "#8f8f8f",
                      textDecoration: "line-through",
                    }}
                  >
                    ₹{product.originalPrice.toLocaleString("en-IN")}.00
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "12px",
                    color: "#555555",
                  }}
                >
                  Tax included. Shipping calculated at checkout.
                </p>
              </div>

              <div style={{ marginBottom: "22px" }}>
                <div
                  style={{
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#111111",
                    marginBottom: "10px",
                  }}
                >
                  Available Colours
                </div>
                <div className="variant-grid">
                  {variantProducts.map((variant) => (
                    <Link
                      key={variant.id}
                      href={`/faucets/${category}/${variant.id}`}
                      style={{
                        textDecoration: "none",
                        border:
                          variant.id === product.id ? "1px solid #111111" : "1px solid #d8d8d8",
                        backgroundColor: "#ffffff",
                        padding: "8px 6px 6px",
                        color: "#111111",
                      }}
                    >
                      <div
                        style={{
                          height: "60px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "6px",
                        }}
                      >
                        <img
                          src={variant.image}
                          alt={variant.name}
                          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                        />
                      </div>
                      <div
                        style={{
                          fontFamily: "'Manrope', system-ui, sans-serif",
                          fontSize: "10px",
                          lineHeight: 1.2,
                          minHeight: "24px",
                          marginBottom: "4px",
                          color: "#4b4b4b",
                        }}
                      >
                        {variant.name.split(" - ")[0]}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Manrope', system-ui, sans-serif",
                          fontSize: "12px",
                          fontWeight: 800,
                          color: "#ef4c23",
                        }}
                      >
                        ₹{variant.price.toLocaleString("en-IN")}.00
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    border: "1px solid #dddddd",
                    minWidth: "126px",
                    justifyContent: "space-between",
                    padding: "0 12px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: "22px",
                      color: "#111111",
                      lineHeight: 1,
                      padding: "14px 0",
                    }}
                  >
                    -
                  </button>
                  <span
                    style={{
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#111111",
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
                      fontSize: "22px",
                      color: "#111111",
                      lineHeight: 1,
                      padding: "14px 0",
                    }}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      color: "Star White",
                      quantity: quantity
                    });
                    router.push("/cart");
                  }}
                  style={{
                    flex: 1,
                    border: "1px solid #dedede",
                    background: "#ffffff",
                    color: "#111111",
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    cursor: "pointer",
                  }}
                >
                  Add To Cart
                </button>
              </div>

              <button
                type="button"
                style={{
                  width: "100%",
                  height: "54px",
                  border: "none",
                  background: "#000000",
                  color: "#ffffff",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "14px",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  marginBottom: "22px",
                }}
              >
                Buy Now
              </button>

              <div
                style={{
                  borderTop: "1px solid #ececec",
                  paddingTop: "18px",
                  marginBottom: "18px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#111111",
                    marginBottom: "8px",
                  }}
                >
                  Estimated Delivery
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Enter pincode to check"
                    style={{
                      flex: 1,
                      height: "44px",
                      border: "1px solid #d9d9d9",
                      padding: "0 14px",
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    style={{
                      height: "44px",
                      padding: "0 18px",
                      border: "1px solid #111111",
                      background: "#ffffff",
                      color: "#111111",
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Check
                  </button>
                </div>
              </div>

              <div className="feature-grid">
                {FEATURE_TILES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      style={{
                        border: "1px solid #e5e5e5",
                        minHeight: "96px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        textAlign: "center",
                        padding: "18px 14px",
                      }}
                    >
                      <Icon size={18} color="#111111" />
                      <span
                        style={{
                          fontFamily: "'Manrope', system-ui, sans-serif",
                          fontSize: "12px",
                          fontWeight: 600,
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
            <div className="a-plus-content-column">
            <div className="a-plus-help-card">
              <div
                style={{
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#111111",
                  marginBottom: "8px",
                }}
              >
                NEED HELP?
              </div>
              <p
                style={{
                  margin: "0 0 10px",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "12px",
                  color: "#5e6870",
                }}
              >
                Mon to Sat 9 AM to 6 PM
              </p>
              <div style={{ display: "grid", gap: "8px" }}>
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
                        fontSize: "12px",
                        color: "#1e293b",
                      }}
                    >
                      <Icon size={14} />
                      <span>{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="a-plus-card a-plus-hero-card">
              <div>
                <div className="a-plus-brand">GLOXY</div>
                <h2 className="a-plus-title">SHORT BIB COCK</h2>
                <p className="a-plus-copy">
                  Display and store items stylishly while saving floor space.
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
          </aside>
        </div>

       
      </section>

      <FooterSection />

      <style jsx>{`
        .product-detail-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(360px, 420px);
          gap: 28px;
          align-items: start;
        }

        .product-gallery-column {
          display: grid;
          grid-template-columns: 82px minmax(0, 1fr);
          gap: 16px;
          align-items: start;
          position: sticky;
          top: 110px;
          align-self: start;
        }

        .product-media-column {
          min-width: 0;
          align-self: start;
        }

        .product-summary-column {
          position: sticky;
          top: 110px;
          align-self: start;
          max-height: calc(100vh - 126px);
          overflow-y: auto;
          padding-right: 10px;
          scrollbar-gutter: stable;
        }

        .product-summary-sticky {
          position: static;
        }

        .product-summary-column::-webkit-scrollbar {
          width: 6px;
        }

        .product-summary-column::-webkit-scrollbar-thumb {
          background: rgba(17, 17, 17, 0.18);
          border-radius: 999px;
        }

        .product-summary-column::-webkit-scrollbar-track {
          background: transparent;
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

        @media (max-width: 1180px) {
          .product-detail-layout {
            grid-template-columns: 1fr;
          }

          .product-gallery-column {
            position: static;
          }

          .product-summary-column {
            max-width: 760px;
            position: static;
            max-height: none;
            overflow: visible;
            padding-right: 0;
          }

          .product-summary-sticky {
            position: static;
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

        @media (max-width: 860px) {
          .product-gallery-column {
            grid-template-columns: 1fr;
          }

          .product-thumbs {
            flex-direction: row;
            flex-wrap: wrap;
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
