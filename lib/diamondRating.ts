/**
 * Diamond Index™ — Diamond Rating System
 *
 * Score → Diamond mapping:
 *   97.0 – 100   → 5 DIAMONDS  (Pristine)
 *   93.0 – 96.9  → 4 DIAMONDS  (Elite)
 *   89.0 – 92.9  → 3 DIAMONDS  (Superior)
 *   85.0 – 88.9  → 2 DIAMONDS  (Premium)
 *   80.0 – 84.9  → 1 DIAMOND   (Standard)
 *   Below 80.0   → Not Gradeable
 *
 * Text logic (EXACT — do not change):
 *   rating === 1 → "1 DIAMOND"
 *   rating > 1   → "{n} DIAMONDS"
 *
 * Asset paths (pre-built, swap only):
 *   diamonds_1.png … diamonds_5.png
 */

// CDN paths for each diamond rating asset (real photorealistic blue diamond, transparent bg)
export const DIAMOND_ASSETS: Record<number, string> = {
  1: "/manus-storage/diamonds_1_ad5e9e68.png",
  2: "/manus-storage/diamonds_2_70e094c4.png",
  3: "/manus-storage/diamonds_3_32d27ea1.png",
  4: "/manus-storage/diamonds_4_627e735b.png",
  5: "/manus-storage/diamonds_5_0f673c91.png",
};

/** Single diamond image — use for individual diamond icons throughout the site */
export const DIAMOND_SINGLE = "/manus-storage/diamond-blue-sm_46bffbe0.png";

/** Convert a numeric score (0–100) to a diamond rating (1–5) */
export function scoreToDiamonds(score: number): number {
  if (score >= 97.0) return 5; // Pristine
  if (score >= 93.0) return 4; // Elite
  if (score >= 89.0) return 3; // Superior
  if (score >= 85.0) return 2; // Premium
  if (score >= 80.0) return 1; // Standard
  return 0; // Not Gradeable
}

/** Get the display text for a diamond rating — EXACT phrasing */
export function diamondLabel(rating: number): string {
  if (rating === 1) return "1 DIAMOND";
  return `${rating} DIAMONDS`;
}

/** Get the spoken/voice phrasing for a diamond rating */
export const DIAMOND_VOICE: Record<number, string> = {
  1: "One Diamond",
  2: "Two Diamonds",
  3: "Three Diamonds",
  4: "Four Diamonds",
  5: "Five Diamonds",
};

/** Full rating info for a given score */
export function getRating(score: number): {
  rating: number;
  label: string;
  voice: string;
  assetUrl: string;
} {
  const rating = scoreToDiamonds(score);
  return {
    rating,
    label: diamondLabel(rating),
    voice: DIAMOND_VOICE[rating],
    assetUrl: DIAMOND_ASSETS[rating],
  };
}
