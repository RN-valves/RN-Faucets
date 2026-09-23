import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionFromRequest } from "@/lib/security";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    await connectDB();
    let user: any = null;
    if (session.id && mongoose.Types.ObjectId.isValid(session.id)) {
      user = await User.findById(session.id).lean();
    }
    if (!user && session.mobile) {
      const cleanMobile = String(session.mobile).replace(/\D/g, "").slice(-10);
      user = await User.findOne({
        $or: [
          { mobile: cleanMobile },
          { mobile: `+91${cleanMobile}` },
          { mobile: `91${cleanMobile}` },
        ],
      }).lean();
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.id,
        mobile: session.mobile,
        name: user?.name || session.name,
        email: user?.email || session.email,
        role: session.role,
        userType: session.userType,
        userCode: user?.userCode || session.userCode,
        profession: user?.profession,
        gstNumber: user?.gstNumber,
        businessName: user?.businessName,
        approvalStatus: user?.approvalStatus,
      },
    });
  } catch (error: any) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json({ error: "Failed to authenticate session" }, { status: 500 });
  }
}
