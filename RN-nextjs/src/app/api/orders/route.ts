import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

const DEFAULT_MOCK_ORDERS = [
  {
    id: "RN-ORD-89412",
    customerName: "Sharma Hardware & Sanitary Mart",
    customerPhone: "9876543210",
    customerEmail: "rajesh.sharma@rnvalves.com",
    totalAmount: 2245,
    paymentMethod: "Online Payment",
    paymentStatus: "Paid",
    status: "Processing",
    items: [
      {
        id: "RNGLA06C01",
        name: "Bib Cock Foam Flow, With Flange",
        code: "RNGLA06C01",
        color: "Black",
        price: 449,
        quantity: 5,
        image: "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2FF410011GRT_thumbnail.png&w=2048&q=75",
      },
    ],
    shippingAddress: {
      firstName: "Rajesh",
      lastName: "Sharma",
      phone: "9876543210",
      email: "rajesh.sharma@rnvalves.com",
      address: "Plot 42, Chawri Bazar",
      city: "Delhi",
      state: "Delhi",
      pinCode: "110006",
    },
    courierPartner: "VRL Logistics",
    trackingNumber: "VRL-89471928",
    lrNumber: "LR-481920",
    dispatchDate: "2026-08-24",
    vehicleNumber: "DL 01 AB 1234",
    transportNotes: "Handle with care - Brass & Chrome products",
    orderDate: "2026-08-24 10:15 AM",
    deliveryEstimate: "2026-08-28",
  },
  {
    id: "RN-ORD-75210",
    customerName: "Vikram Mehta",
    customerPhone: "9811223344",
    customerEmail: "vikram@mehta-architects.in",
    totalAmount: 8980,
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pending",
    status: "Shipped",
    items: [
      {
        id: "RNGLA06C02",
        name: "Glamour Single Lever Basin Mixer",
        code: "RNGLA06C02",
        color: "Star White",
        price: 4490,
        quantity: 2,
        image: "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2FF410011GRT_thumbnail.png&w=2048&q=75",
      },
    ],
    shippingAddress: {
      firstName: "Vikram",
      lastName: "Mehta",
      phone: "9811223344",
      email: "vikram@mehta-architects.in",
      address: "Suite 302, Senapati Bapat Marg",
      city: "Mumbai",
      state: "Maharashtra",
      pinCode: "400013",
    },
    courierPartner: "BlueDart Express",
    trackingNumber: "BD-9912034",
    lrNumber: "LR-99120",
    dispatchDate: "2026-08-23",
    vehicleNumber: "MH 02 CZ 9821",
    transportNotes: "Urgent architectural site delivery",
    orderDate: "2026-08-23 03:40 PM",
    deliveryEstimate: "2026-08-27",
  },
  {
    id: "RN-ORD-61205",
    customerName: "Pooja Verma",
    customerPhone: "9712345678",
    customerEmail: "pooja.v@gmail.com",
    totalAmount: 1796,
    paymentMethod: "Online Payment",
    paymentStatus: "Paid",
    status: "Delivered",
    items: [
      {
        id: "RNGLA06C03",
        name: "Pillar Cock Foam Flow",
        code: "RNGLA06C03",
        color: "Chrome",
        price: 898,
        quantity: 2,
        image: "https://hindware.com/_next/image?url=https%3A%2F%2Fhindwarestg.blob.core.windows.net%2Fcontainer1%2Fproducts%2FF410011GRT_thumbnail.png&w=2048&q=75",
      },
    ],
    shippingAddress: {
      firstName: "Pooja",
      lastName: "Verma",
      phone: "9712345678",
      email: "pooja.v@gmail.com",
      address: "Sector 15, Vasundhara",
      city: "Ghaziabad",
      state: "Uttar Pradesh",
      pinCode: "201012",
    },
    courierPartner: "Delhivery",
    trackingNumber: "DEL-7781290",
    lrNumber: "LR-77812",
    dispatchDate: "2026-08-20",
    vehicleNumber: "UP 14 ET 4410",
    transportNotes: "Delivered successfully with OTP signature",
    orderDate: "2026-08-20 11:00 AM",
    deliveryEstimate: "2026-08-22",
  },
];

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "All";

    const count = await Order.countDocuments();
    if (count === 0) {
      await Order.insertMany(DEFAULT_MOCK_ORDERS);
    }

    const query: any = {};
    if (q) {
      query.$or = [
        { id: { $regex: q, $options: "i" } },
        { customerName: { $regex: q, $options: "i" } },
        { customerPhone: { $regex: q, $options: "i" } },
        { courierPartner: { $regex: q, $options: "i" } },
        { trackingNumber: { $regex: q, $options: "i" } },
        { lrNumber: { $regex: q, $options: "i" } },
      ];
    }

    if (status !== "All") {
      query.status = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    const counts = {
      total: orders.length,
      pending: await Order.countDocuments({ status: "Pending" }),
      processing: await Order.countDocuments({ status: "Processing" }),
      shipped: await Order.countDocuments({ status: "Shipped" }),
      delivered: await Order.countDocuments({ status: "Delivered" }),
      cancelled: await Order.countDocuments({ status: "Cancelled" }),
    };

    return NextResponse.json({ orders, counts });
  } catch (error: any) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const orderId = body.id || `RN-ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const order = await Order.create({
      ...body,
      id: orderId,
      status: body.status || "Pending",
      paymentStatus: body.paymentStatus || (body.paymentMethod === "Online Payment" ? "Paid" : "Pending"),
      orderDate: new Date().toLocaleString("en-IN", {
        dateStyle: "short",
        timeStyle: "short",
      }),
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
