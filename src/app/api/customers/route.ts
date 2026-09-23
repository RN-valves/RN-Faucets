import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdminAuth, escapeRegex } from "@/lib/security";

export async function GET(request: Request) {
  try {
    const adminSession = await requireAdminAuth(request);
    if (!adminSession) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required to view customer directory." },
        { status: 401 }
      );
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "All";
    const approval = searchParams.get("approval") || "All";

    const query: any = {};

    if (q) {
      const safeQ = escapeRegex(q);
      query.$or = [
        { name: { $regex: safeQ, $options: "i" } },
        { email: { $regex: safeQ, $options: "i" } },
        { mobile: { $regex: safeQ, $options: "i" } },
        { userCode: { $regex: safeQ, $options: "i" } },
        { businessName: { $regex: safeQ, $options: "i" } },
        { gstNumber: { $regex: safeQ, $options: "i" } },
      ];
    }

    if (type !== "All") {
      if (type === "Admin") {
        query.userType = { $in: ["Admin", "Employee"] };
      } else {
        query.userType = type;
      }
    }

    if (approval !== "All") {
      query.approvalStatus = approval;
    }

    const users = await User.find(query).sort({ createdAt: -1 }).lean();

    const pendingCount = await User.countDocuments({ approvalStatus: "Pending" });
    const businessCount = await User.countDocuments({ userType: "Business" });
    const customerCount = await User.countDocuments({ userType: "Customer" });
    const adminCount = await User.countDocuments({ userType: { $in: ["Admin", "Employee"] } });

    return NextResponse.json({
      users,
      counts: {
        total: users.length,
        pending: pendingCount,
        business: businessCount,
        customer: customerCount,
        admin: adminCount,
      },
    });
  } catch (error: any) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const adminSession = await requireAdminAuth(request);
    if (!adminSession) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required to create accounts manually." },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();

    if (!body.mobile || !body.name) {
      return NextResponse.json(
        { error: "Mobile number and name are required." },
        { status: 400 }
      );
    }

    const cleanMobile = body.mobile.trim();
    const userCode = body.userCode || `RN-${(body.userType || "CUST").toUpperCase().substring(0, 3)}-${Date.now().toString().slice(-4)}`;

    const newUser = await User.create({
      ...body,
      mobile: cleanMobile,
      userCode,
      approvalStatus: body.approvalStatus || (body.userType === "Business" ? "Pending" : "Approved"),
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/customers error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user record" },
      { status: 500 }
    );
  }
}
