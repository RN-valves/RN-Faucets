let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

export async function getShiprocketAuthToken(): Promise<string> {
  // If we already have a valid token in memory that is not expired
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const email = process.env.SHIPROCKET_EMAIL || "digital@rnvalves.com";
  const password = process.env.SHIPROCKET_PASSWORD || "E@Y6gjHRin7dD#n&qZdyd!PD8&pRETfO";

  if (!email || !password) {
    if (process.env.SHIPROCKET_TOKEN) return process.env.SHIPROCKET_TOKEN;
    throw new Error("Shiprocket credentials missing (EMAIL / PASSWORD)");
  }

  try {
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok && data.token) {
      cachedToken = data.token;
      tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000; // 9 days cache
      return cachedToken as string;
    } else {
      console.error("Shiprocket login error:", data);
      if (process.env.SHIPROCKET_TOKEN) return process.env.SHIPROCKET_TOKEN;
      throw new Error(data.message || JSON.stringify(data) || "Failed to authenticate with Shiprocket");
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
  paymentMethod: "Online Payment" | "Cash on Delivery" | "Prepaid" | "COD" | string;
  totalAmount: number;
  pickupLocation?: string;
  length?: number;
  breadth?: number;
  height?: number;
  weight?: number; // in KG
}

/**
 * Creates an ad-hoc order in Shiprocket
 */
export async function createShiprocketOrder(payload: ShiprocketOrderPayload) {
  const token = await getShiprocketAuthToken();

  const nameParts = (payload.customerName || "Customer").trim().split(/\s+/);
  const firstName = nameParts[0] || "Customer";
  const lastName = nameParts.slice(1).join(" ") || "User";

  const orderDate = payload.orderDate || new Date().toISOString().slice(0, 16).replace("T", " ");

  const pickupLocation =
    payload.pickupLocation || process.env.SHIPROCKET_PICKUP_LOCATION || "Office";

  const cleanPhone = (payload.customerPhone || "").replace(/\D/g, "").slice(-10) || "9876543210";
  const cleanPincode = (payload.pinCode || "").replace(/\D/g, "").slice(0, 6);
  const cleanAddress = (payload.address || "").trim() || `${payload.city || "City"}, ${payload.state || "State"}`;

  const orderItems = (payload.items && payload.items.length > 0 ? payload.items : [
    { name: "RN Valves Product", sku: "RN-PROD-1", units: 1, selling_price: payload.totalAmount || 100 }
  ]).map((item, idx) => ({
    name: item.name || `RN Product ${idx + 1}`,
    sku: item.sku || `SKU-${idx + 1}`,
    units: Number(item.units) || 1,
    selling_price: Number(item.selling_price) || 1,
    discount: 0,
    tax: 0,
    hsn: 8481, // Faucets & Valves HSN code
  }));

  const isCod =
    payload.paymentMethod === "Cash on Delivery" ||
    payload.paymentMethod === "COD" ||
    payload.paymentMethod?.toLowerCase().includes("cash");

  const body = {
    order_id: payload.orderId,
    order_date: orderDate,
    pickup_location: pickupLocation,
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: cleanAddress,
    billing_city: payload.city || "Delhi",
    billing_pincode: cleanPincode,
    billing_state: payload.state || "Delhi",
    billing_country: "India",
    billing_email: payload.customerEmail || "sales@rnvalves.com",
    billing_phone: cleanPhone,
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: isCod ? "COD" : "Prepaid",
    sub_total: Number(payload.totalAmount) || 0,
    length: Number(payload.length) || 15,
    breadth: Number(payload.breadth) || 15,
    height: Number(payload.height) || 10,
    weight: Number(payload.weight) || 0.5,
  };

  const response = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
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
    throw new Error(data.message || (typeof data === "object" ? JSON.stringify(data) : "Shiprocket order creation failed"));
  }

  return data;
}

/**
 * Live Courier Serviceability & Rate Check from Shiprocket
 */
export async function getShiprocketServiceability(params: {
  pickupPostcode?: string;
  deliveryPostcode: string;
  weight: number; // in KG
  cod?: boolean;
}) {
  const token = await getShiprocketAuthToken();

  const pickupPostcode =
    params.pickupPostcode || process.env.SHIPROCKET_PICKUP_PINCODE || "201010";

  const query = new URLSearchParams({
    pickup_postcode: pickupPostcode,
    delivery_postcode: params.deliveryPostcode.replace(/\D/g, "").slice(0, 6),
    weight: String(params.weight || 0.5),
    cod: params.cod ? "1" : "0",
  });

  const response = await fetch(
    `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?${query.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.json();
}

/**
 * Assigns AWB to a Shiprocket shipment
 */
export async function assignShiprocketAWB(shipmentId: number | string, courierId?: number | string) {
  const token = await getShiprocketAuthToken();

  const body: any = { shipment_id: shipmentId };
  if (courierId) body.courier_id = courierId;

  const response = await fetch("https://apiv2.shiprocket.in/v1/external/courier/assign/awb", {
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
 * Generates shipping label URL from Shiprocket
 */
export async function generateShiprocketLabel(shipmentId: number | string) {
  const token = await getShiprocketAuthToken();

  const response = await fetch("https://apiv2.shiprocket.in/v1/external/generate/label", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shipment_id: [Number(shipmentId)] }),
  });

  return response.json();
}

/**
 * Tracks a shipment using AWB Code
 */
export async function trackShiprocketShipment(awbCode: string) {
  const token = await getShiprocketAuthToken();

  const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}
