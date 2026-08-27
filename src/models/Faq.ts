import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFaq extends Document {
  id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
  status: "Active" | "Inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

const FaqSchema = new Schema<IFaq>(
  {
    id: { type: String, required: true, unique: true },
    category: { type: String, default: "General & Warranty" },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

const Faq: Model<IFaq> =
  mongoose.models.Faq || mongoose.model<IFaq>("Faq", FaqSchema);

export default Faq;
