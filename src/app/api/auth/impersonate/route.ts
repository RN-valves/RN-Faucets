import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { userId, userCode, mobile } = await request.json();

    const query: any = {};
    if (userId) {
      if (typeof userId === "number" || !isNaN(Number(userId))) {
        query.$or = [{ legacyId: Number(userId) }, { _id: String(userId) }];
      } else {
        query._id = String(userId);
      }
    } else if (userCode) {
      query.$or = [{ userCode }, { uuid: userCode }];
    } else if (mobile) {
      const cleanMobile = String(mobile).replace(/\D/g, "").slice(-10);
      query.mobile = { $regex: cleanMobile };
    } else {
      return NextResponse.json({ error: "User identifier required" }, { status: 400 });
    }

    const user = await User.findOne(query).lean();
    if (!user) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
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
    console.error("POST /api/auth/impersonate error:", error);
    return NextResponse.json({ error: error.message || "Failed to impersonate user" }, { status: 500 });
  }
}
