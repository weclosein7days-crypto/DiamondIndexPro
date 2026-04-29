/*
 * Diamond Index™ — Pricing Section
 * Design: institutional, financial platform
 * 3 columns: Digital ($1.99) | Kit ($14.99, featured) | Full Service ($19.99)
 * Middle column: dark navy background, elevated, orange accent
 * Outer columns: white/silver, soft shadow
 */

const plans = [
  {
    id: "digital",
    name: "Digital",
    price: "$1.99",
    period: "per card",
    tagline: "Instant digital certification",
    featured: false,
    features: [
      "Digital certificate issued",
      "Registry entry created",
      "QR verification link",
      "Diamond rating assigned",
      "PDF download included",
    ],
    cta: "Get Digital Grade",
    ctaHref: "#grade",
  },
  {
    id: "kit",
    name: "Kit",
    price: "$14.99",
    period: "per card",
    tagline: "Physical slab + digital record",
    featured: true,
    badge: "Most Popular",
    features: [
      "Everything in Digital",
      "Tamper-evident polycarbonate slab",
      "Diamond cluster label printed",
      "Priority processing queue",
      "Holographic security seal",
      "Dealer resale eligible",
    ],
    cta: "Order Kit Grade",
    ctaHref: "#grade",
  },
  {
    id: "full",
    name: "Full Service",
    price: "$19.99",
    period: "per card",
    tagline: "White-glove grading experience",
    featured: false,
    features: [
      "Everything in Kit",
      "Expert human review",
      "Detailed condition report",
      "High-resolution scan archive",
      "Insurance valuation letter",
      "Expedited 48hr turnaround",
    ],
    cta: "Order Full Service",
    ctaHref: "#grade",
  },
];

export default function PricingSection() {
  return (
    <section
      id="pricing"
      style={{
        background: "oklch(0.975 0.003 255)",
        paddingTop: "6rem",
        paddingBottom: "6rem",
        borderTop: "1px solid oklch(0.91 0.005 255)",
      }}
    >
      <div className="container">
        {/* Section header */}
        <div style={{ marginBottom: "3.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
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
              Certification Tiers
            </span>
          </div>
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              letterSpacing: "-0.01em",
              color: "#0d1b3e",
              lineHeight: 1,
              marginBottom: "0.75rem",
            }}
          >
            SIMPLE, TRANSPARENT PRICING
          </h2>
          <p
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 300,
              fontSize: "1rem",
              color: "#6b7280",
              maxWidth: "480px",
              lineHeight: 1.6,
            }}
          >
            Every card deserves a certified grade. Choose the level of service that fits your collection.
          </p>
        </div>

        {/* Pricing grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5rem",
            alignItems: "stretch",
          }}
        >
          {plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                position: "relative",
                background: plan.featured ? "#0d1b3e" : "#ffffff",
                border: plan.featured ? "none" : "1px solid #e4e8f0",
                borderRadius: "6px",
                padding: plan.featured ? "2.5rem 2rem" : "2.25rem 2rem",
                boxShadow: plan.featured
                  ? "0 20px 60px rgba(13,27,62,0.35), 0 4px 16px rgba(0,0,0,0.15)"
                  : "0 2px 16px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                transform: plan.featured ? "translateY(-8px)" : "none",
              }}
            >
              {/* Orange top accent for featured */}
              {plan.featured && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: "oklch(0.72 0.18 45)",
                    borderRadius: "6px 6px 0 0",
                  }}
                />
              )}

              {/* Badge */}
              {plan.badge && (
                <div style={{ marginBottom: "1rem" }}>
                  <span
                    style={{
                      fontFamily: "'Barlow', sans-serif",
                      fontWeight: 600,
                      fontSize: "0.65rem",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "oklch(0.72 0.18 45)",
                      background: "rgba(255,160,50,0.12)",
                      padding: "3px 10px",
                      borderRadius: "2px",
                      border: "1px solid rgba(255,160,50,0.25)",
                    }}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan name */}
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: plan.featured ? "rgba(180,200,240,0.7)" : "#9ca3af",
                  marginBottom: "0.5rem",
                }}
              >
                {plan.name}
              </div>

              {/* Price */}
              <div style={{ marginBottom: "0.25rem" }}>
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: "3rem",
                    letterSpacing: "-0.03em",
                    color: plan.featured ? "#ffffff" : "#0d1b3e",
                    lineHeight: 1,
                  }}
                >
                  {plan.price}
                </span>
              </div>
              <div
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                  fontSize: "0.78rem",
                  color: plan.featured ? "rgba(180,200,240,0.55)" : "#9ca3af",
                  letterSpacing: "0.06em",
                  marginBottom: "0.75rem",
                }}
              >
                {plan.period}
              </div>

              {/* Tagline */}
              <p
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                  fontSize: "0.85rem",
                  color: plan.featured ? "rgba(200,215,245,0.75)" : "#6b7280",
                  lineHeight: 1.5,
                  marginBottom: "1.75rem",
                  paddingBottom: "1.75rem",
                  borderBottom: plan.featured ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e4e8f0",
                }}
              >
                {plan.tagline}
              </p>

              {/* Features list */}
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 2rem 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.7rem",
                  flex: 1,
                }}
              >
                {plan.features.map((feat) => (
                  <li
                    key={feat}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.6rem",
                      fontFamily: "'Barlow', sans-serif",
                      fontWeight: 300,
                      fontSize: "0.85rem",
                      color: plan.featured ? "rgba(200,215,245,0.8)" : "#4b5563",
                      lineHeight: 1.4,
                    }}
                  >
                    {/* Check mark */}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      style={{ flexShrink: 0, marginTop: "1px" }}
                    >
                      <circle
                        cx="7"
                        cy="7"
                        r="6.5"
                        fill={plan.featured ? "rgba(255,160,50,0.15)" : "oklch(0.96 0.005 255)"}
                        stroke={plan.featured ? "rgba(255,160,50,0.3)" : "#e4e8f0"}
                      />
                      <path
                        d="M4.5 7l1.8 1.8 3.2-3.2"
                        stroke={plan.featured ? "oklch(0.72 0.18 45)" : "#1a2a6c"}
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <a
                href={plan.ctaHref}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "0.8rem 1.5rem",
                  background: plan.featured ? "white" : "transparent",
                  color: plan.featured ? "#0d1b3e" : "#0d1b3e",
                  border: plan.featured ? "none" : "1px solid #c4cde0",
                  borderRadius: "3px",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  if (plan.featured) {
                    el.style.background = "rgba(255,255,255,0.9)";
                  } else {
                    el.style.background = "#0d1b3e";
                    el.style.color = "white";
                    el.style.borderColor = "#0d1b3e";
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  if (plan.featured) {
                    el.style.background = "white";
                  } else {
                    el.style.background = "transparent";
                    el.style.color = "#0d1b3e";
                    el.style.borderColor = "#c4cde0";
                  }
                }}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontWeight: 300,
            fontSize: "0.75rem",
            color: "#9ca3af",
            textAlign: "center",
            marginTop: "2rem",
            letterSpacing: "0.04em",
          }}
        >
          All prices per card. Volume discounts available for dealers and graders. No subscription required.
        </p>
      </div>
    </section>
  );
}
