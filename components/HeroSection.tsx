/*
 * Diamond Index™ — HeroSection (LOCKED)n
 * MATCHES FINAL MOCKUP:
 * Left 40%: Copy block — eyebrow, big headline, italic subhead, body, sample grade strip, CTAs
 * Right 60%: Phone scanning card image — right-aligned, bleeds off right edge, soft blue glow behind
 * Background: deep navy → black gradient
 * Accent: gold (#c9a84c) for headline, sample grade border, CTA button
 * NO slabs, NO clutter, NO centered layout
 *
 * COLLABORATOR FIXES (applied):
 * 1. Headline letter-spacing tightened — feels "locked in"
 * 2. Subheadline brighter/higher contrast (white instead of gold)
 * 3. Button hierarchy: primary=gold solid, secondary=dimmer outline
 * 4. Sample strip tighter spacing — diamonds + % feel like one unit
 * 5. Image bleeds more off right edge
 * + Scanner slowed from 2.2s → 4s
 */

import { useEffect, useRef, useState } from "react";

// Dark bokeh background phone scanning card image
const PHONE_IMG_URL = "/manus-storage/pasted_file_zUMIJb_image_cea74904.webp";

const TARGET_SCORE = 96.0;
const DIAMOND_COUNT = 5;

export default function HeroSection() {
  const [visible, setVisible] = useState(false);
  const [litDiamonds, setLitDiamonds] = useState(0);
  const [score, setScore] = useState(0);
  const animStarted = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Trigger diamond + counter animation when hero strip scrolls into view
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || animStarted.current) return;
        animStarted.current = true;

        // Light up diamonds one by one, 300ms apart, starting after 200ms
        for (let i = 1; i <= DIAMOND_COUNT; i++) {
          setTimeout(() => setLitDiamonds(i), 200 + i * 300);
        }

        // Count up score after last diamond lights up
        const duration = 2200; // 2.2s ease-out — slow and premium
        const start = 200 + DIAMOND_COUNT * 300 + 150;
        const startTime = Date.now() + start;
        const tick = () => {
          const elapsed = Date.now() - startTime;
          if (elapsed < 0) { requestAnimationFrame(tick); return; }
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setScore(parseFloat((eased * TARGET_SCORE).toFixed(1)));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        paddingTop: "64px",
        overflow: "hidden",
        background: "linear-gradient(135deg, #060d1e 0%, #08102a 40%, #03070f 100%)",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Radial glow — center-right, blue */}
      <div
        style={{
          position: "absolute",
          right: "10%",
          top: "50%",
          transform: "translateY(-50%)",
          width: "700px",
          height: "700px",
          background: "radial-gradient(circle, rgba(29,78,216,0.28) 0%, rgba(15,40,120,0.12) 45%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Subtle star-dust texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 20% 80%, rgba(201,168,76,0.04) 0%, transparent 50%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Main grid */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 4rem 0 5rem",
          display: "grid",
          gridTemplateColumns: "2fr 3fr",
          alignItems: "center",
          minHeight: "calc(100vh - 64px)",
          gap: "0",
        }}
      >
        {/* ── LEFT: Copy ─────────────────────────────────────────────────── */}
        <div
          className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ paddingRight: "2rem" }}
        >
          {/* Eyebrow */}
          <p
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 500,
              fontSize: "0.7rem",
              letterSpacing: "0.28em",
              color: "rgba(201,168,76,0.75)",
              textTransform: "uppercase",
              marginBottom: "1.2rem",
            }}
          >
            Certification Authority
          </p>

          {/* Headline — FIX 1: tighter letter-spacing, feels locked in */}
          <h1
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(3.8rem, 6vw, 6.5rem)",
              lineHeight: 0.9,
              letterSpacing: "-0.03em", /* tighter than before */
              color: "#ffffff",
              marginBottom: "0.6rem",
            }}
          >
            DIAMOND
            <br />
            <span style={{ color: "#ffffff" }}>INDEX</span>
            <sup
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 400,
                fontSize: "0.22em",
                color: "#c9a84c",
                verticalAlign: "super",
                marginLeft: "4px", /* slightly tighter */
              }}
            >
              ™
            </sup>
          </h1>

          {/* Italic subheadline — FIX 2: brighter, higher contrast */}
          <p
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontStyle: "italic",
              fontSize: "clamp(1.2rem, 2vw, 1.6rem)",
              color: "#f0f4ff", /* bright white-blue instead of gold */
              lineHeight: 1.3,
              marginBottom: "1.2rem",
            }}
          >
            Know What It's Worth — Instantly
          </p>

          {/* Body text */}
          <p
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 300,
              fontSize: "1rem",
              color: "rgba(180,200,240,0.75)",
              lineHeight: 1.65,
              marginBottom: "2rem",
              maxWidth: "420px",
            }}
          >
            A smarter standard for card grading, valuation, and verification.
          </p>

          {/* Sample Grade Strip — FIX 4: tighter spacing, one cohesive unit */}
          <div
            ref={stripRef}
            style={{
              display: "inline-block",
              border: "1px solid rgba(201,168,76,0.45)",
              borderRadius: "3px",
              padding: "0.65rem 1rem",
              marginBottom: "2rem",
              background: "rgba(201,168,76,0.05)",
            }}
          >
            <div
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 500,
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                color: "rgba(201,168,76,0.7)",
                textTransform: "uppercase",
                marginBottom: "0.4rem",
              }}
            >
              Sample Grade &nbsp;|&nbsp; Aaron Judge · 2024 Topps Chrome
            </div>
            {/* Diamonds + score as one tight unit */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {[0,1,2,3,4].map(i => {
                const lit = i < litDiamonds;
                return (
                  <img
                    key={i}
                    src="/manus-storage/diamond-blue-sm_46bffbe0.png"
                    width="36"
                    height="36"
                    alt="diamond"
                    style={{
                      transition: "filter 0.4s ease, transform 0.4s ease, opacity 0.4s ease",
                      opacity: lit ? 1 : 0.15,
                      filter: lit
                        ? "drop-shadow(0 0 6px rgba(130,210,255,0.95)) drop-shadow(0 0 14px rgba(70,160,220,0.6)) brightness(1.15)"
                        : "grayscale(1) brightness(0.35)",
                      transform: lit ? "scale(1.1)" : "scale(1)",
                    }}
                  />
                );
              })}
              {/* Divider between diamonds and score */}
              <div style={{
                width: "1px",
                height: "24px",
                background: "rgba(201,168,76,0.3)",
                margin: "0 6px",
              }} />
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  color: "#c9a84c",
                  letterSpacing: "0.02em",
                  minWidth: "68px",
                  display: "inline-block",
                  textShadow: score > 90 ? "0 0 12px rgba(201,168,76,0.5)" : "none",
                  transition: "text-shadow 0.3s ease",
                }}
              >
                {score.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* CTAs — FIX 3: primary=gold solid, secondary=dimmer/subtler */}
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            {/* PRIMARY — gold, bold */}
            <a
              href="/grade"
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 700,
                fontSize: "0.75rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "0.9rem 2.2rem",
                background: "#c9a84c",
                color: "#0a0f1e",
                borderRadius: "2px",
                textDecoration: "none",
                transition: "background 0.2s, transform 0.2s",
                display: "inline-block",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = "#b8963e";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = "#c9a84c";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
              }}
            >
              Grade a Card
            </a>
            {/* SECONDARY — dim outline, recedes visually */}
            <a
              href="#how-it-works"
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 400,
                fontSize: "0.72rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "0.9rem 1.6rem",
                background: "transparent",
                color: "rgba(140,165,210,0.6)",
                border: "1px solid rgba(100,140,220,0.2)",
                borderRadius: "2px",
                textDecoration: "none",
                transition: "color 0.2s, border-color 0.2s",
                display: "inline-block",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "rgba(180,200,240,0.9)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(100,140,220,0.45)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "rgba(140,165,210,0.6)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(100,140,220,0.2)";
              }}
            >
              How It Works →
            </a>
          </div>
        </div>

        {/* ── RIGHT: Phone scanning card — FIX 5: bleeds more off right edge ─ */}
        <div
          className={`transition-all duration-1000 ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            marginRight: "-8rem", /* more bleed — was -4rem */
            transitionDelay: "0.3s",
          }}
        >
          {/* Blue glow behind image */}
          <div
            style={{
              position: "absolute",
              right: "15%",
              top: "50%",
              transform: "translateY(-50%)",
              width: "500px",
              height: "500px",
              background: "radial-gradient(circle, rgba(29,78,216,0.35) 0%, transparent 65%)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
          {/* Phone image + scan overlay wrapper */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              width: "clamp(500px, 58vw, 820px)", /* slightly wider */
              display: "inline-block",
            }}
          >
            <img
              src={PHONE_IMG_URL}
              alt="Grade your card from your phone — Diamond Index™"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                filter: "drop-shadow(0 20px 60px rgba(29,78,216,0.5)) drop-shadow(0 4px 20px rgba(0,0,0,0.8))",
              }}
            />

            {/* Scan line overlay — positioned over the phone screen area */}
            <div
              style={{
                position: "absolute",
                top: "8%",
                left: "38%",
                width: "42%",
                height: "72%",
                overflow: "hidden",
                pointerEvents: "none",
                borderRadius: "4px",
              }}
            >
              {/* Animated blue scan line — FIX: slowed to 4s (was 2.2s) */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: "linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.0) 5%, rgba(56,189,248,0.9) 30%, rgba(147,210,255,1) 50%, rgba(56,189,248,0.9) 70%, rgba(56,189,248,0.0) 95%, transparent 100%)",
                  boxShadow: "0 0 12px 4px rgba(56,189,248,0.6), 0 0 30px 8px rgba(56,189,248,0.25)",
                  animation: "di-scan 4s ease-in-out infinite",
                }}
              />
              {/* Scan area tint */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(56,189,248,0.04) 0%, rgba(56,189,248,0.08) 50%, rgba(56,189,248,0.04) 100%)",
                  animation: "di-scan-tint 4s ease-in-out infinite",
                }}
              />
              {/* Corner brackets */}
              {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    ...(pos.includes("top-0") ? { top: "6px" } : { bottom: "6px" }),
                    ...(pos.includes("left-0") ? { left: "6px" } : { right: "6px" }),
                    width: "14px",
                    height: "14px",
                    borderTop: pos.includes("top-0") ? "2px solid rgba(56,189,248,0.9)" : "none",
                    borderBottom: pos.includes("bottom-0") ? "2px solid rgba(56,189,248,0.9)" : "none",
                    borderLeft: pos.includes("left-0") ? "2px solid rgba(56,189,248,0.9)" : "none",
                    borderRight: pos.includes("right-0") ? "2px solid rgba(56,189,248,0.9)" : "none",
                  }}
                />
              ))}
              {/* DI HUD label */}
              <div
                style={{
                  position: "absolute",
                  bottom: "14px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.55rem",
                  letterSpacing: "0.22em",
                  color: "rgba(56,189,248,0.85)",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  animation: "di-hud-blink 4s ease-in-out infinite",
                }}
              >
                ◆ Analyzing...
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
