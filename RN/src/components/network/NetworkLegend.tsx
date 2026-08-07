"use client";

import { Building2, Factory, Landmark, Warehouse } from "lucide-react";
import type { NetworkPinType } from "./types";

const LEGEND_ITEMS: {
  type: NetworkPinType;
  label: string;
  icon: typeof Building2;
  pinClass: string;
  iconClass: string;
}[] = [
  {
    type: "head",
    label: "Head Office",
    icon: Landmark,
    pinClass: "bg-gradient-to-br from-[#0B3B6E] to-[#1D4ED8]",
    iconClass: "text-white",
  },
  {
    type: "branch",
    label: "Branch Office",
    icon: Building2,
    pinClass: "bg-gradient-to-br from-[#38BDF8] to-[#0EA5E9]",
    iconClass: "text-white",
  },
  {
    type: "depot",
    label: "Depots",
    icon: Warehouse,
    pinClass: "bg-gradient-to-br from-[#475569] to-[#1E293B]",
    iconClass: "text-white",
  },
  {
    type: "manufacturing",
    label: "Manufacturing Units",
    icon: Factory,
    pinClass: "bg-gradient-to-br from-[#EF4444] to-[#B91C1C]",
    iconClass: "text-white",
  },
];

export default function NetworkLegend() {
  return (
    <div className="grid grid-cols-2 gap-3" data-network-legend>
      {LEGEND_ITEMS.map(({ type, label, icon: Icon, pinClass, iconClass }) => (
        <div
          key={type}
          className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/70 px-3.5 py-3 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm"
        >
          <span
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${pinClass}`}
            aria-hidden
          >
            <Icon size={16} strokeWidth={1.8} className={iconClass} />
          </span>
          <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-700">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
