import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
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
  status: string;
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

const ProductSchema = new Schema<IProduct>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, default: 0 },
    image: { type: String, default: "" },
    gallery: { type: [String], default: [] },
    category: { type: String, required: true },
    subcategoryId: { type: String, default: "" },
    subcategoryName: { type: String, default: "" },
    brand: { type: String, default: "" },
    material: { type: String, default: "" },
    colorName: { type: String, default: "" },
    colorIcon: { type: String, default: "" },
    size: { type: String, default: "" },
    article: { type: String, default: "" },
    skuCode: { type: String, default: "" },
    hsn: { type: String, default: "" },
    saleType: { type: String, default: "" },

    inMrp: { type: Number, default: 0 },
    inSelling: { type: Number, default: 0 },
    inV1Mrp: { type: Number, default: 0 },
    othMrp: { type: Number, default: 0 },
    othSelling: { type: Number, default: 0 },
    othV1Mrp: { type: Number, default: 0 },

    stock: { type: Number, default: 0 },
    ctnPcs: { type: Number, default: 0 },
    midCtnPcs: { type: Number, default: 0 },
    innerPcs: { type: Number, default: 0 },
    stockPcs: { type: Number, default: 0 },
    moq: { type: Number, default: 1 },
    onlyProductWtGm: { type: Number, default: 0 },
    productLength: { type: Number, default: 0 },
    productBreadth: { type: Number, default: 0 },
    productHeight: { type: Number, default: 0 },
    residentialWarranty: { type: Number, default: 0 },
    commercialWarranty: { type: Number, default: 0 },
    videoUrl: { type: String, default: "" },
    amazonLink: { type: String, default: "" },
    flipkartLink: { type: String, default: "" },

    colorGroupId: { type: String, default: "" },
    productSizeId: { type: String, default: "" },
    productComboId: { type: String, default: "" },
    packagingGroupId: { type: String, default: "" },

    status: { type: String, default: "In Stock" },
    isVisibleWebsite: { type: Boolean, default: true },
    isVisibleApi: { type: Boolean, default: true },
    newArrival: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isFullTurn: { type: Boolean, default: false },
    fullTurnCode: { type: String, default: "" },

    description: { type: String, default: "" },
    title: { type: String, default: "" },
    keywords: { type: String, default: "" },
    searchKeywords: { type: String, default: "" },
    urlKey: { type: String, default: "" },
    bullets: { type: [String], default: [] },

    createdDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
  },
  { timestamps: true }
);

// High-performance compound & lookup indexes
ProductSchema.index({ code: 1 });
ProductSchema.index({ category: 1, isVisibleWebsite: 1, status: 1 });
ProductSchema.index({ subcategoryId: 1 });
ProductSchema.index({ skuCode: 1 });
ProductSchema.index({ urlKey: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;

