import mongoose from "mongoose";

export function getOrderSearchQuery(id: string) {
  if (!id) return { _id: null };
  const cleanNum = id.replace(/\D/g, "");
  const cleanId = id.trim();
  const queries: any[] = [
    { id: cleanId },
    { id: `#${cleanId}` },
    { id: cleanId.replace(/^#/, "") },
  ];
  if (cleanNum) {
    queries.push(
      { id: `RNORD${cleanNum}` },
      { id: `RNOD${cleanNum}` },
      { id: cleanNum },
      { id: `#${cleanNum}` },
      { order_number: cleanNum },
      { order_number: `RNORD${cleanNum}` },
      { order_number: `RNOD${cleanNum}` },
      { order_number: `#OD${cleanNum}` },
      { order_number: `OD${cleanNum}` },
      { legacyId: Number(cleanNum) }
    );
  }
  if (mongoose.isValidObjectId(cleanId)) {
    queries.push({ _id: cleanId });
  }
  return { $or: queries };
}
