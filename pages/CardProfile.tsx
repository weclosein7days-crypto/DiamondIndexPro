/**
 * CardProfile — Diamond Index™ Card Detail Page ("Money Page")
 *
 * Product model: Grading Intelligence + Verification + Vault System
 * NOT a marketplace. NOT selling cards.
 *
 * Sections:
 *  1. Above the fold — Slab (60%) + Score / Quick Stats / CTAs (40%)
 *  2. Verification — Primary trust signal
 *  3. Full Grading Breakdown — Credibility layer
 *  4. Vault — Ownership tracking, digital storage
 *  5. Master Grader Referral — Physical slab pathway
 *  6. Market Insight — Inform, not transact
 *
 * Design: Dark navy, premium, financial-grade. Clean. Fast. Obvious.
 */

import { useState } from "react";
import { Link } from "wouter";
import { DIAMOND_SINGLE } from "@/lib/diamondRating";
import GradingBreakdownModal, { type GradingBreakdownData } from "@/components/GradingBreakdownModal";

// ─── Detailed grading data for the modal ────────────────────────────────────
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
      description: "Measures the alignment of the card image within its borders. Both front-to-back and left-to-right centering are evaluated independently using precision optical measurement.",
      subCriteria: [
        { name: "Left / Right", score: 97, note: "97/3 split — near-perfect horizontal alignment" },
        { name: "Top / Bottom", score: 95, note: "95/5 split — minimal vertical variance" },
        { name: "Back Centering", score: 96, note: "Reverse side mirrors front within tolerance" },
      ],
    },
    {
      name: "Edges",
      score: 94,
      weight: 20,
      diamonds: 4,
      description: "All four card edges are inspected for nicks, chips, roughness, and print line integrity. Even minor edge wear can significantly impact grade.",
      subCriteria: [
        { name: "Top Edge", score: 96, note: "Clean, sharp — no visible nicks" },
        { name: "Bottom Edge", score: 93, note: "One micro-nick at 3mm from corner" },
        { name: "Left Edge", score: 95, note: "Smooth, consistent print line" },
        { name: "Right Edge", score: 92, note: "Slight roughness mid-edge, within tolerance" },
      ],
    },
    {
      name: "Surface",
      score: 97,
      weight: 25,
      diamonds: 5,
      description: "Front and back surfaces are examined under controlled lighting for scratches, print defects, staining, and foil integrity. Refractor surfaces receive additional prismatic inspection.",
      subCriteria: [
        { name: "Front Surface", score: 98, note: "No visible scratches or print defects" },
        { name: "Back Surface", score: 97, note: "Clean, no staining" },
        { name: "Foil / Refractor", score: 97, note: "Full prismatic integrity — no delamination" },
        { name: "Print Quality", score: 96, note: "Sharp registration, no bleed" },
      ],
    },
    {
      name: "Corners",
      score: 95,
      weight: 20,
      diamonds: 5,
      description: "All four corners are evaluated under 10x magnification for fraying, rounding, and tip integrity. Corners are the most common site of wear on handled cards.",
      subCriteria: [
        { name: "Top-Left Corner", score: 97, note: "Sharp, no fraying" },
        { name: "Top-Right Corner", score: 96, note: "Sharp, minimal tip wear" },
        { name: "Bottom-Left Corner", score: 94, note: "Very slight rounding — sub-pixel level" },
        { name: "Bottom-Right Corner", score: 93, note: "Micro-fray, visible at 10x only" },
      ],
    },
    {
      name: "Eye Appeal",
      score: 98,
      weight: 10,
      diamonds: 5,
      description: "A holistic assessment of the card's overall visual presentation. Considers color vibrancy, image clarity, gloss uniformity, and the overall impression of the card as a collectible.",
      subCriteria: [
        { name: "Color Vibrancy", score: 99, note: "Exceptional refractor color pop" },
        { name: "Image Clarity", score: 98, note: "Sharp focus, no blur" },
        { name: "Gloss Uniformity", score: 97, note: "Even finish across full surface" },
        { name: "Overall Impression", score: 98, note: "High-impact presentation" },
      ],
    },
  ],
};

