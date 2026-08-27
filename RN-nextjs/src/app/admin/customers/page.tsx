"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminTheme } from "@/app/admin/layout";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminTabs from "@/components/admin/ui/AdminTabs";
import AdminFilterBar from "@/components/admin/ui/AdminFilterBar";
import AdminDataTable, { Column } from "@/components/admin/ui/AdminDataTable";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
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
  Eye,
  RefreshCw,
  Mail,
  Phone,
} from "lucide-react";
import * as XLSX from "xlsx";

interface CustomerUser {
  _id: string;
  mobile: string;
  name: string;
  email: string;
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
  createdAt: string;
}

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<CustomerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeTab, setTypeTab] = useState<"All" | "Business" | "Customer" | "Admin">("All");
  const [approvalTab, setApprovalTab] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");

  // Count metrics
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    business: 0,
    customer: 0,
    admin: 0,
  });

  // Modal inspection state
  const [selectedUser, setSelectedUser] = useState<CustomerUser | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminRemarks, setAdminRemarks] = useState("");

  // New Customer Form Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    mobile: "",
    email: "",
    userType: "Business",
    profession: "Distributor",
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
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (typeTab !== "All") params.set("type", typeTab);
      if (approvalTab !== "All") params.set("approval", approvalTab);

      const res = await fetch(`/api/customers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        if (data.counts) {
          setCounts(data.counts);
        }
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [typeTab, approvalTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleUpdateApproval = async (
    userId: string,
    newStatus: "Approved" | "Rejected" | "Pending",
    remarks?: string
  ) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/customers/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalStatus: newStatus,
          remarks: remarks || adminRemarks,
        }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, approvalStatus: newStatus, remarks: remarks || adminRemarks } : u
          )
        );
        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser((prev) =>
            prev ? { ...prev, approvalStatus: newStatus, remarks: remarks || adminRemarks } : null
          );
        }
        fetchUsers();
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
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
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
          userType: "Business",
          profession: "Distributor",
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
    const exportData = users.map((u) => ({
      "User Code": u.userCode,
      "Name": u.name,
      "Mobile": u.mobile,
      "Email": u.email,
      "User Type": u.userType,
      "Profession/Role": u.profession || u.role,
      "Business Name": u.businessName || "-",
      "GST Number": u.gstNumber || "-",
      "City": u.city || "-",
      "State": u.state || "-",
      "Pincode": u.zipcode || "-",
      "Approval Status": u.approvalStatus,
      "Account Status": u.status,
      "Registered Date": new Date(u.createdAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    XLSX.writeFile(workbook, `RN_Customer_Network_${Date.now()}.xlsx`);
  };

  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === "dark";

  const customerColumns: Column<CustomerUser>[] = [
    {
      header: "User Details",
      accessor: (u) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: u.userType === "Business" ? "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)" : "linear-gradient(135deg, #059669 0%, #10B981 100%)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "13px",
            }}
          >
            {u.name ? u.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>{u.name || "Unnamed User"}</div>
            <div style={{ fontSize: "11px", opacity: 0.7, fontFamily: "monospace" }}>{u.userCode}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Contact Info",
      accessor: (u) => (
        <div style={{ fontSize: "12.5px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: 600 }}>
            <Phone size={12} style={{ opacity: 0.6 }} /> {u.mobile}
          </div>
          {u.email && (
            <div style={{ display: "flex", alignItems: "center", gap: "5px", opacity: 0.7 }}>
              <Mail size={12} style={{ opacity: 0.6 }} /> {u.email}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "User Type & Profession",
      accessor: (u) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <AdminStatusBadge status={u.userType} variant={u.userType === "Business" ? "info" : "success"} isDark={isDark} />
          {u.profession && <span style={{ fontSize: "11.5px", opacity: 0.7 }}>{u.profession}</span>}
        </div>
      ),
    },
    {
      header: "Business & GST",
      accessor: (u) => (
        <div style={{ fontSize: "12.5px" }}>
          <div style={{ fontWeight: 600 }}>{u.businessName || "-"}</div>
          {u.gstNumber && <div style={{ fontSize: "11px", opacity: 0.7, fontFamily: "monospace" }}>GST: {u.gstNumber}</div>}
        </div>
      ),
    },
    {
      header: "Approval Status",
      accessor: (u) => <AdminStatusBadge status={u.approvalStatus} isDark={isDark} />,
    },
    {
      header: "Active",
      accessor: (u) => (
        <button
          type="button"
          onClick={() => handleToggleActiveStatus(u)}
          style={{
            background: u.status === "Active" ? (isDark ? "rgba(35, 134, 54, 0.15)" : "#D1FAE5") : (isDark ? "#21262D" : "#F3F4F6"),
            color: u.status === "Active" ? (isDark ? "#3FB950" : "#065F46") : (isDark ? "#8B949E" : "#6B7280"),
            border: u.status === "Active" ? (isDark ? "1px solid rgba(63, 185, 80, 0.3)" : "1px solid #A7F3D0") : (isDark ? "1px solid #30363D" : "1px solid #E5E7EB"),
            padding: "3px 9px",
            borderRadius: "6px",
            fontSize: "11.5px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {u.status}
        </button>
      ),
    },
    {
      header: "Actions",
      align: "right",
      accessor: (u) => (
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <AdminButton
            variant="icon"
            size="sm"
            icon={<Eye size={14} />}
            isDark={isDark}
            onClick={() => setSelectedUser(u)}
            title="Inspect Details"
          />
          {u.approvalStatus === "Pending" && (
            <>
              <AdminButton
                variant="primary"
                size="sm"
                isDark={isDark}
                onClick={() => handleUpdateApproval(u._id, "Approved")}
              >
                Approve
              </AdminButton>
              <AdminButton
                variant="danger"
                size="sm"
                isDark={isDark}
                onClick={() => handleUpdateApproval(u._id, "Rejected")}
              >
                Reject
              </AdminButton>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title="Customer Network & B2B Approvals"
        subtitle="Manage Retail Consumers, B2B Business Partners, Distributors, and Registration Approvals."
        onRefresh={fetchUsers}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {/* Metric Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <AdminCard isDark={isDark}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11.5px", fontWeight: 700, opacity: 0.7, textTransform: "uppercase" }}>Total Network</span>
                <div style={{ fontSize: "26px", fontWeight: 800, marginTop: "4px" }}>{counts.total}</div>
              </div>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: isDark ? "rgba(56, 139, 253, 0.15)" : "#E0F2FE", color: "#0077B6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users size={22} />
              </div>
            </div>
          </AdminCard>

          <AdminCard isDark={isDark} style={{ cursor: "pointer" }} onClick={() => { setApprovalTab("Pending"); setTypeTab("All"); }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#D97706", textTransform: "uppercase" }}>Pending Approvals</span>
                <div style={{ fontSize: "26px", fontWeight: 800, color: "#D97706", marginTop: "4px" }}>{counts.pending}</div>
              </div>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: isDark ? "rgba(210, 153, 34, 0.15)" : "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Clock size={22} />
              </div>
            </div>
          </AdminCard>

          <AdminCard isDark={isDark} style={{ cursor: "pointer" }} onClick={() => { setTypeTab("Business"); setApprovalTab("All"); }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#4F46E5", textTransform: "uppercase" }}>B2B Partners</span>
                <div style={{ fontSize: "26px", fontWeight: 800, color: "#4F46E5", marginTop: "4px" }}>{counts.business}</div>
              </div>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: isDark ? "rgba(99, 102, 241, 0.15)" : "#EEF2FF", color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Building2 size={22} />
              </div>
            </div>
          </AdminCard>

          <AdminCard isDark={isDark} style={{ cursor: "pointer" }} onClick={() => { setTypeTab("Customer"); setApprovalTab("All"); }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>Retail Consumers</span>
                <div style={{ fontSize: "26px", fontWeight: 800, color: "#059669", marginTop: "4px" }}>{counts.customer}</div>
              </div>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: isDark ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UserCheck size={22} />
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Tab & Filter Bar */}
        <AdminTabs
          isDark={isDark}
          activeTab={typeTab}
          onChange={(t) => setTypeTab(t as any)}
          tabs={[
            { id: "All", label: "All Network Types" },
            { id: "Business", label: "B2B Business Partners", count: counts.business },
            { id: "Customer", label: "Retail Consumers", count: counts.customer },
            { id: "Admin", label: "Admin Staff", count: counts.admin },
          ]}
          rightAction={
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <AdminButton
                variant="secondary"
                size="md"
                icon={<FileSpreadsheet size={15} />}
                isDark={isDark}
                onClick={exportToExcel}
              >
                Export Excel
              </AdminButton>
              <AdminButton
                variant="primary"
                size="md"
                icon={<Plus size={15} />}
                isDark={isDark}
                onClick={() => setShowAddModal(true)}
              >
                Add Customer
              </AdminButton>
            </div>
          }
        />

        <AdminFilterBar
          isDark={isDark}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by Name, Email, Mobile Number, GST Number, or Business Name..."
          filters={
            <div style={{ display: "flex", gap: "6px" }}>
              {(["All", "Pending", "Approved", "Rejected"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setApprovalTab(status)}
                  style={{
                    background: approvalTab === status ? "#0077B6" : isDark ? "#21262D" : "#F3F4F6",
                    color: approvalTab === status ? "#FFFFFF" : isDark ? "#C9D1D9" : "#4B5563",
                    border: "none",
                    padding: "5px 11px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          }
          actions={
            <AdminButton
              variant="icon"
              size="md"
              icon={<RefreshCw size={15} />}
              isDark={isDark}
              onClick={fetchUsers}
              title="Refresh"
            />
          }
        />

        <AdminDataTable
          isDark={isDark}
          loading={loading}
          columns={customerColumns}
          data={users}
          keyExtractor={(u) => u._id}
        />
      </main>

      {/* Inspect & Approve Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6 relative border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedUser.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedUser.userCode}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Mobile Number</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedUser.mobile}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Email Address</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedUser.email || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">User Type</p>
                  <span className="inline-block mt-0.5 px-2 py-0.5 bg-indigo-100 text-indigo-700 font-semibold text-xs rounded">
                    {selectedUser.userType} ({selectedUser.profession || selectedUser.role})
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">GST Number</p>
                  <p className="font-mono font-semibold text-slate-900 mt-0.5">{selectedUser.gstNumber || "-"}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Business Name / Firm</p>
                <p className="font-semibold text-slate-900 mt-0.5">{selectedUser.businessName || "-"}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Registered Address</p>
                <p className="text-slate-700 mt-0.5">
                  {[selectedUser.address, selectedUser.city, selectedUser.state, selectedUser.zipcode].filter(Boolean).join(", ") || "-"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                  Admin Approval Remarks / Rejection Note
                </label>
                <textarea
                  rows={2}
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="Enter remarks for approval or rejection reason..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4 gap-3">
              <span className="text-xs text-slate-500">
                Current Status: <strong>{selectedUser.approvalStatus}</strong>
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateApproval(selectedUser._id, "Rejected")}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50"
                >
                  Reject Registration
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateApproval(selectedUser._id, "Approved")}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50"
                >
                  Approve Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add New Customer / Business Partner</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={newCustomer.mobile}
                    onChange={(e) => setNewCustomer({ ...newCustomer, mobile: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">User Type</label>
                  <select
                    value={newCustomer.userType}
                    onChange={(e) => setNewCustomer({ ...newCustomer, userType: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    <option value="Business">Business Partner (B2B)</option>
                    <option value="Customer">Retail Consumer (B2C)</option>
                    <option value="Admin">Admin Staff</option>
                  </select>
                </div>
              </div>

              {newCustomer.userType === "Business" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Business Name</label>
                    <input
                      type="text"
                      value={newCustomer.businessName}
                      onChange={(e) => setNewCustomer({ ...newCustomer, businessName: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">GST Number</label>
                    <input
                      type="text"
                      value={newCustomer.gstNumber}
                      onChange={(e) => setNewCustomer({ ...newCustomer, gstNumber: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold text-sm rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg"
                >
                  Create Customer Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
