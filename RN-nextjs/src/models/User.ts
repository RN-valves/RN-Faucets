import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  mobile: string;
  name?: string;
  email?: string;
  userCode: string;
  userType: "Customer" | "Business" | "Admin" | "Employee";
  role?: string;
  profession?: string;
  gstNumber?: string;
  businessName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  approvalStatus: "Pending" | "Approved" | "Rejected";
  status: "Active" | "InActive";
  permissions: string[];
  remarks?: string;
  password?: string;
  emailVerified: boolean;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    mobile: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    userCode: { type: String, required: true, unique: true },
    password: { type: String, default: "" },
    userType: {
      type: String,
      enum: ["Customer", "Business", "Admin", "Employee"],
      default: "Customer",
    },
    role: { type: String, default: "Customer" },
    profession: { type: String, default: "Consumer" },
    gstNumber: { type: String, default: "" },
    businessName: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zipcode: { type: String, default: "" },
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Approved",
    },
    status: { type: String, enum: ["Active", "InActive"], default: "Active" },
    permissions: { type: [String], default: [] },
    remarks: { type: String, default: "" },
    emailVerified: { type: Boolean, default: true },
    createdBy: { type: String, default: "Self" },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
