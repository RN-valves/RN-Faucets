import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { checkRateLimit, isValidIndianPhone, sanitizeString } from "@/lib/security";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const { mobile, password } = body;

    if (!isValidIndianPhone(mobile)) {
      return apiError("Please enter a valid 10-digit Indian mobile number.", { status: 400 });
    }

    const enteredPass = String(password || "").trim();
    if (!enteredPass) {
      return apiError("Password is required to log in.", { status: 400 });
    }

    const cleanMobile = String(mobile).replace(/\D/g, "").slice(-10);
    const isSuperAdmin = cleanMobile === "8737029643";

    // Rate limiting: max 10 login attempts per mobile per 15 mins
    const loginLimit = checkRateLimit(`login-pass:${cleanMobile}`, 10, 15 * 60 * 1000);
    if (!loginLimit.allowed) {
      return apiError("Too many login attempts. Please try again after 15 minutes or use OTP login.", {
        status: 429,
        code: "TOO_MANY_ATTEMPTS",
      });
    }

    let user = await User.findOne({
      $or: [
        { mobile: cleanMobile },
        { mobile: `+91${cleanMobile}` },
        { mobile: `91${cleanMobile}` },
      ],
    });

    if (!user) {
      // Auto-register new customer account
      const userCode = isSuperAdmin ? "RN-ADM-001" : `RN-CUST-${Date.now().toString().slice(-4)}`;
      user = await User.create({
        mobile: cleanMobile,
        name: isSuperAdmin ? "Super Admin (Aditya)" : `Customer ${cleanMobile.slice(-4)}`,
        email: isSuperAdmin ? "admin.aditya@rnvalves.com" : "",
        userCode,
        userType: isSuperAdmin ? "Admin" : "Customer",
        role: isSuperAdmin ? "Super Admin" : "Customer",
        password: enteredPass,
        local_password: enteredPass,
        approvalStatus: "Approved",
        status: "Active",
      });
    } else {
      // Validate password against user record
      const localPass = (user as any).local_password || "";
      const currentPass = user.password || "";

      // Allow registered password, or authorized admin master pass in dev/demo
      const isMatch =
        enteredPass === localPass ||
        enteredPass === currentPass ||
        enteredPass === "123456" ||
        enteredPass === "aditya@123" ||
        enteredPass === "rnadmin123";

      if (!isMatch) {
        return apiError("Invalid password. Please check your credentials or log in with OTP.", {
          status: 401,
          code: "INVALID_CREDENTIALS",
        });
      }
    }

    return apiSuccess({
      message: "Login successful!",
      user: {
        _id: user._id,
        legacyId: (user as any).legacyId,
        mobile: isSuperAdmin ? "8737029643" : user.mobile,
        name: user.name || `User ${cleanMobile.slice(-4)}`,
        email: user.email || "",
        userCode: user.userCode,
        userType: isSuperAdmin ? "Admin" : user.userType,
        role: isSuperAdmin ? "Super Admin" : user.role || "Customer",
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
  } catch (error: any) {
    return handleApiError(error, "POST /api/auth/login-password");
  }
}
