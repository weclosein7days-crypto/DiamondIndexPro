/**
 * Diamond Index™ — Conversion Strip
 * Emotional bridge between WhyAI and Pricing
 * "Your Card Isn't Worth Less. It's Just Been Graded Wrong."
 */

import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

const GOLD = "#c9a84c";
const DARK = "#060d1e";

function useInView(threshold = 0.2) {
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

export default function ConversionStrip() {
  const { ref, inView } = useInView();
  const [, navigate] = useLocation();

  return (
    <section
      ref={ref}
      style={{
        background: `linear-gradient(135deg, ${DARK} 0%, #0a1628 50%, ${DARK} 100%)`,
        padding: "5rem 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Orange accent line top */}
      <div style={{
        position: "absolute", top: 0, left: "15%", right: "15%", height: "1px",
        background: "linear-gradient(90deg, transparent, #d97706, transparent)",
      }} />

      {/* Background glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 50%, rgba(201,168,76,0.04) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div style={{
        maxWidth: "800px", margin: "0 auto", padding: "0 2rem",
        textAlign: "center",
      }}>

        {/* Diamond icon */}
        <div style={{
          fontSize: "1.6rem", color: GOLD, marginBottom: "1.5rem",
          opacity: inView ? 1 : 0,
          transform: inView ? "scale(1)" : "scale(0.7)",
          transition: "all 0.5s ease",
        }}>
          ◆
        </div>

        {/* Main headline */}
        <h2 style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
          fontSize: "clamp(1.8rem, 4vw, 3rem)", color: "#ffffff",
          textTransform: "uppercase", letterSpacing: "0.03em",
          lineHeight: 1.1, marginBottom: "1.25rem",
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.65s ease 0.1s",
        }}>
          Your Card Isn't Worth Less.<br />
          <span style={{ color: GOLD }}>It's Just Been Graded Wrong.</span>
        </h2>

        {/* Sub copy */}
        <p style={{
          fontFamily: "'Barlow', sans-serif", fontSize: "1rem",
          color: "rgba(148,163,184,0.65)", lineHeight: 1.8,
          maxWidth: "560px", margin: "0 auto 2rem",
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.65s ease 0.2s",
        }}>
          Diamond Index™ rewards condition — without punishing collectors
          for minor imperfections. Every grade is earned. Every score is fair.
        </p>

        {/* Orange divider */}
        <div style={{
          width: "60px", height: "1px",
          background: "#d97706",
          margin: "0 auto 2rem",
          opacity: inView ? 1 : 0,
          transition: "opacity 0.5s ease 0.3s",
        }} />

        {/* CTA button */}
        <div style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.65s ease 0.35s",
        }}>
          <button
            onClick={() => navigate("/grade")}
            style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
              fontSize: "0.88rem", letterSpacing: "0.16em", textTransform: "uppercase",
              padding: "1.1rem 2.5rem",
              background: GOLD, color: DARK,
              border: "none", borderRadius: "4px",
              cursor: "pointer",
              boxShadow: `0 0 30px rgba(201,168,76,0.25)`,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => {
              (e.target as HTMLButtonElement).style.background = "#d4a84c";
              (e.target as HTMLButtonElement).style.boxShadow = "0 0 40px rgba(201,168,76,0.4)";
              (e.target as HTMLButtonElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              (e.target as HTMLButtonElement).style.background = GOLD;
              (e.target as HTMLButtonElement).style.boxShadow = "0 0 30px rgba(201,168,76,0.25)";
              (e.target as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            Grade Your Card Now →
          </button>
        </div>

      </div>

      {/* Orange accent line bottom */}
      <div style={{
        position: "absolute", bottom: 0, left: "15%", right: "15%", height: "1px",
        background: "linear-gradient(90deg, transparent, #d97706, transparent)",
      }} />
    </section>
  );
}
