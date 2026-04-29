/**
 * LabelRenderer — Diamond Index™ Back Label
 *
 * Renders the locked black back label design as HTML/CSS.
 * Dimensions: 1050 × 300px (logical) — matches 3.5in × 1.0in at 300 DPI.
 *
 * Layout (3 columns):
 *   LEFT  (28%) — DI logo + card photo + player name + card details
 *   CENTER(52%) — "DIAMOND INDEX™" header + 2-col scoring grid + FINAL SCORE panel
 *   RIGHT (20%) — "SCAN TO VERIFY" + QR code + Cert ID
 *
 * Design tokens (locked — do not change):
 *   Background:       #060d1e
 *   Gold accent:      #c9a84c
 *   Text primary:     #ffffff
 *   Text secondary:   rgba(255,255,255,0.55)
 *   Border/divider:   rgba(201,168,76,0.35)
 *   FINAL SCORE bg:   #0a0a0a
 *   Font:             Barlow Condensed (already loaded in project)
 *
 * Usage:
 *   <LabelRenderer data={labelData} scale={0.6} />
 *   scale=1 → full print size (1050×300)
 *   scale=0.6 → screen preview
 *
 * For PDF/PNG export, render at scale=1 inside a hidden div and capture
 * with html2canvas at pixelRatio=2.
 */

import { forwardRef } from "react";
import { DIAMOND_SINGLE } from "@/lib/diamondRating";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LabelData {
  // Card identity
  playerName: string;       // e.g. "AARON JUDGE"
  cardYear: string;         // e.g. "2024"
  cardSet: string;          // e.g. "TOPPS CHROME UPDATE"
  cardNumber?: string;      // e.g. "#USC1"
  variant?: string;         // e.g. "REFRACTOR"
  team?: string;            // e.g. "NEW YORK · YANKEES®"

  // Scores (0–100)
  centeringScore: number;
  edgesScore: number;
  surfaceScore: number;
  cornersScore: number;
  eyeAppealScore: number;
  overallScore: number;
  diamondRating: number;    // 1–5

  // Certification
  certId: string;           // e.g. "DI24-00012345"
  qrCodeUrl: string;        // live QR pointing to /verify/:certId

  // Card photo (S3 presigned URL or placeholder)
  cardImageUrl?: string;
}

interface LabelRendererProps {
  data: LabelData;
  /** Uniform scale factor. 1 = print size (1050×300px). Default 1. */
  scale?: number;
  /** Optional ref for html2canvas capture */
  className?: string;
}

// ─── Design constants ─────────────────────────────────────────────────────────

const BG        = "#060d1e";
const GOLD      = "#c9a84c";
const GOLD_DIM  = "rgba(201,168,76,0.35)";
const GOLD_MID  = "rgba(201,168,76,0.65)";
const WHITE     = "#ffffff";
const SILVER    = "rgba(255,255,255,0.55)";
const FS_BG     = "#0a0a0a";          // FINAL SCORE panel background
const DIVIDER   = "rgba(201,168,76,0.25)";

const DI_BADGE  = "/manus-storage/di-badge-clean_83e2bc22.png";
const DIAMOND   = DIAMOND_SINGLE;     // single blue diamond icon

// ─── Sub-components ───────────────────────────────────────────────────────────

/** One scoring row: ◆ CATEGORY  XX% */
function ScoreRow({ label, score }: { label: string; score: number }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      marginBottom: "9px",
    }}>
      {/* Diamond icon */}
      <img
        src={DIAMOND}
        alt=""
        style={{ width: "14px", height: "14px", objectFit: "contain", flexShrink: 0 }}
      />
      {/* Category label */}
      <span style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 600,
        fontSize: "11px",
        letterSpacing: "0.1em",
        color: WHITE,
        textTransform: "uppercase" as const,
        flex: 1,
        lineHeight: 1,
      }}>
        {label}
      </span>
      {/* Score */}
      <span style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 800,
        fontSize: "13px",
        color: GOLD,
        letterSpacing: "0.04em",
        lineHeight: 1,
        minWidth: "36px",
        textAlign: "right" as const,
      }}>
        {Math.round(score)}%
      </span>
    </div>
  );
}

