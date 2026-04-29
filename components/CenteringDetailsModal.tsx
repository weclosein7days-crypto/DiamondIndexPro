/**
 * Diamond Index™ — Centering Details Modal
 *
 * LOCKED STRUCTURE — do not modify without explicit instruction.
 *
 * Live-grading feel:
 * - Scan grid overlay behind modal (blurred card + grid lines + "ANALYZING..." glow)
 * - Bars animate outward from center (not left-to-right)
 * - Numbers count up from 0 to final value
 * - Score appears last with a fade
 * - Visual equation formula: 96 + 100 / 2 = 98
 * - Side-by-side scoring table with actual result highlighted
 *
 * Design: dark bg, blue/cyan glow bars, gold scores, no neon, no clutter
 */

import { useEffect, useRef, useState } from "react";

// ─── Scoring tables ───────────────────────────────────────────────────────────
const FRONT_TABLE = [
  { left: 50, right: 50, score: 100 },
  { left: 51, right: 49, score: 96 },
  { left: 52, right: 48, score: 92 },
  { left: 53, right: 47, score: 88 },
  { left: 54, right: 46, score: 84 },
  { left: 55, right: 45, score: 80 },
  { left: 56, right: 44, score: 76 },
  { left: 57, right: 43, score: 72 },
  { left: 58, right: 42, score: 68 },
  { left: 59, right: 41, score: 64 },
];

const BACK_TABLE = [
  { left: 60, right: 40, score: 100 },
  { left: 61, right: 39, score: 99 },
  { left: 62, right: 38, score: 98 },
  { left: 63, right: 37, score: 96 },
  { left: 64, right: 36, score: 94 },
  { left: 65, right: 35, score: 91 },
  { left: 66, right: 34, score: 88 },
  { left: 67, right: 33, score: 84 },
  { left: 68, right: 32, score: 80 },
];

// ─── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration: number, active: boolean): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) { setValue(0); return; }
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, active]);
  return value;
}

// ─── Animated centering bar (expands outward from center) ─────────────────────
function CenteringVisualBar({
  leftPct,
  rightPct,
  score,
  label,
  perfectLeft,
  animate,
  delay,
}: {
  leftPct: number;
  rightPct: number;
  score: number;
  label: string;
  perfectLeft: number;
  animate: boolean;
  delay: number;
}) {
  const [barActive, setBarActive] = useState(false);
  const displayLeft = useCountUp(leftPct, 900, barActive);
  const displayRight = useCountUp(rightPct, 900, barActive);
  const displayScore = useCountUp(score, 1000, barActive);

  useEffect(() => {
    if (!animate) { setBarActive(false); return; }
    const t = setTimeout(() => setBarActive(true), delay);
    return () => clearTimeout(t);
  }, [animate, delay]);

  const isOff = Math.abs(leftPct - perfectLeft) > 1;

  return (
    <div style={{ marginBottom: "1.85rem" }}>
      {/* Label */}
      <div style={{
        fontFamily: "'Barlow', sans-serif",
        fontWeight: 700,
        fontSize: "0.6rem",
        letterSpacing: "0.2em",
        color: "rgba(201,168,76,0.8)",
        textTransform: "uppercase",
        marginBottom: "0.6rem",
      }}>
        {label}
      </div>

      {/* Reference markers */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "1.5rem", marginBottom: "3px", paddingRight: "2px" }}>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.55rem", color: "rgba(100,116,139,0.45)" }}>100%</span>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.55rem", color: "rgba(100,116,139,0.45)" }}>50%</span>
      </div>

      {/* Bar track */}
      <div style={{ position: "relative", height: "12px", borderRadius: "1px", overflow: "hidden", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>

        {/* Left fill — grows from center leftward */}
        <div style={{
          position: "absolute",
          right: "50%",
          top: 0, bottom: 0,
          width: barActive ? `${leftPct}%` : "0%",
          background: "linear-gradient(270deg, rgba(0,200,255,0.9) 0%, rgba(20,100,220,0.5) 100%)",
          boxShadow: barActive ? "2px 0 16px rgba(0,200,255,0.35)" : "none",
          transition: `width ${0.85 + delay * 0.001}s cubic-bezier(0.4,0,0.2,1)`,
          transformOrigin: "right",
        }} />

        {/* Right fill — grows from center rightward */}
        <div style={{
          position: "absolute",
          left: "50%",
          top: 0, bottom: 0,
          width: barActive ? `${rightPct}%` : "0%",
          background: "linear-gradient(90deg, rgba(0,200,255,0.9) 0%, rgba(20,100,220,0.5) 100%)",
          boxShadow: barActive ? "-2px 0 16px rgba(0,200,255,0.35)" : "none",
          transition: `width ${0.85 + delay * 0.001}s cubic-bezier(0.4,0,0.2,1)`,
        }} />

        {/* Center divider */}
        <div style={{
          position: "absolute", left: "50%", top: 0, bottom: 0,
          width: "1px",
          background: "rgba(255,255,255,0.25)",
          transform: "translateX(-50%)",
          zIndex: 3,
        }} />

        {/* Perfect-center dashed marker */}
        <div style={{
          position: "absolute",
          left: `${perfectLeft}%`,
          top: "-2px", bottom: "-2px",
          width: "1px",
          borderLeft: "1px dashed rgba(255,255,255,0.12)",
          transform: "translateX(-50%)",
          zIndex: 2,
        }} />
      </div>

      {/* Percentages + score */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: "1.05rem",
          color: isOff ? "rgba(99,155,255,0.9)" : "rgba(203,213,225,0.85)",
          minWidth: "48px",
          transition: "opacity 0.3s",
          opacity: barActive ? 1 : 0,
        }}>
          {displayLeft}%
        </span>
        <div style={{ textAlign: "center", opacity: barActive ? 1 : 0, transition: "opacity 0.4s 0.5s" }}>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.62rem", color: "rgba(148,163,184,0.5)", marginRight: "4px" }}>Score:</span>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "1.05rem",
            color: "rgba(201,168,76,0.95)",
          }}>
            {displayScore}
          </span>
        </div>
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: "1.05rem",
          color: isOff ? "rgba(99,155,255,0.9)" : "rgba(203,213,225,0.85)",
          minWidth: "48px",
          textAlign: "right",
          transition: "opacity 0.3s",
          opacity: barActive ? 1 : 0,
        }}>
          {displayRight}%
        </span>
      </div>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────
