"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, X } from "lucide-react";

const LOGIN_BG = "https://hindware.com/img/registration/login-bg.jpg";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mobile, setMobile] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setVisible(false);
      return;
    }

    const frame = requestAnimationFrame(() => setVisible(true));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className={[
        "fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6",
        "bg-black/55 backdrop-blur-[2px]",
        "transition-opacity duration-300 ease-out",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <div
        className={[
          "relative flex w-full max-w-[920px] flex-col overflow-hidden bg-white shadow-[0_24px_80px_rgba(0,0,0,0.35)]",
          "transition-all duration-300 ease-[cubic-bezier(0.22,0.68,0,1.1)]",
          "md:min-h-[520px] md:max-h-[min(92vh,640px)] md:flex-row",
          visible ? "scale-100 opacity-100" : "scale-[0.96] opacity-0",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left image — desktop only */}
        <div className="relative hidden min-h-0 w-full md:flex md:w-1/2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGIN_BG}
            alt=""
            className="h-full w-full object-cover object-center"
          />
        </div>

        {/* Right form */}
        <div className="relative flex w-full flex-col justify-center px-7 py-10 sm:px-10 sm:py-12 md:w-1/2 md:px-12 md:py-14">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close login modal"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center text-[#666] transition-colors hover:text-[#111]"
          >
            <X size={20} strokeWidth={1.5} />
          </button>

          <div className="mx-auto w-full max-w-[340px]">
            <h2
              id="auth-modal-title"
              className="mb-3 font-[family-name:var(--font-manrope,'Manrope',system-ui,sans-serif)] text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[#1a1a1a] sm:text-[28px]"
            >
              Let&apos;s Get Started!
            </h2>

            <p className="mb-8 font-[family-name:var(--font-manrope,'Manrope',system-ui,sans-serif)] text-[14px] leading-[1.65] text-[#666]">
              Please log in to access your account and enjoy all the exclusive
              features.
            </p>

            {/* Mobile number */}
            <div className="mb-2 flex h-[48px] overflow-hidden border border-[#d1d5db] bg-white">
              <div className="flex shrink-0 items-center gap-1 border-r border-[#e5e7eb] px-3 text-[14px] text-[#333]">
                <span>+91</span>
                <ChevronDown size={14} strokeWidth={1.5} className="text-[#888]" />
              </div>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="Mobile No*"
                value={mobile}
                onChange={(e) =>
                  setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className="min-w-0 flex-1 px-3.5 font-[family-name:var(--font-manrope,'Manrope',system-ui,sans-serif)] text-[14px] text-[#111] outline-none placeholder:text-[#9ca3af]"
              />
            </div>

            <div className="mb-6 text-right">
              <button
                type="button"
                className="font-[family-name:var(--font-manrope,'Manrope',system-ui,sans-serif)] text-[13px] font-medium text-[#111] underline underline-offset-[3px] transition-opacity hover:opacity-70"
              >
                Continue with Email
              </button>
            </div>

            <label className="mb-7 flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer accent-[#2d2d2d]"
              />
              <span className="font-[family-name:var(--font-manrope,'Manrope',system-ui,sans-serif)] text-[12.5px] leading-[1.55] text-[#555]">
                I have gone through the{" "}
                <button
                  type="button"
                  className="text-[#111] underline underline-offset-[2px] hover:opacity-70"
                >
                  Privacy Policy
                </button>{" "}
                and give my consent.
              </span>
            </label>

            <button
              type="button"
              disabled={mobile.length < 10 || !agreed}
              onClick={() => {
                /* OTP flow placeholder */
              }}
              className="mx-auto block w-full max-w-[300px] bg-[#2d2d2d] px-6 py-3.5 font-[family-name:var(--font-manrope,'Manrope',system-ui,sans-serif)] text-[14px] font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:bg-[#b0b0b0]"
            >
              Send OTP
            </button>

            <p className="mt-7 text-center font-[family-name:var(--font-manrope,'Manrope',system-ui,sans-serif)] text-[13px] text-[#888]">
              Don&apos;t have an account?
            </p>

            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
              <button
                type="button"
                className="font-[family-name:var(--font-manrope,'Manrope',system-ui,sans-serif)] text-[13px] font-medium text-[#111] underline underline-offset-[3px] transition-opacity hover:opacity-70"
              >
                Join as Personal User
              </button>
              <span className="font-[family-name:var(--font-manrope,'Manrope',system-ui,sans-serif)] text-[12px] text-[#999]">
                OR
              </span>
              <button
                type="button"
                className="font-[family-name:var(--font-manrope,'Manrope',system-ui,sans-serif)] text-[13px] font-medium text-[#111] underline underline-offset-[3px] transition-opacity hover:opacity-70"
              >
                Join as Business User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
