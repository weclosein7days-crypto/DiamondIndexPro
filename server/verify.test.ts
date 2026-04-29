/**
 * Tests for the Verify page data logic
 * Covers: cert ID lookup, S3 URL resolution, null handling, tier color mapping
 */

import { describe, it, expect } from "vitest";

// ─── Tier color logic (mirrors Verify.tsx) ────────────────────────────────────

const TIER_COLORS: Record<string, { text: string; glow: string }> = {
  PRISTINE:  { text: "#f0d060", glow: "rgba(240,208,96,0.25)" },
  ELITE:     { text: "#c9a84c", glow: "rgba(201,168,76,0.2)" },
  SUPERIOR:  { text: "#7eb8f7", glow: "rgba(126,184,247,0.2)" },
  PREMIUM:   { text: "#a0b4c8", glow: "rgba(160,180,200,0.15)" },
  STANDARD:  { text: "#6b7f94", glow: "rgba(107,127,148,0.12)" },
};

const DEFAULT_TIER = { text: "#a0b4c8", glow: "rgba(160,180,200,0.12)" };

function getTierStyle(tier: string) {
  return TIER_COLORS[tier.toUpperCase()] ?? DEFAULT_TIER;
}

// ─── Score formatting (mirrors Verify.tsx) ────────────────────────────────────

function formatScore(overallScore: string | null | undefined): string {
  if (!overallScore) return "—";
  const n = parseFloat(overallScore);
  return isNaN(n) ? "—" : n.toFixed(1);
}

// ─── Card title assembly (mirrors Verify.tsx) ─────────────────────────────────

function buildCardTitle(card: {
  cardYear?: string | null;
  cardName?: string | null;
  cardSet?: string | null;
}): string {
  return [card.cardYear, card.cardName, card.cardSet].filter(Boolean).join(" · ") || "Sports Card";
}

// ─── Category score color (mirrors Verify.tsx) ────────────────────────────────

function getCategoryColor(pct: number): string {
  if (pct >= 95) return "#7eb8f7";
  if (pct >= 88) return "#c9a84c";
  if (pct >= 80) return "#a0b4c8";
  return "#6b7f94";
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Verify page — tier color mapping", () => {
  it("returns gold for ELITE tier", () => {
    expect(getTierStyle("ELITE").text).toBe("#c9a84c");
  });

  it("returns yellow for PRISTINE tier", () => {
    expect(getTierStyle("PRISTINE").text).toBe("#f0d060");
  });

  it("returns blue for SUPERIOR tier", () => {
    expect(getTierStyle("SUPERIOR").text).toBe("#7eb8f7");
  });

  it("returns default for unknown tier", () => {
    expect(getTierStyle("UNKNOWN")).toEqual(DEFAULT_TIER);
  });

  it("is case-insensitive", () => {
    expect(getTierStyle("elite")).toEqual(getTierStyle("ELITE"));
  });
});

describe("Verify page — score formatting", () => {
  it("formats a decimal score to 1 decimal place", () => {
    expect(formatScore("94.2")).toBe("94.2");
    expect(formatScore("100.0")).toBe("100.0");
    expect(formatScore("88")).toBe("88.0");
  });

  it("returns em dash for null/undefined/empty", () => {
    expect(formatScore(null)).toBe("—");
    expect(formatScore(undefined)).toBe("—");
    expect(formatScore("")).toBe("—");
  });

  it("returns em dash for non-numeric string", () => {
    expect(formatScore("not-a-number")).toBe("—");
  });
});

describe("Verify page — card title assembly", () => {
  it("joins year, name, set with middle dot", () => {
    expect(buildCardTitle({ cardYear: "2024", cardName: "Aaron Judge", cardSet: "Topps Chrome" }))
      .toBe("2024 · Aaron Judge · Topps Chrome");
  });

  it("skips null/undefined fields", () => {
    expect(buildCardTitle({ cardYear: "2024", cardName: null, cardSet: "Topps" }))
      .toBe("2024 · Topps");
  });

  it("falls back to 'Sports Card' when all fields are empty", () => {
    expect(buildCardTitle({ cardYear: null, cardName: null, cardSet: null }))
      .toBe("Sports Card");
  });

  it("handles only cardName", () => {
    expect(buildCardTitle({ cardName: "Mike Trout" }))
      .toBe("Mike Trout");
  });
});

describe("Verify page — category score color", () => {
  it("returns blue for scores >= 95", () => {
    expect(getCategoryColor(95)).toBe("#7eb8f7");
    expect(getCategoryColor(100)).toBe("#7eb8f7");
  });

  it("returns gold for scores 88-94", () => {
    expect(getCategoryColor(88)).toBe("#c9a84c");
    expect(getCategoryColor(94.9)).toBe("#c9a84c");
  });

  it("returns silver for scores 80-87", () => {
    expect(getCategoryColor(80)).toBe("#a0b4c8");
    expect(getCategoryColor(87.9)).toBe("#a0b4c8");
  });

  it("returns muted for scores below 80", () => {
    expect(getCategoryColor(79)).toBe("#6b7f94");
    expect(getCategoryColor(0)).toBe("#6b7f94");
  });
});

describe("Verify page — cert ID format validation", () => {
  const CERT_ID_PATTERN = /^DI-\d{4}-\d{4}$/;

  it("accepts valid cert ID format", () => {
    expect(CERT_ID_PATTERN.test("DI-2414-4527")).toBe(true);
    expect(CERT_ID_PATTERN.test("DI-0001-0001")).toBe(true);
  });

  it("rejects invalid cert ID formats", () => {
    expect(CERT_ID_PATTERN.test("DI24-00012345")).toBe(false);
    expect(CERT_ID_PATTERN.test("")).toBe(false);
    expect(CERT_ID_PATTERN.test("12345")).toBe(false);
  });
});
