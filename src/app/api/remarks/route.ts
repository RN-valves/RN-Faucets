import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import RemarkLog from "@/models/RemarkLog";
import Remark from "@/models/Remark";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const mobile = searchParams.get("mobile");
    const type = searchParams.get("type"); // "master" to get master remark categories

    if (type === "master") {
      const remarks = await Remark.find({ status: "Active" }).lean();
      return NextResponse.json({ remarks });
    }

    const query: any = {};
    if (userId) {
      const uid = parseInt(userId, 10);
      query.$or = [{ logableId: uid }, { adminUserId: uid }];
    } else if (mobile) {
      const cleanMobile = mobile.replace(/[^\d]/g, "").slice(-10);
      query.customerMobile = { $regex: cleanMobile };
    }

    const logs = await RemarkLog.find(query).sort({ createdAt: -1 }).limit(100).lean();
    const masterRemarks = await Remark.find({ status: "Active" }).lean();

    return NextResponse.json({
      logs,
      masterRemarks,
      total: logs.length,
    });
  } catch (error: any) {
    console.error("GET /api/remarks error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch remarks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const {
      logableId,
      customerName,
      customerMobile,
      remark,
      message,
      adminUserName = "Admin",
    } = body;

    if (!remark && !message) {
      return NextResponse.json({ error: "Remark or message is required." }, { status: 400 });
    }

    const newLog = await RemarkLog.create({
      id: `rem-${Date.now()}`,
      logableType: "App\\Models\\User",
      logableId: logableId ? Number(logableId) : undefined,
      adminUserName,
      customerName: customerName || "",
      customerMobile: customerMobile || "",
      remark: remark || "General Note",
      message: message || "",
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, log: newLog }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/remarks error:", error);
    return NextResponse.json({ error: error.message || "Failed to create remark log" }, { status: 500 });
  }
}
