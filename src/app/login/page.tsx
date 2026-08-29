"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login-user");
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Manrope', system-ui, sans-serif",
        color: "#6b7280",
        fontSize: "14px",
      }}
    >
      Redirecting to RN Login Portal...
    </div>
  );
}

