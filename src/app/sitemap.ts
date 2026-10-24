import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import Subcategory from "@/models/Subcategory";
import Product from "@/models/Product";
import Blog from "@/models/Blog";

export const revalidate = 3600; // Revalidate sitemap every 1 hour

const BASE_URL = "https://rnvalves.com";

function slugifySegment(str: string): string {
  return String(str || "collection")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "collection";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about-us`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faucets`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/catalogues`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blogs`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact-us`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/business-user-registration`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/retail-user-registration`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/store-locator`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/career`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/certificates`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/corporate-social-responsibility`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/return-refund-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/terms-conditions`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  try {
    await connectDB();

    const [categories, subcategories, products, blogs] = await Promise.all([
      Category.find({
        status: { $ne: "Inactive" },
        isVisibleWebsite: { $ne: false },
      })
        .select("slug id name updatedAt")
        .lean(),
      Subcategory.find({
        status: { $ne: "Inactive" },
        isVisibleWebsite: { $ne: false },
      })
        .select("slug id name updatedAt")
        .lean(),
      Product.find({
        status: { $ne: "Out of Stock" },
        isVisibleWebsite: { $ne: false },
      })
        .select("id slug category subcategory updatedAt")
        .limit(10000)
        .lean(),
      Blog.find({ status: "Published" })
        .select("slug id updatedAt publishedAt")
        .lean(),
    ]);

    const categoryUrls: MetadataRoute.Sitemap = (categories || [])
      .filter((c: any) => Boolean(c.slug || c.id))
      .map((c: any) => {
        const slugOrId = c.slug || c.id;
        const lastMod = c.updatedAt ? new Date(c.updatedAt) : now;
        return {
          url: `${BASE_URL}/faucets/${slugOrId}`,
          lastModified: lastMod,
          changeFrequency: "weekly" as const,
          priority: 0.85,
        };
      });

    const subcategoryUrls: MetadataRoute.Sitemap = (subcategories || [])
      .filter((s: any) => Boolean(s.slug || s.id))
      .map((s: any) => ({
        url: `${BASE_URL}/faucets/${s.slug || s.id}`,
        lastModified: s.updatedAt ? new Date(s.updatedAt) : now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

    const productUrls: MetadataRoute.Sitemap = (products || [])
      .filter((p: any) => Boolean(p.slug || p.id))
      .map((p: any) => {
        const catSlug = slugifySegment(p.subcategory || p.category || "collection");
        const prodSlug = encodeURIComponent(String(p.slug || p.id));
        return {
          url: `${BASE_URL}/faucets/${catSlug}/${prodSlug}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
          changeFrequency: "weekly" as const,
          priority: 0.75,
        };
      });

    const blogUrls: MetadataRoute.Sitemap = (blogs || [])
      .filter((b: any) => Boolean(b.slug || b.id))
      .map((b: any) => ({
        url: `${BASE_URL}/blogs/${b.slug || b.id}`,
        lastModified: b.updatedAt
          ? new Date(b.updatedAt)
          : b.publishedAt
          ? new Date(b.publishedAt)
          : now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));

    // Deduplicate URLs
    const seen = new Set<string>();
    const allEntries: MetadataRoute.Sitemap = [];
    for (const item of [
      ...staticRoutes,
      ...categoryUrls,
      ...subcategoryUrls,
      ...blogUrls,
      ...productUrls,
    ]) {
      if (!seen.has(item.url)) {
        seen.add(item.url);
        allEntries.push(item);
      }
    }

    return allEntries;
  } catch (err) {
    console.error("Sitemap generation fallback:", err);
    return staticRoutes;
  }
}
