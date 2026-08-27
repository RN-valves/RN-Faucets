"use client";

import { Trophy } from "lucide-react";

export type Award = {
  id: string;
  title: string;
  organization: string;
  description: string;
  year: string;
};

type AwardCardProps = {
  award: Award;
};

export default function AwardCard({ award }: AwardCardProps) {
  return (
    <article
      data-award-card
      tabIndex={0}
      className="group relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/75 p-7 shadow-[0_12px_40px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md outline-none transition-all duration-500 ease-out hover:-translate-y-2.5 hover:scale-[1.02] hover:border-[#D4A017]/40 hover:shadow-[0_24px_60px_rgba(15,23,42,0.14),0_0_40px_rgba(212,160,23,0.12)] focus-visible:-translate-y-2.5 focus-visible:scale-[1.02] focus-visible:ring-2 focus-visible:ring-[#D4A017]/70 focus-visible:ring-offset-2 sm:p-8"
      aria-label={`${award.title} — ${award.organization}, ${award.year}`}
    >
      {/* Gold edge frame */}
      <div
        className="pointer-events-none absolute inset-3 rounded-[1.35rem] border border-slate-200/80 transition-colors duration-500 group-hover:border-[#D4A017]/35"
        aria-hidden
      />

      {/* Shine sweep */}
      <div
        className="award-shine pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
        aria-hidden
      >
        <span className="absolute -left-1/3 top-0 h-full w-1/3 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      </div>

      {/* Year watermark */}
      <span
        className="pointer-events-none absolute bottom-3 left-1/2 z-0 -translate-x-1/2 select-none text-[72px] font-extrabold leading-none tracking-tight text-slate-900/[0.05] sm:text-[84px]"
        aria-hidden
      >
        {award.year}
      </span>

      <div className="relative z-[1] flex flex-1 flex-col items-center text-center">
        {/* Trophy badge */}
        <div
          data-award-trophy
          className="relative mb-6 flex h-20 w-20 items-center justify-center"
        >
          <span
            className="absolute inset-0 rounded-full bg-gradient-to-br from-[#F5E6B8]/50 via-[#D4A017]/20 to-transparent blur-md transition-opacity duration-500 group-hover:opacity-100"
            aria-hidden
          />
          <span className="relative flex h-[68px] w-[68px] items-center justify-center rounded-full border border-[#D4A017]/35 bg-gradient-to-br from-white/95 via-[#FFF8E7]/90 to-[#F5E6B8]/70 shadow-[0_8px_24px_rgba(212,160,23,0.25),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-sm transition-transform duration-500 group-hover:rotate-[3deg]">
            <Trophy
              size={28}
              strokeWidth={1.6}
              className="text-[#C49212]"
              aria-hidden
            />
          </span>
          {/* Sparkles */}
          <span className="award-sparkle absolute -right-0.5 top-2 h-1.5 w-1.5 rounded-full bg-[#F5D76E]" aria-hidden />
          <span className="award-sparkle award-sparkle-delay absolute -left-1 top-8 h-1 w-1 rounded-full bg-[#E8C547]" aria-hidden />
          <span className="award-sparkle award-sparkle-delay-2 absolute bottom-2 right-1 h-1 w-1 rounded-full bg-[#D4A017]" aria-hidden />
        </div>

        <h3 className="mb-2 text-[17px] font-bold leading-snug tracking-tight text-slate-900">
          {award.title}
        </h3>

        <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#C49212]">
          {award.organization}
        </p>

        <p className="mt-auto text-[13.5px] leading-relaxed text-slate-500">
          {award.description}
        </p>
      </div>
    </article>
  );
}
