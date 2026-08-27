"use client";

export default function ScrollIndicator() {
  return (
    <div
      className="w-full flex flex-col items-center pb-8 gap-2"
      aria-label="Scroll down indicator"
    >
      <span
        className="text-white/60 tracking-[0.25em] uppercase"
        style={{
          fontFamily: "var(--font-manrope)",
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.25em",
        }}
      >
        Scroll
      </span>
      <div className="scroll-indicator-line" />
    </div>
  );
}
