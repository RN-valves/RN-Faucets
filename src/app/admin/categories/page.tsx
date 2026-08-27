"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RedirectAdminCategories() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      router.replace(`/admin/catalogue/categories?tab=${tab}`);
    } else {
      router.replace("/admin/catalogue/categories");
    }
  }, [router, searchParams]);

  return (
    <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>
      Redirecting to Category Master...
    </div>
  );
}
