let cachedToken: string | null = process.env.SHIPROCKET_TOKEN || null;
let tokenExpiresAt: number = 0;

export async function getShiprocketAuthToken(): Promise<string> {
  // If we already have a valid token in memory
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  // Check if env has token
  if (process.env.SHIPROCKET_TOKEN && !tokenExpiresAt) {
    cachedToken = process.env.SHIPROCKET_TOKEN;
    tokenExpiresAt = Date.now() + 8 * 24 * 60 * 60 * 1000; // 8 days fallback
    return cachedToken;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    if (process.env.SHIPROCKET_TOKEN) return process.env.SHIPROCKET_TOKEN;
    throw new Error("Shiprocket credentials missing (EMAIL / PASSWORD)");
  }

  try {
    const res = await fetch("https://apiv2.shiprocket.in/v2/console/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok && data.token) {
      cachedToken = data.token;
      tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000; // 9 days
      return cachedToken as string;
    } else {
      console.error("Shiprocket login error:", data);
      if (process.env.SHIPROCKET_TOKEN) return process.env.SHIPROCKET_TOKEN;
      throw new Error(data.message || "Failed to authenticate with Shiprocket");
    }
  } catch (err: any) {
    if (process.env.SHIPROCKET_TOKEN) return process.env.SHIPROCKET_TOKEN;
    throw err;
  }
}

export interface ShiprocketOrderPayload {
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
  pickupLocation?: string;
  weight?: number; // in KG
}

/**
 * Creates an ad-hoc order in Shiprocket
 */
export async function createShiprocketOrder(payload: ShiprocketOrderPayload) {
  const token = await getShiprocketAuthToken();

  const [firstName, ...rest] = payload.customerName.trim().split(" ");
  const lastName = rest.join(" ") || "Customer";

  const orderDate = payload.orderDate || new Date().toISOString().slice(0, 16).replace("T", " ");

  const pickupLocation =
    payload.pickupLocation || process.env.SHIPROCKET_PICKUP_LOCATION || "Office";

  const orderItems = payload.items.map((item, idx) => ({
    name: item.name,
    sku: item.sku || `SKU-${idx + 1}`,
    units: item.units,
    selling_price: item.selling_price,
    discount: 0,
    tax: 0,
    hsn: 8481, // Faucets & Valves HSN code
  }));

  const body = {
    order_id: payload.orderId,
    order_date: orderDate,
    pickup_location: pickupLocation,
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: payload.address,
    billing_city: payload.city,
    billing_pincode: payload.pinCode,
    billing_state: payload.state,
    billing_country: "India",
    billing_email: payload.customerEmail || "sales@rnvalves.com",
    billing_phone: payload.customerPhone.replace(/[^\d]/g, "").slice(-10),
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: payload.paymentMethod === "Cash on Delivery" ? "COD" : "Prepaid",
    sub_total: payload.totalAmount,
    length: 15,
    breadth: 15,
    height: 10,
    weight: payload.weight || 1.2,
  };

  const response = await fetch("https://apiv2.shiprocket.in/v2/console/orders/create/adhoc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok && response.status !== 200 && response.status !== 201) {
    console.error("Shiprocket Create Order Failed:", data);
    throw new Error(data.message || JSON.stringify(data));
  }

  return data;
}

/**
 * Assigns AWB to a Shiprocket shipment
 */
export async function assignShiprocketAWB(shipmentId: number | string, courierId?: number) {
  const token = await getShiprocketAuthToken();

  const body: any = { shipment_id: shipmentId };
  if (courierId) body.courier_id = courierId;

  const response = await fetch("https://apiv2.shiprocket.in/v2/console/courier/assign/awb", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  return response.json();
}

/**
 * Tracks a shipment using AWB Code
 */
export async function trackShiprocketShipment(awbCode: string) {
  const token = await getShiprocketAuthToken();

  const response = await fetch(`https://apiv2.shiprocket.in/v2/console/courier/track/awb/${awbCode}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}
