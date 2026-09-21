import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import {
  createShiprocketOrder,
  assignShiprocketAWB,
  trackShiprocketShipment,
} from "@/lib/shipping/shiprocket";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, weight } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findOne({ $or: [{ id: orderId }, { _id: orderId }] });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const shiprocketResult = await createShiprocketOrder({
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
      paymentMethod: order.paymentMethod === "Cash on Delivery" ? "Cash on Delivery" : "Online Payment",
      totalAmount: order.totalAmount,
      weight: weight || 1.0,
    });

    const shipmentId =
      shiprocketResult.shipment_id ||
      (shiprocketResult.response && shiprocketResult.response.data && shiprocketResult.response.data.shipment_id);

    let awbCode = "";
    let courierName = "Shiprocket Express";

    if (shipmentId) {
      try {
        const awbRes = await assignShiprocketAWB(shipmentId);
        if (awbRes?.response?.data?.awb_code) {
          awbCode = awbRes.response.data.awb_code;
          courierName = awbRes.response.data.courier_name || courierName;
        }
      } catch (awbErr) {
        console.warn("AWB auto-assign skipped or pending:", awbErr);
      }
    }

    order.shippingProvider = "Shiprocket";
    order.shiprocketOrderId = shiprocketResult.order_id || shiprocketResult.id;
    order.shiprocketShipmentId = shipmentId;
    if (awbCode) {
      order.trackingNumber = awbCode;
      order.awbCode = awbCode;
      order.courierPartner = courierName;
    }
    order.status = "Shipped";
    order.dispatchDate = new Date().toISOString().slice(0, 10);
    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order dispatched via Shiprocket successfully",
      shiprocket: shiprocketResult,
      order,
    });
  } catch (error: any) {
    console.error("Shiprocket API Error:", error);
    return NextResponse.json(
      { error: error.message || "Shiprocket dispatch failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const awb = searchParams.get("awb");

    if (!awb) {
      return NextResponse.json({ error: "AWB code is required" }, { status: 400 });
    }

    const trackingData = await trackShiprocketShipment(awb);
    return NextResponse.json(trackingData);
  } catch (error: any) {
    console.error("Shiprocket Track Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to track shipment" },
      { status: 500 }
    );
  }
}
