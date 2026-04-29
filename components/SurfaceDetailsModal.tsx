/**
 * Diamond Index™ — Surface Details Modal
 * LOCKED — do not modify without explicit instruction.
 *
 * Visual: card image with overlay defect markers (blue/yellow/red by severity)
 * Breakdown: per-defect deduction list
 * Final: total deduction → final score
 * Not Gradable: crease trigger shows red warning state
 *
 * Scale: Light -2 / Minor -5 / Moderate -10 / Major -20 / Severe (crease) -40 → NOT GRADABLE
 */

import { useEffect, useRef, useState } from "react";

const SEVERITY_COLOR: Record<string, string> = {
  Light:    "rgba(99,155,255,0.9)",
  Minor:    "rgba(201,168,76,0.9)",
  Moderate: "rgba(239,140,60,0.9)",
  Major:    "rgba(239,80,60,0.9)",
  Crease:   "rgba(239,40,40,0.95)",
};
const MARKER_COLOR: Record<string, string> = {
  Light:    "#4a9eff",
  Minor:    "#c9a84c",
  Moderate: "#ef8c3c",
  Major:    "#ef503c",
  Crease:   "#ef2828",
};
const DEDUCTION: Record<string, number> = {
  Light: -2, Minor: -5, Moderate: -10, Major: -20, Crease: -40,
};

export interface SurfaceDefect {
  id: string;
  severity: keyof typeof DEDUCTION;
  description: string;
  // position as % of card width/height (0-100)
  x: number;
  y: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  defects: SurfaceDefect[];
  finalScore: number;
  notGradable?: boolean;
  cardImageUrl?: string;
}

const DEFAULT_CARD = "https://images.unsplash.com/photo-1612404730960-5c71577fca11?w=400&q=80";

