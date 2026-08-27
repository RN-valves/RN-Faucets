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
  ShieldCheck,
  UserCheck,
  Plus,
  Search,
  CheckCircle2,
  Lock,
  Key,
  Edit2,
  RefreshCw,
  Mail,
  Phone,
} from "lucide-react";

interface AdminUserItem {
  _id: string;
  mobile: string;
  name: string;
  email: string;
  userCode: string;
  userType: "Admin" | "Employee";
  role?: string;
  permissions: string[];
  status: "Active" | "InActive";
  createdAt: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: "catalogue.view", label: "View Catalogue & Products", group: "Catalogue" },
  { id: "catalogue.edit", label: "Create & Edit Products", group: "Catalogue" },
  { id: "catalogue.delete", label: "Delete Products & Categories", group: "Catalogue" },
  { id: "orders.view", label: "View Orders & Invoices", group: "Orders" },
  { id: "orders.update_status", label: "Update Order Status & Dispatch", group: "Orders" },
  { id: "customers.view", label: "View Customer Network", group: "Customers" },
  { id: "customers.approve", label: "Approve/Reject B2B Registrations", group: "Customers" },
  { id: "customers.edit", label: "Edit Customer Accounts", group: "Customers" },
  { id: "discounts.manage", label: "Create & Manage Coupons", group: "Discounts" },
  { id: "reports.view", label: "View Sales & Remark Log Reports", group: "Reports" },
];

const PREDEFINED_ROLES = [
  {
    name: "Super Admin",
    description: "Full access to all system modules, settings, and user management",
    permissions: ["all"],
  },
  {
    name: "Catalogue Manager",
    description: "Manage product catalogue, categories, attributes, and image media",
    permissions: ["catalogue.view", "catalogue.edit", "catalogue.delete"],
  },
  {
    name: "Order Dispatcher",
    description: "View and process customer orders, update shipping & tracking details",
    permissions: ["orders.view", "orders.update_status"],
  },
  {
    name: "Customer Support Manager",
    description: "Manage B2B customer registration approvals and enquiries",
    permissions: ["customers.view", "customers.approve", "customers.edit"],
  },
];

