import crypto from "crypto";

export interface CreateOrderParams {
  amount: number; // in INR (e.g. 1500)
  currency?: string; // default "INR"
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number; // in paise
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}

export function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

  if (!keyId || !keySecret) {
    console.warn("Razorpay credentials are not fully configured in environment variables.");
  }

  return { keyId, keySecret };
}

/**
 * Creates a Razorpay order via REST API
 */
export async function createRazorpayOrder({
  amount,
  currency = "INR",
  receipt,
  notes = {},
}: CreateOrderParams): Promise<RazorpayOrderResponse> {
  const { keyId, keySecret } = getRazorpayCredentials();

  if (!keyId || !keySecret) {
    throw new Error("Razorpay Key ID or Secret is missing in environment variables.");
  }

  const amountInPaise = Math.round(amount * 100);

  const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: {
        company: "RN Valves & Faucets",
        account_bank: "IDFC FIRST Bank",
        ...notes,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Razorpay Order Creation Failed:", data);
    throw new Error(data.error?.description || "Failed to create Razorpay order");
  }

  return data as RazorpayOrderResponse;
}

/**
 * Verifies Razorpay payment signature
 */
export function verifyRazorpayPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { keySecret } = getRazorpayCredentials();

  if (!keySecret) {
    throw new Error("Razorpay Secret is missing.");
  }

  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}

/**
 * Fetches details of a payment from Razorpay
 */
export async function fetchRazorpayPayment(paymentId: string) {
  const { keyId, keySecret } = getRazorpayCredentials();
  if (!keyId || !keySecret) throw new Error("Razorpay credentials missing");

  const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
  const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: authHeader,
    },
  });

  return response.json();
}
