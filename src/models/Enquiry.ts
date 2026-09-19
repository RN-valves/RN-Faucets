import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEnquiry extends Document {
  id: string;
  customerName: string;
  companyName?: string;
  email: string;
  phone: string;
  profession?: string;
  zipcode?: string;
  address?: string;
  subject: string;
  message: string;
  date: string;
  status: "New" | "In Progress" | "Resolved";
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    id: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    companyName: { type: String, default: "" },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    profession: { type: String, default: "" },
    zipcode: { type: String, default: "" },
    address: { type: String, default: "" },
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
