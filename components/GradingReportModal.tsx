/**
 * Diamond Index™ — Grading Report Modal
 *
 * LOCKED STRUCTURE — do not modify without explicit instruction.
 *
 * Features:
 * - Hero score (large %) + diamond rating
 * - Clickable category rows → drill-down detail panels
 * - Centering: front/back bars + scoring table with actual result highlighted
 * - Edges / Corners / Surface / Eye Appeal: defect tier table + examples
 * - Defects section: severity tiers with deduction amounts
 * - Ungradeable Conditions section
 * - Value calculation: market × grade %
 * - Print / Save PDF button
 *
 * Sample data: Aaron Judge 2024 Topps Chrome · 96.0% · 4♦ Elite
 */

import { useEffect, useRef, useState } from "react";
import { DIAMOND_ASSETS } from "@/lib/diamondRating";
import CenteringDetailsModal from "@/components/CenteringDetailsModal";
import EdgesDetailsModal, { EdgeData } from "@/components/EdgesDetailsModal";
import CornersDetailsModal, { CornerData } from "@/components/CornersDetailsModal";
import SurfaceDetailsModal, { SurfaceDefect } from "@/components/SurfaceDetailsModal";
import EyeAppealDetailsModal, { EyeAppealData } from "@/components/EyeAppealDetailsModal";

// ─── Sample grading data ──────────────────────────────────────────────────────
const SAMPLE_REPORT = {
  card: "Aaron Judge · 2024 Topps Chrome",
  finalScore: 96.0,
  diamonds: 4,
  condition: "Elite Condition",

  centering: {
    front: { left: 51, right: 49, score: 96 },
    back: { left: 60, right: 40, score: 100 },
    final: 98,
  },

  categories: [
    { label: "Centering", weight: "40%", score: 98,  deduction: -2 },
    { label: "Edges",     weight: "15%", score: 98,  deduction: -2 },
    { label: "Corners",   weight: "15%", score: 98,  deduction: -2 },
    { label: "Surface",   weight: "20%", score: 100, deduction:  0 },
    { label: "Eye Appeal",weight: "10%", score: 100, deduction:  0 },
  ],

  defects: [
    { severity: "Light", description: "Surface scratch, faint",  deduction: -2 },
    { severity: "Minor", description: "Corner whitening, slight", deduction: -2 },
  ],

  value: {
    market: 2500,
    graded: 2400,
  },
};

// ─── Severity styles ──────────────────────────────────────────────────────────
const SEV: Record<string, { bg: string; text: string; border: string }> = {
  Light: { bg: "rgba(99,155,255,0.08)",  text: "rgba(99,155,255,0.9)",  border: "rgba(99,155,255,0.25)" },
  Minor: { bg: "rgba(201,168,76,0.08)",  text: "rgba(201,168,76,0.9)",  border: "rgba(201,168,76,0.3)"  },
  Major: { bg: "rgba(220,80,80,0.08)",   text: "rgba(220,80,80,0.85)",  border: "rgba(220,80,80,0.25)"  },
};

// ─── Centering scoring table ──────────────────────────────────────────────────
const CENTERING_TABLE = [
  { ratio: "50 / 50", score: 100, note: "Perfect" },
  { ratio: "51 / 49", score: 96,  note: "" },
  { ratio: "52 / 48", score: 92,  note: "" },
  { ratio: "53 / 47", score: 88,  note: "" },
  { ratio: "55 / 45", score: 80,  note: "Minimum" },
  { ratio: "57 / 43", score: 72,  note: "Deduction" },
  { ratio: "60 / 40", score: 60,  note: "Heavy off" },
];

