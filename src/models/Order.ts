import mongoose, { Schema, Document, Model } from "mongoose";

const OrderItemSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    code: { type: String },
    color: { type: String, default: "" },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },
  },
  { _id: false }
);

export interface IOrder extends Document {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: {
    id: string;
    name: string;
    code?: string;
    color: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  totalAmount: number;
  paymentMethod: "Online Payment" | "Cash on Delivery";
  paymentStatus: "Paid" | "Pending" | "Refunded";
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  shippingAddress: {
    firstName: string;
    lastName?: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
  };
  courierPartner?: string;
  trackingNumber?: string;
  lrNumber?: string;
  dispatchDate?: string;
  vehicleNumber?: string;
  transportNotes?: string;
  // Razorpay Payment Details
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  // Shipping Integration Details
  shippingProvider?: "Shiprocket" | "Shipway" | "Manual" | "Custom";
  shiprocketOrderId?: string | number;
  shiprocketShipmentId?: string | number;
  shipwayOrderId?: string | number;
  awbCode?: string;
  trackingUrl?: string;
  orderDate: string;
  deliveryEstimate?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    id: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String, default: "" },
    items: { type: [OrderItemSchema], default: [] },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["Online Payment", "Cash on Delivery"],
      default: "Online Payment",
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Refunded"],
      default: "Pending",
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    courierPartner: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    lrNumber: { type: String, default: "" },
    dispatchDate: { type: String, default: "" },
    vehicleNumber: { type: String, default: "" },
    transportNotes: { type: String, default: "" },
    // Razorpay Payment Details
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },
    // Shipping Integration Details
    shippingProvider: {
      type: String,
      enum: ["Shiprocket", "Shipway", "Manual", "Custom"],
      default: "Manual",
    },
    shiprocketOrderId: { type: Schema.Types.Mixed, default: null },
    shiprocketShipmentId: { type: Schema.Types.Mixed, default: null },
    shipwayOrderId: { type: Schema.Types.Mixed, default: null },
    awbCode: { type: String, default: "" },
    trackingUrl: { type: String, default: "" },
    orderDate: { type: String, required: true },
    deliveryEstimate: { type: String },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
