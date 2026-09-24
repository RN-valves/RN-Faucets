"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SupportModal from "@/components/SupportModal";

export default function FloatingActionButtons() {
  const pathname = usePathname();
  const [showTop, setShowTop] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <div
        className="floating-action-stack"
        style={{
          position: "fixed",
          bottom: "16px",
          right: "14px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          zIndex: 999,
        }}
        aria-label="Quick actions"
      >
        <style>{`
          .fab-btn {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: none;
            padding: 0;
            transition: transform 0.25s ease, box-shadow 0.25s ease;
            text-decoration: none;
          }
          .fab-btn:hover {
            transform: translateY(-2px);
          }
          .fab-btn-chat,
          .fab-btn-top {
            background: #ffffff;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.14);
          }
          .fab-btn-chat:hover,
          .fab-btn-top:hover {
            box-shadow: 0 5px 14px rgba(0, 0, 0, 0.18);
          }
          .fab-btn-whatsapp {
            background: #25D366;
            box-shadow: 0 3px 10px rgba(37, 211, 102, 0.35);
          }
          .fab-btn-whatsapp:hover {
            box-shadow: 0 5px 14px rgba(37, 211, 102, 0.45);
          }
          .fab-btn-top {
            opacity: 0;
            pointer-events: none;
            transform: translateY(8px);
          }
          .fab-btn-top.is-visible {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
          }
          @media (max-width: 768px) {
            .floating-action-stack {
              bottom: 12px !important;
              right: 10px !important;
              gap: 7px !important;
            }
            .fab-btn {
              width: 34px;
              height: 34px;
            }
          }
        `}</style>

        {/* Chat — opens support form */}
        <button
          type="button"
          className="fab-btn fab-btn-chat"
          aria-label="Open support form"
          onClick={() => setSupportOpen(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4.5 6.75A2.25 2.25 0 0 1 6.75 4.5h10.5A2.25 2.25 0 0 1 19.5 6.75v7.5A2.25 2.25 0 0 1 17.25 16.5H10.2L6.6 19.35a.75.75 0 0 1-1.2-.6V16.5h-.15A2.25 2.25 0 0 1 4.5 14.25v-7.5Z"
              stroke="#111111"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <circle cx="9" cy="10.5" r="0.9" fill="#111111" />
            <circle cx="12" cy="10.5" r="0.9" fill="#111111" />
            <circle cx="15" cy="10.5" r="0.9" fill="#111111" />
          </svg>
        </button>

        {/* WhatsApp — direct chat to 9811103377 */}
        <a
          href="https://api.whatsapp.com/send?phone=919811103377&text=Hello,%20I%20am%20a%20visitor%20from%20your%20website%20and%20would%20like%20to%20chat%20with%20you."
          target="_blank"
          rel="noopener noreferrer"
          className="fab-btn fab-btn-whatsapp"
          aria-label="Chat with RN Valves & Faucets on WhatsApp"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
          </svg>
        </a>

        {/* Scroll to top */}
        <button
          type="button"
          className={`fab-btn fab-btn-top${showTop ? " is-visible" : ""}`}
          aria-label="Scroll to top"
          onClick={scrollToTop}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 14.5 12 8.5l6 6"
              stroke="#111111"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
    </>
  );
}