export default function SurfaceDetailsModal({ open, onClose, defects, finalScore, notGradable = false, cardImageUrl }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  const [scanPhase, setScanPhase] = useState(0);
  const [hoveredDefect, setHoveredDefect] = useState<string | null>(null);

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

  const totalDeduction = defects.reduce((s, d) => s + DEDUCTION[d.severity], 0);
  const hasCrease = defects.some(d => d.severity === "Crease");

  return (
    <div ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflow: "hidden", animation: "surfFadeIn 0.2s ease" }}>
      <style>{`
        @keyframes surfFadeIn { from{opacity:0}to{opacity:1} }
        @keyframes surfSlideUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes surfScan { 0%{top:-2px;opacity:0.6}100%{top:100%;opacity:0} }
        @keyframes surfGrid { 0%,100%{opacity:0.03}50%{opacity:0.07} }
        @keyframes surfBlink { 0%,100%{opacity:0.5}50%{opacity:1} }
        @keyframes markerPulse { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.9} 50%{transform:translate(-50%,-50%) scale(1.3);opacity:0.6} }
        @keyframes notGradableFlash { 0%,100%{opacity:1}50%{opacity:0.7} }
        .surf-modal-panel { animation: surfSlideUp 0.28s ease; }
        .surf-modal-panel::-webkit-scrollbar{width:4px}
        .surf-modal-panel::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
      `}</style>

      {/* Scan overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(2,8,20,0.88)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", zIndex: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,180,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,180,255,0.05) 1px,transparent 1px)", backgroundSize: "48px 48px", animation: "surfGrid 3s ease-in-out infinite" }} />
        {scanPhase === 1 && <div style={{ position: "absolute", left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,rgba(0,200,255,0.9) 50%,transparent)", boxShadow: "0 0 20px rgba(0,200,255,0.4)", animation: "surfScan 0.9s linear forwards", zIndex: 1 }} />}
        <div style={{ position: "absolute", bottom: "2rem", right: "2rem", fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: "0.58rem", letterSpacing: "0.25em", color: hasCrease ? "rgba(239,68,68,0.8)" : scanPhase < 2 ? "rgba(0,200,255,0.7)" : "rgba(100,200,130,0.7)", textTransform: "uppercase", animation: "surfBlink 1.2s ease-in-out infinite", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: hasCrease ? "rgba(239,68,68,0.9)" : scanPhase < 2 ? "rgba(0,200,255,0.8)" : "rgba(100,200,130,0.8)", display: "inline-block" }} />
          {hasCrease ? "⚠ Crease Detected" : scanPhase < 2 ? "Scanning Surface…" : "Surface Analysis Complete"}
        </div>
        {[{top:"1.5rem",left:"1.5rem",borderTop:"1px solid rgba(0,200,255,0.3)",borderLeft:"1px solid rgba(0,200,255,0.3)"},{top:"1.5rem",right:"1.5rem",borderTop:"1px solid rgba(0,200,255,0.3)",borderRight:"1px solid rgba(0,200,255,0.3)"},{bottom:"1.5rem",left:"1.5rem",borderBottom:"1px solid rgba(0,200,255,0.3)",borderLeft:"1px solid rgba(0,200,255,0.3)"},{bottom:"1.5rem",right:"1.5rem",borderBottom:"1px solid rgba(0,200,255,0.3)",borderRight:"1px solid rgba(0,200,255,0.3)"}].map((s,i)=><div key={i} style={{position:"absolute",width:"20px",height:"20px",...s}}/>)}
      </div>

      {/* Panel */}
      <div className="surf-modal-panel" style={{ background: "rgba(7,16,31,0.97)", border: `1px solid ${hasCrease ? "rgba(239,68,68,0.25)" : "rgba(0,180,255,0.15)"}`, borderRadius: "6px", width: "100%", maxWidth: "560px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 40px 100px rgba(0,0,0,0.85),0 0 60px rgba(0,150,255,0.08)", position: "relative", zIndex: 1 }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: hasCrease ? "linear-gradient(90deg,transparent,rgba(239,68,68,0.9) 50%,transparent)" : "linear-gradient(90deg,transparent,rgba(20,100,220,0.6) 25%,rgba(0,200,255,0.95) 50%,rgba(20,100,220,0.6) 75%,transparent)", borderRadius: "6px 6px 0 0" }} />
        <button onClick={onClose} style={{ position: "absolute", top: "14px", right: "14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(148,163,184,0.6)", fontSize: "13px", zIndex: 2 }} onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.1)")} onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.04)")}>✕</button>

        <div style={{ padding: "1.75rem" }}>
          {/* Header */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.22em", color: hasCrease ? "rgba(239,68,68,0.9)" : "rgba(99,155,255,0.9)", textTransform: "uppercase", marginBottom: "0.75rem" }}>Surface Analysis</div>
            <div style={{ height: "1px", background: hasCrease ? "rgba(239,68,68,0.2)" : "rgba(0,180,255,0.12)", marginBottom: "0.9rem" }} />
            <p style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 300, fontSize: "0.78rem", lineHeight: 1.6, color: "rgba(148,163,184,0.65)", margin: 0 }}>
              Front and back surfaces scanned for scratches, print lines, dents, and creases. Markers indicate defect location and severity.
            </p>
          </div>

          {/* NOT GRADABLE banner */}
          {(hasCrease || notGradable) && (
            <div style={{ marginBottom: "1.25rem", padding: "1rem 1.25rem", background: "rgba(239,40,40,0.08)", border: "1px solid rgba(239,40,40,0.3)", borderRadius: "4px", display: "flex", alignItems: "center", gap: "0.75rem", animation: "notGradableFlash 1.5s ease-in-out infinite" }}>
              <div style={{ fontSize: "1.1rem" }}>⚠</div>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.15em", color: "rgba(239,68,68,0.95)", textTransform: "uppercase" }}>Crease Detected — Not Gradable</div>
                <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: "0.68rem", color: "rgba(239,68,68,0.6)", marginTop: "2px" }}>This card cannot be certified. Creases cause structural damage that cannot be scored.</div>
              </div>
            </div>
          )}

          <div style={{ height: "1px", background: "rgba(255,255,255,0.04)", marginBottom: "1.25rem" }} />

          {/* Card image with defect markers */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(201,168,76,0.7)", textTransform: "uppercase", marginBottom: "0.75rem" }}>Surface Map</div>
            <div style={{ position: "relative", width: "100%", maxWidth: "220px", margin: "0 auto", display: "block" }}>
              {/* Card image */}
              <div style={{
                position: "relative",
                width: "100%",
                maxWidth: "180px",
                margin: "0 auto",
                aspectRatio: "2.5/3.5",
                borderRadius: "4px",
                overflow: "hidden",
                border: `1px solid ${hasCrease ? "rgba(239,68,68,0.3)" : "rgba(99,155,255,0.2)"}`,
                opacity: animate ? 1 : 0,
                transition: "opacity 0.4s ease",
              }}>
                <img
                  src={cardImageUrl ?? DEFAULT_CARD}
                  alt="Card surface"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "brightness(0.7) saturate(0.8)" }}
                />
                {/* Scan grid overlay */}
                <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,180,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,180,255,0.06) 1px,transparent 1px)", backgroundSize: "20px 20px" }} />

                {/* Defect markers */}
                {defects.map((d, i) => {
                  const isHov = hoveredDefect === d.id;
                  return (
                    <div
                      key={d.id}
                      onMouseEnter={() => setHoveredDefect(d.id)}
                      onMouseLeave={() => setHoveredDefect(null)}
                      style={{
                        position: "absolute",
                        left: `${d.x}%`,
                        top: `${d.y}%`,
                        transform: "translate(-50%, -50%)",
                        width: isHov ? "14px" : "10px",
                        height: isHov ? "14px" : "10px",
                        borderRadius: "50%",
                        background: MARKER_COLOR[d.severity],
                        boxShadow: `0 0 ${isHov ? "12px" : "6px"} ${MARKER_COLOR[d.severity]}`,
                        cursor: "default",
                        transition: "width 0.2s, height 0.2s, box-shadow 0.2s",
                        animation: `markerPulse ${1.5 + i * 0.3}s ease-in-out infinite`,
                        opacity: animate ? 1 : 0,
                        zIndex: 2,
                      }}
                    />
                  );
                })}
              </div>

              {/* Legend */}
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "0.75rem", flexWrap: "wrap" }}>
                {["Light", "Minor", "Moderate", "Major", "Crease"].map(s => (
                  defects.some(d => d.severity === s) && (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: MARKER_COLOR[s], boxShadow: `0 0 4px ${MARKER_COLOR[s]}` }} />
                      <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: "0.6rem", color: "rgba(100,116,139,0.55)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.04)", marginBottom: "1.25rem" }} />

          {/* Breakdown list */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(201,168,76,0.7)", textTransform: "uppercase", marginBottom: "0.75rem" }}>Defect Breakdown</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {defects.map((d, i) => {
                const ded = DEDUCTION[d.severity];
                const col = SEVERITY_COLOR[d.severity];
                const isHov = hoveredDefect === d.id;
                return (
                  <div key={d.id}
                    onMouseEnter={() => setHoveredDefect(d.id)}
                    onMouseLeave={() => setHoveredDefect(null)}
                    style={{ display: "flex", alignItems: "center", padding: "0.5rem 0.75rem", background: isHov ? "rgba(255,255,255,0.04)" : "transparent", borderRadius: "3px", cursor: "default", opacity: animate ? 1 : 0, transition: `opacity 0.4s ease ${0.2 + i * 0.08}s, background 0.2s` }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: MARKER_COLOR[d.severity], boxShadow: `0 0 5px ${MARKER_COLOR[d.severity]}`, marginRight: "0.65rem", flexShrink: 0 }} />
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.08em", color: col, textTransform: "uppercase", minWidth: "72px" }}>{d.severity}</div>
                    <div style={{ flex: 1, fontFamily: "'Barlow',sans-serif", fontSize: "0.72rem", color: "rgba(100,116,139,0.55)" }}>{d.description}</div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.85rem", color: col, minWidth: "48px", textAlign: "right" }}>{ded} pts</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.04)", marginBottom: "1.25rem" }} />

          {/* Final score or Not Gradable */}
          {hasCrease || notGradable ? (
            <div style={{ textAlign: "center", padding: "1.5rem", opacity: animate ? 1 : 0, transition: "opacity 0.5s ease 0.6s" }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.22em", color: "rgba(239,68,68,0.6)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Card Condition</div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "rgba(239,68,68,0.9)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Not Gradable</div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", opacity: animate ? 1 : 0, transition: "opacity 0.5s ease 0.6s" }}>
              <div>
                <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: "0.58rem", letterSpacing: "0.2em", color: "rgba(201,168,76,0.65)", textTransform: "uppercase", marginBottom: "4px" }}>Final Surface Score</div>
                <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: "0.68rem", color: "rgba(100,116,139,0.45)" }}>Total deduction: {totalDeduction} pts &nbsp;·&nbsp; Weight: 20%</div>
              </div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "2.5rem", color: "rgba(201,168,76,0.95)", lineHeight: 1 }}>{finalScore}</div>
            </div>
          )}

          {/* Scale reference */}
          <div style={{ marginTop: "1.25rem", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "3px" }}>
            <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: "0.55rem", letterSpacing: "0.18em", color: "rgba(100,116,139,0.45)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Deduction Scale</div>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {Object.entries(DEDUCTION).map(([k, v]) => (
                <span key={k} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "0.68rem", color: SEVERITY_COLOR[k] }}>{k} {v}{k === "Crease" ? " → Not Gradable" : ""}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
