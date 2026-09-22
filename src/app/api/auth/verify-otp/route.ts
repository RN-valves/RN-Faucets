import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { checkRateLimit, getClientIp, isValidIndianPhone, sanitizeString } from "@/lib/security";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const { mobile, otp, name, email, userType, businessName, gstNumber, isDirectRegistration } = body;

    if (!isValidIndianPhone(mobile)) {
      return apiError("Please enter a valid 10-digit mobile number.", { status: 400 });
    }

    const cleanMobile = String(mobile).replace(/\D/g, "").slice(-10);
    const clientIp = getClientIp(request);
    const isSuperAdminNumber = cleanMobile === "8737029643";

    // ── Security Check: Disallow unverified Admin claims via isDirectRegistration ──
    if (isDirectRegistration && isSuperAdminNumber) {
      return apiError("OTP verification is strictly required for administrator authentication.", {
        status: 403,
        code: "ADMIN_OTP_REQUIRED",
      });
    }

    // If not direct registration, verify OTP with rate limit on attempts
    if (!isDirectRegistration) {
      const enteredOtp = otp ? String(otp).trim() : "";
      if (!enteredOtp) {
        return apiError("OTP is required.", { status: 400 });
      }

      // Brute-force protection: max 10 attempts per mobile per 15 minutes
      const attemptLimit = checkRateLimit(`otp-verify:${cleanMobile}`, 10, 15 * 60 * 1000);
      if (!attemptLimit.allowed) {
        return apiError("Too many incorrect OTP attempts. Please wait 15 minutes.", {
          status: 429,
          code: "TOO_MANY_ATTEMPTS",
        });
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
        return apiError("Invalid or expired OTP. Please enter the correct code.", { status: 400 });
      }
    }

    // Find existing user
    let user = await User.findOne({
      $or: [
        { mobile: cleanMobile },
        { mobile: `+91${cleanMobile}` },
        { mobile: `91${cleanMobile}` },
      ],
    });

    if (isDirectRegistration && user) {
      return apiError("An account with this mobile number already exists. Please log in.", {
        status: 409,
        code: "ACCOUNT_EXISTS",
      });
    }

    if (!user) {
      const safeType = isSuperAdminNumber ? "Admin" : (userType === "Business" ? "Business" : "Customer");
      const userCode = isSuperAdminNumber
        ? "RN-ADM-001"
        : `RN-${safeType.substring(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`;

      user = await User.create({
        mobile: cleanMobile,
        name: isSuperAdminNumber
          ? "Super Admin (Aditya)"
          : sanitizeString(name, 100) || `Customer ${cleanMobile.slice(-4)}`,
        email: isSuperAdminNumber
          ? "admin.aditya@rnvalves.com"
          : sanitizeString(email, 120),
        userCode,
        userType: safeType,
        role: isSuperAdminNumber ? "Super Admin" : "User",
        profession: isSuperAdminNumber
          ? "Super Admin"
          : safeType === "Business"
          ? "Dealer"
          : "Consumer",
        businessName: sanitizeString(businessName, 150),
        gstNumber: sanitizeString(gstNumber, 20).toUpperCase(),
        approvalStatus: "Approved",
        status: "Active",
      });
    } else if (isSuperAdminNumber && !isDirectRegistration) {
      user.mobile = "8737029643";
      user.userType = "Admin";
      user.role = "Super Admin";
      user.approvalStatus = "Approved";
      user.name = user.name || "Super Admin (Aditya)";
      user.email = user.email || "admin.aditya@rnvalves.com";
      await user.save();
    }

    return apiSuccess({
      message: "Mobile verified successfully!",
      user: {
        _id: user._id,
        mobile: isSuperAdminNumber ? "8737029643" : user.mobile,
        name: user.name,
        email: user.email,
        userCode: user.userCode,
        userType: isSuperAdminNumber ? "Admin" : user.userType,
        role: isSuperAdminNumber ? "Super Admin" : user.role || "User",
        profession: user.profession,
        gstNumber: user.gstNumber,
        businessName: user.businessName,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (error: any) {
    return handleApiError(error, "POST /api/auth/verify-otp");
  }
}
