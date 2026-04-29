/*
 * Diamond Index™ — Footer Component
 * Dark navy background, clean institutional layout
 * Minimal, professional
 */

export default function Footer() {
  return (
    <footer
      id="help"
      style={{
        background: "#060c1f",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingTop: "4rem",
        paddingBottom: "2.5rem",
      }}
    >
      <div className="container">
        {/* Top row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "3rem",
            marginBottom: "3rem",
            paddingBottom: "3rem",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Brand column */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "1rem",
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polygon
                  points="14,2 26,10 22,26 6,26 2,10"
                  fill="none"
                  stroke="rgba(200,212,240,0.6)"
                  strokeWidth="1.5"
                />
                <polygon
                  points="14,2 26,10 14,26 2,10"
                  fill="rgba(200,212,240,0.06)"
                  stroke="rgba(200,212,240,0.3)"
                  strokeWidth="0.75"
                />
                <line x1="2" y1="10" x2="26" y2="10" stroke="rgba(200,212,240,0.3)" strokeWidth="0.75" />
              </svg>
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  letterSpacing: "0.06em",
                  color: "rgba(200, 212, 240, 0.9)",
                }}
              >
                DIAMOND INDEX™
              </span>
            </div>
            <p
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: "0.85rem",
                color: "rgba(180, 196, 230, 0.5)",
                lineHeight: 1.6,
                maxWidth: "280px",
              }}
            >
              The authoritative standard for trading card certification and valuation. Trusted by collectors, dealers, and institutions worldwide.
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h4
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600,
                fontSize: "0.72rem",
                letterSpacing: "0.18em",
                color: "rgba(180, 196, 230, 0.4)",
                textTransform: "uppercase",
                marginBottom: "1.25rem",
              }}
            >
              Platform
            </h4>
            {["Grade a Card", "How It Works", "Pricing", "Registry Search"].map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  display: "block",
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                  fontSize: "0.875rem",
                  color: "rgba(180, 196, 230, 0.6)",
                  textDecoration: "none",
                  marginBottom: "0.6rem",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(200, 212, 240, 0.9)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(180, 196, 230, 0.6)"; }}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Company links */}
          <div>
            <h4
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600,
                fontSize: "0.72rem",
                letterSpacing: "0.18em",
                color: "rgba(180, 196, 230, 0.4)",
                textTransform: "uppercase",
                marginBottom: "1.25rem",
              }}
            >
              Company
            </h4>
            {["About", "Standards", "Press", "Careers"].map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  display: "block",
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                  fontSize: "0.875rem",
                  color: "rgba(180, 196, 230, 0.6)",
                  textDecoration: "none",
                  marginBottom: "0.6rem",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(200, 212, 240, 0.9)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(180, 196, 230, 0.6)"; }}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Legal links */}
          <div>
            <h4
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600,
                fontSize: "0.72rem",
                letterSpacing: "0.18em",
                color: "rgba(180, 196, 230, 0.4)",
                textTransform: "uppercase",
                marginBottom: "1.25rem",
              }}
            >
              Legal
            </h4>
            {["Terms of Service", "Privacy Policy", "Certification Terms", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  display: "block",
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 300,
                  fontSize: "0.875rem",
                  color: "rgba(180, 196, 230, 0.6)",
                  textDecoration: "none",
                  marginBottom: "0.6rem",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(200, 212, 240, 0.9)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(180, 196, 230, 0.6)"; }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p
            style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 300,
              fontSize: "0.75rem",
              color: "rgba(180, 196, 230, 0.35)",
              letterSpacing: "0.04em",
            }}
          >
            © 2026 Diamond Index™. All rights reserved. Diamond Index™ is a registered certification mark.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "oklch(0.72 0.18 45)",
              }}
            />
            <span
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: "0.72rem",
                color: "rgba(180, 196, 230, 0.35)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Registry Online
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
