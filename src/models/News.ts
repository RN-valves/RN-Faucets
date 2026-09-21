import mongoose, { Schema, Document, Model } from "mongoose";

export interface INews extends Document {
  id: number;
  newsId?: string;
  authId: number;
  createdBy: string;
  name: string;
  urlKey: string;
  slug: string;
  title: string;
  keywords?: string;
  description?: string;
  shortDescription?: string;
  content: string;
  image?: string;
  status: "Active" | "InActive";
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema = new Schema<INews>(
  {
    id: { type: Number, required: true, unique: true },
    newsId: { type: String },
    authId: { type: Number, default: 1 },
    createdBy: { type: String, default: "Admin" },
    name: { type: String, required: true },
    urlKey: { type: String, required: true },
    slug: { type: String, required: true },
    title: { type: String, required: true },
    keywords: { type: String, default: "" },
    description: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    content: { type: String, required: true },
    image: { type: String, default: "" },
    status: { type: String, enum: ["Active", "InActive"], default: "Active" },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "news" }
);

const News: Model<INews> =
  mongoose.models.News || mongoose.model<INews>("News", NewsSchema);

export default News;
