import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { escapeRegex } from "@/lib/security";
import Size from "@/models/Size";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv"; // "csv" | "xls"
    const search = searchParams.get("search") || "";

    const filter: Record<string, unknown> = {};
    if (search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { code: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const sizes = await Size.find(filter).sort({ idNumeric: -1 }).lean();

    if (format === "csv" || format === "xls") {
      // Create CSV format
      const header = ["Id", "Created at", "Name", "Status"];
      const rows = sizes.map((s) => {
        const createdAtFormatted = s.createdAt
          ? new Date(s.createdAt).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })
          : "";
        const escapedName = `"${(s.name || "").replace(/"/g, '""')}"`;
        return [s.code || `SZ${s.idNumeric}`, `"${createdAtFormatted}"`, escapedName, `"${s.status || "Active"}"`].join(
          ","
        );
      });

      const csvContent = [header.join(","), ...rows].join("\r\n");

      const mimeType = format === "xls" ? "application/vnd.ms-excel" : "text/csv; charset=utf-8";
      const filename = `sizes_export_${new Date().toISOString().slice(0, 10)}.${format === "xls" ? "xls" : "csv"}`;

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({ sizes });
  } catch (error) {
    console.error("GET /api/sizes/export error:", error);
    return NextResponse.json({ error: "Failed to export sizes" }, { status: 500 });
  }
}
