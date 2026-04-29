/**
 * EmailPreviewModal — Diamond Index™
 *
 * Shows a preview of the grading report email that gets sent to the card owner.
 * Includes: grade, diamonds, card images, full breakdown, and value.
 */

import { useEffect } from "react";
import { DIAMOND_ASSETS } from "@/lib/diamondRating";

interface CardData {
  id: string;
  player: string;
  year: string;
  brand: string;
  set: string;
  cardNumber: string;
  gradedDate: string;
  frontImage: string;
  finalScore: number;
  diamonds: number;
  condition: string;
  centering: {
    front: { left: number; right: number; score: number };
    back: { left: number; right: number; score: number };
    final: number;
  };
  categories: { name: string; weight: number; score: number; deduction: number }[];
  defects: { location: string; description: string; severity: string }[];
  marketValue: number;
  gradedValue: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  card: CardData;
}

const SEVERITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  none: { bg: "rgba(34,197,94,0.12)", text: "rgba(34,197,94,0.9)", label: "None" },
  light: { bg: "rgba(99,155,255,0.12)", text: "rgba(99,155,255,0.9)", label: "Light" },
  minor: { bg: "rgba(201,168,76,0.12)", text: "rgba(201,168,76,0.9)", label: "Minor" },
  major: { bg: "rgba(239,68,68,0.12)", text: "rgba(239,68,68,0.9)", label: "Major" },
};

