import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Otp from "@/models/Otp";

export async function POST(request: Request) {
  try {
    const { mobile } = await request.json();

    if (!mobile || !/^[6-9]\d{9}$/.test(mobile.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    const cleanMobile = mobile.trim();

    // Generate random 4-digit OTP (1000 - 9999)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Store OTP in MongoDB with 10-minute expiry
    try {
      await connectDB();
      await Otp.deleteMany({ mobile: cleanMobile });
      await Otp.create({
        mobile: cleanMobile,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });
    } catch (dbErr) {
      console.error("Failed to store OTP in MongoDB:", dbErr);
    }

    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_OTP_TEMPLATE_ID;
    const baseUrl = process.env.MSG91_BASE_URL || "https://control.msg91.com/api/v5";

    if (authKey && templateId) {
      try {
        const msg91Url = `${baseUrl}/otp?template_id=${templateId}&mobile=91${cleanMobile}&otp=${otp}&authkey=${authKey}`;
        const smsRes = await fetch(msg91Url, {
          method: "POST",
          headers: {
            authkey: authKey,
            "Content-Type": "application/json",
          },
        });
        const smsData = await smsRes.json();
        console.log("MSG91 OTP API Response:", smsData);
      } catch (smsErr) {
        console.error("MSG91 API Connection Error:", smsErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to +91 ${cleanMobile}.`,
    });
  } catch (error: any) {
    console.error("POST /api/auth/send-otp error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send OTP" },
      { status: 500 }
    );
  }
}

