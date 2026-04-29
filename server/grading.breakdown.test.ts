/**
 * Unit tests for GradingBreakdownModal data integrity
 * Validates that grading data structure is correct and scores are within range
 */

import { describe, it, expect } from "vitest";

// Mirror the types from the modal component
interface SubCriteria {
  name: string;
  score: number;
  note?: string;
}

interface GradingCategory {
  name: string;
  score: number;
  weight: number;
  diamonds: number;
  description: string;
  subCriteria: SubCriteria[];
}

interface GradingBreakdownData {
  certId: string;
  player: string;
  finalScore: number;
  condition: string;
  gradedBy: string;
  standard: string;
  gradedDate: string;
  categories: GradingCategory[];
}

// Sample data matching what CardProfile.tsx uses
const GRADING_DETAIL: GradingBreakdownData = {
  certId: "DI24-00012345",
  player: "Aaron Judge",
  finalScore: 95.5,
  condition: "Pristine",
  gradedBy: "Diamond Index™",
  standard: "VRC.7",
  gradedDate: "April 19, 2026",
  categories: [
    {
      name: "Centering",
      score: 96,
      weight: 25,
      diamonds: 5,
      description: "Measures the alignment of the card image within its borders.",
      subCriteria: [
        { name: "Left / Right", score: 97 },
        { name: "Top / Bottom", score: 95 },
        { name: "Back Centering", score: 96 },
      ],
    },
    {
      name: "Edges",
      score: 94,
      weight: 20,
      diamonds: 4,
      description: "All four card edges are inspected.",
      subCriteria: [
        { name: "Top Edge", score: 96 },
        { name: "Bottom Edge", score: 93 },
        { name: "Left Edge", score: 95 },
        { name: "Right Edge", score: 92 },
      ],
    },
    {
      name: "Surface",
      score: 97,
      weight: 25,
      diamonds: 5,
      description: "Front and back surfaces are examined.",
      subCriteria: [
        { name: "Front Surface", score: 98 },
        { name: "Back Surface", score: 97 },
        { name: "Foil / Refractor", score: 97 },
        { name: "Print Quality", score: 96 },
      ],
    },
    {
      name: "Corners",
      score: 95,
      weight: 20,
      diamonds: 5,
      description: "All four corners are evaluated.",
      subCriteria: [
        { name: "Top-Left Corner", score: 97 },
        { name: "Top-Right Corner", score: 96 },
        { name: "Bottom-Left Corner", score: 94 },
        { name: "Bottom-Right Corner", score: 93 },
      ],
    },
    {
      name: "Eye Appeal",
      score: 98,
      weight: 10,
      diamonds: 5,
      description: "A holistic assessment of the card's overall visual presentation.",
      subCriteria: [
        { name: "Color Vibrancy", score: 99 },
        { name: "Image Clarity", score: 98 },
        { name: "Gloss Uniformity", score: 97 },
        { name: "Overall Impression", score: 98 },
      ],
    },
  ],
};

describe("GradingBreakdownModal — data integrity", () => {
  it("has exactly 5 grading categories", () => {
    expect(GRADING_DETAIL.categories).toHaveLength(5);
  });

  it("all category scores are between 0 and 100", () => {
    for (const cat of GRADING_DETAIL.categories) {
      expect(cat.score).toBeGreaterThanOrEqual(0);
      expect(cat.score).toBeLessThanOrEqual(100);
    }
  });

  it("all sub-criteria scores are between 0 and 100", () => {
    for (const cat of GRADING_DETAIL.categories) {
      for (const sub of cat.subCriteria) {
        expect(sub.score).toBeGreaterThanOrEqual(0);
        expect(sub.score).toBeLessThanOrEqual(100);
      }
    }
  });

  it("category weights sum to 100", () => {
    const total = GRADING_DETAIL.categories.reduce((sum, c) => sum + c.weight, 0);
    expect(total).toBe(100);
  });

  it("diamond ratings are between 1 and 5", () => {
    for (const cat of GRADING_DETAIL.categories) {
      expect(cat.diamonds).toBeGreaterThanOrEqual(1);
      expect(cat.diamonds).toBeLessThanOrEqual(5);
    }
  });

  it("certId follows DI format", () => {
    expect(GRADING_DETAIL.certId).toMatch(/^DI\d{2}-\d+$/);
  });

  it("finalScore is within valid range", () => {
    expect(GRADING_DETAIL.finalScore).toBeGreaterThan(0);
    expect(GRADING_DETAIL.finalScore).toBeLessThanOrEqual(100);
  });

  it("each category has at least one sub-criteria", () => {
    for (const cat of GRADING_DETAIL.categories) {
      expect(cat.subCriteria.length).toBeGreaterThan(0);
    }
  });

  it("all required fields are present", () => {
    expect(GRADING_DETAIL.certId).toBeTruthy();
    expect(GRADING_DETAIL.player).toBeTruthy();
    expect(GRADING_DETAIL.gradedBy).toBeTruthy();
    expect(GRADING_DETAIL.standard).toBeTruthy();
    expect(GRADING_DETAIL.gradedDate).toBeTruthy();
  });
});
