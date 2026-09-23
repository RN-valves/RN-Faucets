"use client";

import { useEffect, useRef, useState, useCallback, useMemo, type MutableRefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INSTAGRAM_PROFILE = "https://www.instagram.com/rnvalvesandfaucets/";

const CARD_W = 285;
const CARD_H = 510;
const GAP = 20;
const LOOP_SETS = 5;

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/rnvalvesandfaucets/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/rnvalvesandfaucets/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M14 9h2.5V6H14c-2.2 0-3.5 1.4-3.5 3.4V12H8.5v3H10.5v7H14v-7h2.3l.5-3H14V9.4c0-.3.2-.4.5-.4z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCpUUF6ZFL88S85IuSsHDRSQ/?sub_confirmation=1",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M21.6 7.8a2.5 2.5 0 0 0-1.8-1.8C18.2 5.6 12 5.6 12 5.6s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.8 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.2 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.2z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path d="M10.5 15.2V8.8L15.5 12l-5 3.2z" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/rn-valves-faucets/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M6.5 9.5H9v8H6.5v-8zM7.75 5.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM11 9.5h2.4v1.1h.03c.33-.63 1.15-1.3 2.37-1.3 2.53 0 3 1.67 3 3.83V17.5H16.4v-3.5c0-.83-.02-1.9-1.16-1.9-1.16 0-1.34.9-1.34 1.84v3.56H11v-8z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    label: "Twitter (X)",
    href: "https://twitter.com/RNValves",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Pinterest",
    href: "https://in.pinterest.com/infornvalves/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3.4a8.6 8.6 0 0 0-3.13 16.6c-.02-.68 0-1.49.19-2.23l1.23-5.2s-.3-.62-.3-1.54c0-1.44.83-2.52 1.88-2.52.89 0 1.32.67 1.32 1.47 0 .9-.57 2.24-.87 3.48-.25 1.04.52 1.88 1.55 1.88 1.86 0 3.11-2.39 3.11-5.22 0-2.15-1.45-3.76-4.1-3.76-2.99 0-4.86 2.23-4.86 4.73 0 .86.25 1.47.64 1.95.18.22.2.31.14.57l-.22.89c-.07.28-.31.38-.56.28-1.56-.64-2.28-2.36-2.28-4.3 0-3.19 2.69-7.01 8.04-7.01 4.3 0 7.12 3.11 7.12 6.45 0 4.42-2.46 7.72-6.09 7.72-1.22 0-2.36-.66-2.75-1.41l-.75 2.96c-.27 1.05-.79 2.11-1.27 2.93A8.6 8.6 0 1 0 12 3.4Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

function ReelCard({
  video,
  instagram,
  isActive,
  onEnded,
  onSelect,
  didDragRef,
}: {
  video: string;
  instagram: string;
  isActive: boolean;
  onEnded: () => void;
  onSelect: () => void;
  didDragRef: MutableRefObject<boolean>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const isEndingRef = useRef(false);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScalingDown, setIsScalingDown] = useState(false);

  const stopProgress = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (progressRef.current) {
      progressRef.current.style.width = "0%";
    }
  }, []);

  const updateProgress = useCallback(function updateProgressFrame() {
    const el = videoRef.current;
    if (!el || !progressRef.current || !el.duration) return;
    progressRef.current.style.width = `${(el.currentTime / el.duration) * 100}%`;
    rafRef.current = requestAnimationFrame(updateProgressFrame);
  }, []);

  const clearFallback = useCallback(() => {
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  // When video playback completes, scale down in place with smooth transition, then trigger next card
  const handleCompleteAndNext = useCallback(() => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;
    clearFallback();
    stopProgress();
    setIsPlaying(false);
    setIsScalingDown(true); // Triggers scale(1) in place

    // Allow 360ms smooth transition to finish before advancing to next card
    setTimeout(() => {
      isEndingRef.current = false;
      setIsScalingDown(false);
      onEnded();
    }, 360);
  }, [clearFallback, onEnded, stopProgress]);

  const playActiveVideo = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;

    el.currentTime = 0;
    const playPromise = el.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          stopProgress();
          rafRef.current = requestAnimationFrame(updateProgress);

          clearFallback();
          const durationSec =
            el.duration && !isNaN(el.duration) && el.duration > 0
              ? el.duration
              : 12;
          fallbackTimerRef.current = setTimeout(() => {
            handleCompleteAndNext();
          }, (durationSec + 0.5) * 1000);
        })
        .catch(() => {
          clearFallback();
          fallbackTimerRef.current = setTimeout(() => {
            handleCompleteAndNext();
          }, 7000);
        });
    }
  }, [clearFallback, handleCompleteAndNext, stopProgress, updateProgress]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (isActive) {
      isEndingRef.current = false;
      setIsScalingDown(false);
      el.defaultMuted = true;
      el.muted = true;
      el.playsInline = true;

      const handleCanPlay = () => {
        if (videoRef.current && isActive) {
          playActiveVideo();
        }
      };

      el.addEventListener("loadeddata", handleCanPlay);
      el.addEventListener("canplay", handleCanPlay);
      playActiveVideo();

      return () => {
        el.removeEventListener("loadeddata", handleCanPlay);
        el.removeEventListener("canplay", handleCanPlay);
        clearFallback();
        stopProgress();
      };
    } else {
      setIsPlaying(false);
      setIsScalingDown(false);
      el.pause();
      el.currentTime = 0;
      clearFallback();
      stopProgress();
    }

    return () => {
      clearFallback();
      stopProgress();
    };
  }, [clearFallback, isActive, playActiveVideo, stopProgress]);

  const handleClick = () => {
    if (didDragRef.current) return;
    if (isActive) {
      window.open(instagram, "_blank", "noopener,noreferrer");
    } else {
      onSelect();
    }
  };

  const isZoomed = isActive && !isScalingDown;

  return (
    <article
      className={`insta-reel-card${isActive ? " is-active" : ""}`}
      onClick={handleClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={isActive ? "Open Instagram reel" : "Play reel"}
      style={{
        width: `${CARD_W}px`,
        height: `${CARD_H}px`,
        borderRadius: "10px",
        overflow: "hidden",
        background: "#000000",
        cursor: "pointer",
        flexShrink: 0,
        position: "relative",
        transformOrigin: "center center",
        transform: isZoomed ? "scale(1.08)" : "scale(1)",
        transition:
          "transform 360ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 360ms ease, border-color 360ms ease, opacity 360ms ease",
        border: isZoomed
          ? "2px solid rgba(255,255,255,0.95)"
          : "1px solid rgba(255,255,255,0.2)",
        boxShadow: isZoomed
          ? "0 20px 48px rgba(0,0,0,0.7), 0 0 32px rgba(255,255,255,0.18)"
          : "0 6px 20px rgba(0,0,0,0.3)",
        opacity: isZoomed ? 1 : 0.88,
        zIndex: isZoomed ? 10 : 1,
      }}
    >
      <video
        ref={videoRef}
        src={video}
        autoPlay={isActive}
        muted
        playsInline
        preload="metadata"
        loop={false}
        onEnded={handleCompleteAndNext}
        className="w-full h-full object-cover"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.48) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Center play icon (fades out when playing) */}
      <div
        style={{
          position: "absolute",
          inset: "50% auto auto 50%",
          transform: `translate(-50%, -50%) scale(${
            isPlaying && isZoomed ? 0.75 : 1
          })`,
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.45)",
          border: "1.5px solid rgba(255,255,255,0.55)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          opacity: isPlaying && isZoomed ? 0 : 1,
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            marginLeft: "3px",
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            borderLeft: "12px solid #FFFFFF",
          }}
        />
      </div>

      {/* Instagram badge in corner */}
      <div
        style={{
          position: "absolute",
          right: "12px",
          bottom: "12px",
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          background: "rgba(0,0,0,0.2)",
          pointerEvents: "none",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="5"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
        </svg>
      </div>

      {/* Sleek bottom progress bar */}
      <div
        style={{
          position: "absolute",
          left: "14px",
          right: "14px",
          bottom: "10px",
          height: "2px",
          background: "rgba(255,255,255,0.2)",
          borderRadius: "999px",
          overflow: "hidden",
          pointerEvents: "none",
          opacity: isZoomed ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        <div
          ref={progressRef}
          style={{
            width: "0%",
            height: "100%",
            background: "#FFFFFF",
            borderRadius: "999px",
          }}
        />
      </div>
    </article>
  );
}

interface InstagramReelsSectionProps {
  data?: {
    visible?: boolean;
    title?: string;
    profileUrl?: string;
    reels?: Array<{ video: string; instagram: string }>;
  };
}

export default function InstagramReelsSection({ data }: InstagramReelsSectionProps) {
  const isVisible = data?.visible !== false;

  const validReels = data?.reels?.filter((r) => Boolean(r.video));
  const reelsList = validReels || [];
  const profileLink = data?.profileUrl || INSTAGRAM_PROFILE;
  const sectionTitle = data?.title || "Stay inspired with us on Instagram";

  const numReels = reelsList.length;

  // Duplicate reels to allow infinite looping forward and backward
  const loopReels = useMemo(() => {
    return Array.from({ length: LOOP_SETS }, (_, setIndex) =>
      reelsList.map((reel, reelIndex) => ({
        ...reel,
        key: `${setIndex}-${reel.video}-${reelIndex}`,
        reelIndex,
      }))
    ).flat();
  }, [reelsList]);

  // Responsive visible count: 4-5 cards on desktop
  const [visibleCount, setVisibleCount] = useState(4);
  const visibleCountRef = useRef(4);

  // Start in middle set so user can scroll left or right seamlessly
  const initialStartIndex = numReels * 2;
  const [startIdx, setStartIdx] = useState(initialStartIndex);
  const [activeCardIndex, setActiveCardIndex] = useState(initialStartIndex);

  const startIdxRef = useRef(initialStartIndex);
  const activeCardIndexRef = useRef(initialStartIndex);
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const didDragRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragScrollLeftRef = useRef(0);
  const [isGrabbing, setIsGrabbing] = useState(false);

  useEffect(() => {
    startIdxRef.current = startIdx;
  }, [startIdx]);

  useEffect(() => {
    activeCardIndexRef.current = activeCardIndex;
  }, [activeCardIndex]);

  useEffect(() => {
    visibleCountRef.current = visibleCount;
  }, [visibleCount]);

  // Compute how many cards fit in the visible area (4 to 5 cards on desktop)
  const updateVisibleCount = useCallback(() => {
    if (typeof window === "undefined") return;
    const w = window.innerWidth;
    let count = 4;
    if (w >= 1850) count = 5;
    else if (w >= 1260) count = 4;
    else if (w >= 980) count = 3;
    else if (w >= 640) count = 2;
    else count = 1;

    setVisibleCount(count);
    visibleCountRef.current = count;
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      updateVisibleCount();
    });
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, [updateVisibleCount]);

  // Smooth scroll to a target start index (set)
  const scrollToSet = useCallback(
    (targetStart: number) => {
      const track = trackRef.current;
      if (!track) return;

      const targetScroll = targetStart * (CARD_W + GAP);

      // Transition on scroll: sequential zoom+autoplay cycle restarts from the first visible card in the new set
      startIdxRef.current = targetStart;
      setStartIdx(targetStart);
      activeCardIndexRef.current = targetStart;
      setActiveCardIndex(targetStart);

      gsap.killTweensOf(track);
      gsap.to(track, {
        scrollLeft: targetScroll,
        duration: 0.65,
        ease: "power2.out",
        onComplete: () => {
          // Transparent rebase if scrolled into outer loop sets
          const len = reelsList.length;
          if (targetStart >= len * 3) {
            const rebased = targetStart - len;
            startIdxRef.current = rebased;
            setStartIdx(rebased);
            activeCardIndexRef.current = rebased;
            setActiveCardIndex(rebased);
            track.scrollLeft = rebased * (CARD_W + GAP);
          } else if (targetStart < len) {
            const rebased = targetStart + len;
            startIdxRef.current = rebased;
            setStartIdx(rebased);
            activeCardIndexRef.current = rebased;
            setActiveCardIndex(rebased);
            track.scrollLeft = rebased * (CARD_W + GAP);
          }
        },
      });
    },
    [reelsList.length]
  );

  // Navigation Arrows: scroll to next/previous set of cards
  const handleNextSet = useCallback(() => {
    const nextStart = startIdxRef.current + visibleCountRef.current;
    scrollToSet(nextStart);
  }, [scrollToSet]);

  const handlePrevSet = useCallback(() => {
    const prevStart = startIdxRef.current - visibleCountRef.current;
    scrollToSet(prevStart);
  }, [scrollToSet]);

  // In-place sequential zoom + autoplay cycle:
  // Cards stay fixed in their positions — no horizontal movement or shifting during the effect.
  // When a card finishes playing and scales down, advance to next card in the visible set.
  const handleCardEnded = useCallback((endedIndex: number) => {
    if (endedIndex !== activeCardIndexRef.current) return;
    if (pausedRef.current) return;

    const currentStart = startIdxRef.current;
    const count = visibleCountRef.current;
    const currentOffset = endedIndex - currentStart;

    // Advance to next card in visible set (loops back to 0 within the visible set)
    const nextOffset = (currentOffset + 1) % count;
    const nextIndex = currentStart + nextOffset;

    activeCardIndexRef.current = nextIndex;
    setActiveCardIndex(nextIndex);
  }, []);

  // Card click: if already active -> open instagram, if inactive -> zoom & play it in place
  const handleCardSelect = useCallback(
    (clickedIndex: number, instagramUrl: string) => {
      if (didDragRef.current) return;

      if (activeCardIndexRef.current === clickedIndex) {
        window.open(instagramUrl, "_blank", "noopener,noreferrer");
      } else {
        activeCardIndexRef.current = clickedIndex;
        setActiveCardIndex(clickedIndex);
      }
    },
    []
  );

  // Initialize track scroll position on mount
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const init = window.requestAnimationFrame(() => {
      track.scrollLeft = initialStartIndex * (CARD_W + GAP);
      setStartIdx(initialStartIndex);
      setActiveCardIndex(initialStartIndex);
    });

    return () => window.cancelAnimationFrame(init);
  }, [initialStartIndex]);

  // Entrance animations
  useEffect(() => {
    if (!sectionRef.current || !leftRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        leftRef.current,
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      const cards = trackRef.current?.querySelectorAll(".insta-reel-wrap");
      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Pause when section is scrolled out of viewport
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        pausedRef.current = !entry.isIntersecting;
      },
      { threshold: 0.3 }
    );

    io.observe(section);
    return () => io.disconnect();
  }, []);

  // Wheel horizontal scroll
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let wheelTimer: ReturnType<typeof setTimeout> | null = null;

    const onWheel = (e: WheelEvent) => {
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 2) return;

      e.preventDefault();
      gsap.killTweensOf(track);
      track.scrollLeft += delta;

      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        const nearest = Math.round(track.scrollLeft / (CARD_W + GAP));
        scrollToSet(nearest);
      }, 150);
    };

    track.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      track.removeEventListener("wheel", onWheel);
      if (wheelTimer) clearTimeout(wheelTimer);
    };
  }, [scrollToSet]);

  // Drag scroll
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const track = trackRef.current;
    if (!track) return;

    isDraggingRef.current = true;
    didDragRef.current = false;
    dragStartXRef.current = e.pageX;
    dragScrollLeftRef.current = track.scrollLeft;
    setIsGrabbing(true);
    gsap.killTweensOf(track);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current || !trackRef.current) return;

    const dx = e.pageX - dragStartXRef.current;
    if (Math.abs(dx) > 6) {
      didDragRef.current = true;
    }
    trackRef.current.scrollLeft = dragScrollLeftRef.current - dx;
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsGrabbing(false);

    const track = trackRef.current;
    if (track && didDragRef.current) {
      const nearest = Math.round(track.scrollLeft / (CARD_W + GAP));
      scrollToSet(nearest);
    }

    window.setTimeout(() => {
      didDragRef.current = false;
    }, 50);
  }, [scrollToSet]);

  const handleMouseLeaveTrack = useCallback(() => {
    if (isDraggingRef.current) {
      handleMouseUp();
    }
  }, [handleMouseUp]);

  if (!isVisible || reelsList.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      data-header-theme="dark"
      className="insta-reels-section"
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "100vw",
        minHeight: "auto",
        background: "#000000",
        display: "flex",
        alignItems: "center",
        padding: "85px 0 85px 64px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
      aria-label="Stay inspired with us on Instagram"
    >
      <style>{`
        .insta-follow-btn:hover {
          background: #FFFFFF !important;
          color: #000000 !important;
        }
        .insta-social-btn:hover {
          background: #FFFFFF !important;
          color: #000000 !important;
        }
        .insta-arrow-btn:hover {
          transform: translateY(-50%) scale(1.08) !important;
          background: #FFFFFF !important;
        }
        .insta-reels-track {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .insta-reels-track::-webkit-scrollbar {
          display: none;
        }
        @media (max-width: 1400px) {
          .insta-reels-left {
            width: 340px !important;
            margin-right: 36px !important;
          }
          .insta-reels-heading {
            font-size: 50px !important;
          }
        }
        @media (max-width: 1200px) {
          .insta-reels-section {
            padding: 60px 0 60px 32px !important;
          }
          .insta-reels-left {
            width: 300px !important;
            margin-right: 28px !important;
          }
          .insta-reels-heading {
            font-size: 42px !important;
          }
        }
        @media (max-width: 860px) {
          .insta-reels-section {
            flex-direction: column !important;
            align-items: flex-start !important;
            min-height: auto !important;
            padding: 44px 20px !important;
          }
          .insta-reels-left {
            width: 100% !important;
            max-width: 100% !important;
            margin-right: 0 !important;
            padding: 0 !important;
            margin-bottom: 28px !important;
          }
          .insta-reels-heading {
            font-size: 34px !important;
            max-width: 100% !important;
          }
          .insta-reels-stage {
            width: 100% !important;
            max-width: 100% !important;
          }
          .insta-arrow-btn {
            display: none !important;
          }
        }
      `}</style>

      {/* Left Column: Heading + Follow + Socials */}
      <div
        ref={leftRef}
        className="insta-reels-left"
        style={{
          width: "380px",
          maxWidth: "400px",
          flexShrink: 0,
          marginRight: "48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          zIndex: 2,
        }}
      >
        <h2
          className="insta-reels-heading"
          style={{
            fontFamily: "'Manrope', Helvetica, Arial, sans-serif",
            fontWeight: 400,
            fontSize: "58px",
            lineHeight: 1.08,
            letterSpacing: "-0.035em",
            color: "#FFFFFF",
            margin: "0 0 32px",
            maxWidth: "380px",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          {sectionTitle}
        </h2>

        <a
          href={profileLink}
          target="_blank"
          rel="noopener noreferrer"
          className="insta-follow-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            alignSelf: "flex-start",
            padding: "14px 28px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.75)",
            background: "transparent",
            color: "#FFFFFF",
            fontFamily: "'Manrope', Helvetica, Arial, sans-serif",
            fontSize: "17px",
            fontWeight: 600,
            textDecoration: "none",
            cursor: "pointer",
            transition: "background 0.25s ease, color 0.25s ease",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="5"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
          </svg>
          Follow us
        </a>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginTop: "48px",
          }}
          role="group"
          aria-label="Social media links"
        >
          {SOCIALS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="insta-social-btn"
              aria-label={social.label}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.28)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                background: "transparent",
                textDecoration: "none",
                transition: "background 0.25s ease, color 0.25s ease",
              }}
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>

      {/* Right Column: Carousel Stage */}
      <div
        className="insta-reels-stage"
        style={{
          position: "relative",
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Left Navigation Arrow */}
        <button
          type="button"
          aria-label="Previous set of reels"
          className="insta-arrow-btn"
          onClick={handlePrevSet}
          style={{
            position: "absolute",
            left: "-22px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.25)",
            background: "#FFFFFF",
            color: "#111111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 25,
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            cursor: "pointer",
            transition: "transform 0.2s ease, background 0.2s ease",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Viewport wrapper: Displays 4-5 cards without cutting off scale(1.08) vertically */}
        <div
          style={{
            width: `${visibleCount * CARD_W + (visibleCount - 1) * GAP}px`,
            maxWidth: "100%",
            overflow: "hidden",
            padding: "36px 0",
            margin: "-36px 0",
          }}
        >
          <div
            ref={trackRef}
            className="insta-reels-track"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeaveTrack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: `${GAP}px`,
              overflowX: "scroll",
              overflowY: "visible",
              scrollbarWidth: "none",
              cursor: isGrabbing ? "grabbing" : "grab",
              userSelect: "none",
              padding: "32px 0",
              margin: "-32px 0",
            }}
          >
            {loopReels.map((reel, i) => (
              <div
                key={reel.key}
                className="insta-reel-wrap"
                style={{
                  width: `${CARD_W}px`,
                  height: `${CARD_H}px`,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ReelCard
                  video={reel.video}
                  instagram={reel.instagram}
                  isActive={activeCardIndex === i}
                  onEnded={() => handleCardEnded(i)}
                  onSelect={() => handleCardSelect(i, reel.instagram)}
                  didDragRef={didDragRef}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Navigation Arrow */}
        <button
          type="button"
          aria-label="Next set of reels"
          className="insta-arrow-btn"
          onClick={handleNextSet}
          style={{
            position: "absolute",
            right: "-22px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.25)",
            background: "#FFFFFF",
            color: "#111111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 25,
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            cursor: "pointer",
            transition: "transform 0.2s ease, background 0.2s ease",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M9 18l6-6-6-6"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
