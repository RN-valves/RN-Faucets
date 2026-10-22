import { NextResponse } from "next/server";
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

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

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
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API HTTP ${res.status}`);
  }

  const data = await res.json();
  const rawText =
    data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

  const parsed = JSON.parse(rawText);
  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => String(item || "").trim())
      .filter((item) => item.length > 3 && item.length <= 60);
  }
  return [];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    // Mode 1: Typewriter placeholder phrases (Jaquar style)
    if (!q) {
      const { data: phrases, cacheStatus } = await getOrSetCache<string[]>(
        "rn:search:gemini_typewriter_phrases:v1",
        3600,
        async () => {
          try {
            const aiPhrases = await callGeminiForPhrases(
              `You are powering the luxury search bar placeholder typewriter on RN Valves & Faucets (similar to Jaquar bath fittings).
Return a JSON array of 10 short, natural search placeholder phrases starting with "Search for " and ending with "..." for bathroom faucets, CP fittings, PTMT taps, showers, diverters, basin mixers, pillar cocks, angle valves, and bath accessories.
Example format:
[
  "Search for Single Lever Basin Mixer...",
  "Search for Overhead Rain Showers...",
  "Search for Black Chrome Pillar Cock..."
]`
            );
            return aiPhrases.length >= 5 ? aiPhrases : DEFAULT_JAQUAR_PHRASES;
          } catch {
            return DEFAULT_JAQUAR_PHRASES;
          }
        },
        600
      );

      return NextResponse.json(
        { phrases: phrases.length ? phrases : DEFAULT_JAQUAR_PHRASES },
        { headers: { "X-Cache": cacheStatus } }
      );
    }

    // Mode 2: Smart phrase autocomplete suggestions when user types a query
    const safeKey = q.replace(/[^a-z0-9\s-]/g, "").slice(0, 32);
    const { data: suggestions, cacheStatus } = await getOrSetCache<string[]>(
      `rn:search:gemini_suggest:v1:${safeKey}`,
      3600,
      async () => {
        try {
          const aiSuggestions = await callGeminiForPhrases(
            `A customer on RN Valves & Faucets (luxury bathroom faucets, CP fittings, PTMT taps, showers, diverters, sanitaryware accessories) typed "${q}" in the search bar.
Return a JSON array of 6 short, realistic lowercase product search phrases (2 to 5 words each, Jaquar style) that start with or naturally complete "${q}".
Example if query is "pillar": ["pillar cock", "pillar cock tall body", "pillar cock black chrome", "pillar cock foam flow", "pillar cock rose gold", "pillar cock ptmt"]`
          );
          return aiSuggestions.map((s) => s.toLowerCase());
        } catch {
          return [];
        }
      },
      600
    );

    return NextResponse.json(
      { suggestions },
      { headers: { "X-Cache": cacheStatus } }
    );
  } catch {
    return NextResponse.json({
      phrases: DEFAULT_JAQUAR_PHRASES,
      suggestions: [],
    });
  }
}
