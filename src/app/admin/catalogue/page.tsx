"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectCatalogueIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/catalogue/categories");
  }, [router]);

  return (
    <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>
      Redirecting to Catalogue Categories...
    </div>
  );
}