export default function EmailPreviewModal({ open, onClose, card }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9100,
        background: "rgba(5,10,25,0.92)",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#0d1117",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: "6px",
          width: "100%",
          maxWidth: "640px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Modal header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600,
            fontSize: "0.7rem", letterSpacing: "0.18em",
            color: "rgba(201,168,76,0.7)", textTransform: "uppercase",
          }}>
            Email Preview — Grading Report
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button
              style={{
                background: "rgba(201,168,76,0.15)",
                border: "1px solid rgba(201,168,76,0.35)",
                borderRadius: "3px",
                padding: "0.4rem 1rem",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600, fontSize: "0.65rem",
                letterSpacing: "0.12em", color: "rgba(201,168,76,0.85)",
                textTransform: "uppercase", cursor: "pointer",
              }}
              onClick={() => alert("Email sending will be connected to your email service.")}
            >
              Send Email
            </button>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.06)", border: "none",
                borderRadius: "50%", width: "28px", height: "28px",
                color: "rgba(148,163,184,0.7)", cursor: "pointer",
                fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>
          </div>
        </div>

        {/* Email body preview */}
        <div style={{ padding: "0" }}>

          {/* Email top bar */}
          <div style={{
            background: "linear-gradient(135deg, #0a0f1e 0%, #0d1a35 100%)",
            padding: "2rem 2rem 1.5rem",
            borderBottom: "2px solid rgba(201,168,76,0.4)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{
                width: "32px", height: "32px",
                background: "rgba(201,168,76,0.15)",
                border: "1px solid rgba(201,168,76,0.3)",
                borderRadius: "4px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1rem", color: "rgba(201,168,76,0.9)",
              }}>◆</div>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ffffff", letterSpacing: "0.08em" }}>
                  DIAMOND INDEX™
                </div>
                <div style={{ fontSize: "0.6rem", color: "rgba(148,163,184,0.5)", letterSpacing: "0.1em" }}>
                  CERTIFICATION AUTHORITY
                </div>
              </div>
            </div>
            <div style={{ fontSize: "0.7rem", color: "rgba(148,163,184,0.5)", marginBottom: "0.4rem" }}>
              Your Grading Report is Ready
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", letterSpacing: "0.04em" }}>
              {card.player} · {card.year} {card.brand}
            </div>
            <div style={{ fontSize: "0.7rem", color: "rgba(148,163,184,0.5)", marginTop: "0.25rem" }}>
              Certification ID: {card.id} · Graded {card.gradedDate}
            </div>
          </div>

          {/* Score + diamonds */}
          <div style={{
            background: "#0f1520",
            padding: "1.75rem 2rem",
            display: "flex", alignItems: "center", gap: "2rem",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}>
            <div>
              <div style={{ fontSize: "3.5rem", fontWeight: 800, color: "#ffffff", lineHeight: 1, letterSpacing: "-0.02em" }}>
                {card.finalScore.toFixed(1)}<span style={{ fontSize: "1.2rem", color: "rgba(148,163,184,0.4)", fontWeight: 400 }}>%</span>
              </div>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(201,168,76,0.85)", letterSpacing: "0.15em", marginTop: "0.4rem", textTransform: "uppercase" }}>
                {card.condition} Condition
              </div>
            </div>
            <div>
              <div style={{ display: "flex", gap: "6px", marginBottom: "0.4rem" }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <img
                    key={i}
                    src={DIAMOND_ASSETS[1]}
                    alt=""
                    style={{
                      height: "28px", width: "auto",
                      opacity: i < card.diamonds ? 1 : 0.15,
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: "0.62rem", color: "rgba(100,116,139,0.6)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {card.diamonds} Diamond{card.diamonds !== 1 ? "s" : ""} · {card.condition}
              </div>
            </div>
          </div>

          {/* Card image */}
          <div style={{
            background: "#0a0f1e",
            padding: "1.5rem 2rem",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            textAlign: "center",
          }}>
            <img
              src={card.frontImage}
              alt={card.player}
              style={{
                height: "200px", width: "auto",
                borderRadius: "4px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              }}
            />
          </div>

          {/* Category scores */}
          <div style={{ background: "#0f1520", padding: "1.5rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.15em", color: "rgba(99,155,255,0.6)", textTransform: "uppercase", marginBottom: "1rem" }}>
              Category Breakdown
            </div>
            {card.categories.map(cat => (
              <div key={cat.name} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "0.5rem 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}>
                <span style={{ fontSize: "0.75rem", color: "rgba(148,163,184,0.75)" }}>{cat.name}</span>
                <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                  <span style={{ fontSize: "0.62rem", color: "rgba(100,116,139,0.5)" }}>{cat.weight}%</span>
                  <span style={{
                    fontSize: "0.85rem", fontWeight: 700,
                    color: cat.score >= 95 ? "rgba(34,197,94,0.85)" : cat.score >= 85 ? "#ffffff" : "rgba(201,168,76,0.85)",
                    minWidth: "3rem", textAlign: "right",
                  }}>{cat.score.toFixed(1)}</span>
                  <span style={{
                    fontSize: "0.72rem",
                    color: cat.deduction === 0 ? "rgba(34,197,94,0.6)" : "rgba(239,68,68,0.6)",
                    minWidth: "3rem", textAlign: "right",
                  }}>{cat.deduction === 0 ? "—" : cat.deduction.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Defects */}
          <div style={{ background: "#0a0f1e", padding: "1.5rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.15em", color: "rgba(99,155,255,0.6)", textTransform: "uppercase", marginBottom: "1rem" }}>
              Defect Log
            </div>
            {card.defects.map((d, i) => {
              const s = SEVERITY_COLORS[d.severity] || SEVERITY_COLORS.none;
              return (
                <div key={i} style={{
                  display: "flex", gap: "0.75rem", alignItems: "flex-start",
                  padding: "0.5rem 0",
                  borderBottom: i < card.defects.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}>
                  <span style={{
                    background: s.bg, borderRadius: "2px",
                    padding: "2px 7px", fontSize: "0.58rem",
                    fontWeight: 700, letterSpacing: "0.08em",
                    color: s.text, textTransform: "uppercase", whiteSpace: "nowrap",
                  }}>{s.label}</span>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "rgba(148,163,184,0.75)" }}>{d.description}</div>
                    <div style={{ fontSize: "0.62rem", color: "rgba(100,116,139,0.5)" }}>{d.location}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Value */}
          <div style={{
            background: "linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(201,168,76,0.02) 100%)",
            padding: "1.5rem 2rem",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}>
            <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.15em", color: "rgba(201,168,76,0.6)", textTransform: "uppercase", marginBottom: "1rem" }}>
              Calculated Value
            </div>
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "0.6rem", color: "rgba(100,116,139,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>Market</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "rgba(148,163,184,0.6)" }}>${card.marketValue.toLocaleString()}</div>
              </div>
              <div style={{ color: "rgba(100,116,139,0.4)", fontSize: "1rem" }}>×</div>
              <div>
                <div style={{ fontSize: "0.6rem", color: "rgba(100,116,139,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>Grade</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "rgba(148,163,184,0.6)" }}>{card.finalScore}%</div>
              </div>
              <div style={{ color: "rgba(100,116,139,0.4)", fontSize: "1rem" }}>=</div>
              <div>
                <div style={{ fontSize: "0.6rem", color: "rgba(201,168,76,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>Graded Value</div>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "rgba(201,168,76,0.95)" }}>${card.gradedValue.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            background: "#070c18",
            padding: "1.25rem 2rem",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "0.62rem", color: "rgba(100,116,139,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1.8 }}>
              Diamond Index™ Certification Authority<br />
              This report is certified and immutably logged.<br />
              <span style={{ color: "rgba(99,155,255,0.4)" }}>diamondindex.com</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
