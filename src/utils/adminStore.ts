import {
  AdminCategory,
  AdminSubcategory,
  AdminAttributeItem,
  AdminDiscount,
  AdminCataloguePdf,
  AdminEnquiry,
  AdminOrder,
  AdminProduct,
  AdminUser,
  AdminTheme,
} from "@/types/admin";

// ── Keys kept only for theme & auth (still browser-only) ──────────────────
const AUTH_KEY = "rn_admin_session";
const THEME_KEY = "rn_admin_theme";

const isClient = typeof window !== "undefined";

// ─────────────────────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────────────────────

export const getAdminTheme = (): AdminTheme => {
  if (!isClient) return "light";
  const stored = localStorage.getItem(THEME_KEY);
  return stored === "dark" ? "dark" : "light";
};

export const setAdminTheme = (theme: AdminTheme) => {
  if (!isClient) return;
  localStorage.setItem(THEME_KEY, theme);
  window.dispatchEvent(new Event("rn-theme-changed"));
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH SESSION
// ─────────────────────────────────────────────────────────────────────────────

export const getAdminAuth = (): AdminUser | null => {
  if (!isClient) return null;
  const stored = localStorage.getItem(AUTH_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }

  const clean = (val?: string) => String(val || "").replace(/\D/g, "").slice(-10);

  // Check fallback user session for 8737029643 or Admin userType
  const userSession = localStorage.getItem("rn_user_session");
  if (userSession) {
    try {
      const parsed = JSON.parse(userSession);
      if (clean(parsed.mobile) === "8737029643" || parsed.userType === "Admin" || parsed.role === "Super Admin" || parsed.userType === "Employee") {
        const adminUser: AdminUser = {
          email: parsed.email || "admin.aditya@rnvalves.com",
          name: parsed.name || "Super Admin (Aditya)",
          role: "Super Admin",
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(adminUser));
        return adminUser;
      }
    } catch {
      // ignore
    }
  }

  // Check fallback customer session for 8737029643 or Admin userType
  const customerSession = localStorage.getItem("rn_customer_session");
  if (customerSession) {
    try {
      const parsed = JSON.parse(customerSession);
      if (clean(parsed.mobile) === "8737029643" || parsed.userType === "Admin" || parsed.role === "Super Admin" || parsed.userType === "Employee") {
        const adminUser: AdminUser = {
          email: parsed.email || "admin.aditya@rnvalves.com",
          name: parsed.name || "Super Admin (Aditya)",
          role: "Super Admin",
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(adminUser));
        return adminUser;
      }
    } catch {
      // ignore
    }
  }

  return null;
};

export const setAdminAuth = (user: AdminUser | null) => {
  if (!isClient) return;
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem("rn_user_session");
    localStorage.removeItem("rn_customer_session");
  }
};

export const logoutAdmin = () => {
  if (!isClient) return;
  fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem("rn_user_session");
  localStorage.removeItem("rn_customer_session");
  document.cookie = "rn_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  window.dispatchEvent(new CustomEvent("customer-auth-changed"));
};

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS  →  /api/products
// ─────────────────────────────────────────────────────────────────────────────

export interface FetchProductsResponse {
  products: AdminProduct[];
  total?: number;
  page?: number;
  totalPages?: number;
}

export const getAdminProducts = async (params?: {
  q?: string;
  category?: string;
  subcategory?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<AdminProduct[]> => {
  try {
    const query = new URLSearchParams();
    if (params?.q) query.append("q", params.q);
    if (params?.category) query.append("category", params.category);
    if (params?.subcategory) query.append("subcategory", params.subcategory);
    if (params?.status) query.append("status", params.status);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());

    const url = `/api/products${query.toString() ? `?${query.toString()}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    return Array.isArray(data) ? data : data.products || [];
  } catch {
    return [];
  }
};

export const addAdminProduct = async (
  product: Partial<AdminProduct>
): Promise<AdminProduct | null> => {
  try {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return null;
  }
};

export const updateAdminProduct = async (
  id: string,
  updatedFields: Partial<AdminProduct>
): Promise<AdminProduct | null> => {
  try {
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields),
    });
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return null;
  }
};

export const deleteAdminProduct = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
};

// ── BULK OPERATIONS ──────────────────────────────────────────────────────────

