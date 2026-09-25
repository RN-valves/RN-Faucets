export type AdminTheme = "light" | "dark";

export interface AdminProduct {
  id: string;
  name: string;
  code: string;
  price: number;
  originalPrice: number;
  image: string;
  gallery: string[];
  category: string;
  subcategoryId?: string;
  subcategoryName?: string;
  brand?: string;
  material?: string;
  colorName?: string;
  colorIcon?: string;
  size?: string;
  article?: string;
  skuCode?: string;
  hsn?: string;
  saleType?: string;

  // Multi-tier / Multi-currency Pricing
  inMrp?: number;
  inSelling?: number;
  inV1Mrp?: number;
  othMrp?: number;
  othSelling?: number;
  othV1Mrp?: number;

  // Inventory & Logistics Specs
  stock: number;
  ctnPcs?: number;
  midCtnPcs?: number;
  innerPcs?: number;
  stockPcs?: number;
  moq?: number;
  onlyProductWtGm?: number;
  productLength?: number;
  productBreadth?: number;
  productHeight?: number;
  residentialWarranty?: number;
  commercialWarranty?: number;
  videoUrl?: string;
  amazonLink?: string;
  flipkartLink?: string;

  // Variants & Grouping
  colorGroupId?: string;
  productSizeId?: string;
  productComboId?: string;
  packagingGroupId?: string;

  // Status & Visibility Flags
  status: "In Stock" | "Low Stock" | "Out of Stock" | "Active" | "InActive" | "Discontinued";
  isVisibleWebsite?: boolean;
  isVisibleApi?: boolean;
  newArrival?: boolean;
  isFeatured?: boolean;
  isFullTurn?: boolean;
  fullTurnCode?: string;

  // SEO & Bullets
  description?: string;
  title?: string;
  keywords?: string;
  searchKeywords?: string;
  urlKey?: string;
  bullets?: string[];

  createdDate: string;
}

export interface AdminOrderItem {
  id: string;
  name: string;
  code?: string;
  color: string;
  price: number;
  quantity: number;
  image: string;
}

export interface AdminShippingAddress {
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface AdminOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: AdminOrderItem[];
  totalAmount: number;
  paymentMethod: "Online Payment" | "Cash on Delivery";
  paymentStatus: "Paid" | "Pending" | "Refunded";
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  shippingAddress: AdminShippingAddress;
  orderDate: string;
  deliveryEstimate?: string;
}

export interface AdminCategory {
  id: string;
  uuid?: string;
  name: string;
  slug: string;
  title?: string;
  keywords?: string;
  description?: string;
  productCount: number;
  image: string;
  banner?: string;
  mobileBanner?: string;
  homeImage?: string;
  homeHoverImage?: string;
  icon?: string;
  content_id?: string;
  contentName?: string;
  status: "Active" | "Inactive";
  isVisibleWebsite?: boolean;
  discount?: number;
  tax?: number;
  pdfCatalogue?: string;
  displayOrder?: number;
  createdAt?: string;
}

export interface AdminSubcategory {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  slug: string;
  title?: string;
  keywords?: string;
  description?: string;
  image?: string;
  banner?: string;
  icon?: string;
  pdfCatalogue?: string;
  displayOrder?: number;
  status: "Active" | "Inactive";
  isVisibleWebsite?: boolean;
}

export interface AdminAttributeItem {
  id: string;
  type: "Brand" | "Color" | "Size" | "Material";
  name: string;
  hexCode?: string;
  icon?: string;
  status: "Active" | "Inactive";
}

export interface AdminDiscount {
  id: string;
  name: string;
  type: "Amount" | "Percent";
  value: number;
  startValue: number;
  endValue: number;
  expiredAt: string;
  status: "Active" | "Inactive";
}

export interface AdminCataloguePdf {
  id: string;
  name: string;
  pdf: string;
  qrCode?: string;
  status: "Active" | "Inactive";
  createdAt?: string;
}

export interface AdminEnquiry {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: "New" | "In Progress" | "Resolved";
}

export interface AdminUser {
  email: string;
  name: string;
  role: string;
  permissions?: string[];
  avatar?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  totalProducts: number;
  pendingEnquiries: number;
}

