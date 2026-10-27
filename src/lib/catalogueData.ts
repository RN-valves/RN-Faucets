import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import Subcategory from "@/models/Subcategory";
import Product from "@/models/Product";
import HomeSetting from "@/models/HomeSetting";
import { getOrSetCache, invalidateCache, CacheStatus } from "@/lib/redis";

export const REDIS_CACHE_KEYS = {
  HEADER_MENU_BUNDLE: "rn:header:menu-bundle:v1",
  CATEGORIES_PUBLIC: "rn:catalogue:categories:public:v1",
  SUBCATEGORIES_PUBLIC: "rn:catalogue:subcategories:public:v1",
  HOME_SETTING: "rn:home:settings:v1",
} as const;

export const DEFAULT_HEADER_CONFIG = {
  logo: "/rn-header-logo.svg",
  mobileLogo: "/rn-header-logo.svg",
  menuVideo: "https://jalbath.com/wp-content/uploads/2026/07/Faucet.gif",
  menuLinks: [
    { label: "About Us", href: "/about-us" },
    { label: "Catalogues", href: "/catalogues" },
    { label: "Become A Channel Partner", href: "/business-user-registration" },
    { label: "Blogs", href: "/blogs" },
    { label: "Contact Us", href: "/contact-us" },
  ],
};

// Cache TTL: 30 minutes in Redis, 2 minutes in L1 in-memory buffer
const CATALOGUE_REDIS_TTL_SECONDS = 30 * 60;
const CATALOGUE_L1_TTL_SECONDS = 2 * 60;

export async function getPublicCategoriesCached(): Promise<{
  data: any[];
  cacheStatus: CacheStatus;
}> {
  return getOrSetCache(
    REDIS_CACHE_KEYS.CATEGORIES_PUBLIC,
    CATALOGUE_REDIS_TTL_SECONDS,
    async () => {
      await connectDB();

      const filter: Record<string, unknown> = {
        status: { $ne: "Inactive" },
        isVisibleWebsite: { $ne: false },
      };

      const [rawCategories, counts] = await Promise.all([
        Category.find(filter)
          .select("id name slug image banner icon description displayOrder status isVisibleWebsite createdAt")
          .sort({ createdAt: -1 })
          .lean(),
        Product.aggregate([
          { $group: { _id: "$category", count: { $sum: 1 } } },
        ]),
      ]);

      const categories = rawCategories.sort((a: any, b: any) => {
        const orderA = a.displayOrder && a.displayOrder > 0 ? a.displayOrder : 999999;
        const orderB = b.displayOrder && b.displayOrder > 0 ? b.displayOrder : 999999;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });

      const countMap = new Map<string, number>();
      counts.forEach((c) => {
        if (c._id) countMap.set(c._id.toString().toLowerCase().trim(), c.count);
      });

      return categories.map((cat: any) => {
        const nameKey = (cat.name || "").toLowerCase().trim();
        const slugKey = (cat.slug || "").toLowerCase().trim();
        const count = countMap.get(nameKey) || countMap.get(slugKey) || 0;
        return {
          ...cat,
          _id: String(cat._id || cat.id || ""),
          productCount: count,
        };
      });
    },
    CATALOGUE_L1_TTL_SECONDS
  );
}

export async function getPublicSubcategoriesCached(): Promise<{
  data: any[];
  cacheStatus: CacheStatus;
}> {
  return getOrSetCache(
    REDIS_CACHE_KEYS.SUBCATEGORIES_PUBLIC,
    CATALOGUE_REDIS_TTL_SECONDS,
    async () => {
      await connectDB();

      const filter: Record<string, unknown> = {
        status: { $ne: "Inactive" },
        isVisibleWebsite: { $ne: false },
      };

      const [subcategories, counts] = await Promise.all([
        Subcategory.find(filter)
          .select("id name slug categoryId categoryName image banner description displayOrder status isVisibleWebsite createdAt")
          .sort({ displayOrder: 1, createdAt: -1 })
          .lean(),
        Product.aggregate([
          { $group: { _id: "$subcategoryName", count: { $sum: 1 } } },
        ]),
      ]);

      const countMap = new Map<string, number>();
      counts.forEach((c) => {
        if (c._id) countMap.set(c._id.toString().toLowerCase().trim(), c.count);
      });

      return subcategories.map((sub: any) => {
        const nameKey = (sub.name || "").toLowerCase().trim();
        const count = countMap.get(nameKey) || 0;
        return {
          ...sub,
          _id: String(sub._id || sub.id || ""),
          productCount: count,
        };
      });
    },
    CATALOGUE_L1_TTL_SECONDS
  );
}

export async function getHeaderMenuBundleCached(): Promise<{
  data: {
    header: typeof DEFAULT_HEADER_CONFIG;
    categories: any[];
    subcategories: any[];
    cachedAt: string;
  };
  cacheStatus: CacheStatus;
}> {
  return getOrSetCache(
    REDIS_CACHE_KEYS.HEADER_MENU_BUNDLE,
    CATALOGUE_REDIS_TTL_SECONDS,
    async () => {
      await connectDB();

      const [settingDoc, catsResult, subsResult] = await Promise.all([
        HomeSetting.findOne().select("header").lean() as Promise<any>,
        getPublicCategoriesCached(),
        getPublicSubcategoriesCached(),
      ]);

      const header = {
        ...DEFAULT_HEADER_CONFIG,
        ...(settingDoc?.header || {}),
      };

      return {
        header,
        categories: catsResult.data,
        subcategories: subsResult.data,
        cachedAt: new Date().toISOString(),
      };
    },
    CATALOGUE_L1_TTL_SECONDS
  );
}

export async function invalidateCatalogueAndHeaderCache(): Promise<void> {
  await invalidateCache([
    "rn:header:",
    "rn:catalogue:",
    "rn:home:",
  ]);
  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
  } catch {
    // Ignore when called outside Next.js request context
  }
}