export const bulkPerformProductAction = async (payload: {
  action: "delete" | "status" | "stock" | "category" | "brand" | "visibility" | "price";
  ids: string[];
  status?: string;
  stock?: number;
  category?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  brand?: string;
  isVisibleWebsite?: boolean;
  priceType?: "mrp" | "selling";
  priceValue?: number;
  isPercentage?: boolean;
}): Promise<boolean> => {
  try {
    const res = await fetch("/api/products/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
};


export const importProductsJSON = async (jsonData: unknown): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch("/api/products/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof jsonData === "string" ? jsonData : JSON.stringify(jsonData),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.error || "Import failed" };
    return { success: true, message: data.message || "Import completed" };
  } catch {
    return { success: false, message: "Import request failed" };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES & SUBCATEGORIES
// ─────────────────────────────────────────────────────────────────────────────

export const getAdminCategories = async (): Promise<AdminCategory[]> => {
  try {
    const res = await fetch("/api/categories?all=true");
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return [];
  }
};

export const getAdminCategoryBySlug = async (slug: string): Promise<AdminCategory | null> => {
  try {
    const res = await fetch(`/api/categories/${slug}`);
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return null;
  }
};

export interface AdminBPoint {
  id: string;
  modelType: string;
  modelId: string;
  name: string;
  createdAt?: string;
}

export const getAdminBPoints = async (modelId: string): Promise<AdminBPoint[]> => {
  try {
    const res = await fetch(`/api/bpoints?modelId=${modelId}`);
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return [];
  }
};

export const addAdminBPoint = async (payload: { modelId: string; name: string }): Promise<AdminBPoint | null> => {
  try {
    const res = await fetch("/api/bpoints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, modelType: "Category" }),
    });
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return null;
  }
};

export const deleteAdminBPoint = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/bpoints/${id}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
};

export const addAdminCategory = async (
  category: Partial<AdminCategory>
): Promise<AdminCategory | null> => {
  try {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(category),
    });
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    if (typeof window !== "undefined") window.dispatchEvent(new Event("rn-admin-data-changed"));
    return data;
  } catch {
    return null;
  }
};

export const updateAdminCategory = async (
  id: string,
  updatedFields: Partial<AdminCategory>
): Promise<AdminCategory | null> => {
  try {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields),
    });
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    if (typeof window !== "undefined") window.dispatchEvent(new Event("rn-admin-data-changed"));
    return data;
  } catch {
    return null;
  }
};

export const deleteAdminCategory = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok && typeof window !== "undefined") {
      window.dispatchEvent(new Event("rn-admin-data-changed"));
    }
    return res.ok;
  } catch {
    return false;
  }
};

export const getAdminSubcategories = async (categoryId?: string): Promise<AdminSubcategory[]> => {
  try {
    const url = categoryId ? `/api/subcategories?categoryId=${categoryId}&all=true` : "/api/subcategories?all=true";
    const res = await fetch(url);
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return [];
  }
};

export const getAdminSubcategoryBySlug = async (slug: string): Promise<AdminSubcategory | null> => {
  try {
    const res = await fetch(`/api/subcategories/${slug}`);
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return null;
  }
};

export const getAdminProductByCode = async (code: string): Promise<AdminProduct | null> => {
  try {
    const res = await fetch(`/api/products/${code}`);
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return null;
  }
};

export const addAdminSubcategory = async (
  subcategory: Partial<AdminSubcategory>
): Promise<AdminSubcategory | null> => {
  try {
    const res = await fetch("/api/subcategories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subcategory),
    });
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    if (typeof window !== "undefined") window.dispatchEvent(new Event("rn-admin-data-changed"));
    return data;
  } catch {
    return null;
  }
};

