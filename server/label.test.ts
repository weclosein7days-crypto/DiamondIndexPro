/**
 * Tests for label data assembly and diamond rating mapping
 */
import { describe, it, expect } from "vitest";
import { buildLabelData, type GradedCardRow } from "../client/src/components/LabelRenderer";

// ─── buildLabelData ───────────────────────────────────────────────────────────

describe("buildLabelData", () => {
  const baseRow: GradedCardRow = {
    cardName: "Aaron Judge",
    cardYear: "2024",
    cardSet: "Topps Chrome Update",
    cardNumber: "#USC1",
    manufacturer: "Refractor",
    centeringScore: "96.0",
    edgesScore: "94.0",
    surfaceScore: "97.0",
    cornersScore: "95.0",
    eyeAppealScore: "98.0",
    overallScore: "95.5",
    diamondRating: 5,
    certId: "DI-1234-5678",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=test",
    cardImageUrl: "/manus-storage/test-image.jpg",
  };

  it("uppercases playerName", () => {
    const data = buildLabelData(baseRow);
    expect(data.playerName).toBe("AARON JUDGE");
  });

  it("uppercases cardSet", () => {
    const data = buildLabelData(baseRow);
    expect(data.cardSet).toBe("TOPPS CHROME UPDATE");
  });

  it("parses numeric scores correctly", () => {
    const data = buildLabelData(baseRow);
    expect(data.centeringScore).toBe(96.0);
    expect(data.edgesScore).toBe(94.0);
    expect(data.surfaceScore).toBe(97.0);
    expect(data.cornersScore).toBe(95.0);
    expect(data.eyeAppealScore).toBe(98.0);
    expect(data.overallScore).toBe(95.5);
  });

  it("preserves certId and qrCodeUrl", () => {
    const data = buildLabelData(baseRow);
    expect(data.certId).toBe("DI-1234-5678");
    // qrCodeUrl is passed through as-is from the DB row (S3 URL set at grading time)
    expect(data.qrCodeUrl).toBe(baseRow.qrCodeUrl);
  });

  it("preserves cardImageUrl", () => {
    const data = buildLabelData(baseRow);
    expect(data.cardImageUrl).toBe("/manus-storage/test-image.jpg");
  });

  it("handles missing optional fields gracefully", () => {
    const minRow: GradedCardRow = {
      cardName: null,
      overallScore: "80.0",
      diamondRating: 3,
      certId: "DI-0000-0001",
    };
    const data = buildLabelData(minRow);
    expect(data.playerName).toBe("UNKNOWN PLAYER");
    expect(data.cardYear).toBe("");
    expect(data.cardSet).toBe("");
    expect(data.overallScore).toBe(80.0);
    expect(data.diamondRating).toBe(3);
  });

  it("defaults to rating 1 when diamondRating is null", () => {
    const data = buildLabelData({ ...baseRow, diamondRating: null });
    expect(data.diamondRating).toBe(1);
  });

  it("returns empty string for qrCodeUrl when qrCodeUrl is null (QR generated server-side)", () => {
    const data = buildLabelData({ ...baseRow, qrCodeUrl: null });
    // QR codes are now generated server-side and stored in S3 at grading time.
    // The client-side fallback is an empty string — the label shows a blank QR slot.
    expect(data.qrCodeUrl).toBe("");
  });

  it("handles numeric scores passed as numbers (not strings)", () => {
    const data = buildLabelData({ ...baseRow, centeringScore: 91.5 });
    expect(data.centeringScore).toBe(91.5);
  });
});

// ─── Diamond rating thresholds ────────────────────────────────────────────────

describe("diamond rating thresholds", () => {
  // Mirrors the scoreToDiamondRating logic in diamondRating.ts
  function scoreToDiamondRating(score: number): number {
    if (score >= 95) return 5;
    if (score >= 88) return 4;
    if (score >= 80) return 3;
    if (score >= 70) return 2;
    return 1;
  }

  it("returns 5 diamonds for score >= 95", () => {
    expect(scoreToDiamondRating(95)).toBe(5);
    expect(scoreToDiamondRating(100)).toBe(5);
    expect(scoreToDiamondRating(95.5)).toBe(5);
  });

  it("returns 4 diamonds for score 88–94.9", () => {
    expect(scoreToDiamondRating(88)).toBe(4);
    expect(scoreToDiamondRating(94.9)).toBe(4);
    expect(scoreToDiamondRating(90)).toBe(4);
  });

  it("returns 3 diamonds for score 80–87.9", () => {
    expect(scoreToDiamondRating(80)).toBe(3);
    expect(scoreToDiamondRating(87.9)).toBe(3);
  });

  it("returns 2 diamonds for score 70–79.9", () => {
    expect(scoreToDiamondRating(70)).toBe(2);
    expect(scoreToDiamondRating(79.9)).toBe(2);
  });

  it("returns 1 diamond for score < 70", () => {
    expect(scoreToDiamondRating(69.9)).toBe(1);
    expect(scoreToDiamondRating(0)).toBe(1);
  });
});

// ─── Cert ID format validation ────────────────────────────────────────────────

describe("certId format", () => {
  it("matches DI-XXXX-XXXX pattern", () => {
    const certIdPattern = /^DI-[0-9]{4}-[0-9]{4}$/;
    expect(certIdPattern.test("DI-1234-5678")).toBe(true);
    expect(certIdPattern.test("DI-0000-0001")).toBe(true);
    expect(certIdPattern.test("DI-9999-9999")).toBe(true);
  });

  it("rejects invalid cert ID formats", () => {
    const certIdPattern = /^DI-[0-9]{4}-[0-9]{4}$/;
    expect(certIdPattern.test("DI-123-5678")).toBe(false);
    expect(certIdPattern.test("DI24-00012345")).toBe(false);
    expect(certIdPattern.test("")).toBe(false);
  });
});
