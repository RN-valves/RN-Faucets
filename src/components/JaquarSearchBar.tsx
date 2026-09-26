"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

interface JaquarSearchBarProps {
  isDarkBg?: boolean;
}

const SEARCH_WORDS = [
  "Search Faucets...",
  "Search Showers...",
  "Search Diverters...",
  "Search Basin Mixers...",
  "Search Pillar Cocks...",
  "Search Bath Accessories...",
];

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

  // Auto-typing placeholder animation
  const [placeholder, setPlaceholder] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter Loop
  useEffect(() => {
    if (isOpen || query.length > 0) return;

    const currentWord = SEARCH_WORDS[wordIdx];
    const typingSpeed = isDeleting ? 35 : 75;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setPlaceholder(currentWord.substring(0, placeholder.length + 1));
        if (placeholder.length + 1 === currentWord.length) {
          setTimeout(() => setIsDeleting(true), 1800);
        }
      } else {
        setPlaceholder(currentWord.substring(0, placeholder.length - 1));
        if (placeholder.length === 0) {
          setIsDeleting(false);
          setWordIdx((prev) => (prev + 1) % SEARCH_WORDS.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [placeholder, isDeleting, wordIdx, isOpen, query]);

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

  // Fetch & filter suggestions dynamically
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        // 1. Filter from predefined keywords
        const presetMatches = PRESET_KEYWORDS.filter((k) =>
          k.toLowerCase().includes(trimmed)
        );

        // 2. Fetch live matching products/categories from API
        let apiMatches: string[] = [];
        try {
          const res = await fetch(`/api/products?q=${encodeURIComponent(trimmed)}&limit=8`);
          if (res.ok) {
            const data = await res.json();
            const prods = Array.isArray(data) ? data : data.products || [];
            apiMatches = prods
              .map((p: any) => p.name?.toLowerCase().trim())
              .filter(Boolean);
          }
        } catch {}

        // Combine and deduplicate
        const combined = Array.from(
          new Set([...presetMatches, ...apiMatches])
        ).slice(0, 11);

        setSuggestions(combined);
      } catch (err) {
        console.error("Search suggestions error:", err);
      } finally {
        setLoading(false);
      }
    }, 150);

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
        width: "100%",
        maxWidth: "240px",
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
            height: "36px",
            borderRadius: "9999px",
            border: `1px solid ${inputBorder}`,
            background: inputBg,
            color: textColor,
            paddingLeft: "16px",
            paddingRight: "36px",
            fontSize: "13px",
            fontWeight: 400,
            outline: "none",
            boxSizing: "border-box",
            transition: "all 0.25s ease",
            backdropFilter: isDarkBg ? "blur(8px)" : "none",
          }}
        />

        {/* Search Icon / Loader */}
        <button
          type="submit"
          aria-label="Submit search"
          style={{
            position: "absolute",
            right: "10px",
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
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Search size={16} strokeWidth={1.75} />
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
            minWidth: "240px",
            backgroundColor: "#FFFFFF",
            borderRadius: "0 0 6px 6px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.12)",
            border: "1px solid #e5e7eb",
            borderTop: "none",
            zIndex: 99999,
            maxHeight: "360px",
            overflowY: "auto",
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
                    padding: "9px 16px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: "#475569",
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
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#475569";
                    e.currentTarget.style.fontWeight = "400";
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