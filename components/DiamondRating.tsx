/**
 * DiamondRating — reusable component for the Diamond Index™ rating system.
 *
 * Usage:
 *   <DiamondRating score={95.5} />          // auto-maps score → diamonds
 *   <DiamondRating rating={4} />            // direct rating (1–5)
 *   <DiamondRating score={95.5} showScore /> // show score below diamonds
 *
 * Rules (LOCKED):
 *   - Only swaps the pre-built diamond asset image
 *   - Never dynamically builds individual diamonds
 *   - Never changes layout per rating — only asset + text swap
 *   - Text: "1 DIAMOND" or "{n} DIAMONDS" (exact)
 */

import { getRating, scoreToDiamonds, diamondLabel, DIAMOND_ASSETS } from "@/lib/diamondRating";

interface DiamondRatingProps {
  /** Numeric score (0–100). If provided, maps to diamond rating automatically. */
  score?: number;
  /** Direct diamond rating (1–5). Used if score is not provided. */
  rating?: number;
  /** Whether to show the numeric score below the diamonds */
  showScore?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional className */
  className?: string;
}

const SIZE_MAP = {
  sm: { img: "h-6", text: "text-xs", score: "text-sm" },
  md: { img: "h-10", text: "text-sm", score: "text-base" },
  lg: { img: "h-14", text: "text-base", score: "text-xl" },
};

export function DiamondRating({
  score,
  rating: ratingProp,
  showScore = false,
  size = "md",
  className = "",
}: DiamondRatingProps) {
  // Determine rating
  const rating = ratingProp ?? (score !== undefined ? scoreToDiamonds(score) : 5);
  const label = diamondLabel(rating);
  const assetUrl = DIAMOND_ASSETS[rating];
  const sz = SIZE_MAP[size];

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {/* Diamond asset image — only swap, never rebuild */}
      <img
        src={assetUrl}
        alt={label}
        className={`${sz.img} w-auto object-contain`}
        draggable={false}
      />

      {/* Rating label — exact text logic */}
      <span
        className={`${sz.text} font-bold tracking-widest text-[#1a2a5e] uppercase`}
        style={{ letterSpacing: "0.15em" }}
      >
        {label}
      </span>

      {/* Optional score display */}
      {showScore && score !== undefined && (
        <span
          className={`${sz.score} font-serif text-[#b8922a]`}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {score.toFixed(1)}%
        </span>
      )}
    </div>
  );
}

export default DiamondRating;
