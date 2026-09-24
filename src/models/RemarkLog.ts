import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRemarkLog extends Document {
  id?: string;
  legacyId?: number;
  logableType: string;
  logableId?: number;
  adminUserId?: number;
  adminUserName: string;
  customerName: string;
  customerMobile: string;
  remark: string;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const RemarkLogSchema = new Schema<IRemarkLog>(
  {
    id: { type: String },
    legacyId: { type: Number },
    logableType: { type: String, default: "App\\Models\\User" },
    logableId: { type: Number },
    adminUserId: { type: Number },
    adminUserName: { type: String, default: "Admin" },
    customerName: { type: String, default: "" },
    customerMobile: { type: String, default: "" },
    remark: { type: String, default: "" },
    message: { type: String, default: "" },
  },
  { timestamps: true, strict: false, collection: "remark_logs" }
);

const RemarkLog: Model<IRemarkLog> =
  mongoose.models.RemarkLog || mongoose.model<IRemarkLog>("RemarkLog", RemarkLogSchema, "remark_logs");

export default RemarkLog;
