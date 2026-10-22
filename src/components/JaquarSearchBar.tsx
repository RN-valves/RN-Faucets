"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { getCachedCategories, getCachedSubcategories } from "@/utils/catalogueCache";

interface JaquarSearchBarProps {
  isDarkBg?: boolean;
}

const DEFAULT_SEARCH_PHRASES = [
  "Search for Single Lever Basin Mixer...",
  "Search for Overhead Rain Showers...",
  "Search for Black Chrome Pillar Cock...",
  "Search for Concealed Shower Diverters...",
  "Search for PTMT Bib Cock with Flange...",
  "Search for Wall Mounted Sink Mixer...",
  "Search for Rose Gold Bath Fittings...",
  "Search for Two Way Angle Valves...",
  "Search for Tall Body Basin Faucets...",
];

const SEARCH_PREFIX = "Search for ";

// Comprehensive keyword dictionary matching bathroom & sanitaryware terminology (Jaquar taxonomy)
const PRESET_KEYWORDS = [
  "shower",
  "showers",
  "shower arm",
  "shower tray",
  "shower mixer",
  "shower panel",
  "shower basket",
  "shower enclosures",
  "shower accessories",
  "shower wall mounted",
  "shower concealed type",
  "overhead shower",
  "hand shower",
  "body jet shower",
  "rain shower",
  "faucet",
  "faucets",
  "faucet for bathroom",
  "faucet accessories",
  "faucet single lever",
  "faucet wall mounted",
  "basin faucet",
  "sink faucet",
  "diverter",
  "diverters",
  "divertor spout",
  "divertor with flange",
  "concealed divertor",
  "hi-flow divertor",
  "single lever divertor",
  "pillar cock",
  "pillar cock tall body",
  "pillar cock foam flow",
  "pillar cock black chrome",
  "pillar cock marble finish",
  "basin mixer",
  "single lever basin mixer",
  "tall body basin mixer",
  "wall mounted basin mixer",
  "angle valve",
  "angle cock",
  "two way angle valve",
  "bib cock",
  "bib cock with flange",
  "bib cock two in one",
  "health faucet",
  "health faucet with hook",
  "abs health faucet",
  "spout",
  "plain spout",
  "button spout",
  "spout with wall flange",
  "stop cock",
  "concealed stop cock",
  "flush valve",
  "waste coupling",
  "bottle trap",
  "marble finish",
  "black chrome",
  "rose gold",
];

