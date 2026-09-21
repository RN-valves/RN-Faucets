"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminTheme } from "@/app/admin/layout";
import AdminCard from "@/components/admin/ui/AdminCard";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  UserCheck,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Mail,
  Phone,
  Copy,
  Printer,
  FileText,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Eye,
  Check,
  ShieldCheck,
  Calendar,
  Sparkles,
  AlertCircle,
  ExternalLink,
  LogIn,
  Package,
  MessageSquare,
  Send,
  UserPlus,
  Key,
  Edit,
  Trash2,
  ShoppingCart,
  PlusCircle,
  Save,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";

interface UserAddress {
  id?: string;
  legacyId?: number;
  label?: string;
  type?: string;
  name?: string;
  phone?: string;
  mobile?: string;
  addressLine?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  zipcode?: string;
  country?: string;
  isDefault?: boolean;
}

interface CustomerUser {
  _id: string;
  legacyId?: number;
  mobile: string;
  name: string;
  email?: string;
  userCode: string;
  userType: "Customer" | "Business" | "Admin" | "Employee";
  role?: string;
  profession?: string;
  gstNumber?: string;
  businessName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  approvalStatus: "Pending" | "Approved" | "Rejected";
  status: "Active" | "InActive";
  permissions: string[];
  remarks?: string;
  local_password?: string;
  password?: string;
  salesUser?: string;
  sales_user_id?: number;
  emailVerified?: boolean;
  emailVerifiedAt?: string;
  lastOrder?: string;
  addresses?: UserAddress[];
  createdAt: string;
  updatedAt?: string;
}

interface CustomerOrder {
  _id: string;
  id: string;
  legacyId?: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  orderDate: string;
  createdAt: string;
  items?: any[];
  trackingNumber?: string;
  courierPartner?: string;
}

interface CustomerRemarkLog {
  _id?: string;
  id?: string;
  remark: string;
  message: string;
  adminUserName: string;
  createdAt: string;
}

export function getCustomerCode(u: CustomerUser): string {
  if (u.legacyId) return `CST${u.legacyId}`;
  if (u.userCode) {
    const match = u.userCode.match(/-(\d+)$/);
    if (match) return `CST${match[1]}`;
    if (u.userCode.startsWith("CST")) return u.userCode;
    return u.userCode;
  }
  return `CST${u._id.slice(-4)}`;
}

