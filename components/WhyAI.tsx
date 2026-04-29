/**
 * Diamond Index™ — "Why AI Sees What Humans Can't"
 * Punchy copy + cinematic scanning card visual
 */

import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

const GOLD = "#c9a84c";
const DARK = "#060d1e";
const BLUE = "#1e40af";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ── Upgraded Card Scan Visual ───────────────────────────────────────────────
function CardScanVisual({ active }: { active: boolean }) {
  const [scanY, setScanY] = useState(8);
  const [scanDir, setScanDir] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pointsLit, setPointsLit] = useState<number[]>([]);
  const [glowPulse, setGlowPulse] = useState(0);

  // Slow card rotation
  useEffect(() => {
    if (!active) return;
    let angle = -5;
    let dir = 1;
    const iv = setInterval(() => {
      angle += dir * 0.04;
      if (angle > 5) dir = -1;
      if (angle < -5) dir = 1;
      setRotation(angle);
    }, 20);
    return () => clearInterval(iv);
  }, [active]);

  // Scan line sweep
  useEffect(() => {
    if (!active) return;
    let pos = 8;
    let d = 1;
    const iv = setInterval(() => {
      pos += d * 0.9;
      if (pos >= 90) d = -1;
      if (pos <= 8) d = 1;
      setScanY(pos);
      setScanDir(d);
    }, 16);
    return () => clearInterval(iv);
  }, [active]);

  // Glow pulse
  useEffect(() => {
    if (!active) return;
    let t = 0;
    const iv = setInterval(() => {
      t += 0.05;
      setGlowPulse(Math.sin(t) * 0.5 + 0.5);
    }, 30);
    return () => clearInterval(iv);
  }, [active]);

  // Points lighting up
  const POINTS = [
    { x: 15, y: 18 }, { x: 50, y: 12 }, { x: 82, y: 22 },
    { x: 8,  y: 48 }, { x: 32, y: 42 }, { x: 68, y: 45 }, { x: 90, y: 52 },
    { x: 20, y: 70 }, { x: 50, y: 75 }, { x: 75, y: 65 }, { x: 88, y: 78 },
    { x: 38, y: 28 }, { x: 62, y: 58 }, { x: 25, y: 85 }, { x: 72, y: 82 },
    { x: 45, y: 35 }, { x: 15, y: 60 }, { x: 85, y: 35 },
  ];

  useEffect(() => {
    if (!active) return;
    POINTS.forEach((_, i) => {
      const t = setTimeout(() => setPointsLit(prev => [...prev, i]), 300 + i * 220);
    });
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  const scanOpacity = Math.abs(scanDir) > 0 ? 1 : 0;

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "320px", margin: "0 auto" }}>

      {/* Outer ambient glow — pulses */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "140%", height: "140%",
        background: `radial-gradient(ellipse at center,
          rgba(30,64,175,${0.12 + glowPulse * 0.08}) 0%,
          rgba(201,168,76,${0.06 + glowPulse * 0.04}) 40%,
          transparent 70%)`,
        pointerEvents: "none",
        zIndex: 0,
        transition: "background 0.03s linear",
      }} />

      {/* Card with 3D tilt + slow rotation */}
      <div style={{
        position: "relative",
        zIndex: 1,
        transform: active
          ? `perspective(900px) rotateY(${rotation}deg) rotateX(3deg)`
          : "perspective(900px) rotateY(0deg) rotateX(0deg)",
        transition: active ? "none" : "transform 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        aspectRatio: "2.5/3.5",
        borderRadius: "10px",
        overflow: "hidden",
        background: `linear-gradient(145deg,
          #1a2f5e 0%,
          #0f1e3d 35%,
          #0a1628 65%,
          #060d1e 100%)`,
        border: `1px solid rgba(201,168,76,${0.2 + glowPulse * 0.15})`,
        boxShadow: `
          0 30px 80px rgba(0,0,0,0.7),
          0 0 40px rgba(30,64,175,${0.15 + glowPulse * 0.1}),
          0 0 20px rgba(201,168,76,${0.1 + glowPulse * 0.08}),
          inset 0 1px 0 rgba(255,255,255,0.06)
        `,
      }}>

        {/* Fine grid overlay */}
        <svg
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            opacity: active ? 0.12 : 0, transition: "opacity 1s ease 0.5s",
          }}
          viewBox="0 0 100 140" preserveAspectRatio="none"
        >
          {[10,20,30,40,50,60,70,80,90].map(x => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="140" stroke={GOLD} strokeWidth="0.25" />
          ))}
          {[14,28,42,56,70,84,98,112,126].map(y => (
            <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke={GOLD} strokeWidth="0.25" />
          ))}
        </svg>

        {/* Scan line with glow trail */}
        {active && (
          <>
            {/* Trail above */}
            <div style={{
              position: "absolute", left: 0, right: 0,
              top: `${Math.max(0, scanY - 8)}%`,
              height: "8%",
              background: `linear-gradient(180deg,
                transparent 0%,
                rgba(201,168,76,0.04) 100%)`,
              pointerEvents: "none",
            }} />
            {/* Main scan line */}
            <div style={{
              position: "absolute", left: 0, right: 0,
              top: `${scanY}%`,
              height: "2px",
              background: `linear-gradient(90deg,
                transparent 0%,
                rgba(30,64,175,0.6) 10%,
                rgba(201,168,76,1) 30%,
                #ffffff 50%,
                rgba(201,168,76,1) 70%,
                rgba(30,64,175,0.6) 90%,
                transparent 100%)`,
              boxShadow: `
                0 0 8px 2px rgba(201,168,76,0.7),
                0 0 20px 4px rgba(201,168,76,0.3),
                0 0 40px 8px rgba(30,64,175,0.2)
              `,
              opacity: scanOpacity,
            }} />
            {/* Trail below */}
            <div style={{
              position: "absolute", left: 0, right: 0,
              top: `${scanY}%`,
              height: "6%",
              background: `linear-gradient(180deg,
                rgba(201,168,76,0.06) 0%,
                transparent 100%)`,
              pointerEvents: "none",
            }} />
          </>
        )}

        {/* Data points */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
          viewBox="0 0 100 140" preserveAspectRatio="none"
        >
          {POINTS.map((pt, i) => (
            <g key={i} style={{
              opacity: pointsLit.includes(i) ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}>
              <circle cx={pt.x} cy={pt.y} r="1.4" fill={GOLD} />
              <circle cx={pt.x} cy={pt.y} r="3.5" fill="none" stroke={GOLD} strokeWidth="0.5" opacity="0.4" />
              <circle cx={pt.x} cy={pt.y} r="6" fill="none" stroke={GOLD} strokeWidth="0.2" opacity="0.15" />
            </g>
          ))}
        </svg>

        {/* Corner brackets */}
        {[
          { top: "10px", left: "10px", borderTop: `2px solid ${GOLD}`, borderLeft: `2px solid ${GOLD}` },
          { top: "10px", right: "10px", borderTop: `2px solid ${GOLD}`, borderRight: `2px solid ${GOLD}` },
          { bottom: "10px", left: "10px", borderBottom: `2px solid ${GOLD}`, borderLeft: `2px solid ${GOLD}` },
          { bottom: "10px", right: "10px", borderBottom: `2px solid ${GOLD}`, borderRight: `2px solid ${GOLD}` },
        ].map((s, i) => (
          <div key={i} style={{ position: "absolute", width: "20px", height: "20px", ...s }} />
        ))}

        {/* Card placeholder art */}
        <div style={{
          position: "absolute", inset: "18px",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "0.5rem",
        }}>
          <div style={{
            width: "65%", height: "45%",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "4px",
            border: "1px solid rgba(255,255,255,0.05)",
          }} />
          <div style={{ width: "55%", height: "5px", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }} />
          <div style={{ width: "40%", height: "4px", background: "rgba(255,255,255,0.03)", borderRadius: "2px" }} />
          <div style={{ width: "30%", height: "3px", background: "rgba(255,255,255,0.02)", borderRadius: "2px" }} />
        </div>

        {/* Light reflection */}
        {active && (
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(135deg,
              rgba(255,255,255,${0.04 + glowPulse * 0.03}) 0%,
              transparent 45%,
              rgba(255,255,255,${0.01 + glowPulse * 0.02}) 100%)`,
            pointerEvents: "none",
          }} />
        )}

        {/* Status label */}
        {active && (
          <div style={{
            position: "absolute", bottom: "14px", left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600,
            fontSize: "0.52rem", letterSpacing: "0.2em", textTransform: "uppercase",
            color: `${GOLD}80`,
            opacity: active ? 1 : 0,
            transition: "opacity 0.5s ease 1s",
            whiteSpace: "nowrap",
          }}>
            ◆ ANALYZING
          </div>
        )}
      </div>

      {/* Floating stats */}
      <div style={{
        display: "flex", justifyContent: "space-around",
        marginTop: "2rem",
        opacity: active ? 1 : 0,
        transform: active ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.8s ease 0.8s",
      }}>
        {[
          { value: "1M+", label: "Data Points" },
          { value: "125", label: "Angles" },
          { value: "< 6s", label: "Total Time" },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
              fontSize: "1.5rem", color: GOLD, lineHeight: 1,
            }}>{stat.value}</div>
            <div style={{
              fontFamily: "'Barlow', sans-serif", fontSize: "0.6rem",
              color: "rgba(148,163,184,0.45)", textTransform: "uppercase",
              letterSpacing: "0.1em", marginTop: "0.25rem",
            }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Section ────────────────────────────────────────────────────────────
export default function WhyAI() {
  const { ref, inView } = useInView();
  const [, navigate] = useLocation();

  const fadeIn = (delay: number): React.CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
  });

  return (
    <section ref={ref} style={{ background: DARK, padding: "6rem 0", position: "relative", overflow: "hidden" }}>

      {/* Background radial */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 65% 50%, rgba(30,64,175,0.06) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      <div style={{
        maxWidth: "1160px", margin: "0 auto", padding: "0 2rem",
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "5rem", alignItems: "center",
      }}>

        {/* ── LEFT: Copy ── */}
        <div>

          {/* Eyebrow */}
          <div style={{
            ...fadeIn(0),
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600,
            fontSize: "0.6rem", letterSpacing: "0.26em", textTransform: "uppercase",
            color: `${GOLD}80`, marginBottom: "1rem",
          }}>
            The Science Behind the Score
          </div>

          {/* Headline */}
          <h2 style={{
            ...fadeIn(0.08),
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
            fontSize: "clamp(2rem, 3.5vw, 2.8rem)", color: "#ffffff",
            textTransform: "uppercase", letterSpacing: "0.03em",
            lineHeight: 1.08, marginBottom: "1.5rem",
          }}>
            Why AI Sees<br />What Humans Can't
          </h2>

          {/* Punch opening */}
          <div style={{
            ...fadeIn(0.16),
            marginBottom: "1.25rem",
          }}>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: "1.1rem", color: "rgba(255,255,255,0.85)",
              lineHeight: 1.5, marginBottom: "0.5rem",
            }}>
              A human grader has seconds.<br />
              Your card has thousands of details.
            </p>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
              fontSize: "1rem", color: GOLD, letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}>
              That's not precision. That's estimation.
            </p>
          </div>

          {/* Orange divider */}
          <div style={{
            ...fadeIn(0.2),
            width: "50px", height: "1px",
            background: "#d97706", marginBottom: "1.75rem",
          }} />

          {/* Human limitation */}
          <p style={{
            ...fadeIn(0.24),
            fontFamily: "'Barlow', sans-serif", fontSize: "0.88rem",
            color: "rgba(148,163,184,0.65)", lineHeight: 1.8,
            marginBottom: "1.75rem",
          }}>
            Look at a single letter on your screen — without moving your eyes,
            read the full sentence above it. You can't. That's the limitation
            of human vision. Our system doesn't have that problem.
          </p>

          {/* Proof stats */}
          <div style={{
            ...fadeIn(0.3),
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(201,168,76,0.12)",
            borderRadius: "6px",
            padding: "1.25rem 1.5rem",
            marginBottom: "1.75rem",
          }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase",
              color: `${GOLD}70`, marginBottom: "1rem",
            }}>
              Diamond Index™ doesn't guess. It measures.
            </div>
            {[
              { stat: "1,000,000+", label: "data points per card" },
              { stat: "125+",       label: "angles captured" },
              { stat: "15",         label: "full scan passes" },
              { stat: "< 6 sec",    label: "total processing time" },
            ].map(row => (
              <div key={row.stat} style={{
                display: "flex", alignItems: "baseline", gap: "0.75rem",
                marginBottom: "0.55rem",
              }}>
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
                  fontSize: "1rem", color: GOLD, minWidth: "90px",
                }}>{row.stat}</span>
                <span style={{
                  fontFamily: "'Barlow', sans-serif", fontSize: "0.76rem",
                  color: "rgba(148,163,184,0.5)",
                }}>{row.label}</span>
              </div>
            ))}
          </div>

          {/* Key value sentence */}
          <div style={{
            ...fadeIn(0.36),
            borderLeft: `2px solid ${GOLD}50`,
            paddingLeft: "1rem",
            marginBottom: "2rem",
          }}>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
              fontSize: "1rem", color: "rgba(255,255,255,0.8)",
              lineHeight: 1.5, letterSpacing: "0.02em",
            }}>
              A 2-point flaw shouldn't cost you 80% of your card's value.
            </p>
            <p style={{
              fontFamily: "'Barlow', sans-serif", fontSize: "0.78rem",
              color: "rgba(148,163,184,0.5)", marginTop: "0.4rem", lineHeight: 1.6,
            }}>
              We built Diamond Index™ to bring fairness back to collectors.
              Transparent grading. Consistent results. No surprises.
            </p>
          </div>

          {/* CTA */}
          <div style={fadeIn(0.42)}>
            <button
              onClick={() => navigate("/grade")}
              style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: "0.8rem", letterSpacing: "0.14em", textTransform: "uppercase",
                padding: "0.85rem 1.75rem",
                background: "transparent", color: GOLD,
                border: `1px solid ${GOLD}55`,
                borderRadius: "4px", cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => {
                (e.target as HTMLButtonElement).style.background = `${GOLD}12`;
                (e.target as HTMLButtonElement).style.borderColor = GOLD;
              }}
              onMouseLeave={e => {
                (e.target as HTMLButtonElement).style.background = "transparent";
                (e.target as HTMLButtonElement).style.borderColor = `${GOLD}55`;
              }}
            >
              See How Your Card Scores →
            </button>
          </div>
        </div>

        {/* ── RIGHT: Cinematic Card Visual ── */}
        <div style={{
          ...fadeIn(0.2),
          display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          <CardScanVisual active={inView} />
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .why-ai-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
