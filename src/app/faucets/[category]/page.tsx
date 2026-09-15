"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import { getFaucetRangeProducts } from "@/data/faucetProducts";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const [sortOption, setSortOption] = useState("Price: Low to High");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categoryData, setCategoryData] = useState<any>(null);

  const [dbProducts, setDbProducts] = useState<any[]>([]);

  useEffect(() => {
    async function loadCategoryData() {
      try {
        const subRes = await fetch(`/api/subcategories/${category}`);
        const subData = subRes.ok ? await subRes.json() : null;
        if (subData && !subData.error) {
          setCategoryData(subData);
        } else {
          const catRes = await fetch(`/api/categories/${category}`);
          const catData = catRes.ok ? await catRes.json() : null;
          if (catData && !catData.error) {
            setCategoryData(catData);
          }
        }

        // Fetch dynamic products from DB for this subcategory or category
        const prodRes = await fetch(`/api/products?subcategory=${category}`);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          const items = prodData.products || prodData;
          if (Array.isArray(items) && items.length > 0) {
            setDbProducts(items);
          }
        }
      } catch (err) {
        console.error("Error fetching category data:", err);
      }
    }
    loadCategoryData();
  }, [category]);

  // Use dynamic DB products if available, fallback to static defaults
  let products = dbProducts.length > 0 ? dbProducts : getFaucetRangeProducts();

  if (sortOption === "Price: Low to High") {
    products.sort((a, b) => (a.price || a.inSelling || 0) - (b.price || b.inSelling || 0));
  } else if (sortOption === "Price: High to Low") {
    products.sort((a, b) => (b.price || b.inSelling || 0) - (a.price || a.inSelling || 0));
  }

  const formatCategoryTitle = (cat: string) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, " ");
  };

  const DEFAULT_HERO_IMAGE =
    "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2Fa47e2b2b-87b9-41a9-90be-488c7364c1be.png&w=1920&q=75";

  const displayTitle = categoryData?.name || formatCategoryTitle(category);
  const heroImage = categoryData?.banner || categoryData?.image || DEFAULT_HERO_IMAGE;

  return (
    <main style={{ width: "100%", minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <Header />

      {/* ── 1. Fullscreen Hero Section ── */}
      <section
        data-header-theme="dark"
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          backgroundColor: "#000000",
        }}
      >
        <Image
          src={heroImage}
          alt={displayTitle}
          fill
          priority
          unoptimized
          style={{
            objectFit: "cover",
            objectPosition: "center",
          }}
        />

        {/* Gradient shadow overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Hero Title */}
        <div
          style={{
            position: "absolute",
            bottom: "8vh",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 2,
          }}
        >
          <h1
            style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: "clamp(38px, 4.5vw, 56px)",
              fontWeight: 500,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            {displayTitle}
          </h1>
        </div>
      </section>

      {/* ── 2. Content Section below Hero ── */}
      <section
        data-header-theme="light"
        style={{
          padding: "36px 48px 80px",
          maxWidth: "1560px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Breadcrumbs */}
        <nav
          style={{
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontSize: "13px",
            color: "#888888",
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Link href="/" style={{ color: "#888888", textDecoration: "none" }}>
            Home
          </Link>
          <span>›</span>
          <span style={{ color: "#888888" }}>Bathware</span>
          <span>›</span>
          <Link href="/faucets" style={{ color: "#888888", textDecoration: "none" }}>
            Faucets
          </Link>
          <span>›</span>
          <span style={{ color: "#111111", fontWeight: 500 }}>{displayTitle}</span>
        </nav>

        {/* Tab & Controls Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "12px",
            marginBottom: "36px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          {/* Active Tab */}
          <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
            <span
              style={{
                padding: "0 0 12px 0",
                marginBottom: "-13px",
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: "15px",
                fontWeight: 600,
                color: "#111111",
                borderBottom: "2px solid #111111",
                display: "inline-block",
              }}
            >
              {displayTitle}
            </span>
          </div>

          {/* Right Controls (Filter & Sort) */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "none",
                border: "none",
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: "14px",
                color: "#111111",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              <SlidersHorizontal size={16} />
              <span>Filter By</span>
            </button>

            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                style={{
                  appearance: "none",
                  background: "none",
                  border: "none",
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#111111",
                  paddingRight: "20px",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="Price: Low to High">Price: Low to High</option>
                <option value="Price: High to Low">Price: High to Low</option>
              </select>
              <ChevronDown size={16} style={{ position: "absolute", right: 0, pointerEvents: "none" }} />
            </div>
          </div>
        </div>

        {/* Product Grid (3/4 columns matching RN Faucets UI) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "28px",
          }}
        >
          {products.map((product) => {
            const prodCode = product.code || product.skuCode || product.id;
            const priceVal = Number(product.inSelling ?? product.price ?? 0);

            return (
              <Link
                key={product.id || prodCode}
                href={`/faucets/${category}/${encodeURIComponent(prodCode)}`}
                style={{
                  textDecoration: "none",
                  padding: "24px 20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  height: "580px",
                  boxSizing: "border-box",
                  cursor: "pointer",
                  position: "relative",
                  transition: "transform 0.35s ease, box-shadow 0.35s ease",
                }}
                className="product-card group"
              >
                {/* Product PNG sits on full-card textured paper — no inner box */}
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
                    padding: "4px 4px 10px",
                    boxSizing: "border-box",
                  }}
                >
                  <img
                    src={product.image || "/api/media/website/catalogue/products/default/image.webp"}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      maxWidth: "96%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      transform: "scale(1.12)",
                      transition: "transform 0.45s ease",
                    }}
                    className="group-hover:scale-[1.18]"
                  />
                </div>

                {/* Editorial title + price + finish dots */}
                <div style={{ flexShrink: 0, marginTop: "12px", padding: "0 6px" }}>
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
                    {product.name}
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
                      ₹{priceVal.toLocaleString("en-IN")}/-
                    </span>

                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span
                        style={{
                          width: "14px",
                          height: "14px",
                          borderRadius: "50%",
                          backgroundColor: "#2f3438",
                          display: "inline-block",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.18)",
                        }}
                      />
                      <span
                        style={{
                          width: "14px",
                          height: "14px",
                          borderRadius: "50%",
                          backgroundColor: "#c97b5a",
                          display: "inline-block",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.18)",
                        }}
                      />
                      <span
                        style={{
                          width: "14px",
                          height: "14px",
                          borderRadius: "50%",
                          backgroundColor: "#c4a06a",
                          display: "inline-block",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.18)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Floating Action Buttons are provided globally via FloatingActionButtons */}

      <FooterSection />
    </main>
  );
}