/** Renders N filled diamond icons in a row */
function DiamondRow({ count, size = 22 }: { count: number; size?: number }) {
  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <img
          key={i}
          src={DIAMOND}
          alt=""
          style={{
            width: `${size}px`,
            height: `${size}px`,
            objectFit: "contain",
            opacity: i < count ? 1 : 0.18,
            filter: i < count
              ? "drop-shadow(0 0 4px rgba(130,210,255,0.6))"
              : "none",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const LabelRenderer = forwardRef<HTMLDivElement, LabelRendererProps>(
  ({ data, scale = 1, className }, ref) => {
    const W = 1050;
    const H = 300;

    // Column widths (px at scale=1)
    const LEFT_W   = 294;  // 28%
    const RIGHT_W  = 210;  // 20%
    const CENTER_W = W - LEFT_W - RIGHT_W; // 546px

    // Vertical gold dividers between columns
    const DIV_W = 1;

    const containerStyle: React.CSSProperties = {
      width:    `${W * scale}px`,
      height:   `${H * scale}px`,
      position: "relative",
      overflow: "hidden",
      background: BG,
      border: `1px solid ${GOLD_DIM}`,
      borderRadius: `${4 * scale}px`,
      display: "flex",
      flexDirection: "row",
      fontFamily: "'Barlow Condensed', sans-serif",
      transform: scale !== 1 ? `scale(${scale})` : undefined,
      transformOrigin: scale !== 1 ? "top left" : undefined,
      // When scaled, the element still occupies full logical space — caller
      // should wrap in a div sized to W*scale × H*scale.
    };

    // ── LEFT COLUMN ──────────────────────────────────────────────────────────
    const leftCol = (
      <div style={{
        width:    `${LEFT_W}px`,
        height:   `${H}px`,
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Card photo — fills the column, object-fit cover */}
        {data.cardImageUrl ? (
          <img
            src={data.cardImageUrl}
            alt={data.playerName}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
            }}
          />
        ) : (
          /* Placeholder when no photo */
          <div style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ color: SILVER, fontSize: "11px", letterSpacing: "0.08em" }}>
              NO PHOTO
            </span>
          </div>
        )}

        {/* Dark gradient overlay at bottom for text legibility */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "110px",
          background: "linear-gradient(to top, rgba(6,13,30,0.97) 0%, rgba(6,13,30,0.75) 55%, transparent 100%)",
        }} />

        {/* DI badge — top-left */}
        <img
          src={DI_BADGE}
          alt="Diamond Index™"
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            width: "36px",
            height: "36px",
            objectFit: "contain",
            filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.7))",
          }}
        />

        {/* Player name + card details — bottom overlay */}
        <div style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          right: "10px",
        }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: "15px",
            color: WHITE,
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
            lineHeight: 1.1,
            marginBottom: "4px",
            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
          }}>
            {data.playerName}
          </div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 500,
            fontSize: "9px",
            color: SILVER,
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
            lineHeight: 1.5,
          }}>
            {data.cardYear} {data.cardSet}
            {data.cardNumber && <><br />{data.cardNumber}{data.variant ? ` · ${data.variant}` : ""}</>}
            {data.team && <><br />{data.team}</>}
          </div>
        </div>

        {/* Gold bottom border line */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${GOLD_MID}, transparent)`,
        }} />
      </div>
    );

    // ── VERTICAL DIVIDER ─────────────────────────────────────────────────────
    const vDivider = (
      <div style={{
        width: `${DIV_W}px`,
        height: `${H}px`,
        background: GOLD_DIM,
        flexShrink: 0,
      }} />
    );

    // ── CENTER COLUMN ────────────────────────────────────────────────────────
    const centerCol = (
      <div style={{
        width:    `${CENTER_W}px`,
        height:   `${H}px`,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        padding: "12px 16px 10px 16px",
        boxSizing: "border-box" as const,
      }}>
        {/* Header: DIAMOND INDEX™ */}
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900,
          fontSize: "13px",
          color: WHITE,
          letterSpacing: "0.22em",
          textTransform: "uppercase" as const,
          textAlign: "center" as const,
          marginBottom: "10px",
          borderBottom: `1px solid ${DIVIDER}`,
          paddingBottom: "7px",
        }}>
          DIAMOND INDEX™
        </div>

        {/* Scoring grid — 2 columns */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap: "20px",
          flex: 1,
          marginBottom: "8px",
        }}>
          {/* Left column of scores */}
          <div>
            <ScoreRow label="Centering" score={data.centeringScore} />
            <ScoreRow label="Edges"     score={data.edgesScore} />
            <ScoreRow label="Surface"   score={data.surfaceScore} />
            <ScoreRow label="Corners"   score={data.cornersScore} />
          </div>
          {/* Right column of scores */}
          <div>
            <ScoreRow label="Edges"      score={data.edgesScore} />
            <ScoreRow label="Corners"    score={data.cornersScore} />
            <ScoreRow label="Corners"    score={data.cornersScore} />
            <ScoreRow label="Eye Appeal" score={data.eyeAppealScore} />
          </div>
        </div>

        {/* FINAL SCORE panel */}
        <div style={{
          background: FS_BG,
          border: `1px solid ${GOLD_DIM}`,
          borderRadius: "4px",
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
        }}>
          {/* Left side: label + diamonds */}
          <div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "9px",
              letterSpacing: "0.2em",
              color: WHITE,
              textTransform: "uppercase" as const,
              marginBottom: "5px",
            }}>
              FINAL SCORE
            </div>
            <DiamondRow count={data.diamondRating} size={18} />
          </div>

          {/* Right side: score number */}
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: "38px",
            color: GOLD,
            lineHeight: 1,
            letterSpacing: "-0.01em",
            textShadow: `0 0 20px rgba(201,168,76,0.35)`,
          }}>
            {data.overallScore.toFixed(1)}%
          </div>
        </div>

        {/* Footer: DIAMOND GRADED WITH VRC.7 */}
        <div style={{
          textAlign: "center" as const,
          marginTop: "5px",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 500,
          fontSize: "8px",
          color: SILVER,
          letterSpacing: "0.18em",
          textTransform: "uppercase" as const,
        }}>
          — DIAMOND GRADED WITH VRC.7 —
        </div>
      </div>
    );

    // ── RIGHT COLUMN ─────────────────────────────────────────────────────────
    const rightCol = (
      <div style={{
        width:    `${RIGHT_W}px`,
        height:   `${H}px`,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px 14px",
        boxSizing: "border-box" as const,
      }}>
        {/* Inner group: SCAN TO VERIFY + QR + Cert ID — vertically centered as a unit */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
        }}>
          {/* SCAN TO VERIFY label */}
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "9px",
            letterSpacing: "0.18em",
            color: GOLD,
            textTransform: "uppercase" as const,
            textAlign: "center" as const,
          }}>
            SCAN TO VERIFY
          </div>

          {/* QR Code */}
          <div style={{
            border: `1px solid ${GOLD_DIM}`,
            padding: "4px",
            background: WHITE,
            borderRadius: "2px",
            lineHeight: 0,
          }}>
            <img
              src={data.qrCodeUrl}
              alt={`Verify ${data.certId}`}
              style={{
                width: "90px",
                height: "90px",
                display: "block",
              }}
              crossOrigin="anonymous"
            />
          </div>

          {/* Cert ID */}
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 600,
            fontSize: "10px",
            color: WHITE,
            letterSpacing: "0.1em",
            textAlign: "center" as const,
          }}>
            {data.certId}
          </div>
        </div>
      </div>
    );

    // ── Assemble ─────────────────────────────────────────────────────────────
    return (
      <div
        ref={ref}
        className={className}
        style={containerStyle}
        data-label-renderer="true"
      >
        {leftCol}
        {vDivider}
        {centerCol}
        {vDivider}
        {rightCol}
      </div>
    );
  }
);

LabelRenderer.displayName = "LabelRenderer";
export default LabelRenderer;

// ─── Helper: build LabelData from a gradedCard DB row ────────────────────────

export interface GradedCardRow {
  cardName?: string | null;
  cardYear?: string | null;
  cardSet?: string | null;
  cardNumber?: string | null;
  manufacturer?: string | null;
  centeringScore?: string | number | null;
  edgesScore?: string | number | null;
  surfaceScore?: string | number | null;
  cornersScore?: string | number | null;
  eyeAppealScore?: string | number | null;
  overallScore?: string | number | null;
  diamondRating?: number | null;
  certId?: string | null;
  qrCodeUrl?: string | null;
  cardImageUrl?: string | null;  // presigned S3 URL resolved by server
}

export function buildLabelData(row: GradedCardRow): LabelData {
  const n = (v: string | number | null | undefined) =>
    v != null ? parseFloat(String(v)) : 0;

  return {
    playerName:     (row.cardName ?? "UNKNOWN PLAYER").toUpperCase(),
    cardYear:       row.cardYear ?? "",
    cardSet:        (row.cardSet ?? "").toUpperCase(),
    cardNumber:     row.cardNumber ?? undefined,
    variant:        row.manufacturer ?? undefined,
    team:           undefined,  // not stored yet — Phase 2 addition
    centeringScore: n(row.centeringScore),
    edgesScore:     n(row.edgesScore),
    surfaceScore:   n(row.surfaceScore),
    cornersScore:   n(row.cornersScore),
    eyeAppealScore: n(row.eyeAppealScore),
    overallScore:   n(row.overallScore),
    diamondRating:  row.diamondRating ?? 1,
    certId:         row.certId ?? "DI00-00000000",
    qrCodeUrl:      row.qrCodeUrl ?? "",  // S3-stored QR — generated at grading time
    cardImageUrl:   row.cardImageUrl ?? undefined,
  };
}
