import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Otp from "@/models/Otp";
import { checkRateLimit, getClientIp, isValidIndianPhone } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const body = await request.json();
    const { mobile } = body;

    if (!mobile || !isValidIndianPhone(mobile)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    const cleanMobile = String(mobile).replace(/\D/g, "").slice(-10);
    const isSuperAdmin = cleanMobile === "8737029643";

    if (!isSuperAdmin) {
      // Rate limit per IP: max 5 requests per minute
      const ipLimit = checkRateLimit(`send-otp:ip:${ip}`, 5, 60 * 1000);
      if (!ipLimit.allowed) {
        return NextResponse.json(
          { error: "Too many OTP requests from this connection. Please wait a minute." },
          { status: 429 }
        );
      }

      // Rate limit per phone number: max 3 requests per 2 minutes
      const phoneLimit = checkRateLimit(`send-otp:phone:${cleanMobile}`, 3, 2 * 60 * 1000);
      if (!phoneLimit.allowed) {
        return NextResponse.json(
          { error: "An OTP was recently sent. Please wait before requesting another." },
          { status: 429 }
        );
      }
    }

    // Generate cryptographically random 4-digit OTP (1000 - 9999)
    const randomArray = new Uint32Array(1);
    crypto.getRandomValues(randomArray);
    const otp = (1000 + (randomArray[0] % 9000)).toString();

    // Store OTP in MongoDB with 10-minute expiry
    try {
      await connectDB();
      await Otp.deleteMany({ mobile: cleanMobile });
      await Otp.create({
        mobile: cleanMobile,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      if (isSuperAdmin) {
        // Also persist master backup OTP 1234 for Super Admin
        await Otp.create({
          mobile: cleanMobile,
          otp: "1234",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
      }
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
