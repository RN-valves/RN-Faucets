import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { getOrSetCache } from "@/lib/redis";

const BASE_URL = "https://rnvalves.com";

function slugifySegment(str: string): string {
  return (
    String(str || "collection")
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "collection"
  );
}

async function getProductSeoData(productId: string) {
  const decoded = decodeURIComponent(productId || "").trim();
  if (!decoded) return null;

  const { data } = await getOrSetCache(
    `seo:product:${decoded.toLowerCase()}`,
    300,
    async () => {
      await connectDB();
      const product: any = await Product.findOne({
        $or: [
          { id: decoded },
          { slug: decoded },
          { code: decoded },
        ],
      })
        .select(
          "id slug name code category subcategory price mrp status image gallery description color warranty"
        )
        .lean();
      return product || null;
    }
  );
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; productId: string }>;
}): Promise<Metadata> {
  try {
    const { category, productId } = await params;
    const product = await getProductSeoData(productId);

    if (!product) {
      return {
        title: "Product Details | RN Valves & Faucets",
        description:
          "Explore premium bath fittings, faucets, showers, and sanitaryware by RN Valves & Faucets.",
      };
    }

    const title = `${product.name}${product.code ? ` (${product.code})` : ""} | RN Valves & Faucets`;
    const description =
      product.description?.slice(0, 160) ||
      `Buy ${product.name}${product.color ? ` in ${product.color} finish` : ""} online from RN Valves & Faucets. Premium ${product.subcategory || product.category || "bath fittings"} with ${product.warranty || "assured manufacturer warranty"}.`;
    const catSlug = slugifySegment(
      category || product.subcategory || product.category || "collection"
    );
    const canonicalUrl = `${BASE_URL}/faucets/${catSlug}/${encodeURIComponent(
      product.slug || product.id || productId
    )}`;
    const primaryImage =
      product.image ||
      (Array.isArray(product.gallery) && product.gallery[0]) ||
      "/images/logo/RN-Logo.png";
    const absoluteImage = primaryImage.startsWith("http")
      ? primaryImage
      : `${BASE_URL}${primaryImage.startsWith("/") ? "" : "/"}${primaryImage}`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: "RN Valves & Faucets",
        images: [
          {
            url: absoluteImage,
            alt: product.name,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [absoluteImage],
      },
    };
  } catch {
    return {
      title: "Product Details | RN Valves & Faucets",
    };
  }
}

export default async function ProductDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ category: string; productId: string }>;
}) {
  let jsonLd: Record<string, any> | null = null;

  try {
    const { category, productId } = await params;
    const product = await getProductSeoData(productId);
    if (product) {
      const catSlug = slugifySegment(
        category || product.subcategory || product.category || "collection"
      );
      const canonicalUrl = `${BASE_URL}/faucets/${catSlug}/${encodeURIComponent(
        product.slug || product.id || productId
      )}`;
      const primaryImage =
        product.image ||
        (Array.isArray(product.gallery) && product.gallery[0]) ||
        "/images/logo/RN-Logo.png";
      const absoluteImage = primaryImage.startsWith("http")
        ? primaryImage
        : `${BASE_URL}${primaryImage.startsWith("/") ? "" : "/"}${primaryImage}`;

      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        sku: product.code || product.id,
        image: [absoluteImage],
        description:
          product.description ||
          `${product.name} by RN Valves & Faucets (${product.subcategory || product.category || "Bath Fittings"})`,
        brand: {
          "@type": "Brand",
          name: "RN Valves & Faucets",
        },
        offers: {
          "@type": "Offer",
          url: canonicalUrl,
          priceCurrency: "INR",
          price: Number(product.price || product.mrp || 0),
          availability:
            product.status === "Out of Stock"
              ? "https://schema.org/OutOfStock"
              : "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
        },
      };
    }
  } catch {
    // Ignore SSR schema errors and render children normally
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
