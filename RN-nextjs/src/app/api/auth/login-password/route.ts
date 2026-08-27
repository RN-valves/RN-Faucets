import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { mobile, password } = await request.json();

    if (!mobile || !password) {
      return NextResponse.json(
        { error: "Mobile number and password are required." },
        { status: 400 }
      );
    }

    const cleanMobile = String(mobile).replace(/\D/g, "").slice(-10);
    const isSuperAdmin = cleanMobile === "8737029643";
    let user = await User.findOne({
      $or: [
        { mobile: cleanMobile },
        { mobile: `+91${cleanMobile}` },
        { mobile: `91${cleanMobile}` },
      ]
    });

    if (!user) {
      // Create user if logging in for the first time via password demo
      const userCode = isSuperAdmin ? "RN-ADM-001" : `RN-CUST-${Date.now().toString().slice(-4)}`;
      user = await User.create({
        mobile: cleanMobile,
        name: isSuperAdmin ? "Super Admin (Aditya)" : `Customer ${cleanMobile.slice(-4)}`,
        email: isSuperAdmin ? "admin.aditya@rnvalves.com" : "",
        userCode,
        userType: isSuperAdmin ? "Admin" : "Customer",
        role: isSuperAdmin ? "Super Admin" : "Customer",
        password: password,
        approvalStatus: "Approved",
        status: "Active",
      });
    } else if (isSuperAdmin) {
      if (password !== "aditya@123" && password !== "123456" && password !== "rnadmin123" && user.password && user.password !== password) {
        return NextResponse.json(
          { error: "Invalid Super Admin password. (Demo Password: aditya@123 / 123456)" },
          { status: 400 }
        );
      }
      user.userType = "Admin";
      user.role = "Super Admin";
      user.mobile = "8737029643";
      await user.save();
    } else if (user.password && user.password !== password && password !== "123456" && password !== "aditya@123") {
      return NextResponse.json(
        { error: "Invalid password. (Demo Password: 123456)" },
        { status: 400 }
      );
    } else if (!user.password) {
      user.password = password;
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: "Login successful!",
      user: {
        _id: user._id,
        mobile: isSuperAdmin ? "8737029643" : user.mobile,
        name: user.name,
        email: user.email,
        userCode: user.userCode,
        userType: isSuperAdmin ? "Admin" : user.userType,
        role: isSuperAdmin ? "Super Admin" : (user.role || "Customer"),
        profession: user.profession,
        gstNumber: user.gstNumber,
        businessName: user.businessName,
        approvalStatus: user.approvalStatus,
      },
    });
  } catch (error: any) {
    console.error("POST /api/auth/login-password error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to authenticate" },
      { status: 500 }
    );
  }
}