export const updateAdminSubcategory = async (
  id: string,
  updatedFields: Partial<AdminSubcategory>
): Promise<AdminSubcategory | null> => {
  try {
    const res = await fetch(`/api/subcategories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields),
    });
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    if (typeof window !== "undefined") window.dispatchEvent(new Event("rn-admin-data-changed"));
    return data;
  } catch {
    return null;
  }
};

export const deleteAdminSubcategory = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/subcategories/${id}`, { method: "DELETE" });
    if (res.ok && typeof window !== "undefined") {
      window.dispatchEvent(new Event("rn-admin-data-changed"));
    }
    return res.ok;
  } catch {
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ATTRIBUTES (Brands, Colors, Sizes, Materials)
// ─────────────────────────────────────────────────────────────────────────────

export const getAdminAttributes = async (type?: string): Promise<AdminAttributeItem[]> => {
  try {
    const url = type ? `/api/attributes?type=${type}` : "/api/attributes";
    const res = await fetch(url);
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return [];
  }
};

export const addAdminAttribute = async (
  attribute: Partial<AdminAttributeItem>
): Promise<AdminAttributeItem | null> => {
  try {
    const res = await fetch("/api/attributes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(attribute),
    });
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return null;
  }
};

export const deleteAdminAttribute = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/attributes?id=${id}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CATALOGUES & DISCOUNTS
// ─────────────────────────────────────────────────────────────────────────────

export const getAdminCatalogues = async (): Promise<AdminCataloguePdf[]> => {
  try {
    const res = await fetch("/api/catalogues");
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return [];
  }
};

export const addAdminCatalogue = async (
  catalogue: Partial<AdminCataloguePdf>
): Promise<AdminCataloguePdf | null> => {
  try {
    const res = await fetch("/api/catalogues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(catalogue),
    });
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return null;
  }
};

export const deleteAdminCatalogue = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/catalogues/${id}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
};

export const getAdminDiscounts = async (): Promise<AdminDiscount[]> => {
  try {
    const res = await fetch("/api/discounts");
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return [];
  }
};

export const addAdminDiscount = async (
  discount: Partial<AdminDiscount>
): Promise<AdminDiscount | null> => {
  try {
    const res = await fetch("/api/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discount),
    });
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return null;
  }
};

export const updateAdminDiscount = async (
  id: string,
  updatedFields: Partial<AdminDiscount>
): Promise<AdminDiscount | null> => {
  try {
    const res = await fetch(`/api/discounts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields),
    });
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return null;
  }
};

export const deleteAdminDiscount = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/discounts/${id}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS & ENQUIRIES
// ─────────────────────────────────────────────────────────────────────────────

export const getAdminOrders = async (): Promise<AdminOrder[]> => {
  try {
    const res = await fetch("/api/orders");
    if (!res.ok) throw new Error("fetch failed");
    const data = await res.json();
    return Array.isArray(data) ? data : data.orders || [];
  } catch {
    return [];
  }
};

export const createOrder = async (
  orderData: Omit<AdminOrder, "id" | "orderDate">
): Promise<AdminOrder | null> => {
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return null;
  }
};

export const updateOrderStatus = async (
  orderId: string,
  newStatus: AdminOrder["status"],
  paymentStatus?: AdminOrder["paymentStatus"]
): Promise<AdminOrder | null> => {
  try {
    const body: Partial<AdminOrder> = { status: newStatus };
    if (paymentStatus) body.paymentStatus = paymentStatus;
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return null;
  }
};

export const getAdminEnquiries = async (): Promise<AdminEnquiry[]> => {
  try {
    const res = await fetch("/api/enquiries");
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return [];
  }
};

export const updateEnquiryStatus = async (
  id: string,
  status: AdminEnquiry["status"]
): Promise<AdminEnquiry | null> => {
  try {
    const res = await fetch(`/api/enquiries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return null;
  }
};

// Legacy sync wrappers
export const saveAdminProducts = (_products: AdminProduct[]) => {};
export const saveAdminCategories = (_categories: AdminCategory[]) => {};

// ─────────────────────────────────────────────────────────────────────────────
// WEBSITE HOME SETTING API HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export const getAdminHomeSetting = async (): Promise<any> => {
  try {
    const res = await fetch("/api/home-setting");
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return null;
  }
};

