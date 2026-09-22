import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { validateAdminAuth, sanitizeString, escapeRegex } from "@/lib/security";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    // ── Security Guard: Enforce Admin Authorization ──
    const isAdmin = validateAdminAuth(request);
    if (!isAdmin) {
      return apiError("Unauthorized: Only administrators are permitted to impersonate user accounts.", {
        status: 403,
        code: "UNAUTHORIZED_ADMIN_ACTION",
      });
    }

    await connectDB();
    const body = await request.json().catch(() => ({}));
    const { userId, userCode, mobile } = body;

    const query: any = {};
    if (userId) {
      if (typeof userId === "number" || (!isNaN(Number(userId)) && String(userId).length < 12)) {
        query.$or = [{ legacyId: Number(userId) }, { _id: String(userId) }];
      } else {
        query._id = sanitizeString(userId, 50);
      }
    } else if (userCode) {
      const cleanCode = sanitizeString(userCode, 50);
      query.$or = [{ userCode: cleanCode }, { uuid: cleanCode }];
    } else if (mobile) {
      const cleanMobile = String(mobile).replace(/\D/g, "").slice(-10);
      query.mobile = cleanMobile;
    } else {
      return apiError("User identifier (userId, userCode, or mobile) is required.", { status: 400 });
    }

    const user = await User.findOne(query).lean();
    if (!user) {
      return apiError("Customer not found.", { status: 404 });
    }

    return apiSuccess({
      message: `Impersonating customer ${user.name || user.mobile}`,
      user: {
        _id: user._id,
        legacyId: (user as any).legacyId,
        mobile: user.mobile,
        name: user.name,
        email: user.email,
        userCode: user.userCode,
        userType: user.userType,
        role: user.role || "Customer",
        profession: user.profession,
        gstNumber: user.gstNumber,
        businessName: user.businessName,
        address: user.address,
        city: user.city,
        state: user.state,
        zipcode: user.zipcode,
      },
    });
  } catch (error: any) {
    return handleApiError(error, "POST /api/auth/impersonate");
  }
}
