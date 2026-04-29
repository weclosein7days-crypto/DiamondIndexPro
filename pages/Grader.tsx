/*
 * Diamond Index™ — /grader (Certified Grader Landing)
 * Design: dark navy, blue/gold accents, desktop-focused
 * Typography: Barlow Condensed (headings) + Barlow (body)
 *
 * Sections:
 *   1. Hero — "For Certified Graders"
 *   2. Feature cards (6) — batch, controls, printing, inventory, booth, revenue
 *   3. Access gate — Apply + Login CTAs
 *   4. Access rules callout — what public users never see
 */

import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const BG = "#060d1a";
const BLUE = "#3b82f6";
const GOLD = "rgba(201,168,76,0.9)";
const GOLD_BRIGHT = "rgba(255,215,80,1)";

const features = [
  {
    icon: "⚡",
    title: "Batch Uploads",
    desc: "Grade 50+ cards in a single session. Upload a stack, assign grades in sequence, export all labels at once.",
    color: BLUE,
  },
  {
    icon: "🎛",
    title: "Advanced Controls",
    desc: "Override individual sub-scores, add grader notes, flag cards for secondary review, and apply booth-specific pricing.",
    color: "#93c5fd",
  },
  {
    icon: "🖨",
    title: "Label Printing",
    desc: "Auto-generate Diamond Index™ slab labels with your name, grader ID, and QR-linked report. Print-ready PDF output.",
    color: GOLD_BRIGHT,
  },
  {
    icon: "📦",
    title: "Inventory Management",
    desc: "Track every card you've graded. Filter by grade, date, client, or value. Export to CSV for your records.",
    color: "#a78bfa",
  },
  {
    icon: "🏪",
    title: "Booth Integration",
    desc: "Booth-mode UI optimized for fast grading at shows. Tap to grade, tap to print. No keyboard required.",
    color: "#34d399",
  },
  {
    icon: "💰",
    title: "Revenue Sharing",
    desc: "Every card graded through your link earns your tier commission. Every grader you recruit earns you passive income.",
    color: GOLD,
  },
];

const accessRules = [
  "Batch upload tools",
  "Label printing & PDF export",
  "Advanced score overrides",
  "Grader notes & flags",
  "Inventory dashboard",
  "Booth-mode interface",
  "Revenue & commission reports",
];

export default function Grader() {
  const [applying, setApplying] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Barlow', sans-serif", display: "flex", flexDirection: "column" }}>
      <Header />

      <main style={{ flex: 1 }}>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section style={{
          padding: "6rem 2rem 4rem",
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "center",
        }}>
          {/* Left */}
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.22em", color: GOLD, textTransform: "uppercase", marginBottom: "1rem" }}>
              Certified Grader Portal
            </div>
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              color: "#ffffff",
              textTransform: "uppercase",
              lineHeight: 1.0,
              marginBottom: "1.25rem",
            }}>
              For Certified<br />
              <span style={{ color: GOLD_BRIGHT }}>Graders</span>
            </h1>
            <p style={{ fontSize: "1rem", color: "rgba(148,163,184,0.7)", lineHeight: 1.7, maxWidth: "420px", marginBottom: "2rem" }}>
              Batch grading, label printing, and booth tools — built for collectors who grade professionally. Access requires certification or an active application.
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button
                onClick={() => { setApplying(true); toast.info("Application form coming soon — we'll notify you when it opens."); }}
                style={{
                  padding: "0.9rem 2rem",
                  background: BLUE,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "5px",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Apply to Become a Certified Grader
              </button>
              <button
                onClick={() => toast.info("Grader login portal coming soon.")}
                style={{
                  padding: "0.9rem 2rem",
                  background: "transparent",
                  color: "rgba(203,213,225,0.7)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "5px",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Login to Grader Portal
              </button>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <Link href="/grade" style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.75rem", color: "rgba(100,116,139,0.45)", textDecoration: "none" }}>
                Not a grader? Grade your own card →
              </Link>
            </div>
          </div>

          {/* Right — access rules */}
          <div style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "10px",
            padding: "2rem",
          }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.18em", color: "rgba(239,68,68,0.7)", textTransform: "uppercase", marginBottom: "1rem" }}>
              🔐 Restricted Access — Graders Only
            </div>
            <p style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.5)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
              Public users never see these tools. Grader access requires login or an approved application.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {accessRules.map((rule, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "rgba(239,68,68,0.5)", flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.82rem", color: "rgba(203,213,225,0.6)" }}>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Orange divider ────────────────────────────────────────────────── */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.4), transparent)", margin: "0 auto", maxWidth: "800px" }} />

        {/* ── Feature cards ────────────────────────────────────────────────── */}
        <section style={{ padding: "5rem 2rem", maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.22em", color: GOLD, textTransform: "uppercase", marginBottom: "0.75rem" }}>
              Grader Toolkit
            </div>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "#ffffff",
              textTransform: "uppercase",
              lineHeight: 1.05,
            }}>
              Everything You Need<br />
              <span style={{ color: GOLD_BRIGHT }}>To Run Your Operation</span>
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.25rem",
          }}>
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "8px",
                  padding: "1.75rem",
                  position: "relative",
                  overflow: "hidden",
                  transition: "border-color 0.2s ease, background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${f.color}30`;
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.025)";
                }}
              >
                {/* Accent bar */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, ${f.color}60, transparent)` }} />

                <div style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>{f.icon}</div>
                <h3 style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  color: "#ffffff",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.6rem",
                }}>
                  {f.title}
                </h3>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.82rem", color: "rgba(148,163,184,0.55)", lineHeight: 1.65 }}>
                  {f.desc}
                </p>

                {/* Lock badge */}
                <div style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "0.55rem",
                  letterSpacing: "0.12em",
                  color: "rgba(239,68,68,0.4)",
                  textTransform: "uppercase",
                }}>
                  🔐 Grader Only
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA section ──────────────────────────────────────────────────── */}
        <section style={{
          padding: "5rem 2rem",
          background: "rgba(255,255,255,0.015)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.22em", color: GOLD, textTransform: "uppercase", marginBottom: "1rem" }}>
              Join the Network
            </div>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "#ffffff",
              textTransform: "uppercase",
              lineHeight: 1.05,
              marginBottom: "1rem",
            }}>
              Ready to Grade<br />
              <span style={{ color: GOLD_BRIGHT }}>Professionally?</span>
            </h2>
            <p style={{ fontSize: "0.9rem", color: "rgba(148,163,184,0.55)", lineHeight: 1.7, marginBottom: "2.5rem" }}>
              Free to join. Keep the majority of every transaction. Grade at your booth, from home, or for clients. Earn at every level.
            </p>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => toast.info("Application form coming soon — we'll notify you when it opens.")}
                style={{
                  padding: "1rem 2.5rem",
                  background: BLUE,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "5px",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Apply Now — It's Free
              </button>
              <Link href="/grader-program" style={{
                padding: "1rem 2.5rem",
                background: "transparent",
                color: GOLD,
                border: `1px solid ${GOLD}40`,
                borderRadius: "5px",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.9rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                textDecoration: "none",
                display: "inline-block",
              }}>
                See Earnings & Tiers ◆
              </Link>
            </div>

            <p style={{ marginTop: "1.5rem", fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", color: "rgba(100,116,139,0.4)" }}>
              Already certified?{" "}
              <button
                onClick={() => toast.info("Grader login portal coming soon.")}
                style={{ background: "none", border: "none", color: "rgba(147,197,253,0.4)", cursor: "pointer", fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", padding: 0 }}
              >
                Login to your portal →
              </button>
            </p>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
