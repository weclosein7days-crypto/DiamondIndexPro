/**
 * Diamond Index™ — Certified Grader & Affiliate Program Section
 * LOCKED — do not modify without explicit instruction.
 *
 * Covers:
 * - Collector-operated manifesto
 * - 5 tier levels (A → Master) with app grading income
 * - 2-level referral commission model
 * - Booth grading pricing ($5.99 / $14.99)
 * - Grader signup bonus
 * - What you get on signup
 */

import { useState } from "react";

const BOOTH_PHOTO = "/manus-storage/booth-national-show_8ef51e95.png";

const TIERS = [
  { level: "A", recruits: 25,  appEarn: "$0.75", l2Earn: "$0.25", color: "rgba(148,163,184,0.8)",  glow: "rgba(148,163,184,0.08)",  border: "rgba(148,163,184,0.2)"  },
  { level: "B", recruits: 50,  appEarn: "$1.00", l2Earn: "$0.50", color: "rgba(148,200,255,0.9)",  glow: "rgba(148,200,255,0.08)",  border: "rgba(148,200,255,0.2)"  },
  { level: "C", recruits: 100, appEarn: "$1.25", l2Earn: "$0.75", color: "rgba(99,155,255,0.95)",  glow: "rgba(99,155,255,0.08)",   border: "rgba(99,155,255,0.25)"  },
  { level: "D", recruits: 250, appEarn: "$1.50", l2Earn: "$1.00", color: "rgba(201,168,76,0.9)",   glow: "rgba(201,168,76,0.08)",   border: "rgba(201,168,76,0.25)"  },
  { level: "E", recruits: 500, appEarn: "$1.50", l2Earn: "$1.00", color: "rgba(255,215,80,1)",     glow: "rgba(255,215,80,0.1)",    border: "rgba(255,215,80,0.3)",  master: true },
];

const BOOTH_SERVICES = [
  {
    name: "Quick Grade",
    price: "$5.99",
    graderKeeps: "$5.00",
    diKeeps: "$1.00",
    desc: "Grade at your booth. Digital certification issued on the spot.",
  },
  {
    name: "Slab & Label",
    price: "$14.99",
    graderKeeps: "$13.00",
    diKeeps: "$1.99",
    desc: "Full physical slab — sleeve, printed diamond label, certified grade.",
  },
];

const SIGNUP_PERKS = [
  { icon: "◈", title: "Personal Referral Link", desc: "Your unique link for booths, cards, social, and online. Every signup and grade through your link earns you commission." },
  { icon: "◉", title: "Printed Referral Cards", desc: "We send you a ready-to-print card design with your name and link. Hand them out at shows. Automatic on signup." },
  { icon: "◆", title: "Welcome Package Email", desc: "Full grading rules, pricing breakdown, what you can earn, how to operate at shows — everything in one email." },
  { icon: "▭", title: "Grader Portal Access", desc: "Submit cards, track your queue, see your earnings, manage your recruits — all in your dashboard." },
  { icon: "⊕", title: "Certification Authority", desc: "Every grade you issue carries the Diamond Index™ seal. You are the certified grader. The platform backs you." },
];

