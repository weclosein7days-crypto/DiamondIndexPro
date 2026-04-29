/**
 * GradingMethodologyModal — Diamond Index™
 *
 * Explains HOW grading works:
 * - 5 criteria (centering, edges, corners, surface, eye appeal)
 * - How scores are calculated
 * - How diamonds are assigned
 * - What "Not Gradeable" means
 */

import { useEffect, useState } from "react";
import GradingReportModal from "@/components/GradingReportModal";

interface Props {
  open: boolean;
  onClose: () => void;
}


const CRITERIA = [
  {
    name: "Centering",
    weight: "40%",
    icon: "⊕",
    color: "rgba(99,155,255,0.9)",
    description: "Front and back alignment measured independently. Both left/right and top/bottom ratios are evaluated. Perfect centering = 50/50.",
    detail: "Front centering is weighted 60%, back 40%. Any deviation beyond 55/45 begins deducting points.",
  },
  {
    name: "Edges",
    weight: "15%",
    icon: "▭",
    color: "rgba(148,163,184,0.9)",
    description: "All four edges examined under magnification for chips, nicks, roughness, or print defects.",
    detail: "Each edge is scored independently. A single major chip can reduce the edge score by up to 30%.",
  },
  {
    name: "Corners",
    weight: "15%",
    icon: "◻",
    color: "rgba(148,163,184,0.9)",
    description: "All four corners inspected for fraying, wear, or bending. Corners are the most common point of damage.",
    detail: "Corner wear is categorized as: sharp, light wear, moderate wear, or heavy wear.",
  },
  {
    name: "Surface",
    weight: "20%",
    icon: "◈",
    color: "rgba(99,155,255,0.75)",
    description: "Front and back surfaces checked for scratches, print lines, stains, or factory defects.",
    detail: "Surface defects are classified by severity. Print lines from manufacturing are noted but weighted less than post-production scratches.",
  },
  {
    name: "Eye Appeal",
    weight: "10%",
    icon: "◉",
    color: "rgba(201,168,76,0.85)",
    description: "Overall visual impression of the card — color vibrancy, gloss, and presentation quality.",
    detail: "Eye appeal is the only subjective category. It reflects the card's overall presentation as a collectible.",
  },
];

const SCALE = [
  { diamonds: 5, rank: "Pristine", range: "97–100", color: "rgba(201,168,76,0.95)" },
  { diamonds: 4, rank: "Elite", range: "93–96", color: "rgba(201,168,76,0.7)" },
  { diamonds: 3, rank: "Superior", range: "89–92", color: "#ffffff" },
  { diamonds: 2, rank: "Premium", range: "85–88", color: "rgba(148,163,184,0.85)" },
  { diamonds: 1, rank: "Standard", range: "80–84", color: "rgba(148,163,184,0.65)" },
  { diamonds: 0, rank: "Not Gradeable", range: "Below 80", color: "rgba(239,68,68,0.75)" },
];

