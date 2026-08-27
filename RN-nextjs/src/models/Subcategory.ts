import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubcategory extends Document {
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

const SubcategorySchema = new Schema<ISubcategory>(
  {
    id: { type: String, required: true, unique: true },
    categoryId: { type: String, required: true },
    categoryName: { type: String, default: "" },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    title: { type: String, default: "" },
    keywords: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    banner: { type: String, default: "" },
    icon: { type: String, default: "" },
    pdfCatalogue: { type: String, default: "" },
    displayOrder: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    isVisibleWebsite: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Subcategory: Model<ISubcategory> =
  mongoose.models.Subcategory || mongoose.model<ISubcategory>("Subcategory", SubcategorySchema);

export default Subcategory;
