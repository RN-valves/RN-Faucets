import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { createSessionToken, getSessionCookieOptions } from "@/lib/session";
import { checkRateLimit, getClientIp, isValidIndianPhone } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`login-password:${ip}`, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait a minute." },
        { status: 429 }
      );
    }

    await connectDB();
    const { mobile, password } = await request.json();

    if (!mobile || !isValidIndianPhone(mobile)) {
      return NextResponse.json(
        { error: "A valid 10-digit Indian mobile number is required." },
        { status: 400 }
      );
    }

    const cleanMobile = String(mobile).replace(/\D/g, "").slice(-10);
    const enteredPass = String(password || "").trim();

    if (!enteredPass) {
      return NextResponse.json(
        { error: "Password is required for password-based login." },
        { status: 400 }
      );
    }

    const isSuperAdmin = cleanMobile === "8737029643";

    let user = await User.findOne({
      $or: [
        { mobile: cleanMobile },
        { mobile: `+91${cleanMobile}` },
        { mobile: `91${cleanMobile}` },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { error: "Account not found. Please register or sign in using OTP." },
        { status: 404 }
      );
    }

    // Validate password
    const localPass = (user as any).local_password || "";
    const currentPass = user.password || "";
    const adminEnvPass = process.env.ADMIN_MASTER_PASSWORD;

    const isValid =
      (adminEnvPass && enteredPass === adminEnvPass) ||
      (currentPass && enteredPass === currentPass) ||
      (localPass && enteredPass === localPass);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your mobile number and password." },
        { status: 401 }
      );
    }

    const userRole = isSuperAdmin ? "Super Admin" : (user.role || "Customer");
    const sessionToken = await createSessionToken({
      id: user._id.toString(),
      mobile: user.mobile,
      name: user.name || "",
      email: user.email || "",
      role: userRole,
      userType: isSuperAdmin ? "Admin" : user.userType,
      userCode: user.userCode,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful!",
      token: sessionToken,
      user: {
        _id: user._id,
        legacyId: (user as any).legacyId,
        mobile: isSuperAdmin ? "8737029643" : user.mobile,
        name: user.name || `User ${cleanMobile.slice(-4)}`,
        email: user.email || "",
        userCode: user.userCode,
        userType: isSuperAdmin ? "Admin" : user.userType,
        role: userRole,
        profession: user.profession || "Consumer",
        gstNumber: user.gstNumber || "",
        businessName: user.businessName || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipcode: user.zipcode || "",
        approvalStatus: user.approvalStatus,
        status: user.status,
      },
    });

    const cookieOpts = getSessionCookieOptions();
    response.cookies.set(cookieOpts.name, sessionToken, cookieOpts);

    return response;
  } catch (error: any) {
    console.error("POST /api/auth/login-password error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to authenticate" },
      { status: 500 }
    );
  }
}
