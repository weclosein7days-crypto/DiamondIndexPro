/*
 * Diamond Index™ — PhoneSection
 * "Grade Any Card From Your Phone"
 * Uses the provided mockup image as the right-side visual — no processing, straight in.
 */
import { Link } from "wouter";
export default function PhoneSection() {
  return (
    <section
      id="phone"
      style={{ background: "#060d1e" }}
      className="relative overflow-hidden"
    >
      {/* Top line removed — premium gold fading divider handled in Home.tsx */}

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-0">
        {/* Left — copy */}
        <div className="flex-1 lg:pr-16 text-center lg:text-left" style={{ zIndex: 2, position: "relative" }}>
          <p
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 500,
              fontSize: "0.7rem",
              letterSpacing: "0.25em",
              color: "#d97706",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}
          >
            Instant Grading
          </p>

          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2.6rem, 4.5vw, 4.2rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              marginBottom: "1.5rem",
            }}
          >
            GRADE ANY CARD
            <br />
            <span style={{ color: "#93c5fd" }}>FROM YOUR PHONE</span>
          </h2>

          <p
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 300,
              fontSize: "1rem",
              color: "#64748b",
              lineHeight: 1.7,
              marginBottom: "2rem",
              maxWidth: "420px",
            }}
          >
            Point your camera at any trading card. Diamond Index™ analyzes
            centering, edges, corners, surface, and eye appeal in seconds —
            delivering a certified grade you can trust.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link
              href="/grade"
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 700,
                fontSize: "0.72rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "0.85rem 2rem",
                background: "#2563eb",
                color: "#ffffff",
                borderRadius: "2px",
                textDecoration: "none",
                display: "inline-block",
                transition: "background 0.2s, transform 0.15s",
                boxShadow: "0 4px 20px rgba(37,99,235,0.4)",
              }}
            >
              Grade Your Card
            </Link>
            <a
              href="#how-it-works"
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 400,
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "0.85rem 1.6rem",
                background: "transparent",
                color: "rgba(100,130,180,0.6)",
                border: "1px solid rgba(100,130,180,0.2)",
                borderRadius: "2px",
                textDecoration: "none",
                display: "inline-block",
                transition: "color 0.2s, border-color 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "rgba(148,197,253,0.9)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(100,130,180,0.45)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.color = "rgba(100,130,180,0.6)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(100,130,180,0.2)";
              }}
            >
              How It Works →
            </a>
          </div>

          {/* Grader sub-link */}
          <div style={{ marginTop: "1rem" }}>
            <Link
              href="/grader"
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.72rem",
                color: "rgba(100,116,139,0.4)",
                textDecoration: "none",
                letterSpacing: "0.04em",
              }}
            >
              Are you a Certified Grader? →
            </Link>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: "2.5rem",
              marginTop: "2.5rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {[
              { value: "< 60s", label: "Avg. Grade Time" },
              { value: "5", label: "Grading Criteria" },
              { value: "VRC-7", label: "Standard" },
            ].map(stat => (
              <div key={stat.label}>
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.7rem",
                    color: "#ffffff",
                    lineHeight: 1,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: "0.58rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(100,116,139,0.8)",
                    marginTop: "4px",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — full mockup image, no processing */}
        <div
          className="flex-1 flex items-center justify-center lg:justify-end"
          style={{ position: "relative" }}
        >
          {/* Blue glow behind phone */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 70% 60% at 60% 50%, rgba(59,130,246,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <img
            src="/manus-storage/phone-mockup-right_9ddcc384.png"
            alt="Grade any card from your phone — Diamond Index™"
            style={{
              width: "100%",
              maxWidth: "640px",
              display: "block",
              position: "relative",
              marginRight: "-4rem",
              filter: "drop-shadow(0 24px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 50px rgba(59,130,246,0.2))",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>

      {/* Orange accent bottom line */}
      <div style={{ height: "1px", background: "#d97706", width: "100%" }} />
    </section>
  );
}
