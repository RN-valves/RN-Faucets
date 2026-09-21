import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayment extends Document {
  id: number;
  paymentId?: string;
  orderId?: number | null;
  customerName: string;
  payLinkId?: string;
  shortUrl?: string;
  mobile: string;
  email: string;
  state: string;
  city: string;
  zipcode: string;
  paymentGateway: string;
  paymentKey?: string;
  gatewayPaymentId?: string;
  status: string;
  paymentData?: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    id: { type: Number, required: true, unique: true },
    paymentId: { type: String },
    orderId: { type: Number, default: null },
    customerName: { type: String, required: true },
    payLinkId: { type: String, default: "" },
    shortUrl: { type: String, default: "" },
    mobile: { type: String, default: "" },
    email: { type: String, default: "" },
    state: { type: String, default: "" },
    city: { type: String, default: "" },
    zipcode: { type: String, default: "" },
    paymentGateway: { type: String, default: "Razorpay" },
    paymentKey: { type: String, default: "" },
    gatewayPaymentId: { type: String, default: "" },
    status: { type: String, default: "pending" },
    paymentData: { type: String, default: "" },
    amount: { type: Number, required: true },
  },
  { timestamps: true, collection: "payments" }
);

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
