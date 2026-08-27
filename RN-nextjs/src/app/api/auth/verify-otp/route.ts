import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { mobile, otp, name, email, userType, businessName, gstNumber } = await request.json();

    if (!mobile || !otp) {
      return NextResponse.json({ error: "Mobile number and OTP are required." }, { status: 400 });
    }

    const cleanMobile = String(mobile).replace(/\D/g, "").slice(-10);

    // Verify OTP (demo accepts 1234)
    if (otp.toString().trim() !== "1234" && otp.toString().trim().length !== 4) {
      return NextResponse.json({ error: "Invalid OTP. Please enter 1234." }, { status: 400 });
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
