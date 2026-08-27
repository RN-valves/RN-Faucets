import mongoose, { Schema, Document, Model } from "mongoose";

export interface IColor extends Document {
  idNumeric: number;
  code: string; // e.g. "CL68"
  name: string; // e.g. "Bronze"
  icon?: string; // image or swatch path
  hexCode?: string;
  status: string; // "Active" | "Inactive"
  createdAt: Date;
  updatedAt: Date;
}

const ColorSchema = new Schema<IColor>(
  {
    idNumeric: { type: Number, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    icon: { type: String },
    hexCode: { type: String },
    status: { type: String, default: "Active" },
  },
  {
    timestamps: true,
  }
);

const Color: Model<IColor> =
  mongoose.models.Color || mongoose.model<IColor>("Color", ColorSchema);

export default Color;
