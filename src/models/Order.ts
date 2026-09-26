import mongoose, { Schema, Document, Model } from "mongoose";

const OrderItemSchema = new Schema(
  {
    id: { type: String },
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
    country: { type: String, default: "India" },
  },
  { _id: false }
);

export interface IOrder extends Document {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: {
    id?: string;
    name: string;
    code?: string;
    color: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  totalAmount: number;
  paymentMethod: "Online Payment" | "Cash on Delivery" | "Store Pickup";
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
    country?: string;
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
  pay_link_id?: string;
  pay_link_url?: string;
  payment_data?: string;
  payment_key?: string;
  payment_term?: string;
  fulfillment_type?: string;
  // Package Dimensions
  packageLength?: number;
  packageBreadth?: number;
  packageHeight?: number;
  packageWeight?: number;
  // Shipping Integration Details
  shippingProvider?: "Shiprocket" | "Shipway" | "Manual" | "Custom" | string;
  shiprocketOrderId?: string | number;
  shiprocketShipmentId?: string | number;
  shipwayOrderId?: string | number;
  carrierId?: string;
  deliveryCharge?: number;
  gstCharge?: number;
  totalDeliveryCharge?: number;
  codCharge?: number;
  transportContact?: string;
  transportAttachment?: string;
  transportUrl?: string;
  manifest_ids?: string | number;
  awbCode?: string;
  trackingUrl?: string;
  orderDate: string;
  deliveryEstimate?: string;
  legacyId?: number;
  uuid?: string;
  userId?: number;
  discountCode?: string;
  discountAmount?: number;
  shippingAmount?: number;
  timeline?: any[];
  transportDetails?: any;
  invoice?: string;
  note?: string;
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
    paymentMethod: { type: String, default: "Online Payment" },
    paymentStatus: { type: String, default: "Pending" },
    status: { type: String, default: "Pending" },
    fulfillment_type: { type: String, default: "Delivery" },
    payment_term: { type: String, default: "Prepaid" },
    payment_key: { type: String, default: "" },
    pay_link_id: { type: String, default: "" },
    pay_link_url: { type: String, default: "" },
    payment_data: { type: String, default: "" },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    courierPartner: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    lrNumber: { type: String, default: "" },
    dispatchDate: { type: String, default: "" },
    vehicleNumber: { type: String, default: "" },
    transportNotes: { type: String, default: "" },
    packageLength: { type: Number, default: 10 },
    packageBreadth: { type: Number, default: 10 },
    packageHeight: { type: Number, default: 10 },
    packageWeight: { type: Number, default: 0.5 },
    carrierId: { type: String, default: "" },
    deliveryCharge: { type: Number, default: 0 },
    gstCharge: { type: Number, default: 0 },
    totalDeliveryCharge: { type: Number, default: 0 },
    codCharge: { type: Number, default: 0 },
    transportContact: { type: String, default: "" },
    transportAttachment: { type: String, default: "" },
    transportUrl: { type: String, default: "" },
    manifest_ids: { type: Schema.Types.Mixed, default: null },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },
    shippingProvider: { type: String, default: "Manual" },
    shiprocketOrderId: { type: Schema.Types.Mixed, default: null },
    shiprocketShipmentId: { type: Schema.Types.Mixed, default: null },
    shipwayOrderId: { type: Schema.Types.Mixed, default: null },
    awbCode: { type: String, default: "" },
    trackingUrl: { type: String, default: "" },
    orderDate: { type: String, required: true },
    deliveryEstimate: { type: String },
    legacyId: { type: Number },
    uuid: { type: String },
    userId: { type: Number },
    discountCode: { type: String },
    discountAmount: { type: Number },
    shippingAmount: { type: Number },
    timeline: { type: Array, default: [] },
    transportDetails: { type: Schema.Types.Mixed },
    invoice: { type: String },
    note: { type: String },
  },
  { timestamps: true, strict: false }
);

// High-performance compound & lookup indexes
OrderSchema.index({ customerPhone: 1, createdAt: -1 });
OrderSchema.index({ customerEmail: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
