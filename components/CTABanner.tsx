/*
 * Diamond Index™ — CTA Banner Section
 * Dark navy panel, clean call-to-action
 * Minimal orange accent, institutional tone
 */

import { useLocation } from "wouter";

export default function CTABanner() {
  const [, navigate] = useLocation();
  return (
    <section
      style={{
        background: "#0d1b3e",
        paddingTop: "5rem",
        paddingBottom: "5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Diamond background texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663561062795/UEWYWAMT5GywXJoC65CCq5/hero-bg-dark-5dXhRvSwMi5sFUqbygTZ2u.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />
      {/* Dark overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(13,27,62,0.85) 0%, rgba(5,12,35,0.9) 100%)",
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative", textAlign: "center" }}>
        {/* Orange accent line */}
        <div
          style={{
            width: "48px",
            height: "1px",
            background: "oklch(0.72 0.18 45)",
            margin: "0 auto 2rem",
          }}
        />

        <h2
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            letterSpacing: "-0.01em",
            color: "#ffffff",
            lineHeight: 1,
            marginBottom: "1.25rem",
          }}
        >
          READY TO CERTIFY YOUR COLLECTION?
        </h2>

        <p
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontStyle: "italic",
            fontSize: "clamp(1rem, 1.8vw, 1.25rem)",
            color: "rgba(200, 212, 240, 0.7)",
            marginBottom: "2.5rem",
            maxWidth: "480px",
            margin: "0 auto 2.5rem",
            lineHeight: 1.5,
          }}
        >
          Join over 2.4 million certified cards in the Diamond Index™ registry.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/grade")}
            style={{
              display: "inline-block",
              padding: "0.875rem 2.5rem",
              background: "white",
              color: "#0d1b3e",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "0.9rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              borderRadius: "3px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.9)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "white";
            }}
          >
            Start Grading
          </button>
          <button
            onClick={() => navigate("/grader-program")}
            style={{
              display: "inline-block",
              padding: "0.875rem 2.5rem",
              background: "transparent",
              color: "rgba(200, 212, 240, 0.8)",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
              fontSize: "0.9rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              borderRadius: "3px",
              border: "1px solid rgba(200, 212, 240, 0.25)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(200, 212, 240, 0.5)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(200, 212, 240, 1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(200, 212, 240, 0.25)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(200, 212, 240, 0.8)";
            }}
          >
            Become a Grader
          </button>
        </div>
      </div>
    </section>
  );
}
