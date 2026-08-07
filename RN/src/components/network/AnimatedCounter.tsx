"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

type AnimatedCounterProps = {
  value: number;
  suffix?: string;
  label: string;
  duration?: number;
  trigger?: boolean;
};

export default function AnimatedCounter({
  value,
  suffix = "",
  label,
  duration = 1.6,
  trigger = false,
}: AnimatedCounterProps) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!trigger || hasAnimated.current || !numberRef.current) return;
    hasAnimated.current = true;

    const obj = { n: 0 };
    gsap.to(obj, {
      n: value,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        if (!numberRef.current) return;
        numberRef.current.textContent = `${Math.round(obj.n)}${suffix}`;
      },
    });
  }, [trigger, value, suffix, duration]);

  return (
    <div
      className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm"
      data-network-stat
    >
      <span
        ref={numberRef}
        className="block text-2xl font-bold tracking-tight text-slate-900 md:text-3xl"
      >
        0{suffix}
      </span>
      <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
    </div>
  );
}
