import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { createSessionToken, getSessionCookieOptions } from "@/lib/session";
import { checkRateLimit, getClientIp, isValidIndianPhone } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`verify-otp:${ip}`, 20, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please wait a moment." },
        { status: 429 }
      );
    }

    await connectDB();
    const body = await request.json();
    const { mobile, otp, name, email, userType, businessName, gstNumber, isDirectRegistration } = body;

    if (!mobile || !isValidIndianPhone(mobile)) {
      return NextResponse.json(
        { error: "A valid 10-digit Indian mobile number is required." },
        { status: 400 }
      );
    }

    const cleanMobile = String(mobile).replace(/\D/g, "").slice(-10);
    const enteredOtp = otp ? String(otp).trim() : "";
    const isSuperAdmin = cleanMobile === "8737029643";

    // ── Direct Registration Security Guard ──
    if (isDirectRegistration) {
      // Direct registration can NEVER be used for Admin roles or Super Admin accounts
      if (isSuperAdmin || userType === "Admin" || userType === "Employee") {
        return NextResponse.json(
          { error: "Administrative accounts require strict OTP verification." },
          { status: 403 }
        );
      }

      // Check if user already exists with an admin/staff role
      const existingUser = await User.findOne({
        $or: [
          { mobile: cleanMobile },
          { mobile: `+91${cleanMobile}` },
          { mobile: `91${cleanMobile}` },
        ],
      });

      if (existingUser && (existingUser.userType === "Admin" || existingUser.role === "Super Admin")) {
        return NextResponse.json(
          { error: "This mobile is associated with an admin account. Please verify via OTP." },
          { status: 403 }
        );
      }
    } else {
      // ── Standard OTP Verification ──
      if (!enteredOtp) {
        return NextResponse.json({ error: "OTP is required." }, { status: 400 });
      }

      let isValidOtp = false;

      // 1. Check in MongoDB Otp collection
      const otpRecord = await Otp.findOne({
        mobile: cleanMobile,
        otp: enteredOtp,
        expiresAt: { $gt: new Date() },
      });

      if (otpRecord) {
        isValidOtp = true;
        // Clean up verified OTP
        await Otp.deleteMany({ mobile: cleanMobile });
      } else {
        // 2. Fallback to MSG91 OTP verify API
        const authKey = process.env.MSG91_AUTH_KEY;
        const baseUrl = process.env.MSG91_BASE_URL || "https://control.msg91.com/api/v5";
        if (authKey) {
          try {
            const verifyUrl = `${baseUrl}/otp/verify?otp=${enteredOtp}&mobile=91${cleanMobile}`;
            const verifyRes = await fetch(verifyUrl, {
              method: "GET",
              headers: { authkey: authKey },
            });
            const verifyData = await verifyRes.json();
            if (
              verifyData &&
              (verifyData.type === "success" ||
                verifyData.message === "OTP verified success" ||
                verifyData.message === "OTP verified success.")
            ) {
              isValidOtp = true;
            }
          } catch (vErr) {
            console.error("MSG91 OTP verify error:", vErr);
          }
        }
      }

      if (!isValidOtp) {
        return NextResponse.json(
          { error: "Invalid or expired OTP. Please enter the correct code." },
          { status: 400 }
        );
      }
    }

    // Find or create customer
    let user = await User.findOne({
      $or: [
        { mobile: cleanMobile },
        { mobile: `+91${cleanMobile}` },
        { mobile: `91${cleanMobile}` },
      ],
    });

    if (!user) {
      const type = isSuperAdmin ? "Admin" : (userType === "Business" ? "Business" : "Customer");
      const userCode = isSuperAdmin ? "RN-ADM-001" : `RN-${type.substring(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`;

      user = await User.create({
        mobile: cleanMobile,
        name: isSuperAdmin ? "Super Admin (Aditya)" : (name || `Customer ${cleanMobile.slice(-4)}`),
        email: email || (isSuperAdmin ? "admin.aditya@rnvalves.com" : ""),
        userCode,
        userType: type,
        role: isSuperAdmin ? "Super Admin" : "Customer",
        profession: isSuperAdmin ? "Super Admin" : (type === "Business" ? "Dealer" : "Consumer"),
        businessName: businessName || "",
        gstNumber: gstNumber || "",
        approvalStatus: "Approved",
        status: "Active",
      });
    } else if (isSuperAdmin) {
      user.mobile = "8737029643";
      user.userType = "Admin";
      user.role = "Super Admin";
      user.approvalStatus = "Approved";
      user.name = user.name || "Super Admin (Aditya)";
      user.email = user.email || "admin.aditya@rnvalves.com";
      await user.save();
    }

    // Issue Cryptographically Signed Session Token & Cookie
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
      message: "Mobile verified successfully!",
      token: sessionToken,
      user: {
        _id: user._id,
        mobile: isSuperAdmin ? "8737029643" : user.mobile,
        name: user.name,
        email: user.email,
        userCode: user.userCode,
        userType: isSuperAdmin ? "Admin" : user.userType,
        role: userRole,
        profession: user.profession,
        gstNumber: user.gstNumber,
        businessName: user.businessName,
        approvalStatus: user.approvalStatus,
      },
    });

    const cookieOpts = getSessionCookieOptions();
    response.cookies.set(cookieOpts.name, sessionToken, cookieOpts);

    return response;
  } catch (error: any) {
    console.error("POST /api/auth/verify-otp error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
