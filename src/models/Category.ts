import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
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
  isVisibleWebsite: boolean;
  discount?: number;
  tax?: number;
  pdfCatalogue?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    id: { type: String, required: true, unique: true },
    uuid: { type: String },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    title: { type: String, default: "" },
    keywords: { type: String, default: "" },
    description: { type: String, default: "" },
    productCount: { type: Number, default: 0 },
    image: { type: String, default: "" },
    banner: { type: String, default: "" },
    mobileBanner: { type: String, default: "" },
    homeImage: { type: String, default: "" },
    homeHoverImage: { type: String, default: "" },
    icon: { type: String, default: "" },
    content_id: { type: String, default: "" },
    contentName: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    isVisibleWebsite: { type: Boolean, default: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 18 },
    pdfCatalogue: { type: String, default: "" },
  },
  { timestamps: true }
);

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
