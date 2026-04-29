/*
 * Diamond Index™ — Value Proposition Section
 * Financial platform aesthetic — data-driven, institutional
 * White background, clean stats, glass panels
 * Uses real diamond imagery as section accent
 */

const DIAMOND_ROW_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663561062795/UEWYWAMT5GywXJoC65CCq5/diamond-row-5-ACGdD2Lr8VrzReMAHvKY5s.webp";

const stats = [
  { value: "2.4M+", label: "Cards Certified", sublabel: "Since 2019" },
  { value: "98.7%", label: "Accuracy Rate", sublabel: "Verified by third-party audit" },
  { value: "$84M", label: "Portfolio Value", sublabel: "Under Diamond Index™ certification" },
  { value: "72hrs", label: "Standard Turnaround", sublabel: "Express options available" },
];

const features = [
  {
    title: "Immutable Registry",
    description:
      "Every certified card is logged to a permanent, tamper-proof registry. Ownership history and grade are verifiable at any time.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="14" height="14" rx="2" stroke="#1a2a6c" strokeWidth="1.25" />
        <path d="M7 10l2 2 4-4" stroke="#1a2a6c" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Market Intelligence",
    description:
      "Real-time valuation data drawn from thousands of verified transactions. Know the precise market value of your certified card.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polyline points="3,14 7,9 11,12 17,5" stroke="#1a2a6c" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="17" cy="5" r="1.5" fill="#1a2a6c" />
      </svg>
    ),
  },
  {
    title: "Universal Standard",
    description:
      "Diamond Index™ grades are recognized by major auction houses, dealers, and collectors globally. One standard. Every card.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="7" stroke="#1a2a6c" strokeWidth="1.25" />
        <path d="M10 3 Q14 10 10 17 Q6 10 10 3" stroke="#1a2a6c" strokeWidth="1" />
        <line x1="3" y1="10" x2="17" y2="10" stroke="#1a2a6c" strokeWidth="1" />
      </svg>
    ),
  },
];

export default function ValueSection() {
  return (
    <section
      id="value"
      style={{
        background: "#ffffff",
        paddingTop: "6rem",
        paddingBottom: "6rem",
        borderTop: "1px solid oklch(0.91 0.005 255)",
      }}
    >
      <div className="container">

        {/* Diamond visual accent bar */}
        <div
          style={{
            marginBottom: "4rem",
            borderRadius: "6px",
            overflow: "hidden",
            background: "#020c22",
            boxShadow: "0 4px 24px rgba(0,20,80,0.14)",
            position: "relative",
          }}
        >
          <img
            src={DIAMOND_ROW_URL}
            alt="Diamond Index™ grading standard"
            style={{
              width: "100%",
              height: "clamp(120px, 14vw, 200px)",
              objectFit: "cover",
              objectPosition: "center 30%",
              display: "block",
              opacity: 0.85,
            }}
          />
          {/* Overlay text */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(2,8,30,0.45)",
            }}
          >
            <p
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 300,
                fontSize: "clamp(0.75rem, 1.5vw, 1rem)",
                letterSpacing: "0.22em",
                color: "rgba(200,220,255,0.8)",
                textTransform: "uppercase",
                textAlign: "center",
                margin: 0,
              }}
            >
              The Next Generation of Trading Card Certification
            </p>
          </div>
        </div>

        {/* Section header — moved below diamond banner */}
        <div style={{ marginBottom: "3.5rem", textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "1rem",
            }}
          >
            <span style={{ display: "inline-block", width: "28px", height: "1px", background: "oklch(0.72 0.18 45)" }} />
            <span
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 400,
                fontSize: "0.7rem",
                letterSpacing: "0.22em",
                color: "#9ca3af",
                textTransform: "uppercase",
              }}
            >
              Why Diamond Index™
            </span>
            <span style={{ display: "inline-block", width: "28px", height: "1px", background: "oklch(0.72 0.18 45)" }} />
          </div>
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              letterSpacing: "-0.01em",
              color: "#0d1b3e",
              lineHeight: 1,
              marginBottom: "1rem",
            }}
          >
            THE VALUE OF CERTIFICATION
          </h2>
          <p
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 300,
              fontSize: "1rem",
              color: "#6b7280",
              maxWidth: "560px",
              lineHeight: 1.6,
              margin: "0 auto",
            }}
          >
            A Diamond Index™ certification is more than a grade. It is a financial instrument — a verified record of condition, authenticity, and market value.
          </p>
        </div>

        {/* Features grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5rem",
          }}
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              className="di-card"
              style={{
                padding: "2rem",
                transition: "all 0.4s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.boxShadow = "0 12px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.06)";
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.boxShadow = "0 2px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)";
                el.style.transform = "translateY(0)";
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "oklch(0.96 0.005 255)",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                }}
              >
                {feature.icon}
              </div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 600,
                  fontSize: "1rem",
                  letterSpacing: "0.06em",
                  color: "#0d1b3e",
                  textTransform: "uppercase",
                  marginBottom: "0.75rem",
                }}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                  fontSize: "0.875rem",
                  color: "#6b7280",
                  lineHeight: 1.6,
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
