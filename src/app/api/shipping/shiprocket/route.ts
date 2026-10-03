import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import {
  createShiprocketOrder,
  assignShiprocketAWB,
  trackShiprocketShipment,
  generateShiprocketLabel,
} from "@/lib/shipping/shiprocket";
import { requireAdminAuth } from "@/lib/security";

function getOrderSearchQuery(id: string) {
  const cleanNum = id.replace(/\D/g, "");
  const queries: any[] = [
    { id: id },
    { id: `#${id}` },
    { id: id.replace(/^#/, "") },
  ];
  if (cleanNum) {
    queries.push(
      { id: `RNORD${cleanNum}` },
      { id: `RNOD${cleanNum}` },
      { id: cleanNum },
      { order_number: cleanNum },
      { order_number: `RNORD${cleanNum}` },
      { order_number: `RNOD${cleanNum}` },
      { order_number: `#OD${cleanNum}` },
      { order_number: `OD${cleanNum}` }
    );
  }
  if (mongoose.isValidObjectId(id)) {
    queries.push({ _id: id });
  }
  return { $or: queries };
}

export async function POST(request: Request) {
  try {
    const adminSession = await requireAdminAuth(request);
    if (!adminSession) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required to dispatch shipments." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, weight, length, breadth, height, courier_id, action } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findOne(getOrderSearchQuery(orderId));

    if (!order) {
      return NextResponse.json({ error: `Order '${orderId}' not found in database` }, { status: 404 });
    }

    // Handle Label Generation action
    if (action === "generate_label") {
      const shipmentId = order.shiprocketShipmentId;
      if (!shipmentId) {
        return NextResponse.json({ error: "No Shiprocket shipment found for this order" }, { status: 400 });
      }
      const labelRes = await generateShiprocketLabel(shipmentId);
      return NextResponse.json({ success: true, label: labelRes });
    }

    const address = order.shippingAddress || {};
    const shiprocketResult = await createShiprocketOrder({
      orderId: order.id || orderId,
      customerName: order.customerName || `${address.firstName || ""} ${address.lastName || ""}`.trim() || "Customer",
      customerPhone: order.customerPhone || address.phone || "9876543210",
      customerEmail: order.customerEmail || address.email || "sales@rnvalves.com",
      address: address.address || `${address.city || "City"}, ${address.state || "State"}`,
      city: address.city || "Delhi",
      state: address.state || "Delhi",
      pinCode: address.pinCode || "201010",
      items: Array.isArray(order.items) && order.items.length > 0
        ? order.items.map((i: any) => ({
            name: i.name,
            sku: i.code || i.id || "RN-PROD",
            units: Number(i.quantity) || 1,
            selling_price: Number(i.price) || 1,
          }))
        : [{ name: "RN Valves Product", sku: "RN-VALVE", units: 1, selling_price: order.totalAmount || 100 }],
      paymentMethod: order.paymentMethod || "Online Payment",
      totalAmount: order.totalAmount || 100,
      length: Number(length) || order.packageLength || 15,
      breadth: Number(breadth) || order.packageBreadth || 15,
      height: Number(height) || order.packageHeight || 10,
      weight: Number(weight) || order.packageWeight || 0.5,
    });

    const shipmentId =
      shiprocketResult.shipment_id ||
      (shiprocketResult.response && shiprocketResult.response.data && shiprocketResult.response.data.shipment_id);

    let awbCode = "";
    let courierName = "Shiprocket Express";

    if (shipmentId) {
      try {
        const awbRes = await assignShiprocketAWB(shipmentId, courier_id);
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
      order.transportUrl = `https://shiprocket.co/tracking/${awbCode}`;
    }
    order.status = "In-Transit";
    order.dispatchDate = new Date().toISOString().slice(0, 10);

    const logEntry = {
      user_name: adminSession.email || "Admin",
      created_at: new Date().toISOString(),
      change_value: `Order successfully synced to Shiprocket (Order ID: ${order.shiprocketOrderId}${awbCode ? `, AWB: ${awbCode}` : ""})`,
      change_type: "shipping_sync",
    };
    if (!Array.isArray(order.timeline)) order.timeline = [];
    order.timeline.unshift(logEntry);

    await order.save();

    return NextResponse.json({
      success: true,
      message: `Order #${order.id} synced to Shiprocket successfully!`,
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
