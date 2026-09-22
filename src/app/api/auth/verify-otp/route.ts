import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Otp from "@/models/Otp";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { mobile, otp, name, email, userType, businessName, gstNumber, isDirectRegistration } = await request.json();

    if (!mobile) {
      return NextResponse.json({ error: "Mobile number is required." }, { status: 400 });
    }

    const cleanMobile = String(mobile).replace(/\D/g, "").slice(-10);
    const enteredOtp = otp ? String(otp).trim() : "";

    // If not direct registration, verify OTP
    if (!isDirectRegistration) {
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
    const isSuperAdmin = cleanMobile === "8737029643";
    let user = await User.findOne({ 
      $or: [
        { mobile: cleanMobile },
        { mobile: `+91${cleanMobile}` },
        { mobile: `91${cleanMobile}` },
      ]
    });

    if (!user) {
      const type = isSuperAdmin ? "Admin" : (userType || "Customer");
      const userCode = isSuperAdmin ? "RN-ADM-001" : `RN-${type.substring(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`;

      user = await User.create({
        mobile: cleanMobile,
        name: isSuperAdmin ? "Super Admin (Aditya)" : (name || `Customer ${cleanMobile.slice(-4)}`),
        email: email || (isSuperAdmin ? "admin.aditya@rnvalves.com" : ""),
        userCode,
        userType: type,
        role: isSuperAdmin ? "Super Admin" : "User",
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

    return NextResponse.json({
      success: true,
      message: "Mobile verified successfully!",
      user: {
        _id: user._id,
        mobile: "8737029643" === cleanMobile ? "8737029643" : user.mobile,
        name: user.name,
        email: user.email,
        userCode: user.userCode,
        userType: isSuperAdmin ? "Admin" : user.userType,
        role: isSuperAdmin ? "Super Admin" : (user.role || "User"),
        profession: user.profession,
        gstNumber: user.gstNumber,
        businessName: user.businessName,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (error: any) {
    console.error("POST /api/auth/verify-otp error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
