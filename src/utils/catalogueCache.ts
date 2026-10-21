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
  displayOrder?: number;
  productCount?: number;
  status?: string;
  isVisibleWebsite?: boolean;
}

export interface CachedHeaderConfig {
  logo?: string;
  mobileLogo?: string;
  menuVideo?: string;
  menuLinks?: Array<{ label: string; href: string }>;
}

const SESSION_STORAGE_KEY = "rn_redis_header_menu_v1";
const SESSION_CACHE_MAX_AGE_MS = 15 * 60 * 1000; // 15 minutes

let memoryCategories: CachedCategory[] | null = null;
let memorySubcategories: CachedCategory[] | null = null;
let memoryHeaderConfig: CachedHeaderConfig | null = null;
let preloadPromise: Promise<{
  header: CachedHeaderConfig | null;
  categories: CachedCategory[];
  subcategories: CachedCategory[];
}> | null = null;
let lastFetchedAt = 0;

type CacheListener = (payload: {
  header: CachedHeaderConfig | null;
  categories: CachedCategory[];
  subcategories: CachedCategory[];
}) => void;

const listeners = new Set<CacheListener>();
const preheatedUrls = new Set<string>();

function hydrateFromSessionStorage() {
  if (typeof window === "undefined") return;
  if (memoryCategories && memorySubcategories) return;
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;
    if (Array.isArray(parsed.categories) && parsed.categories.length > 0) {
      memoryCategories = parsed.categories;
    }
    if (Array.isArray(parsed.subcategories) && parsed.subcategories.length > 0) {
      memorySubcategories = parsed.subcategories;
    }
    if (parsed.header && typeof parsed.header === "object") {
      memoryHeaderConfig = parsed.header;
    }
    if (typeof parsed.savedAt === "number") {
      lastFetchedAt = parsed.savedAt;
    }
  } catch {
    // Ignore storage read errors
  }
}

function saveToSessionStorage() {
  if (typeof window === "undefined") return;
  try {
    if (memoryCategories && memorySubcategories) {
      window.sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({
          header: memoryHeaderConfig,
          categories: memoryCategories,
          subcategories: memorySubcategories,
          savedAt: Date.now(),
        })
      );
    }
  } catch {
    // Ignore storage quota errors
  }
}

function notifyListeners() {
  const payload = {
    header: memoryHeaderConfig,
    categories: memoryCategories || [],
    subcategories: memorySubcategories || [],
  };
  listeners.forEach((cb) => {
    try {
      cb(payload);
    } catch {}
  });
}

export function subscribeCatalogueCache(listener: CacheListener): () => void {
  hydrateFromSessionStorage();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCachedCategories(): CachedCategory[] | null {
  hydrateFromSessionStorage();
  return memoryCategories;
}

export function getCachedSubcategories(): CachedCategory[] | null {
  hydrateFromSessionStorage();
  return memorySubcategories;
}

export function getCachedHeaderConfig(): CachedHeaderConfig | null {
  hydrateFromSessionStorage();
  return memoryHeaderConfig;
}

export function setCachedCatalogue(
  cats: CachedCategory[],
  subs: CachedCategory[],
  header?: CachedHeaderConfig | null
) {
  if (Array.isArray(cats) && cats.length > 0) memoryCategories = cats;
  if (Array.isArray(subs) && subs.length > 0) memorySubcategories = subs;
  if (header) memoryHeaderConfig = header;
  lastFetchedAt = Date.now();
  saveToSessionStorage();
  notifyListeners();
}

/**
 * Synchronously retrieves category or subcategory data from memory in 0ms
 */
export function getCachedCategoryOrSubcategory(slugOrId: string): CachedCategory | null {
  hydrateFromSessionStorage();
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
 * Preloads banner and thumbnail images into browser cache (deduplicated)
 */
export function preheatImage(url?: string) {
  if (typeof window === "undefined" || !url || typeof url !== "string") return;
  const cleanUrl = url.trim();
  if (
    !cleanUrl ||
    preheatedUrls.has(cleanUrl) ||
    cleanUrl.includes("www.rnvalves.com") ||
    cleanUrl.includes("coresg-normal.trae.ai") ||
    cleanUrl.includes("uploads/catalogue")
  ) {
    return;
  }
  preheatedUrls.add(cleanUrl);
  const img = new window.Image();
  img.decoding = "async";
  img.src = cleanUrl;
}

/**
 * Pre-warms thumbnails for the "Our Products" menu drawer (Categories + 1st Category Subcategories)
 */
export function preheatOurProductsImages() {
  hydrateFromSessionStorage();
  if (!memoryCategories || memoryCategories.length === 0) return;

  // 1. Pre-warm all category thumbnails
  memoryCategories.slice(0, 8).forEach((cat) => {
    const thumb = cat.icon || cat.image;
    if (thumb) preheatImage(thumb);
  });

  // 2. Pre-warm first category's subcategory cards (shown immediately when "Our Products" is clicked)
  if (memorySubcategories && memorySubcategories.length > 0) {
    const firstCat = memoryCategories[0];
    const firstCatId = firstCat.id || firstCat._id;
    const firstSubs = memorySubcategories.filter(
      (sub) =>
        String(sub.categoryId) === String(firstCatId) ||
        (sub.categoryName &&
          firstCat.name &&
          sub.categoryName.toLowerCase().trim() === firstCat.name.toLowerCase().trim())
    );
    firstSubs.slice(0, 9).forEach((sub) => {
      if (sub.image) preheatImage(sub.image);
    });
  }
}

/**
 * Fetches the unified Redis-cached /api/header-menu bundle (deduplicated in-flight promise)
 */
export function preloadCatalogueData(forceRefresh = false) {
  hydrateFromSessionStorage();

  const isFresh =
    !forceRefresh &&
    memoryCategories &&
    memoryCategories.length > 0 &&
    memorySubcategories &&
    memorySubcategories.length > 0 &&
    Date.now() - lastFetchedAt < SESSION_CACHE_MAX_AGE_MS;

  if (isFresh) {
    return Promise.resolve({
      header: memoryHeaderConfig,
      categories: memoryCategories!,
      subcategories: memorySubcategories!,
    });
  }

  if (preloadPromise) {
    return preloadPromise;
  }

  preloadPromise = fetch("/api/header-menu")
    .then(async (res) => {
      if (!res.ok) throw new Error("Header menu bundle fetch failed");
      const bundle = await res.json();
      const cats = Array.isArray(bundle?.categories) ? bundle.categories : [];
      const subs = Array.isArray(bundle?.subcategories) ? bundle.subcategories : [];
      const hdr = bundle?.header || null;

      if (cats.length > 0 || subs.length > 0) {
        setCachedCatalogue(cats, subs, hdr);
      }
      return {
        header: memoryHeaderConfig,
        categories: memoryCategories || [],
        subcategories: memorySubcategories || [],
      };
    })
    .catch(async () => {
      // Fallback to individual endpoints if needed
      try {
        const [catRes, subRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/subcategories"),
        ]);
        const cats = catRes.ok ? await catRes.json() : [];
        const subs = subRes.ok ? await subRes.json() : [];
        if (Array.isArray(cats) && Array.isArray(subs)) {
          setCachedCatalogue(cats, subs);
        }
      } catch {}
      return {
        header: memoryHeaderConfig,
        categories: memoryCategories || [],
        subcategories: memorySubcategories || [],
      };
    })
    .finally(() => {
      preloadPromise = null;
    });

  return preloadPromise;
}
