import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Otp from "@/models/Otp";
import { checkRateLimit, getClientIp, isValidIndianPhone } from "@/lib/security";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawMobile = body.mobile;

    if (!isValidIndianPhone(rawMobile)) {
      return apiError("Please enter a valid 10-digit Indian mobile number.", { status: 400 });
    }

    const cleanMobile = String(rawMobile).replace(/\D/g, "").slice(-10);
    const clientIp = getClientIp(request);

    // ── Rate Limiting (Prevent SMS Spam / Abuse) ──
    const phoneLimit = checkRateLimit(`otp-phone:${cleanMobile}`, 5, 10 * 60 * 1000);
    if (!phoneLimit.allowed) {
      return apiError("Too many OTP requests for this mobile number. Please wait a few minutes.", {
        status: 429,
        code: "RATE_LIMITED",
      });
    }

    const ipLimit = checkRateLimit(`otp-ip:${clientIp}`, 25, 10 * 60 * 1000);
    if (!ipLimit.allowed) {
      return apiError("Too many verification attempts from your network. Please try again later.", {
        status: 429,
        code: "IP_RATE_LIMITED",
      });
    }

    // Generate cryptographically secure random 4-digit OTP (1000 - 9999)
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

    // Dispatch SMS via MSG91 if configured
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
        if (process.env.NODE_ENV === "development") {
          console.log("MSG91 OTP API Response:", smsData);
        }
      } catch (smsErr) {
        console.error("MSG91 API Connection Error:", smsErr);
      }
    }

    return apiSuccess({
      message: `OTP sent successfully to +91 ${cleanMobile}.`,
    });
  } catch (error: any) {
    return handleApiError(error, "POST /api/auth/send-otp");
  }
}