interface CenteringDetailsModalProps {
  open: boolean;
  onClose: () => void;
  frontLeft: number;
  frontRight: number;
  frontScore: number;
  backLeft: number;
  backRight: number;
  backScore: number;
  finalScore: number;
}

export default function CenteringDetailsModal({
  open,
  onClose,
  frontLeft,
  frontRight,
  frontScore,
  backLeft,
  backRight,
  backScore,
  finalScore,
}: CenteringDetailsModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [scanPhase, setScanPhase] = useState(0); // 0=idle, 1=scanning, 2=done

  const displayFinal = useCountUp(finalScore, 800, showFinal);

  useEffect(() => {
    if (!open) {
      setAnimate(false);
      setShowFinal(false);
      setScanPhase(0);
      return;
    }
    // Sequence: scan → bars → final score
    setScanPhase(1);
    const t1 = setTimeout(() => { setAnimate(true); setScanPhase(2); }, 300);
    const t2 = setTimeout(() => setShowFinal(true), 1400);
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => {
      clearTimeout(t1); clearTimeout(t2);
      window.removeEventListener("keydown", handler);
    };
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
        animation: "cFadeIn 0.2s ease",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes cFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scanLine {
          0% { top: -2px; opacity: 0.6; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes gridPulse {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.07; }
        }
        @keyframes analyzingBlink {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .centering-modal-inner { animation: cSlideUp 0.28s ease; }
        .centering-modal-inner::-webkit-scrollbar { width: 4px; }
        .centering-modal-inner::-webkit-scrollbar-track { background: transparent; }
        .centering-modal-inner::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      {/* ── SCAN OVERLAY (behind modal) ─────────────────────────────────────── */}
      <div style={{
        position: "absolute", inset: 0,
        background: "rgba(2,8,20,0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 0,
      }}>
        {/* Grid lines */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0,180,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,180,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          animation: "gridPulse 3s ease-in-out infinite",
        }} />

        {/* Scan line sweep */}
        {scanPhase === 1 && (
          <div style={{
            position: "absolute",
            left: 0, right: 0,
            height: "2px",
            background: "linear-gradient(90deg, transparent 0%, rgba(0,200,255,0.6) 20%, rgba(0,200,255,0.9) 50%, rgba(0,200,255,0.6) 80%, transparent 100%)",
            boxShadow: "0 0 20px rgba(0,200,255,0.4)",
            animation: "scanLine 0.9s linear forwards",
            zIndex: 1,
          }} />
        )}

        {/* ANALYZING... label */}
        <div style={{
          position: "absolute",
          bottom: "2rem",
          right: "2rem",
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 700,
          fontSize: "0.58rem",
          letterSpacing: "0.25em",
          color: scanPhase < 2 ? "rgba(0,200,255,0.7)" : "rgba(100,200,130,0.7)",
          textTransform: "uppercase",
          animation: "analyzingBlink 1.2s ease-in-out infinite",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          <span style={{
            width: "6px", height: "6px",
            borderRadius: "50%",
            background: scanPhase < 2 ? "rgba(0,200,255,0.8)" : "rgba(100,200,130,0.8)",
            display: "inline-block",
            boxShadow: scanPhase < 2 ? "0 0 8px rgba(0,200,255,0.6)" : "0 0 8px rgba(100,200,130,0.6)",
          }} />
          {scanPhase < 2 ? "Analyzing…" : "Analysis Complete"}
        </div>

        {/* Corner brackets */}
        {[
          { top: "1.5rem", left: "1.5rem", borderTop: "1px solid rgba(0,200,255,0.3)", borderLeft: "1px solid rgba(0,200,255,0.3)" },
          { top: "1.5rem", right: "1.5rem", borderTop: "1px solid rgba(0,200,255,0.3)", borderRight: "1px solid rgba(0,200,255,0.3)" },
          { bottom: "1.5rem", left: "1.5rem", borderBottom: "1px solid rgba(0,200,255,0.3)", borderLeft: "1px solid rgba(0,200,255,0.3)" },
          { bottom: "1.5rem", right: "1.5rem", borderBottom: "1px solid rgba(0,200,255,0.3)", borderRight: "1px solid rgba(0,200,255,0.3)" },
        ].map((style, i) => (
          <div key={i} style={{ position: "absolute", width: "20px", height: "20px", ...style }} />
        ))}
      </div>

      {/* ── MODAL PANEL ─────────────────────────────────────────────────────── */}
      <div
        className="centering-modal-inner"
        style={{
          background: "rgba(7,16,31,0.97)",
          border: "1px solid rgba(0,180,255,0.15)",
          borderRadius: "6px",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 40px 100px rgba(0,0,0,0.85), 0 0 0 1px rgba(0,200,255,0.06), 0 0 60px rgba(0,150,255,0.08)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Blue top accent */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, transparent 0%, rgba(20,100,220,0.6) 25%, rgba(0,200,255,0.95) 50%, rgba(20,100,220,0.6) 75%, transparent 100%)",
          borderRadius: "6px 6px 0 0",
        }} />

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "14px", right: "14px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "50%",
            width: "28px", height: "28px",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(148,163,184,0.6)",
            fontSize: "13px",
            transition: "background 0.2s",
            zIndex: 2,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
        >✕</button>

        <div style={{ padding: "1.75rem 1.75rem 1.75rem" }}>

          {/* Header */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "0.95rem",
              letterSpacing: "0.22em",
              color: "rgba(99,155,255,0.9)",
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}>
              Centering Details
            </div>
            <div style={{ height: "1px", background: "rgba(0,180,255,0.12)", marginBottom: "0.9rem" }} />
            <p style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 300,
              fontSize: "0.78rem",
              lineHeight: 1.6,
              color: "rgba(148,163,184,0.65)",
              margin: 0,
            }}>
              Centering scores are based on how balanced a card is from left to right.
              The scores are calculated based on the percentage difference between
              sides. A perfectly centered card is 50/50 on the front, and 60/40 on back.
            </p>
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.04)", marginBottom: "1.4rem" }} />

          {/* Bars */}
          <CenteringVisualBar
            label="Front Centering"
            leftPct={frontLeft}
            rightPct={frontRight}
            score={frontScore}
            perfectLeft={50}
            animate={animate}
            delay={0}
          />
          <CenteringVisualBar
            label="Back Centering"
            leftPct={backLeft}
            rightPct={backRight}
            score={backScore}
            perfectLeft={60}
            animate={animate}
            delay={200}
          />

          <div style={{ height: "1px", background: "rgba(255,255,255,0.04)", marginBottom: "1.4rem" }} />

          {/* Final score */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 700,
              fontSize: "0.58rem",
              letterSpacing: "0.2em",
              color: "rgba(201,168,76,0.65)",
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}>
              Final Centering Score
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.25))" }} />
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "3.25rem",
                letterSpacing: "-0.02em",
                color: "rgba(201,168,76,0.95)",
                lineHeight: 1,
                opacity: showFinal ? 1 : 0,
                transform: showFinal ? "scale(1)" : "scale(0.9)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
                display: "inline-block",
              }}>
                {displayFinal}
              </span>
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(270deg, transparent, rgba(201,168,76,0.25))" }} />
            </div>
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.04)", marginBottom: "1.4rem" }} />

          {/* ── SCORING TABLE ─────────────────────────────────────────────── */}
          <div style={{
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "4px",
            overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ padding: "0.5rem 0.75rem", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)", borderRight: "1px solid rgba(255,255,255,0.06)", textAlign: "center", fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: "0.58rem", letterSpacing: "0.18em", color: "rgba(148,163,184,0.55)", textTransform: "uppercase" }}>Front</div>
              <div style={{ padding: "0.5rem 0.75rem", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "center", fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: "0.58rem", letterSpacing: "0.18em", color: "rgba(148,163,184,0.55)", textTransform: "uppercase" }}>Back</div>
            </div>

            {/* Rows */}
            {Array.from({ length: Math.max(FRONT_TABLE.length, BACK_TABLE.length) }).map((_, i) => {
              const f = FRONT_TABLE[i];
              const b = BACK_TABLE[i];
              const isFrontActual = f && f.left === frontLeft && f.right === frontRight;
              const isBackActual = b && b.left === backLeft && b.right === backRight;
              const isLast = i === Math.max(FRONT_TABLE.length, BACK_TABLE.length) - 1;

              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                  <div style={{
                    padding: "0.38rem 0.75rem",
                    borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.03)",
                    borderRight: "1px solid rgba(255,255,255,0.06)",
                    background: isFrontActual ? "rgba(99,155,255,0.09)" : "transparent",
                    textAlign: "center",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "0.8rem",
                    color: f ? (isFrontActual ? "rgba(99,155,255,0.95)" : "rgba(148,163,184,0.6)") : "transparent",
                    fontWeight: isFrontActual ? 700 : 400,
                  }}>
                    {f && <>{f.left} / {f.right} = <strong style={{ color: isFrontActual ? "rgba(99,155,255,0.95)" : "rgba(203,213,225,0.75)", fontWeight: 700 }}>{f.score}</strong></>}
                  </div>
                  <div style={{
                    padding: "0.38rem 0.75rem",
                    borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.03)",
                    background: isBackActual ? "rgba(99,155,255,0.09)" : "transparent",
                    textAlign: "center",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "0.8rem",
                    color: b ? (isBackActual ? "rgba(99,155,255,0.95)" : "rgba(148,163,184,0.6)") : "transparent",
                    fontWeight: isBackActual ? 700 : 400,
                  }}>
                    {b && <>{b.left} / {b.right} = <strong style={{ color: isBackActual ? "rgba(99,155,255,0.95)" : "rgba(203,213,225,0.75)", fontWeight: 700 }}>{b.score}</strong></>}
                  </div>
                </div>
              );
            })}

            {/* ── VISUAL EQUATION FORMULA ─────────────────────────────────── */}
            <div style={{
              borderTop: "1px solid rgba(201,168,76,0.12)",
              background: "rgba(201,168,76,0.03)",
              padding: "0.85rem 1rem",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0",
              }}>
                {/* Left side: front + back stacked */}
                <div style={{ textAlign: "center", minWidth: "80px" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "rgba(99,155,255,0.9)", lineHeight: 1.2 }}>
                    {frontScore}
                  </div>
                  <div style={{ height: "1px", background: "rgba(148,163,184,0.25)", margin: "4px 0" }} />
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "rgba(99,155,255,0.9)", lineHeight: 1.2 }}>
                    {backScore}
                  </div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.55rem", letterSpacing: "0.1em", color: "rgba(100,116,139,0.45)", textTransform: "uppercase", marginTop: "3px" }}>
                    front + back
                  </div>
                </div>

                {/* Divider line */}
                <div style={{ margin: "0 0.85rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.4rem", color: "rgba(148,163,184,0.3)", lineHeight: 1 }}>÷</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "rgba(148,163,184,0.4)", lineHeight: 1 }}>2</div>
                </div>

                {/* Equals */}
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.4rem", color: "rgba(148,163,184,0.3)", marginRight: "0.85rem", lineHeight: 1 }}>=</div>

                {/* Result */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "2rem", color: "rgba(201,168,76,0.95)", lineHeight: 1 }}>
                    {finalScore}
                  </div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.55rem", letterSpacing: "0.1em", color: "rgba(100,116,139,0.45)", textTransform: "uppercase", marginTop: "3px" }}>
                    final score
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