// ─── Card data (sample — will be replaced by tRPC query) ────────────────────
const CARD = {
  certId: "DI24-00012345",
  player: "Aaron Judge",
  year: "2024",
  brand: "Topps Chrome Update",
  set: "#USC1 · Refractor",
  gradedDate: "April 19, 2026",
  gradedBy: "Diamond Index™",
  standard: "VRC.7",

  slabImage: "/manus-storage/final-slab-front_6e5590e7.png",
  frontImage: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600&q=80",

  finalScore: 95.5,
  diamonds: 5,
  condition: "Pristine",

  quickStats: [
    { name: "Centering", score: 96 },
    { name: "Edges", score: 94 },
    { name: "Surface", score: 97 },
  ],

  categories: [
    { name: "Centering", score: 96 },
    { name: "Edges", score: 94 },
    { name: "Surface", score: 97 },
    { name: "Corners", score: 95 },
    { name: "Eye Appeal", score: 98 },
  ],

  vault: {
    status: "In Vault",
    owner: "Verified",
    since: "April 19, 2026",
  },

  market: {
    low: 185,
    high: 225,
    lastSale: 210,
    trend: "+8%",
    trendDir: "up" as "up" | "down",
    trendPeriod: "7d",
    confidence: "High",
    activity: "Active",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  return (
    <div style={{
      height: "3px",
      background: "rgba(255,255,255,0.06)",
      borderRadius: "2px",
      overflow: "hidden",
      marginTop: "6px",
    }}>
      <div style={{
        height: "100%",
        width: `${score}%`,
        background: score >= 95
          ? "linear-gradient(90deg, rgba(99,155,255,0.6), rgba(99,155,255,0.9))"
          : score >= 90
          ? "linear-gradient(90deg, rgba(201,168,76,0.6), rgba(201,168,76,0.9))"
          : "linear-gradient(90deg, rgba(148,163,184,0.4), rgba(148,163,184,0.7))",
        borderRadius: "2px",
        transition: "width 0.8s ease",
      }} />
    </div>
  );
}

function DiamondRow({ count }: { count: number }) {
  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <img
          key={i}
          src={DIAMOND_SINGLE}
          alt="◆"
          width={i < count ? 22 : 18}
          height={i < count ? 22 : 18}
          style={{
            opacity: i < count ? 1 : 0.18,
            filter: i < count ? "drop-shadow(0 0 6px rgba(99,155,255,0.6))" : "none",
            transition: "all 0.3s",
          }}
        />
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'Barlow', sans-serif",
      fontSize: "0.58rem",
      letterSpacing: "0.22em",
      color: "rgba(201,168,76,0.55)",
      textTransform: "uppercase",
      marginBottom: "1.1rem",
    }}>
      {children}
    </div>
  );
}

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.065)",
      borderRadius: "6px",
      padding: "1.75rem 2rem",
      ...style,
    }}>
      {children}
    </div>
  );
}

