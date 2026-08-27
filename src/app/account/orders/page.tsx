"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import SupportLinksSection from "@/components/SupportLinksSection";
import { getCustomerSession, clearCustomerSession, type CustomerSession } from "@/utils/customerAuth";
import { useRouter } from "next/navigation";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  LogOut,
  ChevronDown,
  ChevronUp,
  FileText,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

interface OrderItem {
  id: string;
  name: string;
  code?: string;
  color: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShippingAddress {
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
}

interface OrderData {
  _id: string;
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: "Online Payment" | "Cash on Delivery";
  paymentStatus: "Paid" | "Pending" | "Refunded";
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  shippingAddress: ShippingAddress;
  courierPartner?: string;
  trackingNumber?: string;
  lrNumber?: string;
  dispatchDate?: string;
  vehicleNumber?: string;
  transportNotes?: string;
  orderDate: string;
  deliveryEstimate?: string;
}

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const activeSession = getCustomerSession();
    if (!activeSession) {
      router.push("/login");
      return;
    }
    setSession(activeSession);
    const userMobile = activeSession.mobile;

    // Fetch orders matching customer mobile
    async function fetchCustomerOrders() {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders?q=${encodeURIComponent(userMobile)}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
          if (data.orders && data.orders.length > 0) {
            setExpandedOrderId(data.orders[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch customer orders:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomerOrders();
  }, [router]);

  const handleLogout = () => {
    clearCustomerSession();
    if (typeof window !== "undefined") {
      localStorage.removeItem("rn_admin_session");
      localStorage.removeItem("rn_user_session");
      localStorage.removeItem("rn_customer_session");
      window.location.href = "/";
    }
  };

  if (!isMounted || !session) return null;

  return (
    <main className="min-h-screen w-full bg-[#FFFFFF] flex flex-col font-sans text-slate-900">
      <Header />

      <section
        data-header-theme="light"
        className="flex-1 w-full pt-[130px] pb-[80px] px-4 max-w-6xl mx-auto space-y-8"
      >
        {/* Customer Profile Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center font-extrabold text-2xl border border-white/20">
              {session.name ? session.name.charAt(0).toUpperCase() : "C"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold">{session.name || "Customer Account"}</h1>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                  {session.userType === "Business" ? "B2B Business Partner" : "Retail Consumer"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-mono">
                <span className="flex items-center gap-1">
                  <Phone size={13} className="text-slate-400" />
                  +91 {session.mobile}
                </span>
                {session.email && (
                  <span className="flex items-center gap-1">
                    <Mail size={13} className="text-slate-400" />
                    {session.email}
                  </span>
                )}
                <span>Code: {session.userCode}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs rounded-xl transition flex items-center gap-2"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>

        {/* Orders List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Package size={22} className="text-sky-600" />
              My Orders & Live Dispatch Tracking
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Showing {orders.length} order{orders.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium bg-slate-50 rounded-2xl border border-slate-200">
              Loading your order history...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-slate-600 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-4">
              <ShoppingBag size={42} className="text-slate-400 mx-auto" />
              <div>
                <p className="text-lg font-bold text-slate-800">No Orders Found</p>
                <p className="text-xs text-slate-500 mt-1">You haven&apos;t placed any orders with mobile number +91 {session.mobile} yet.</p>
              </div>
              <Link
                href="/faucets/glamour-collection"
                className="inline-block px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Browse Faucets Collection
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => {
                const isExpanded = expandedOrderId === ord.id;

                return (
                  <div
                    key={ord._id || ord.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition"
                  >
                    {/* Order Bar Header */}
                    <div
                      onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                      className="p-5 bg-slate-50/70 hover:bg-slate-100/60 cursor-pointer transition flex flex-wrap items-center justify-between gap-4 border-b border-slate-100"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-extrabold text-slate-900">{ord.id}</span>
                          <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full border ${
                            ord.status === "Delivered"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : ord.status === "Shipped"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : ord.status === "Processing"
                              ? "bg-sky-50 text-sky-700 border-sky-200"
                              : "bg-amber-50 text-amber-700 border-amber-300"
                          }`}>
                            {ord.status === "Shipped" ? "🚚 Shipped / In Transit" : ord.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">Placed on {ord.orderDate}</p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-base font-extrabold text-slate-900">₹{ord.totalAmount?.toLocaleString("en-IN")}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{ord.paymentMethod}</p>
                        </div>
                        <button type="button" className="text-slate-400 hover:text-slate-700">
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* Order Details & Live Tracking Timeline */}
                    {isExpanded && (
                      <div className="p-6 space-y-6">
                        {/* Live Dispatch Tracking Progress Timeline */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                          <h3 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                            <Truck size={16} className="text-sky-600" />
                            Live Order Transport & Dispatch Tracker
                          </h3>

                          {/* 4 Steps Visual Bar */}
                          <div className="grid grid-cols-4 gap-2 text-center text-xs relative pt-2">
                            <div className="space-y-1">
                              <div className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold mx-auto text-xs">✓</div>
                              <p className="font-bold text-slate-900">Order Placed</p>
                              <p className="text-[10px] text-slate-400">{ord.orderDate}</p>
                            </div>

                            <div className="space-y-1">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold mx-auto text-xs ${
                                ord.status === "Processing" || ord.status === "Shipped" || ord.status === "Delivered" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                              }`}>
                                {ord.status === "Processing" || ord.status === "Shipped" || ord.status === "Delivered" ? "✓" : "2"}
                              </div>
                              <p className="font-bold text-slate-900">Processing</p>
                              <p className="text-[10px] text-slate-400">Quality Check</p>
                            </div>

                            <div className="space-y-1">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold mx-auto text-xs ${
                                ord.status === "Shipped" || ord.status === "Delivered" ? "bg-indigo-600 text-white ring-4 ring-indigo-100" : "bg-slate-200 text-slate-500"
                              }`}>
                                {ord.status === "Delivered" ? "✓" : "3"}
                              </div>
                              <p className="font-bold text-slate-900">In Transit</p>
                              <p className="text-[10px] text-slate-500">{ord.courierPartner || "Dispatched"}</p>
                            </div>

                            <div className="space-y-1">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold mx-auto text-xs ${
                                ord.status === "Delivered" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                              }`}>
                                {ord.status === "Delivered" ? "✓" : "4"}
                              </div>
                              <p className="font-bold text-slate-900">Delivered</p>
                              <p className="text-[10px] text-slate-400">Destination</p>
                            </div>
                          </div>

                          {/* Tracking LR Details Box */}
                          {(ord.courierPartner || ord.trackingNumber) && (
                            <div className="bg-white p-4 rounded-xl border border-indigo-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                              <div className="space-y-1">
                                <p className="font-bold text-indigo-900 flex items-center gap-1.5">
                                  <Truck size={15} className="text-indigo-600" />
                                  Carrier: {ord.courierPartner || "VRL Logistics"}
                                </p>
                                {ord.trackingNumber && <p className="font-mono text-slate-600">AWB Tracking No: <strong>{ord.trackingNumber}</strong></p>}
                                {ord.lrNumber && <p className="font-mono text-slate-600">Lorry Receipt (LR) No: <strong>{ord.lrNumber}</strong></p>}
                                {ord.vehicleNumber && <p className="font-mono text-slate-600">Dispatch Vehicle: <strong>{ord.vehicleNumber}</strong></p>}
                              </div>

                              {ord.transportNotes && (
                                <div className="p-2 bg-indigo-50/60 rounded-lg border border-indigo-100 text-[11px] text-indigo-800 italic max-w-xs">
                                  &quot;{ord.transportNotes}&quot;
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Items List */}
                        <div className="space-y-3">
                          <p className="text-xs font-extrabold text-slate-600 uppercase">Items Ordered</p>
                          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl p-3 bg-white">
                            {ord.items?.map((it, idx) => (
                              <div key={idx} className="py-2.5 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={it.image} alt={it.name} className="w-12 h-12 object-contain border border-slate-200 rounded-lg p-1 bg-slate-50" />
                                  <div>
                                    <p className="font-bold text-slate-900">{it.name}</p>
                                    <p className="text-slate-500">Color: {it.color || "Standard"} • Qty: {it.quantity}</p>
                                  </div>
                                </div>
                                <div className="text-right font-mono font-bold text-slate-900">
                                  ₹{(it.price * it.quantity).toLocaleString("en-IN")}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="text-xs text-slate-600 pt-2 border-t border-slate-100 flex items-start gap-2">
                          <MapPin size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-900">Delivery Address: </span>
                            {ord.shippingAddress?.address}, {ord.shippingAddress?.city}, {ord.shippingAddress?.state} - {ord.shippingAddress?.pinCode}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <SupportLinksSection />
      <FooterSection />
    </main>
  );
}
