/**
 * GradingBreakdownModal — Full grading detail overlay
 *
 * Opens when user clicks "View Full Breakdown" on the Card Detail page.
 * Shows per-category scores with sub-criteria, visual bars, diamond ratings,
 * and grading methodology notes.
 *
 * Design: Dark navy, financial-grade. Matches CardProfile aesthetic exactly.
 */

import { useEffect, useRef } from "react";
import { DIAMOND_SINGLE } from "@/lib/diamondRating";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SubCriteria {
  name: string;
  score: number;
  note?: string;
}

export interface GradingCategory {
  name: string;
  score: number;
  weight: number; // percentage weight in final score
  diamonds: number; // 1–5
  description: string;
  subCriteria: SubCriteria[];
}

export interface GradingBreakdownData {
  certId: string;
  player: string;
  finalScore: number;
  condition: string;
  gradedBy: string;
  standard: string;
  gradedDate: string;
  categories: GradingCategory[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  data: GradingBreakdownData;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 96) return "rgba(99,155,255,0.95)";
  if (score >= 92) return "rgba(201,168,76,0.9)";
  if (score >= 85) return "rgba(148,163,184,0.75)";
  return "rgba(239,68,68,0.7)";
}

function scoreLabel(score: number): string {
  if (score >= 98) return "Pristine";
  if (score >= 95) return "Gem Mint";
  if (score >= 92) return "Mint";
  if (score >= 88) return "Near Mint";
  if (score >= 80) return "Excellent";
  return "Good";
}

function ScoreBar({
  score,
  height = 4,
  animated = true,
}: {
  score: number;
  height?: number;
  animated?: boolean;
}) {
  const color = score >= 95
    ? "linear-gradient(90deg, rgba(99,155,255,0.5), rgba(99,155,255,0.9))"
    : score >= 90
    ? "linear-gradient(90deg, rgba(201,168,76,0.5), rgba(201,168,76,0.9))"
    : "linear-gradient(90deg, rgba(148,163,184,0.3), rgba(148,163,184,0.65))";

  return (
    <div style={{
      height: `${height}px`,
      background: "rgba(255,255,255,0.06)",
      borderRadius: "3px",
      overflow: "hidden",
    }}>
      <div style={{
        height: "100%",
        width: `${score}%`,
        background: color,
        borderRadius: "3px",
        transition: animated ? "width 0.9s cubic-bezier(0.22,1,0.36,1)" : "none",
      }} />
    </div>
  );
}

function DiamondRow({ count, size = 18 }: { count: number; size?: number }) {
  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <img
          key={i}
          src={DIAMOND_SINGLE}
          alt="◆"
          width={i < count ? size : size - 3}
          height={i < count ? size : size - 3}
          style={{
            opacity: i < count ? 1 : 0.15,
            filter: i < count ? "drop-shadow(0 0 5px rgba(99,155,255,0.55))" : "none",
          }}
        />
      ))}
    </div>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────

