import {
  LayoutDashboard,
  Settings,
  Sliders,
  Layers,
  BarChart3,
  Users,
  MessageSquare,
  ShoppingCart,
  CreditCard,
  Briefcase,
  BookOpen,
  Newspaper,
  Tag,
  FileText,
} from "lucide-react";
import React from "react";

export interface SidebarSubItem {
  id: string;
  label: string;
  href: string;
  badge?: string | number;
  countKey?: string;
}

export interface SidebarNavItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ElementType;
  badge?: string | number;
  countKey?: string;
  sectionHeader?: string;
  children?: SidebarSubItem[];
}

export const adminNavigationConfig: SidebarNavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "settings",
    label: "Settings",
    href: "/admin/settings?tab=countries",
    icon: Settings,
    children: [
      { id: "countries", label: "Countries", href: "/admin/settings?tab=countries", countKey: "countries", badge: 1 },
      { id: "states", label: "States", href: "/admin/settings?tab=states", countKey: "states", badge: 37 },
      { id: "cities", label: "Cities", href: "/admin/settings?tab=cities", countKey: "cities", badge: 783 },
      { id: "pincodes", label: "Pincodes", href: "/admin/settings?tab=pincodes", countKey: "pincodes", badge: 19407 },
      { id: "brands", label: "Brands", href: "/admin/attributes?type=Brand", countKey: "brands", badge: 4 },
      { id: "shipping", label: "Shipping Weight Charges", href: "/admin/settings?tab=shipping", countKey: "shipping", badge: 1 },
    ],
  },
  {
    id: "master",
    label: "Master",
    href: "/admin/settings?tab=users",
    icon: Sliders,
    children: [
      { id: "users", label: "Users", href: "/admin/users", countKey: "users", badge: 10 },
      { id: "permissions", label: "Permissions", href: "/admin/users?tab=permissions" },
      { id: "roles", label: "User Roles", href: "/admin/users?tab=roles" },
      { id: "remarks", label: "Remarks", href: "/admin/settings?tab=remarks", countKey: "remarks", badge: 19 },
      { id: "materials", label: "Materials", href: "/admin/attributes?type=Material", countKey: "materials", badge: 10 },
      { id: "website_banner", label: "Website Banner", href: "/admin/settings/home", countKey: "banners", badge: 5 },
      { id: "discount_code", label: "Discount Code", href: "/admin/discounts", countKey: "discount_code", badge: 10 },
    ],
  },
  {
    id: "catalogue",
    label: "Catalogue",
    href: "/admin/catalogue/categories",
    icon: Layers,
    children: [
      { id: "content_master", label: "Content Master", href: "/admin/attributes?type=Content", countKey: "content", badge: 6 },
      { id: "catalogue_pdf", label: "Catalogue PDF", href: "/admin/catalogues", countKey: "catalogue", badge: 98 },
      { id: "size_master", label: "Size Master", href: "/admin/sizes", countKey: "size", badge: 182 },
      { id: "color_master", label: "Color Master", href: "/admin/colors", countKey: "color", badge: 68 },
      { id: "product_bullets", label: "Product Bullet Points", href: "/admin/attributes?type=Bullets", countKey: "bullets", badge: 527 },
      { id: "category", label: "Category", href: "/admin/catalogue/categories", countKey: "category", badge: 15 },
      { id: "subcategory", label: "SubCategory", href: "/admin/catalogue/subcategories", countKey: "subcategory", badge: 121 },
      { id: "products", label: "Products", href: "/admin/catalogue/products", countKey: "products", badge: 7341 },
      { id: "product_images", label: "Product Images", href: "/admin/catalogue/product-images", countKey: "productImages", badge: 13976 },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    children: [
      { id: "remark_logs", label: "Remark Logs", href: "/admin/reports?tab=remarks", countKey: "remark_logs", badge: 1555 },
      { id: "order_reports", label: "Orders", href: "/admin/reports?tab=orders" },
      { id: "product_report", label: "Product Report", href: "/admin/reports?tab=products" },
    ],
  },
  {
    id: "others_section",
    sectionHeader: "OTHERS",
    label: "",
  },
  {
    id: "customer_network",
    label: "Customer Network",
    href: "/admin/customers",
    icon: Users,
    countKey: "customers",
    badge: 960,
  },
  {
    id: "enquiries",
    label: "Enquiries",
    href: "/admin/enquiries",
    icon: MessageSquare,
    badge: 471,
  },
  {
    id: "orders",
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    badge: 696,
  },
  {
    id: "payments",
    label: "Payments",
    href: "/admin/orders?tab=payments",
    icon: CreditCard,
    badge: 515,
  },
  {
    id: "careers",
    label: "Jobs/Careers",
    href: "/admin/settings?tab=careers",
    icon: Briefcase,
    badge: 0,
  },
  {
    id: "blogs",
    label: "Blogs",
    href: "/admin/blogs",
    icon: BookOpen,
    badge: 46,
    countKey: "blogs",
  },
  {
    id: "news",
    label: "News",
    href: "/admin/news",
    icon: Newspaper,
    badge: 5,
    countKey: "news",
  },
  {
    id: "bullet_points",
    label: "Bullet Points",
    href: "/admin/attributes?type=Bullets",
    icon: Tag,
    badge: 3,
  },
  {
    id: "content_settings_section",
    sectionHeader: "CONTENT SETTINGS",
    label: "",
  },
  {
    id: "content_settings",
    label: "Content Settings",
    icon: Settings,
    children: [
      { id: "website_home", label: "Website Home Setting", href: "/admin/settings/home" },
      { id: "website_photos", label: "Website Photos & Assets", href: "/admin/settings/photos" },
      { id: "about_us", label: "About Us", href: "/admin/settings/about" },
      { id: "pages", label: "Pages", href: "/admin/settings?tab=pages" },
      { id: "faqs", label: "FAQs", href: "/admin/settings?tab=faqs" },
    ],
  },
];