// ─── Per-category drill-down data ─────────────────────────────────────────────
const CATEGORY_DETAIL: Record<string, {
  description: string;
  tiers: { label: string; deduction: string; examples: string; color: string; bg: string; border: string }[];
  formula?: string;
}> = {
  Centering: {
    description: "Measures how well the card image is centered within its borders — front and back evaluated independently.",
    formula: "Front score (60% weight) + Back score (40% weight) ÷ 2",
    tiers: [
      { label: "Perfect",   deduction: "0 pts",    examples: "50/50 front and back",          color: "rgba(100,200,130,0.9)", bg: "rgba(100,200,130,0.06)", border: "rgba(100,200,130,0.2)" },
      { label: "Light Off", deduction: "−2 pts",   examples: "51/49 to 52/48",                color: "rgba(99,155,255,0.9)",  bg: "rgba(99,155,255,0.06)",  border: "rgba(99,155,255,0.2)"  },
      { label: "Moderate",  deduction: "−5 pts",   examples: "53/47 to 55/45",                color: "rgba(201,168,76,0.9)", bg: "rgba(201,168,76,0.06)", border: "rgba(201,168,76,0.2)"  },
      { label: "Heavy",     deduction: "−10 pts",  examples: "56/44 to 60/40",                color: "rgba(220,80,80,0.85)", bg: "rgba(220,80,80,0.06)",  border: "rgba(220,80,80,0.2)"   },
      { label: "Severe",    deduction: "UNGRADEABLE", examples: "Beyond 60/40",               color: "rgba(180,40,40,0.9)",  bg: "rgba(180,40,40,0.08)",  border: "rgba(180,40,40,0.25)"  },
    ],
  },
  Edges: {
    description: "All four edges examined under magnification for chips, nicks, roughness, and print defects.",
    tiers: [
      { label: "Clean",     deduction: "0 pts",    examples: "No visible damage",             color: "rgba(100,200,130,0.9)", bg: "rgba(100,200,130,0.06)", border: "rgba(100,200,130,0.2)" },
      { label: "Light",     deduction: "−2 pts",   examples: "Faint roughness · Tiny nick",   color: "rgba(99,155,255,0.9)",  bg: "rgba(99,155,255,0.06)",  border: "rgba(99,155,255,0.2)"  },
      { label: "Minor",     deduction: "−5 pts",   examples: "Visible wear · Small chip",     color: "rgba(201,168,76,0.9)", bg: "rgba(201,168,76,0.06)", border: "rgba(201,168,76,0.2)"  },
      { label: "Major",     deduction: "−10 pts",  examples: "Significant chip · Rough edge", color: "rgba(220,80,80,0.85)", bg: "rgba(220,80,80,0.06)",  border: "rgba(220,80,80,0.2)"   },
      { label: "Severe",    deduction: "UNGRADEABLE", examples: "Trimmed edge · Altered",     color: "rgba(180,40,40,0.9)",  bg: "rgba(180,40,40,0.08)",  border: "rgba(180,40,40,0.25)"  },
    ],
  },
  Corners: {
    description: "All four corners inspected for fraying, wear, and bending. Corners are the most common damage point.",
    tiers: [
      { label: "Sharp",     deduction: "0 pts",    examples: "Needle-sharp, no wear",         color: "rgba(100,200,130,0.9)", bg: "rgba(100,200,130,0.06)", border: "rgba(100,200,130,0.2)" },
      { label: "Light",     deduction: "−2 pts",   examples: "Faint whitening · Barely soft", color: "rgba(99,155,255,0.9)",  bg: "rgba(99,155,255,0.06)",  border: "rgba(99,155,255,0.2)"  },
      { label: "Minor",     deduction: "−5 pts",   examples: "Visible softening · Fraying",   color: "rgba(201,168,76,0.9)", bg: "rgba(201,168,76,0.06)", border: "rgba(201,168,76,0.2)"  },
      { label: "Major",     deduction: "−10 pts",  examples: "Bent corner · Heavy whitening", color: "rgba(220,80,80,0.85)", bg: "rgba(220,80,80,0.06)",  border: "rgba(220,80,80,0.2)"   },
      { label: "Severe",    deduction: "UNGRADEABLE", examples: "Creased corner · Folded",    color: "rgba(180,40,40,0.9)",  bg: "rgba(180,40,40,0.08)",  border: "rgba(180,40,40,0.25)"  },
    ],
  },
  Surface: {
    description: "Front and back surfaces checked for scratches, print lines, stains, and factory defects.",
    tiers: [
      { label: "Pristine",  deduction: "0 pts",    examples: "No marks, full gloss",          color: "rgba(100,200,130,0.9)", bg: "rgba(100,200,130,0.06)", border: "rgba(100,200,130,0.2)" },
      { label: "Light",     deduction: "−2 pts",   examples: "Faint scratch · Print line",    color: "rgba(99,155,255,0.9)",  bg: "rgba(99,155,255,0.06)",  border: "rgba(99,155,255,0.2)"  },
      { label: "Minor",     deduction: "−5 pts",   examples: "Visible scratch · Stain",       color: "rgba(201,168,76,0.9)", bg: "rgba(201,168,76,0.06)", border: "rgba(201,168,76,0.2)"  },
      { label: "Major",     deduction: "−10 pts",  examples: "Deep scratch · Ink loss",       color: "rgba(220,80,80,0.85)", bg: "rgba(220,80,80,0.06)",  border: "rgba(220,80,80,0.2)"   },
      { label: "Severe",    deduction: "UNGRADEABLE", examples: "Crease · Writing on card",   color: "rgba(180,40,40,0.9)",  bg: "rgba(180,40,40,0.08)",  border: "rgba(180,40,40,0.25)"  },
    ],
  },
  "Eye Appeal": {
    description: "Overall visual impression — color vibrancy, gloss, print quality, and the card's presence as a collectible.",
    tiers: [
      { label: "Excellent", deduction: "0 pts",    examples: "Vibrant color · Full gloss",    color: "rgba(100,200,130,0.9)", bg: "rgba(100,200,130,0.06)", border: "rgba(100,200,130,0.2)" },
      { label: "Good",      deduction: "−2 pts",   examples: "Slight dullness · Minor fade",  color: "rgba(99,155,255,0.9)",  bg: "rgba(99,155,255,0.06)",  border: "rgba(99,155,255,0.2)"  },
      { label: "Fair",      deduction: "−5 pts",   examples: "Dull print · Faded color",      color: "rgba(201,168,76,0.9)", bg: "rgba(201,168,76,0.06)", border: "rgba(201,168,76,0.2)"  },
      { label: "Poor",      deduction: "−10 pts",  examples: "Heavy fade · Misprint",         color: "rgba(220,80,80,0.85)", bg: "rgba(220,80,80,0.06)",  border: "rgba(220,80,80,0.2)"   },
      { label: "Severe",    deduction: "UNGRADEABLE", examples: "Blank face · Severe misprint", color: "rgba(180,40,40,0.9)", bg: "rgba(180,40,40,0.08)", border: "rgba(180,40,40,0.25)"  },
    ],
  },
};