function CategoryCard({ cat, index }: { cat: GradingCategory; index: number }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.065)",
      borderRadius: "6px",
      padding: "1.5rem",
      animationDelay: `${index * 60}ms`,
    }}>
      {/* Header row */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "1rem",
      }}>
        <div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "1rem",
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.9)",
            textTransform: "uppercase",
            marginBottom: "0.25rem",
          }}>
            {cat.name}
          </div>
          <div style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: "0.65rem",
            letterSpacing: "0.08em",
            color: "rgba(100,116,139,0.6)",
          }}>
            Weight: {cat.weight}% of final score
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "1.8rem",
            color: scoreColor(cat.score),
            lineHeight: 1,
            letterSpacing: "-0.01em",
          }}>
            {cat.score}
            <span style={{ fontSize: "0.5em", opacity: 0.6, marginLeft: "2px" }}>%</span>
          </div>
          <div style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: "0.6rem",
            letterSpacing: "0.1em",
            color: "rgba(100,116,139,0.55)",
            textTransform: "uppercase",
            marginTop: "2px",
          }}>
            {scoreLabel(cat.score)}
          </div>
        </div>
      </div>

      {/* Main score bar */}
      <ScoreBar score={cat.score} height={5} />

      {/* Diamond rating */}
      <div style={{ marginTop: "0.75rem", marginBottom: "1rem" }}>
        <DiamondRow count={cat.diamonds} size={16} />
      </div>

      {/* Description */}
      <div style={{
        fontFamily: "'Barlow', sans-serif",
        fontSize: "0.72rem",
        lineHeight: 1.55,
        color: "rgba(148,163,184,0.55)",
        marginBottom: "1.25rem",
      }}>
        {cat.description}
      </div>

      {/* Sub-criteria */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        paddingTop: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}>
        {cat.subCriteria.map(sub => (
          <div key={sub.name}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "4px",
            }}>
              <span style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.68rem",
                letterSpacing: "0.06em",
                color: "rgba(148,163,184,0.55)",
                textTransform: "uppercase",
              }}>
                {sub.name}
              </span>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600,
                fontSize: "0.85rem",
                color: scoreColor(sub.score),
              }}>
                {sub.score}%
              </span>
            </div>
            <ScoreBar score={sub.score} height={3} />
            {sub.note && (
              <div style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.62rem",
                color: "rgba(100,116,139,0.45)",
                marginTop: "3px",
                fontStyle: "italic",
              }}>
                {sub.note}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function GradingBreakdownModal({ open, onClose, data }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(4,8,20,0.88)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        overflowY: "auto",
        padding: "2rem 1rem 4rem",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>

      <div style={{
        width: "100%",
        maxWidth: "900px",
        background: "oklch(0.10 0.02 255)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "8px",
        overflow: "hidden",
        animation: "slideUp 0.25s cubic-bezier(0.22,1,0.36,1)",
        position: "relative",
      }}>

        {/* ── Modal Header ──────────────────────────────────────────────── */}
        <div style={{
          padding: "1.75rem 2rem 1.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          background: "rgba(255,255,255,0.015)",
        }}>
          <div>
            <div style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: "0.58rem",
              letterSpacing: "0.22em",
              color: "rgba(201,168,76,0.55)",
              textTransform: "uppercase",
              marginBottom: "0.4rem",
            }}>
              Full Grading Report · {data.certId}
            </div>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "1.5rem",
              letterSpacing: "0.06em",
              color: "#ffffff",
              textTransform: "uppercase",
              margin: 0,
              lineHeight: 1.1,
            }}>
              {data.player}
            </h2>
            <div style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: "0.7rem",
              color: "rgba(100,116,139,0.55)",
              marginTop: "0.3rem",
            }}>
              Graded {data.gradedDate} · {data.standard} Standard · {data.gradedBy}
            </div>
          </div>

          {/* Final score summary */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
          }}>
            <div style={{ textAlign: "right" }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                fontSize: "2.5rem",
                color: "rgba(99,155,255,0.95)",
                lineHeight: 1,
                letterSpacing: "-0.01em",
              }}>
                {data.finalScore}
                <span style={{ fontSize: "0.42em", opacity: 0.55, marginLeft: "3px" }}>%</span>
              </div>
              <div style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.62rem",
                letterSpacing: "0.12em",
                color: "rgba(99,155,255,0.5)",
                textTransform: "uppercase",
                marginTop: "2px",
              }}>
                {data.condition}
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close grading breakdown"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "4px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(148,163,184,0.6)",
                fontSize: "1.1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.8)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(148,163,184,0.6)";
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Orange accent line ─────────────────────────────────────────── */}
        <div style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(234,88,12,0.4) 30%, rgba(234,88,12,0.6) 50%, rgba(234,88,12,0.4) 70%, transparent)",
        }} />

        {/* ── Score summary strip ────────────────────────────────────────── */}
        <div style={{
          padding: "1.25rem 2rem",
          background: "rgba(255,255,255,0.015)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          gap: "0",
          overflowX: "auto",
        }}>
          {data.categories.map((cat, i) => (
            <div key={cat.name} style={{
              flex: 1,
              minWidth: "120px",
              padding: "0 1rem",
              borderRight: i < data.categories.length - 1
                ? "1px solid rgba(255,255,255,0.05)"
                : "none",
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.58rem",
                letterSpacing: "0.14em",
                color: "rgba(100,116,139,0.5)",
                textTransform: "uppercase",
                marginBottom: "0.3rem",
              }}>
                {cat.name}
              </div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "1.3rem",
                color: scoreColor(cat.score),
                lineHeight: 1,
              }}>
                {cat.score}%
              </div>
              <div style={{ marginTop: "0.4rem" }}>
                <ScoreBar score={cat.score} height={3} animated={false} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Category cards grid ────────────────────────────────────────── */}
        <div style={{
          padding: "2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
          gap: "1.25rem",
        }}>
          {data.categories.map((cat, i) => (
            <CategoryCard key={cat.name} cat={cat} index={i} />
          ))}
        </div>

        {/* ── Methodology footer ─────────────────────────────────────────── */}
        <div style={{
          margin: "0 2rem 2rem",
          padding: "1.25rem 1.5rem",
          background: "rgba(201,168,76,0.04)",
          border: "1px solid rgba(201,168,76,0.12)",
          borderRadius: "5px",
        }}>
          <div style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: "0.58rem",
            letterSpacing: "0.18em",
            color: "rgba(201,168,76,0.5)",
            textTransform: "uppercase",
            marginBottom: "0.5rem",
          }}>
            ◆ Grading Methodology
          </div>
          <div style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: "0.72rem",
            lineHeight: 1.6,
            color: "rgba(148,163,184,0.5)",
          }}>
            Diamond Index™ grades are produced using the VRC.7 verification and rating standard.
            Each category is evaluated independently by our certified grading engine across
            multiple sub-criteria. Scores are weighted and combined into a final composite score.
            All grades are immutably recorded and verifiable via Cert ID.
          </div>
        </div>

      </div>
    </div>
  );
}
