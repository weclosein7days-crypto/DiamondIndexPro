/**
 * Diamond Index™ — Corners Details Modal
 * LOCKED — do not modify without explicit instruction.
 *
 * Visual: 2×2 corner grid, each corner highlighted by severity on hover
 * Breakdown: per-corner deduction list
 * Final: average of 4 corners → final score
 * Scale: Light -2 / Minor -5 / Moderate -10 / Major -18 / Severe -30
 */

import { useEffect, useRef, useState } from "react";

const SEVERITY_COLOR: Record<string, string> = {
  Clean:    "rgba(100,200,130,0.9)",
  Light:    "rgba(99,155,255,0.9)",
  Minor:    "rgba(201,168,76,0.9)",
  Moderate: "rgba(239,140,60,0.9)",
  Major:    "rgba(239,80,60,0.9)",
  Severe:   "rgba(239,40,40,0.9)",
};
const SEVERITY_GLOW: Record<string, string> = {
  Clean:    "rgba(100,200,130,0.3)",
  Light:    "rgba(99,155,255,0.3)",
  Minor:    "rgba(201,168,76,0.3)",
  Moderate: "rgba(239,140,60,0.35)",
  Major:    "rgba(239,80,60,0.4)",
  Severe:   "rgba(239,40,40,0.45)",
};
const DEDUCTION: Record<string, number> = {
  Clean: 0, Light: -2, Minor: -5, Moderate: -10, Major: -18, Severe: -30,
};

export interface CornerData {
  position: "TL" | "TR" | "BL" | "BR";
  label: string;
  severity: keyof typeof DEDUCTION;
  note: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  corners: CornerData[];
  finalScore: number;
}

