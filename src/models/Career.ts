import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICareer extends Document {
  id: string;
  title: string;
  department: string;
  location: string;
  experience: string;
  type: "Full Time" | "Part Time" | "Contract";
  description: string;
  status: "Active" | "Closed";
  postedDate: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CareerSchema = new Schema<ICareer>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    department: { type: String, required: true },
    location: { type: String, default: "Sahibabad, NCR" },
    experience: { type: String, default: "2-5 Years" },
    type: { type: String, enum: ["Full Time", "Part Time", "Contract"], default: "Full Time" },
    description: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Closed"], default: "Active" },
    postedDate: { type: String, required: true },
  },
  { timestamps: true }
);

const Career: Model<ICareer> =
  mongoose.models.Career || mongoose.model<ICareer>("Career", CareerSchema);

export default Career;
