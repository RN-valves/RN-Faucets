import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRemark extends Document {
  id?: string;
  legacyId?: number;
  type: string;
  name: string;
  description: string;
  status: "Active" | "Inactive" | "InActive";
}

const RemarkSchema = new Schema<IRemark>(
  {
    id: { type: String },
    legacyId: { type: Number },
    type: { type: String, default: "General" },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    status: { type: String, default: "Active" },
  },
  { timestamps: true, strict: false }
);

const Remark: Model<IRemark> =
  mongoose.models.Remark || mongoose.model<IRemark>("Remark", RemarkSchema);

export default Remark;