export const updateAdminHomeSetting = async (payload: any): Promise<boolean> => {
  try {
    const res = await fetch("/api/home-setting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
};

const SERVER_UPLOAD_MAX_BYTES = 500 * 1024 * 1024; // Up to 500MB supported via direct binary stream

export const uploadFileToR2 = async (file: File, key: string): Promise<{ success: boolean; url?: string; key?: string; error?: string }> => {
  try {
    // 1. Prefer direct browser → R2 via presigned URL (bypasses server bandwidth)
    try {
      const presignedParams = new URLSearchParams({
        key,
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        size: String(file.size),
      });

      const presignedRes = await fetch(`/api/upload?${presignedParams.toString()}`);
      if (presignedRes.ok) {
        const presignedData = await presignedRes.json();
        if (presignedData.success && presignedData.presignedUrl) {
          const directUploadRes = await fetch(presignedData.presignedUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": presignedData.contentType || file.type || "application/octet-stream",
            },
          });

          if (directUploadRes.ok) {
            return {
              success: true,
              url: presignedData.publicUrl,
              key: presignedData.key,
            };
          }

          console.warn(
            "Presigned R2 PUT failed (likely CORS or network), falling back to binary stream upload:",
            directUploadRes.status,
            await directUploadRes.text().catch(() => "")
          );
        }
      } else {
        const errBody = await presignedRes.json().catch(() => null);
        console.warn("Presigned URL request failed:", presignedRes.status, errBody?.error);
      }
    } catch (presignedErr) {
      console.warn("Presigned upload attempt failed, falling back to server upload:", presignedErr);
    }

    // 2. Fallback: Direct binary stream POST (bypasses all multipart FormData parser limits up to 500MB)
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "x-file-key": encodeURIComponent(key),
        "x-file-name": encodeURIComponent(file.name),
        "content-type": file.type || "application/octet-stream",
      },
      body: file,
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { success: false, error: data?.error || `Upload failed (Status ${res.status})` };
    }
    return data || { success: false, error: "Empty response from upload API" };
  } catch (err: any) {
    return { success: false, error: err?.message || "Network error during upload" };
  }
};

export const deleteFileFromR2 = async (key: string): Promise<boolean> => {
  try {
    const res = await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    return res.ok;
  } catch {
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ABOUT PAGE SETTING API HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export const getAdminAboutSetting = async (): Promise<any> => {
  try {
    const res = await fetch("/api/about-setting");
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return null;
  }
};

export const updateAdminAboutSetting = async (payload: any): Promise<boolean> => {
  try {
    const res = await fetch("/api/about-setting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SIZE MASTER API HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminSizeItem {
  _id?: string;
  idNumeric: number;
  code: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const getAdminSizes = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  exportAll?: boolean;
} = {}): Promise<{
  sizes: AdminSizeItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  try {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.sortField) query.set("sortField", params.sortField);
    if (params.sortOrder) query.set("sortOrder", params.sortOrder);
    if (params.exportAll) query.set("export", "true");

    const res = await fetch(`/api/sizes?${query.toString()}`);
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return { sizes: [], total: 0, page: 1, limit: 10, totalPages: 1 };
  }
};

export const addAdminSize = async (payload: { name: string }): Promise<AdminSizeItem | null> => {
  try {
    const res = await fetch("/api/sizes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return null;
  }
};

export const updateAdminSize = async (payload: { id: string; name: string; status?: string }): Promise<AdminSizeItem | null> => {
  try {
    const res = await fetch("/api/sizes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return null;
  }
};

export const deleteAdminSize = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/sizes?id=${id}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// COLOR MASTER API HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminColorItem {
  _id?: string;
  idNumeric: number;
  code: string;
  name: string;
  icon?: string;
  hexCode?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const getAdminColors = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  exportAll?: boolean;
} = {}): Promise<{
  colors: AdminColorItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  try {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.sortField) query.set("sortField", params.sortField);
    if (params.sortOrder) query.set("sortOrder", params.sortOrder);
    if (params.exportAll) query.set("export", "true");

    const res = await fetch(`/api/colors?${query.toString()}`);
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return { colors: [], total: 0, page: 1, limit: 10, totalPages: 1 };
  }
};

export const addAdminColor = async (payload: { name: string; icon?: string; hexCode?: string }): Promise<AdminColorItem | null> => {
  try {
    const res = await fetch("/api/colors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return null;
  }
};

export const updateAdminColor = async (payload: { id: string; name: string; icon?: string; hexCode?: string; status?: string }): Promise<AdminColorItem | null> => {
  try {
    const res = await fetch("/api/colors", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
  } catch {
    return null;
  }
};

export const deleteAdminColor = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/colors?id=${id}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
};




