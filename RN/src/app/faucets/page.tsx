"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import SupportLinksSection from "@/components/SupportLinksSection";
import FooterSection from "@/components/FooterSection";

const HERO_IMAGE =
  "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2Ffd5e935d-4329-4d05-ae85-2af0f1be36fa.png&w=1920&q=75";

const SHOWCASE_CARDS = [
  {
    id: "ranges",
    title: "Ranges",
    subtitle: "Curated Faucet Collection for Every Space",
    image:
      "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2Fa47e2b2b-87b9-41a9-90be-488c7364c1be.png&w=1080&q=75",
  },
  {
    id: "accessories",
    title: "Bathroom Accessories",
    subtitle: "Bathroom Accessories — Functional Details that Elevate Your Space",
    image:
      "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2F1ea9505b-58b6-4cdb-99c6-938f941e24f9.png&w=1080&q=75",
  },
  {
    id: "add-ons",
    title: "Add-ons",
    subtitle: "Functional add-ons for your Bath Spaces",
    image:
      "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2F93827b74-9750-459d-bc38-94d7681a43f8.jpeg&w=1080&q=75",
  },
];

const FEATURE_CARDS = [
  {
    id: "concealed-body",
    title: "Concealed Body",
    subtitle: "Concealed Body — Hidden Strength Behind Flawless Performance",
    image:
      "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2Fdcebe235-4c08-4f25-947a-9f15d15fd620.png&w=1080&q=75",
  },
  {
    id: "drains",
    title: "Drains",
    subtitle: "Bathroom Drains — Efficient Waste Management with Lasting Durability",
    image:
      "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2F8ce61f19-4a5c-40ac-9e56-85716d2afb4b.png&w=1080&q=75",
  },
];

const FAUCET_BLOGS = [
  {
    id: 1,
    title: "A Guide to Choose the Perfect Washbasin Tap for Your Bathroom",
    image:
      "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fblog%2Felevate-your-culinary-space-with-these-innovative-kitchen-tap-designs.png&w=828&q=75",
  },
  {
    id: 2,
    title: "How to Clean and Maintain Bathroom Floor Drains",
    image:
      "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2FBathroom-floor-drains--1770875269314.png&w=828&q=75",
  },
  {
    id: 3,
    title: "How to Install a Toilet Paper Holder",
    image:
      "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2FHow-to-Install-a-Toilet-Paper-Holder-1767873275815.png&w=828&q=75",
  },
];

export default function FaucetsPage() {
  return (
    <main style={{ width: "100%", minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <Header />

      {/* ── 1. Fullscreen Hero Section ── */}
      <section
        data-header-theme="dark"
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          backgroundColor: "#000000",
        }}
      >
        <Image
          src={HERO_IMAGE}
          alt="Hindware Faucets"
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
            Faucets
          </h1>
        </div>
      </section>

      {/* ── 2. Breadcrumb & Section Introduction ── */}
      <section
        data-header-theme="light"
        style={{
          padding: "48px 48px 44px",
          backgroundColor: "#ffffff",
          boxSizing: "border-box",
        }}
      >
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          style={{
            marginBottom: "32px",
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontSize: "13px",
            color: "#666666",
          }}
        >
          <Link href="/" style={{ color: "#777777", textDecoration: "none" }}>
            Home
          </Link>{" "}
          <span style={{ margin: "0 6px" }}>&gt;</span>{" "}
          <span style={{ color: "#777777" }}>Bathware</span>{" "}
          <span style={{ margin: "0 6px" }}>&gt;</span>{" "}
          <span style={{ color: "#111111", fontWeight: 500 }}>Faucets</span>
        </nav>

        {/* Page Title */}
        <h2
          style={{
            textAlign: "center",
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontSize: "clamp(26px, 3.2vw, 44px)",
            fontWeight: 500,
            lineHeight: 1.25,
            letterSpacing: "-0.03em",
            color: "#111111",
            maxWidth: "920px",
            margin: "0 auto",
          }}
        >
          Faucets — Precision Engineering with Timeless Style
        </h2>
      </section>

      {/* ── 3. 3-Card Showcase Grid ── */}
      <section
        data-header-theme="light"
        style={{
          padding: "0 48px 32px",
          backgroundColor: "#ffffff",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          {SHOWCASE_CARDS.map((card) => (
            <Link
              key={card.id}
              href={`/faucets/${card.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  position: "relative",
                  height: "560px",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
                className="group"
              >
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  unoptimized
                  style={{
                    objectFit: "cover",
                    objectPosition: "center",
                    transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  className="group-hover:scale-105"
                />

                {/* Bottom Gradient */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)",
                  }}
                />

                {/* Text content */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "32px",
                    left: "32px",
                    right: "32px",
                    zIndex: 2,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: " clamp(28px, 2.5vw, 38px)",
                      fontWeight: 600,
                      color: "#ffffff",
                      letterSpacing: "-0.03em",
                      margin: "0 0 8px",
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: "14px",
                      fontWeight: 400,
                      color: "rgba(255, 255, 255, 0.9)",
                      margin: 0,
                      lineHeight: 1.35,
                    }}
                  >
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4. 2-Card Medium Showcase Grid ── */}
      <section
        data-header-theme="light"
        style={{
          padding: "0 48px 64px",
          backgroundColor: "#ffffff",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px",
          }}
        >
          {FEATURE_CARDS.map((card) => (
            <Link
              key={card.id}
              href={`/faucets/${card.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  position: "relative",
                  height: "360px",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
                className="group"
              >
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  unoptimized
                  style={{
                    objectFit: "cover",
                    objectPosition: "center",
                    transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  className="group-hover:scale-105"
                />

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    bottom: "28px",
                    left: "28px",
                    right: "28px",
                    zIndex: 2,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: "clamp(26px, 2.2vw, 34px)",
                      fontWeight: 600,
                      color: "#ffffff",
                      letterSpacing: "-0.03em",
                      margin: "0 0 6px",
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: "14px",
                      fontWeight: 400,
                      color: "rgba(255, 255, 255, 0.9)",
                      margin: 0,
                      lineHeight: 1.35,
                    }}
                  >
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 5. Blogs Section ── */}
      <section
        data-header-theme="light"
        style={{
          padding: "48px 48px 80px",
          backgroundColor: "#ffffff",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "36px",
          }}
        >
          <div style={{ width: "120px" }} />
          <h2
            style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: "32px",
              fontWeight: 500,
              color: "#111111",
              letterSpacing: "-0.03em",
              textAlign: "center",
              margin: 0,
              flex: 1,
            }}
          >
            Blogs
          </h2>
          <a
            href="#"
            style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              color: "#111111",
              textDecoration: "underline",
              whiteSpace: "nowrap",
            }}
          >
            View All Blogs
          </a>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
          }}
        >
          {FAUCET_BLOGS.map((blog) => (
            <article key={blog.id} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1.6 / 1",
                  overflow: "hidden",
                  backgroundColor: "#f2f2f2",
                }}
                className="group cursor-pointer"
              >
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  unoptimized
                  style={{
                    objectFit: "cover",
                    transition: "transform 0.5s ease",
                  }}
                  className="group-hover:scale-105"
                />
              </div>

              <h3
                style={{
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: "20px",
                  fontWeight: 400,
                  color: "#111111",
                  lineHeight: 1.3,
                  letterSpacing: "-0.02em",
                  margin: 0,
                  cursor: "pointer",
                }}
              >
                {blog.title}
              </h3>
            </article>
          ))}
        </div>
      </section>

      {/* ── 6. Business Support & Footer ── */}
      <SupportLinksSection />
      <FooterSection />
    </main>
  );
}
