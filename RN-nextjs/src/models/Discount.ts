import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDiscount extends Document {
  id: string;
  name: string;
  type: "Amount" | "Percent";
  value: number;
  startValue: number;
  endValue: number;
  expiredAt: string;
  status: "Active" | "Inactive";
}

const DiscountSchema = new Schema<IDiscount>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["Amount", "Percent"], default: "Percent" },
    value: { type: Number, required: true },
    startValue: { type: Number, default: 0 },
    endValue: { type: Number, default: 999999 },
    expiredAt: { type: String, required: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

const Discount: Model<IDiscount> =
  mongoose.models.Discount || mongoose.model<IDiscount>("Discount", DiscountSchema);

export default Discount;
