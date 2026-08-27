export interface CustomerSession {
  _id?: string;
  mobile: string;
  name?: string;
  email?: string;
  userCode: string;
  userType: "Customer" | "Business" | "Admin";
  role?: string;
  gstNumber?: string;
  businessName?: string;
  approvalStatus?: "Pending" | "Approved" | "Rejected";
}

const CUSTOMER_SESSION_KEY = "rn_customer_session";

export function getCustomerSession(): CustomerSession | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(CUSTOMER_SESSION_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setCustomerSession(session: CustomerSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent("customer-auth-changed"));
}

export function clearCustomerSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CUSTOMER_SESSION_KEY);
  window.dispatchEvent(new CustomEvent("customer-auth-changed"));
}
