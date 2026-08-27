"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play } from "lucide-react";
import type { VideoEntry } from "./HeroSection";

/* ─── Props ────────────────────────────────────────────── */
interface CircularProgressControlProps {
  playlist: VideoEntry[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

/* ─── Single ring ──────────────────────────────────────── */
interface RingProps {
  entry: VideoEntry;
  index: number;
  isActive: boolean;
  onSelect: (index: number) => void;
}

const RING_SIZE = 38;
const RING_CENTER = RING_SIZE / 2;
const RING_RADIUS = RING_CENTER - 3; // 2px border + 1px gap
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProgressRing({ entry, index, isActive, onSelect }: RingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const rafRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  /* Find the video element in the DOM */
  const getVideo = useCallback((): HTMLVideoElement | null => {
    if (videoRef.current) return videoRef.current;
    const videos = document.querySelectorAll<HTMLVideoElement>("video[src]");
    for (const vid of videos) {
      if (vid.src.includes(entry.src.replace(/^\//, ""))) {
        videoRef.current = vid;
        return vid;
      }
    }
    return null;
  }, [entry.src]);

  /* Update SVG stroke via RAF or timeupdate */
  const updateRing = useCallback(() => {
    if (!circleRef.current) return;
    const vid = getVideo();
    if (!vid || !isActive) return;

    const progress =
      vid.duration > 0 ? Math.min(vid.currentTime / vid.duration, 1) : 0;
    const offset = CIRCUMFERENCE * (1 - progress);
    circleRef.current.style.strokeDashoffset = String(offset);
  }, [getVideo, isActive]);

  /* Attach timeupdate when active */
  useEffect(() => {
    if (!isActive) {
      // Reset ring instantly
      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = String(CIRCUMFERENCE);
      }
      videoRef.current = null;
      return;
    }

    // Small delay to let the video element mount / src change
    const timeout = setTimeout(() => {
      const vid = getVideo();
      if (!vid) return;

      const onTimeUpdate = () => updateRing();
      vid.addEventListener("timeupdate", onTimeUpdate, { passive: true });

      return () => {
        vid.removeEventListener("timeupdate", onTimeUpdate);
      };
    }, 80);

    return () => clearTimeout(timeout);
  }, [isActive, getVideo, updateRing]);

  const radius = RING_RADIUS;

  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      aria-label={`Play video ${index + 1}: ${entry.title}`}
      aria-pressed={isActive}
      className="relative flex items-center justify-center transition-all duration-300"
      style={{
        width: RING_SIZE,
        height: RING_SIZE,
        opacity: isActive ? 1 : 0.4,
        transform: isActive ? "scale(1.15)" : "scale(1)",
        transition: "opacity 0.35s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1)",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={RING_CENTER}
          cy={RING_CENTER}
          r={radius}
          className="progress-ring-track"
        />
        {/* Fill — only rendered when active for perf */}
        {isActive && (
          <circle
            ref={circleRef}
            cx={RING_CENTER}
            cy={RING_CENTER}
            r={radius}
            className="progress-ring-fill"
            style={{
              strokeDasharray: CIRCUMFERENCE,
              strokeDashoffset: CIRCUMFERENCE,
            }}
          />
        )}
      </svg>

      {/* Play icon in center */}
      <Play
        size={10}
        fill={isActive ? "white" : "rgba(255,255,255,0.7)"}
        stroke="none"
        style={{ position: "relative", zIndex: 1, marginLeft: 1 }}
        aria-hidden="true"
      />
    </button>
  );
}

/* ─── Main Control ─────────────────────────────────────── */
export default function CircularProgressControl({
  playlist,
  activeIndex,
  onSelect,
}: CircularProgressControlProps) {
  return (
    <div
      className="flex items-center"
      style={{ gap: 16 }}
      role="group"
      aria-label="Video playlist controls"
    >
      {playlist.map((entry, i) => (
        <ProgressRing
          key={entry.id}
          entry={entry}
          index={i}
          isActive={i === activeIndex}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
