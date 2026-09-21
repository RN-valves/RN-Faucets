import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductBullet extends Document {
  id: number;
  bulletId?: string;
  categoryId: number;
  name: string;
  status: "Active" | "Inactive";
  createdAt: Date;
  updatedAt: Date;
}

const ProductBulletSchema = new Schema<IProductBullet>(
  {
    id: { type: Number, required: true, unique: true },
    bulletId: { type: String },
    categoryId: { type: Number, default: 0 },
    name: { type: String, required: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true, collection: "product_bullets" }
);

const ProductBullet: Model<IProductBullet> =
  mongoose.models.ProductBullet ||
  mongoose.model<IProductBullet>("ProductBullet", ProductBulletSchema);

export default ProductBullet;
