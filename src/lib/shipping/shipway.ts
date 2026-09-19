export interface ShipwayOrderPayload {
  orderId: string;
  orderDate?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  items: Array<{
    name: string;
    sku?: string;
    units: number;
    selling_price: number;
  }>;
  paymentMethod: "Online Payment" | "Cash on Delivery";
  totalAmount: number;
}

export function getShipwayCredentials() {
  const username = process.env.SHIPWAY_USERNAME || "rncom@rnvalves.com";
  const password = process.env.SHIPWAY_PASSWORD || "";
  const warehouseId = process.env.SHIPWAY_WAREHOUSE_ID || "60832";
  const pickupPincode = process.env.SHIPWAY_PICKUP_PINCODE || "201010";

  return { username, password, warehouseId, pickupPincode };
}

/**
 * Creates or Syncs an order with Shipway
 */
export async function createShipwayOrder(payload: ShipwayOrderPayload) {
  const { username, password, warehouseId, pickupPincode } = getShipwayCredentials();

  if (!username || !password) {
    throw new Error("Shipway credentials missing");
  }

  const [firstName, ...rest] = payload.customerName.trim().split(" ");
  const lastName = rest.join(" ") || "Customer";

  const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");

  const body = {
    order_id: payload.orderId,
    order_date: payload.orderDate || new Date().toISOString().slice(0, 10),
    warehouse_id: warehouseId,
    pickup_pincode: pickupPincode,
    customer_name: payload.customerName,
    first_name: firstName,
    last_name: lastName,
    email: payload.customerEmail || "sales@rnvalves.com",
    phone: payload.customerPhone.replace(/[^\d]/g, "").slice(-10),
    address: payload.address,
    city: payload.city,
    state: payload.state,
    pincode: payload.pinCode,
    country: "India",
    payment_type: payload.paymentMethod === "Cash on Delivery" ? "COD" : "Prepaid",
    order_amount: payload.totalAmount,
    products: payload.items.map((it, index) => ({
      product_id: it.sku || `PROD-${index + 1}`,
      product_name: it.name,
      quantity: it.units,
      price: it.selling_price,
    })),
  };

  try {
    const response = await fetch("https://app.shipway.com/api/v2/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Shipway create order error:", error);
    throw error;
  }
}

/**
 * Tracks an order via Shipway
 */
export async function trackShipwayShipment(trackingNumber: string, carrierCode?: string) {
  const { username, password } = getShipwayCredentials();
  const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");

  const response = await fetch(
    `https://app.shipway.com/api/v2/track?tracking_number=${encodeURIComponent(trackingNumber)}&carrier=${carrierCode || ""}`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${basicAuth}`,
      },
    }
  );

  return response.json();
}
