import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const DEFAULT_MOCK_USERS = [
  {
    mobile: "9876543210",
    name: "Rajesh Sharma",
    email: "rajesh.sharma@rnvalves.com",
    userCode: "RN-BUS-1001",
    userType: "Business",
    role: "Distributor",
    profession: "Distributor",
    gstNumber: "07AAAAA0000A1Z5",
    businessName: "Sharma Hardware & Sanitary Mart",
    address: "Plot 42, Chawri Bazar",
    city: "Delhi",
    state: "Delhi",
    zipcode: "110006",
    approvalStatus: "Pending",
    status: "Active",
    permissions: ["catalogue.view", "orders.view"],
    createdBy: "Self Registration",
  },
  {
    mobile: "9811223344",
    name: "Vikram Mehta",
    email: "vikram@mehta-architects.in",
    userCode: "RN-BUS-1002",
    userType: "Business",
    role: "Architect",
    profession: "Architect",
    gstNumber: "27BBBBM1111B2Z3",
    businessName: "Mehta Luxury Interiors",
    address: "Suite 302, Senapati Bapat Marg",
    city: "Mumbai",
    state: "Maharashtra",
    zipcode: "400013",
    approvalStatus: "Pending",
    status: "Active",
    permissions: ["catalogue.view"],
    createdBy: "Self Registration",
  },
  {
    mobile: "9988776655",
    name: "Amit Patel",
    email: "patel.sanitary@gmail.com",
    userCode: "RN-BUS-1003",
    userType: "Business",
    role: "Dealer",
    profession: "Dealer",
    gstNumber: "24CCCCP2222C3Z8",
    businessName: "Patel Bath World",
    address: "CG Road, Navrangpura",
    city: "Ahmedabad",
    state: "Gujarat",
    zipcode: "380009",
    approvalStatus: "Approved",
    status: "Active",
    permissions: ["catalogue.view", "orders.view"],
    createdBy: "Admin",
  },
  {
    mobile: "9712345678",
    name: "Pooja Verma",
    email: "pooja.v@gmail.com",
    userCode: "RN-CUST-2001",
    userType: "Customer",
    role: "Customer",
    profession: "Consumer",
    gstNumber: "",
    businessName: "",
    address: "Sector 15, Vasundhara",
    city: "Ghaziabad",
    state: "Uttar Pradesh",
    zipcode: "201012",
    approvalStatus: "Approved",
    status: "Active",
    permissions: [],
    createdBy: "Self Registration",
  },
  {
    mobile: "8737029643",
    name: "Super Admin (Aditya)",
    email: "admin.aditya@rnvalves.com",
    userCode: "RN-ADM-001",
    userType: "Admin",
    role: "Super Admin",
    profession: "Management",
    password: "aditya@123",
    gstNumber: "",
    businessName: "RN Valves & Faucets Corporate",
    address: "Corporate Office",
    city: "Delhi",
    state: "Delhi",
    zipcode: "110006",
    approvalStatus: "Approved",
    status: "Active",
    permissions: ["all"],
    createdBy: "System",
  },
];

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "All";
    const approval = searchParams.get("approval") || "All";

    // Count existing users
    const count = await User.countDocuments();
    if (count === 0) {
      // Seed initial dummy users for test drive
      await User.insertMany(DEFAULT_MOCK_USERS);
    }

    const query: any = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { mobile: { $regex: q, $options: "i" } },
        { userCode: { $regex: q, $options: "i" } },
        { businessName: { $regex: q, $options: "i" } },
        { gstNumber: { $regex: q, $options: "i" } },
      ];
    }

    if (type !== "All") {
      if (type === "Admin") {
        query.userType = { $in: ["Admin", "Employee"] };
      } else {
        query.userType = type;
      }
    }

    if (approval !== "All") {
      query.approvalStatus = approval;
    }

    const users = await User.find(query).sort({ createdAt: -1 }).lean();

    const pendingCount = await User.countDocuments({ approvalStatus: "Pending" });
    const businessCount = await User.countDocuments({ userType: "Business" });
    const customerCount = await User.countDocuments({ userType: "Customer" });
    const adminCount = await User.countDocuments({ userType: { $in: ["Admin", "Employee"] } });

    return NextResponse.json({
      users,
      counts: {
        total: users.length,
        pending: pendingCount,
        business: businessCount,
        customer: customerCount,
        admin: adminCount,
      },
    });
  } catch (error: any) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.mobile || !body.name) {
      return NextResponse.json(
        { error: "Mobile number and name are required." },
        { status: 400 }
      );
    }

    const cleanMobile = body.mobile.trim();
    const userCode = body.userCode || `RN-${(body.userType || "CUST").toUpperCase().substring(0, 3)}-${Date.now().toString().slice(-4)}`;

    const newUser = await User.create({
      ...body,
      mobile: cleanMobile,
      userCode,
      approvalStatus: body.approvalStatus || (body.userType === "Business" ? "Pending" : "Approved"),
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/customers error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user record" },
      { status: 500 }
    );
  }
}
