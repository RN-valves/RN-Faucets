import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Enquiry from "@/models/Enquiry";

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
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "All";

    const count = await Enquiry.countDocuments();
    if (count === 0) {
      await Enquiry.insertMany(DEFAULT_MOCK_ENQUIRIES);
    }

    const query: any = {};
    if (q) {
      query.$or = [
        { customerName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { subject: { $regex: q, $options: "i" } },
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
    console.error("GET /api/enquiries error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch enquiries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.customerName || !body.email) {
      return NextResponse.json({ error: "Customer name and email are required." }, { status: 400 });
    }

    const id = body.id || `enq-${Date.now().toString().slice(-6)}`;
    const date = body.date || new Date().toISOString().split("T")[0];

    const newEnquiry = await Enquiry.create({
      ...body,
      id,
      date,
      status: "New",
    });

    return NextResponse.json(newEnquiry, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/enquiries error:", error);
    return NextResponse.json({ error: error.message || "Failed to create enquiry lead" }, { status: 500 });
  }
}
