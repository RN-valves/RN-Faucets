import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDiscount extends Document {
  id?: string;
  legacyId?: number;
  name: string;
  code?: string;
  type: string;
  value: number;
  startValue: number;
  endValue: number;
  expiredAt?: Date | string;
  status: "Active" | "Inactive" | "InActive";
}

const DiscountSchema = new Schema<IDiscount>(
  {
    id: { type: String },
    legacyId: { type: Number },
    name: { type: String, required: true },
    code: { type: String },
    type: { type: String, default: "Percentage" },
    value: { type: Number, required: true },
    startValue: { type: Number, default: 0 },
    endValue: { type: Number, default: 999999 },
    expiredAt: { type: Schema.Types.Mixed },
    status: { type: String, default: "Active" },
  },
  { timestamps: true, strict: false }
);

const Discount: Model<IDiscount> =
  mongoose.models.Discount || mongoose.model<IDiscount>("Discount", DiscountSchema);

export default Discount;
