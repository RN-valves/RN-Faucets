import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { getOrSetCache } from "@/lib/redis";

const DEFAULT_JAQUAR_PHRASES = [
  "Search for Single Lever Basin Mixer...",
  "Search for Overhead Rain Showers...",
  "Search for Black Chrome Pillar Cock...",
  "Search for Concealed Shower Diverters...",
  "Search for PTMT Bib Cock with Flange...",
  "Search for Wall Mounted Sink Mixer...",
  "Search for Rose Gold Bath Fittings...",
  "Search for Two Way Angle Valves...",
  "Search for Tall Body Basin Faucets...",
  "Search for ABS Health Faucet Sets...",
];

const CORE_PRODUCT_TYPES = [
  "pillar cock",
  "basin mixer",
  "single lever basin mixer",
  "bib cock",
  "2 in 1 bib cock",
  "angle cock",
  "2 in 1 angle cock",
  "concealed diverter",
  "wall mixer",
  "sink cock",
  "sink mixer",
  "swan neck",
  "overhead shower",
  "hand shower",
  "health faucet",
  "flush cock",
  "concealed stop cock",
  "bath spout",
  "ball valve",
  "bath accessories set",
  "towel rack",
  "soap dish",
  "tumbler holder",
  "robe hook",
  "waste coupling",
  "bottle trap",
];

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

