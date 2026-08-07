"use client";

import { useMemo, useState } from "react";
import MapPin from "./MapPin";
import { CONNECTION_PAIRS, NETWORK_LOCATIONS } from "./types";
import { INDIA_OUTLINE_PATH } from "./indiaOutlinePath";

export default function IndiaMap() {
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const locationMap = useMemo(() => {
    return new Map(NETWORK_LOCATIONS.map((loc) => [loc.id, loc]));
  }, []);

  return (
    <div
      data-network-map
      className="relative mx-auto aspect-[10/11] w-full max-w-[480px] lg:max-w-[540px]"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[90%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,174,239,0.12)_0%,rgba(226,232,240,0.4)_42%,transparent_72%)]"
        aria-hidden
      />

      <svg
        viewBox="0 0 1000 1100"
        className="relative z-[1] h-full w-full drop-shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
        role="img"
        aria-label="India distribution and manufacturing network map"
      >
        <defs>
          <linearGradient id="indiaFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="55%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>
          <filter id="mapSoftShadow" x="-12%" y="-12%" width="124%" height="124%">
            <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#0F172A" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* Accurate India geographic outline */}
        <path
          d={INDIA_OUTLINE_PATH}
          fill="url(#indiaFill)"
          stroke="#94A3B8"
          strokeWidth="2.5"
          strokeLinejoin="round"
          filter="url(#mapSoftShadow)"
        />

        {/* Inner highlight stroke for depth */}
        <path
          d={INDIA_OUTLINE_PATH}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeLinejoin="round"
          opacity="0.55"
          transform="translate(0 1)"
        />

        {/* Dotted connections between major hubs */}
        <g aria-hidden>
          {CONNECTION_PAIRS.map(([fromId, toId]) => {
            const from = locationMap.get(fromId);
            const to = locationMap.get(toId);
            if (!from || !to) return null;

            const x1 = (from.x / 100) * 1000;
            const y1 = (from.y / 100) * 1100;
            const x2 = (to.x / 100) * 1000;
            const y2 = (to.y / 100) * 1100;

            return (
              <line
                key={`${fromId}-${toId}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#64748B"
                strokeWidth="1.4"
                strokeDasharray="4 6"
                opacity="0.4"
                data-network-line
              />
            );
          })}
        </g>
      </svg>

      <div className="absolute inset-0 z-[2]">
        {NETWORK_LOCATIONS.map((location) => (
          <MapPin
            key={location.id}
            location={location}
            active={focusedId === location.id}
            onFocus={setFocusedId}
          />
        ))}
      </div>
    </div>
  );
}
