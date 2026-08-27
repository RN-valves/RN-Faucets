import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBPoint extends Document {
  id: string;
  modelType: string;
  modelId: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const BPointSchema = new Schema<IBPoint>(
  {
    id: { type: String, required: true, unique: true },
    modelType: { type: String, default: "Category" },
    modelId: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

const BPoint: Model<IBPoint> =
  mongoose.models.BPoint || mongoose.model<IBPoint>("BPoint", BPointSchema);

export default BPoint;
