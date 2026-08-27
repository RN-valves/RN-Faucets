import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISize extends Document {
  idNumeric: number;
  code: string; // e.g. "SZ182"
  name: string; // e.g. "8x5.5\""
  status: string; // "Active" | "Inactive"
  createdAt: Date;
  updatedAt: Date;
}

const SizeSchema = new Schema<ISize>(
  {
    idNumeric: { type: Number, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    status: { type: String, default: "Active" },
  },
  {
    timestamps: true,
  }
);

const Size: Model<ISize> =
  mongoose.models.Size || mongoose.model<ISize>("Size", SizeSchema);

export default Size;
