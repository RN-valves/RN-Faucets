"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAdminTheme } from "@/app/admin/layout";
import {
  ArrowLeft,
  Edit,
  LogIn,
  Plus,
  Trash2,
  MapPin,
  Package,
  MessageSquare,
  UserCheck,
  RefreshCw,
  Send,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";

interface CustomerUser {
  _id: string;
  legacyId?: number;
  userCode?: string;
  uuid?: string;
  name: string;
  mobile: string;
  email?: string;
  userType: string;
  role?: string;
  profession?: string;
  businessName?: string;
  gstNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  salesUser?: string;
  status: "Active" | "InActive";
  approvalStatus?: "Pending" | "Approved" | "Rejected";
  password?: string;
  localPassword?: string;
  createdAt: string;
  addresses?: any[];
}

interface CustomerOrder {
  _id: string;
  id: string;
  legacyId?: number;
  totalAmount: number;
  subtotal?: number;
  discountAmount?: number;
  shippingAmount?: number;
  couponCode?: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  paymentKey?: string;
  orderDate: string;
  createdAt: string;
  updatedAt?: string;
  items?: any[];
}

interface CustomerRemarkLog {
  _id?: string;
  id?: string;
  remark: string;
  message: string;
  adminUserName: string;
  createdAt: string;
}

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const customerId = resolvedParams.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "basic";

  const { theme } = useAdminTheme();
  const isDark = theme === "dark";

  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [remarkLogs, setRemarkLogs] = useState<CustomerRemarkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [masterRemarks, setMasterRemarks] = useState<any[]>([]);

  // Assigned Sales User Form
  const [assignedSalesUser, setAssignedSalesUser] = useState("Direct (7500752434)");
  const [updatingSalesUser, setUpdatingSalesUser] = useState(false);

  // Remark Form
  const [selectedRemarkCategory, setSelectedRemarkCategory] = useState("");
  const [remarkMessage, setRemarkMessage] = useState("");
  const [submittingRemark, setSubmittingRemark] = useState(false);

  // Inline Add Address Form (Tab 3 - matching Image 5)
  const [newAddress, setNewAddress] = useState({
    name: "",
    mobile: "",
    pinCode: "",
    type: "Home",
    addressLine: "",
  });
  const [submittingAddress, setSubmittingAddress] = useState(false);

  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<CustomerUser>>({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Create Order Modal
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    productName: "RN Brass Sink Mixer Faucet (Chrome Finish)",
    productCode: "RN-MIX-8801",
    quantity: 1,
    price: 3450,
    discountAmount: 0,
    shippingAmount: 0,
    paymentTerm: "Prepaid",
    address: "",
    note: "Admin generated order for customer",
  });
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${customerId}`);
      if (res.ok) {
        const data = await res.json();
        setCustomer(data.user);
        setOrders(data.orders || []);
        setRemarkLogs(data.remarkLogs || []);
        setAddresses(data.user?.addresses || data.addresses || []);
        setAssignedSalesUser(data.user?.salesUser || "Direct (7500752434)");
        setNewAddress((prev) => ({
          ...prev,
          name: data.user?.name || "",
          mobile: data.user?.mobile || "",
          pinCode: data.user?.zipcode || "",
        }));
      }
    } catch (err) {
      console.error("Failed to load customer profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterRemarks = async () => {
    try {
      const res = await fetch("/api/remarks?type=master");
      if (res.ok) {
        const data = await res.json();
        setMasterRemarks(data.remarks || []);
      }
    } catch (err) {
      console.error("Failed to fetch master remarks:", err);
    }
  };

  useEffect(() => {
    fetchCustomerData();
    fetchMasterRemarks();
  }, [customerId]);

  const handleTabChange = (tabId: string) => {
    router.push(`/admin/customers/${customerId}?tab=${tabId}`);
  };

  // Format Helper
  const formatDate = (dStr?: string) => {
    if (!dStr) return "-";
    try {
      const date = new Date(dStr);
      if (isNaN(date.getTime())) return dStr;
      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dStr;
    }
  };

  const getCustomerCode = (u?: CustomerUser | null) => {
    if (!u) return "";
    if (u.userCode) return u.userCode;
    if (u.legacyId) return `CST${u.legacyId}`;
    return `CST${u._id.slice(-4)}`;
  };

  // Login As User Impersonation
  const handleLoginAsUser = async () => {
    if (!customer) return;
    try {
      const res = await fetch("/api/auth/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: customer._id, mobile: customer.mobile }),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof window !== "undefined") {
          localStorage.setItem("rn_customer_session", JSON.stringify(data.user));
          window.open("/account/orders", "_blank");
        }
      }
    } catch (err) {
      console.error("Failed to impersonate customer:", err);
    }
  };

  // Update Sales Executive
  const handleSaveAssignedSalesUser = async () => {
    if (!customer) return;
    setUpdatingSalesUser(true);
    try {
      const res = await fetch(`/api/customers/${customer._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salesUser: assignedSalesUser }),
      });
      if (res.ok) {
        setCustomer((prev) => (prev ? { ...prev, salesUser: assignedSalesUser } : null));
        alert("Assigned sales executive updated successfully!");
      }
    } catch (err) {
      console.error("Failed to update sales user:", err);
    } finally {
      setUpdatingSalesUser(false);
    }
  };

  // Submit Remark Log
  const handleSubmitRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    if (!selectedRemarkCategory && !remarkMessage.trim()) return;

    setSubmittingRemark(true);
    try {
      const res = await fetch("/api/remarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logableId: customer.legacyId,
          customerName: customer.name,
          customerMobile: customer.mobile,
          remark: selectedRemarkCategory || "General Remark",
          message: remarkMessage.trim(),
          adminUserName: "Admin",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRemarkLogs((prev) => [data.log, ...prev]);
        setRemarkMessage("");
        setSelectedRemarkCategory("");
      }
    } catch (err) {
      console.error("Failed to submit remark:", err);
    } finally {
      setSubmittingRemark(false);
    }
  };

  // Submit Inline Address Form (Image 5)
  const handleSubmitInlineAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setSubmittingAddress(true);
    try {
      const newAddrObj = {
        id: `addr-${Date.now()}`,
        legacyId: Math.floor(1000 + Math.random() * 9000),
        name: newAddress.name || customer.name,
        phone: newAddress.mobile || customer.mobile,
        mobile: newAddress.mobile || customer.mobile,
        addressLine: newAddress.addressLine,
        address: newAddress.addressLine,
        city: customer.city || "KHORDA",
        state: customer.state || "Odisha",
        pinCode: newAddress.pinCode || customer.zipcode || "",
        zipcode: newAddress.pinCode || customer.zipcode || "",
        type: newAddress.type,
      };

      const updatedList = [...addresses, newAddrObj];
      const res = await fetch(`/api/customers/${customer._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: updatedList }),
      });

      if (res.ok) {
        setAddresses(updatedList);
        setNewAddress({
          name: customer.name,
          mobile: customer.mobile,
          pinCode: customer.zipcode || "",
          type: "Home",
          addressLine: "",
        });
        alert("Delivery address added successfully!");
      }
    } catch (err) {
      console.error("Failed to save address:", err);
    } finally {
      setSubmittingAddress(false);
    }
  };

  // Open & Save Profile Edit Modal
  const handleOpenEdit = () => {
    if (!customer) return;
    setEditFormData({
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email,
      userCode: customer.userCode,
      profession: customer.profession || "Consumer",
      userType: customer.userType,
      gstNumber: customer.gstNumber,
      businessName: customer.businessName,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zipcode: customer.zipcode,
      status: customer.status,
      approvalStatus: customer.approvalStatus,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/customers/${customer._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      if (res.ok) {
        const updated = await res.json();
        setCustomer((prev) => ({ ...prev, ...updated }));
        setShowEditModal(false);
      }
    } catch (err) {
      console.error("Failed to update customer:", err);
    } finally {
      setSavingEdit(false);
    }
  };

  // Submit Order Creation
  const handleSubmitCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setSubmittingOrder(true);
    try {
      const subtotal = orderFormData.quantity * orderFormData.price;
      const totalAmount = Math.max(0, subtotal - Number(orderFormData.discountAmount) + Number(orderFormData.shippingAmount));

      const payload = {
        userId: customer.legacyId,
        customerName: customer.name,
        customerPhone: customer.mobile,
        customerEmail: customer.email || "",
        shippingAddress: {
          name: customer.name,
          phone: customer.mobile,
          addressLine: orderFormData.address || customer.address,
          city: customer.city || "",
          state: customer.state || "",
          pinCode: customer.zipcode || "",
        },
        items: [
          {
            id: `item-${Date.now()}`,
            name: orderFormData.productName,
            productCode: orderFormData.productCode,
            quantity: Number(orderFormData.quantity),
            price: Number(orderFormData.price),
            color: "Chrome",
            size: "Standard",
          },
        ],
        subtotal,
        discountAmount: Number(orderFormData.discountAmount),
        shippingAmount: Number(orderFormData.shippingAmount),
        totalAmount,
        paymentTerm: orderFormData.paymentTerm,
        paymentMethod: orderFormData.paymentTerm === "Prepaid" ? "Online Payment" : "Credit",
        paymentStatus: orderFormData.paymentTerm === "Prepaid" ? "Paid" : "Pending",
        status: "Pending",
        notes: orderFormData.note,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const createdOrder = await res.json();
        setOrders((prev) => [createdOrder, ...prev]);
        setShowCreateOrderModal(false);
        router.push(`/admin/customers/${customerId}?tab=orders`);
      }
    } catch (err) {
      console.error("Failed to create order:", err);
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw size={28} className="animate-spin text-sky-500" />
        <p className="text-sm font-semibold text-slate-500">Loading customer profile & records...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-500 mb-2">Customer Not Found</h2>
        <p className="text-sm text-slate-500 mb-4">No record matches the requested customer identifier.</p>
        <Link
          href="/admin/customers"
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Return to Customers Network
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16">
      {/* Top Breadcrumbs & Page Header Matching Laravel Image 3 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3" style={{ borderColor: isDark ? "#30363D" : "#E2E8F0" }}>
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
            Dashboard
          </h1>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
            <Link href="/admin/customers" className="hover:text-sky-500 hover:underline">
              Home
            </Link>
            <span>/</span>
            <Link href="/admin/customers" className="hover:text-sky-500 hover:underline">
              Users
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Customer Details - {getCustomerCode(customer)}
            </span>
          </div>
        </div>

        {/* Header Action Buttons Matching Image 3: Edit (Blue), Back (Yellow) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenEdit}
            style={{
              background: "#0284C7",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "6px",
              padding: "7px 16px",
              fontSize: "12.5px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <Edit size={14} /> Edit
          </button>

          <Link
            href="/admin/customers"
            style={{
              background: "#EAB308",
              color: "#000000",
              border: "none",
              borderRadius: "6px",
              padding: "7px 16px",
              fontSize: "12.5px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              textDecoration: "none",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <ArrowLeft size={14} /> Back
          </Link>
        </div>
      </div>

      {/* 4 URL-Driven Tabs Bar (Matching Laravel Images 3, 4, 5) */}
      <div
        style={{
          borderBottom: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
          background: isDark ? "#161B22" : "#FFFFFF",
          borderRadius: "8px 8px 0 0",
          padding: "6px 12px 0",
          display: "flex",
          gap: "4px",
          overflowX: "auto",
        }}
      >
        {[
          { id: "basic", label: "Basic Details", icon: UserCheck },
          { id: "orders", label: `Orders (${orders.length})`, icon: Package },
          { id: "addresses", label: `Addresses (${addresses.length})`, icon: MapPin },
          { id: "remarks", label: `Complete Remark Log (${remarkLogs.length})`, icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              style={{
                padding: "10px 18px",
                borderRadius: "6px 6px 0 0",
                fontSize: "13px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "7px",
                cursor: "pointer",
                border: "none",
                borderBottom: isActive ? "3px solid #0284C7" : "3px solid transparent",
                background: isActive ? (isDark ? "#21262D" : "#0284C7") : "transparent",
                color: isActive ? "#FFFFFF" : isDark ? "#8B949E" : "#64748B",
                transition: "all 0.15s ease-in-out",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BASIC DETAILS VIEW (Exact Match with Image 3: media_1789812714239.png) */}
      {/* ========================================================================= */}
      {activeTab === "basic" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: "20px",
            alignItems: "start",
          }}
          className="customer-grid-layout"
        >
          {/* Left Column: Basic Details Key-Value Table + Assigned Sales User */}
          <div className="space-y-4">
            {/* Clean Key-Value Profile Table */}
            <div
              style={{
                background: isDark ? "#161B22" : "#FFFFFF",
                border: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
                borderRadius: "8px",
                overflow: "hidden",
                fontSize: "13px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {[
                    { label: "Name", value: `${customer.name} (UType: ${customer.userType})` },
                    { label: "Email", value: customer.email || "-" },
                    { label: "Phone", value: customer.mobile ? `+91-${customer.mobile}` : "-" },
                    {
                      label: "Address",
                      value:
                        [customer.address, customer.zipcode, customer.city, customer.state, "India"]
                          .filter(Boolean)
                          .join(", ") || "-",
                    },
                    { label: "Created Date", value: formatDate(customer.createdAt) },
                    { label: "Code", value: customer.userCode || getCustomerCode(customer), mono: true },
                    { label: "GST Number", value: customer.gstNumber || "-" },
                    { label: "Profession/Type", value: customer.profession || customer.role || customer.userType },
                    { label: "Sales User", value: customer.salesUser || "Direct" },
                    {
                      label: "Password",
                      value: customer.localPassword || customer.password || customer.mobile,
                      mono: true,
                    },
                    { label: "Assigned Roles", value: customer.userType || "Customer", pill: true },
                    { label: "Account Status", value: customer.status, statusPill: true },
                    {
                      label: "Login",
                      isLoginButton: true,
                    },
                  ].map((row, idx) => (
                    <tr
                      key={row.label}
                      style={{
                        borderBottom: isDark ? "1px solid #21262D" : "1px solid #F1F5F9",
                        background: idx % 2 === 0 ? (isDark ? "#161B22" : "#FFFFFF") : (isDark ? "#1A202C" : "#F8FAFC"),
                      }}
                    >
                      <td
                        style={{
                          padding: "11px 18px",
                          fontWeight: 700,
                          color: isDark ? "#8B949E" : "#475569",
                          width: "180px",
                          verticalAlign: "middle",
                        }}
                      >
                        {row.label}
                      </td>
                      <td
                        style={{
                          padding: "11px 18px",
                          color: isDark ? "#F0F6FC" : "#0F172A",
                          fontWeight: 600,
                          verticalAlign: "middle",
                        }}
                      >
                        {row.isLoginButton ? (
                          <button
                            type="button"
                            onClick={handleLoginAsUser}
                            style={{
                              background: "#EAB308",
                              color: "#000000",
                              border: "none",
                              borderRadius: "5px",
                              padding: "5px 14px",
                              fontSize: "12px",
                              fontWeight: 800,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              cursor: "pointer",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                            }}
                          >
                            <LogIn size={13} /> Login As User
                          </button>
                        ) : row.mono ? (
                          <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0284C7" }}>
                            {row.value}
                          </span>
                        ) : row.pill ? (
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: "4px",
                              background: "#D1FAE5",
                              color: "#065F46",
                              fontSize: "11.5px",
                              fontWeight: 700,
                            }}
                          >
                            {row.value}
                          </span>
                        ) : row.statusPill ? (
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: "4px",
                              background: row.value === "Active" ? "#D1FAE5" : "#FEE2E2",
                              color: row.value === "Active" ? "#065F46" : "#991B1B",
                              fontSize: "11.5px",
                              fontWeight: 700,
                            }}
                          >
                            {row.value}
                          </span>
                        ) : (
                          row.value
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Edit Assigned Users Box (Image 3: Bottom Left) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div
                style={{
                  background: isDark ? "#161B22" : "#FFFFFF",
                  border: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
                  borderRadius: "8px",
                  padding: "16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
                className="space-y-3"
              >
                <div style={{ fontSize: "12.5px", fontWeight: 800, color: isDark ? "#8B949E" : "#475569", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Edit size={14} className="text-sky-500" /> Edit Assigned Users
                </div>

                <div
                  style={{
                    border: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
                    borderRadius: "6px",
                    overflow: "hidden",
                    fontSize: "12px",
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: isDark ? "#0D1117" : "#F8FAFC", borderBottom: isDark ? "1px solid #30363D" : "1px solid #E2E8F0" }}>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700 }}>Sales Role</th>
                        <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700 }}>Assigned Users</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: "8px 12px", fontWeight: 600 }}>Direct</td>
                        <td style={{ padding: "8px 12px", color: "#0284C7", fontWeight: 700 }}>
                          {customer.salesUser || "2387238"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: isDark ? "#8B949E" : "#64748B", display: "block", marginBottom: "4px" }}>
                    Select Users
                  </label>
                  <select
                    value={assignedSalesUser}
                    onChange={(e) => setAssignedSalesUser(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
                      background: isDark ? "#0D1117" : "#FFFFFF",
                      color: isDark ? "#F0F6FC" : "#0F172A",
                      fontSize: "12px",
                      outline: "none",
                      marginBottom: "8px",
                    }}
                  >
                    <option value="Direct (7500752434)">Direct (7500752434)</option>
                    <option value="RN Sales Head (North)">RN Sales Head (North)</option>
                    <option value="RN Sales Executive (South)">RN Sales Executive (South)</option>
                    <option value="RN Sales Executive (East)">RN Sales Executive (East)</option>
                    <option value="RN Sales Executive (West)">RN Sales Executive (West)</option>
                  </select>

                  <button
                    type="button"
                    disabled={updatingSalesUser}
                    onClick={handleSaveAssignedSalesUser}
                    style={{
                      background: "#0284C7",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "6px",
                      padding: "6px 14px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {updatingSalesUser ? "Saving..." : "Submit"}
                  </button>
                </div>
              </div>

              {/* Edit Assigned User Log */}
              <div
                style={{
                  background: isDark ? "#161B22" : "#FFFFFF",
                  border: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
                  borderRadius: "8px",
                  padding: "16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
                className="space-y-2"
              >
                <div style={{ fontSize: "12.5px", fontWeight: 800, color: isDark ? "#8B949E" : "#475569", display: "flex", alignItems: "center", gap: "6px" }}>
                  <RefreshCw size={14} className="text-sky-500" /> Edit Assigned User Log
                </div>
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "6px",
                    border: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
                    background: isDark ? "#0D1117" : "#F8FAFC",
                    fontSize: "12px",
                    color: isDark ? "#8B949E" : "#64748B",
                  }}
                >
                  <p className="m-0 font-medium">
                    Current Assigned: <strong>{customer.salesUser || "Direct (7500752434)"}</strong>
                  </p>
                  <p className="text-xs text-slate-400 mt-1 mb-0">Initial assignment created during customer migration.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Remark Submission & Remark Log Report (Matching Image 3) */}
          <div className="space-y-4">
            <div
              style={{
                background: isDark ? "#161B22" : "#FFFFFF",
                border: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
                borderRadius: "8px",
                padding: "16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
              className="space-y-3"
            >
              <form onSubmit={handleSubmitRemark} className="space-y-3">
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: isDark ? "#8B949E" : "#64748B", display: "block", marginBottom: "4px" }}>
                    Select Remark
                  </label>
                  <select
                    value={selectedRemarkCategory}
                    onChange={(e) => setSelectedRemarkCategory(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
                      background: isDark ? "#0D1117" : "#FFFFFF",
                      color: isDark ? "#F0F6FC" : "#0F172A",
                      fontSize: "12px",
                      outline: "none",
                    }}
                  >
                    <option value="">Select</option>
                    {masterRemarks.map((r) => (
                      <option key={r.id || r._id || r.name} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                    <option value="KYC Verified">KYC Verified</option>
                    <option value="Interested in Dealership">Interested in Dealership</option>
                    <option value="Call Not Received">Call Not Received</option>
                    <option value="Address Validated">Address Validated</option>
                    <option value="Discount Negotiated">Discount Negotiated</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: isDark ? "#8B949E" : "#64748B", display: "block", marginBottom: "4px" }}>
                    Enter Message
                  </label>
                  <textarea
                    rows={4}
                    value={remarkMessage}
                    onChange={(e) => setRemarkMessage(e.target.value)}
                    placeholder="Enter Remarks"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
                      background: isDark ? "#0D1117" : "#FFFFFF",
                      color: isDark ? "#F0F6FC" : "#0F172A",
                      fontSize: "12px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingRemark}
                  style={{
                    background: "#0284C7",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "6px",
                    padding: "7px 18px",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <Send size={13} /> {submittingRemark ? "Submitting..." : "Submit"}
                </button>
              </form>
            </div>

            {/* Remark Log Report Card (Image 3: Right Bottom) */}
            <div
              style={{
                background: isDark ? "#161B22" : "#FFFFFF",
                border: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
                borderRadius: "8px",
                padding: "16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
              className="space-y-3"
            >
              <div style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: isDark ? "#8B949E" : "#64748B", display: "flex", alignItems: "center", gap: "6px" }}>
                <MessageSquare size={13} className="text-sky-500" /> Remark Log Report ({remarkLogs.length})
              </div>

              {remarkLogs.length === 0 ? (
                <div style={{ padding: "16px", textAlign: "center", fontSize: "12px", color: isDark ? "#8B949E" : "#64748B" }}>
                  No previous remarks logged.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {remarkLogs.map((log, idx) => (
                    <div
                      key={log._id || log.id || idx}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "6px",
                        border: isDark ? "1px solid #21262D" : "1px solid #F1F5F9",
                        background: isDark ? "#0D1117" : "#F8FAFC",
                        fontSize: "12px",
                      }}
                      className="space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span style={{ fontWeight: 800, color: "#0284C7" }}>🏷️ {log.remark}</span>
                        <span style={{ fontSize: "10.5px", color: isDark ? "#8B949E" : "#64748B" }}>
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                      {log.message && (
                        <p style={{ margin: 0, color: isDark ? "#E6EDF3" : "#334155", fontSize: "11.5px" }}>
                          {log.message}
                        </p>
                      )}
                      <div style={{ fontSize: "10.5px", color: isDark ? "#8B949E" : "#64748B" }}>
                        By {log.adminUserName || "Admin"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ORDERS VIEW (Exact Match with Image 4: media_1789812727899.png) */}
      {/* ========================================================================= */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {/* Top Box: Basic Details (Customer Info Card matching Image 4) */}
          <div
            style={{
              background: isDark ? "#161B22" : "#FFFFFF",
              border: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
              borderRadius: "8px",
              padding: "16px 20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
            className="space-y-2"
          >
            <h3 style={{ fontSize: "13.5px", fontWeight: 800, margin: 0, color: isDark ? "#F0F6FC" : "#0F172A" }}>
              Basic Details
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
                fontSize: "12.5px",
              }}
            >
              <div>
                <span className="text-slate-400">Name: </span>
                <strong className="text-slate-900 dark:text-white">{customer.name}</strong>
              </div>
              <div>
                <span className="text-slate-400">Mobile: </span>
                <strong>+91{customer.mobile}</strong>
              </div>
              <div>
                <span className="text-slate-400">Email: </span>
                <span>{customer.email || "-"}</span>
              </div>
              <div>
                <span className="text-slate-400">City: </span>
                <strong>{customer.city || "-"}</strong>
              </div>
              <div>
                <span className="text-slate-400">State: </span>
                <strong>{customer.state || "-"}</strong>
              </div>
              <div>
                <span className="text-slate-400">Pincode: </span>
                <strong>{customer.zipcode || "-"}</strong>
              </div>
            </div>
          </div>

          {/* Customer - Order List Table (Matching Image 4) */}
          <div
            style={{
              background: isDark ? "#161B22" : "#FFFFFF",
              border: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                padding: "12px 18px",
                borderBottom: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <h3 style={{ fontSize: "14px", fontWeight: 800, margin: 0, textTransform: "uppercase" }}>
                {customer.name} - Order List ({orders.length})
              </h3>

              <button
                type="button"
                onClick={() => {
                  setOrderFormData((prev) => ({
                    ...prev,
                    address: [customer.address, customer.city, customer.state, customer.zipcode].filter(Boolean).join(", ") || "",
                  }));
                  setShowCreateOrderModal(true);
                }}
                style={{
                  background: "#059669",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "pointer",
                }}
              >
                <ShoppingCart size={13} /> + Create Order for Customer
              </button>
            </div>

            <div className="overflow-x-auto">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                <thead>
                  <tr
                    style={{
                      background: isDark ? "#0D1117" : "#F8FAFC",
                      borderBottom: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
                      color: isDark ? "#8B949E" : "#475569",
                      fontWeight: 700,
                    }}
                  >
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>ID</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>OrderDate</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>discount_code</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>discount_amount</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>shipping_amount</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>total_amount</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>status</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>is_payment</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>payment_key</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>payment_term</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>updated_at</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ padding: "30px", textAlign: "center", color: isDark ? "#8B949E" : "#64748B" }}>
                        <Package size={24} className="mx-auto mb-2 text-sky-500" />
                        No orders recorded for this customer yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord, idx) => (
                      <tr
                        key={ord._id || ord.id || idx}
                        style={{
                          borderBottom: isDark ? "1px solid #21262D" : "1px solid #F1F5F9",
                          background: idx % 2 === 0 ? (isDark ? "#161B22" : "#FFFFFF") : (isDark ? "#1A202C" : "#F8FAFC"),
                        }}
                      >
                        <td style={{ padding: "10px 14px", fontFamily: "monospace", fontWeight: 800, color: "#0284C7" }}>
                          {ord.id.startsWith("RN-ORD") ? `#OD${ord.id.slice(-3)}` : ord.id}
                        </td>
                        <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                          {ord.orderDate || formatDate(ord.createdAt)}
                        </td>
                        <td style={{ padding: "10px 14px", fontFamily: "monospace" }}>
                          {ord.couponCode || "RN05OFF"}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          {ord.discountAmount ? ord.discountAmount.toFixed(1) : "0"}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          {ord.shippingAmount || 0}
                        </td>
                        <td style={{ padding: "10px 14px", fontWeight: 800 }}>
                          {ord.totalAmount?.toFixed(1) || "0.0"}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background:
                                ord.status === "Delivered"
                                  ? "#D1FAE5"
                                  : ord.status === "Cancelled"
                                  ? "#FEE2E2"
                                  : "#FEF3C7",
                              color:
                                ord.status === "Delivered"
                                  ? "#065F46"
                                  : ord.status === "Cancelled"
                                  ? "#991B1B"
                                  : "#B45309",
                            }}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background:
                                ord.paymentStatus === "Paid" || ord.paymentStatus === "Completed"
                                  ? "#059669"
                                  : "#DC2626",
                              color: "#FFFFFF",
                            }}
                          >
                            {ord.paymentStatus === "Paid" || ord.paymentStatus === "Completed" ? "Yes" : "No"}
                          </span>
                        </td>
                        <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: "11px" }}>
                          {ord.paymentKey || `pay_${ord.id.replace(/\D/g, "").slice(0, 10)}`}
                        </td>
                        <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                          {ord.paymentMethod || "Prepaid"}
                        </td>
                        <td style={{ padding: "10px 14px", whiteSpace: "nowrap", fontSize: "11.5px", color: isDark ? "#8B949E" : "#64748B" }}>
                          {formatDate(ord.updatedAt || ord.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ADDRESSES VIEW (Exact Match with Image 5: media_1789812738945.png) */}
      {/* ========================================================================= */}
      {activeTab === "addresses" && (
        <div className="space-y-4">
          {/* Top Box: Basic Details (Customer Info Card matching Image 5) */}
          <div
            style={{
              background: isDark ? "#161B22" : "#FFFFFF",
              border: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
              borderRadius: "8px",
              padding: "16px 20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
            className="space-y-2"
          >
            <h3 style={{ fontSize: "13.5px", fontWeight: 800, margin: 0, color: isDark ? "#F0F6FC" : "#0F172A" }}>
              Basic Details
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
                fontSize: "12.5px",
              }}
            >
              <div>
                <span className="text-slate-400">Name: </span>
                <strong className="text-slate-900 dark:text-white">{customer.name}</strong>
              </div>
              <div>
                <span className="text-slate-400">Mobile: </span>
                <strong>+91{customer.mobile}</strong>
              </div>
              <div>
                <span className="text-slate-400">Email: </span>
                <span>{customer.email || "-"}</span>
              </div>
              <div>
                <span className="text-slate-400">City: </span>
                <strong>{customer.city || "-"}</strong>
              </div>
              <div>
                <span className="text-slate-400">State: </span>
                <strong>{customer.state || "-"}</strong>
              </div>
              <div>
                <span className="text-slate-400">Pincode: </span>
                <strong>{customer.zipcode || "-"}</strong>
              </div>
            </div>
          </div>

          {/* Inline Add Address Form Matching Image 5 */}
          <div
            style={{
              background: isDark ? "#161B22" : "#FFFFFF",
              border: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
              borderRadius: "8px",
              padding: "18px 20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <form onSubmit={handleSubmitInlineAddress} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Value"
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                    className="w-full p-2 border rounded-md text-xs bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Mobile</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Value"
                    value={newAddress.mobile}
                    onChange={(e) => setNewAddress({ ...newAddress, mobile: e.target.value })}
                    className="w-full p-2 border rounded-md text-xs bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Value"
                    value={newAddress.pinCode}
                    onChange={(e) => setNewAddress({ ...newAddress, pinCode: e.target.value })}
                    className="w-full p-2 border rounded-md text-xs bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Address Type</label>
                  <select
                    value={newAddress.type}
                    onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value })}
                    className="w-full p-2 border rounded-md text-xs bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  >
                    <option value="Home" style={{ background: isDark ? "#161B22" : "#FFF" }}>Home</option>
                    <option value="Work / Office" style={{ background: isDark ? "#161B22" : "#FFF" }}>Work / Office</option>
                    <option value="Warehouse / Site" style={{ background: isDark ? "#161B22" : "#FFF" }}>Warehouse / Site</option>
                    <option value="Billing Address" style={{ background: isDark ? "#161B22" : "#FFF" }}>Billing Address</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1">Address</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Enter Value"
                  value={newAddress.addressLine}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                  className="w-full p-2 border rounded-md text-xs bg-transparent"
                  style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingAddress}
                style={{
                  background: "#0284C7",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "5px",
                  padding: "6px 18px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {submittingAddress ? "Saving..." : "Submit"}
              </button>
            </form>
          </div>

          {/* Address List Table Matching Image 5 */}
          <div
            style={{
              background: isDark ? "#161B22" : "#FFFFFF",
              border: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                padding: "12px 18px",
                borderBottom: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
                fontWeight: 800,
                fontSize: "13.5px",
              }}
            >
              Address List ({addresses.length})
            </div>

            <div className="overflow-x-auto">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr
                    style={{
                      background: isDark ? "#0D1117" : "#F8FAFC",
                      borderBottom: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
                      color: isDark ? "#8B949E" : "#475569",
                      fontWeight: 700,
                    }}
                  >
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>ID</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Name</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Mobile</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Pincode</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>City</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>State</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Type</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Address</th>
                    <th style={{ padding: "10px 14px", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {addresses.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: "30px", textAlign: "center", color: isDark ? "#8B949E" : "#64748B" }}>
                        <MapPin size={24} className="mx-auto mb-2 text-sky-500" />
                        No saved delivery addresses on file. Use the form above to register an address.
                      </td>
                    </tr>
                  ) : (
                    addresses.map((addr, idx) => (
                      <tr
                        key={addr.id || addr.legacyId || idx}
                        style={{
                          borderBottom: isDark ? "1px solid #21262D" : "1px solid #F1F5F9",
                          background: idx % 2 === 0 ? (isDark ? "#161B22" : "#FFFFFF") : (isDark ? "#1A202C" : "#F8FAFC"),
                        }}
                      >
                        <td style={{ padding: "10px 14px", fontFamily: "monospace", fontWeight: 700, color: "#0284C7" }}>
                          {addr.legacyId || 700 + idx}
                        </td>
                        <td style={{ padding: "10px 14px", fontWeight: 700 }}>
                          {addr.name || customer.name}
                        </td>
                        <td style={{ padding: "10px 14px", fontFamily: "monospace" }}>
                          {addr.phone || addr.mobile || customer.mobile}
                        </td>
                        <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                          {addr.pinCode || addr.zipcode || customer.zipcode || "-"}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          {addr.city || customer.city || "-"}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          {addr.state || customer.state || "-"}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              background: isDark ? "#21262D" : "#E2E8F0",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            {addr.type || "Home"}
                          </span>
                        </td>
                        <td style={{ padding: "10px 14px", maxWidth: "340px" }}>
                          {addr.addressLine || addr.address}
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right" }}>
                          <button
                            type="button"
                            onClick={() => {
                              setNewAddress({
                                name: addr.name || customer.name,
                                mobile: addr.phone || addr.mobile || customer.mobile,
                                pinCode: addr.pinCode || addr.zipcode || customer.zipcode || "",
                                type: addr.type || "Home",
                                addressLine: addr.addressLine || addr.address || "",
                              });
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            style={{
                              background: "#EAB308",
                              color: "#000000",
                              border: "none",
                              borderRadius: "4px",
                              padding: "3px 10px",
                              fontSize: "11px",
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: COMPLETE REMARK LOG VIEW */}
      {/* ========================================================================= */}
      {activeTab === "remarks" && (
        <div className="space-y-4">
          {/* Top Box: Basic Details */}
          <div
            style={{
              background: isDark ? "#161B22" : "#FFFFFF",
              border: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
              borderRadius: "8px",
              padding: "16px 20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
            className="space-y-2"
          >
            <h3 style={{ fontSize: "13.5px", fontWeight: 800, margin: 0, color: isDark ? "#F0F6FC" : "#0F172A" }}>
              Basic Details
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
                fontSize: "12.5px",
              }}
            >
              <div>
                <span className="text-slate-400">Name: </span>
                <strong className="text-slate-900 dark:text-white">{customer.name}</strong>
              </div>
              <div>
                <span className="text-slate-400">Mobile: </span>
                <strong>+91{customer.mobile}</strong>
              </div>
              <div>
                <span className="text-slate-400">Email: </span>
                <span>{customer.email || "-"}</span>
              </div>
              <div>
                <span className="text-slate-400">City: </span>
                <strong>{customer.city || "-"}</strong>
              </div>
              <div>
                <span className="text-slate-400">State: </span>
                <strong>{customer.state || "-"}</strong>
              </div>
              <div>
                <span className="text-slate-400">Pincode: </span>
                <strong>{customer.zipcode || "-"}</strong>
              </div>
            </div>
          </div>

          {/* Remark Log Table */}
          <div
            style={{
              background: isDark ? "#161B22" : "#FFFFFF",
              border: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                padding: "12px 18px",
                borderBottom: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
                fontWeight: 800,
                fontSize: "13.5px",
                textTransform: "uppercase",
              }}
            >
              {customer.name} - Complete Remark Audit History ({remarkLogs.length})
            </div>

            <div className="overflow-x-auto">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                <thead>
                  <tr
                    style={{
                      background: isDark ? "#0D1117" : "#F8FAFC",
                      borderBottom: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
                      color: isDark ? "#8B949E" : "#475569",
                      fontWeight: 700,
                    }}
                  >
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>#</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Remark Category</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Message / Notes</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Admin Staff</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Recorded Date</th>
                  </tr>
                </thead>
                <tbody>
                  {remarkLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: "30px", textAlign: "center", color: isDark ? "#8B949E" : "#64748B" }}>
                        <MessageSquare size={24} className="mx-auto mb-2 text-sky-500" />
                        No remarks or interaction notes recorded for this customer.
                      </td>
                    </tr>
                  ) : (
                    remarkLogs.map((log, idx) => (
                      <tr
                        key={log._id || log.id || idx}
                        style={{
                          borderBottom: isDark ? "1px solid #21262D" : "1px solid #F1F5F9",
                          background: idx % 2 === 0 ? (isDark ? "#161B22" : "#FFFFFF") : (isDark ? "#1A202C" : "#F8FAFC"),
                        }}
                      >
                        <td style={{ padding: "10px 14px", fontWeight: 700, color: isDark ? "#8B949E" : "#64748B" }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: "10px 14px", fontWeight: 800, color: "#0284C7" }}>
                          🏷️ {log.remark}
                        </td>
                        <td style={{ padding: "10px 14px", maxWidth: "450px" }}>
                          {log.message || "-"}
                        </td>
                        <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                          {log.adminUserName || "Admin"}
                        </td>
                        <td style={{ padding: "10px 14px", whiteSpace: "nowrap", color: isDark ? "#8B949E" : "#64748B" }}>
                          {formatDate(log.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div
            style={{
              background: isDark ? "#161B22" : "#FFFFFF",
              color: isDark ? "#F0F6FC" : "#0F172A",
              border: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            className="rounded-2xl max-w-2xl w-full p-6 space-y-4 relative my-8"
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: isDark ? "#30363D" : "#E2E8F0" }}>
              <div className="flex items-center gap-2">
                <Edit size={18} className="text-sky-500" />
                <h3 className="text-base font-bold">
                  Edit Customer Profile ({customer.name} - {getCustomerCode(customer)})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.mobile || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={editFormData.email || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Customer Code</label>
                  <input
                    type="text"
                    value={editFormData.userCode || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, userCode: e.target.value })}
                    className="w-full p-2 border rounded-lg text-sm font-mono bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Profession / Role</label>
                  <select
                    value={editFormData.profession || editFormData.userType || "Consumer"}
                    onChange={(e) => setEditFormData({ ...editFormData, profession: e.target.value })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  >
                    <option value="Consumer" style={{ background: isDark ? "#161B22" : "#FFF" }}>Consumer</option>
                    <option value="Retailer" style={{ background: isDark ? "#161B22" : "#FFF" }}>Retailer</option>
                    <option value="Dealer" style={{ background: isDark ? "#161B22" : "#FFF" }}>Dealer</option>
                    <option value="Distributor" style={{ background: isDark ? "#161B22" : "#FFF" }}>Distributor</option>
                    <option value="Architect" style={{ background: isDark ? "#161B22" : "#FFF" }}>Architect</option>
                    <option value="Contractor" style={{ background: isDark ? "#161B22" : "#FFF" }}>Contractor</option>
                    <option value="Plumber" style={{ background: isDark ? "#161B22" : "#FFF" }}>Plumber</option>
                    <option value="Employee" style={{ background: isDark ? "#161B22" : "#FFF" }}>Employee</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Company / Business Name</label>
                  <input
                    type="text"
                    value={editFormData.businessName || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, businessName: e.target.value })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">GST Number</label>
                  <input
                    type="text"
                    value={editFormData.gstNumber || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, gstNumber: e.target.value })}
                    className="w-full p-2 border rounded-lg text-sm uppercase bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Street Address</label>
                <input
                  type="text"
                  value={editFormData.address || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full p-2 border rounded-lg text-sm bg-transparent"
                  style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">City</label>
                  <input
                    type="text"
                    value={editFormData.city || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">State</label>
                  <input
                    type="text"
                    value={editFormData.state || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Zipcode / PIN</label>
                  <input
                    type="text"
                    value={editFormData.zipcode || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, zipcode: e.target.value })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Account Status</label>
                  <select
                    value={editFormData.status || "Active"}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent font-semibold"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  >
                    <option value="Active" style={{ background: isDark ? "#161B22" : "#FFF", color: "#059669" }}>Active</option>
                    <option value="InActive" style={{ background: isDark ? "#161B22" : "#FFF", color: "#DC2626" }}>InActive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Approval Status</label>
                  <select
                    value={editFormData.approvalStatus || "Approved"}
                    onChange={(e) => setEditFormData({ ...editFormData, approvalStatus: e.target.value as any })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent font-semibold"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  >
                    <option value="Approved" style={{ background: isDark ? "#161B22" : "#FFF", color: "#059669" }}>Approved</option>
                    <option value="Pending" style={{ background: isDark ? "#161B22" : "#FFF", color: "#D97706" }}>Pending</option>
                    <option value="Rejected" style={{ background: isDark ? "#161B22" : "#FFF", color: "#DC2626" }}>Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: isDark ? "#30363D" : "#E2E8F0" }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border text-slate-600 dark:text-slate-400 font-semibold text-sm rounded-lg"
                  style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-lg shadow-sm"
                >
                  {savingEdit ? "Saving..." : "Save Customer Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showCreateOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div
            style={{
              background: isDark ? "#161B22" : "#FFFFFF",
              color: isDark ? "#F0F6FC" : "#0F172A",
              border: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            className="rounded-2xl max-w-xl w-full p-6 space-y-4 relative my-8"
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: isDark ? "#30363D" : "#E2E8F0" }}>
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-emerald-500" />
                <h3 className="text-base font-bold">
                  Create Order for {customer.name} ({getCustomerCode(customer)})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateOrderModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitCreateOrder} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={orderFormData.productName}
                  onChange={(e) => setOrderFormData({ ...orderFormData, productName: e.target.value })}
                  className="w-full p-2 border rounded-lg text-sm bg-transparent"
                  style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Product Code</label>
                  <input
                    type="text"
                    required
                    value={orderFormData.productCode}
                    onChange={(e) => setOrderFormData({ ...orderFormData, productCode: e.target.value })}
                    className="w-full p-2 border rounded-lg text-sm font-mono bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={orderFormData.quantity}
                    onChange={(e) => setOrderFormData({ ...orderFormData, quantity: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent font-bold"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Unit Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={orderFormData.price}
                    onChange={(e) => setOrderFormData({ ...orderFormData, price: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent font-bold"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={orderFormData.discountAmount}
                    onChange={(e) => setOrderFormData({ ...orderFormData, discountAmount: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Shipping Charge (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={orderFormData.shippingAmount}
                    onChange={(e) => setOrderFormData({ ...orderFormData, shippingAmount: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Payment Term</label>
                  <select
                    value={orderFormData.paymentTerm}
                    onChange={(e) => setOrderFormData({ ...orderFormData, paymentTerm: e.target.value as any })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent font-semibold"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  >
                    <option value="Prepaid" style={{ background: isDark ? "#161B22" : "#FFF" }}>Prepaid (100% Advanced)</option>
                    <option value="Credit" style={{ background: isDark ? "#161B22" : "#FFF" }}>Credit (Channel Partner)</option>
                    <option value="Cash on Delivery" style={{ background: isDark ? "#161B22" : "#FFF" }}>Cash on Delivery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Total Bill Amount</label>
                  <div
                    className="p-2 border rounded-lg text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1", background: isDark ? "#0D1117" : "#F8FAFC" }}
                  >
                    <span>Total:</span>
                    <span>
                      ₹{Math.max(0, orderFormData.quantity * orderFormData.price - Number(orderFormData.discountAmount) + Number(orderFormData.shippingAmount)).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Delivery Address *</label>
                <input
                  type="text"
                  required
                  value={orderFormData.address}
                  onChange={(e) => setOrderFormData({ ...orderFormData, address: e.target.value })}
                  className="w-full p-2 border rounded-lg text-sm bg-transparent"
                  style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Order Notes / Remark</label>
                <input
                  type="text"
                  value={orderFormData.note}
                  onChange={(e) => setOrderFormData({ ...orderFormData, note: e.target.value })}
                  className="w-full p-2 border rounded-lg text-sm bg-transparent"
                  style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: isDark ? "#30363D" : "#E2E8F0" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateOrderModal(false)}
                  className="px-4 py-2 border text-slate-600 dark:text-slate-400 font-semibold text-sm rounded-lg"
                  style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm"
                >
                  {submittingOrder ? "Creating Order..." : "Create Customer Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
