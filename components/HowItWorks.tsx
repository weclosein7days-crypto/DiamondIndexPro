/**
 * Diamond Index™ — How It Works Section
 * LOCKED — do not modify without explicit instruction.
 *
 * All sub-sections are accordion dropdowns — collapsed by default.
 * Click header to expand/collapse. Content inside is unchanged.
 * Covers: 5 criteria, centering formula, defect tiers, diamond scale, value model
 */

import { useState, useRef, useEffect } from "react";
import GradingReportModal from "@/components/GradingReportModal";
import CenteringDetailsModal from "@/components/CenteringDetailsModal";
import EdgesDetailsModal, { EdgeData } from "@/components/EdgesDetailsModal";
import CornersDetailsModal, { CornerData } from "@/components/CornersDetailsModal";
import SurfaceDetailsModal, { SurfaceDefect } from "@/components/SurfaceDetailsModal";
import EyeAppealDetailsModal, { EyeAppealData } from "@/components/EyeAppealDetailsModal";

const DIAMOND_IMG = "/manus-storage/diamond-blue-sm_46bffbe0.png";

const CRITERIA = [
  {
    number: "01", title: "Centering", weight: "40%",
    color: "rgba(99,155,255,0.9)", glow: "rgba(99,155,255,0.15)",
    desc: "Front: 100 − (difference × 2). Perfect = 50/50. Back: 100 − (diff from 60/40 × 1.5). Final = (Front + Back) ÷ 2.",
    example: "51/49 front → score 96",
  },
  {
    number: "02", title: "Edges", weight: "15%",
    color: "rgba(148,200,255,0.9)", glow: "rgba(148,200,255,0.12)",
    desc: "All four edges examined for wear, chips, and roughness. Clean edges with no visible damage score highest.",
    example: "Minor edge wear → −5 pts",
  },
  {
    number: "03", title: "Corners", weight: "15%",
    color: "rgba(148,200,255,0.9)", glow: "rgba(148,200,255,0.12)",
    desc: "All four corners evaluated for sharpness and fraying. Sharp, undamaged corners are required for top scores.",
    example: "Corner whitening → −5 pts",
  },
  {
    number: "04", title: "Surface", weight: "20%",
    color: "rgba(148,200,255,0.9)", glow: "rgba(148,200,255,0.12)",
    desc: "Front and back surfaces checked for scratches, print defects, stains, and creases. Surface integrity is critical.",
    example: "Light scratch → −2 pts",
  },
  {
    number: "05", title: "Eye Appeal", weight: "10%",
    color: "rgba(201,168,76,0.9)", glow: "rgba(201,168,76,0.12)",
    desc: "Overall visual impression — color vibrancy, print quality, and the card's presence as a collectible object.",
    example: "Dull print → −2 pts",
  },
];

const DEFECTS = [
  { severity: "LIGHT",  deduction: "−2 pts",      examples: "Tiny scratch · Faint whitening",              color: "rgba(99,155,255,0.85)",  bg: "rgba(99,155,255,0.08)",  border: "rgba(99,155,255,0.2)"  },
  { severity: "MINOR",  deduction: "−5 pts",      examples: "Visible edge wear · Small corner softening",  color: "rgba(201,168,76,0.85)",  bg: "rgba(201,168,76,0.08)",  border: "rgba(201,168,76,0.2)"  },
  { severity: "MAJOR",  deduction: "−10 pts",     examples: "Crease · Dent · Wrinkle",                    color: "rgba(239,100,80,0.85)",  bg: "rgba(239,100,80,0.08)",  border: "rgba(239,100,80,0.2)"  },
  { severity: "SEVERE", deduction: "UNGRADEABLE", examples: "Trimmed · Altered · Heavy crease through card", color: "rgba(180,40,40,0.9)", bg: "rgba(180,40,40,0.1)",    border: "rgba(180,40,40,0.25)"  },
];

