import { NextResponse } from "next/server";

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
    // Default test OTP for instant testing, also delivered live via MSG91
    const otp = "1234";

    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_OTP_TEMPLATE_ID;

    if (authKey && templateId) {
      try {
        const msg91Url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=91${cleanMobile}&otp=${otp}`;
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
      message: `OTP sent successfully to +91 ${cleanMobile}. (Demo OTP: ${otp})`,
      otp,
    });
  } catch (error: any) {
    console.error("POST /api/auth/send-otp error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send OTP" },
      { status: 500 }
    );
  }
}
