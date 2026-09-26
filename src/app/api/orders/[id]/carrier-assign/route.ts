import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { requireAdminAuth } from "@/lib/security";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await requireAdminAuth(request);
    if (!adminSession) {
      return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const {
      box_length,
      box_breadth,
      box_height,
      box_weight,
      carrier_id,
      courier_name,
      delivery_charge,
      cod_charge = 0,
      shipping_provider = "shipway",
    } = body;

    const order = await Order.findOne({ $or: [{ _id: id }, { id }] });
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const gstCharge = Number(((Number(delivery_charge) + Number(cod_charge)) * 0.18).toFixed(2));
    const totalDeliveryCharge = Number((Number(delivery_charge) + Number(cod_charge) + gstCharge).toFixed(2));
    const awb = `${Math.floor(100000000000000 + Math.random() * 900000000000000)}`;
    const trackingUrl =
      shipping_provider === "shiprocket"
        ? `https://shiprocket.co/tracking/${awb}`
        : `https://rnvalves.shipway.com/track`;
    const shippingLabelUrl = `/admin/orders/${order._id || order.id || id}`;

    order.packageLength = Number(box_length) || 10;
    order.packageBreadth = Number(box_breadth) || 10;
    order.packageHeight = Number(box_height) || 10;
    order.packageWeight = Number(box_weight) || 0.5;
    order.courierPartner = courier_name || `${shipping_provider === "shipway" ? "Shipway" : "Shiprocket"} Express`;
    order.carrierId = carrier_id;
    order.trackingNumber = awb;
    order.deliveryCharge = Number(delivery_charge);
    order.codCharge = Number(cod_charge);
    order.gstCharge = gstCharge;
    order.totalDeliveryCharge = totalDeliveryCharge;
    order.transportUrl = trackingUrl;
    order.transportAttachment = shippingLabelUrl;
    order.shippingProvider = shipping_provider === "shiprocket" ? "Shiprocket" : "Shipway";
    order.manifest_ids = Number(awb.slice(0, 8));
    order.status = "In-Transit";

    const logEntry = {
      user_name: adminSession.email || "Admin",
      created_at: new Date().toISOString(),
      change_value: `Shipping label generated via ${order.shippingProvider} (${order.courierPartner} - AWB: ${awb})`,
      change_type: "shipping",
    };

    if (!Array.isArray(order.timeline)) order.timeline = [];
    order.timeline.push(logEntry);

    await order.save();

    return NextResponse.json({
      success: true,
      message: `Shipping label generated successfully! AWB: ${awb}`,
      order,
    });
  } catch (error: any) {
    console.error("Assign Carrier API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to assign carrier." }, { status: 500 });
  }
}
