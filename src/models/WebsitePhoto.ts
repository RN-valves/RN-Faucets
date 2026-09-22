import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWebsitePhoto extends Document {
  photoId: string;
  title: string;
  description?: string;
  category: "auth" | "branding" | "catalogue" | "homepage" | "other";
  location: string;
  r2Key: string;
  localPath?: string;
  recommendedResolution?: string;
  publicUrl: string;
  isCustom?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WebsitePhotoSchema = new Schema<IWebsitePhoto>(
  {
    photoId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: ["auth", "branding", "catalogue", "homepage", "other"],
      default: "other",
    },
    location: { type: String, required: true },
    r2Key: { type: String, required: true },
    localPath: { type: String, default: "" },
    recommendedResolution: { type: String, default: "" },
    publicUrl: { type: String, required: true },
    isCustom: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const WebsitePhoto: Model<IWebsitePhoto> =
  mongoose.models.WebsitePhoto ||
  mongoose.model<IWebsitePhoto>("WebsitePhoto", WebsitePhotoSchema);

export default WebsitePhoto;