export default function CornersDetailsModal({ open, onClose, corners, finalScore }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  const [scanPhase, setScanPhase] = useState(0);
  const [hoveredCorner, setHoveredCorner] = useState<string | null>(null);

  useEffect(() => {
    if (!open) { setAnimate(false); setScanPhase(0); return; }
    setScanPhase(1);
    const t = setTimeout(() => { setAnimate(true); setScanPhase(2); }, 350);
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => { clearTimeout(t); window.removeEventListener("keydown", esc); };
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const totalDeduction = corners.reduce((s, c) => s + DEDUCTION[c.severity], 0);
  const getCorner = (pos: string) => corners.find(c => c.position === pos);

  // ── Corner diagram ──────────────────────────────────────────────────────────
  const CornerDiagram = () => {
    const POSITIONS = [
      { pos: "TL", gridRow: 1, gridCol: 1 },
      { pos: "TR", gridRow: 1, gridCol: 2 },
      { pos: "BL", gridRow: 2, gridCol: 1 },
      { pos: "BR", gridRow: 2, gridCol: 2 },
    ];

    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", maxWidth: "280px", margin: "0 auto" }}>
        {POSITIONS.map(({ pos }) => {
          const c = getCorner(pos);
          const isHov = hoveredCorner === pos;
          const col = c ? SEVERITY_COLOR[c.severity] : "rgba(255,255,255,0.15)";
          const glow = c ? SEVERITY_GLOW[c.severity] : "transparent";

          return (
            <div
              key={pos}
              onMouseEnter={() => setHoveredCorner(pos)}
              onMouseLeave={() => setHoveredCorner(null)}
              style={{
                padding: "1rem",
                background: isHov ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${isHov ? col.replace("0.9", "0.4") : "rgba(255,255,255,0.07)"}`,
                borderRadius: "4px",
                cursor: "default",
                transition: "background 0.25s, border-color 0.25s",
                boxShadow: isHov ? `0 0 18px ${glow}` : "none",
                opacity: animate ? 1 : 0,
                transitionProperty: "opacity, background, border-color, box-shadow",
                transitionDuration: `0.4s, 0.25s, 0.25s, 0.25s`,
                transitionDelay: `${pos === "TL" ? "0.1s" : pos === "TR" ? "0.18s" : pos === "BL" ? "0.26s" : "0.34s"}, 0s, 0s, 0s`,
              }}
            >
              {/* Corner bracket visual */}
              <div style={{ position: "relative", width: "28px", height: "28px", marginBottom: "0.6rem" }}>
                <div style={{
                  position: "absolute",
                  width: "14px", height: "14px",
                  borderColor: col,
                  borderStyle: "solid",
                  borderWidth: 0,
                  ...(pos === "TL" ? { top: 0, left: 0, borderTopWidth: "2px", borderLeftWidth: "2px" } :
                     pos === "TR" ? { top: 0, right: 0, borderTopWidth: "2px", borderRightWidth: "2px" } :
                     pos === "BL" ? { bottom: 0, left: 0, borderBottomWidth: "2px", borderLeftWidth: "2px" } :
                                    { bottom: 0, right: 0, borderBottomWidth: "2px", borderRightWidth: "2px" }),
                  boxShadow: isHov ? `0 0 8px ${glow}` : "none",
                  transition: "box-shadow 0.25s",
                }} />
              </div>

              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.12em", color: "rgba(148,163,184,0.5)", textTransform: "uppercase", marginBottom: "3px" }}>
                {c?.label ?? pos}
              </div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1rem", color: col, lineHeight: 1, marginBottom: "2px" }}>
                {DEDUCTION[c?.severity ?? "Clean"] === 0 ? "Clean" : `${DEDUCTION[c?.severity ?? "Clean"]} pts`}
              </div>
              <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: "0.6rem", color: "rgba(100,116,139,0.45)", lineHeight: 1.4 }}>
                {c?.note ?? "—"}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflow: "hidden", animation: "cornFadeIn 0.2s ease" }}>
      <style>{`
        @keyframes cornFadeIn { from{opacity:0}to{opacity:1} }
        @keyframes cornSlideUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes cornScan { 0%{top:-2px;opacity:0.6}100%{top:100%;opacity:0} }
        @keyframes cornGrid { 0%,100%{opacity:0.03}50%{opacity:0.07} }
        @keyframes cornBlink { 0%,100%{opacity:0.5}50%{opacity:1} }
        .corn-modal-panel { animation: cornSlideUp 0.28s ease; }
        .corn-modal-panel::-webkit-scrollbar{width:4px}
        .corn-modal-panel::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
      `}</style>

      {/* Scan overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(2,8,20,0.88)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", zIndex: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,180,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,180,255,0.05) 1px,transparent 1px)", backgroundSize: "48px 48px", animation: "cornGrid 3s ease-in-out infinite" }} />
        {scanPhase === 1 && <div style={{ position: "absolute", left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,rgba(0,200,255,0.9) 50%,transparent)", boxShadow: "0 0 20px rgba(0,200,255,0.4)", animation: "cornScan 0.9s linear forwards", zIndex: 1 }} />}
        <div style={{ position: "absolute", bottom: "2rem", right: "2rem", fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: "0.58rem", letterSpacing: "0.25em", color: scanPhase < 2 ? "rgba(0,200,255,0.7)" : "rgba(100,200,130,0.7)", textTransform: "uppercase", animation: "cornBlink 1.2s ease-in-out infinite", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: scanPhase < 2 ? "rgba(0,200,255,0.8)" : "rgba(100,200,130,0.8)", display: "inline-block" }} />
          {scanPhase < 2 ? "Scanning Corners…" : "Corner Analysis Complete"}
        </div>
        {[{top:"1.5rem",left:"1.5rem",borderTop:"1px solid rgba(0,200,255,0.3)",borderLeft:"1px solid rgba(0,200,255,0.3)"},{top:"1.5rem",right:"1.5rem",borderTop:"1px solid rgba(0,200,255,0.3)",borderRight:"1px solid rgba(0,200,255,0.3)"},{bottom:"1.5rem",left:"1.5rem",borderBottom:"1px solid rgba(0,200,255,0.3)",borderLeft:"1px solid rgba(0,200,255,0.3)"},{bottom:"1.5rem",right:"1.5rem",borderBottom:"1px solid rgba(0,200,255,0.3)",borderRight:"1px solid rgba(0,200,255,0.3)"}].map((s,i)=><div key={i} style={{position:"absolute",width:"20px",height:"20px",...s}}/>)}
      </div>

      {/* Panel */}
      <div className="corn-modal-panel" style={{ background: "rgba(7,16,31,0.97)", border: "1px solid rgba(0,180,255,0.15)", borderRadius: "6px", width: "100%", maxWidth: "520px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 40px 100px rgba(0,0,0,0.85),0 0 60px rgba(0,150,255,0.08)", position: "relative", zIndex: 1 }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,rgba(20,100,220,0.6) 25%,rgba(0,200,255,0.95) 50%,rgba(20,100,220,0.6) 75%,transparent)", borderRadius: "6px 6px 0 0" }} />
        <button onClick={onClose} style={{ position: "absolute", top: "14px", right: "14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(148,163,184,0.6)", fontSize: "13px", zIndex: 2 }} onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.1)")} onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.04)")}>✕</button>

        <div style={{ padding: "1.75rem" }}>
          {/* Header */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.22em", color: "rgba(99,155,255,0.9)", textTransform: "uppercase", marginBottom: "0.75rem" }}>Corner Analysis</div>
            <div style={{ height: "1px", background: "rgba(0,180,255,0.12)", marginBottom: "0.9rem" }} />
            <p style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 300, fontSize: "0.78rem", lineHeight: 1.6, color: "rgba(148,163,184,0.65)", margin: 0 }}>
              All four corners are graded individually. The final score is the average — one bad corner does not destroy the whole grade.
            </p>
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.04)", marginBottom: "1.25rem" }} />

          {/* Corner grid */}
          <CornerDiagram />

          <div style={{ height: "1px", background: "rgba(255,255,255,0.04)", margin: "1.25rem 0" }} />

          {/* Breakdown list */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(201,168,76,0.7)", textTransform: "uppercase", marginBottom: "0.75rem" }}>Scoring Breakdown</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {corners.map((c, i) => {
                const ded = DEDUCTION[c.severity];
                const col = SEVERITY_COLOR[c.severity];
                const isHov = hoveredCorner === c.position;
                return (
                  <div key={i}
                    onMouseEnter={() => setHoveredCorner(c.position)}
                    onMouseLeave={() => setHoveredCorner(null)}
                    style={{ display: "flex", alignItems: "center", padding: "0.5rem 0.75rem", background: isHov ? "rgba(255,255,255,0.04)" : "transparent", borderRadius: "3px", cursor: "default", opacity: animate ? 1 : 0, transition: `opacity 0.4s ease ${0.2 + i * 0.08}s, background 0.2s` }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.08em", color: "rgba(148,163,184,0.7)", textTransform: "uppercase", minWidth: "90px" }}>{c.label}</div>
                    <div style={{ flex: 1, fontFamily: "'Barlow',sans-serif", fontSize: "0.72rem", color: "rgba(100,116,139,0.55)" }}>{c.note}</div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.85rem", color: col, minWidth: "48px", textAlign: "right" }}>{ded === 0 ? "Clean" : `${ded} pts`}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Average formula */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1.25rem", opacity: animate ? 1 : 0, transition: "opacity 0.5s ease 0.55s" }}>
            <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: "0.65rem", color: "rgba(100,116,139,0.5)" }}>
              ({corners.map(c => 100 + DEDUCTION[c.severity]).join(" + ")}) ÷ 4 =
            </span>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "rgba(201,168,76,0.95)" }}>{finalScore}</span>
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.04)", marginBottom: "1.25rem" }} />

          {/* Final score */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", opacity: animate ? 1 : 0, transition: "opacity 0.5s ease 0.65s" }}>
            <div>
              <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: "0.58rem", letterSpacing: "0.2em", color: "rgba(201,168,76,0.65)", textTransform: "uppercase", marginBottom: "4px" }}>Final Corner Score</div>
              <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: "0.68rem", color: "rgba(100,116,139,0.45)" }}>Total deduction: {totalDeduction} pts &nbsp;·&nbsp; Weight: 15%</div>
            </div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "2.5rem", color: "rgba(201,168,76,0.95)", lineHeight: 1 }}>{finalScore}</div>
          </div>

          {/* Scale reference */}
          <div style={{ marginTop: "1.25rem", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "3px" }}>
            <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: "0.55rem", letterSpacing: "0.18em", color: "rgba(100,116,139,0.45)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Deduction Scale</div>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {Object.entries(DEDUCTION).filter(([k]) => k !== "Clean").map(([k, v]) => (
                <span key={k} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.68rem", color: SEVERITY_COLOR[k] }}>{k} {v}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