// ─── Centering bar ────────────────────────────────────────────────────────────
function CenteringBar({ left, right, label, score }: { left: number; right: number; label: string; score: number }) {
  const diff = Math.abs(left - right);
  const isOff = diff > 2;
  return (
    <div style={{ marginBottom: "0.85rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", color: "rgba(148,163,184,0.6)", textTransform: "uppercase" }}>
          {label}
        </span>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.8rem", color: score >= 98 ? "rgba(201,168,76,0.9)" : "#ffffff" }}>
          {score}
        </span>
      </div>
      <div style={{ position: "relative", height: "20px", background: "rgba(255,255,255,0.04)", borderRadius: "2px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${left}%`, background: isOff ? "rgba(99,155,255,0.25)" : "rgba(99,155,255,0.15)", borderRight: "1px solid rgba(99,155,255,0.5)", transition: "width 0.6s ease" }} />
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px", background: "rgba(255,255,255,0.15)", transform: "translateX(-50%)" }} />
        <div style={{ position: "absolute", left: "6px", top: "50%", transform: "translateY(-50%)", fontFamily: "'Barlow', sans-serif", fontSize: "0.6rem", fontWeight: 600, color: isOff ? "rgba(99,155,255,0.9)" : "rgba(148,163,184,0.7)" }}>{left}%</div>
        <div style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", fontFamily: "'Barlow', sans-serif", fontSize: "0.6rem", fontWeight: 600, color: isOff ? "rgba(99,155,255,0.9)" : "rgba(148,163,184,0.7)" }}>{right}%</div>
      </div>
    </div>
  );
}

// ─── Drill-down panel ─────────────────────────────────────────────────────────
function DrillDownPanel({ category, actualScore, isCentering, centering }: {
  category: string;
  actualScore: number;
  isCentering: boolean;
  centering?: typeof SAMPLE_REPORT.centering;
}) {
  const detail = CATEGORY_DETAIL[category];
  if (!detail) return null;

  return (
    <div style={{
      marginTop: "0.75rem",
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(99,155,255,0.12)",
      borderRadius: "4px",
      padding: "1.1rem 1.25rem",
      animation: "slideDown 0.2s ease",
    }}>
      {/* Description */}
      <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: "0.75rem", color: "rgba(148,163,184,0.7)", lineHeight: 1.55, marginBottom: "1rem", margin: "0 0 1rem" }}>
        {detail.description}
      </p>

      {/* Centering: bars + scoring table */}
      {isCentering && centering && (
        <>
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.58rem", letterSpacing: "0.15em", color: "rgba(99,155,255,0.6)", textTransform: "uppercase", marginBottom: "0.6rem" }}>
              This Card's Result
            </div>
            <CenteringBar label="Front" left={centering.front.left} right={centering.front.right} score={centering.front.score} />
            <CenteringBar label="Back"  left={centering.back.left}  right={centering.back.right}  score={centering.back.score}  />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.75rem", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "3px", marginTop: "0.5rem" }}>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.62rem", letterSpacing: "0.1em", color: "rgba(148,163,184,0.6)", textTransform: "uppercase" }}>Final Centering Score</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "rgba(201,168,76,0.9)" }}>{centering.final}</span>
            </div>
          </div>

          {/* Scoring table */}
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.58rem", letterSpacing: "0.15em", color: "rgba(99,155,255,0.6)", textTransform: "uppercase", marginBottom: "0.6rem" }}>
              Scoring Reference
            </div>
            <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 80px", padding: "0.35rem 0.75rem", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.58rem", letterSpacing: "0.12em", color: "rgba(100,116,139,0.6)", textTransform: "uppercase" }}>Ratio</span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.58rem", letterSpacing: "0.12em", color: "rgba(100,116,139,0.6)", textTransform: "uppercase", textAlign: "right" }}>Score</span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.58rem", letterSpacing: "0.12em", color: "rgba(100,116,139,0.6)", textTransform: "uppercase", textAlign: "right" }}>Note</span>
              </div>
              {CENTERING_TABLE.map((row) => {
                const isActual = row.ratio === `${centering.front.left} / ${centering.front.right}`;
                return (
                  <div
                    key={row.ratio}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 60px 80px",
                      padding: "0.4rem 0.75rem",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      background: isActual ? "rgba(99,155,255,0.08)" : "transparent",
                      transition: "background 0.15s",
                    }}
                  >
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: isActual ? 700 : 400, fontSize: "0.78rem", color: isActual ? "rgba(99,155,255,0.95)" : "rgba(203,213,225,0.7)" }}>
                      {row.ratio} {isActual && <span style={{ fontSize: "0.6rem", marginLeft: "4px", color: "rgba(99,155,255,0.7)" }}>← this card</span>}
                    </span>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: isActual ? 700 : 400, fontSize: "0.78rem", color: isActual ? "rgba(99,155,255,0.95)" : "rgba(203,213,225,0.7)", textAlign: "right" }}>
                      {row.score}
                    </span>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.62rem", color: "rgba(100,116,139,0.55)", textAlign: "right" }}>
                      {row.note}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Formula */}
          {detail.formula && (
            <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.65rem", color: "rgba(100,116,139,0.5)", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "0.6rem" }}>
              Formula: {detail.formula}
            </div>
          )}
        </>
      )}

      {/* Non-centering: tier table */}
      {!isCentering && (
        <div>
          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.58rem", letterSpacing: "0.15em", color: "rgba(99,155,255,0.6)", textTransform: "uppercase", marginBottom: "0.6rem" }}>
            Deduction Scale
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            {detail.tiers.map((tier) => {
              const isActual = tier.deduction === `${actualScore === 100 ? "0 pts" : actualScore >= 98 ? "−2 pts" : actualScore >= 95 ? "−5 pts" : "−10 pts"}`;
              return (
                <div
                  key={tier.label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "72px 80px 1fr",
                    gap: "0.5rem",
                    alignItems: "center",
                    padding: "0.45rem 0.75rem",
                    background: isActual ? tier.bg : "transparent",
                    border: `1px solid ${isActual ? tier.border : "rgba(255,255,255,0.04)"}`,
                    borderRadius: "3px",
                    transition: "background 0.15s",
                  }}
                >
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.08em", color: tier.color, textTransform: "uppercase" }}>
                    {tier.label}
                  </span>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", color: tier.deduction === "UNGRADEABLE" ? "rgba(180,40,40,0.9)" : tier.color, textAlign: "right" }}>
                    {tier.deduction}
                  </span>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.68rem", color: "rgba(100,116,139,0.65)", textAlign: "right" }}>
                    {tier.examples}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────
interface GradingReportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function GradingReportModal({ open, onClose }: GradingReportModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const [defectsExpanded, setDefectsExpanded] = useState(false);
  const [centeringOpen, setCenteringOpen] = useState(false);
  const [edgesOpen, setEdgesOpen] = useState(false);
  const [cornersOpen, setCornersOpen] = useState(false);
  const [surfaceOpen, setSurfaceOpen] = useState(false);
  const [eyeAppealOpen, setEyeAppealOpen] = useState(false);

  const REPORT_EYE_APPEAL: EyeAppealData = {
    colorVibrancy: 96,
    surfaceShine:  94,
    printQuality:  95,
    visualBalance: 97,
    finalScore:    96,
  };

  const REPORT_EDGES: EdgeData[] = [
    { side: "Top",    severity: "Light", note: "Tiny whitening, barely visible" },
    { side: "Bottom", severity: "Clean", note: "No visible damage" },
    { side: "Left",   severity: "Minor", note: "Visible edge wear" },
    { side: "Right",  severity: "Light", note: "Slight roughness" },
  ];
  const REPORT_CORNERS: CornerData[] = [
    { position: "TL", label: "Top Left",     severity: "Light", note: "Tiny white dot" },
    { position: "TR", label: "Top Right",    severity: "Minor", note: "Slight wear" },
    { position: "BL", label: "Bottom Left",  severity: "Clean", note: "Sharp, undamaged" },
    { position: "BR", label: "Bottom Right", severity: "Light", note: "Light whitening" },
  ];
  const REPORT_DEFECTS: SurfaceDefect[] = [
    { id: "s1", severity: "Light",    description: "Hairline scratch (top right)", x: 72, y: 18 },
    { id: "s2", severity: "Minor",    description: "Print line (center)",          x: 50, y: 50 },
    { id: "s3", severity: "Moderate", description: "Small dent (bottom edge)",     x: 35, y: 82 },
  ];
  const r = SAMPLE_REPORT;

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Reset expanded state when modal closes
  useEffect(() => {
    if (!open) {
      setExpandedCategory(null);
      setDefectsExpanded(false);
      setCenteringOpen(false);
      setEdgesOpen(false);
      setCornersOpen(false);
      setSurfaceOpen(false);
      setEyeAppealOpen(false);
    }
  }, [open]);

  if (!open) return null;

  const toggleCategory = (label: string) => {
    if (label === "Centering") { setCenteringOpen(true); return; }
    if (label === "Edges")     { setEdgesOpen(true); return; }
    if (label === "Corners")   { setCornersOpen(true); return; }
    if (label === "Surface")   { setSurfaceOpen(true); return; }
    if (label === "Eye Appeal") { setEyeAppealOpen(true); return; }
    setExpandedCategory(prev => prev === label ? null : label);
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(2,8,20,0.82)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .grading-modal-inner { animation: slideUp 0.25s ease; }
        .grading-modal-inner::-webkit-scrollbar { width: 4px; }
        .grading-modal-inner::-webkit-scrollbar-track { background: transparent; }
        .grading-modal-inner::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .cat-row:hover { background: rgba(255,255,255,0.04) !important; }
        .defect-row-toggle:hover { background: rgba(255,255,255,0.03) !important; }
      `}</style>

      <div
        className="grading-modal-inner"
        style={{
          background: "#080f22",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "580px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.08)",
          position: "relative",
        }}
      >
        {/* Gold top accent */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.7) 40%, rgba(201,168,76,0.9) 50%, rgba(201,168,76,0.7) 60%, transparent 100%)", borderRadius: "8px 8px 0 0" }} />

        {/* Save PDF */}
        <button
          onClick={() => window.print()}
          style={{ position: "absolute", top: "14px", right: "52px", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: "4px", height: "28px", padding: "0 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", color: "rgba(201,168,76,0.75)", fontSize: "10px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,0.16)"; e.currentTarget.style.color = "rgba(201,168,76,1)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(201,168,76,0.08)"; e.currentTarget.style.color = "rgba(201,168,76,0.75)"; }}
        >⬇ Save PDF</button>

        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: "absolute", top: "14px", right: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(148,163,184,0.7)", fontSize: "14px", transition: "background 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
        >✕</button>

        <div style={{ padding: "2rem 2rem 1.75rem" }}>

          {/* ── HERO SCORE ──────────────────────────────────────────────── */}
          <div style={{ marginBottom: "1.75rem" }}>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(201,168,76,0.7)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
              Grading Report · {r.card}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "1.25rem", marginBottom: "0.5rem" }}>
              <div>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "clamp(3rem, 8vw, 4.5rem)", letterSpacing: "-0.02em", color: "#ffffff", lineHeight: 1 }}>
                  {r.finalScore.toFixed(1)}
                </span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: "1.2rem", color: "rgba(148,163,184,0.6)", marginLeft: "2px" }}>%</span>
              </div>
              <div style={{ paddingBottom: "6px" }}>
                <img src={DIAMOND_ASSETS[r.diamonds]} alt={`${r.diamonds} diamonds`} style={{ height: "36px", width: "auto", objectFit: "contain", display: "block" }} />
              </div>
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.18em", color: "rgba(201,168,76,0.85)", textTransform: "uppercase" }}>
              {r.condition}
            </div>
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "1.5rem" }} />

          {/* ── CATEGORY BREAKDOWN (clickable) ──────────────────────────── */}
          <div style={{ marginBottom: "1.75rem" }}>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(148,163,184,0.5)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
              Category Breakdown &nbsp;<span style={{ color: "rgba(99,155,255,0.4)", fontWeight: 400 }}>— click any row for detail</span>
            </div>

            {r.categories.map((cat) => {
              const isExpanded = expandedCategory === cat.label;
              const isCentering = cat.label === "Centering";
              const hasDeduction = cat.deduction < 0;

              return (
                <div key={cat.label}>
                  <div
                    className="cat-row"
                    onClick={() => toggleCategory(cat.label)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 48px 56px 24px",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.55rem 0.6rem",
                      borderRadius: "3px",
                      cursor: "pointer",
                      background: isExpanded ? "rgba(99,155,255,0.06)" : "transparent",
                      border: `1px solid ${isExpanded ? "rgba(99,155,255,0.15)" : "transparent"}`,
                      transition: "all 0.15s ease",
                      marginBottom: isExpanded ? "0" : "2px",
                    }}
                  >
                    {/* Label + weight */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: "0.82rem", color: "rgba(203,213,225,0.85)" }}>
                        {cat.label}
                      </span>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.58rem", letterSpacing: "0.1em", color: "rgba(100,116,139,0.5)", textTransform: "uppercase" }}>
                        {cat.weight}
                      </span>
                    </div>
                    {/* Score */}
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.8rem", color: cat.score >= 100 ? "rgba(100,200,130,0.8)" : "rgba(203,213,225,0.7)", textAlign: "right" }}>
                      {cat.score}
                    </span>
                    {/* Deduction */}
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.8rem", color: hasDeduction ? "rgba(220,80,80,0.8)" : "rgba(100,200,130,0.7)", textAlign: "right" }}>
                      {cat.deduction === 0 ? "—" : `${cat.deduction}%`}
                    </span>
                    {/* Chevron */}
                    <span style={{ color: "rgba(99,155,255,0.5)", fontSize: "0.65rem", textAlign: "right", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}>
                      ▾
                    </span>
                  </div>

                  {/* Drill-down panel */}
                  {isExpanded && (
                    <DrillDownPanel
                      category={cat.label}
                      actualScore={cat.score}
                      isCentering={isCentering}
                      centering={isCentering ? r.centering : undefined}
                    />
                  )}

                  {/* Spacer after expanded panel */}
                  {isExpanded && <div style={{ height: "8px" }} />}
                </div>
              );
            })}
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "1.5rem" }} />

          {/* ── DEFECTS (clickable header) ───────────────────────────────── */}
          <div style={{ marginBottom: "1.75rem" }}>
            <div
              className="defect-row-toggle"
              onClick={() => setDefectsExpanded(p => !p)}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: "0.3rem 0", marginBottom: "0.75rem", borderRadius: "3px" }}
            >
              <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(148,163,184,0.5)", textTransform: "uppercase" }}>
                Defects Detected &nbsp;<span style={{ color: "rgba(220,80,80,0.4)", fontWeight: 400 }}>— click for tier guide</span>
              </div>
              <span style={{ color: "rgba(99,155,255,0.5)", fontSize: "0.65rem", transition: "transform 0.2s", transform: defectsExpanded ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}>▾</span>
            </div>

            {/* Defect rows */}
            {r.defects.length === 0 ? (
              <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.8rem", color: "rgba(100,200,130,0.7)" }}>No defects detected</div>
            ) : (
              r.defects.map((defect, i) => {
                const s = SEV[defect.severity] ?? SEV.Light;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0", borderBottom: i < r.defects.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "2px 7px", borderRadius: "2px", background: s.bg, color: s.text, border: `1px solid ${s.border}`, flexShrink: 0, minWidth: "46px", textAlign: "center" }}>
                      {defect.severity}
                    </span>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: "0.8rem", color: "rgba(203,213,225,0.75)", flex: 1 }}>
                      {defect.description}
                    </span>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "rgba(220,80,80,0.8)", flexShrink: 0 }}>
                      {defect.deduction}%
                    </span>
                  </div>
                );
              })
            )}

            {/* Defect tier guide — expanded */}
            {defectsExpanded && (
              <div style={{ marginTop: "0.75rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(220,80,80,0.1)", borderRadius: "4px", padding: "1rem 1.1rem", animation: "slideDown 0.2s ease" }}>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.58rem", letterSpacing: "0.15em", color: "rgba(220,80,80,0.5)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                  Defect Severity Guide
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {[
                    { label: "Light",  deduction: "−2 pts",       examples: "Faint scratch · Tiny whitening · Minor print line",  ...SEV.Light },
                    { label: "Minor",  deduction: "−5 pts",        examples: "Visible scratch · Corner softening · Edge wear",     ...SEV.Minor },
                    { label: "Major",  deduction: "−10 pts",       examples: "Crease · Dent · Deep scratch · Ink loss",            ...SEV.Major },
                    { label: "Severe", deduction: "UNGRADEABLE",   examples: "Trimmed · Altered · Heavy crease through card",      bg: "rgba(180,40,40,0.08)", text: "rgba(180,40,40,0.9)", border: "rgba(180,40,40,0.25)" },
                  ].map(tier => (
                    <div key={tier.label} style={{ display: "grid", gridTemplateColumns: "60px 90px 1fr", gap: "0.5rem", alignItems: "center", padding: "0.4rem 0.6rem", background: tier.bg, border: `1px solid ${tier.border}`, borderRadius: "3px" }}>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.08em", color: tier.text, textTransform: "uppercase" }}>{tier.label}</span>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", color: tier.text }}>{tier.deduction}</span>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.67rem", color: "rgba(100,116,139,0.65)" }}>{tier.examples}</span>
                    </div>
                  ))}
                </div>

                {/* Ungradeable conditions */}
                <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.58rem", letterSpacing: "0.15em", color: "rgba(180,40,40,0.6)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                    Ungradeable Conditions
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    {[
                      "Card has been trimmed or altered",
                      "Heavy crease running through the card face",
                      "Writing, stamps, or stickers on card surface",
                      "Centering beyond 60/40 on either axis",
                      "Severe misprint or blank face",
                      "Water damage or warping",
                    ].map(cond => (
                      <div key={cond} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ color: "rgba(180,40,40,0.7)", fontSize: "0.6rem", flexShrink: 0 }}>✕</span>
                        <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", color: "rgba(148,163,184,0.6)" }}>{cond}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "1.5rem" }} />

          {/* ── VALUE ────────────────────────────────────────────────────── */}
          <div>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(148,163,184,0.5)", textTransform: "uppercase", marginBottom: "0.85rem" }}>
              Calculated Value
            </div>
            <div style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.12)", borderRadius: "4px", padding: "1.1rem 1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem", fontFamily: "'Barlow', sans-serif", fontSize: "0.7rem", color: "rgba(148,163,184,0.5)", letterSpacing: "0.05em" }}>
                <span>${r.value.market.toLocaleString()}</span>
                <span>×</span>
                <span>{r.finalScore.toFixed(1)}%</span>
                <span>=</span>
                <span style={{ color: "rgba(201,168,76,0.8)", fontWeight: 600 }}>${r.value.graded.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: "0.82rem", color: "rgba(148,163,184,0.6)" }}>Market Value</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "rgba(203,213,225,0.8)" }}>${r.value.market.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: "0.82rem", color: "rgba(148,163,184,0.6)" }}>Your Card</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "rgba(201,168,76,0.95)" }}>${r.value.graded.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Drill-down Sub-Modals */}
          <CenteringDetailsModal
            open={centeringOpen}
            onClose={() => setCenteringOpen(false)}
            frontLeft={r.centering.front.left}
            frontRight={r.centering.front.right}
            frontScore={r.centering.front.score}
            backLeft={r.centering.back.left}
            backRight={r.centering.back.right}
            backScore={r.centering.back.score}
            finalScore={r.centering.final}
          />
          <EdgesDetailsModal
            open={edgesOpen}
            onClose={() => setEdgesOpen(false)}
            edges={REPORT_EDGES}
            finalScore={91}
          />
          <CornersDetailsModal
            open={cornersOpen}
            onClose={() => setCornersOpen(false)}
            corners={REPORT_CORNERS}
            finalScore={91}
          />
          <SurfaceDetailsModal
            open={surfaceOpen}
            onClose={() => setSurfaceOpen(false)}
            defects={REPORT_DEFECTS}
            finalScore={83}
          />
          <EyeAppealDetailsModal
            open={eyeAppealOpen}
            onClose={() => setEyeAppealOpen(false)}
            data={REPORT_EYE_APPEAL}
          />

          {/* Footer */}
          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: "0.62rem", letterSpacing: "0.08em", color: "rgba(100,116,139,0.4)", textTransform: "uppercase" }}>
              Diamond Index™ · Certification Authority · Sample Report
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