export default function GradersSection() {
  const [activeTab, setActiveTab] = useState<"app" | "booth">("app");
  const [activeTier, setActiveTier] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const tier = TIERS[activeTier];

  return (
    <section
      id="graders"
      style={{
        background: "linear-gradient(180deg, #070d1a 0%, #0a1220 100%)",
        paddingTop: "6rem",
        paddingBottom: "6rem",
        position: "relative",
        overflow: "hidden",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {/* Background glow */}
      <div style={{ position: "absolute", top: "20%", right: "-10%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,155,255,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", left: "-5%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div className="container" style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 2rem", position: "relative" }}>

        {/* ── MANIFESTO HEADER + BOOTH PHOTO ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center", marginBottom: "3rem" }}>
        <div style={{ maxWidth: "780px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem" }}>
            <span style={{ display: "inline-block", width: "28px", height: "1px", background: "oklch(0.72 0.18 45)" }} />
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: "0.7rem", letterSpacing: "0.22em", color: "rgba(201,168,76,0.6)", textTransform: "uppercase" }}>
              Collector Operated · Collector Profited
            </span>
          </div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 4.5vw, 3.2rem)", letterSpacing: "-0.01em", color: "#ffffff", textTransform: "uppercase", lineHeight: 1.05, marginBottom: "1.25rem" }}>
            Ran By Collectors.<br />
            <span style={{ color: "rgba(201,168,76,0.9)" }}>For Collectors.</span>
          </h2>
          <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: "1rem", color: "rgba(148,163,184,0.7)", lineHeight: 1.75, maxWidth: "640px" }}>
            The big companies grade cards to move markets — not to protect yours. Diamond Index™ is built differently.
            Every grade is calculated, not estimated. Every grader is a collector. Every dollar earned stays in the hobby.
          </p>
          <div style={{ marginTop: "1.5rem", padding: "1rem 1.5rem", background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.18)", borderRadius: "4px", display: "inline-block" }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.14em", color: "rgba(201,168,76,0.9)", textTransform: "uppercase" }}>
              Grade your own collection · Grade for others · Recruit graders · Earn at every level
            </span>
          </div>

          {/* CTA button — always visible */}
          <div style={{ marginTop: "2rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.6rem",
                padding: "0.9rem 2rem",
                background: expanded ? "rgba(255,255,255,0.08)" : "white",
                color: expanded ? "rgba(201,168,76,0.9)" : "#0d1b3e",
                border: expanded ? "1px solid rgba(201,168,76,0.3)" : "none",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700, fontSize: "0.85rem",
                letterSpacing: "0.1em", textTransform: "uppercase",
                borderRadius: "3px", cursor: "pointer",
                transition: "all 0.25s",
              }}
            >
              {expanded ? "Hide Program Details" : "Become a Certified Grader"}
              <span style={{ fontSize: "0.7rem", transition: "transform 0.25s", display: "inline-block", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
            </button>
            {!expanded && (
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", color: "rgba(100,116,139,0.45)", letterSpacing: "0.06em" }}>
                Free to join · Keep the majority of every transaction
              </span>
            )}
          </div>
        </div>

        {/* Booth photo */}
        <div style={{ borderRadius: "6px", overflow: "hidden", position: "relative" }}>
          <img
            src={BOOTH_PHOTO}
            alt="Collectors at a card show booth"
            style={{ width: "100%", height: "380px", objectFit: "cover", objectPosition: "center 30%", display: "block" }}
          />
          {/* Dark overlay for contrast */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(7,13,26,0.5) 0%, transparent 60%)" }} />
          {/* Caption */}
          <div style={{ position: "absolute", bottom: "1.25rem", left: "1.5rem" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.16em", color: "rgba(201,168,76,0.8)", textTransform: "uppercase" }}>Your Booth. Your Rules. Your Cut.</div>
          </div>
        </div>

        </div>{/* end header grid */}

        {/* ── COLLAPSIBLE PROGRAM DETAILS ── */}
        <div style={{
          overflow: "hidden",
          maxHeight: expanded ? "9999px" : "0",
          opacity: expanded ? 1 : 0,
          transition: "opacity 0.4s ease, max-height 0.6s ease",
        }}>

        {/* ── TAB SWITCHER ── */}
        <div style={{ display: "flex", gap: "0", marginBottom: "2.5rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {[{ id: "app", label: "App Grading — $2.99/card" }, { id: "booth", label: "Booth Grading" }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "app" | "booth")}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid rgba(201,168,76,0.8)" : "2px solid transparent",
                padding: "0.75rem 1.5rem",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.75rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: activeTab === tab.id ? "rgba(201,168,76,0.9)" : "rgba(100,116,139,0.6)",
                cursor: "pointer",
                transition: "all 0.2s",
                marginBottom: "-1px",
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* ── APP GRADING TAB ── */}
        {activeTab === "app" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" }}>

              {/* Left: Tier selector */}
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.18em", color: "rgba(99,155,255,0.6)", textTransform: "uppercase", marginBottom: "1.25rem" }}>
                  Your Tier — Select to See Earnings
                </div>

                {/* Tier cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "2rem" }}>
                  {TIERS.map((t, i) => (
                    <button
                      key={t.level}
                      onClick={() => setActiveTier(i)}
                      style={{
                        background: activeTier === i ? t.glow : "rgba(255,255,255,0.02)",
                        border: `1px solid ${activeTier === i ? t.border : "rgba(255,255,255,0.06)"}`,
                        borderRadius: "4px",
                        padding: "0.85rem 1.25rem",
                        display: "grid",
                        gridTemplateColumns: "2.5rem 1fr auto auto",
                        alignItems: "center",
                        gap: "1rem",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: t.color, letterSpacing: "0.06em" }}>
                        {t.master ? "★" : t.level}
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.1em", color: activeTier === i ? "#ffffff" : "rgba(148,163,184,0.7)", textTransform: "uppercase" }}>
                          {t.master ? "Master Grader" : `Level ${t.level}`}
                        </div>
                        <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.65rem", color: "rgba(100,116,139,0.5)", marginTop: "1px" }}>
                          {t.recruits} recruits required
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", color: t.color }}>{t.appEarn}</div>
                        <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.58rem", color: "rgba(100,116,139,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}>per card</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "rgba(99,155,255,0.7)" }}>{t.l2Earn}</div>
                        <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.58rem", color: "rgba(100,116,139,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}>level 2</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Grader signup bonus */}
                <div style={{ padding: "1rem 1.25rem", background: "rgba(99,155,255,0.05)", border: "1px solid rgba(99,155,255,0.15)", borderRadius: "4px" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.14em", color: "rgba(99,155,255,0.6)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                    Grader Signup Bonus
                  </div>
                  <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.78rem", color: "rgba(148,163,184,0.7)", lineHeight: 1.6 }}>
                    When someone signs up as a Certified Grader through your link — you earn <span style={{ color: "#ffffff", fontWeight: 600 }}>$1.00</span>. Same for their recruits (Level 2). Diamond Index always keeps its margin. You always keep yours.
                  </div>
                </div>
              </div>

              {/* Right: Earnings breakdown for selected tier */}
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.18em", color: "rgba(99,155,255,0.6)", textTransform: "uppercase", marginBottom: "1.25rem" }}>
                  {tier.master ? "Master Grader" : `Level ${tier.level}`} — Earnings Breakdown
                </div>

                {/* Big number display */}
                <div style={{ background: tier.glow, border: `1px solid ${tier.border}`, borderRadius: "6px", padding: "2rem", marginBottom: "1.25rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                    <div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2.5rem", color: tier.color, letterSpacing: "-0.02em", lineHeight: 1 }}>{tier.appEarn}</div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.62rem", color: "rgba(100,116,139,0.55)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "4px" }}>Your cut / card</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2.5rem", color: "rgba(99,155,255,0.85)", letterSpacing: "-0.02em", lineHeight: 1 }}>{tier.l2Earn}</div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.62rem", color: "rgba(100,116,139,0.55)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "4px" }}>Level 2 / card</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2.5rem", color: "rgba(148,163,184,0.6)", letterSpacing: "-0.02em", lineHeight: 1 }}>$2.99</div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.62rem", color: "rgba(100,116,139,0.55)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "4px" }}>User pays</div>
                    </div>
                  </div>

                  {/* Volume projections */}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.25rem" }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.16em", color: "rgba(100,116,139,0.5)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                      Monthly Volume Projections (Your Cards Only)
                    </div>
                    {[
                      { cards: 100,   label: "100 cards/mo" },
                      { cards: 500,   label: "500 cards/mo" },
                      { cards: 1000,  label: "1,000 cards/mo" },
                      { cards: 10000, label: "10,000 cards/mo" },
                    ].map(row => {
                      const earn = parseFloat(tier.appEarn.replace("$", ""));
                      const total = (earn * row.cards).toFixed(0);
                      return (
                        <div key={row.cards} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.4rem 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.75rem", color: "rgba(148,163,184,0.6)" }}>{row.label}</span>
                          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: tier.color }}>${parseInt(total).toLocaleString()}</span>
                        </div>
                      );
                    })}
                    <div style={{ marginTop: "0.75rem", padding: "0.6rem 0.85rem", background: "rgba(201,168,76,0.06)", borderRadius: "3px", border: "1px solid rgba(201,168,76,0.15)" }}>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", color: "rgba(148,163,184,0.65)" }}>
                        Sign up a shop grading <strong style={{ color: "#ffffff" }}>10,000 cards/mo</strong> — you earn{" "}
                        <strong style={{ color: "rgba(201,168,76,0.9)" }}>${(parseFloat(tier.l2Earn.replace("$","")) * 10000).toLocaleString()}/mo</strong> from their volume alone.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tier progression note */}
                <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", color: "rgba(100,116,139,0.5)", lineHeight: 1.6 }}>
                  Recruit <strong style={{ color: "rgba(148,163,184,0.7)" }}>{tier.recruits} active graders</strong> to reach {tier.master ? "Master" : `Level ${tier.level}`}.
                  {activeTier < TIERS.length - 1 && (
                    <> Next level at <strong style={{ color: TIERS[activeTier + 1].color }}>{TIERS[activeTier + 1].recruits} recruits</strong> — earn <strong style={{ color: TIERS[activeTier + 1].color }}>{TIERS[activeTier + 1].appEarn}/card</strong>.</>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── BOOTH GRADING TAB ── */}
        {activeTab === "booth" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2.5rem" }}>
              {BOOTH_SERVICES.map(svc => (
                <div key={svc.name} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", padding: "2rem", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "2px", background: "oklch(0.72 0.18 45)" }} />
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(201,168,76,0.6)", marginBottom: "1rem" }}>{svc.name}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2rem", color: "#ffffff", lineHeight: 1 }}>{svc.price}</div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.6rem", color: "rgba(100,116,139,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "4px" }}>Client pays</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2rem", color: "oklch(0.72 0.18 45)", lineHeight: 1 }}>{svc.graderKeeps}</div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.6rem", color: "rgba(100,116,139,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "4px" }}>You keep</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "2rem", color: "rgba(99,155,255,0.7)", lineHeight: 1 }}>{svc.diKeeps}</div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.6rem", color: "rgba(100,116,139,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "4px" }}>Platform fee</div>
                    </div>
                  </div>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.8rem", color: "rgba(148,163,184,0.6)", lineHeight: 1.55 }}>{svc.desc}</p>
                </div>
              ))}
            </div>

            {/* Booth referral note */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <div style={{ padding: "1.25rem 1.5rem", background: "rgba(99,155,255,0.05)", border: "1px solid rgba(99,155,255,0.15)", borderRadius: "4px" }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.14em", color: "rgba(99,155,255,0.6)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Sign Up a New Grader at Your Booth</div>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.78rem", color: "rgba(148,163,184,0.7)", lineHeight: 1.6 }}>
                  Hand them your referral card. They sign up with your code. You earn <span style={{ color: "#ffffff", fontWeight: 600 }}>$1.00</span> — taken from the grader's platform fee, not yours. Diamond Index always keeps its margin.
                </div>
              </div>
              <div style={{ padding: "1.25rem 1.5rem", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "4px" }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.14em", color: "rgba(201,168,76,0.6)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Your Referral Cards — Auto-Sent on Signup</div>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.78rem", color: "rgba(148,163,184,0.7)", lineHeight: 1.6 }}>
                  When you become a Certified Grader, we send you a print-ready card design with your name and referral link. Hand them out at shows, leave them at shops, post them online.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── WHAT YOU GET ON SIGNUP ── */}
        <div style={{ marginTop: "4rem", paddingTop: "3rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.18em", color: "rgba(99,155,255,0.6)", textTransform: "uppercase", marginBottom: "1.75rem" }}>
            What You Get When You Sign Up
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            {SIGNUP_PERKS.map((perk, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "5px", padding: "1.25rem" }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.1rem", color: "rgba(201,168,76,0.7)", marginBottom: "0.6rem" }}>{perk.icon}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.08em", color: "#ffffff", textTransform: "uppercase", marginBottom: "0.4rem" }}>{perk.title}</div>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", color: "rgba(148,163,184,0.6)", lineHeight: 1.6 }}>{perk.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW THE REFERRAL LINK WORKS ── */}
        <div style={{ marginTop: "4rem", paddingTop: "3rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.18em", color: "rgba(201,168,76,0.6)", textTransform: "uppercase", marginBottom: "2rem" }}>
            How Your Referral Link Works
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", alignItems: "center", gap: "0" }}>
            {[
              {
                step: "01",
                icon: "◈",
                title: "Get Your Link",
                desc: "Sign up as a Certified Grader. We instantly generate your personal referral link and send your print-ready card design.",
                color: "rgba(99,155,255,0.9)",
              },
              {
                step: "02",
                icon: "◉",
                title: "Share at Your Booth",
                desc: "Hand out your referral cards at shows, post your link online, or share with your shop. Anyone who signs up or grades through your link counts.",
                color: "rgba(201,168,76,0.9)",
              },
              {
                step: "03",
                icon: "♦",
                title: "Earn Per Card",
                desc: "Every card graded by someone in your network earns you a commission — automatically. Two levels deep. No cap on volume.",
                color: "rgba(148,200,255,0.9)",
              },
            ].map((item, i) => (
              <div key={item.step} style={{ display: "contents" }}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "6px",
                    padding: "1.75rem 1.5rem",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Step number watermark */}
                  <div style={{
                    position: "absolute", top: "0.75rem", right: "1rem",
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
                    fontSize: "3.5rem", color: "rgba(255,255,255,0.03)",
                    lineHeight: 1, userSelect: "none", pointerEvents: "none",
                  }}>{item.step}</div>

                  {/* Icon */}
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "1.4rem", color: item.color,
                    marginBottom: "0.85rem",
                  }}>{item.icon}</div>

                  {/* Step label */}
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                    fontSize: "0.6rem", letterSpacing: "0.16em",
                    color: item.color, textTransform: "uppercase",
                    marginBottom: "0.4rem",
                  }}>Step {item.step}</div>

                  {/* Title */}
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                    fontSize: "1rem", letterSpacing: "0.04em",
                    color: "#ffffff", textTransform: "uppercase",
                    marginBottom: "0.6rem",
                  }}>{item.title}</div>

                  {/* Description */}
                  <div style={{
                    fontFamily: "'Barlow', sans-serif", fontWeight: 300,
                    fontSize: "0.75rem", color: "rgba(148,163,184,0.65)",
                    lineHeight: 1.65,
                  }}>{item.desc}</div>
                </div>

                {/* Arrow connector (between steps only) */}
                {i < 2 && (
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "0 1rem",
                  }}>
                    <div style={{
                      width: "32px", height: "1px",
                      background: "linear-gradient(90deg, rgba(255,255,255,0.1), rgba(201,168,76,0.4), rgba(255,255,255,0.1))",
                      position: "relative",
                    }}>
                      <div style={{
                        position: "absolute", right: "-4px", top: "-3px",
                        width: 0, height: 0,
                        borderTop: "4px solid transparent",
                        borderBottom: "4px solid transparent",
                        borderLeft: "5px solid rgba(201,168,76,0.5)",
                      }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        </div>{/* end collapsible */}

      </div>
    </section>
  );
}
