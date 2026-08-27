import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttributeItem extends Document {
  id: string;
  type: "Brand" | "Color" | "Size" | "Material";
  name: string;
  hexCode?: string;
  icon?: string;
  status: "Active" | "Inactive";
}

const AttributeItemSchema = new Schema<IAttributeItem>(
  {
    id: { type: String, required: true, unique: true },
    type: { type: String, enum: ["Brand", "Color", "Size", "Material"], required: true },
    name: { type: String, required: true },
    hexCode: { type: String, default: "" },
    icon: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

const AttributeItem: Model<IAttributeItem> =
  mongoose.models.AttributeItem || mongoose.model<IAttributeItem>("AttributeItem", AttributeItemSchema);

export default AttributeItem;
