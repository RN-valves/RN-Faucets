"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectAdminProducts() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/catalogue/products");
  }, [router]);

  return (
    <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>
      Redirecting to Product Master...
    </div>
  );
}
