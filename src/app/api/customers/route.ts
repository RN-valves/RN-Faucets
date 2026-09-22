import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { escapeRegex, sanitizeString, sanitizeObject, isValidIndianPhone } from "@/lib/security";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = sanitizeString(searchParams.get("q") || "", 80);
    const type = sanitizeString(searchParams.get("type") || "All", 30);
    const approval = sanitizeString(searchParams.get("approval") || "All", 30);

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

    // Exclude sensitive password fields from API output
    const users = await User.find(query)
      .select("-password -local_password")
      .sort({ createdAt: -1 })
      .lean();

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
    return handleApiError(error, "GET /api/customers");
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const rawBody = await request.json().catch(() => ({}));
    const body = sanitizeObject(rawBody);

    if (!body.mobile || !body.name) {
      return apiError("Mobile number and name are required.", { status: 400 });
    }

    const cleanMobile = String(body.mobile).replace(/\D/g, "").slice(-10);
    const userCode =
      body.userCode ||
      `RN-${(body.userType || "CUST").toUpperCase().substring(0, 3)}-${Date.now().toString().slice(-4)}`;

    const newUser = await User.create({
      ...body,
      mobile: cleanMobile,
      name: sanitizeString(body.name, 100),
      email: sanitizeString(body.email, 120),
      businessName: sanitizeString(body.businessName, 150),
      gstNumber: sanitizeString(body.gstNumber, 20).toUpperCase(),
      userCode,
      approvalStatus: body.approvalStatus || (body.userType === "Business" ? "Pending" : "Approved"),
    });

    const userObj = newUser.toObject();
    delete (userObj as any).password;
    delete (userObj as any).local_password;

    return NextResponse.json(userObj, { status: 201 });
  } catch (error: any) {
    return handleApiError(error, "POST /api/customers");
  }
}
