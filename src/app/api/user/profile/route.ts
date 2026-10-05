import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getSessionFromRequest } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    await connectDB();
    const cleanPhone = String(session.mobile || "").replace(/\D/g, "").slice(-10);

    const user: any = await User.findOne({
      $or: [
        { _id: session.id },
        { mobile: cleanPhone },
        { mobile: `+91${cleanPhone}` },
        { mobile: `91${cleanPhone}` },
      ],
    }).lean();

    if (!user) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || cleanPhone,
        userCode: user.userCode || "",
        userType: user.userType || "Customer",
        role: user.role || "Customer",
        profession: user.profession || "Consumer",
        gstNumber: user.gstNumber || "",
        businessName: user.businessName || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipcode: user.zipcode || "",
        addresses: Array.isArray(user.addresses) ? user.addresses : [],
        approvalStatus: user.approvalStatus || "Approved",
        status: user.status || "Active",
      },
    });
  } catch (error: any) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch profile." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const cleanPhone = String(session.mobile || "").replace(/\D/g, "").slice(-10);

    const updateFields: any = {};
    if (typeof body.name === "string") updateFields.name = body.name.trim();
    if (typeof body.email === "string") updateFields.email = body.email.trim().toLowerCase();
    if (typeof body.gstNumber === "string") updateFields.gstNumber = body.gstNumber.trim().toUpperCase();
    if (typeof body.businessName === "string") updateFields.businessName = body.businessName.trim();
    if (typeof body.profession === "string") updateFields.profession = body.profession.trim();
    if (typeof body.address === "string") updateFields.address = body.address.trim();
    if (typeof body.city === "string") updateFields.city = body.city.trim();
    if (typeof body.state === "string") updateFields.state = body.state.trim();
    if (typeof body.zipcode === "string") updateFields.zipcode = body.zipcode.trim();
    if (Array.isArray(body.addresses)) updateFields.addresses = body.addresses;

    // If GST number is provided, automatically mark user as Business if currently Customer
    if (updateFields.gstNumber && updateFields.gstNumber.length >= 15) {
      updateFields.userType = "Business";
      updateFields.profession = updateFields.profession || "Dealer/Retailer";
    }

    const updatedUser: any = await User.findOneAndUpdate(
      {
        $or: [
          { _id: session.id },
          { mobile: cleanPhone },
          { mobile: `+91${cleanPhone}` },
          { mobile: `91${cleanPhone}` },
        ],
      },
      { $set: updateFields },
      { new: true }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found to update." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully!",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        mobile: updatedUser.mobile || cleanPhone,
        userCode: updatedUser.userCode || "",
        userType: updatedUser.userType || "Customer",
        role: updatedUser.role || "Customer",
        profession: updatedUser.profession || "Consumer",
        gstNumber: updatedUser.gstNumber || "",
        businessName: updatedUser.businessName || "",
        address: updatedUser.address || "",
        city: updatedUser.city || "",
        state: updatedUser.state || "",
        zipcode: updatedUser.zipcode || "",
        addresses: Array.isArray(updatedUser.addresses) ? updatedUser.addresses : [],
      },
    });
  } catch (error: any) {
    console.error("PUT /api/user/profile error:", error);
    return NextResponse.json({ error: error.message || "Failed to update profile." }, { status: 500 });
  }
}