export default function GradingMethodologyModal({ open, onClose }: Props) {
  const [sampleOpen, setSampleOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(5,10,25,0.88)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "oklch(0.12 0.025 255)",
          border: "1px solid rgba(99,155,255,0.15)",
          borderRadius: "6px",
          width: "100%",
          maxWidth: "780px",
          maxHeight: "88vh",
          overflowY: "auto",
          position: "relative",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "1.25rem", right: "1.25rem",
            background: "rgba(255,255,255,0.06)", border: "none",
            borderRadius: "50%", width: "32px", height: "32px",
            color: "rgba(148,163,184,0.8)", cursor: "pointer",
            fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >✕</button>

        <div style={{ padding: "2.25rem 2.5rem" }}>

          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={{
              fontFamily: "'Barlow', sans-serif", fontSize: "0.6rem",
              letterSpacing: "0.2em", color: "rgba(201,168,76,0.7)",
              textTransform: "uppercase", marginBottom: "0.5rem",
            }}>
              Diamond Index™ · Grading Methodology
            </div>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: "1.6rem", letterSpacing: "0.06em",
              color: "#ffffff", textTransform: "uppercase", margin: 0,
            }}>
              How Grading Works
            </h2>
            <p style={{
              fontFamily: "'Barlow', sans-serif", fontWeight: 300,
              fontSize: "0.85rem", color: "rgba(148,163,184,0.7)",
              marginTop: "0.5rem", lineHeight: 1.6,
            }}>
              Every card is evaluated across five measurable criteria. Each criterion carries a defined weight. The final score determines the diamond rating.
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(99,155,255,0.2), transparent)", marginBottom: "2rem" }} />

          {/* 5 Criteria */}
          <div style={{ marginBottom: "2.5rem" }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600,
              fontSize: "0.7rem", letterSpacing: "0.18em",
              color: "rgba(99,155,255,0.7)", textTransform: "uppercase",
              marginBottom: "1.25rem",
            }}>
              The Five Grading Criteria
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {CRITERIA.map((c, i) => (
                <div
                  key={c.name}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2.5rem 1fr auto",
                    gap: "1rem",
                    alignItems: "start",
                    padding: "1.1rem 0",
                    borderBottom: i < CRITERIA.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}
                >
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "1.1rem", color: c.color,
                    textAlign: "center", paddingTop: "2px",
                  }}>{c.icon}</div>
                  <div>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                      fontSize: "0.85rem", letterSpacing: "0.1em",
                      color: "#ffffff", textTransform: "uppercase", marginBottom: "3px",
                    }}>{c.name}</div>
                    <div style={{
                      fontFamily: "'Barlow', sans-serif", fontWeight: 300,
                      fontSize: "0.78rem", color: "rgba(148,163,184,0.75)",
                      lineHeight: 1.55,
                    }}>{c.description}</div>
                    <div style={{
                      fontFamily: "'Barlow', sans-serif", fontWeight: 300,
                      fontSize: "0.72rem", color: "rgba(100,116,139,0.6)",
                      lineHeight: 1.5, marginTop: "4px",
                    }}>{c.detail}</div>
                  </div>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                    fontSize: "1rem", color: c.color,
                    textAlign: "right", whiteSpace: "nowrap",
                  }}>{c.weight}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scoring math */}
          <div style={{
            background: "rgba(99,155,255,0.05)",
            border: "1px solid rgba(99,155,255,0.12)",
            borderRadius: "4px",
            padding: "1.25rem 1.5rem",
            marginBottom: "2rem",
          }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600,
              fontSize: "0.7rem", letterSpacing: "0.18em",
              color: "rgba(99,155,255,0.7)", textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}>
              Score Calculation
            </div>
            <div style={{
              fontFamily: "'Barlow', sans-serif", fontWeight: 300,
              fontSize: "0.82rem", color: "rgba(148,163,184,0.8)",
              lineHeight: 1.7,
            }}>
              Each criterion starts at <strong style={{ color: "#ffffff" }}>100 points</strong>. Defects, misalignment, and wear cause deductions based on severity. The weighted average of all five criteria produces the final score. Scores are expressed as a percentage (0–100).
            </div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.78rem", color: "rgba(100,116,139,0.6)",
              marginTop: "0.6rem",
            }}>
              Final Score = (Centering × 0.40) + (Edges × 0.15) + (Corners × 0.15) + (Surface × 0.20) + (Eye Appeal × 0.10)
            </div>
          </div>

          {/* Diamond scale */}
          <div style={{ marginBottom: "0.5rem" }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600,
              fontSize: "0.7rem", letterSpacing: "0.18em",
              color: "rgba(201,168,76,0.7)", textTransform: "uppercase",
              marginBottom: "1rem",
            }}>
              Diamond Rating Scale
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
              {SCALE.map(s => (
                <div
                  key={s.rank}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${s.diamonds === 5 ? "rgba(201,168,76,0.25)" : s.diamonds === 0 ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)"}`,
                    borderRadius: "3px",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                  }}
                >
                  <span style={{ fontSize: "0.9rem", color: s.color, minWidth: "1.2rem" }}>
                    {s.diamonds === 0 ? "✕" : "♦".repeat(s.diamonds)}
                  </span>
                  <div>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                      fontSize: "0.78rem", letterSpacing: "0.08em",
                      color: s.color, textTransform: "uppercase",
                    }}>{s.rank}</div>
                    <div style={{
                      fontFamily: "'Barlow', sans-serif", fontSize: "0.62rem",
                      color: "rgba(100,116,139,0.6)", letterSpacing: "0.06em",
                    }}>{s.range}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sample report link */}
          <div style={{ textAlign: "center", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <button
              onClick={() => setSampleOpen(true)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600,
                fontSize: "0.72rem",
                letterSpacing: "0.15em",
                color: "rgba(201,168,76,0.65)",
                textTransform: "uppercase",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
                transition: "color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(201,168,76,1)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(201,168,76,0.65)")}
            >
              ◆ View Sample Grading Report →
            </button>
          </div>

        </div>
      </div>
    </div>
    <GradingReportModal open={sampleOpen} onClose={() => setSampleOpen(false)} />
    </>
  );
}
