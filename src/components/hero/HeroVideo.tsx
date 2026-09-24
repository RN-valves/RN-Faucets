"use client";

import { useEffect, useRef, RefObject, useCallback } from "react";
import type { VideoEntry } from "./HeroSection";

/* ─── Props ────────────────────────────────────────────── */
interface HeroVideoProps {
  playlist: VideoEntry[];
  activeIndex: number;
  onVideoEnd: (nextIndex: number) => void;
  overlayRef: RefObject<HTMLDivElement | null>;
}

/* ─── Component ────────────────────────────────────────── */
export default function HeroVideo({
  playlist,
  activeIndex,
  onVideoEnd,
  overlayRef,
}: HeroVideoProps) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  /* Play the active video, pause others */
  useEffect(() => {
    videoRefs.current.forEach((vid, i) => {
      if (!vid) return;
      if (i === activeIndex) {
        vid.currentTime = 0;
        vid.play().catch(() => {
          /* Autoplay blocked — silently ignored; user interaction will unblock */
        });
      } else {
        vid.pause();
        vid.currentTime = 0;
      }
    });
  }, [activeIndex]);

  /* End handler */
  const handleEnded = useCallback(
    (index: number) => {
      const next = (index + 1) % playlist.length;
      onVideoEnd(next);
    },
    [onVideoEnd, playlist.length]
  );

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden"
      role="presentation"
      aria-hidden="true"
    >
      {playlist.map((entry, i) => (
        <video
          key={entry.id}
          ref={(el) => {
            videoRefs.current[i] = el;
          }}
          src={entry.src}
          autoPlay={i === 0}
          muted
          loop={false}
          playsInline
          preload="metadata"
          onEnded={() => handleEnded(i)}
          className="absolute inset-0 w-full h-full"
          style={{
            objectFit: "cover",
            objectPosition: "center",
            opacity: i === activeIndex ? 1 : 0,
            transition: "opacity 0.8s ease",
          }}
          aria-label={`Background video: ${entry.title}`}
        />
      ))}

      {/* Cinematic overlay gradient */}
      <div ref={overlayRef} className="video-overlay" />

      {/* Subtle vignette for depth */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%)",
        }}
      />
    </div>
  );
}
