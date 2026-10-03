import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { requireAdminAuth } from "@/lib/security";
import { getOrderSearchQuery } from "@/lib/orderUtils";
import { getShiprocketServiceability } from "@/lib/shipping/shiprocket";

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
      length = 10,
      breadth = 10,
      height = 10,
      weight = 0.5,
      shipping_provider = "shiprocket",
    } = body;

    const order = await Order.findOne(getOrderSearchQuery(id));
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const toPincode = order.shippingAddress?.pinCode || "201005";
    const paymentMode = order.paymentMethod === "Cash on Delivery" ? "cod" : "prepaid";
    const isCod = paymentMode === "cod";
    const codAmount = isCod ? Math.round(order.totalAmount) : 0;
    const fromPincode = process.env.SHIPROCKET_PICKUP_PINCODE || process.env.SHIPWAY_PICKUP_PINCODE || "201010";

    // Handle Shiprocket Live Serviceability & Rates
    if (shipping_provider === "shiprocket") {
      try {
        const data = await getShiprocketServiceability({
          pickupPostcode: fromPincode,
          deliveryPostcode: toPincode,
          weight: Number(weight) || 0.5,
          cod: isCod,
        });

        const couriers = data?.data?.available_courier_companies || [];
        if (Array.isArray(couriers) && couriers.length > 0) {
          const rates = couriers.map((courier: any) => {
            const deliveryCharge = Number(courier.rate) || 0;
            const codCharge = Number(courier.cod_charges) || (isCod ? 40 : 0);
            const gstCharge = Number((deliveryCharge * 0.18).toFixed(2));
            const totalDeliveryCharge = Number((deliveryCharge + codCharge + gstCharge).toFixed(2));

            return {
              carrier_id: String(courier.courier_company_id),
              courier_name: courier.courier_name,
              delivery_charge: deliveryCharge,
              cod_charge: codCharge,
              gst_charge: gstCharge,
              total_delivery_charge: totalDeliveryCharge,
              etd: courier.etd || courier.estimated_delivery_days ? `${courier.estimated_delivery_days} days` : "2-4 days",
              rating: courier.rating || "4.5",
              provider: "shiprocket",
            };
          });

          return NextResponse.json({ success: true, rates });
        }
      } catch (srErr) {
        console.error("Shiprocket Serviceability API Error:", srErr);
      }
    }

    // Handle Shipway Rates
    if (shipping_provider === "shipway") {
      try {
        const shipwayUser = process.env.SHIPWAY_USERNAME || "rncom@rnvalves.com";
        const shipwayPass = process.env.SHIPWAY_PASSWORD || "9D57l172eMP15a67WB7O1h51j4dv1XD7";
        const token = Buffer.from(`${shipwayUser}:${shipwayPass}`).toString("base64");

        const query = new URLSearchParams({
          fromPincode,
          toPincode,
          paymentType: paymentMode,
          length: Math.round(Number(length)).toString(),
          breadth: Math.round(Number(breadth)).toString(),
          height: Math.round(Number(height)).toString(),
          weight: Math.round(Number(weight) * 1000).toString(), // in grams
          cummulativePrice: codAmount.toString(),
        });

        const response = await fetch(`https://app.shipway.com/api/getshipwaycarrierrates?${query.toString()}`, {
          method: "GET",
          headers: {
            Authorization: `Basic ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.rate_card && Array.isArray(data.rate_card) && data.rate_card.length > 0) {
            const rates = data.rate_card.map((rate: any) => {
              const deliveryCharge = Number(rate.delivery_charge) || 0;
              const codCharges = Number(rate.cod_charges) || 0;
              const gstCharge = Number(((deliveryCharge + codCharges) * 0.18).toFixed(2));
              const totalDeliveryCharge = Number((deliveryCharge + codCharges + gstCharge).toFixed(2));

              return {
                carrier_id: rate.carrier_id,
                courier_name: rate.courier_name,
                delivery_charge: deliveryCharge,
                cod_charge: codCharges,
                gst_charge: gstCharge,
                total_delivery_charge: totalDeliveryCharge,
                provider: "shipway",
              };
            });

            return NextResponse.json({ success: true, rates });
          }
        }
      } catch (swErr) {
        console.error("Shipway Rate API Error:", swErr);
      }
    }

    // Fallback standard rate calculation if external API is temporarily unreachable
    const baseDelivery = Math.round(75 + Number(weight) * 20);
    const baseGst = Number((baseDelivery * 0.18).toFixed(2));
    const fallbackRates = [
      {
        carrier_id: "80652",
        courier_name: `${shipping_provider === "shiprocket" ? "Shiprocket" : "Shipway"} Xpressbees Surface`,
        delivery_charge: baseDelivery,
        cod_charge: paymentMode === "cod" ? 40 : 0,
        gst_charge: baseGst,
        total_delivery_charge: Number((baseDelivery + baseGst + (paymentMode === "cod" ? 40 : 0)).toFixed(2)),
        provider: shipping_provider,
      },
      {
        carrier_id: "80653",
        courier_name: `${shipping_provider === "shiprocket" ? "Shiprocket" : "Shipway"} Delhivery Air / Surface`,
        delivery_charge: baseDelivery + 15,
        cod_charge: paymentMode === "cod" ? 40 : 0,
        gst_charge: Number(((baseDelivery + 15) * 0.18).toFixed(2)),
        total_delivery_charge: Number(((baseDelivery + 15) * 1.18 + (paymentMode === "cod" ? 40 : 0)).toFixed(2)),
        provider: shipping_provider,
      },
    ];

    return NextResponse.json({ success: true, rates: fallbackRates });
  } catch (error: any) {
    console.error("Carrier Rate API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch carrier rates." }, { status: 500 });
  }
}
