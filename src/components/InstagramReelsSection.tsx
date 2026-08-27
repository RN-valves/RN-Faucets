"use client";

import { useEffect, useRef, useState, useCallback, type MutableRefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INSTAGRAM_PROFILE = "https://www.instagram.com/rn_valves/";

const REELS = [
  {
    video: "/Insta-Reels/reel-1.mp4",
    instagram: "https://www.instagram.com/reel/DYmKS6VIlS4/",
  },
  {
    video: "/Insta-Reels/reel-2.mp4",
    instagram: "https://www.instagram.com/reel/DZUHQ1aIY-e/",
  },
  {
    video: "/Insta-Reels/reel-3.mp4",
    instagram: "https://www.instagram.com/reel/DbIlkbKIXlh/",
  },
  {
    video: "/Insta-Reels/reel-4.mp4",
    instagram: "https://www.instagram.com/reel/DZreP5goV6Y/",
  },
  {
    video: "/Insta-Reels/reel-5.mp4",
    instagram: "https://www.instagram.com/reel/DTDHr6qlTgE/",
  },
  {
    video: "/Insta-Reels/reel-6.mp4",
    instagram: "https://www.instagram.com/reel/DQ6oBoxkYDN/",
  },
  {
    video: "/Insta-Reels/reel-7.mp4",
    instagram: "https://www.instagram.com/reel/DSH60G0j4YT/",
  },
];

const CARD_W = 262;
const CARD_H = 432;
const GAP = 8;
const LOOP_SETS = 3;
const INITIAL_RENDERED_INDEX = REELS.length;
const LOOP_REELS = Array.from({ length: LOOP_SETS }, (_, setIndex) =>
  REELS.map((reel, reelIndex) => ({
    ...reel,
    key: `${setIndex}-${reel.video}`,
    reelIndex,
  }))
).flat();

const SOCIALS = [
  {
    label: "Instagram",
    href: INSTAGRAM_PROFILE,
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
    href: "https://www.facebook.com/RNValvesIndia",
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
    href: "https://www.youtube.com/@rnvalves",
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
    href: "https://www.linkedin.com/company/rn-valves-faucets",
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
    label: "Pinterest",
    href: "https://www.pinterest.com/rnvalves/",
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
  const cardRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);

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

  const playActiveVideo = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;

    const playPromise = el.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          stopProgress();
          rafRef.current = requestAnimationFrame(updateProgress);
        })
        .catch(() => {});
    }
  }, [stopProgress, updateProgress]);

  /* Active plays + zooms in; inactive pauses + zooms out */
  useEffect(() => {
    const el = videoRef.current;
    const card = cardRef.current;
    if (!el || !card) return;

    if (isActive) {
      gsap.fromTo(
        card,
        { scale: 0.96 },
        { scale: 1, duration: 0.55, ease: "power3.out" }
      );
      el.defaultMuted = true;
      el.muted = true;
      el.playsInline = true;
      el.currentTime = 0;

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
        stopProgress();
      };
    } else {
      gsap.to(card, {
        scale: 1,
        duration: 0.35,
        ease: "power3.out",
      });
      el.pause();
      el.currentTime = 0;
      stopProgress();
    }

    return () => stopProgress();
  }, [isActive, playActiveVideo, stopProgress]);

  const handleClick = () => {
    // Ignore click if user was dragging the track
    if (didDragRef.current) return;

    if (isActive) {
      window.open(instagram, "_blank", "noopener,noreferrer");
    } else {
      onSelect();
    }
  };

  return (
    <article
      ref={cardRef}
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
        borderRadius: "4px",
        overflow: "hidden",
        background: "#000",
        cursor: "pointer",
        flexShrink: 0,
        position: "relative",
        transformOrigin: "center center",
        border: "1px solid rgba(255,255,255,0.72)",
        transition: "transform 0.45s ease, box-shadow 0.45s ease, border-color 0.3s ease",
        boxShadow: isActive
          ? "0 18px 42px rgba(0,0,0,0.36)"
          : "0 8px 24px rgba(0,0,0,0.18)",
        zIndex: isActive ? 2 : 1,
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
        onEnded={onEnded}
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
          background: "linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.12) 55%, rgba(0,0,0,0.42) 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: "50% auto auto 50%",
          transform: "translate(-50%, -50%)",
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.16)",
          border: "1px solid rgba(255,255,255,0.4)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
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
          background: "rgba(0,0,0,0.16)",
          pointerEvents: "none",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
        </svg>
      </div>

      <div
        style={{
          position: "absolute",
          left: "16px",
          right: "16px",
          bottom: "10px",
          height: "2px",
          background: "rgba(255,255,255,0.18)",
          borderRadius: "999px",
          overflow: "hidden",
          pointerEvents: "none",
          opacity: isActive ? 1 : 0,
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
  if (data?.visible === false) return null;

  const validReels = data?.reels?.filter((r) => Boolean(r.video));
  const reelsList = validReels && validReels.length > 0 ? validReels : REELS;
  const profileLink = data?.profileUrl || INSTAGRAM_PROFILE;
  const sectionTitle = data?.title || "Stay inspired with us on Instagram";

  const [activeRenderedIndex, setActiveRenderedIndex] = useState(INITIAL_RENDERED_INDEX);
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollingRef = useRef(false);
  const pausedRef = useRef(false);
  const activeIndexRef = useRef(INITIAL_RENDERED_INDEX);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isDraggingRef = useRef(false);
  const didDragRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragScrollLeftRef = useRef(0);
  const [isGrabbing, setIsGrabbing] = useState(false);

  const syncActiveRenderedIndex = useCallback((index: number) => {
    activeIndexRef.current = index;
    setActiveRenderedIndex((prev) => (prev === index ? prev : index));
  }, []);

  useEffect(() => {
    activeIndexRef.current = activeRenderedIndex;
  }, [activeRenderedIndex]);

  const normalizeRenderedIndex = useCallback((index: number) => {
    const logicalIndex = ((index % REELS.length) + REELS.length) % REELS.length;
    return INITIAL_RENDERED_INDEX + logicalIndex;
  }, []);

  const rebaseTrackPosition = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return index;

      const normalizedIndex = normalizeRenderedIndex(index);
      if (normalizedIndex === index) return index;

      const wraps = track.querySelectorAll<HTMLElement>(".insta-reel-wrap");
      const target = wraps[normalizedIndex];
      if (!target) return index;

      gsap.killTweensOf(track);
      track.scrollLeft = Math.max(0, target.offsetLeft - 8);
      return normalizedIndex;
    },
    [normalizeRenderedIndex]
  );

  const scrollToIndex = useCallback(
    (index: number, immediate = false) => {
      const track = trackRef.current;
      if (!track) return;

      const wraps = track.querySelectorAll<HTMLElement>(".insta-reel-wrap");
      const target = wraps[index];
      if (!target) return;

      scrollingRef.current = !immediate;

      // Align active card near the left of the track (first position feel)
      const left = Math.max(0, target.offsetLeft - 8);

      const finalize = () => {
        const rebasedIndex = rebaseTrackPosition(index);
        if (rebasedIndex !== index) {
          syncActiveRenderedIndex(rebasedIndex);
        }
        scrollingRef.current = false;
      };

      if (immediate) {
        gsap.killTweensOf(track);
        track.scrollLeft = left;
        finalize();
        return;
      }

      gsap.to(track, {
        scrollLeft: left,
        duration: 0.85,
        ease: "power3.out",
        onComplete: finalize,
      });
    },
    [rebaseTrackPosition, syncActiveRenderedIndex]
  );

  const goNext = useCallback(() => {
    if (pausedRef.current) return;
    const next = activeIndexRef.current + 1;
    syncActiveRenderedIndex(next);
    scrollToIndex(next);
  }, [scrollToIndex, syncActiveRenderedIndex]);

  const goPrev = useCallback(() => {
    const prev = activeIndexRef.current - 1;
    syncActiveRenderedIndex(prev);
    scrollToIndex(prev);
  }, [scrollToIndex, syncActiveRenderedIndex]);

  /* ── Auto-scroll every 5s while section is in view ── */
  const startAutoScroll = useCallback(() => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    autoTimerRef.current = setInterval(() => {
      goNext();
    }, 5000);
  }, [goNext]);

  const stopAutoScroll = useCallback(() => {
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          pausedRef.current = false;
          startAutoScroll();
        } else {
          pausedRef.current = true;
          stopAutoScroll();
        }
      },
      { threshold: 0.35 }
    );

    io.observe(section);
    return () => {
      io.disconnect();
      stopAutoScroll();
    };
  }, [startAutoScroll, stopAutoScroll]);

  /* Pause auto-scroll on hover / touch; resume on leave */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const pause = () => {
      pausedRef.current = true;
      stopAutoScroll();
    };
    const resume = () => {
      pausedRef.current = false;
      startAutoScroll();
    };

    track.addEventListener("mouseenter", pause);
    track.addEventListener("mouseleave", resume);
    track.addEventListener("touchstart", pause, { passive: true });
    track.addEventListener("touchend", resume);

    return () => {
      track.removeEventListener("mouseenter", pause);
      track.removeEventListener("mouseleave", resume);
      track.removeEventListener("touchstart", pause);
      track.removeEventListener("touchend", resume);
    };
  }, [startAutoScroll, stopAutoScroll]);

  /* Detect which card is first while user manually scrolls */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onScroll = () => {
      if (scrollingRef.current) return;

      const wraps = track.querySelectorAll<HTMLElement>(".insta-reel-wrap");
      const focusX = track.scrollLeft + 40;

      let bestIdx = 0;
      let bestDist = Infinity;

      wraps.forEach((wrap, i) => {
        const dist = Math.abs(wrap.offsetLeft - focusX);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      });

      const rebasedIndex = isDraggingRef.current ? bestIdx : rebaseTrackPosition(bestIdx);
      syncActiveRenderedIndex(rebasedIndex);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [rebaseTrackPosition, syncActiveRenderedIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const init = window.requestAnimationFrame(() => {
      syncActiveRenderedIndex(INITIAL_RENDERED_INDEX);
      scrollToIndex(INITIAL_RENDERED_INDEX, true);
    });

    return () => window.cancelAnimationFrame(init);
  }, [scrollToIndex, syncActiveRenderedIndex]);

  /* When section enters viewport — play first card zoomed */
  useEffect(() => {
    if (!sectionRef.current || !leftRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        leftRef.current,
        { x: -80, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );

      const cards = trackRef.current?.querySelectorAll(".insta-reel-wrap");
      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          { x: 120, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.1,
            stagger: 0.15,
            ease: "power3.out",
            clearProps: "transform",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
              onEnter: () => {
                syncActiveRenderedIndex(INITIAL_RENDERED_INDEX);
                scrollToIndex(INITIAL_RENDERED_INDEX);
              },
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [scrollToIndex, syncActiveRenderedIndex]);

  /* Reset auto-scroll timer when user picks a card / video ends early */
  const handleSelect = useCallback(
    (i: number) => {
      syncActiveRenderedIndex(i);
      scrollToIndex(i);
      stopAutoScroll();
      startAutoScroll();
    },
    [scrollToIndex, startAutoScroll, stopAutoScroll, syncActiveRenderedIndex]
  );

  const handleEnded = useCallback(() => {
    goNext();
    stopAutoScroll();
    startAutoScroll();
  }, [goNext, startAutoScroll, stopAutoScroll]);

  const handleArrowNavigation = useCallback(
    (direction: "prev" | "next") => {
      stopAutoScroll();
      if (direction === "prev") {
        goPrev();
      } else {
        const next = activeIndexRef.current + 1;
        syncActiveRenderedIndex(next);
        scrollToIndex(next);
      }
      startAutoScroll();
    },
    [goPrev, scrollToIndex, startAutoScroll, stopAutoScroll, syncActiveRenderedIndex]
  );

  /* ── Mouse wheel → horizontal scroll (non-passive for preventDefault) ── */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onWheel = (e: WheelEvent) => {
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 2) return;

      e.preventDefault();
      gsap.killTweensOf(track);
      scrollingRef.current = false;
      track.scrollLeft += delta;
    };

    track.addEventListener("wheel", onWheel, { passive: false });
    return () => track.removeEventListener("wheel", onWheel);
  }, []);

  /* ── Mouse drag scroll ── */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const track = trackRef.current;
    if (!track) return;

    isDraggingRef.current = true;
    didDragRef.current = false;
    dragStartXRef.current = e.pageX;
    dragScrollLeftRef.current = track.scrollLeft;
    setIsGrabbing(true);
    gsap.killTweensOf(track);
    scrollingRef.current = false;
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

    // Snap to nearest card after drag
    const track = trackRef.current;
    if (track && didDragRef.current) {
      const wraps = track.querySelectorAll<HTMLElement>(".insta-reel-wrap");
      const focusX = track.scrollLeft + 40;
      let bestIdx = 0;
      let bestDist = Infinity;

      wraps.forEach((wrap, i) => {
        const dist = Math.abs(wrap.offsetLeft - focusX);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      });

      const rebasedIndex = rebaseTrackPosition(bestIdx);
      syncActiveRenderedIndex(rebasedIndex);
      scrollToIndex(rebasedIndex);
    }

    // Allow clicks again after drag settles
    window.setTimeout(() => {
      didDragRef.current = false;
    }, 50);
  }, [rebaseTrackPosition, scrollToIndex, syncActiveRenderedIndex]);

  const handleMouseLeaveTrack = useCallback(() => {
    if (isDraggingRef.current) {
      handleMouseUp();
    }
    pausedRef.current = false;
    startAutoScroll();
  }, [handleMouseUp, startAutoScroll]);

  return (
    <section
      ref={sectionRef}
      data-header-theme="dark"
      className="insta-reels-section"
      style={{
        position: "relative",
        width: "100vw",
        minHeight: "auto",
        background: "#000000",
        display: "flex",
        alignItems: "center",
        padding: "110px 0 62px 54px",
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
          transform: translateY(-50%) scale(1.05);
        }
        .insta-reels-track {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .insta-reels-track::-webkit-scrollbar {
          display: none;
        }
        @media (max-width: 1100px) {
          .insta-reels-section {
            padding: 48px 0 48px 28px !important;
          }
          .insta-reels-left {
            width: 280px !important;
            margin-right: 28px !important;
          }
          .insta-reels-heading {
            font-size: 42px !important;
          }
        }
        @media (max-width: 800px) {
          .insta-reels-section {
            flex-direction: column !important;
            align-items: flex-start !important;
            min-height: auto !important;
            padding: 44px 0 44px !important;
          }
          .insta-reels-left {
            width: 100% !important;
            max-width: 100% !important;
            margin-right: 0 !important;
            padding: 0 24px !important;
            margin-bottom: 28px !important;
          }
          .insta-reels-heading {
            font-size: 32px !important;
            max-width: 280px !important;
          }
          .insta-reels-stage {
            width: 100% !important;
          }
          .insta-reels-track {
            padding: 0 24px 8px !important;
            gap: 8px !important;
          }
          .insta-reel-card {
            width: 220px !important;
            height: 360px !important;
            border-radius: 4px !important;
          }
          .insta-arrow-btn {
            display: none !important;
          }
        }
      `}</style>

      <div
        ref={leftRef}
        className="insta-reels-left"
        style={{
          width: "360px",
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
            fontSize: "56px",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: "#FFFFFF",
            margin: "0 0 30px",
            maxWidth: "340px",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          Stay inspired with us on Instagram
        </h2>

        <a
          href={INSTAGRAM_PROFILE}
          target="_blank"
          rel="noopener noreferrer"
          className="insta-follow-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            alignSelf: "flex-start",
            padding: "12px 24px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.75)",
            background: "transparent",
            color: "#FFFFFF",
            fontFamily: "'Manrope', Helvetica, Arial, sans-serif",
            fontSize: "16px",
            fontWeight: 600,
            textDecoration: "none",
            cursor: "pointer",
            transition: "background 0.25s ease, color 0.25s ease",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
          </svg>
          Follow us
        </a>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginTop: "50px",
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
                width: "40px",
                height: "40px",
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

      <div
        className="insta-reels-stage"
        style={{
          position: "relative",
          flex: 1,
          minWidth: 0,
          paddingRight: "16px",
        }}
      >
        <button
          type="button"
          aria-label="Previous reel"
          className="insta-arrow-btn"
          onClick={() => handleArrowNavigation("prev")}
          style={{
            position: "absolute",
            left: "-18px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "1px solid rgba(0,0,0,0.08)",
            background: "#F2F2F2",
            color: "#4A4A4A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
            boxShadow: "0 8px 20px rgba(0,0,0,0.24)",
            cursor: "pointer",
            transition: "transform 0.2s ease",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M14.5 6.5L9 12l5.5 5.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

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
            overflowX: "auto",
            overflowY: "hidden",
            minWidth: 0,
            padding: "0 34px 0 0",
            WebkitOverflowScrolling: "touch",
            scrollSnapType: "x mandatory",
            cursor: isGrabbing ? "grabbing" : "grab",
            userSelect: "none",
          }}
        >
          {LOOP_REELS.map((reel, i) => (
            <div
              key={reel.key}
              className="insta-reel-wrap"
              style={{ scrollSnapAlign: "start" }}
            >
              <ReelCard
                video={reel.video}
                instagram={reel.instagram}
                isActive={activeRenderedIndex === i}
                onEnded={handleEnded}
                onSelect={() => handleSelect(i)}
                didDragRef={didDragRef}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="Next reel"
          className="insta-arrow-btn"
          onClick={() => handleArrowNavigation("next")}
          style={{
            position: "absolute",
            right: "2px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "1px solid rgba(0,0,0,0.08)",
            background: "#F2F2F2",
            color: "#4A4A4A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
            boxShadow: "0 8px 20px rgba(0,0,0,0.24)",
            cursor: "pointer",
            transition: "transform 0.2s ease",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M9.5 6.5L15 12l-5.5 5.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
}