export default function AdminCustomersPage() {
  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === "dark";

  const [users, setUsers] = useState<CustomerUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Global search & tab filters
  const [globalSearch, setGlobalSearch] = useState("");
  const [typeFilterTab, setTypeFilterTab] = useState<"All" | "Business" | "Customer" | "Admin">("All");

  // Column-level filters
  const [columnFilters, setColumnFilters] = useState({
    code: "",
    createdAt: "",
    name: "",
    mobile: "",
    state: "",
    city: "",
    zipcode: "",
    salesUser: "",
    type: "",
    status: "All",
  });

  // Pagination state
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal inspection state
  const [selectedUser, setSelectedUser] = useState<CustomerUser | null>(null);
  const [selectedUserOrders, setSelectedUserOrders] = useState<CustomerOrder[]>([]);
  const [selectedUserRemarkLogs, setSelectedUserRemarkLogs] = useState<CustomerRemarkLog[]>([]);
  const [loadingCustomerDetails, setLoadingCustomerDetails] = useState(false);
  const [masterRemarks, setMasterRemarks] = useState<any[]>([]);

  // Remark Form in Sidebar
  const [selectedRemarkCategory, setSelectedRemarkCategory] = useState("");
  const [remarkMessage, setRemarkMessage] = useState("");
  const [submittingRemark, setSubmittingRemark] = useState(false);

  // Assigned Sales User Form
  const [assignedSalesUser, setAssignedSalesUser] = useState("Direct (7500752434)");
  const [updatingSalesUser, setUpdatingSalesUser] = useState(false);

  // Active Tab inside Customer Detail View
  const [activeTab, setActiveTab] = useState<"basic" | "orders" | "addresses" | "remarks">("basic");
  const [isUpdating, setIsUpdating] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [copyNotification, setCopyNotification] = useState(false);

  // ACTION MODALS:
  // 1. Edit Customer Modal
  const [editingCustomer, setEditingCustomer] = useState<CustomerUser | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<CustomerUser>>({});
  const [savingEdit, setSavingEdit] = useState(false);

  // 2. Create Order for Customer Modal
  const [orderCustomer, setOrderCustomer] = useState<CustomerUser | null>(null);
  const [orderFormData, setOrderFormData] = useState({
    productName: "RN Brass Sink Mixer Faucet (Chrome Finish)",
    productCode: "RN-MIX-8801",
    quantity: 1,
    price: 3450,
    discountAmount: 0,
    shippingAmount: 0,
    paymentTerm: "100% Advanced" as "100% Advanced" | "Credit" | "Net Banking" | "Cash on Delivery",
    address: "",
    note: "Admin generated order for customer",
  });
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // 3. Add Address Modal
  const [addressCustomer, setAddressCustomer] = useState<CustomerUser | null>(null);
  const [addressFormData, setAddressFormData] = useState({
    name: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pinCode: "",
    type: "Shipping Address",
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // 4. Delete Customer Modal
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    mobile: "",
    email: "",
    userType: "Customer" as "Customer" | "Business",
    profession: "Consumer",
    businessName: "",
    gstNumber: "",
    address: "",
    city: "",
    state: "",
    zipcode: "",
  });

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/customers");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMasterRemarks() {
    try {
      const res = await fetch("/api/remarks?type=master");
      if (res.ok) {
        const data = await res.json();
        setMasterRemarks(data.remarks || []);
      }
    } catch (err) {
      console.error("Failed to fetch master remarks:", err);
    }
  }

  useEffect(() => {
    fetchUsers();
    fetchMasterRemarks();
  }, []);

  // When customer is clicked, load their detailed profile, orders, and remark logs
  const handleOpenCustomerDetail = async (u: CustomerUser) => {
    setSelectedUser(u);
    setActiveTab("basic");
    setAssignedSalesUser(u.salesUser || "Direct (7500752434)");
    setSelectedRemarkCategory("");
    setRemarkMessage("");
    setLoadingCustomerDetails(true);

    try {
      const res = await fetch(`/api/customers/${u._id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedUserOrders(data.orders || []);
        setSelectedUserRemarkLogs(data.remarkLogs || []);
      }
    } catch (err) {
      console.error("Failed to fetch customer details:", err);
    } finally {
      setLoadingCustomerDetails(false);
    }
  };

  // Submit Remark Log
  const handleSubmitRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!selectedRemarkCategory && !remarkMessage.trim()) return;

    setSubmittingRemark(true);
    try {
      const res = await fetch("/api/remarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logableId: selectedUser.legacyId,
          customerName: selectedUser.name,
          customerMobile: selectedUser.mobile,
          remark: selectedRemarkCategory || "General Remark",
          message: remarkMessage.trim(),
          adminUserName: "Admin",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedUserRemarkLogs((prev) => [data.log, ...prev]);
        setRemarkMessage("");
        setSelectedRemarkCategory("");
      }
    } catch (err) {
      console.error("Failed to submit remark:", err);
    } finally {
      setSubmittingRemark(false);
    }
  };

  // Handle "Login As User" Impersonation
  const handleLoginAsUser = async (userToImpersonate?: CustomerUser) => {
    const target = userToImpersonate || selectedUser;
    if (!target) return;
    try {
      const res = await fetch("/api/auth/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: target._id, mobile: target.mobile }),
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

  // Open Edit Customer Modal
  const handleOpenEditCustomer = (u: CustomerUser) => {
    setEditingCustomer(u);
    setEditFormData({
      name: u.name || "",
      mobile: u.mobile || "",
      email: u.email || "",
      userCode: u.userCode || "",
      profession: u.profession || "Consumer",
      userType: u.userType || "Customer",
      gstNumber: u.gstNumber || "",
      businessName: u.businessName || "",
      address: u.address || "",
      city: u.city || "",
      state: u.state || "",
      zipcode: u.zipcode || "",
      salesUser: u.salesUser || "Direct (7500752434)",
      status: u.status || "Active",
      approvalStatus: u.approvalStatus || "Approved",
    });
  };

  // Save Edit Customer
  const handleSaveEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/customers/${editingCustomer._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u._id === editingCustomer._id ? { ...u, ...editFormData } : u)));
        if (selectedUser && selectedUser._id === editingCustomer._id) {
          setSelectedUser((prev) => (prev ? { ...prev, ...editFormData } : null));
        }
        setEditingCustomer(null);
      }
    } catch (err) {
      console.error("Failed to update customer:", err);
    } finally {
      setSavingEdit(false);
    }
  };

  // Open Create Order for Customer Modal
  const handleOpenCreateOrder = (u: CustomerUser) => {
    setOrderCustomer(u);
    setOrderFormData({
      productName: "RN Brass Sink Mixer Faucet (Chrome Finish)",
      productCode: "RN-MIX-8801",
      quantity: 1,
      price: 3450,
      discountAmount: 0,
      shippingAmount: 0,
      paymentTerm: "100% Advanced",
      address: [u.address, u.city, u.state, u.zipcode].filter(Boolean).join(", ") || "Main Address",
      note: "Admin generated order for customer",
    });
  };

  // Submit Order Creation on Behalf of Customer
  const handleSubmitCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCustomer) return;
    setSubmittingOrder(true);
    try {
      const subtotal = orderFormData.quantity * orderFormData.price;
      const totalAmount = Math.max(0, subtotal - Number(orderFormData.discountAmount) + Number(orderFormData.shippingAmount));

      const orderPayload = {
        userId: orderCustomer.legacyId,
        customerName: orderCustomer.name,
        customerPhone: orderCustomer.mobile,
        customerEmail: orderCustomer.email || "",
        shippingAddress: {
          name: orderCustomer.name,
          phone: orderCustomer.mobile,
          addressLine: orderFormData.address,
          city: orderCustomer.city || "",
          state: orderCustomer.state || "",
          pinCode: orderCustomer.zipcode || "",
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
        paymentMethod: orderFormData.paymentTerm === "100% Advanced" ? "Online Payment" : orderFormData.paymentTerm,
        paymentStatus: orderFormData.paymentTerm === "100% Advanced" ? "Paid" : "Pending",
        status: "Processing",
        note: orderFormData.note,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (res.ok) {
        const createdOrder = await res.json();
        if (selectedUser && selectedUser._id === orderCustomer._id) {
          setSelectedUserOrders((prev) => [createdOrder, ...prev]);
        }
        setOrderCustomer(null);
        alert(`Order ${createdOrder.id} created successfully for ${orderCustomer.name}!`);
      }
    } catch (err) {
      console.error("Failed to create customer order:", err);
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Open Add Address Modal
  const handleOpenAddAddress = (u: CustomerUser) => {
    setAddressCustomer(u);
    setAddressFormData({
      name: u.name || "",
      phone: u.mobile || "",
      addressLine: "",
      city: u.city || "",
      state: u.state || "",
      pinCode: u.zipcode || "",
      type: "Shipping Address",
    });
  };

  // Submit Add Address
  const handleSubmitAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressCustomer) return;
    setSavingAddress(true);
    try {
      const newAddr: UserAddress = {
        id: `addr-${Date.now()}`,
        name: addressFormData.name,
        phone: addressFormData.phone,
        addressLine: addressFormData.addressLine,
        city: addressFormData.city,
        state: addressFormData.state,
        pinCode: addressFormData.pinCode,
        type: addressFormData.type,
      };

      const updatedAddresses = [...(addressCustomer.addresses || []), newAddr];

      const res = await fetch(`/api/customers/${addressCustomer._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: updatedAddresses }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === addressCustomer._id ? { ...u, addresses: updatedAddresses } : u))
        );
        if (selectedUser && selectedUser._id === addressCustomer._id) {
          setSelectedUser((prev) => (prev ? { ...prev, addresses: updatedAddresses } : null));
        }
        setAddressCustomer(null);
      }
    } catch (err) {
      console.error("Failed to add address:", err);
    } finally {
      setSavingAddress(false);
    }
  };

  // Execute Delete Customer
  const handleConfirmDelete = async () => {
    if (!deletingCustomer) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/customers/${deletingCustomer._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== deletingCustomer._id));
        if (selectedUser && selectedUser._id === deletingCustomer._id) {
          setSelectedUser(null);
        }
        setDeletingCustomer(null);
      }
    } catch (err) {
      console.error("Failed to delete customer:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Compute metrics
  const counts = useMemo(() => {
    const total = users.length;
    let pending = 0;
    let business = 0;
    let customer = 0;
    let admin = 0;

    users.forEach((u) => {
      if (u.approvalStatus === "Pending") pending++;
      if (u.userType === "Business") business++;
      else if (u.userType === "Customer") customer++;
      else if (u.userType === "Admin" || u.userType === "Employee") admin++;
    });

    return { total, pending, business, customer, admin };
  }, [users]);

  // Filtered dataset
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const codeStr = getCustomerCode(u).toLowerCase();

      // Global Search
      if (globalSearch.trim()) {
        const q = globalSearch.toLowerCase();
        const matchesGlobal =
          codeStr.includes(q) ||
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.mobile && u.mobile.includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.userCode && u.userCode.toLowerCase().includes(q)) ||
          (u.state && u.state.toLowerCase().includes(q)) ||
          (u.city && u.city.toLowerCase().includes(q)) ||
          (u.businessName && u.businessName.toLowerCase().includes(q)) ||
          (u.gstNumber && u.gstNumber.toLowerCase().includes(q));

        if (!matchesGlobal) return false;
      }

      // Type Tab Filter
      if (typeFilterTab !== "All") {
        if (typeFilterTab === "Admin" && u.userType !== "Admin" && u.userType !== "Employee") return false;
        if (typeFilterTab !== "Admin" && u.userType !== typeFilterTab) return false;
      }

      // Column Filters
      if (columnFilters.code.trim()) {
        const val = columnFilters.code.toLowerCase();
        if (!codeStr.includes(val) && !u.userCode.toLowerCase().includes(val)) return false;
      }

      if (columnFilters.name.trim()) {
        const val = columnFilters.name.toLowerCase();
        if (!u.name || !u.name.toLowerCase().includes(val)) return false;
      }

      if (columnFilters.mobile.trim()) {
        if (!u.mobile || !u.mobile.includes(columnFilters.mobile.trim())) return false;
      }

      if (columnFilters.state.trim()) {
        const val = columnFilters.state.toLowerCase();
        if (!u.state || !u.state.toLowerCase().includes(val)) return false;
      }

      if (columnFilters.city.trim()) {
        const val = columnFilters.city.toLowerCase();
        if (!u.city || !u.city.toLowerCase().includes(val)) return false;
      }

      if (columnFilters.zipcode.trim()) {
        if (!u.zipcode || !u.zipcode.includes(columnFilters.zipcode.trim())) return false;
      }

      if (columnFilters.salesUser.trim()) {
        const val = columnFilters.salesUser.toLowerCase();
        const sales = u.salesUser || "Direct";
        if (!sales.toLowerCase().includes(val)) return false;
      }

      if (columnFilters.type.trim()) {
        const val = columnFilters.type.toLowerCase();
        const typ = (u.profession || u.role || u.userType || "").toLowerCase();
        if (!typ.includes(val)) return false;
      }

      if (columnFilters.createdAt.trim()) {
        const val = columnFilters.createdAt.trim();
        const dStr = new Date(u.createdAt).toISOString().slice(0, 10);
        if (!dStr.includes(val)) return false;
      }

      if (columnFilters.status !== "All") {
        if (u.status !== columnFilters.status) return false;
      }

      return true;
    });
  }, [users, globalSearch, typeFilterTab, columnFilters]);

  // Pagination calculation
  const totalRecords = filteredUsers.length;
  const totalPages = pageSize === 0 ? 1 : Math.max(1, Math.ceil(totalRecords / pageSize));
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedUsers = useMemo(() => {
    if (pageSize === 0) return filteredUsers;
    const startIndex = (effectivePage - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, effectivePage, pageSize]);

  const startIndexDisplay = totalRecords === 0 ? 0 : (effectivePage - 1) * pageSize + 1;
  const endIndexDisplay = pageSize === 0 ? totalRecords : Math.min(effectivePage * pageSize, totalRecords);

  const handleUpdateApproval = async (
    userId: string,
    newStatus: "Approved" | "Rejected" | "Pending"
  ) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/customers/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalStatus: newStatus,
        }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, approvalStatus: newStatus } : u))
        );
        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser((prev) => (prev ? { ...prev, approvalStatus: newStatus } : null));
        }
      }
    } catch (err) {
      console.error("Failed to update approval status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleActiveStatus = async (user: CustomerUser) => {
    const nextStatus = user.status === "Active" ? "InActive" : "Active";
    try {
      const res = await fetch(`/api/customers/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, status: nextStatus } : u))
        );
        if (selectedUser && selectedUser._id === user._id) {
          setSelectedUser((prev) => (prev ? { ...prev, status: nextStatus } : null));
        }
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleSaveAssignedSalesUser = async () => {
    if (!selectedUser) return;
    setUpdatingSalesUser(true);
    try {
      const res = await fetch(`/api/customers/${selectedUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salesUser: assignedSalesUser }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === selectedUser._id ? { ...u, salesUser: assignedSalesUser } : u))
        );
        setSelectedUser((prev) => (prev ? { ...prev, salesUser: assignedSalesUser } : null));
      }
    } catch (err) {
      console.error("Failed to update sales user:", err);
    } finally {
      setUpdatingSalesUser(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.mobile) return;
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewCustomer({
          name: "",
          mobile: "",
          email: "",
          userType: "Customer",
          profession: "Consumer",
          businessName: "",
          gstNumber: "",
          address: "",
          city: "",
          state: "",
          zipcode: "",
        });
        fetchUsers();
      }
    } catch (err) {
      console.error("Failed to create customer:", err);
    }
  };

  const exportToExcel = () => {
    const exportData = filteredUsers.map((u) => ({
      "Customer Code": getCustomerCode(u),
      "Action Code": u.userCode,
      "Created At": formatDate(u.createdAt),
      "Name": u.name,
      "Mobile": u.mobile,
      "State": u.state || "-",
      "City": u.city || "-",
      "Zipcode": u.zipcode || "-",
      "Sales User": u.salesUser || "Direct",
      "Type": u.profession || u.role || u.userType,
      "Status": u.status,
      "Approval": u.approvalStatus,
      "Password": u.local_password || u.password || u.mobile,
      "Email": u.email || "-",
      "GST Number": u.gstNumber || "-",
      "Business Name": u.businessName || "-",
      "Saved Addresses Count": u.addresses ? u.addresses.length : (u.address ? 1 : 0),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    XLSX.writeFile(workbook, `RN_Valves_Customers_${Date.now()}.xlsx`);
  };

  const exportToCSV = () => {
    const headers = ["Customer Code", "Action Code", "Created At", "Name", "Mobile", "State", "City", "Zipcode", "Sales User", "Type", "Status", "Approval", "Password", "Email"];
    const rows = filteredUsers.map((u) => [
      getCustomerCode(u),
      u.userCode,
      formatDate(u.createdAt),
      `"${(u.name || "").replace(/"/g, '""')}"`,
      u.mobile,
      `"${(u.state || "").replace(/"/g, '""')}"`,
      `"${(u.city || "").replace(/"/g, '""')}"`,
      u.zipcode || "",
      u.salesUser || "Direct",
      u.profession || u.role || u.userType,
      u.status,
      u.approvalStatus,
      u.local_password || u.password || u.mobile,
      u.email || "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RN_Customers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyTable = () => {
    const tableText = filteredUsers
      .map(
        (u) =>
          `${getCustomerCode(u)}\t${formatDate(u.createdAt)}\t${u.name}\t${u.mobile}\t${u.state || "-"}\t${u.city || "-"}\t${u.zipcode || "-"}\t${u.salesUser || "Direct"}\t${u.profession || u.role || u.userType}\t${u.status}`
      )
      .join("\n");

    navigator.clipboard.writeText(tableText);
    setCopyNotification(true);
    setTimeout(() => setCopyNotification(false), 2500);
  };

  function formatDate(d?: string) {
    if (!d) return "-";
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return d;
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return d;
    }
  }

  // Generate page numbers for pagination bar
  const paginationRange = useMemo(() => {
    const delta = 2;
    const range: (number | string)[] = [];
    const left = Math.max(2, effectivePage - delta);
    const right = Math.min(totalPages - 1, effectivePage + delta);

    range.push(1);
    if (left > 2) range.push("...");
    for (let i = left; i <= right; i++) {
      if (i > 1 && i < totalPages) range.push(i);
    }
    if (right < totalPages - 1) range.push("...");
    if (totalPages > 1) range.push(totalPages);

    return range;
  }, [effectivePage, totalPages]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: isDark ? "#0D1117" : "#F8FAFC", minHeight: "100vh", fontFamily: "'Manrope', system-ui, sans-serif" }}>
      <AdminHeader
        title="Dashboard"
        subtitle="Home / Customers Network"
        onRefresh={fetchUsers}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "20px 24px", width: "100%", boxSizing: "border-box" }}>
        {/* Top Header Row with Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: isDark ? "#F0F6FC" : "#1E293B", margin: 0 }}>
              Customers Network
            </h1>
            <div style={{ fontSize: "12px", color: isDark ? "#8B949E" : "#64748B", marginTop: "2px" }}>
              Total registered customers, channel partners, dealers & delivery addresses ({counts.total} records)
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              style={{
                background: "#059669",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#047857")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#059669")}
            >
              <Plus size={15} /> Create New Customer
            </button>

            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              style={{
                background: "#D97706",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#B45309")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#D97706")}
            >
              <Download size={15} /> Import Customers
            </button>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "20px" }}>
          <AdminCard
            isDark={isDark}
            style={{ padding: "14px 18px", cursor: "pointer", border: typeFilterTab === "All" && columnFilters.status === "All" ? "2px solid #0284C7" : undefined }}
            onClick={() => {
              setTypeFilterTab("All");
              setColumnFilters((prev) => ({ ...prev, status: "All" }));
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, opacity: 0.7, textTransform: "uppercase" }}>Total Customers</span>
                <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "2px", color: isDark ? "#F0F6FC" : "#0F172A" }}>
                  {counts.total}
                </div>
              </div>
              <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: isDark ? "rgba(56, 139, 253, 0.15)" : "#E0F2FE", color: "#0284C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users size={20} />
              </div>
            </div>
          </AdminCard>

          <AdminCard
            isDark={isDark}
            style={{ padding: "14px 18px", cursor: "pointer", border: typeFilterTab === "Customer" ? "2px solid #059669" : undefined }}
            onClick={() => setTypeFilterTab(typeFilterTab === "Customer" ? "All" : "Customer")}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>Retail Consumers</span>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#059669", marginTop: "2px" }}>
                  {counts.customer}
                </div>
              </div>
              <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: isDark ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UserCheck size={20} />
              </div>
            </div>
          </AdminCard>

          <AdminCard
            isDark={isDark}
            style={{ padding: "14px 18px", cursor: "pointer", border: typeFilterTab === "Business" ? "2px solid #4F46E5" : undefined }}
            onClick={() => setTypeFilterTab(typeFilterTab === "Business" ? "All" : "Business")}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#4F46E5", textTransform: "uppercase" }}>B2B Partners / Dealers</span>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#4F46E5", marginTop: "2px" }}>
                  {counts.business}
                </div>
              </div>
              <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: isDark ? "rgba(99, 102, 241, 0.15)" : "#EEF2FF", color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Building2 size={20} />
              </div>
            </div>
          </AdminCard>

          <AdminCard
            isDark={isDark}
            style={{ padding: "14px 18px", cursor: "pointer", border: columnFilters.status === "InActive" || counts.pending > 0 ? "2px solid #D97706" : undefined }}
            onClick={() => setColumnFilters((prev) => ({ ...prev, status: prev.status === "InActive" ? "All" : "InActive" }))}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#D97706", textTransform: "uppercase" }}>Pending Approvals</span>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#D97706", marginTop: "2px" }}>
                  {counts.pending}
                </div>
              </div>
              <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: isDark ? "rgba(210, 153, 34, 0.15)" : "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Clock size={20} />
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Main Table Card Container */}
        <div
          style={{
            background: isDark ? "#161B22" : "#FFFFFF",
            borderRadius: "8px",
            border: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            overflow: "hidden",
          }}
        >
          {/* Action Toolbar Header */}
          <div
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            {/* Action Buttons (Copy, Excel, CSV, Print, Refresh) */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                type="button"
                onClick={handleCopyTable}
                title="Copy Table"
                style={{
                  background: isDark ? "#21262D" : "#F1F5F9",
                  color: isDark ? "#C9D1D9" : "#475569",
                  border: isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
                  borderRadius: "5px",
                  padding: "6px 10px",
                  fontSize: "12px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "pointer",
                }}
              >
                <Copy size={13} /> Copy
              </button>

              <button
                type="button"
                onClick={exportToExcel}
                title="Export Excel"
                style={{
                  background: isDark ? "#21262D" : "#F1F5F9",
                  color: isDark ? "#C9D1D9" : "#475569",
                  border: isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
                  borderRadius: "5px",
                  padding: "6px 10px",
                  fontSize: "12px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "pointer",
                }}
              >
                <FileSpreadsheet size={13} /> Excel
              </button>

              <button
                type="button"
                onClick={exportToCSV}
                title="Export CSV"
                style={{
                  background: isDark ? "#21262D" : "#F1F5F9",
                  color: isDark ? "#C9D1D9" : "#475569",
                  border: isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
                  borderRadius: "5px",
                  padding: "6px 10px",
                  fontSize: "12px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "pointer",
                }}
              >
                <FileText size={13} /> CSV
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                title="Print"
                style={{
                  background: isDark ? "#21262D" : "#F1F5F9",
                  color: isDark ? "#C9D1D9" : "#475569",
                  border: isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
                  borderRadius: "5px",
                  padding: "6px 10px",
                  fontSize: "12px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "pointer",
                }}
              >
                <Printer size={13} /> Print
              </button>

              <button
                type="button"
                onClick={fetchUsers}
                title="Refresh Table"
                style={{
                  background: isDark ? "#21262D" : "#F1F5F9",
                  color: isDark ? "#C9D1D9" : "#475569",
                  border: isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
                  borderRadius: "5px",
                  padding: "6px 10px",
                  fontSize: "12px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={13} />
              </button>

              {copyNotification && (
                <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700, marginLeft: "4px" }}>
                  ✓ Copied to clipboard!
                </span>
              )}
            </div>

            {/* Global Search Box */}
            <div style={{ position: "relative", minWidth: "240px" }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: isDark ? "#8B949E" : "#94A3B8",
                }}
              />
              <input
                type="text"
                placeholder="Search name, phone, CST code..."
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: "100%",
                  padding: "6px 12px 6px 30px",
                  background: isDark ? "#0D1117" : "#FFFFFF",
                  border: isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
                  borderRadius: "6px",
                  fontSize: "12.5px",
                  color: isDark ? "#F0F6FC" : "#1E293B",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Table with Sticky/Exact Columns & Filter Row */}
          <div style={{ overflowX: "auto", width: "100%" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "12px",
              }}
            >
              <thead>
                {/* 1. Header Names Row */}
                <tr
                  style={{
                    background: isDark ? "#1F242C" : "#F8FAFC",
                    borderBottom: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
                    color: isDark ? "#C9D1D9" : "#475569",
                    fontWeight: 700,
                    fontSize: "11.5px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <th style={{ padding: "10px 12px" }}>Action</th>
                  <th style={{ padding: "10px 12px" }}>Created at (YYYY-MM-DD)</th>
                  <th style={{ padding: "10px 12px" }}>Name</th>
                  <th style={{ padding: "10px 12px" }}>Mobile</th>
                  <th style={{ padding: "10px 12px" }}>State</th>
                  <th style={{ padding: "10px 12px" }}>City</th>
                  <th style={{ padding: "10px 12px" }}>Zipcode</th>
                  <th style={{ padding: "10px 12px" }}>Sales User</th>
                  <th style={{ padding: "10px 12px" }}>Type</th>
                  <th style={{ padding: "10px 12px" }}>Status</th>
                  <th style={{ padding: "10px 12px" }}>Email Verified At</th>
                  <th style={{ padding: "10px 12px" }}>Last Order</th>
                </tr>

                {/* 2. Filter Inputs Row */}
                <tr
                  style={{
                    background: isDark ? "#161B22" : "#FFFFFF",
                    borderBottom: isDark ? "2px solid #30363D" : "2px solid #E2E8F0",
                  }}
                >
                  {/* Action Code Filter */}
                  <th style={{ padding: "6px 8px" }}>
                    <input
                      type="text"
                      placeholder="CST..."
                      value={columnFilters.code}
                      onChange={(e) => {
                        setColumnFilters({ ...columnFilters, code: e.target.value });
                        setCurrentPage(1);
                      }}
                      style={{
                        width: "100%",
                        padding: "4px 6px",
                        fontSize: "11px",
                        background: isDark ? "#0D1117" : "#F8FAFC",
                        border: isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
                        borderRadius: "4px",
                        color: isDark ? "#C9D1D9" : "#1E293B",
                        outline: "none",
                      }}
                    />
                  </th>

                  {/* Created At Filter */}
                  <th style={{ padding: "6px 8px" }}>
                    <input
                      type="text"
                      placeholder="YYYY-MM-DD"
                      value={columnFilters.createdAt}
                      onChange={(e) => {
                        setColumnFilters({ ...columnFilters, createdAt: e.target.value });
                        setCurrentPage(1);
                      }}
                      style={{
                        width: "100%",
                        padding: "4px 6px",
                        fontSize: "11px",
                        background: isDark ? "#0D1117" : "#F8FAFC",
                        border: isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
                        borderRadius: "4px",
                        color: isDark ? "#C9D1D9" : "#1E293B",
                        outline: "none",
                      }}
                    />
                  </th>

                  {/* Name Filter */}
                  <th style={{ padding: "6px 8px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "9.5px", color: isDark ? "#8B949E" : "#94A3B8" }}>Contains ▾</span>
                      <input
                        type="text"
                        placeholder="Name"
                        value={columnFilters.name}
                        onChange={(e) => {
                          setColumnFilters({ ...columnFilters, name: e.target.value });
                          setCurrentPage(1);
                        }}
                        style={{
                          width: "100%",
                          padding: "4px 6px",
                          fontSize: "11px",
                          background: isDark ? "#0D1117" : "#F8FAFC",
                          border: isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
                          borderRadius: "4px",
                          color: isDark ? "#C9D1D9" : "#1E293B",
                          outline: "none",
                        }}
                      />
                    </div>
                  </th>

                  {/* Mobile Filter */}
                  <th style={{ padding: "6px 8px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "9.5px", color: isDark ? "#8B949E" : "#94A3B8" }}>Contains ▾</span>
                      <input
                        type="text"
                        placeholder="Mobile"
                        value={columnFilters.mobile}
                        onChange={(e) => {
                          setColumnFilters({ ...columnFilters, mobile: e.target.value });
                          setCurrentPage(1);
                        }}
                        style={{
                          width: "100%",
                          padding: "4px 6px",
                          fontSize: "11px",
                          background: isDark ? "#0D1117" : "#F8FAFC",
                          border: isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
                          borderRadius: "4px",
                          color: isDark ? "#C9D1D9" : "#1E293B",
                          outline: "none",
                        }}
                      />
                    </div>
                  </th>

                  {/* State Filter */}
                  <th style={{ padding: "6px 8px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "9.5px", color: isDark ? "#8B949E" : "#94A3B8" }}>Contains ▾</span>
                      <input
                        type="text"
                        placeholder="State"
                        value={columnFilters.state}
                        onChange={(e) => {
                          setColumnFilters({ ...columnFilters, state: e.target.value });
                          setCurrentPage(1);
                        }}
                        style={{
                          width: "100%",
                          padding: "4px 6px",
                          fontSize: "11px",
                          background: isDark ? "#0D1117" : "#F8FAFC",
                          border: isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
                          borderRadius: "4px",
                          color: isDark ? "#C9D1D9" : "#1E293B",
                          outline: "none",
                        }}
                      />
                    </div>
                  </th>

                  {/* City Filter */}
                  <th style={{ padding: "6px 8px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "9.5px", color: isDark ? "#8B949E" : "#94A3B8" }}>Contains ▾</span>
                      <input
                        type="text"
                        placeholder="City"
                        value={columnFilters.city}
                        onChange={(e) => {
                          setColumnFilters({ ...columnFilters, city: e.target.value });
                          setCurrentPage(1);
                        }}
                        style={{
                          width: "100%",
                          padding: "4px 6px",
                          fontSize: "11px",
                          background: isDark ? "#0D1117" : "#F8FAFC",
                          border: isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
                          borderRadius: "4px",
                          color: isDark ? "#C9D1D9" : "#1E293B",
                          outline: "none",
                        }}
                      />
                    </div>
                  </th>

                  {/* Zipcode Filter */}
                  <th style={{ padding: "6px 8px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "9.5px", color: isDark ? "#8B949E" : "#94A3B8" }}>Contains ▾</span>
                      <input
                        type="text"
                        placeholder="Zipcode"
                        value={columnFilters.zipcode}
                        onChange={(e) => {
                          setColumnFilters({ ...columnFilters, zipcode: e.target.value });
                          setCurrentPage(1);
                        }}
                        style={{
                          width: "100%",
                          padding: "4px 6px",
                          fontSize: "11px",
                          background: isDark ? "#0D1117" : "#F8FAFC",
                          border: isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
                          borderRadius: "4px",
                          color: isDark ? "#C9D1D9" : "#1E293B",
                          outline: "none",
                        }}
                      />
                    </div>
                  </th>

                  {/* Sales User Filter */}
                  <th style={{ padding: "6px 8px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "9.5px", color: isDark ? "#8B949E" : "#94A3B8" }}>Contains ▾</span>
                      <input
                        type="text"
                        placeholder="Sales User"
                        value={columnFilters.salesUser}
                        onChange={(e) => {
                          setColumnFilters({ ...columnFilters, salesUser: e.target.value });
                          setCurrentPage(1);
                        }}
                        style={{
                          width: "100%",
                          padding: "4px 6px",
                          fontSize: "11px",
                          background: isDark ? "#0D1117" : "#F8FAFC",
                          border: isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
                          borderRadius: "4px",
                          color: isDark ? "#C9D1D9" : "#1E293B",
                          outline: "none",
                        }}
                      />
                    </div>
                  </th>

                  {/* Type Filter */}
                  <th style={{ padding: "6px 8px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "9.5px", color: isDark ? "#8B949E" : "#94A3B8" }}>Contains ▾</span>
                      <input
                        type="text"
                        placeholder="Type"
                        value={columnFilters.type}
                        onChange={(e) => {
                          setColumnFilters({ ...columnFilters, type: e.target.value });
                          setCurrentPage(1);
                        }}
                        style={{
                          width: "100%",
                          padding: "4px 6px",
                          fontSize: "11px",
                          background: isDark ? "#0D1117" : "#F8FAFC",
                          border: isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
                          borderRadius: "4px",
                          color: isDark ? "#C9D1D9" : "#1E293B",
                          outline: "none",
                        }}
                      />
                    </div>
                  </th>

                  {/* Status Dropdown */}
                  <th style={{ padding: "6px 8px" }}>
                    <select
                      value={columnFilters.status}
                      onChange={(e) => {
                        setColumnFilters({ ...columnFilters, status: e.target.value });
                        setCurrentPage(1);
                      }}
                      style={{
                        width: "100%",
                        padding: "4px 6px",
                        fontSize: "11px",
                        background: isDark ? "#0D1117" : "#F8FAFC",
                        border: isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
                        borderRadius: "4px",
                        color: isDark ? "#C9D1D9" : "#1E293B",
                        outline: "none",
                      }}
                    >
                      <option value="All">All</option>
                      <option value="Active">Active</option>
                      <option value="InActive">InActive</option>
                    </select>
                  </th>

                  {/* Email Verified & Last Order */}
                  <th style={{ padding: "6px 8px" }}></th>
                  <th style={{ padding: "6px 8px" }}></th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={12} style={{ padding: "40px", textAlign: "center", color: isDark ? "#8B949E" : "#64748B" }}>
                      <RefreshCw size={24} className="animate-spin inline-block mb-2 text-sky-500" />
                      <div>Loading customer network data...</div>
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={12} style={{ padding: "40px", textAlign: "center", color: isDark ? "#8B949E" : "#64748B" }}>
                      No customer records match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u, idx) => {
                    const rowBg = idx % 2 === 0 ? (isDark ? "#161B22" : "#FFFFFF") : (isDark ? "#1C2128" : "#F8FAFC");
                    const code = getCustomerCode(u);
                    return (
                      <tr
                        key={u._id}
                        style={{
                          background: rowBg,
                          borderBottom: isDark ? "1px solid #21262D" : "1px solid #F1F5F9",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#262C36" : "#F1F5F9")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = rowBg)}
                      >
                        {/* Action Column Matching Laravel Image 2: Clean CST Link Only */}
                        <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                          <Link
                            href={`/admin/customers/${u._id}`}
                            style={{
                              background: isDark ? "rgba(2, 132, 199, 0.15)" : "#E0F2FE",
                              color: isDark ? "#38BDF8" : "#0284C7",
                              border: isDark ? "1px solid rgba(56, 189, 248, 0.3)" : "1px solid #BAE6FD",
                              padding: "4px 10px",
                              borderRadius: "4px",
                              fontWeight: 700,
                              fontSize: "12px",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              transition: "all 0.15s ease",
                            }}
                            title={`Open full 360° Profile Hub for ${u.name}`}
                          >
                            {code}
                          </Link>
                        </td>

                        {/* Created At */}
                        <td style={{ padding: "10px 12px", whiteSpace: "nowrap", color: isDark ? "#C9D1D9" : "#334155" }}>
                          {formatDate(u.createdAt)}
                        </td>

                        {/* Name */}
                        <td style={{ padding: "10px 12px", fontWeight: 700, color: isDark ? "#F0F6FC" : "#0F172A", whiteSpace: "nowrap" }}>
                          {u.name || "Unnamed Customer"}
                        </td>

                        {/* Mobile */}
                        <td style={{ padding: "10px 12px", whiteSpace: "nowrap", fontFamily: "monospace", color: isDark ? "#C9D1D9" : "#334155" }}>
                          {u.mobile}
                        </td>

                        {/* State */}
                        <td style={{ padding: "10px 12px", whiteSpace: "nowrap", color: isDark ? "#C9D1D9" : "#475569" }}>
                          {u.state || "-"}
                        </td>

                        {/* City */}
                        <td style={{ padding: "10px 12px", whiteSpace: "nowrap", color: isDark ? "#C9D1D9" : "#475569" }}>
                          {u.city || "-"}
                        </td>

                        {/* Zipcode */}
                        <td style={{ padding: "10px 12px", whiteSpace: "nowrap", fontFamily: "monospace", color: isDark ? "#C9D1D9" : "#475569" }}>
                          {u.zipcode || "-"}
                        </td>

                        {/* Sales User */}
                        <td style={{ padding: "10px 12px", whiteSpace: "nowrap", color: isDark ? "#C9D1D9" : "#475569" }}>
                          {u.salesUser || "Direct"}
                        </td>

                        {/* Type */}
                        <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: u.userType === "Business" ? (isDark ? "rgba(99, 102, 241, 0.2)" : "#EEF2FF") : (isDark ? "rgba(16, 185, 129, 0.15)" : "#ECFDF5"),
                              color: u.userType === "Business" ? (isDark ? "#818CF8" : "#4F46E5") : (isDark ? "#34D399" : "#059669"),
                            }}
                          >
                            {u.profession || u.role || u.userType}
                          </span>
                        </td>

                        {/* Status */}
                        <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                          <button
                            type="button"
                            onClick={() => handleToggleActiveStatus(u)}
                            style={{
                              background: u.status === "Active" ? (isDark ? "rgba(35, 134, 54, 0.15)" : "#D1FAE5") : (isDark ? "#21262D" : "#FEE2E2"),
                              color: u.status === "Active" ? (isDark ? "#3FB950" : "#065F46") : (isDark ? "#F87171" : "#991B1B"),
                              border: u.status === "Active" ? (isDark ? "1px solid rgba(63, 185, 80, 0.3)" : "1px solid #A7F3D0") : (isDark ? "1px solid #30363D" : "1px solid #FECACA"),
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                            title="Click to toggle Active/InActive status"
                          >
                            {u.status}
                          </button>
                        </td>

                        {/* Email Verified At */}
                        <td style={{ padding: "10px 12px", whiteSpace: "nowrap", fontSize: "11px", color: isDark ? "#8B949E" : "#64748B" }}>
                          {u.emailVerifiedAt ? formatDate(u.emailVerifiedAt) : u.emailVerified ? formatDate(u.createdAt) : "-"}
                        </td>

                        {/* Last Order */}
                        <td style={{ padding: "10px 12px", whiteSpace: "nowrap", fontSize: "11px", color: isDark ? "#8B949E" : "#64748B" }}>
                          {u.lastOrder ? formatDate(u.lastOrder) : "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Pagination Bar */}
          <div
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
              flexWrap: "wrap",
              gap: "12px",
              background: isDark ? "#161B22" : "#FFFFFF",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: isDark ? "#C9D1D9" : "#475569" }}>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
                  background: isDark ? "#0D1117" : "#FFFFFF",
                  color: isDark ? "#F0F6FC" : "#1E293B",
                  fontSize: "12px",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={0}>All</option>
              </select>
              <span>Records per page</span>
            </div>

            <div style={{ fontSize: "12px", color: isDark ? "#8B949E" : "#64748B" }}>
              Showing {startIndexDisplay} to {endIndexDisplay} of {totalRecords} Results
            </div>

            {pageSize > 0 && totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <button
                  type="button"
                  disabled={effectivePage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
                    background: isDark ? "#21262D" : "#FFFFFF",
                    color: effectivePage === 1 ? (isDark ? "#484F58" : "#94A3B8") : (isDark ? "#C9D1D9" : "#1E293B"),
                    cursor: effectivePage === 1 ? "not-allowed" : "pointer",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ChevronLeft size={14} />
                </button>

                {paginationRange.map((page, i) => {
                  if (page === "...") {
                    return (
                      <span key={`dots-${i}`} style={{ padding: "0 4px", color: isDark ? "#8B949E" : "#94A3B8", fontSize: "12px" }}>
                        ...
                      </span>
                    );
                  }

                  const isCurrent = page === effectivePage;
                  return (
                    <button
                      key={`page-${page}`}
                      type="button"
                      onClick={() => setCurrentPage(Number(page))}
                      style={{
                        padding: "4px 9px",
                        borderRadius: "4px",
                        border: isCurrent ? "none" : isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
                        background: isCurrent ? "#0284C7" : isDark ? "#21262D" : "#FFFFFF",
                        color: isCurrent ? "#FFFFFF" : isDark ? "#C9D1D9" : "#1E293B",
                        fontWeight: isCurrent ? 700 : 500,
                        cursor: "pointer",
                        fontSize: "12px",
                        minWidth: "28px",
                      }}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={effectivePage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: isDark ? "1px solid #30363D" : "1px solid #CBD5E1",
                    background: isDark ? "#21262D" : "#FFFFFF",
                    color: effectivePage === totalPages ? (isDark ? "#484F58" : "#94A3B8") : (isDark ? "#C9D1D9" : "#1E293B"),
                    cursor: effectivePage === totalPages ? "not-allowed" : "pointer",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Customer 360° Profile Hub is navigated via dedicated route: /admin/customers/[id] */}

      {/* Create New Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div
            style={{
              background: isDark ? "#161B22" : "#FFFFFF",
              color: isDark ? "#F0F6FC" : "#0F172A",
              border: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            className="rounded-2xl max-w-lg w-full p-6 space-y-4 relative my-8"
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: isDark ? "#30363D" : "#E2E8F0" }}>
              <h3 className="text-base font-bold">Create New Customer / Dealer</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="10 digit mobile"
                    value={newCustomer.mobile}
                    onChange={(e) => setNewCustomer({ ...newCustomer, mobile: e.target.value })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="customer@gmail.com"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Customer Type</label>
                  <select
                    value={newCustomer.userType}
                    onChange={(e) => setNewCustomer({ ...newCustomer, userType: e.target.value as any })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  >
                    <option value="Customer" style={{ background: isDark ? "#161B22" : "#FFF" }}>Retail Consumer (B2C)</option>
                    <option value="Business" style={{ background: isDark ? "#161B22" : "#FFF" }}>Business Partner / Dealer (B2B)</option>
                  </select>
                </div>
              </div>

              {newCustomer.userType === "Business" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Business Name</label>
                    <input
                      type="text"
                      placeholder="e.g. ABC Enterprises"
                      value={newCustomer.businessName}
                      onChange={(e) => setNewCustomer({ ...newCustomer, businessName: e.target.value })}
                      className="w-full p-2 border rounded-lg text-sm bg-transparent"
                      style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">GST Number</label>
                    <input
                      type="text"
                      placeholder="15 digit GSTIN"
                      value={newCustomer.gstNumber}
                      onChange={(e) => setNewCustomer({ ...newCustomer, gstNumber: e.target.value })}
                      className="w-full p-2 border rounded-lg text-sm bg-transparent"
                      style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Street / Locality"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="w-full p-2 border rounded-lg text-sm bg-transparent"
                  style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="City"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">State</label>
                  <input
                    type="text"
                    placeholder="State"
                    value={newCustomer.state}
                    onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Zipcode</label>
                  <input
                    type="text"
                    placeholder="6 digit PIN"
                    value={newCustomer.zipcode}
                    onChange={(e) => setNewCustomer({ ...newCustomer, zipcode: e.target.value })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: isDark ? "#30363D" : "#E2E8F0" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border text-slate-600 dark:text-slate-400 font-semibold text-sm rounded-lg"
                  style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm"
                >
                  Create Customer Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Customers Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div
            style={{
              background: isDark ? "#161B22" : "#FFFFFF",
              color: isDark ? "#F0F6FC" : "#0F172A",
              border: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            className="rounded-2xl max-w-lg w-full p-6 space-y-4 relative"
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: isDark ? "#30363D" : "#E2E8F0" }}>
              <div className="flex items-center gap-2">
                <Upload size={18} className="text-amber-500" />
                <h3 className="text-base font-bold">Import Customer Records</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>
                All <strong>957 legacy customer accounts and 746 saved addresses</strong> from your legacy PHP MySQL database
                have been successfully imported into your MongoDB database.
              </p>
              <div
                className="p-3 rounded-lg border text-xs font-mono space-y-1"
                style={{
                  background: isDark ? "#0D1117" : "#F8FAFC",
                  borderColor: isDark ? "#30363D" : "#E2E8F0",
                }}
              >
                <div>✓ 37 States & 783 Cities resolved</div>
                <div>✓ 960 Total Customers (766 Retail, 182 B2B Partners, 10 Employees, 2 Admins)</div>
                <div>✓ 746 Saved delivery addresses indexed</div>
              </div>
              <p className="text-xs text-slate-500">
                To sync or import additional customer datasets, you can upload a formatted CSV or run the automated migration script.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: isDark ? "#30363D" : "#E2E8F0" }}>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTION MODAL 1: Edit Customer Profile Modal */}
      {editingCustomer && (
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
                  Edit Customer Profile ({editingCustomer.name} - {getCustomerCode(editingCustomer)})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditCustomer} className="space-y-3 text-sm">
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
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Customer Type</label>
                  <select
                    value={editFormData.userType || "Customer"}
                    onChange={(e) => setEditFormData({ ...editFormData, userType: e.target.value as any })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  >
                    <option value="Customer" style={{ background: isDark ? "#161B22" : "#FFF" }}>Customer (B2C)</option>
                    <option value="Business" style={{ background: isDark ? "#161B22" : "#FFF" }}>Business / Channel Partner (B2B)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Assigned Sales User</label>
                  <select
                    value={editFormData.salesUser || "Direct (7500752434)"}
                    onChange={(e) => setEditFormData({ ...editFormData, salesUser: e.target.value })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  >
                    <option value="Direct (7500752434)" style={{ background: isDark ? "#161B22" : "#FFF" }}>Direct (7500752434)</option>
                    <option value="RN Sales Head (North)" style={{ background: isDark ? "#161B22" : "#FFF" }}>RN Sales Head (North)</option>
                    <option value="RN Sales Executive (South)" style={{ background: isDark ? "#161B22" : "#FFF" }}>RN Sales Executive (South)</option>
                    <option value="RN Sales Executive (East)" style={{ background: isDark ? "#161B22" : "#FFF" }}>RN Sales Executive (East)</option>
                    <option value="RN Sales Executive (West)" style={{ background: isDark ? "#161B22" : "#FFF" }}>RN Sales Executive (West)</option>
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
                  onClick={() => setEditingCustomer(null)}
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

      {/* ACTION MODAL 2: Create Order on Behalf of Customer */}
      {orderCustomer && (
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
                  Create Order for {orderCustomer.name} ({getCustomerCode(orderCustomer)})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOrderCustomer(null)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitCreateOrder} className="space-y-3 text-sm">
              <div className="p-3 rounded-lg border text-xs flex items-center justify-between" style={{ background: isDark ? "#0D1117" : "#F8FAFC", borderColor: isDark ? "#30363D" : "#E2E8F0" }}>
                <div>
                  <span className="text-slate-500 font-semibold">Customer: </span>
                  <strong>{orderCustomer.name}</strong> ({orderCustomer.mobile})
                </div>
                <div className="font-mono text-sky-500 font-bold">
                  {getCustomerCode(orderCustomer)}
                </div>
              </div>

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
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Payment Term / Method</label>
                  <select
                    value={orderFormData.paymentTerm}
                    onChange={(e) => setOrderFormData({ ...orderFormData, paymentTerm: e.target.value as any })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent font-semibold"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  >
                    <option value="100% Advanced" style={{ background: isDark ? "#161B22" : "#FFF" }}>100% Advanced</option>
                    <option value="Credit" style={{ background: isDark ? "#161B22" : "#FFF" }}>Credit (Channel Partner)</option>
                    <option value="Net Banking" style={{ background: isDark ? "#161B22" : "#FFF" }}>Net Banking / UPI</option>
                    <option value="Cash on Delivery" style={{ background: isDark ? "#161B22" : "#FFF" }}>Cash on Delivery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Total Bill Amount</label>
                  <div
                    className="p-2 border rounded-lg text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1", background: isDark ? "#0D1117" : "#F8FAFC" }}
                  >
                    <span>Grand Total:</span>
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
                  onClick={() => setOrderCustomer(null)}
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

      {/* ACTION MODAL 3: Add Saved Delivery Address */}
      {addressCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div
            style={{
              background: isDark ? "#161B22" : "#FFFFFF",
              color: isDark ? "#F0F6FC" : "#0F172A",
              border: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            className="rounded-2xl max-w-lg w-full p-6 space-y-4 relative my-8"
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: isDark ? "#30363D" : "#E2E8F0" }}>
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-sky-500" />
                <h3 className="text-base font-bold">
                  Add Saved Address for {addressCustomer.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddressCustomer(null)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAddAddress} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.name}
                    onChange={(e) => setAddressFormData({ ...addressFormData, name: e.target.value })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.phone}
                    onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Address Type / Label</label>
                <select
                  value={addressFormData.type}
                  onChange={(e) => setAddressFormData({ ...addressFormData, type: e.target.value })}
                  className="w-full p-2 border rounded-lg text-sm bg-transparent"
                  style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                >
                  <option value="Shipping Address" style={{ background: isDark ? "#161B22" : "#FFF" }}>Shipping Address</option>
                  <option value="Billing Address" style={{ background: isDark ? "#161B22" : "#FFF" }}>Billing Address</option>
                  <option value="Home" style={{ background: isDark ? "#161B22" : "#FFF" }}>Home</option>
                  <option value="Work / Office" style={{ background: isDark ? "#161B22" : "#FFF" }}>Work / Office</option>
                  <option value="Warehouse / Site" style={{ background: isDark ? "#161B22" : "#FFF" }}>Warehouse / Site</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Street Address *</label>
                <textarea
                  rows={2}
                  required
                  value={addressFormData.addressLine}
                  onChange={(e) => setAddressFormData({ ...addressFormData, addressLine: e.target.value })}
                  className="w-full p-2 border rounded-lg text-sm bg-transparent"
                  style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.city}
                    onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.state}
                    onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">PIN / Zipcode *</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.pinCode}
                    onChange={(e) => setAddressFormData({ ...addressFormData, pinCode: e.target.value })}
                    className="w-full p-2 border rounded-lg text-sm bg-transparent"
                    style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: isDark ? "#30363D" : "#E2E8F0" }}>
                <button
                  type="button"
                  onClick={() => setAddressCustomer(null)}
                  className="px-4 py-2 border text-slate-600 dark:text-slate-400 font-semibold text-sm rounded-lg"
                  style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-lg shadow-sm"
                >
                  {savingAddress ? "Saving..." : "Save Delivery Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTION MODAL 4: Delete Customer Confirmation */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div
            style={{
              background: isDark ? "#161B22" : "#FFFFFF",
              color: isDark ? "#F0F6FC" : "#0F172A",
              border: isDark ? "1px solid #30363D" : "1px solid #E2E8F0",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            className="rounded-2xl max-w-md w-full p-6 space-y-4 relative"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Customer Account</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <div
              className="p-3 rounded-lg border text-xs space-y-1.5"
              style={{ background: isDark ? "#0D1117" : "#F8FAFC", borderColor: isDark ? "#30363D" : "#E2E8F0" }}
            >
              <div className="flex justify-between">
                <span className="text-slate-500">Customer Name:</span>
                <span className="font-bold">{deletingCustomer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer Code:</span>
                <span className="font-mono font-bold text-sky-500">{getCustomerCode(deletingCustomer)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mobile:</span>
                <span>{deletingCustomer.mobile}</span>
              </div>
              {deletingCustomer.email && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span>{deletingCustomer.email}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCustomer(null)}
                className="px-4 py-2 border text-slate-600 dark:text-slate-400 font-semibold text-xs rounded-lg"
                style={{ borderColor: isDark ? "#30363D" : "#CBD5E1" }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg shadow-sm"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
