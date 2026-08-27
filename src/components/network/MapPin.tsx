"use client";

import { Building2, Factory, Landmark, Warehouse } from "lucide-react";
import type { NetworkLocation } from "./types";
import { TYPE_META } from "./types";

const ICONS = {
  head: Landmark,
  branch: Building2,
  depot: Warehouse,
  manufacturing: Factory,
} as const;

type MapPinProps = {
  location: NetworkLocation;
  active: boolean;
  onFocus: (id: string | null) => void;
};

export default function MapPin({ location, active, onFocus }: MapPinProps) {
  const meta = TYPE_META[location.type];
  const Icon = ICONS[location.type];

  return (
    <button
      type="button"
      data-map-pin
      aria-label={`${location.city} — ${meta.title}`}
      className="group absolute z-10 -translate-x-1/2 -translate-y-full outline-none focus-visible:ring-2 focus-visible:ring-[#00AEEF] focus-visible:ring-offset-2"
      style={{ left: `${location.x}%`, top: `${location.y}%` }}
      onMouseEnter={() => onFocus(location.id)}
      onMouseLeave={() => onFocus(null)}
      onFocus={() => onFocus(location.id)}
      onBlur={() => onFocus(null)}
    >
      <span
        className={`relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${meta.pinClass} ${meta.glow} transition-transform duration-300 ease-out group-hover:scale-[1.15] group-focus-visible:scale-[1.15] ${
          active ? "scale-[1.15]" : "scale-100"
        }`}
      >
        <Icon size={15} strokeWidth={1.9} className="text-white" aria-hidden />
        <span className="pointer-events-none absolute inset-0 animate-network-pulse rounded-full bg-white/20" />
      </span>

      {/* Pin tip */}
      <span
        className={`mx-auto -mt-0.5 block h-0 w-0 border-x-[6px] border-t-[8px] border-x-transparent transition-opacity ${
          location.type === "head"
            ? "border-t-[#1D4ED8]"
            : location.type === "branch"
              ? "border-t-[#0284C7]"
              : location.type === "manufacturing"
                ? "border-t-[#B91C1C]"
                : "border-t-[#1E293B]"
        }`}
        aria-hidden
      />

      {/* City label */}
      <span
        className="pointer-events-none absolute left-[calc(100%+6px)] top-1 whitespace-nowrap text-[10px] font-bold tracking-wide text-slate-700 opacity-80 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]"
        aria-hidden
      >
        {location.city}
      </span>

      {/* Tooltip */}
      <span
        className={`pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-20 w-max min-w-[150px] -translate-x-1/2 rounded-xl border border-slate-200/80 bg-white/95 px-3 py-2 text-left shadow-[0_12px_32px_rgba(15,23,42,0.14)] backdrop-blur-md transition-all duration-300 ${
          active
            ? "translate-y-0 opacity-100"
            : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
        }`}
        role="tooltip"
      >
        <span className="block text-[13px] font-bold text-slate-900">{location.city}</span>
        <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0284C7]">
          {meta.title}
        </span>
        <span className="mt-1 block text-[12px] leading-snug text-slate-500">{location.label}</span>
      </span>
    </button>
  );
}
