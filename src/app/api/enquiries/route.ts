import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Enquiry from "@/models/Enquiry";
import { escapeRegex, sanitizeString, sanitizeObject, checkRateLimit, getClientIp, isValidEmail } from "@/lib/security";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

const DEFAULT_MOCK_ENQUIRIES = [
  {
    id: "enq-1001",
    customerName: "Sharma Bath World (Rajesh Sharma)",
    email: "rajesh.sharma@rnvalves.com",
    phone: "9876543210",
    subject: "Bulk Dealership & Price List Enquiry for Glamour Faucets Series",
    message: "We are interested in becoming an authorized distributor for RN Faucets in Chawri Bazar, Delhi. Please share B2B catalogue and wholesale margin details.",
    date: "2026-08-24",
    status: "New",
  },
  {
    id: "enq-1002",
    customerName: "Mehta Interiors (Vikram Mehta)",
    email: "vikram@mehta-architects.in",
    phone: "9811223344",
    subject: "Architectural Project Bulk Order - 120 Units Single Lever Basin Mixer",
    message: "Executing a luxury residential project in Lower Parel. Need 120 sets of Glossy Chrome Single Lever Basin Mixers. Kindly send quotation.",
    date: "2026-08-23",
    status: "In Progress",
  },
  {
    id: "enq-1003",
    customerName: "Sunil Verma",
    email: "verma.sunil@gmail.com",
    phone: "9988776655",
    subject: "Product Warranty & Installation Support Query",
    message: "Required installation guide and warranty certificate for RN Concealed Diverter Valves.",
    date: "2026-08-22",
    status: "Resolved",
  },
];

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = sanitizeString(searchParams.get("q") || "", 80);
    const status = sanitizeString(searchParams.get("status") || "All", 30);

    const count = await Enquiry.countDocuments();
    if (count === 0) {
      await Enquiry.insertMany(DEFAULT_MOCK_ENQUIRIES);
    }

    const query: any = {};
    if (q) {
      const safeQ = escapeRegex(q);
      query.$or = [
        { customerName: { $regex: safeQ, $options: "i" } },
        { email: { $regex: safeQ, $options: "i" } },
        { phone: { $regex: safeQ, $options: "i" } },
        { subject: { $regex: safeQ, $options: "i" } },
      ];
    }
    if (status !== "All") {
      query.status = status;
    }

    const enquiries = await Enquiry.find(query).sort({ createdAt: -1 }).lean();
    const newCount = await Enquiry.countDocuments({ status: "New" });

    return NextResponse.json({
      enquiries,
      total: enquiries.length,
      newCount,
    });
  } catch (error: any) {
    return handleApiError(error, "GET /api/enquiries");
  }
}

export async function POST(request: Request) {
  try {
    // ── Spam & Rate Limit Protection ──
    const clientIp = getClientIp(request);
    const ipLimit = checkRateLimit(`enquiry-ip:${clientIp}`, 8, 10 * 60 * 1000);
    if (!ipLimit.allowed) {
      return apiError("Too many submissions from this connection. Please wait before submitting another enquiry.", {
        status: 429,
        code: "RATE_LIMITED",
      });
    }

    await connectDB();
    const rawBody = await request.json().catch(() => ({}));
    const body = sanitizeObject(rawBody);

    const customerName = sanitizeString(body.customerName, 100);
    const email = sanitizeString(body.email, 120);

    if (!customerName || !email) {
      return apiError("Customer name and email address are required.", { status: 400 });
    }

    if (!isValidEmail(email)) {
      return apiError("Please enter a valid email address.", { status: 400 });
    }

    const id = body.id || `enq-${Date.now().toString().slice(-6)}`;
    const date = body.date || new Date().toISOString().split("T")[0];

    const newEnquiry = await Enquiry.create({
      ...body,
      customerName,
      email,
      phone: sanitizeString(body.phone, 30),
      companyName: sanitizeString(body.companyName, 120),
      profession: sanitizeString(body.profession, 60),
      subject: sanitizeString(body.subject, 150),
      message: sanitizeString(body.message, 1000),
      id,
      date,
      status: "New",
    });

    return NextResponse.json(newEnquiry, { status: 201 });
  } catch (error: any) {
    return handleApiError(error, "POST /api/enquiries");
  }
}
