import type { Category, Mood } from "@/types/life";

// Hex values are needed by three.js materials (cannot read CSS vars in WebGL).
export const MOOD_COLORS: Record<Mood, string> = {
  Vibrant: "#ff8fb1",
  Calm: "#7fd8e6",
  Melancholy: "#8e9cff",
  Energetic: "#ffd36e",
  Reflective: "#b9f2a1",
};

export const CATEGORY_GLYPH: Record<Category, string> = {
  Career: "▲",
  Relationships: "♥",
  Growth: "✦",
  Health: "✚",
  Creative: "✎",
  Travel: "➶",
};

/** Deterministic hash → [0,1) used for stable layout per milestone id. */
export function hash01(s: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 100000) / 100000;
}
