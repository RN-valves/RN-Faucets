import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOtp extends Document {
  mobile: string;
  otp: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    mobile: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

const Otp: Model<IOtp> =
  mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);

export default Otp;
