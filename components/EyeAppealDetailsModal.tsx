/**
 * Diamond Index™ — Eye Appeal Details Modal
 * LOCKED — do not modify without explicit instruction.
 *
 * Visual: card image with glow/shimmer effect, before/after toggle
 * Sub-scores: Color & Vibrancy, Surface Shine, Print Quality, Visual Balance
 * Deductions: Slight dullness -2, Minor print fade -5, Lack of gloss -8, Poor color -12, Major visual -20
 * Final: weighted average of sub-scores
 * Tone: premium and emotional, not clinical
 *
 * Design: same scan overlay shell as other detail modals, but warmer gold/amber palette
 */

import { useEffect, useRef, useState } from "react";

export interface EyeAppealData {
  colorVibrancy: number;
  surfaceShine: number;
  printQuality: number;
  visualBalance: number;
  finalScore: number;
  cardImageUrl?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  data: EyeAppealData;
}

const DEDUCTION_SCALE = [
  { label: "Slight dullness",         deduction: -2,  color: "rgba(99,155,255,0.85)" },
  { label: "Minor print fade",        deduction: -5,  color: "rgba(148,200,255,0.85)" },
  { label: "Noticeable lack of gloss",deduction: -8,  color: "rgba(201,168,76,0.85)" },
  { label: "Poor color / washed out", deduction: -12, color: "rgba(239,140,60,0.9)" },
  { label: "Major visual issue",      deduction: -20, color: "rgba(239,68,68,0.9)" },
];

const DEFAULT_CARD = "https://images.unsplash.com/photo-1612404730960-5c71577fca11?w=400&q=80";

