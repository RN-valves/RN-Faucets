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
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  Mail,
  Phone,
  Eye,
  Trash2,
} from "lucide-react";
import * as XLSX from "xlsx";

interface EnquiryItem {
  _id: string;
  id: string;
  customerName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: "New" | "In Progress" | "Resolved";
  createdAt?: string;
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState<"All" | "New" | "In Progress" | "Resolved">("All");

  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryItem | null>(null);

  async function fetchEnquiries() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (statusTab !== "All") params.set("status", statusTab);

      const res = await fetch(`/api/enquiries?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.enquiries || []);
      }
    } catch (err) {
      console.error("Failed to fetch enquiries:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEnquiries();
  }, [statusTab]);

  const handleUpdateStatus = async (item: EnquiryItem, newStatus: "New" | "In Progress" | "Resolved") => {
    try {
      const res = await fetch(`/api/enquiries/${item._id || item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((e) => (e._id === item._id || e.id === item.id ? { ...e, status: newStatus } : e))
        );
        if (selectedEnquiry && (selectedEnquiry._id === item._id || selectedEnquiry.id === item.id)) {
          setSelectedEnquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error("Failed to update enquiry status:", err);
    }
  };

  const handleDelete = async (item: EnquiryItem) => {
    if (!confirm("Are you sure you want to delete this enquiry lead?")) return;
    try {
      const res = await fetch(`/api/enquiries/${item._id || item.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSelectedEnquiry(null);
        fetchEnquiries();
      }
    } catch (err) {
      console.error("Failed to delete enquiry:", err);
    }
  };

  const exportToExcel = () => {
    const exportData = enquiries.map((e) => ({
      "Lead ID": e.id,
      "Date": e.date,
      "Customer / Firm Name": e.customerName,
      "Email": e.email,
      "Phone": e.phone,
      "Subject": e.subject,
      "Message": e.message,
      "Lead Status": e.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Enquiry Leads");
    XLSX.writeFile(workbook, `RN_B2B_Enquiries_${Date.now()}.xlsx`);
  };

  const newCount = enquiries.filter((e) => e.status === "New").length;
  const inProgressCount = enquiries.filter((e) => e.status === "In Progress").length;
  const resolvedCount = enquiries.filter((e) => e.status === "Resolved").length;

  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === "dark";
  const textMain = isDark ? "#FFFFFF" : "#1E293B";

  const enquiryColumns: Column<EnquiryItem>[] = [
    {
      header: "Lead Date & ID",
      accessor: (e) => (
        <div>
          <div style={{ fontWeight: 600 }}>{e.date}</div>
          <div style={{ fontSize: "11px", opacity: 0.7, fontFamily: "monospace" }}>{e.id}</div>
        </div>
      ),
    },
    {
      header: "Customer / Firm Details",
      accessor: (e) => (
        <div style={{ fontSize: "12.5px" }}>
          <div style={{ fontWeight: 700 }}>{e.customerName}</div>
          <div style={{ display: "flex", gap: "10px", opacity: 0.7, fontSize: "11.5px" }}>
            <span><Phone size={11} /> {e.phone}</span>
            {e.email && <span><Mail size={11} /> {e.email}</span>}
          </div>
        </div>
      ),
    },
    {
      header: "Subject & Inquired Product",
      accessor: (e) => (
        <div style={{ maxWidth: "340px" }}>
          <div style={{ fontWeight: 700, fontSize: "13px" }}>{e.subject}</div>
          <div style={{ fontSize: "12px", opacity: 0.7, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {e.message}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (e) => <AdminStatusBadge status={e.status} isDark={isDark} />,
    },
    {
      header: "Action",
      align: "right",
      accessor: (e) => (
        <AdminButton
          variant="secondary"
          size="sm"
          icon={<Eye size={13} />}
          isDark={isDark}
          onClick={() => setSelectedEnquiry(e)}
        >
          Inspect Lead
        </AdminButton>
      ),
    },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%" }}>
      <AdminHeader
        title="B2B Enquiry Leads Management"
        subtitle="Track customer product enquiries, trade lead status, and response notes."
        onRefresh={fetchEnquiries}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {/* Summary Metric Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <AdminCard isDark={isDark}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11.5px", fontWeight: 700, opacity: 0.7, textTransform: "uppercase" }}>Total Leads</span>
                <div style={{ fontSize: "26px", fontWeight: 800, marginTop: "4px" }}>{enquiries.length}</div>
              </div>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: isDark ? "#21262D" : "#F3F4F6", color: textMain, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageSquare size={22} />
              </div>
            </div>
          </AdminCard>

          <AdminCard isDark={isDark} style={{ cursor: "pointer" }} onClick={() => setStatusTab("New")}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#D97706", textTransform: "uppercase" }}>New Leads</span>
                <div style={{ fontSize: "26px", fontWeight: 800, color: "#D97706", marginTop: "4px" }}>{newCount}</div>
              </div>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: isDark ? "rgba(210, 153, 34, 0.15)" : "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertCircle size={22} />
              </div>
            </div>
          </AdminCard>

          <AdminCard isDark={isDark} style={{ cursor: "pointer" }} onClick={() => setStatusTab("In Progress")}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#0077B6", textTransform: "uppercase" }}>In Progress</span>
                <div style={{ fontSize: "26px", fontWeight: 800, color: "#0077B6", marginTop: "4px" }}>{inProgressCount}</div>
              </div>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: isDark ? "rgba(56, 139, 253, 0.15)" : "#E0F2FE", color: "#0077B6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Clock size={22} />
              </div>
            </div>
          </AdminCard>

          <AdminCard isDark={isDark} style={{ cursor: "pointer" }} onClick={() => setStatusTab("Resolved")}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>Resolved</span>
                <div style={{ fontSize: "26px", fontWeight: 800, color: "#059669", marginTop: "4px" }}>{resolvedCount}</div>
              </div>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: isDark ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={22} />
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Tab & Filter Bar */}
        <AdminTabs
          isDark={isDark}
          activeTab={statusTab}
          onChange={(t) => setStatusTab(t as any)}
          tabs={[
            { id: "All", label: "All Leads", count: enquiries.length },
            { id: "New", label: "New Leads", count: newCount },
            { id: "In Progress", label: "In Progress", count: inProgressCount },
            { id: "Resolved", label: "Resolved", count: resolvedCount },
          ]}
          rightAction={
            <AdminButton
              variant="secondary"
              size="md"
              icon={<FileSpreadsheet size={15} />}
              isDark={isDark}
              onClick={exportToExcel}
            >
              Export Leads Excel
            </AdminButton>
          }
        />

        <AdminFilterBar
          isDark={isDark}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by Customer Name, Email, Phone, or Subject..."
          actions={
            <AdminButton
              variant="icon"
              size="md"
              icon={<RefreshCw size={15} />}
              isDark={isDark}
              onClick={fetchEnquiries}
              title="Refresh"
            />
          }
        />

        <AdminDataTable
          isDark={isDark}
          loading={loading}
          columns={enquiryColumns}
          data={enquiries}
          keyExtractor={(e) => e._id || e.id}
        />
      </main>

      {/* Inspect Lead Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedEnquiry.customerName}</h3>
                <p className="text-xs text-slate-500 font-mono">Lead ID: {selectedEnquiry.id} • {selectedEnquiry.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Contact Phone</p>
                  <a href={`tel:${selectedEnquiry.phone}`} className="font-bold text-slate-900 hover:text-sky-600 flex items-center gap-1 mt-0.5">
                    <Phone size={13} />
                    {selectedEnquiry.phone}
                  </a>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Contact Email</p>
                  <a href={`mailto:${selectedEnquiry.email}`} className="font-bold text-slate-900 hover:text-sky-600 flex items-center gap-1 mt-0.5 truncate">
                    <Mail size={13} />
                    {selectedEnquiry.email}
                  </a>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Subject</p>
                <p className="font-bold text-slate-900 mt-1">{selectedEnquiry.subject}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Message & Inquiry Details</p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-sm mt-1 whitespace-pre-line leading-relaxed">
                  {selectedEnquiry.message}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between border-t border-slate-200 pt-4 gap-2">
              <button
                type="button"
                onClick={() => handleDelete(selectedEnquiry)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Delete Lead"
              >
                <Trash2 size={18} />
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedEnquiry, "In Progress")}
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-lg transition"
                >
                  Mark In Progress
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedEnquiry, "Resolved")}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