export default function AdminUsersPage() {
  const { theme, toggleTheme } = useAdminTheme();
  const [tab, setTab] = useState<"users" | "roles" | "permissions">("users");
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Edit / Add Modal state
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "Catalogue Manager",
    userType: "Employee" as "Admin" | "Employee",
    permissions: [] as string[],
  });

  async function fetchAdminUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/customers?type=Admin");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch admin users:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const handleOpenAdd = () => {
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      mobile: "",
      role: "Catalogue Manager",
      userType: "Employee",
      permissions: ["catalogue.view", "catalogue.edit"],
    });
    setShowModal(true);
  };

  const handleOpenEdit = (u: AdminUserItem) => {
    setSelectedUser(u);
    setFormData({
      name: u.name || "",
      email: u.email || "",
      mobile: u.mobile || "",
      role: u.role || "Employee",
      userType: u.userType || "Employee",
      permissions: u.permissions || [],
    });
    setShowModal(true);
  };

  const handleTogglePermission = (permId: string) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permId);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== permId)
          : [...prev.permissions, permId],
      };
    });
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        const res = await fetch(`/api/customers/${selectedUser._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setShowModal(false);
          fetchAdminUsers();
        }
      } else {
        const res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            userType: "Admin",
            approvalStatus: "Approved",
          }),
        });
        if (res.ok) {
          setShowModal(false);
          fetchAdminUsers();
        }
      }
    } catch (err) {
      console.error("Failed to save admin staff member:", err);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.mobile?.includes(searchQuery) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isDark = theme === "dark";

  const userColumns: Column<AdminUserItem>[] = [
    {
      header: "Staff Member",
      accessor: (u) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0077B6 0%, #0096C7 100%)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "13px",
            }}
          >
            {u.name ? u.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>{u.name}</div>
            <div style={{ fontSize: "11px", opacity: 0.7, fontFamily: "monospace" }}>{u.userCode}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: (u) => (
        <div style={{ fontSize: "12.5px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: 600 }}>
            <Phone size={12} style={{ opacity: 0.6 }} /> {u.mobile}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", opacity: 0.7 }}>
            <Mail size={12} style={{ opacity: 0.6 }} /> {u.email}
          </div>
        </div>
      ),
    },
    {
      header: "Operational Role",
      accessor: (u) => <AdminStatusBadge status={u.role || "Admin Staff"} variant="info" isDark={isDark} />,
    },
    {
      header: "Granular Permissions",
      accessor: (u) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxWidth: "320px" }}>
          {u.permissions?.includes("all") ? (
            <AdminStatusBadge status="Full System Control (All)" variant="success" isDark={isDark} />
          ) : (u.permissions || []).length === 0 ? (
            <span style={{ fontSize: "12px", opacity: 0.5, fontStyle: "italic" }}>No explicit rights</span>
          ) : (
            u.permissions.map((p) => (
              <span
                key={p}
                style={{
                  fontSize: "11px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: isDark ? "#21262D" : "#F3F4F6",
                  color: isDark ? "#C9D1D9" : "#374151",
                  border: isDark ? "1px solid #30363D" : "1px solid #E5E7EB",
                }}
              >
                {p}
              </span>
            ))
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      align: "right",
      accessor: (u) => (
        <AdminButton
          variant="secondary"
          size="sm"
          icon={<Edit2 size={13} />}
          isDark={isDark}
          onClick={() => handleOpenEdit(u)}
        >
          Edit Permissions
        </AdminButton>
      ),
    },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminHeader
        title="Admin Staff & Permissions Management"
        subtitle="Manage internal administrative staff accounts, assign operational roles, and set granular access rights."
        onRefresh={fetchAdminUsers}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <AdminTabs
          isDark={isDark}
          activeTab={tab}
          onChange={(t) => setTab(t as any)}
          tabs={[
            { id: "users", label: "Admin Staff Users", count: users.length, icon: <UserCheck size={16} /> },
            { id: "roles", label: "Predefined User Roles", count: PREDEFINED_ROLES.length, icon: <Lock size={16} /> },
            { id: "permissions", label: "Permissions Matrix", count: AVAILABLE_PERMISSIONS.length, icon: <Key size={16} /> },
          ]}
          rightAction={
            <AdminButton
              variant="primary"
              size="md"
              icon={<Plus size={15} />}
              isDark={isDark}
              onClick={handleOpenAdd}
            >
              Add Staff Member
            </AdminButton>
          }
        />

        {tab === "users" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <AdminFilterBar
              isDark={isDark}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Search staff members by name, email, mobile, or role..."
              actions={
                <AdminButton
                  variant="icon"
                  size="md"
                  icon={<RefreshCw size={15} />}
                  isDark={isDark}
                  onClick={fetchAdminUsers}
                  title="Refresh staff list"
                />
              }
            />

            <AdminDataTable
              isDark={isDark}
              loading={loading}
              columns={userColumns}
              data={filteredUsers}
              keyExtractor={(u) => u._id}
            />
          </div>
        )}

          {/* Tab Content 2: Predefined Roles */}
          {tab === "roles" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PREDEFINED_ROLES.map((r) => (
                <div key={r.name} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">{r.name}</h3>
                    <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                      System Role
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{r.description}</p>
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Granted Permissions:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {r.permissions.map((p) => (
                        <span key={p} className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded border border-slate-200">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab Content 3: Permissions Matrix */}
          {tab === "permissions" && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Granular Access Control Permissions Matrix</h3>
              <p className="text-sm text-slate-500">
                Below are all permission keys configurable across staff user accounts:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {AVAILABLE_PERMISSIONS.map((perm) => (
                  <div key={perm.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
                    <CheckCircle2 className="text-emerald-600 mt-0.5 flex-shrink-0" size={18} />
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{perm.label}</p>
                      <p className="text-xs font-mono text-slate-500">{perm.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

      {/* Edit / Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {selectedUser ? `Edit Permissions: ${selectedUser.name}` : "Add Admin Staff Member"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned Operational Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Catalogue Manager">Catalogue Manager</option>
                  <option value="Order Dispatcher">Order Dispatcher</option>
                  <option value="Customer Support Manager">Customer Support Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Configurable Granular Permissions
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 p-3 rounded-lg bg-slate-50">
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes("all") || formData.permissions.includes(perm.id)}
                        onChange={() => handleTogglePermission(perm.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{perm.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({perm.id})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold text-sm rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
