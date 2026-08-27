/**
 * Spatie-style Role-Based Access Control (RBAC) Library for Next.js
 * Mirrors Spatie laravel-permission behavior from the reference Laravel PHP app.
 */

export interface RBACUser {
  _id?: string;
  role?: string;
  userType?: string;
  permissions?: string[];
}

// Spatie-equivalent predefined Roles & default Permissions mapping
export const SPATIE_ROLES_MAP: Record<string, string[]> = {
  "Super Admin": ["all"],
  "Admin": ["all"],
  "Catalogue Manager": [
    "catalogue.view",
    "catalogue.edit",
    "catalogue.delete",
    "categories.manage",
    "subcategories.manage",
    "product_images.upload",
  ],
  "Order Dispatcher": [
    "orders.view",
    "orders.update_status",
    "shipping_tracking.manage",
  ],
  "Customer Support Manager": [
    "customers.view",
    "customers.approve",
    "customers.reject",
    "enquiries.view",
    "enquiries.resolve",
  ],
  "Distributor": [
    "catalogue.view",
    "orders.create",
    "orders.view_own",
    "b2b_pricing.view",
    "catalogues_pdf.download",
  ],
  "Dealer": [
    "catalogue.view",
    "orders.create",
    "orders.view_own",
    "b2b_pricing.view",
  ],
  "Architect": [
    "catalogue.view",
    "catalogues_pdf.download",
    "high_res_renderings.view",
  ],
  "Contractor": [
    "catalogue.view",
    "orders.create",
    "orders.view_own",
  ],
  "Customer": [
    "catalogue.view",
    "orders.create",
    "orders.view_own",
  ],
};

/**
 * Check if user has a specific permission (Spatie: $user->hasPermissionTo('permission-name'))
 */
export function hasPermission(user: RBACUser | null | undefined, permission: string): boolean {
  if (!user) return false;

  // Super Admin / Admin role bypasses all checks
  if (user.role === "Super Admin" || user.role === "Admin" || user.userType === "Admin") {
    return true;
  }

  // Explicit user permissions array check
  if (user.permissions && Array.isArray(user.permissions)) {
    if (user.permissions.includes("all") || user.permissions.includes("*")) return true;
    if (user.permissions.includes(permission)) return true;
  }

  // Fallback check against user's assigned role
  if (user.role && SPATIE_ROLES_MAP[user.role]) {
    const rolePerms = SPATIE_ROLES_MAP[user.role];
    if (rolePerms.includes("all") || rolePerms.includes("*") || rolePerms.includes(permission)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if user has a specific role (Spatie: $user->hasRole('RoleName'))
 */
export function hasRole(user: RBACUser | null | undefined, roleName: string): boolean {
  if (!user) return false;
  if (user.role === "Super Admin" || user.role === "Admin") return true;
  return user.role === roleName || user.userType === roleName;
}

/**
 * Check if user has ANY of the specified permissions (Spatie: $user->hasAnyPermission([...]))
 */
export function hasAnyPermission(user: RBACUser | null | undefined, permissions: string[]): boolean {
  if (!user) return false;
  return permissions.some((perm) => hasPermission(user, perm));
}

/**
 * Check if user has ALL of the specified permissions (Spatie: $user->hasAllPermissions([...]))
 */
export function hasAllPermissions(user: RBACUser | null | undefined, permissions: string[]): boolean {
  if (!user) return false;
  return permissions.every((perm) => hasPermission(user, perm));
}