const TIERS = [
  { diamonds: 1, name: "Standard", range: "80–84", color: "rgba(148,163,184,0.7)" },
  { diamonds: 2, name: "Premium",  range: "85–88", color: "rgba(148,163,184,0.8)" },
  { diamonds: 3, name: "Superior", range: "89–92", color: "rgba(148,200,255,0.85)" },
  { diamonds: 4, name: "Elite",    range: "93–96", color: "rgba(201,168,76,0.9)" },
  { diamonds: 5, name: "Pristine", range: "97–100", color: "rgba(255,215,80,1)" },
];

// ── Accordion item ─────────────────────────────────────────────────────────────
function AccordionItem({
  label,
  sublabel,
  accentColor,
  children,
  defaultOpen = false,
}: {
  label: string;
  sublabel?: string;
  accentColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [hov, setHov] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(defaultOpen ? undefined : 0);

  useEffect(() => {
    if (!contentRef.current) return;
    if (open) {
      setHeight(contentRef.current.scrollHeight);
      // After transition, set to auto so content can resize
      const t = setTimeout(() => setHeight(undefined), 320);
      return () => clearTimeout(t);
    } else {
      // Snap to current height first, then animate to 0
      setHeight(contentRef.current.scrollHeight);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight(0));
      });
    }
  }, [open]);

  const accent = accentColor ?? "rgba(99,155,255,0.7)";

  return (
    <div style={{
      background: hov && !open ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${open ? accent.replace(/[\d.]+\)$/, "0.25)") : "rgba(255,255,255,0.07)"}`,
      borderRadius: "5px",
      overflow: "hidden",
      transition: "border-color 0.25s, background 0.2s",
      marginBottom: "0.6rem",
    }}>
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.5rem",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: 0 }}>
          {/* Accent dot */}
          <div style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: accent,
            boxShadow: open ? `0 0 8px ${accent}` : "none",
            flexShrink: 0,
            transition: "box-shadow 0.3s",
          }} />
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "0.82rem",
            letterSpacing: "0.12em",
            color: open ? "#ffffff" : "rgba(148,163,184,0.85)",
            textTransform: "uppercase",
            transition: "color 0.2s",
          }}>{label}</span>
          {sublabel && (
            <span style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: "0.65rem",
              color: "rgba(100,116,139,0.45)",
              letterSpacing: "0.04em",
            }}>{sublabel}</span>
          )}
        </div>
        {/* Chevron */}
        <div style={{
          width: "18px", height: "18px",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.3s ease",
          color: open ? accent : "rgba(100,116,139,0.4)",
          fontSize: "10px",
        }}>▼</div>
      </button>

      {/* Collapsible content */}
      <div
        ref={contentRef}
        style={{
          height: height === undefined ? "auto" : `${height}px`,
          overflow: "hidden",
          transition: "height 0.3s ease",
        }}
      >
        <div style={{ padding: "0 1.5rem 1.5rem" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function HowItWorks() {
  const [reportOpen, setReportOpen] = useState(false);
  const [centeringOpen, setCenteringOpen] = useState(false);
  const [edgesOpen, setEdgesOpen] = useState(false);
  const [cornersOpen, setCornersOpen] = useState(false);
  const [surfaceOpen, setSurfaceOpen] = useState(false);
  const [eyeAppealOpen, setEyeAppealOpen] = useState(false);
  const [hoveredCriteria, setHoveredCriteria] = useState<string | null>(null);

  const SAMPLE_EYE_APPEAL: EyeAppealData = {
    colorVibrancy: 96, surfaceShine: 94, printQuality: 95, visualBalance: 97, finalScore: 96,
  };
  const SAMPLE_EDGES: EdgeData[] = [
    { side: "Top",    severity: "Light", note: "Tiny whitening, barely visible" },
    { side: "Bottom", severity: "Clean", note: "No visible damage" },
    { side: "Left",   severity: "Minor", note: "Visible edge wear" },
    { side: "Right",  severity: "Light", note: "Slight roughness" },
  ];
  const SAMPLE_CORNERS: CornerData[] = [
    { position: "TL", label: "Top Left",     severity: "Light", note: "Tiny white dot" },
    { position: "TR", label: "Top Right",    severity: "Minor", note: "Slight wear" },
    { position: "BL", label: "Bottom Left",  severity: "Clean", note: "Sharp, undamaged" },
    { position: "BR", label: "Bottom Right", severity: "Light", note: "Light whitening" },
  ];
  const SAMPLE_DEFECTS: SurfaceDefect[] = [
    { id: "d1", severity: "Light",    description: "Hairline scratch (top right)", x: 72, y: 18 },
    { id: "d2", severity: "Minor",    description: "Print line (center)",          x: 50, y: 50 },
    { id: "d3", severity: "Moderate", description: "Small dent (bottom edge)",     x: 35, y: 82 },
  ];

  return (
    <>
      <section
        id="how-it-works"
        style={{
          background: "linear-gradient(180deg, #080e1c 0%, #0a1020 100%)",
          paddingTop: "5rem",
          paddingBottom: "5rem",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="container" style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 2rem" }}>

          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.22em", color: "rgba(201,168,76,0.6)", textTransform: "uppercase", marginBottom: "1rem" }}>
              The System
            </div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.01em", color: "#ffffff", textTransform: "uppercase", margin: "0 0 1rem" }}>
              How Diamond Index™ Grades
            </h2>
            <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: "1rem", color: "rgba(148,163,184,0.7)", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7 }}>
              A transparent, formula-driven grading engine. Every score is calculated — not estimated.
            </p>
            <div style={{ width: "240px", height: "1px", margin: "2rem auto 0", background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.5) 50%, transparent 100%)" }} />
          </div>

          {/* ── ACCORDION ── */}
          <div>

            {/* 1. Final Score Formula */}
            <AccordionItem label="Final Score Formula" sublabel="How the number is calculated" accentColor="rgba(99,155,255,0.8)">
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "4px", padding: "1.5rem" }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "clamp(0.9rem, 2.5vw, 1.3rem)", color: "#ffffff", letterSpacing: "0.04em", lineHeight: 1.8 }}>
                  100 &nbsp;<span style={{ color: "rgba(99,155,255,0.6)" }}>−</span>&nbsp; Centering Penalty
                  &nbsp;<span style={{ color: "rgba(99,155,255,0.6)" }}>−</span>&nbsp; Edge Penalty
                  &nbsp;<span style={{ color: "rgba(99,155,255,0.6)" }}>−</span>&nbsp; Corner Penalty
                  &nbsp;<span style={{ color: "rgba(99,155,255,0.6)" }}>−</span>&nbsp; Surface Penalty
                  &nbsp;<span style={{ color: "rgba(99,155,255,0.6)" }}>−</span>&nbsp; Eye Appeal Penalty
                  &nbsp;<span style={{ color: "rgba(201,168,76,0.8)" }}>=</span>&nbsp;
                  <span style={{ color: "rgba(201,168,76,0.95)" }}>Final %</span>
                </div>
                <div style={{ marginTop: "1rem", fontFamily: "'Barlow', sans-serif", fontSize: "0.78rem", color: "rgba(100,116,139,0.6)" }}>
                  Card Value = Market Value × Grade % &nbsp;·&nbsp; Example: $2,500 × 96% = <span style={{ color: "rgba(201,168,76,0.8)" }}>$2,400</span>
                </div>
              </div>
            </AccordionItem>

            {/* 2. 5 Grading Criteria */}
            <AccordionItem label="5 Grading Criteria" sublabel="Click any criterion for a full breakdown" accentColor="rgba(99,155,255,0.8)">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.85rem", paddingTop: "0.25rem" }}>
                {CRITERIA.map(c => {
                  const isHov = hoveredCriteria === c.number;
                  return (
                    <div
                      key={c.number}
                      onClick={() => {
                        if (c.title === "Centering")  setCenteringOpen(true);
                        else if (c.title === "Edges")      setEdgesOpen(true);
                        else if (c.title === "Corners")    setCornersOpen(true);
                        else if (c.title === "Surface")    setSurfaceOpen(true);
                        else if (c.title === "Eye Appeal") setEyeAppealOpen(true);
                      }}
                      onMouseEnter={() => setHoveredCriteria(c.number)}
                      onMouseLeave={() => setHoveredCriteria(null)}
                      style={{
                        background: isHov ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.025)",
                        border: `1px solid ${isHov ? c.color.replace("0.9", "0.35") : c.glow.replace("0.15", "0.18").replace("0.12", "0.15")}`,
                        borderRadius: "5px",
                        padding: "1.25rem",
                        position: "relative",
                        overflow: "hidden",
                        cursor: "pointer",
                        transition: "background 0.25s, border-color 0.25s",
                      }}
                    >
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${c.color}, transparent)`, opacity: 0.5 }} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "0.6rem", letterSpacing: "0.15em", color: "rgba(100,116,139,0.4)", textTransform: "uppercase" }}>{c.number}</div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.1em", color: c.color, textTransform: "uppercase", background: c.glow, padding: "2px 8px", borderRadius: "2px" }}>{c.weight}</div>
                      </div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.06em", color: "#ffffff", textTransform: "uppercase", marginBottom: "0.5rem" }}>{c.title}</div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", color: "rgba(148,163,184,0.6)", lineHeight: 1.6, marginBottom: "0.5rem" }}>{c.desc}</div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.62rem", letterSpacing: "0.08em", color: "rgba(100,116,139,0.45)", textTransform: "uppercase" }}>{c.example}</div>
                      <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "5px", opacity: isHov ? 1 : 0.5, transition: "opacity 0.2s" }}>
                        <div style={{ flex: 1, height: "1px", background: "rgba(99,155,255,0.2)" }} />
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.58rem", letterSpacing: "0.18em", color: "rgba(99,155,255,0.7)", textTransform: "uppercase" }}>View Breakdown →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AccordionItem>

            {/* 3. Centering Formula */}
            <AccordionItem label="Centering Formula — Explained" sublabel="Front vs. back scoring logic" accentColor="rgba(99,155,255,0.8)">
              <div style={{ background: "rgba(99,155,255,0.03)", border: "1px solid rgba(99,155,255,0.1)", borderRadius: "4px", padding: "1.5rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", color: "rgba(148,200,255,0.8)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.6rem" }}>Front (Strict)</div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.78rem", color: "rgba(148,163,184,0.65)", lineHeight: 1.8 }}>
                      Perfect = 50 / 50<br />
                      Score = 100 − (difference × 2)<br />
                      <span style={{ color: "rgba(100,116,139,0.5)" }}>51/49 → diff 2 → score 96</span><br />
                      <span style={{ color: "rgba(100,116,139,0.5)" }}>55/45 → diff 10 → score 80</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", color: "rgba(148,200,255,0.8)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.6rem" }}>Back (More Forgiving)</div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.78rem", color: "rgba(148,163,184,0.65)", lineHeight: 1.8 }}>
                      Perfect = 60 / 40<br />
                      Score = 100 − (diff from 60/40 × 1.5)<br />
                      <span style={{ color: "rgba(100,116,139,0.5)" }}>62/38 → diff 4 → score 94</span><br />
                      <span style={{ color: "rgba(100,116,139,0.5)" }}>65/35 → diff 10 → score 85</span>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: "1.25rem", padding: "0.75rem 1rem", background: "rgba(99,155,255,0.06)", borderRadius: "4px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.1em", color: "rgba(148,200,255,0.85)", textTransform: "uppercase" }}>
                  Final Centering = (Front Score + Back Score) ÷ 2
                </div>
              </div>
            </AccordionItem>

            {/* 4. Defect System */}
            <AccordionItem label="Defect System" sublabel="How damage is scored" accentColor="rgba(239,100,80,0.7)">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", paddingTop: "0.25rem" }}>
                {DEFECTS.map(d => (
                  <div key={d.severity} style={{ display: "grid", gridTemplateColumns: "100px 1fr auto", alignItems: "center", gap: "1.5rem", padding: "0.9rem 1.25rem", background: d.bg, border: `1px solid ${d.border}`, borderRadius: "4px" }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "0.72rem", letterSpacing: "0.14em", color: d.color, textTransform: "uppercase" }}>{d.severity}</div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.78rem", color: "rgba(148,163,184,0.65)" }}>{d.examples}</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.06em", color: d.color, whiteSpace: "nowrap" }}>{d.deduction}</div>
                  </div>
                ))}
              </div>
            </AccordionItem>

            {/* 5. Diamond Rating Scale */}
            <AccordionItem label="Diamond Rating Scale" sublabel="1–5 diamonds, what each means" accentColor="rgba(201,168,76,0.8)">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingTop: "0.25rem" }}>
                {TIERS.map(t => (
                  <div key={t.name} style={{ display: "grid", gridTemplateColumns: "120px 1fr 80px", alignItems: "center", gap: "1.5rem", padding: "0.75rem 1.25rem", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "4px" }}>
                    <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                      {Array.from({ length: t.diamonds }).map((_, i) => (
                        <img key={i} src={DIAMOND_IMG} alt="" style={{ height: "18px", width: "auto", opacity: 0.9 }} />
                      ))}
                    </div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.1em", color: t.color, textTransform: "uppercase" }}>{t.name}</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.08em", color: "rgba(100,116,139,0.55)", textAlign: "right" }}>{t.range}</div>
                  </div>
                ))}
                <div style={{ padding: "0.7rem 1.25rem", background: "rgba(180,40,40,0.06)", border: "1px solid rgba(180,40,40,0.18)", borderRadius: "4px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.12em", color: "rgba(180,40,40,0.7)", textTransform: "uppercase" }}>
                  Below 80 — Not Gradeable (too many defects)
                </div>
              </div>
            </AccordionItem>

            {/* 6. Value Model */}
            <AccordionItem label="Value Model" sublabel="Grade % × Market Value" accentColor="rgba(201,168,76,0.8)">
              <div style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.05) 0%, rgba(201,168,76,0.02) 100%)", border: "1px solid rgba(201,168,76,0.12)", borderRadius: "4px", padding: "1.5rem" }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.3rem", color: "#ffffff", letterSpacing: "0.04em", marginBottom: "0.75rem" }}>
                  Card Value = Market Value × Grade %
                </div>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.82rem", color: "rgba(148,163,184,0.6)", lineHeight: 1.7 }}>
                  A card graded at 96% of a $2,500 market value is worth{" "}
                  <span style={{ color: "rgba(201,168,76,0.9)", fontWeight: 600 }}>$2,400</span>.
                  The grade is not an opinion — it is a calculated, certified number.
                </div>
              </div>
            </AccordionItem>

          </div>

          {/* CTA */}
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <button
              onClick={() => setReportOpen(true)}
              style={{ background: "transparent", border: "1px solid rgba(201,168,76,0.35)", borderRadius: "3px", padding: "0.85rem 2.25rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.18em", color: "rgba(201,168,76,0.8)", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s ease" }}
              onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = "rgba(201,168,76,0.08)"; (e.target as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.6)"; (e.target as HTMLButtonElement).style.color = "rgba(201,168,76,1)"; }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = "transparent"; (e.target as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.35)"; (e.target as HTMLButtonElement).style.color = "rgba(201,168,76,0.8)"; }}
            >
              ◆ See Sample Grading Report
            </button>
          </div>

        </div>
      </section>

      <GradingReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
      <CenteringDetailsModal open={centeringOpen} onClose={() => setCenteringOpen(false)} frontLeft={51} frontRight={49} frontScore={96} backLeft={60} backRight={40} backScore={100} finalScore={98} />
      <EdgesDetailsModal open={edgesOpen} onClose={() => setEdgesOpen(false)} edges={SAMPLE_EDGES} finalScore={91} />
      <CornersDetailsModal open={cornersOpen} onClose={() => setCornersOpen(false)} corners={SAMPLE_CORNERS} finalScore={91} />
      <SurfaceDetailsModal open={surfaceOpen} onClose={() => setSurfaceOpen(false)} defects={SAMPLE_DEFECTS} finalScore={83} />
      <EyeAppealDetailsModal open={eyeAppealOpen} onClose={() => setEyeAppealOpen(false)} data={SAMPLE_EYE_APPEAL} />
    </>
  );
}
