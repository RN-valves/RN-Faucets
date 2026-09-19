import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { createShipwayOrder, trackShipwayShipment } from "@/lib/shipping/shipway";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findOne({ $or: [{ id: orderId }, { _id: orderId }] });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const shipwayResult = await createShipwayOrder({
      orderId: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      address: order.shippingAddress.address,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      pinCode: order.shippingAddress.pinCode,
      items: order.items.map((i) => ({
        name: i.name,
        sku: i.code || i.id,
        units: i.quantity,
        selling_price: i.price,
      })),
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
    });

    order.shippingProvider = "Shipway";
    order.shipwayOrderId = shipwayResult?.order_id || shipwayResult?.id || order.id;
    order.status = "Shipped";
    order.courierPartner = order.courierPartner || "Shipway Partner";
    order.dispatchDate = new Date().toISOString().slice(0, 10);
    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order dispatched via Shipway successfully",
      shipway: shipwayResult,
      order,
    });
  } catch (error: any) {
    console.error("Shipway API Error:", error);
    return NextResponse.json(
      { error: error.message || "Shipway dispatch failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get("trackingNumber");
    const carrier = searchParams.get("carrier") || "";

    if (!trackingNumber) {
      return NextResponse.json(
        { error: "Tracking number is required" },
        { status: 400 }
      );
    }

    const trackingData = await trackShipwayShipment(trackingNumber, carrier);
    return NextResponse.json(trackingData);
  } catch (error: any) {
    console.error("Shipway Track Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to track shipment" },
      { status: 500 }
    );
  }
}
