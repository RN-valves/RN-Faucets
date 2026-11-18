"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";

export default function NotFound() {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function resolveLegacyPath() {
      try {
        const segments = pathname
          .split("/")
          .map((s) => decodeURIComponent(s).trim())
          .filter(Boolean);

        if (segments.length === 0) {
          setIsCheckingRedirect(false);
          return;
        }

        const lastSegment = segments[segments.length - 1].replace(/\.(php|html|htm)$/i, "");
        const prevSegment =
          segments.length >= 2 ? segments[segments.length - 2].replace(/\.(php|html|htm)$/i, "") : "";

        // 1. Check if last segment is a valid Product (by urlKey, SKU code, or ID)
        const prodRes = await fetch(`/api/products/${encodeURIComponent(lastSegment)}`);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (prodData && !prodData.error && !cancelled) {
            const subSlug =
              String(
                prodData.subcategorySlug ||
                  prodData.subcategoryName ||
                  prevSegment ||
                  prodData.category ||
                  "collection"
              )
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "") || "collection";
            const prodId = prodData.code || prodData.skuCode || prodData.id || lastSegment;
            router.replace(`/faucets/${encodeURIComponent(subSlug)}/${encodeURIComponent(prodId)}`);
            return;
          }
        }

        // 2. Check if last segment is a valid Subcategory
        const subRes = await fetch(`/api/subcategories/${encodeURIComponent(lastSegment)}`);
        if (subRes.ok) {
          const subData = await subRes.json();
          if (subData && !subData.error && !cancelled) {
            router.replace(`/faucets/${encodeURIComponent(subData.slug || lastSegment)}`);
            return;
          }
        }

        // 3. Check if last segment is a valid Category
        const catRes = await fetch(`/api/categories/${encodeURIComponent(lastSegment)}`);
        if (catRes.ok) {
          const catData = await catRes.json();
          if (catData && !catData.error && !cancelled) {
            router.replace(`/${encodeURIComponent(catData.slug || lastSegment)}`);
            return;
          }
        }

        // 4. Keyword search fallback from URL slug (e.g. "/bib-cock-long-body")
        const cleanQuery = lastSegment
          .replace(/[-_]+/g, " ")
          .replace(/\b(index|php|html|product|products|category|faucets)\b/gi, "")
          .trim();

        if (cleanQuery.length >= 3) {
          const searchRes = await fetch(`/api/products?q=${encodeURIComponent(cleanQuery)}&limit=5`);
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            const items = searchData.products || searchData;
            if (Array.isArray(items) && items.length > 0 && !cancelled) {
              if (items.length === 1) {
                const p = items[0];
                const subSlug =
                  String(p.subcategorySlug || p.subcategoryName || p.category || "collection")
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "") || "collection";
                router.replace(
                  `/faucets/${encodeURIComponent(subSlug)}/${encodeURIComponent(p.code || p.skuCode || p.id)}`
                );
                return;
              }
              router.replace(`/faucets/all?q=${encodeURIComponent(cleanQuery)}`);
              return;
            }
          }
        }
      } catch (e) {
        console.error("Legacy URL resolution error:", e);
      } finally {
        if (!cancelled) {
          setIsCheckingRedirect(false);
        }
      }
    }

    resolveLegacyPath();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return (
    <main style={{ width: "100%", minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <Header />
      <section
        data-header-theme="light"
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "160px 24px 120px",
          textAlign: "center",
          fontFamily: "'Manrope', system-ui, sans-serif",
        }}
      >
        {isCheckingRedirect ? (
          <>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#0f172a", marginBottom: "12px" }}>
              Opening Product Page...
            </h1>
            <p style={{ fontSize: "15px", color: "#64748b" }}>
              Redirecting you to the matching RN Valves &amp; Faucets product...
            </p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
              Page Not Found
            </h1>
            <p style={{ fontSize: "15px", color: "#64748b", lineHeight: 1.6, marginBottom: "28px" }}>
              The link you followed may be outdated or moved. Explore our complete range of faucets, showers, valves, and bathroom accessories below.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/faucets/all"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px 26px",
                  borderRadius: "8px",
                  background: "#0f172a",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Browse All Products
              </Link>
              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px 26px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#0f172a",
                  fontSize: "14px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Go to Homepage
              </Link>
            </div>
          </>
        )}
      </section>
      <FooterSection />
    </main>
  );
}