// ── Animated score bar ────────────────────────────────────────────────────────
function ScoreBar({ label, score, delay, animate }: { label: string; score: number; delay: number; animate: boolean }) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!animate) { setDisplayed(0); return; }
    const duration = 900;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * score));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => { rafRef.current = requestAnimationFrame(tick); }, delay);
    return () => { clearTimeout(timer); cancelAnimationFrame(rafRef.current); };
  }, [animate, score, delay]);

  const pct = (displayed / 100) * 100;
  const barColor = score >= 95
    ? "linear-gradient(90deg, rgba(201,168,76,0.7), rgba(255,215,80,0.95))"
    : score >= 88
    ? "linear-gradient(90deg, rgba(99,155,255,0.7), rgba(148,200,255,0.95))"
    : "linear-gradient(90deg, rgba(239,140,60,0.7), rgba(239,180,60,0.95))";

  return (
    <div style={{ marginBottom: "1rem", opacity: animate ? 1 : 0, transition: `opacity 0.4s ease ${delay / 1000}s` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.4rem" }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.72rem", letterSpacing: "0.1em", color: "rgba(148,163,184,0.8)", textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", color: "rgba(201,168,76,0.95)", lineHeight: 1 }}>{displayed}</span>
      </div>
      <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: barColor,
          borderRadius: "2px",
          boxShadow: "0 0 8px rgba(201,168,76,0.3)",
          transition: "width 0.05s linear",
        }} />
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function EyeAppealDetailsModal({ open, onClose, data }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  const [scanPhase, setScanPhase] = useState(0);
  const [mode, setMode] = useState<"before" | "after">("after");
  const [finalDisplayed, setFinalDisplayed] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!open) { setAnimate(false); setScanPhase(0); setFinalDisplayed(0); setMode("after"); return; }
    setScanPhase(1);
    const t = setTimeout(() => { setAnimate(true); setScanPhase(2); }, 400);
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => { clearTimeout(t); window.removeEventListener("keydown", esc); };
  }, [open, onClose]);

  // Final score count-up (starts after sub-scores)
  useEffect(() => {
    if (!animate) { setFinalDisplayed(0); return; }
    const duration = 800;
    const delayMs = 1600;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setFinalDisplayed(Math.round(eased * data.finalScore));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => { rafRef.current = requestAnimationFrame(tick); }, delayMs);
    return () => { clearTimeout(timer); cancelAnimationFrame(rafRef.current); };
  }, [animate, data.finalScore]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const cardUrl = data.cardImageUrl ?? DEFAULT_CARD;

  return (
    <div ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflow: "hidden", animation: "eyeFadeIn 0.2s ease" }}>
      <style>{`
        @keyframes eyeFadeIn { from{opacity:0}to{opacity:1} }
        @keyframes eyeSlideUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes eyeScan { 0%{top:-2px;opacity:0.6}100%{top:100%;opacity:0} }
        @keyframes eyeGrid { 0%,100%{opacity:0.03}50%{opacity:0.07} }
        @keyframes eyeBlink { 0%,100%{opacity:0.5}50%{opacity:1} }
        @keyframes eyeGlow { 0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:0.7;transform:scale(1.04)} }
        @keyframes eyeShimmer { 0%{transform:translateX(-100%) skewX(-15deg)}100%{transform:translateX(200%) skewX(-15deg)} }
        .eye-modal-panel { animation: eyeSlideUp 0.28s ease; }
        .eye-modal-panel::-webkit-scrollbar{width:4px}
        .eye-modal-panel::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
        .eye-toggle-btn { transition: background 0.2s, color 0.2s, border-color 0.2s; }
      `}</style>

      {/* Scan overlay — warmer gold tone for Eye Appeal */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(4,6,16,0.9)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", zIndex: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(201,168,76,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.04) 1px,transparent 1px)", backgroundSize: "48px 48px", animation: "eyeGrid 3s ease-in-out infinite" }} />
        {scanPhase === 1 && <div style={{ position: "absolute", left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,rgba(255,215,80,0.9) 50%,transparent)", boxShadow: "0 0 20px rgba(255,215,80,0.4)", animation: "eyeScan 1.1s linear forwards", zIndex: 1 }} />}
        <div style={{ position: "absolute", bottom: "2rem", right: "2rem", fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: "0.58rem", letterSpacing: "0.25em", color: scanPhase < 2 ? "rgba(255,215,80,0.7)" : "rgba(201,168,76,0.8)", textTransform: "uppercase", animation: "eyeBlink 1.4s ease-in-out infinite", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: scanPhase < 2 ? "rgba(255,215,80,0.8)" : "rgba(201,168,76,0.9)", display: "inline-block" }} />
          {scanPhase < 2 ? "Evaluating Eye Appeal…" : "Visual Analysis Complete"}
        </div>
        {[{top:"1.5rem",left:"1.5rem",borderTop:"1px solid rgba(201,168,76,0.25)",borderLeft:"1px solid rgba(201,168,76,0.25)"},{top:"1.5rem",right:"1.5rem",borderTop:"1px solid rgba(201,168,76,0.25)",borderRight:"1px solid rgba(201,168,76,0.25)"},{bottom:"1.5rem",left:"1.5rem",borderBottom:"1px solid rgba(201,168,76,0.25)",borderLeft:"1px solid rgba(201,168,76,0.25)"},{bottom:"1.5rem",right:"1.5rem",borderBottom:"1px solid rgba(201,168,76,0.25)",borderRight:"1px solid rgba(201,168,76,0.25)"}].map((s,i)=><div key={i} style={{position:"absolute",width:"20px",height:"20px",...s}}/>)}
      </div>

      {/* Panel */}
      <div className="eye-modal-panel" style={{ background: "rgba(8,12,24,0.97)", border: "1px solid rgba(201,168,76,0.18)", borderRadius: "6px", width: "100%", maxWidth: "580px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 40px 100px rgba(0,0,0,0.9),0 0 60px rgba(201,168,76,0.06)", position: "relative", zIndex: 1 }}>
        {/* Gold top accent */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.5) 25%,rgba(255,215,80,0.95) 50%,rgba(201,168,76,0.5) 75%,transparent)", borderRadius: "6px 6px 0 0" }} />
        <button onClick={onClose} style={{ position: "absolute", top: "14px", right: "14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(148,163,184,0.6)", fontSize: "13px", zIndex: 2 }} onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.1)")} onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.04)")}>✕</button>

        <div style={{ padding: "1.75rem" }}>
          {/* Header */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.22em", color: "rgba(201,168,76,0.9)", textTransform: "uppercase", marginBottom: "0.75rem" }}>Eye Appeal Analysis</div>
            <div style={{ height: "1px", background: "rgba(201,168,76,0.15)", marginBottom: "0.9rem" }} />
            <p style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 300, fontSize: "0.78rem", lineHeight: 1.6, color: "rgba(148,163,184,0.65)", margin: 0 }}>
              Eye Appeal is the only subjective score — but it is not arbitrary. It measures color vibrancy, gloss, print quality, and visual balance. It refines the grade, never destroys it.
            </p>
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.04)", marginBottom: "1.25rem" }} />

          {/* Card visual with before/after toggle */}
          <div style={{ marginBottom: "1.25rem" }}>
            {/* Toggle */}
            <div style={{ display: "flex", justifyContent: "center", gap: "0", marginBottom: "1rem", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "3px", overflow: "hidden", width: "fit-content", margin: "0 auto 1rem" }}>
              {(["before", "after"] as const).map(m => (
                <button
                  key={m}
                  className="eye-toggle-btn"
                  onClick={() => setMode(m)}
                  style={{
                    padding: "0.4rem 1.25rem",
                    fontFamily: "'Barlow Condensed',sans-serif",
                    fontWeight: 700,
                    fontSize: "0.65rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    border: "none",
                    background: mode === m ? "rgba(201,168,76,0.15)" : "transparent",
                    color: mode === m ? "rgba(201,168,76,0.95)" : "rgba(100,116,139,0.5)",
                    borderRight: m === "before" ? "1px solid rgba(201,168,76,0.2)" : "none",
                  }}
                >
                  {m === "before" ? "Standard" : "Eye Appeal"}
                </button>
              ))}
            </div>

            {/* Card image */}
            <div style={{ position: "relative", width: "160px", margin: "0 auto", opacity: animate ? 1 : 0, transition: "opacity 0.5s ease" }}>
              {/* Glow behind card */}
              {mode === "after" && (
                <div style={{
                  position: "absolute",
                  inset: "-20px",
                  background: "radial-gradient(ellipse, rgba(201,168,76,0.25) 0%, transparent 70%)",
                  animation: "eyeGlow 2.5s ease-in-out infinite",
                  zIndex: 0,
                }} />
              )}

              <div style={{
                position: "relative",
                aspectRatio: "2.5/3.5",
                borderRadius: "5px",
                overflow: "hidden",
                border: mode === "after" ? "1px solid rgba(201,168,76,0.4)" : "1px solid rgba(255,255,255,0.1)",
                boxShadow: mode === "after" ? "0 8px 40px rgba(201,168,76,0.2), 0 2px 12px rgba(0,0,0,0.6)" : "0 4px 20px rgba(0,0,0,0.5)",
                transition: "box-shadow 0.5s ease, border-color 0.5s ease",
                zIndex: 1,
              }}>
                <img
                  src={cardUrl}
                  alt="Card"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    filter: mode === "after"
                      ? "brightness(1.12) saturate(1.35) contrast(1.05)"
                      : "brightness(0.85) saturate(0.75) contrast(0.95)",
                    transition: "filter 0.6s ease",
                  }}
                />

                {/* Shimmer overlay (after mode only) */}
                {mode === "after" && animate && (
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)",
                    animation: "eyeShimmer 3s ease-in-out infinite",
                    pointerEvents: "none",
                  }} />
                )}

                {/* Vignette */}
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
              </div>

              {/* Mode label */}
              <div style={{ textAlign: "center", marginTop: "0.5rem", fontFamily: "'Barlow',sans-serif", fontSize: "0.58rem", letterSpacing: "0.15em", color: mode === "after" ? "rgba(201,168,76,0.6)" : "rgba(100,116,139,0.4)", textTransform: "uppercase" }}>
                {mode === "after" ? "Enhanced View" : "Unprocessed"}
              </div>
            </div>
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.04)", marginBottom: "1.25rem" }} />

          {/* Sub-score bars */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(201,168,76,0.7)", textTransform: "uppercase", marginBottom: "1rem" }}>Visual Sub-Scores</div>
            <ScoreBar label="Color & Vibrancy" score={data.colorVibrancy}  delay={300}  animate={animate} />
            <ScoreBar label="Surface Shine"    score={data.surfaceShine}   delay={550}  animate={animate} />
            <ScoreBar label="Print Quality"    score={data.printQuality}   delay={800}  animate={animate} />
            <ScoreBar label="Visual Balance"   score={data.visualBalance}  delay={1050} animate={animate} />
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.04)", marginBottom: "1.25rem" }} />

          {/* Final score */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", opacity: animate ? 1 : 0, transition: "opacity 0.5s ease 1.5s" }}>
            <div>
              <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: "0.58rem", letterSpacing: "0.2em", color: "rgba(201,168,76,0.65)", textTransform: "uppercase", marginBottom: "4px" }}>Eye Appeal Score</div>
              <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: "0.68rem", color: "rgba(100,116,139,0.45)" }}>Weight: 10% of total grade &nbsp;·&nbsp; Refines, never destroys</div>
            </div>
            <div style={{ position: "relative" }}>
              {animate && (
                <div style={{ position: "absolute", inset: "-8px", background: "radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)", animation: "eyeGlow 2s ease-in-out infinite", borderRadius: "50%" }} />
              )}
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "2.5rem", color: "rgba(201,168,76,0.95)", lineHeight: 1, position: "relative", zIndex: 1 }}>{finalDisplayed}</div>
            </div>
          </div>

          {/* Deduction scale */}
          <div style={{ padding: "0.75rem 1rem", background: "rgba(201,168,76,0.03)", border: "1px solid rgba(201,168,76,0.1)", borderRadius: "3px" }}>
            <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 700, fontSize: "0.55rem", letterSpacing: "0.18em", color: "rgba(100,116,139,0.45)", textTransform: "uppercase", marginBottom: "0.6rem" }}>Deduction Scale</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              {DEDUCTION_SCALE.map(d => (
                <div key={d.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'Barlow',sans-serif", fontSize: "0.68rem", color: "rgba(148,163,184,0.5)" }}>{d.label}</span>
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: "0.72rem", color: d.color }}>{d.deduction} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
