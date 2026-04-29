/**
 * GradingScale — Diamond Index™ Grading Scale Section
 *
 * Design: Dark background, 5 diamond tiers as hero visual
 * Tiers: Standard (1♦) → Premium (2♦) → Superior (3♦) → Elite (4♦) → Pristine (5♦)
 * Not Gradeable shown as footnote below grid
 * Auto-highlights Superior on scroll-in; hover overrides
 */

import { useEffect, useRef, useState } from "react";
import { DIAMOND_ASSETS, diamondLabel } from "@/lib/diamondRating";
import GradingMethodologyModal from "@/components/GradingMethodologyModal";

const TIERS = [
  {
    count: 1,
    rank: "Standard",
    range: "80 – 84",
    description: "Visible wear or light surface marks. Meets minimum certification threshold.",
    glowColor: "rgba(148,163,184,0.3)",
  },
  {
    count: 2,
    rank: "Premium",
    range: "85 – 88",
    description: "Minor imperfections. Good centering with light surface marks.",
    glowColor: "rgba(99,155,255,0.3)",
  },
  {
    count: 3,
    rank: "Superior",
    range: "89 – 92",
    description: "Well-preserved with minimal flaws. Strong centering and visual appeal.",
    glowColor: "rgba(99,155,255,0.45)",
  },
  {
    count: 4,
    rank: "Elite",
    range: "93 – 96",
    description: "Near-perfect condition. Exceptional centering, surface, and edges.",
    glowColor: "rgba(201,168,76,0.45)",
  },
  {
    count: 5,
    rank: "Pristine",
    range: "97 – 100",
    description: "Flawless. Perfect in every measurable category. The highest certification issued.",
    glowColor: "rgba(201,168,76,0.65)",
  },
];