export default function JaquarSearchBar({ isDarkBg = false }: JaquarSearchBarProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Dynamic AI-powered phrase list (seeded with Jaquar-style defaults)
  const [searchPhrases, setSearchPhrases] = useState<string[]>(DEFAULT_SEARCH_PHRASES);

  // Auto-typing placeholder animation
  const [placeholder, setPlaceholder] = useState(SEARCH_PREFIX);
  const [wordIdx, setWordIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Gemini AI generated phrases (Redis-cached on server)
  useEffect(() => {
    let mounted = true;
    fetch("/api/search/phrases")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && Array.isArray(data?.phrases) && data.phrases.length > 0) {
          const normalized = data.phrases.map((p: string) =>
            p.toLowerCase().startsWith("search") ? p : `${SEARCH_PREFIX}${p}`
          );
          setSearchPhrases(normalized);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Jaquar-style Phrase Typewriter Loop (keeps "Search for " prefix steady while typing/deleting the phrase)
  useEffect(() => {
    if (isOpen || query.length > 0 || searchPhrases.length === 0) return;

    const currentPhrase = searchPhrases[wordIdx % searchPhrases.length] || DEFAULT_SEARCH_PHRASES[0];
    const minPrefixLen = currentPhrase.startsWith(SEARCH_PREFIX) ? SEARCH_PREFIX.length : 0;
    const typingSpeed = isDeleting ? 28 : 62;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        const nextLen = placeholder.length + 1;
        setPlaceholder(currentPhrase.substring(0, nextLen));
        if (nextLen >= currentPhrase.length) {
          setTimeout(() => setIsDeleting(true), 1900);
        }
      } else {
        const nextLen = Math.max(minPrefixLen, placeholder.length - 1);
        setPlaceholder(currentPhrase.substring(0, nextLen));
        if (nextLen <= minPrefixLen) {
          setIsDeleting(false);
          setWordIdx((prev) => (prev + 1) % searchPhrases.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [placeholder, isDeleting, wordIdx, isOpen, query, searchPhrases]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch & filter suggestions dynamically (Local + Redis Catalogue + Gemini AI Phrases)
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setSuggestions([]);
      return;
    }

    // 1. Instant 0ms suggestions from preset keywords + Redis-cached categories & subcategories
    const presetMatches = PRESET_KEYWORDS.filter((k) =>
      k.toLowerCase().includes(trimmed)
    );
    const cachedCats = (getCachedCategories() || [])
      .map((c) => c.name?.toLowerCase().trim())
      .filter((n): n is string => Boolean(n && n.includes(trimmed)));
    const cachedSubs = (getCachedSubcategories() || [])
      .map((s) => s.name?.toLowerCase().trim())
      .filter((n): n is string => Boolean(n && n.includes(trimmed)));

    const instantMatches = Array.from(
      new Set([...cachedSubs, ...cachedCats, ...presetMatches])
    ).slice(0, 8);
    if (instantMatches.length > 0) {
      setSuggestions(instantMatches);
    }

    setLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        // 2. Fetch live matching products + Gemini AI phrase suggestions in parallel
        const [prodRes, aiRes] = await Promise.allSettled([
          fetch(`/api/products?q=${encodeURIComponent(trimmed)}&limit=6`),
          trimmed.length >= 2
            ? fetch(`/api/search/phrases?q=${encodeURIComponent(trimmed)}`)
            : Promise.resolve(null),
        ]);

        let apiMatches: string[] = [];
        if (prodRes.status === "fulfilled" && prodRes.value && prodRes.value.ok) {
          const data = await prodRes.value.json();
          const prods = Array.isArray(data) ? data : data.products || [];
          apiMatches = prods
            .map((p: any) => p.name?.toLowerCase().trim())
            .filter(Boolean);
        }

        let aiMatches: string[] = [];
        if (aiRes.status === "fulfilled" && aiRes.value && aiRes.value.ok) {
          const aiData = await aiRes.value.json();
          if (Array.isArray(aiData?.suggestions)) {
            aiMatches = aiData.suggestions
              .map((s: any) => String(s || "").toLowerCase().trim())
              .filter(Boolean);
          }
        }

        // Combine and deduplicate
        const combined = Array.from(
          new Set([...cachedSubs, ...cachedCats, ...presetMatches, ...aiMatches, ...apiMatches])
        ).slice(0, 8);

        setSuggestions(combined);
      } catch (err) {
        console.error("Search suggestions error:", err);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelectSuggestion = (term: string) => {
    setQuery(term);
    setIsOpen(false);
    router.push(`/faucets/all?search=${encodeURIComponent(term)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/faucets/all?search=${encodeURIComponent(query.trim())}`);
  };

  const inputBorder = isDarkBg ? "rgba(255, 255, 255, 0.25)" : "#cbd5e1";
  const inputBg = isDarkBg ? "rgba(255, 255, 255, 0.08)" : "#FFFFFF";
  const textColor = isDarkBg ? "#FFFFFF" : "#1e293b";
  const iconColor = isDarkBg ? "rgba(255, 255, 255, 0.8)" : "#64748b";

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "clamp(190px, 23vw, 450px)",
        maxWidth: "450px",
        minWidth: "180px",
        fontFamily: "'Manrope', system-ui, sans-serif",
      }}
      className="jaquar-search-container"
    >
      {/* Search Input Form (Pill Shape) */}
      <form onSubmit={handleSubmit} style={{ position: "relative", width: "100%", margin: 0 }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={isOpen && !query ? "Search..." : placeholder || "Search products..."}
          aria-label="Search products"
          style={{
            width: "100%",
            height: "38px",
            borderRadius: "9999px",
            border: `1.5px solid ${inputBorder}`,
            background: inputBg,
            color: textColor,
            paddingLeft: "16px",
            paddingRight: "40px",
            fontSize: "13.5px",
            fontWeight: 400,
            outline: "none",
            boxSizing: "border-box",
            transition: "all 0.25s ease",
            backdropFilter: isDarkBg ? "blur(8px)" : "none",
            boxShadow: isOpen ? "0 4px 16px rgba(0,0,0,0.08)" : "none",
          }}
        />

        {/* Search Icon / Loader */}
        <button
          type="submit"
          aria-label="Submit search"
          style={{
            position: "absolute",
            right: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: iconColor,
          }}
        >
          {loading ? (
            <Loader2 size={19} className="animate-spin" />
          ) : (
            <Search size={19} strokeWidth={1.8} />
          )}
        </button>
      </form>

      {/* Autocomplete Dropdown List Attached Directly Below (Matches Screenshot Exactly) */}
      {isOpen && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            width: "100%",
            minWidth: "100%",
            backgroundColor: "#FFFFFF",
            borderRadius: "0 0 8px 8px",
            boxShadow: "0 12px 30px rgba(0, 0, 0, 0.14)",
            border: "1px solid #e5e7eb",
            borderTop: "none",
            zIndex: 99999,
            overflow: "hidden",
            animation: "fadeInDropdown 0.15s ease",
          }}
        >
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {suggestions.map((item, idx) => (
              <li
                key={idx}
                style={{
                  borderBottom: idx < suggestions.length - 1 ? "1px solid #f1f5f9" : "none",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "11px 20px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#334155",
                    fontWeight: 400,
                    textTransform: "lowercase",
                    display: "block",
                    fontFamily: "inherit",
                    transition: "background-color 0.15s ease, color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                    e.currentTarget.style.color = "#0f172a";
                    e.currentTarget.style.fontWeight = "500";
                    e.currentTarget.style.paddingLeft = "24px";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#334155";
                    e.currentTarget.style.fontWeight = "400";
                    e.currentTarget.style.paddingLeft = "20px";
                  }}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInDropdown {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}