function normalizePhrase(raw: string): string {
  return String(raw || "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\|.*$/g, " ")
    .replace(/\bart\s*no\.?\s*\w+/gi, " ")
    .replace(/\batr\s*no\.?\s*\w+/gi, " ")
    .replace(/[^a-z0-9\s-&/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Builds a rich multi-word search phrase corpus directly from the 7,398 products,
 * subcategories, categories, and color finishes in MongoDB (cached in Redis).
 */
async function getCataloguePhraseIndex(): Promise<{
  typewriterPhrases: string[];
  corpus: string[];
}> {
  const { data } = await getOrSetCache(
    "rn:search:catalogue_phrase_index:v2",
    3600,
    async () => {
      await connectDB();

      const [distinctNames, distinctSubcats, distinctCats, distinctColors] =
        await Promise.all([
          Product.distinct("name", { isVisibleWebsite: { $ne: false } }),
          Product.distinct("subcategoryName", { isVisibleWebsite: { $ne: false } }),
          Product.distinct("category", { isVisibleWebsite: { $ne: false } }),
          Product.distinct("colorName", { isVisibleWebsite: { $ne: false } }),
        ]);

      const phraseSet = new Set<string>();

      // 1. Add core product types
      for (const pt of CORE_PRODUCT_TYPES) {
        phraseSet.add(pt);
      }

      // 2. Add normalized categories & subcategories
      for (const cat of distinctCats) {
        const clean = normalizePhrase(String(cat || ""));
        if (clean.length >= 3 && clean.length <= 55) {
          phraseSet.add(clean);
        }
      }

      const cleanSubcats: string[] = [];
      for (const sub of distinctSubcats) {
        const clean = normalizePhrase(String(sub || ""));
        if (clean.length >= 3 && clean.length <= 55) {
          phraseSet.add(clean);
          cleanSubcats.push(clean);
        }
      }

      // 3. Add normalized product names from the 7,398 products
      for (const rawName of distinctNames) {
        const clean = normalizePhrase(String(rawName || ""));
        if (clean.length >= 4 && clean.length <= 65) {
          phraseSet.add(clean);
        }
      }

      // 4. Generate smart Product Type + Color Finish combinations (Jaquar-style)
      const topFinishes = [
        "black chrome",
        "black",
        "rose gold",
        "gold",
        "brushed golden",
        "chrome plated",
        "chrome",
        "marble finish",
        "white",
        "ivory",
        "copper",
        "brass finish",
        "charcoal",
      ];
      for (const rawColor of distinctColors) {
        const c = normalizePhrase(String(rawColor || "").replace(/-/g, " "));
        if (c && c.length >= 3 && c.length <= 24 && !topFinishes.includes(c)) {
          topFinishes.push(c);
        }
      }

      const combinableTypes = [
        "pillar cock",
        "basin mixer",
        "single lever basin mixer",
        "bib cock",
        "2 in 1 bib cock",
        "angle cock",
        "concealed diverter",
        "wall mixer",
        "sink mixer",
        "swan neck",
        "overhead shower",
        "hand shower",
        "health faucet",
        "bath spout",
        "bath accessories set",
      ];

      for (const type of combinableTypes) {
        for (const finish of topFinishes.slice(0, 18)) {
          phraseSet.add(`${type} ${finish}`);
        }
      }

      // 5. Generate Collection + Product Type combinations for major collections
      for (const sub of cleanSubcats.slice(0, 35)) {
        if (sub.includes("collection") || sub.includes("series")) {
          const shortSub = sub.replace(/\s*(collection|series)\s*/g, "").trim();
          if (shortSub.length >= 3) {
            phraseSet.add(`${shortSub} pillar cock`);
            phraseSet.add(`${shortSub} basin mixer`);
            phraseSet.add(`${shortSub} bib cock`);
            phraseSet.add(`${shortSub} concealed diverter`);
          }
        }
      }

      // 6. Build typewriter phrases from real catalogue highlights
      const dynamicTypewriter = [
        ...DEFAULT_JAQUAR_PHRASES,
        "Search for 2 Way Hi-Flow Concealed Diverter...",
        "Search for 2 In 1 Bib Cock With Flange...",
        "Search for Forged Brass Ball Valves...",
        "Search for Black Chrome Bath Fittings...",
        "Search for Wall Mixer Overhead Shower Set...",
        "Search for Abhidu Pro Collection Faucets...",
      ];

      return {
        typewriterPhrases: Array.from(new Set(dynamicTypewriter)),
        corpus: Array.from(phraseSet),
      };
    },
    900
  );

  return data;
}

/**
 * Ranks phrases in <5ms for any single-word or multi-word query.
 */
function rankPhrases(query: string, corpus: string[], limit = 8): string[] {
  const cleanQ = normalizePhrase(query);
  if (!cleanQ) return [];
  const words = cleanQ.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const scored: Array<{ phrase: string; score: number }> = [];

  for (const phrase of corpus) {
    if (phrase === cleanQ) {
      scored.push({ phrase, score: 120 });
      continue;
    }
    if (phrase.startsWith(cleanQ)) {
      // Prefer concise phrases first
      scored.push({ phrase, score: 100 - Math.min(20, phrase.length * 0.25) });
      continue;
    }
    if (phrase.includes(` ${cleanQ}`)) {
      scored.push({ phrase, score: 85 - Math.min(20, phrase.length * 0.25) });
      continue;
    }
    if (words.length > 1) {
      const allPresent = words.every((w) => phrase.includes(w));
      if (allPresent) {
        const startsWithFirst = phrase.startsWith(words[0]) ? 12 : 0;
        scored.push({
          phrase,
          score: 65 + startsWithFirst - Math.min(20, phrase.length * 0.2),
        });
      }
    } else if (phrase.includes(cleanQ)) {
      scored.push({ phrase, score: 50 - Math.min(20, phrase.length * 0.25) });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.phrase);
}

async function callGeminiForPhrases(prompt: string): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) return [];

  const res = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.35,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  if (!res.ok) return [];
  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
  const parsed = JSON.parse(rawText);
  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => String(item || "").trim())
      .filter((item) => item.length > 3 && item.length <= 65);
  }
  return [];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    const index = await getCataloguePhraseIndex();

    // Mode 1: Initial load — returns Typewriter phrases + full 7,398-product phrase corpus for <5ms client matching
    if (!q) {
      return NextResponse.json(
        {
          phrases: index.typewriterPhrases,
          corpus: index.corpus,
        },
        { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } }
      );
    }

    // Mode 2: Query suggestions — instant <5ms ranking from 7,398-product corpus (+ optional Gemini fallback)
    const fastMatches = rankPhrases(q, index.corpus, 8);

    if (fastMatches.length >= 5 || !process.env.GEMINI_API_KEY) {
      return NextResponse.json({ suggestions: fastMatches });
    }

    // Only call Gemini if the user typed an unusual conversational query with <5 catalogue matches
    const safeKey = q.replace(/[^a-z0-9\s-]/g, "").slice(0, 32);
    const { data: aiSuggestions } = await getOrSetCache<string[]>(
      `rn:search:gemini_suggest:v2:${safeKey}`,
      3600,
      async () => {
        try {
          const res = await callGeminiForPhrases(
            `A customer on RN Valves & Faucets typed "${q}". Return a JSON array of 6 short lowercase bathroom faucet/shower search phrases matching "${q}".`
          );
          return res.map((s) => s.toLowerCase());
        } catch {
          return [];
        }
      },
      600
    );

    const merged = Array.from(new Set([...fastMatches, ...aiSuggestions])).slice(0, 8);
    return NextResponse.json({ suggestions: merged });
  } catch {
    return NextResponse.json({
      phrases: DEFAULT_JAQUAR_PHRASES,
      corpus: CORE_PRODUCT_TYPES,
      suggestions: [],
    });
  }
}
