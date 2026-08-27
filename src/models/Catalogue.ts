import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICataloguePdf extends Document {
  id: string;
  name: string;
  pdf: string;
  qrCode?: string;
  status: "Active" | "Inactive";
  createdAt?: string;
}

const CataloguePdfSchema = new Schema<ICataloguePdf>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    pdf: { type: String, required: true },
    qrCode: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

const CataloguePdf: Model<ICataloguePdf> =
  mongoose.models.CataloguePdf || mongoose.model<ICataloguePdf>("CataloguePdf", CataloguePdfSchema);

export default CataloguePdf;
