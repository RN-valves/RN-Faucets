import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";
import RemarkLog from "@/models/RemarkLog";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    let user: any = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(id).lean();
    } else if (!isNaN(Number(id))) {
      user = await User.findOne({ legacyId: Number(id) }).lean();
    } else {
      user = await User.findOne({ $or: [{ userCode: id }, { uuid: id }] }).lean();
    }

    if (!user) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Fetch related orders
    const cleanMobile = (user.mobile || "").replace(/[^\d]/g, "").slice(-10);
    const orderQuery: any = {
      $or: [
        ...(user.legacyId ? [{ userId: user.legacyId }] : []),
        ...(cleanMobile ? [{ customerPhone: { $regex: cleanMobile } }] : []),
      ],
    };
    const orders = await Order.find(orderQuery).sort({ createdAt: -1 }).lean();

    // Fetch related remark logs
    const remarkQuery: any = {
      $or: [
        ...(user.legacyId ? [{ logableId: user.legacyId }] : []),
        ...(cleanMobile ? [{ customerMobile: { $regex: cleanMobile } }] : []),
      ],
    };
    const remarkLogs = await RemarkLog.find(remarkQuery).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      user,
      orders,
      remarkLogs,
      addresses: user.addresses || [],
    });
  } catch (error: any) {
    console.error("GET /api/customers/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch customer profile" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    let updatedUser: any = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      updatedUser = await User.findByIdAndUpdate(id, body, { new: true }).lean();
    } else if (!isNaN(Number(id))) {
      updatedUser = await User.findOneAndUpdate({ legacyId: Number(id) }, body, { new: true }).lean();
    } else {
      updatedUser = await User.findOneAndUpdate({ $or: [{ userCode: id }, { uuid: id }] }, body, { new: true }).lean();
    }

    if (!updatedUser) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("PUT /api/customers/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update customer profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    let deleted: any = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      deleted = await User.findByIdAndDelete(id);
    } else {
      deleted = await User.findOneAndDelete({ $or: [{ legacyId: Number(id) }, { userCode: id }] });
    }

    if (!deleted) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/customers/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete customer" },
      { status: 500 }
    );
  }
}
