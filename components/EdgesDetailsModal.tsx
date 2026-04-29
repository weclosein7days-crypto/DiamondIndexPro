/**
 * Diamond Index™ — Edges Details Modal
 * LOCKED — do not modify without explicit instruction.
 *
 * Visual: card outline with 4 hoverable sides, each glowing by severity
 * Breakdown: per-edge deduction list
 * Final: total deduction → final score
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
  Clean:    "rgba(100,200,130,0.25)",
  Light:    "rgba(99,155,255,0.25)",
  Minor:    "rgba(201,168,76,0.25)",
  Moderate: "rgba(239,140,60,0.3)",
  Major:    "rgba(239,80,60,0.35)",
  Severe:   "rgba(239,40,40,0.4)",
};
const DEDUCTION: Record<string, number> = {
  Clean: 0, Light: -2, Minor: -5, Moderate: -10, Major: -18, Severe: -30,
};

export interface EdgeData {
  side: "Top" | "Bottom" | "Left" | "Right";
  severity: keyof typeof DEDUCTION;
  note: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  edges: EdgeData[];
  finalScore: number;
}

export default function EdgesDetailsModal({ open, onClose, edges, finalScore }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  const [scanPhase, setScanPhase] = useState(0);
  const [hoveredSide, setHoveredSide] = useState<string | null>(null);

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

  const totalDeduction = edges.reduce((s, e) => s + DEDUCTION[e.severity], 0);
  const getEdge = (side: string) => edges.find(e => e.side === side);

  // ── Card diagram ────────────────────────────────────────────────────────────
  const CardDiagram = () => {
    const W = 100, H = 136; // card proportions
    const PAD = 44; // space around card for labels

    const sideStyle = (side: string, isHoriz: boolean): React.CSSProperties => {
      const e = getEdge(side);
      const hov = hoveredSide === side;
      const color = e ? SEVERITY_COLOR[e.severity] : "rgba(255,255,255,0.1)";
      const glow = e ? SEVERITY_GLOW[e.severity] : "transparent";
      return {
        position: "absolute",
        background: hov ? color : (e && e.severity !== "Clean" ? color.replace("0.9", "0.45") : "rgba(255,255,255,0.12)"),
        boxShadow: hov ? `0 0 14px ${glow}` : "none",
        transition: "background 0.25s, box-shadow 0.25s",
        cursor: "default",
        ...(isHoriz
          ? { left: 0, right: 0, height: "3px", borderRadius: "2px" }
          : { top: 0, bottom: 0, width: "3px", borderRadius: "2px" }),
      };
    };

    return (
      <div style={{ position: "relative", width: `${W + PAD * 2}px`, height: `${H + PAD * 2}px`, margin: "0 auto" }}>
        {/* Card body */}
        <div style={{
          position: "absolute",
          left: PAD, top: PAD,
          width: W, height: H,
          border: "1px solid rgba(99,155,255,0.15)",
          borderRadius: "4px",
          background: "rgba(99,155,255,0.03)",
          opacity: animate ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}>
          {/* Card inner lines (subtle) */}
          <div style={{ position: "absolute", inset: "12px", border: "1px dashed rgba(255,255,255,0.04)", borderRadius: "2px" }} />
        </div>

        {/* TOP edge bar */}
        <div
          onMouseEnter={() => setHoveredSide("Top")}
          onMouseLeave={() => setHoveredSide(null)}
          style={{ position: "absolute", left: PAD, right: PAD, top: PAD - 2, ...sideStyle("Top", true), opacity: animate ? 1 : 0, transition: "opacity 0.4s 0.1s, background 0.25s, box-shadow 0.25s" }}
        />
        {/* BOTTOM edge bar */}
        <div
          onMouseEnter={() => setHoveredSide("Bottom")}
          onMouseLeave={() => setHoveredSide(null)}
          style={{ position: "absolute", left: PAD, right: PAD, top: PAD + H - 1, ...sideStyle("Bottom", true), opacity: animate ? 1 : 0, transition: "opacity 0.4s 0.15s, background 0.25s, box-shadow 0.25s" }}
        />
        {/* LEFT edge bar */}
        <div
          onMouseEnter={() => setHoveredSide("Left")}
          onMouseLeave={() => setHoveredSide(null)}
          style={{ position: "absolute", top: PAD, bottom: PAD, left: PAD - 2, ...sideStyle("Left", false), opacity: animate ? 1 : 0, transition: "opacity 0.4s 0.2s, background 0.25s, box-shadow 0.25s" }}
        />
        {/* RIGHT edge bar */}
        <div
          onMouseEnter={() => setHoveredSide("Right")}
          onMouseLeave={() => setHoveredSide(null)}
          style={{ position: "absolute", top: PAD, bottom: PAD, left: PAD + W - 1, ...sideStyle("Right", false), opacity: animate ? 1 : 0, transition: "opacity 0.4s 0.25s, background 0.25s, box-shadow 0.25s" }}
        />

        {/* Labels */}
        {/* TOP label */}
        {(() => { const e = getEdge("Top"); return e ? (
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", textAlign: "center", opacity: animate ? 1 : 0, transition: "opacity 0.4s 0.3s" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.1em", color: SEVERITY_COLOR[e.severity], textTransform: "uppercase" }}>{e.side}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", color: SEVERITY_COLOR[e.severity] }}>{DEDUCTION[e.severity] === 0 ? "Clean" : `${DEDUCTION[e.severity]}`}</div>
          </div>
        ) : null; })()}
        {/* BOTTOM label */}
        {(() => { const e = getEdge("Bottom"); return e ? (
          <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", textAlign: "center", opacity: animate ? 1 : 0, transition: "opacity 0.4s 0.35s" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.1em", color: SEVERITY_COLOR[e.severity], textTransform: "uppercase" }}>{e.side}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", color: SEVERITY_COLOR[e.severity] }}>{DEDUCTION[e.severity] === 0 ? "Clean" : `${DEDUCTION[e.severity]}`}</div>
          </div>
        ) : null; })()}
        {/* LEFT label */}
        {(() => { const e = getEdge("Left"); return e ? (
          <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", textAlign: "center", opacity: animate ? 1 : 0, transition: "opacity 0.4s 0.4s" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.1em", color: SEVERITY_COLOR[e.severity], textTransform: "uppercase" }}>{e.side}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", color: SEVERITY_COLOR[e.severity] }}>{DEDUCTION[e.severity] === 0 ? "Clean" : `${DEDUCTION[e.severity]}`}</div>
          </div>
        ) : null; })()}
        {/* RIGHT label */}
        {(() => { const e = getEdge("Right"); return e ? (
          <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", textAlign: "center", opacity: animate ? 1 : 0, transition: "opacity 0.4s 0.45s" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.1em", color: SEVERITY_COLOR[e.severity], textTransform: "uppercase" }}>{e.side}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", color: SEVERITY_COLOR[e.severity] }}>{DEDUCTION[e.severity] === 0 ? "Clean" : `${DEDUCTION[e.severity]}`}</div>
          </div>
        ) : null; })()}
      </div>
    );
  };

  return (
    <div ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflow: "hidden", animation: "edgeFadeIn 0.2s ease" }}>
      <style>{`
        @keyframes edgeFadeIn { from{opacity:0}to{opacity:1} }
        @keyframes edgeSlideUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes edgeScan { 0%{top:-2px;opacity:0.6}100%{top:100%;opacity:0} }
        @keyframes edgeGrid { 0%,100%{opacity:0.03}50%{opacity:0.07} }
        @keyframes edgeBlink { 0%,100%{opacity:0.5}50%{opacity:1} }
        .edge-modal-panel { animation: edgeSlideUp 0.28s ease; }
        .edge-modal-panel::-webkit-scrollbar{width:4px}
        .edge-modal-panel::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
      `}</style>

      {/* Scan overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(2,8,20,0.88)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", zIndex: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,180,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,180,255,0.05) 1px,transparent 1px)", backgroundSize: "48px 48px", animation: "edgeGrid 3s ease-in-out infinite" }} />
        {scanPhase === 1 && <div style={{ position: "absolute", left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,rgba(0,200,255,0.9) 50%,transparent)", boxShadow: "0 0 20px rgba(0,200,255,0.4)", animation: "edgeScan 0.9s linear forwards", zIndex: 1 }} />}
        <div style={{ position: "absolute", bottom: "2rem", right: "2rem", fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: "0.58rem", letterSpacing: "0.25em", color: scanPhase < 2 ? "rgba(0,200,255,0.7)" : "rgba(100,200,130,0.7)", textTransform: "uppercase", animation: "edgeBlink 1.2s ease-in-out infinite", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: scanPhase < 2 ? "rgba(0,200,255,0.8)" : "rgba(100,200,130,0.8)", display: "inline-block" }} />
          {scanPhase < 2 ? "Scanning Edges…" : "Edge Analysis Complete"}
        </div>
        {[{top:"1.5rem",left:"1.5rem",borderTop:"1px solid rgba(0,200,255,0.3)",borderLeft:"1px solid rgba(0,200,255,0.3)"},{top:"1.5rem",right:"1.5rem",borderTop:"1px solid rgba(0,200,255,0.3)",borderRight:"1px solid rgba(0,200,255,0.3)"},{bottom:"1.5rem",left:"1.5rem",borderBottom:"1px solid rgba(0,200,255,0.3)",borderLeft:"1px solid rgba(0,200,255,0.3)"},{bottom:"1.5rem",right:"1.5rem",borderBottom:"1px solid rgba(0,200,255,0.3)",borderRight:"1px solid rgba(0,200,255,0.3)"}].map((s,i)=><div key={i} style={{position:"absolute",width:"20px",height:"20px",...s}}/>)}
      </div>

      {/* Panel */}
      <div className="edge-modal-panel" style={{ background: "rgba(7,16,31,0.97)", border: "1px solid rgba(0,180,255,0.15)", borderRadius: "6px", width: "100%", maxWidth: "520px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 40px 100px rgba(0,0,0,0.85),0 0 60px rgba(0,150,255,0.08)", position: "relative", zIndex: 1 }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,rgba(20,100,220,0.6) 25%,rgba(0,200,255,0.95) 50%,rgba(20,100,220,0.6) 75%,transparent)", borderRadius: "6px 6px 0 0" }} />
        <button onClick={onClose} style={{ position: "absolute", top: "14px", right: "14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(148,163,184,0.6)", fontSize: "13px", zIndex: 2 }} onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.1)")} onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.04)")}>✕</button>

        <div style={{ padding: "1.75rem" }}>
          {/* Header */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.22em", color: "rgba(99,155,255,0.9)", textTransform: "uppercase", marginBottom: "0.75rem" }}>Edge Analysis</div>
            <div style={{ height: "1px", background: "rgba(0,180,255,0.12)", marginBottom: "0.9rem" }} />
            <p style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 300, fontSize: "0.78rem", lineHeight: 1.6, color: "rgba(148,163,184,0.65)", margin: 0 }}>
              All four edges are evaluated individually. Hover each side to inspect. The final score is the weighted average across all edges.
            </p>
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.04)", marginBottom: "1.25rem" }} />

          {/* Card diagram */}
          <CardDiagram />

          <div style={{ height: "1px", background: "rgba(255,255,255,0.04)", margin: "1.25rem 0" }} />

          {/* Breakdown list */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(201,168,76,0.7)", textTransform: "uppercase", marginBottom: "0.75rem" }}>Scoring Breakdown</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {edges.map((e, i) => {
                const ded = DEDUCTION[e.severity];
                const col = SEVERITY_COLOR[e.severity];
                const isHov = hoveredSide === e.side;
                return (
                  <div key={i}
                    onMouseEnter={() => setHoveredSide(e.side)}
                    onMouseLeave={() => setHoveredSide(null)}
                    style={{ display: "flex", alignItems: "center", padding: "0.5rem 0.75rem", background: isHov ? "rgba(255,255,255,0.04)" : "transparent", borderRadius: "3px", cursor: "default", opacity: animate ? 1 : 0, transition: `opacity 0.4s ease ${0.2 + i * 0.08}s, background 0.2s` }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.08em", color: "rgba(148,163,184,0.7)", textTransform: "uppercase", minWidth: "80px" }}>{e.side} Edge</div>
                    <div style={{ flex: 1, fontFamily: "'Barlow',sans-serif", fontSize: "0.72rem", color: "rgba(100,116,139,0.55)" }}>{e.note}</div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.85rem", color: col, minWidth: "48px", textAlign: "right" }}>{ded === 0 ? "Clean" : `${ded} pts`}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.04)", marginBottom: "1.25rem" }} />

          {/* Final score */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", opacity: animate ? 1 : 0, transition: "opacity 0.5s ease 0.6s" }}>
            <div>
              <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: "0.58rem", letterSpacing: "0.2em", color: "rgba(201,168,76,0.65)", textTransform: "uppercase", marginBottom: "4px" }}>Final Edge Score</div>
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
