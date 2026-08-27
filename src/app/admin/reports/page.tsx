"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminTheme } from "@/app/admin/layout";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminTabs from "@/components/admin/ui/AdminTabs";
import AdminFilterBar from "@/components/admin/ui/AdminFilterBar";
import AdminDataTable, { Column } from "@/components/admin/ui/AdminDataTable";
import AdminCard from "@/components/admin/ui/AdminCard";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import {
  FileSpreadsheet,
  RefreshCw,
  History,
  TrendingUp,
  Package,
} from "lucide-react";
import * as XLSX from "xlsx";

interface AuditLogItem {
  id: string;
  productSku: string;
  productName: string;
  field: string;
  oldValue: string;
  newValue: string;
  updatedBy: string;
  remarks: string;
  timestamp: string;
}

export default function AdminReportsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"remarks" | "sales" | "inventory">("remarks");
  const [summary, setSummary] = useState({ totalProducts: 0, totalOrders: 0 });

  async function fetchReports() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      params.set("type", activeTab);

      const res = await fetch(`/api/reports?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  const exportToExcel = () => {
    const exportData = logs.map((l) => ({
      "Log ID": l.id,
      "Timestamp": l.timestamp,
      "Product SKU": l.productSku,
      "Product Name": l.productName,
      "Modified Field": l.field,
      "Old Value": l.oldValue,
      "New Value": l.newValue,
      "Updated By": l.updatedBy,
      "Remarks": l.remarks,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Remark Audit Logs");
    XLSX.writeFile(workbook, `RN_Audit_Logs_${Date.now()}.xlsx`);
  };

  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === "dark";
  const textMain = isDark ? "#FFFFFF" : "#1E293B";

  const logColumns: Column<AuditLogItem>[] = [
    {
      header: "Timestamp",
      accessor: (l) => (
        <span style={{ fontSize: "11.5px", opacity: 0.8, fontFamily: "monospace" }}>
          {l.timestamp}
        </span>
      ),
    },
    {
      header: "Product Details",
      accessor: (l) => (
        <div>
          <div style={{ fontWeight: 700 }}>{l.productName}</div>
          <div style={{ fontSize: "11px", opacity: 0.7, fontFamily: "monospace" }}>SKU: {l.productSku}</div>
        </div>
      ),
    },
    {
      header: "Modified Field",
      accessor: (l) => <AdminStatusBadge status={l.field} variant="info" isDark={isDark} />,
    },
    {
      header: "Change Trace (Old → New)",
      accessor: (l) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
          <span style={{ textDecoration: "line-through", color: "#DC2626", opacity: 0.8 }}>{l.oldValue}</span>
          <span style={{ opacity: 0.5 }}>→</span>
          <span style={{ fontWeight: 700, color: "#059669" }}>{l.newValue}</span>
        </div>
      ),
    },
    {
      header: "Changed By & Remarks",
      accessor: (l) => (
        <div>
          <div style={{ fontWeight: 600 }}>{l.updatedBy}</div>
          <div style={{ fontSize: "11.5px", fontStyle: "italic", opacity: 0.7 }}>&quot;{l.remarks}&quot;</div>
        </div>
      ),
    },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%" }}>
      <AdminHeader
        title="Reports & Remark Audit Logs"
        subtitle="View administrative activity logs, customer approval histories, and export excel reports."
        onRefresh={fetchReports}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {/* Metric Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <AdminCard isDark={isDark}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11.5px", fontWeight: 700, opacity: 0.7, textTransform: "uppercase" }}>Audit Log Entries</span>
                <div style={{ fontSize: "26px", fontWeight: 800, marginTop: "4px" }}>{logs.length}</div>
              </div>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: isDark ? "#21262D" : "#F3F4F6", color: textMain, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <History size={22} />
              </div>
            </div>
          </AdminCard>

          <AdminCard isDark={isDark}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#0077B6", textTransform: "uppercase" }}>Catalog Products</span>
                <div style={{ fontSize: "26px", fontWeight: 800, color: "#0077B6", marginTop: "4px" }}>{summary.totalProducts || 149}</div>
              </div>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: isDark ? "rgba(56, 139, 253, 0.15)" : "#E0F2FE", color: "#0077B6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Package size={22} />
              </div>
            </div>
          </AdminCard>

          <AdminCard isDark={isDark}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>Total Sales Orders</span>
                <div style={{ fontSize: "26px", fontWeight: 800, color: "#059669", marginTop: "4px" }}>{summary.totalOrders || 3}</div>
              </div>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: isDark ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUp size={22} />
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Tab & Filter Bar */}
        <AdminTabs
          isDark={isDark}
          activeTab={activeTab}
          onChange={(t) => setActiveTab(t as any)}
          tabs={[
            { id: "remarks", label: `Remark Audit Logs (${logs.length})`, icon: <History size={15} /> },
            { id: "sales", label: "Order Sales Report", icon: <TrendingUp size={15} /> },
            { id: "inventory", label: "Product Inventory & Price Report", icon: <Package size={15} /> },
          ]}
          rightAction={
            <AdminButton
              variant="secondary"
              size="md"
              icon={<FileSpreadsheet size={15} />}
              isDark={isDark}
              onClick={exportToExcel}
            >
              Export Audit Logs Excel
            </AdminButton>
          }
        />

        <AdminFilterBar
          isDark={isDark}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search audit logs by SKU, Product Name, Modified Field, or User..."
          actions={
            <AdminButton
              variant="icon"
              size="md"
              icon={<RefreshCw size={15} />}
              isDark={isDark}
              onClick={fetchReports}
              title="Refresh"
            />
          }
        />

        <AdminDataTable
          isDark={isDark}
          loading={loading}
          columns={logColumns}
          data={logs}
          keyExtractor={(l) => l.id}
        />
      </main>
    </div>
  );
}
