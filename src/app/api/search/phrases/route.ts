import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { getOrSetCache } from "@/lib/redis";

// Exact Jaquar-style natural language & price-range typewriter phrases
const DEFAULT_JAQUAR_PHRASES = [
  "Sanitaryware ranging from 1000 to 15000 rupees",
  "Shower panel for bathroom",
  "Overhead showers in square shape in black",
  "Suggest basin mixer below 5000 rupees",
  "CP Faucets ranging from 1000 to 5000 rupees",
  "Single lever basin mixer in black chrome",
  "Suggest pillar cock below 2000 rupees",
  "Concealed shower diverter for bathroom",
  "Overhead showers in round shape in rose gold",
  "2 in 1 bib cock with flange for bathroom",
  "Bath accessories set below 6000 rupees",
  "PTMT faucets ranging from 200 to 1500 rupees",
];

const CONVERSATIONAL_SEARCH_PHRASES = [
  "sanitaryware ranging from 1000 to 15000 rupees",
  "sanitaryware ranging from 6000 to 20000 rupees",
  "shower panel for bathroom",
  "overhead showers in square shape in black",
  "overhead showers in round shape in black chrome",
  "overhead showers in square shape in rose gold",
  "suggest basin mixer below 5000 rupees",
  "suggest pillar cock below 2000 rupees",
  "suggest concealed diverter below 4000 rupees",
  "suggest shower panel below 15000 rupees",
  "cp faucets ranging from 1000 to 5000 rupees",
  "ptmt faucets ranging from 200 to 1500 rupees",
  "single lever basin mixer in black chrome",
  "single lever basin mixer in rose gold",
  "pillar cock in black chrome for wash basin",
  "2 in 1 bib cock with flange for bathroom",
  "2 in 1 angle cock with flange for bathroom",
  "wall mixer with overhead shower set for bathroom",
  "bath accessories set in black chrome",
  "bath accessories set in rose gold",
  "health faucet with hose and hook for bathroom",
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
  "shower panel",
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

const COMPETITOR_BRANDS_REGEX =
  /\b(jaquar|jaguar|jaguare|hindware|kohler|cera|parryware|grohe|essco|jal|kerovit|roca|toto|somany|johnson)\b/gi;

function sanitizeRnBrandPhrase(raw: string): string {
  return String(raw || "")
    .replace(COMPETITOR_BRANDS_REGEX, "rn")
    .replace(/\brn\s+rn\b/gi, "rn")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizePhrase(raw: string): string {
  return sanitizeRnBrandPhrase(
    String(raw || "")
      .toLowerCase()
      .replace(/\([^)]*\)/g, " ")
      .replace(/\|.*$/g, " ")
      .replace(/\bart\s*no\.?\s*\w+/gi, " ")
      .replace(/\batr\s*no\.?\s*\w+/gi, " ")
      .replace(/[^a-z0-9\s-&/]/g, " ")
  );
}

/**
 * Builds a rich multi-word search phrase corpus directly from the 7,398 products,
 * subcategories, categories, color finishes, and Jaquar-style natural phrases (cached in Redis).
 */
async function getCataloguePhraseIndex(): Promise<{
  typewriterPhrases: string[];
  corpus: string[];
}> {
  const { data } = await getOrSetCache(
    "rn:search:catalogue_phrase_index:v4",
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

      // 1. Add Jaquar-style conversational & price-range phrases first
      for (const cp of CONVERSATIONAL_SEARCH_PHRASES) {
        phraseSet.add(cp);
      }

      // 2. Add core product types
      for (const pt of CORE_PRODUCT_TYPES) {
        phraseSet.add(pt);
        phraseSet.add(`${pt} for bathroom`);
      }

      // 3. Add normalized categories & subcategories
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

      // 4. Add normalized product names from the 7,398 products
      for (const rawName of distinctNames) {
        const clean = normalizePhrase(String(rawName || ""));
        if (clean.length >= 4 && clean.length <= 65) {
          phraseSet.add(clean);
        }
      }

      // 5. Generate smart Product Type + Color Finish + Shape combinations (Jaquar-style)
      const topFinishes = [
        "black",
        "black chrome",
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
        "shower panel",
        "hand shower",
        "health faucet",
        "bath spout",
        "bath accessories set",
      ];

      for (const type of combinableTypes) {
        for (const finish of topFinishes.slice(0, 16)) {
          phraseSet.add(`${type} in ${finish}`);
          phraseSet.add(`${type} ${finish}`);
        }
      }

      // Overhead shower shape + color phrases (like "Overhead showers in square shape in black")
      for (const shape of ["square", "round", "oval", "slim"]) {
        for (const finish of ["black", "black chrome", "chrome", "rose gold", "gold"]) {
          phraseSet.add(`overhead showers in ${shape} shape in ${finish}`);
        }
      }

      // Price range & "Suggest ... below X rupees" phrases for popular categories
      for (const item of [
        { name: "basin mixer", low: 1500, high: 6000, below: 5000 },
        { name: "pillar cock", low: 500, high: 3500, below: 2000 },
        { name: "overhead shower", low: 800, high: 8000, below: 4000 },
        { name: "shower panel", low: 3000, high: 18000, below: 15000 },
        { name: "concealed diverter", low: 1200, high: 5000, below: 3500 },
        { name: "cp faucets", low: 1000, high: 5000, below: 3000 },
        { name: "ptmt faucets", low: 200, high: 1500, below: 1000 },
        { name: "bath accessories set", low: 1500, high: 8000, below: 5000 },
      ]) {
        phraseSet.add(`${item.name} ranging from ${item.low} to ${item.high} rupees`);
        phraseSet.add(`suggest ${item.name} below ${item.below} rupees`);
      }

      // 6. Generate Collection + Product Type combinations
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

      // 7. Build typewriter phrases from Gemini AI + RN luxury highlights
      let geminiTypewriter: string[] = [];
      try {
        geminiTypewriter = await callGeminiForPhrases(
          `You are powering the luxury search bar placeholder typewriter on RN Valves & Faucets.
ONLY use the brand name "RN" (never mention any other brand).
Return a JSON array of 8 natural-language search phrases (WITHOUT "Search for" prefix) matching these exact patterns:
- "Sanitaryware ranging from 1000 to 15000 rupees"
- "Shower panel for bathroom"
- "Overhead showers in square shape in black"
- "Suggest basin mixer below 5000 rupees"
- "Single lever basin mixer in black chrome"
- "CP Faucets ranging from 1000 to 5000 rupees"`
        );
      } catch {}

      const dynamicTypewriter = [
        ...DEFAULT_JAQUAR_PHRASES,
        ...geminiTypewriter,
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
      scored.push({ phrase, score: 100 - Math.min(20, phrase.length * 0.2) });
      continue;
    }
    if (phrase.includes(` ${cleanQ}`)) {
      scored.push({ phrase, score: 85 - Math.min(20, phrase.length * 0.2) });
      continue;
    }
    if (words.length > 1) {
      const allPresent = words.every((w) => phrase.includes(w));
      if (allPresent) {
        const startsWithFirst = phrase.startsWith(words[0]) ? 12 : 0;
        scored.push({
          phrase,
          score: 65 + startsWithFirst - Math.min(20, phrase.length * 0.15),
        });
      }
    } else if (phrase.includes(cleanQ)) {
      scored.push({ phrase, score: 50 - Math.min(20, phrase.length * 0.2) });
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
      .map((item) => sanitizeRnBrandPhrase(String(item || "").trim()))
      .filter((item) => item.length > 3 && item.length <= 70);
  }
  return [];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    const index = await getCataloguePhraseIndex();

    if (!q) {
      return NextResponse.json(
        {
          phrases: index.typewriterPhrases,
          corpus: index.corpus,
        },
        { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } }
      );
    }

    const fastMatches = rankPhrases(q, index.corpus, 8).map(sanitizeRnBrandPhrase);

    // If user typed a numeric Article number (e.g. "6910", "1710", "0611"), look up real RN products for that Article
    if (/^\d+$/.test(q)) {
      const stripped = q.replace(/^0+/, "") || q;
      await connectDB();
      const matchedProds = await Product.find({
        isVisibleWebsite: { $ne: false },
        status: { $nin: ["Inactive", "InActive", "inactive", "Discontinued", "discontinued"] },
        $or: [
          { article: { $regex: `^(?:[a-zA-Z-_]*)0*${stripped}(?:[^0-9]|$)`, $options: "i" } },
          { code: { $regex: `^(?:[a-zA-Z-_]*)0*${stripped}`, $options: "i" } },
          { skuCode: { $regex: `^(?:[a-zA-Z-_]*)0*${stripped}`, $options: "i" } },
        ],
      })
        .select("name article code subcategoryName colorName")
        .limit(12)
        .lean();

      const articleSuggestions = new Set<string>();
      for (const p of matchedProds as any[]) {
        const cleanName = sanitizeRnBrandPhrase(String(p.name || "").toLowerCase());
        const art = String(p.article || q).toLowerCase();
        if (cleanName) {
          articleSuggestions.add(cleanName.includes(art) ? cleanName : `${cleanName} ${art}`);
        }
        if (p.colorName && cleanName) {
          const cleanColor = String(p.colorName).toLowerCase().replace(/-/g, " ").trim();
          if (cleanColor && cleanColor !== "-") {
            articleSuggestions.add(`${cleanName} ${art} in ${cleanColor}`);
          }
        }
      }
      if (articleSuggestions.size === 0) {
        articleSuggestions.add(`rn article ${q}`);
      }
      return NextResponse.json({
        suggestions: Array.from(articleSuggestions).slice(0, 8),
      });
    }

    if (fastMatches.length >= 5 || !process.env.GEMINI_API_KEY) {
      return NextResponse.json({ suggestions: fastMatches });
    }

    const safeKey = q.replace(/[^a-z0-9\s-]/g, "").slice(0, 32);
    const { data: aiSuggestions } = await getOrSetCache<string[]>(
      `rn:search:gemini_suggest:v4:${safeKey}`,
      3600,
      async () => {
        try {
          const res = await callGeminiForPhrases(
            `A customer on RN Valves & Faucets typed "${q}".
STRICT RULE: ONLY use the brand "RN" (NEVER mention Jaquar, Hindware, Kohler, Cera, Parryware, Grohe, or any other brand).
Return a JSON array of 6 natural lowercase RN bathroom faucet/shower search phrases matching "${q}" (such as "rn ${q} for bathroom", "suggest rn ${q} below 5000 rupees", "rn ${q} in black chrome", "rn ${q} ranging from 1000 to 5000 rupees").`
          );
          return res.map((s) => sanitizeRnBrandPhrase(s.toLowerCase()));
        } catch {
          return [];
        }
      },
      600
    );

    const merged = Array.from(new Set([...fastMatches, ...aiSuggestions.map(sanitizeRnBrandPhrase)])).slice(0, 8);
    return NextResponse.json({ suggestions: merged });
  } catch {
    return NextResponse.json({
      phrases: DEFAULT_JAQUAR_PHRASES,
      corpus: CORE_PRODUCT_TYPES,
      suggestions: [],
    });
  }
}
