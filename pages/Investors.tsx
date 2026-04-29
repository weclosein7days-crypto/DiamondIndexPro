/**
 * Diamond Index™ — Investors Page
 * Design: Dark financial platform aesthetic, matching site-wide style.
 * Sections: Hero → Market Opportunity → Business Model → Traction → Storyboard → CTA
 * Inquiry modal wired to investors.submitLead tRPC mutation.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const GOLD = "#c9a84c";
const BLUE = "rgba(99,155,255,0.9)";

const METRICS = [
  { value: "$5.4B", label: "Sports Card Market (2024)", sub: "Projected $14B by 2032" },
  { value: "45M+", label: "Active Collectors in the US", sub: "Growing 18% YoY" },
  { value: "96%", label: "Value Retained at Elite Grade", sub: "vs. 60–70% ungraded" },
  { value: "3 min", label: "Average Grade Time", sub: "vs. 45–90 days traditional" },
];

const REVENUE_STREAMS = [
  { icon: "◈", title: "Per-Grade Fee", desc: "Flat fee per card graded through the app. Volume scales with user growth.", color: BLUE },
  { icon: "◈", title: "Certified Grader Network", desc: "Graders pay to join and earn per card. Platform takes a commission on every grade issued.", color: BLUE },
  { icon: "◈", title: "Vault & Registry", desc: "Monthly subscription for card storage, registry access, and portfolio tracking.", color: GOLD },
  { icon: "◈", title: "Marketplace Listings", desc: "Certified graders link their own marketplace to Diamond Index™. Cards export directly to one or all connected platforms. Diamond Index earns a transaction fee per sale.", color: GOLD },
  { icon: "◈", title: "Partner Network Fees", desc: "Graders list their marketplace in our recommended partner network. Collectors browse and buy across all connected platforms. Diamond Index earns a referral fee per transaction.", color: "rgba(148,200,255,0.85)" },
  { icon: "◈", title: "Certified Grader Memberships", desc: "Annual membership tiers for graders — Standard through Master. Graders list their platform in our recommended network. Recurring membership revenue.", color: "rgba(148,200,255,0.85)" },
];

const STORYBOARD_FRAMES = [
  { step: "01", title: "Entry", desc: "User taps Grade a Card. Chooses camera, upload, or file. No account required to start." },
  { step: "02", title: "Scan", desc: "AI-powered scan animation analyzes the card in real time. Front and back captured with guided viewfinder." },
  { step: "03", title: "Centering", desc: "Pixel-precise centering score calculated instantly. Front and back measured independently." },
  { step: "04", title: "Full Analysis", desc: "All 5 grading criteria scored: Centering (40%), Surface (20%), Edges (15%), Corners (15%), Eye Appeal (10%)." },
  { step: "05", title: "Generating", desc: "Report generation screen. Branded animation builds anticipation before the final reveal." },
  { step: "06", title: "Final Grade", desc: "Diamond rating revealed. Score, tier label, value retention stat, and direct path to vault or marketplace." },
];

const DIFFERENTIATORS = [
  { title: "Speed", traditional: "45–90 days", di: "Under 3 minutes" },
  { title: "Cost", traditional: "$15–$150 per card", di: "Flat app fee" },
  { title: "Transparency", traditional: "Black box scoring", di: "Formula-driven, published" },
  { title: "Access", traditional: "Mail-in only", di: "Any device, anywhere" },
  { title: "Marketplace", traditional: "Separate platform", di: "Integrated at grade time" },
];

// ─── Contact Modal ────────────────────────────────────────────────────────────

function ContactModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitLead = trpc.investors.submitLead.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (err) => {
      toast.error("Submission failed. Please try again or email us directly.");
      console.error("[Investors] submitLead error:", err);
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) { toast.error("Please enter your name."); return; }
    if (!email.trim() || !email.includes("@")) { toast.error("Please enter a valid email address."); return; }

    submitLead.mutate({
      name: name.trim(),
      email: email.trim(),
      company: company.trim() || undefined,
      message: message.trim() || undefined,
      interest: "full_deck",
    });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.7rem 0.9rem",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "4px", color: "#ffffff",
    fontFamily: "'Barlow', sans-serif", fontSize: "0.88rem",
    outline: "none", boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600,
    fontSize: "0.65rem", letterSpacing: "0.14em",
    color: "rgba(148,163,184,0.6)", textTransform: "uppercase",
    display: "block", marginBottom: "0.35rem",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: "1rem",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#0c1424", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "8px", padding: "2.5rem", maxWidth: "480px", width: "100%",
        }}
      >
        {submitted ? (
          /* Success state */
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>◆</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>
              Request Received
            </div>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.85rem", color: "rgba(148,163,184,0.65)", lineHeight: 1.7, marginBottom: "2rem" }}>
              We'll follow up within 24 hours with the full deck and a calendar link.
            </div>
            <button
              onClick={onClose}
              style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase",
                padding: "0.85rem 2.5rem", background: GOLD, color: "#070d1a",
                border: "none", borderRadius: "4px", cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
              Investor Inquiry
            </div>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.82rem", color: "rgba(148,163,184,0.6)", marginBottom: "1.75rem", lineHeight: 1.6 }}>
              We'll follow up within 24 hours with the full deck and a calendar link.
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Full Name *</label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Fund / Organization</label>
              <input
                type="text"
                placeholder="Optional"
                value={company}
                onChange={e => setCompany(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Message</label>
              <textarea
                placeholder="Tell us about your investment focus (optional)"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: "vertical" as const, minHeight: "80px" }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button
                onClick={handleSubmit}
                disabled={submitLead.isPending}
                style={{
                  flex: 1, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase",
                  padding: "0.85rem", background: submitLead.isPending ? "rgba(201,168,76,0.5)" : GOLD,
                  color: "#070d1a", border: "none", borderRadius: "4px",
                  cursor: submitLead.isPending ? "not-allowed" : "pointer",
                }}
              >
                {submitLead.isPending ? "Sending…" : "Submit Request"}
              </button>
              <button
                onClick={onClose}
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600,
                  fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase",
                  padding: "0.85rem 1.25rem", background: "transparent",
                  color: "rgba(148,163,184,0.5)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "4px", cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Investors() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div style={{ background: "#070d1a", minHeight: "100vh", color: "#ffffff" }}>
      <Header />

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(180deg, #050b17 0%, #080e1c 60%, #070d1a 100%)",
        padding: "9rem 2rem 5rem",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(99,155,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,155,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.22em",
            color: `${GOLD}99`, textTransform: "uppercase", marginBottom: "1.25rem",
          }}>
            Diamond Index™ — Investor Overview
          </div>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900, fontSize: "clamp(2.8rem, 6vw, 5rem)",
            letterSpacing: "-0.02em", color: "#ffffff",
            textTransform: "uppercase", lineHeight: 0.95,
            margin: "0 0 1.5rem",
          }}>
            The Standard<br />
            <span style={{ color: GOLD }}>for Card Value.</span>
          </h1>
          <p style={{
            fontFamily: "'Barlow', sans-serif", fontWeight: 300,
            fontSize: "1.15rem", color: "rgba(148,163,184,0.8)",
            maxWidth: "580px", lineHeight: 1.75, margin: "0 0 2.5rem",
          }}>
            Diamond Index™ is building the certification authority for the $5.4B sports card market —
            instant AI-powered grading, a certified grader network, and an integrated marketplace.
            This is the infrastructure layer the industry has been missing.
          </p>
          {/* Orange accent line */}
          <div style={{ width: "100%", height: "1px", background: `linear-gradient(90deg, #d97706 0%, transparent 60%)`, marginBottom: "2.5rem" }} />
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button
              onClick={() => setContactOpen(true)}
              style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: "0.78rem", letterSpacing: "0.14em", textTransform: "uppercase",
                padding: "0.85rem 2rem", background: GOLD, color: "#070d1a",
                border: "none", borderRadius: "4px", cursor: "pointer",
              }}
            >
              Request Deck
            </button>
            <button
              onClick={() => setContactOpen(true)}
              style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: "0.78rem", letterSpacing: "0.14em", textTransform: "uppercase",
                padding: "0.85rem 2rem", background: "transparent", color: "rgba(148,163,184,0.8)",
                border: "1px solid rgba(255,255,255,0.12)", borderRadius: "4px", cursor: "pointer",
              }}
            >
              Schedule a Call
            </button>
          </div>
        </div>
      </section>

      {/* ── MARKET METRICS ── */}
      <section style={{ padding: "4rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            {METRICS.map(m => (
              <div key={m.label} style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "6px", padding: "1.75rem 1.5rem",
              }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900, fontSize: "2.4rem", color: GOLD,
                  letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "0.4rem",
                }}>{m.value}</div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.1em",
                  color: "rgba(148,163,184,0.85)", textTransform: "uppercase",
                  marginBottom: "0.3rem",
                }}>{m.label}</div>
                <div style={{
                  fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem",
                  color: "rgba(100,116,139,0.55)", lineHeight: 1.4,
                }}>{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPETITIVE COMPARISON ── */}
      <section style={{ padding: "4rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.22em", color: `${GOLD}80`, textTransform: "uppercase", marginBottom: "0.75rem" }}>Why Now</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "#ffffff", textTransform: "uppercase", margin: 0 }}>
              Traditional Grading is Broken
            </h2>
          </div>
          <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: "6px", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "rgba(255,255,255,0.04)", padding: "0.75rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.12em", color: "rgba(100,116,139,0.6)", textTransform: "uppercase" }}>Category</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.12em", color: "rgba(100,116,139,0.6)", textTransform: "uppercase" }}>Traditional (PSA/BGS)</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.12em", color: GOLD, textTransform: "uppercase" }}>Diamond Index™</div>
            </div>
            {DIFFERENTIATORS.map((d, idx) => (
              <div key={d.title} style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                padding: "1rem 1.5rem",
                background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                borderBottom: idx < DIFFERENTIATORS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                alignItems: "center",
              }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.08em", color: "rgba(148,163,184,0.7)", textTransform: "uppercase" }}>{d.title}</div>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.85rem", color: "rgba(100,116,139,0.55)" }}>{d.traditional}</div>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.85rem", color: "#ffffff", fontWeight: 500 }}>{d.di}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVENUE STREAMS ── */}
      <section style={{ padding: "4rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.22em", color: `${GOLD}80`, textTransform: "uppercase", marginBottom: "0.75rem" }}>Business Model</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "#ffffff", textTransform: "uppercase", margin: 0 }}>
              Six Revenue Streams
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
            {REVENUE_STREAMS.map(r => (
              <div key={r.title} style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${r.color.replace(/[\d.]+\)$/, "0.15)")}`,
                borderRadius: "6px", padding: "1.5rem",
                display: "flex", gap: "1rem", alignItems: "flex-start",
              }}>
                <div style={{ fontSize: "1.1rem", color: r.color, flexShrink: 0, marginTop: "2px" }}>{r.icon}</div>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.1em", color: "#ffffff", textTransform: "uppercase", marginBottom: "0.4rem" }}>{r.title}</div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.82rem", color: "rgba(148,163,184,0.65)", lineHeight: 1.6 }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STORYBOARD ── */}
      <section style={{ padding: "4rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.22em", color: `${GOLD}80`, textTransform: "uppercase", marginBottom: "0.75rem" }}>Product Flow</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "#ffffff", textTransform: "uppercase", margin: 0 }}>
              From Phone to Grade in 6 Steps
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {STORYBOARD_FRAMES.map((f, idx) => (
              <div key={f.step} style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "6px", padding: "1.5rem",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute", top: "1.25rem", right: "1.25rem",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900, fontSize: "2.5rem",
                  color: "rgba(255,255,255,0.04)", lineHeight: 1,
                  userSelect: "none",
                }}>{f.step}</div>
                {idx < STORYBOARD_FRAMES.length - 1 && (
                  <div style={{
                    position: "absolute", bottom: "-0.5rem", left: "50%",
                    transform: "translateX(-50%)",
                    width: "1px", height: "1rem",
                    background: "rgba(201,168,76,0.2)",
                    display: "none",
                  }} />
                )}
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 600, fontSize: "0.6rem", letterSpacing: "0.2em",
                  color: GOLD, textTransform: "uppercase", marginBottom: "0.5rem",
                }}>Step {f.step}</div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800, fontSize: "1.1rem", color: "#ffffff",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  marginBottom: "0.6rem",
                }}>{f.title}</div>
                <div style={{
                  fontFamily: "'Barlow', sans-serif", fontSize: "0.82rem",
                  color: "rgba(148,163,184,0.65)", lineHeight: 1.65,
                }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRACTION / STATUS ── */}
      <section style={{ padding: "4rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.22em", color: `${GOLD}80`, textTransform: "uppercase", marginBottom: "0.75rem" }}>Where We Are</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "#ffffff", textTransform: "uppercase", margin: 0 }}>
              Current Status
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
            {[
              { status: "COMPLETE", label: "Platform Architecture", desc: "Full grading flow, certified grader network, vault system, and marketplace infrastructure built." },
              { status: "COMPLETE", label: "Grading Algorithm", desc: "5-criteria formula-driven scoring engine. Transparent, published, reproducible." },
              { status: "COMPLETE", label: "Grader Program", desc: "Tiered certified grader system with earnings structure, onboarding, and commission model." },
              { status: "IN PROGRESS", label: "Beta Launch", desc: "Onboarding first cohort of certified graders. Collecting initial grading volume and feedback." },
              { status: "NEXT", label: "Marketplace Go-Live", desc: "Direct listing from grade result. Certified graders export cards to any connected partner marketplace at grade time." },
              { status: "NEXT", label: "Mobile App", desc: "Native iOS and Android apps with camera-first grading experience and push notifications." },
            ].map(s => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${s.status === "COMPLETE" ? "rgba(99,155,255,0.15)" : s.status === "IN PROGRESS" ? `${GOLD}25` : "rgba(255,255,255,0.06)"}`,
                borderRadius: "6px", padding: "1.25rem 1.5rem",
              }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase",
                  color: s.status === "COMPLETE" ? BLUE : s.status === "IN PROGRESS" ? GOLD : "rgba(100,116,139,0.5)",
                  marginBottom: "0.4rem",
                }}>{s.status}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>{s.label}</div>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.78rem", color: "rgba(148,163,184,0.55)", lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "5rem 2rem" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.22em", color: `${GOLD}80`, textTransform: "uppercase", marginBottom: "1rem" }}>
            Get Involved
          </div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(2rem, 4vw, 3.2rem)", color: "#ffffff", textTransform: "uppercase", letterSpacing: "-0.01em", margin: "0 0 1rem" }}>
            We're Building the<br />
            <span style={{ color: GOLD }}>Infrastructure Layer.</span>
          </h2>
          <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: "1rem", color: "rgba(148,163,184,0.65)", lineHeight: 1.75, margin: "0 0 2.5rem" }}>
            Full deck, financials, and product demo available on request.
            We're selective about who we bring into this round.
          </p>
          <div style={{ width: "200px", height: "1px", margin: "0 auto 2.5rem", background: `linear-gradient(90deg, transparent 0%, ${GOLD}60 50%, transparent 100%)` }} />
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => setContactOpen(true)}
              style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: "0.82rem", letterSpacing: "0.14em", textTransform: "uppercase",
                padding: "1rem 2.5rem", background: GOLD, color: "#070d1a",
                border: "none", borderRadius: "4px", cursor: "pointer",
              }}
            >
              Request Full Deck
            </button>
            <button
              onClick={() => setContactOpen(true)}
              style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: "0.82rem", letterSpacing: "0.14em", textTransform: "uppercase",
                padding: "1rem 2.5rem", background: "transparent", color: "rgba(148,163,184,0.8)",
                border: "1px solid rgba(255,255,255,0.12)", borderRadius: "4px", cursor: "pointer",
              }}
            >
              Schedule a Call
            </button>
          </div>
        </div>
      </section>

      {/* ── CONTACT MODAL ── */}
      {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
      <Footer />
    </div>
  );
}
