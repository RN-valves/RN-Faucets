import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEnquiry extends Document {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: "New" | "In Progress" | "Resolved";
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    id: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, default: "" },
    date: { type: String, required: true },
    status: {
      type: String,
      enum: ["New", "In Progress", "Resolved"],
      default: "New",
    },
  },
  { timestamps: true }
);

const Enquiry: Model<IEnquiry> =
  mongoose.models.Enquiry || mongoose.model<IEnquiry>("Enquiry", EnquirySchema);

export default Enquiry;