export default function GradingScale() {
  const [visible, setVisible] = useState(false);
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);
  const [defaultActive, setDefaultActive] = useState(false);
  const [methodOpen, setMethodOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const userInteracted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          // Auto-highlight Superior (count 3, score 90–95) after entrance animation settles
          const t1 = setTimeout(() => {
            if (!userInteracted.current) {
              setDefaultActive(true);
              setHoveredTier(3);
            }
          }, 900);
          return () => clearTimeout(t1);
        } else {
          // Section scrolled out — reset so it re-triggers next time
          if (!userInteracted.current) {
            setHoveredTier(null);
            setDefaultActive(false);
          }
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
    <section
      id="grade"
      ref={ref}
      style={{
        background: "oklch(0.1 0.02 255)",
        paddingTop: "6rem",
        paddingBottom: "5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle background glow */}
      <div style={{
        position: "absolute",
        top: "30%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "700px",
        height: "400px",
        background: "radial-gradient(ellipse, rgba(99,155,255,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>

        {/* Section header */}
        <div
          className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ textAlign: "center", marginBottom: "1rem" }}
        >
          <div style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            color: "rgba(201,168,76,0.7)",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}>
            Diamond Index™ Certification Authority
          </div>
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
            letterSpacing: "0.06em",
            color: "#ffffff",
            textTransform: "uppercase",
            lineHeight: 1.1,
            marginBottom: "0.75rem",
          }}>
            The Diamond Grading Scale
          </h2>
          <p style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 300,
            fontSize: "0.9rem",
            color: "rgba(148,163,184,0.75)",
            maxWidth: "480px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}>
            A 5-point grading system based on precision and condition
          </p>
        </div>

        {/* Scale legend */}
        <div
          className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            marginBottom: "3.5rem",
            transitionDelay: "0.15s",
          }}
        >
          <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", color: "rgba(148,163,184,0.6)", textTransform: "uppercase" }}>
            1 Diamond = Standard
          </span>
          <div style={{ width: "80px", height: "1px", background: "linear-gradient(90deg, rgba(100,116,139,0.3), rgba(201,168,76,0.5))" }} />
          <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", color: "rgba(201,168,76,0.8)", textTransform: "uppercase" }}>
            5 Diamonds = Pristine
          </span>
        </div>

        {/* Diamond tiers — 5 columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "0",
            position: "relative",
          }}
        >
          {TIERS.map((tier, i) => {
            const isCenter = tier.count === 3; // Superior is visual center
            const isPristine = tier.count === 5;
            const isElite = tier.count === 4;
            const isHovered = hoveredTier === tier.count;
            const dimmed = hoveredTier !== null && !isHovered;

            return (
              <div
                key={tier.count}
                className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{
                  transitionDelay: `${0.2 + i * 0.08}s`,
                  position: "relative",
                  cursor: "default",
                }}
                onMouseEnter={() => { userInteracted.current = true; setHoveredTier(tier.count); }}
                onMouseLeave={() => setHoveredTier(null)}
              >
                {/* Card */}
                <div
                  style={{
                    background: isHovered
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(255,255,255,0.02)",
                    border: isHovered
                      ? `1px solid ${isPristine ? "rgba(201,168,76,0.5)" : isElite ? "rgba(201,168,76,0.35)" : "rgba(99,155,255,0.25)"}`
                      : "1px solid rgba(255,255,255,0.05)",
                    borderRadius: "4px",
                    padding: isCenter ? "2.5rem 1.25rem 2rem" : "2rem 1.25rem 1.75rem",
                    margin: isCenter ? "-0.5rem 0" : "0",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1rem",
                    transition: "all 0.3s ease",
                    opacity: dimmed ? 0.4 : 1,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Pristine top accent */}
                  {isPristine && (
                    <div style={{
                      position: "absolute",
                      top: 0, left: 0, right: 0,
                      height: "2px",
                      background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.9), transparent)",
                    }} />
                  )}

                  {/* Glow behind diamond */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -60%)",
                      width: isCenter ? "120px" : "90px",
                      height: isCenter ? "120px" : "90px",
                      background: `radial-gradient(circle, ${tier.glowColor} 0%, transparent 70%)`,
                      pointerEvents: "none",
                      transition: "opacity 0.3s",
                      opacity: isHovered ? 1 : 0.5,
                    }}
                  />

                  {/* Diamond image */}
                  <img
                    src={DIAMOND_ASSETS[tier.count]}
                    alt={diamondLabel(tier.count)}
                    style={{
                      height: isCenter ? "52px" : "40px",
                      width: "auto",
                      objectFit: "contain",
                      display: "block",
                      position: "relative",
                      zIndex: 1,
                      transition: "transform 0.3s ease, filter 0.3s ease",
                      transform: isHovered ? "translateY(-3px) scale(1.08)" : "translateY(0) scale(1)",
                      filter: isHovered
                        ? `drop-shadow(0 4px 16px ${tier.glowColor})`
                        : "none",
                    }}
                    draggable={false}
                  />

                  {/* Rank label */}
                  <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      fontSize: isCenter ? "1rem" : "0.85rem",
                      letterSpacing: "0.12em",
                      color: isPristine ? "rgba(201,168,76,0.95)" : isElite ? "rgba(201,168,76,0.75)" : "#ffffff",
                      textTransform: "uppercase",
                      lineHeight: 1,
                      marginBottom: "3px",
                    }}>
                      {tier.rank}
                    </div>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: isHovered ? 700 : 400,
                      fontSize: isHovered ? "0.95rem" : "0.6rem",
                      letterSpacing: "0.1em",
                      color: isHovered
                        ? (isPristine ? "rgba(255,220,100,1)" : isElite ? "rgba(255,210,80,0.95)" : "rgba(120,200,255,0.95)")
                        : "rgba(100,116,139,0.7)",
                      textTransform: "uppercase",
                      transition: "font-size 0.25s ease, color 0.25s ease, font-weight 0.25s ease",
                      textShadow: isHovered ? (isPristine || isElite ? "0 0 12px rgba(201,168,76,0.5)" : "0 0 12px rgba(99,155,255,0.4)") : "none",
                    }}>
                      Score {tier.range}
                    </div>
                  </div>

                  {/* Hover description — slides in */}
                  <div
                    style={{
                      fontFamily: "'Barlow', sans-serif",
                      fontWeight: 300,
                      fontSize: "0.72rem",
                      color: "rgba(148,163,184,0.85)",
                      lineHeight: 1.55,
                      textAlign: "center",
                      maxHeight: isHovered ? "80px" : "0",
                      overflow: "hidden",
                      transition: "max-height 0.35s ease, opacity 0.3s ease",
                      opacity: isHovered ? 1 : 0,
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {tier.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Not Gradeable footnote */}
        <div
          className={`transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
          style={{
            textAlign: "center",
            marginTop: "2rem",
            transitionDelay: "0.6s",
          }}
        >
          <span style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: "0.62rem",
            letterSpacing: "0.12em",
            color: "rgba(239,68,68,0.55)",
            textTransform: "uppercase",
          }}>
            ✕ Below 80 — Not Gradeable: too many defects to certify
          </span>
        </div>

        {/* See Precise Grading Index trigger */}
        <div
          className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ textAlign: "center", marginTop: "3rem", transitionDelay: "0.7s" }}
        >
          <button
            onClick={() => setMethodOpen(true)}
            style={{
              background: "transparent",
              border: "1px solid rgba(201,168,76,0.35)",
              borderRadius: "2px",
              padding: "0.65rem 1.75rem",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              color: "rgba(201,168,76,0.85)",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.08)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.6)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.35)";
            }}
          >
            ◆ See Precise Grading Index
          </button>
        </div>

        {/* Bottom caption */}
        <div
          className={`transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
          style={{
            textAlign: "center",
            marginTop: "3.5rem",
            transitionDelay: "0.8s",
          }}
        >
          <span style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            color: "rgba(100,116,139,0.4)",
            textTransform: "uppercase",
          }}>
            Standards — Diamond Index™ Certification Authority
          </span>
        </div>

      </div>
    </section>

    <GradingMethodologyModal open={methodOpen} onClose={() => setMethodOpen(false)} />
    </>
  );
}
