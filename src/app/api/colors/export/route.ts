import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Color from "@/models/Color";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv"; // "csv" | "xls"
    const search = searchParams.get("search") || "";

    const filter: Record<string, unknown> = {};
    if (search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { code: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const colors = await Color.find(filter).sort({ idNumeric: -1 }).lean();

    if (format === "csv" || format === "xls") {
      const header = ["Id", "Created at", "Name", "Status"];
      const rows = colors.map((c) => {
        const createdAtFormatted = c.createdAt
          ? new Date(c.createdAt).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })
          : "";
        const escapedName = `"${(c.name || "").replace(/"/g, '""')}"`;
        return [c.code || `CL${c.idNumeric}`, `"${createdAtFormatted}"`, escapedName, `"${c.status || "Active"}"`].join(
          ","
        );
      });

      const csvContent = [header.join(","), ...rows].join("\r\n");

      const mimeType = format === "xls" ? "application/vnd.ms-excel" : "text/csv; charset=utf-8";
      const filename = `colors_export_${new Date().toISOString().slice(0, 10)}.${format === "xls" ? "xls" : "csv"}`;

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({ colors });
  } catch (error) {
    console.error("GET /api/colors/export error:", error);
    return NextResponse.json({ error: "Failed to export colors" }, { status: 500 });
  }
}