function ActionButton({
  children,
  variant = "default",
  onClick,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "default";
  onClick?: () => void;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: "rgba(99,155,255,0.15)",
      border: "1px solid rgba(99,155,255,0.4)",
      color: "rgba(99,155,255,0.95)",
    },
    secondary: {
      background: "rgba(201,168,76,0.1)",
      border: "1px solid rgba(201,168,76,0.35)",
      color: "rgba(201,168,76,0.9)",
    },
    ghost: {
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "rgba(148,163,184,0.75)",
    },
    default: {
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "rgba(148,163,184,0.75)",
    },
  };

  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 600,
        fontSize: "0.72rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        padding: "0.7rem 1.4rem",
        borderRadius: "3px",
        cursor: "pointer",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
        ...styles[variant],
      }}
    >
      {children}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CardProfile() {
  const [verifyToast, setVerifyToast] = useState(false);
  const [vaultToast, setVaultToast] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const showToast = (setter: (v: boolean) => void) => {
    setter(true);
    setTimeout(() => setter(false), 3000);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "oklch(0.09 0.02 255)",
      paddingTop: "4.5rem",
      paddingBottom: "6rem",
    }}>
      <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "0 2rem" }}>

        {/* ── Back nav ─────────────────────────────────────────────────── */}
        <div style={{ marginBottom: "2rem" }}>
          <Link href="/">
            <a style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: "0.68rem",
              letterSpacing: "0.12em",
              color: "rgba(99,155,255,0.6)",
              textDecoration: "none",
              textTransform: "uppercase",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}>
              ← Back to Home
            </a>
          </Link>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 1 — ABOVE THE FOLD
            Left 60%: Slab image
            Right 40%: Score + quick stats + CTAs
        ══════════════════════════════════════════════════════════════════ */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "60% 1fr",
          gap: "3rem",
          alignItems: "start",
          marginBottom: "3rem",
        }}>

          {/* LEFT — Slab image */}
          <div>
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem",
              minHeight: "380px",
            }}>
              <img
                src={CARD.slabImage}
                alt={`${CARD.player} graded slab`}
                style={{
                  maxWidth: "100%",
                  maxHeight: "420px",
                  objectFit: "contain",
                  display: "block",
                  filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.5))",
                }}
              />
            </div>
            <div style={{
              marginTop: "0.75rem",
              display: "flex",
              justifyContent: "center",
              gap: "1.5rem",
            }}>
              <span style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.62rem",
                letterSpacing: "0.1em",
                color: "rgba(100,116,139,0.55)",
                textTransform: "uppercase",
              }}>
                Click to zoom
              </span>
            </div>
          </div>

          {/* RIGHT — Score + info + CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingTop: "0.5rem" }}>

            {/* Cert ID */}
            <div style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: "0.58rem",
              letterSpacing: "0.2em",
              color: "rgba(201,168,76,0.55)",
              textTransform: "uppercase",
            }}>
              Cert ID: {CARD.certId}
            </div>

            {/* Player title */}
            <div>
              <h1 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                letterSpacing: "0.04em",
                color: "#ffffff",
                textTransform: "uppercase",
                margin: "0 0 0.3rem",
                lineHeight: 1.1,
              }}>
                {CARD.player}
              </h1>
              <div style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: "0.82rem",
                color: "rgba(148,163,184,0.55)",
                letterSpacing: "0.04em",
              }}>
                {CARD.year} {CARD.brand} · {CARD.set}
              </div>
            </div>

            {/* Big score */}
            <Panel style={{ padding: "1.5rem" }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(3rem, 6vw, 4.5rem)",
                color: "#ffffff",
                lineHeight: 1,
                marginBottom: "0.5rem",
                letterSpacing: "-0.01em",
              }}>
                {CARD.finalScore}
                <span style={{ fontSize: "0.45em", color: "rgba(148,163,184,0.5)", marginLeft: "0.15em" }}>%</span>
              </div>
              <DiamondRow count={CARD.diamonds} />
              <div style={{
                marginTop: "0.6rem",
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.68rem",
                letterSpacing: "0.12em",
                color: "rgba(99,155,255,0.65)",
                textTransform: "uppercase",
              }}>
                {CARD.condition}
              </div>
            </Panel>

            {/* Quick stats */}
            <div>
              <SectionLabel>Top Scores</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {CARD.quickStats.map(stat => (
                  <div key={stat.name}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}>
                      <span style={{
                        fontFamily: "'Barlow', sans-serif",
                        fontSize: "0.72rem",
                        letterSpacing: "0.06em",
                        color: "rgba(148,163,184,0.65)",
                        textTransform: "uppercase",
                      }}>
                        {stat.name}
                      </span>
                      <span style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "rgba(255,255,255,0.85)",
                      }}>
                        {stat.score}%
                      </span>
                    </div>
                    <ScoreBar score={stat.score} />
                  </div>
                ))}
              </div>
            </div>

            {/* CTA buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <ActionButton
                variant="primary"
                onClick={() => showToast(setVerifyToast)}
              >
                ✓ Verify This Card
              </ActionButton>
              <ActionButton variant="secondary" onClick={() => setBreakdownOpen(true)}>
                ◆ View Full Breakdown
              </ActionButton>
              <ActionButton
                variant="ghost"
                onClick={() => showToast(setVaultToast)}
              >
                ⊞ Add to My Vault
              </ActionButton>
            </div>

          </div>
        </div>

        {/* Orange accent divider */}
        <div style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(234,88,12,0.35) 30%, rgba(234,88,12,0.55) 50%, rgba(234,88,12,0.35) 70%, transparent)",
          marginBottom: "3rem",
        }} />

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 2 — VERIFICATION (Primary trust signal)
        ══════════════════════════════════════════════════════════════════ */}
        <Panel style={{ marginBottom: "2rem" }}>
          <SectionLabel>Verification</SectionLabel>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr auto",
            gap: "2rem",
            alignItems: "center",
          }}>
            {/* Verified badge */}
            <div>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem",
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: "4px",
                padding: "0.6rem 1rem",
                marginBottom: "0.75rem",
              }}>
                <span style={{ color: "rgba(34,197,94,0.9)", fontSize: "1rem" }}>✓</span>
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  letterSpacing: "0.12em",
                  color: "rgba(34,197,94,0.9)",
                  textTransform: "uppercase",
                }}>
                  Verified by Diamond Index™
                </span>
              </div>
              <div style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.7rem",
                color: "rgba(100,116,139,0.65)",
              }}>
                Authenticated via VRC.7 standard
              </div>
            </div>

            {/* Cert ID */}
            <div>
              <div style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.58rem",
                letterSpacing: "0.16em",
                color: "rgba(100,116,139,0.5)",
                textTransform: "uppercase",
                marginBottom: "0.3rem",
              }}>
                Cert ID
              </div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600,
                fontSize: "1rem",
                color: "rgba(201,168,76,0.85)",
                letterSpacing: "0.05em",
              }}>
                {CARD.certId}
              </div>
            </div>

            {/* Scan activity */}
            <div>
              <div style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.58rem",
                letterSpacing: "0.16em",
                color: "rgba(100,116,139,0.5)",
                textTransform: "uppercase",
                marginBottom: "0.3rem",
              }}>
                Scan Activity
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{
                  width: "7px", height: "7px",
                  borderRadius: "50%",
                  background: "rgba(34,197,94,0.85)",
                  boxShadow: "0 0 6px rgba(34,197,94,0.5)",
                }} />
                <span style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: "0.78rem",
                  color: "rgba(148,163,184,0.8)",
                }}>
                  Live · Last scan 2 min ago
                </span>
              </div>
            </div>

            {/* Verify CTA */}
            <div>
              <Link href={`/verify/${CARD.certId}`}>
                <a style={{ textDecoration: "none" }}>
                  <ActionButton variant="primary">
                    Open Cert Page →
                  </ActionButton>
                </a>
              </Link>
            </div>
          </div>
        </Panel>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 3 — FULL GRADING BREAKDOWN
        ══════════════════════════════════════════════════════════════════ */}
        <Panel style={{ marginBottom: "2rem" }}>
          <SectionLabel>Grading Breakdown</SectionLabel>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "1.5rem",
          }}>
            {CARD.categories.map(cat => (
              <div key={cat.name} style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "4px",
                padding: "1.1rem 1rem",
                textAlign: "center",
              }}>
                {/* Diamond icon */}
                <img
                  src={DIAMOND_SINGLE}
                  alt="◆"
                  width={20}
                  height={20}
                  style={{
                    opacity: 0.7,
                    marginBottom: "0.6rem",
                    filter: "drop-shadow(0 0 4px rgba(99,155,255,0.4))",
                  }}
                />
                {/* Category name */}
                <div style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: "0.6rem",
                  letterSpacing: "0.14em",
                  color: "rgba(100,116,139,0.6)",
                  textTransform: "uppercase",
                  marginBottom: "0.4rem",
                }}>
                  {cat.name}
                </div>
                {/* Score */}
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: "1.6rem",
                  color: cat.score >= 95 ? "rgba(255,255,255,0.92)" : "rgba(201,168,76,0.85)",
                  lineHeight: 1,
                  marginBottom: "0.5rem",
                }}>
                  {cat.score}
                  <span style={{ fontSize: "0.55em", color: "rgba(148,163,184,0.4)" }}>%</span>
                </div>
                <ScoreBar score={cat.score} />
              </div>
            ))}
          </div>

          {/* Methodology note */}
          <div style={{
            marginTop: "1.25rem",
            textAlign: "right",
          }}>
            <span style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: "0.62rem",
              letterSpacing: "0.1em",
              color: "rgba(99,155,255,0.45)",
              textTransform: "uppercase",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              cursor: "pointer",
            }}>
              ◆ How scores are calculated
            </span>
          </div>
        </Panel>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 4 — VAULT
        ══════════════════════════════════════════════════════════════════ */}
        <Panel style={{ marginBottom: "2rem" }}>
          <SectionLabel>Vault</SectionLabel>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr auto",
            gap: "2rem",
            alignItems: "center",
          }}>
            {/* Status */}
            <div>
              <div style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.58rem",
                letterSpacing: "0.16em",
                color: "rgba(100,116,139,0.5)",
                textTransform: "uppercase",
                marginBottom: "0.4rem",
              }}>
                Vault Status
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{
                  width: "7px", height: "7px",
                  borderRadius: "50%",
                  background: "rgba(99,155,255,0.85)",
                  boxShadow: "0 0 6px rgba(99,155,255,0.4)",
                }} />
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: "rgba(148,163,184,0.85)",
                  letterSpacing: "0.05em",
                }}>
                  {CARD.vault.status}
                </span>
              </div>
            </div>

            {/* Owner */}
            <div>
              <div style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.58rem",
                letterSpacing: "0.16em",
                color: "rgba(100,116,139,0.5)",
                textTransform: "uppercase",
                marginBottom: "0.4rem",
              }}>
                Owner
              </div>
              <div style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.78rem",
                color: "rgba(34,197,94,0.8)",
              }}>
                ✓ {CARD.vault.owner}
              </div>
            </div>

            {/* Since */}
            <div>
              <div style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.58rem",
                letterSpacing: "0.16em",
                color: "rgba(100,116,139,0.5)",
                textTransform: "uppercase",
                marginBottom: "0.4rem",
              }}>
                Vaulted Since
              </div>
              <div style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.78rem",
                color: "rgba(148,163,184,0.65)",
              }}>
                {CARD.vault.since}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.6rem" }}>
              <ActionButton
                variant="ghost"
                onClick={() => showToast(setVaultToast)}
              >
                Transfer Ownership
              </ActionButton>
              <Link href="/vault">
                <a style={{ textDecoration: "none" }}>
                  <ActionButton variant="secondary">
                    My Vault →
                  </ActionButton>
                </a>
              </Link>
            </div>
          </div>

          {/* Vault feature callouts */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
            marginTop: "1.5rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}>
            {[
              { icon: "⊞", label: "Digital Storage", desc: "Your card, stored securely in the Diamond Index vault" },
              { icon: "◎", label: "Ownership Tracking", desc: "Full chain-of-custody record, immutable and verified" },
              { icon: "◈", label: "Collection Building", desc: "Organize, track, and grow your graded collection" },
            ].map(item => (
              <div key={item.label} style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "flex-start",
              }}>
                <span style={{
                  fontSize: "1rem",
                  color: "rgba(99,155,255,0.5)",
                  marginTop: "1px",
                  flexShrink: 0,
                }}>
                  {item.icon}
                </span>
                <div>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    letterSpacing: "0.08em",
                    color: "rgba(148,163,184,0.8)",
                    textTransform: "uppercase",
                    marginBottom: "0.2rem",
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: "0.7rem",
                    color: "rgba(100,116,139,0.55)",
                    lineHeight: 1.5,
                  }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 5 — MASTER GRADER REFERRAL
        ══════════════════════════════════════════════════════════════════ */}
        <div style={{
          background: "rgba(201,168,76,0.04)",
          border: "1px solid rgba(201,168,76,0.15)",
          borderRadius: "6px",
          padding: "1.75rem 2rem",
          marginBottom: "2rem",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "2rem",
          alignItems: "center",
        }}>
          <div>
            <SectionLabel>Physical Grading</SectionLabel>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "1.15rem",
              letterSpacing: "0.04em",
              color: "rgba(201,168,76,0.9)",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}>
              Need an Official Physical Slab?
            </div>
            <div style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: "0.78rem",
              color: "rgba(148,163,184,0.55)",
              lineHeight: 1.6,
              maxWidth: "520px",
            }}>
              Diamond Index™ is the intelligence layer — we grade, verify, and vault.
              For a physical slab, connect with one of our Certified Partner Graders.
              Your Diamond Index report travels with the card.
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", flexShrink: 0 }}>
            <ActionButton variant="secondary">
              Submit for Physical Grading →
            </ActionButton>
            <div style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
              color: "rgba(100,116,139,0.4)",
              textTransform: "uppercase",
              textAlign: "center",
            }}>
              Certified Partner Network
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 6 — MARKET INSIGHT (inform, not transact)
        ══════════════════════════════════════════════════════════════════ */}
        <Panel>
          <SectionLabel>Market Insight</SectionLabel>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "2rem",
          }}>
            {/* Estimated range */}
            <div>
              <div style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.58rem",
                letterSpacing: "0.16em",
                color: "rgba(100,116,139,0.5)",
                textTransform: "uppercase",
                marginBottom: "0.4rem",
              }}>
                Estimated Market Range
              </div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "1.4rem",
                color: "rgba(255,255,255,0.85)",
                letterSpacing: "0.02em",
              }}>
                ${CARD.market.low} – ${CARD.market.high}
              </div>
            </div>

            {/* Last sale */}
            <div>
              <div style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.58rem",
                letterSpacing: "0.16em",
                color: "rgba(100,116,139,0.5)",
                textTransform: "uppercase",
                marginBottom: "0.4rem",
              }}>
                Last Sale
              </div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "1.4rem",
                color: "rgba(148,163,184,0.75)",
              }}>
                ${CARD.market.lastSale}
              </div>
            </div>

            {/* Trend */}
            <div>
              <div style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.58rem",
                letterSpacing: "0.16em",
                color: "rgba(100,116,139,0.5)",
                textTransform: "uppercase",
                marginBottom: "0.4rem",
              }}>
                Trend ({CARD.market.trendPeriod})
              </div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "1.4rem",
                color: CARD.market.trendDir === "up" ? "rgba(34,197,94,0.85)" : "rgba(239,68,68,0.85)",
              }}>
                {CARD.market.trendDir === "up" ? "↑" : "↓"} {CARD.market.trend}
              </div>
            </div>

            {/* Confidence */}
            <div>
              <div style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.58rem",
                letterSpacing: "0.16em",
                color: "rgba(100,116,139,0.5)",
                textTransform: "uppercase",
                marginBottom: "0.4rem",
              }}>
                Confidence Score
              </div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "1.4rem",
                color: "rgba(99,155,255,0.8)",
              }}>
                {CARD.market.confidence}
              </div>
              <div style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.65rem",
                color: "rgba(100,116,139,0.45)",
                marginTop: "0.2rem",
              }}>
                Activity: {CARD.market.activity}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{
            marginTop: "1.5rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            fontFamily: "'Barlow', sans-serif",
            fontSize: "0.62rem",
            color: "rgba(100,116,139,0.4)",
            lineHeight: 1.6,
          }}>
            Market data is provided for informational purposes only. Diamond Index™ does not facilitate card transactions.
            Data reflects recent comparable sales activity. Actual transaction values may vary.
          </div>
        </Panel>

      </div>

      {/* ── Toast notifications ─────────────────────────────────────────── */}
      {verifyToast && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          background: "rgba(15,23,42,0.95)",
          border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: "4px",
          padding: "0.85rem 1.25rem",
          fontFamily: "'Barlow', sans-serif",
          fontSize: "0.75rem",
          color: "rgba(34,197,94,0.9)",
          letterSpacing: "0.06em",
          zIndex: 100,
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        }}>
          ✓ Opening verification page…
        </div>
      )}
      {vaultToast && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          background: "rgba(15,23,42,0.95)",
          border: "1px solid rgba(99,155,255,0.3)",
          borderRadius: "4px",
          padding: "0.85rem 1.25rem",
          fontFamily: "'Barlow', sans-serif",
          fontSize: "0.75rem",
          color: "rgba(99,155,255,0.9)",
          letterSpacing: "0.06em",
          zIndex: 100,
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        }}>
          ⊞ Login required to add to vault
        </div>
      )}

      {/* ── Grading Breakdown Modal ─────────────────────────────────────── */}
      <GradingBreakdownModal
        open={breakdownOpen}
        onClose={() => setBreakdownOpen(false)}
        data={GRADING_DETAIL}
      />
    </div>
  );
}
