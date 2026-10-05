export interface CachedCategory {
  _id?: string;
  id: string;
  name: string;
  slug: string;
  image?: string;
  banner?: string;
  icon?: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
}

let memoryCategories: CachedCategory[] | null = null;
let memorySubcategories: CachedCategory[] | null = null;
let isPreloading = false;

export function getCachedCategories(): CachedCategory[] | null {
  return memoryCategories;
}

export function getCachedSubcategories(): CachedCategory[] | null {
  return memorySubcategories;
}

export function setCachedCatalogue(cats: CachedCategory[], subs: CachedCategory[]) {
  if (Array.isArray(cats) && cats.length > 0) memoryCategories = cats;
  if (Array.isArray(subs) && subs.length > 0) memorySubcategories = subs;
}

/**
 * Synchronously retrieves category or subcategory data from memory in 0ms
 */
export function getCachedCategoryOrSubcategory(slugOrId: string): CachedCategory | null {
  if (!slugOrId || slugOrId === "all") return null;
  const target = String(slugOrId).toLowerCase().trim();

  // 1. Search in subcategories
  if (memorySubcategories && memorySubcategories.length > 0) {
    const foundSub = memorySubcategories.find(
      (s) =>
        String(s.slug || "").toLowerCase().trim() === target ||
        String(s.id || "").toLowerCase().trim() === target ||
        String(s._id || "").toLowerCase().trim() === target
    );
    if (foundSub) return foundSub;
  }

  // 2. Search in categories
  if (memoryCategories && memoryCategories.length > 0) {
    const foundCat = memoryCategories.find(
      (c) =>
        String(c.slug || "").toLowerCase().trim() === target ||
        String(c.id || "").toLowerCase().trim() === target ||
        String(c._id || "").toLowerCase().trim() === target
    );
    if (foundCat) return foundCat;
  }

  return null;
}

/**
 * Preloads banner and thumbnail images into browser cache
 */
export function preheatImage(url?: string) {
  if (typeof window === "undefined" || !url || typeof url !== "string") return;
  const cleanUrl = url.trim();
  if (!cleanUrl || cleanUrl.includes("www.rnvalves.com") || cleanUrl.includes("uploads/catalogue")) return;
  const img = new window.Image();
  img.src = cleanUrl;
}

/**
 * Asynchronously preloads categories & subcategories and pre-warms all banner images
 */
export function preloadCatalogueData() {
  if (memoryCategories && memorySubcategories) return;
  if (isPreloading) return;
  isPreloading = true;

  Promise.all([
    fetch("/api/categories").then((r) => (r.ok ? r.json() : [])),
    fetch("/api/subcategories").then((r) => (r.ok ? r.json() : [])),
  ])
    .then(([cats, subs]) => {
      if (Array.isArray(cats) && cats.length > 0) memoryCategories = cats;
      if (Array.isArray(subs) && subs.length > 0) memorySubcategories = subs;
    })
    .catch(() => {})
    .finally(() => {
      isPreloading = false;
    });
}
