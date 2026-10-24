import mongoose, { Schema, Model } from "mongoose";
import Order from "./Order";
import Payment from "./Payment";

export interface ICounter {
  _id: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, required: true, default: 0 },
});

const Counter: Model<ICounter> =
  mongoose.models.Counter || mongoose.model<ICounter>("Counter", CounterSchema);

export default Counter;

/**
 * Atomically generates the next sequential RNOD order ID and legacyId.
 * Safe against concurrent checkouts (prevents E11000 duplicate key collisions).
 */
export async function getNextAtomicOrderIdentity(): Promise<{ id: string; legacyId: number }> {
  // Find current highest sequential order in DB to ensure counter is never behind
  const highestSequential: any = await Order.findOne({
    id: { $not: { $regex: /\d{6}/ } },
    $or: [
      { legacyId: { $gt: 0, $lt: 100000 } },
      { id: { $regex: /^(RNOD|RN-ORD-)\d{1,5}$/i } },
    ],
  })
    .sort({ legacyId: -1, createdAt: -1 })
    .select("id legacyId")
    .lean();

  let maxNum = 829;
  if (highestSequential) {
    const idNum = parseInt(String(highestSequential.id || "").replace(/\D/g, "") || "0", 10);
    const legNum = Number(highestSequential.legacyId) || 0;
    const valid = Math.max(idNum < 100000 ? idNum : 0, legNum < 100000 ? legNum : 0);
    if (valid > maxNum) maxNum = valid;
  }

  // Ensure the counter document exists and is at least maxNum
  await Counter.updateOne(
    { _id: "order_seq", seq: { $lt: maxNum } },
    { $set: { seq: maxNum } },
    { upsert: true }
  ).catch(() => {});

  const updated = await Counter.findByIdAndUpdate(
    "order_seq",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  ).lean();

  const nextNum = Math.max(maxNum + 1, updated?.seq || maxNum + 1);
  if (updated && updated.seq < nextNum) {
    await Counter.updateOne({ _id: "order_seq", seq: { $lt: nextNum } }, { $set: { seq: nextNum } }).catch(() => {});
  }

  return {
    id: `RNOD${nextNum}`,
    legacyId: nextNum,
  };
}

/**
 * Atomically generates the next sequential Payment ID (PAY-...).
 */
export async function getNextAtomicPaymentIdentity(): Promise<{ id: number; paymentId: string }> {
  const lastPayment: any = await Payment.findOne().sort({ id: -1 }).select("id").lean();
  const maxPayId = Math.max(581, Number(lastPayment?.id) || 581);

  await Counter.updateOne(
    { _id: "payment_seq", seq: { $lt: maxPayId } },
    { $set: { seq: maxPayId } },
    { upsert: true }
  ).catch(() => {});

  const updated = await Counter.findByIdAndUpdate(
    "payment_seq",
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  ).lean();

  const nextPayId = Math.max(maxPayId + 1, updated?.seq || maxPayId + 1);
  return {
    id: nextPayId,
    paymentId: `PAY-${nextPayId}`,
  };
}
