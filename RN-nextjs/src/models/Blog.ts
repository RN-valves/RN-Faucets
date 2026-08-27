import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlog extends Document {
  id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  image: string;
  summary: string;
  content: string;
  status: "Published" | "Draft";
  publishedAt: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    author: { type: String, default: "RN Team" },
    category: { type: String, default: "Bath Design & Care" },
    image: { type: String, default: "" },
    summary: { type: String, default: "" },
    content: { type: String, default: "" },
    status: { type: String, enum: ["Published", "Draft"], default: "Published" },
    publishedAt: { type: String, required: true },
  },
  { timestamps: true }
);

const Blog: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);

export default Blog;
