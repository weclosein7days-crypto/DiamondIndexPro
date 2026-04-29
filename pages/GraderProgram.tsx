/*
 * Diamond Index™ — Grader Program Page (/grader-program)
 *
 * REFRAMED: Distributed grading business opportunity — not affiliate/referral.
 *
 * New 7-section structure:
 *   1. Hero — "Start Your Own Grading Business"
 *   2. How It Works — 3 steps: Get Certified → Start Grading → Earn Per Card
 *   3. How You Make Money — per scan, booth pricing, volume = income
 *   4. Booth Model — live events, grade on the spot, keep the spread
 *   5. Real Earnings — scenario examples (simplified)
 *   6. What You Get — tools, dashboard, labels, system
 *   7. Apply — form
 *
 * Design: dark navy / gold / blue — financial-platform authority
 */

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const BOOTH_PHOTO = "/manus-storage/booth-national-show_8ef51e95.png";

const GOLD  = "rgba(201,168,76,0.9)";
const BLUE  = "rgba(99,155,255,0.9)";
const LIGHT = "rgba(148,163,184,0.7)";

const S = {
  section:   { paddingTop: "5rem", paddingBottom: "5rem", position: "relative" as const },
  container: { maxWidth: "1100px", margin: "0 auto", padding: "0 2rem" },
  eyebrow:   { fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: "0.68rem", letterSpacing: "0.22em", color: "rgba(201,168,76,0.65)", textTransform: "uppercase" as const, marginBottom: "1rem" },
  h2:        { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", letterSpacing: "-0.01em", color: "#ffffff", textTransform: "uppercase" as const, lineHeight: 1.05, marginBottom: "1rem" },
  body:      { fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: "0.95rem", color: LIGHT, lineHeight: 1.75 },
  divider:   { width: "100%", height: "1px", background: "rgba(255,255,255,0.05)", margin: "0" },
};

export default function GraderProgram() {
  const [formData, setFormData] = useState({ name: "", email: "", zip: "", role: "collector" });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Please enter your name and email.");
      return;
    }
    setSubmitted(true);
    toast.success("Application received. Check your email for next steps.");
  }

  return (
    <div style={{ background: "#070d1a", minHeight: "100vh" }}>
      <Header />

      {/* ══════════════════════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{ paddingTop: "7rem", paddingBottom: "0", position: "relative", overflow: "hidden" }}>
        {/* BG glows */}
        <div style={{ position: "absolute", top: 0, right: "-10%", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,155,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, left: "-5%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={S.container}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center", paddingBottom: "5rem" }}>

            {/* Left: manifesto */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
                <span style={{ display: "inline-block", width: "28px", height: "1px", background: GOLD }} />
                <span style={S.eyebrow}>Diamond Index™ Certified Grader Program</span>
              </div>

              <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.02em", color: "#ffffff", textTransform: "uppercase", lineHeight: 1.0, marginBottom: "1.5rem" }}>
                Start Your Own<br />
                <span style={{ color: GOLD }}>Grading Business.</span>
              </h1>

              <p style={{ ...S.body, maxWidth: "520px", marginBottom: "1.75rem" }}>
                Use Diamond Index™ to grade cards, run booths, and earn per scan.
                You bring the customers. We power the grading, the certification, and the verification.
              </p>

              {/* Power line */}
              <div style={{ padding: "1rem 1.5rem", background: "rgba(99,155,255,0.06)", border: "1px solid rgba(99,155,255,0.18)", borderRadius: "4px", marginBottom: "2rem" }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.1em", color: "rgba(148,200,255,0.9)", textTransform: "uppercase" }}>
                  "You keep the customer. We power the grading."
                </span>
              </div>

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" as const }}>
                <a href="#apply" style={{ display: "inline-block", padding: "0.9rem 2rem", background: "white", color: "#0d1b3e", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "3px", textDecoration: "none" }}>
                  Apply to Become a Grader →
                </a>
                <a href="#earnings" style={{ display: "inline-block", padding: "0.9rem 2rem", background: "transparent", color: LIGHT, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "3px", textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)" }}>
                  See Earnings
                </a>
              </div>
            </div>

            {/* Right: booth photo */}
            <div style={{ borderRadius: "6px", overflow: "hidden", position: "relative" }}>
              <img
                src={BOOTH_PHOTO}
                alt="Certified grader at a sports card show"
                style={{ width: "100%", height: "460px", objectFit: "cover", objectPosition: "center 30%", display: "block" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(7,13,26,0.45) 0%, transparent 60%)" }} />
              <div style={{ position: "absolute", bottom: "1.5rem", left: "1.5rem" }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.16em", color: "rgba(201,168,76,0.85)", textTransform: "uppercase" }}>
                  National Sports Collectors Convention
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div style={S.divider} />

      {/* ══════════════════════════════════════════════════════════════════
          2. HOW IT WORKS — 3 steps
      ══════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ ...S.section, background: "rgba(255,255,255,0.015)" }}>
        <div style={S.container}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{ ...S.eyebrow, textAlign: "center" }}>Simple Process</div>
            <h2 style={{ ...S.h2, textAlign: "center" }}>How It Works</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", alignItems: "start", gap: "0" }}>
            {[
              {
                step: "01",
                icon: "◈",
                title: "Get Certified",
                color: BLUE,
                desc: "Apply and receive your Diamond Index™ Certified Grader credentials. No exam. No fee. You grade using our system — the algorithm does the calculation.",
              },
              null,
              {
                step: "02",
                icon: "◆",
                title: "Start Grading",
                color: GOLD,
                desc: "Grade cards through the app, at shows, or at your shop. Every grade issues a certified DI label with a unique Cert ID and QR code — backed by Diamond Index™.",
              },
              null,
              {
                step: "03",
                icon: "◉",
                title: "Earn Per Card",
                color: "rgba(148,200,255,0.9)",
                desc: "Keep the majority of every grade you issue. Run booths at shows, grade for dealers, or build a local grading operation. Volume = income.",
              },
            ].map((item, i) => {
              if (item === null) {
                return (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "2.5rem" }}>
                    <div style={{ width: "40px", height: "1px", background: "rgba(255,255,255,0.1)", marginTop: "1.5rem" }} />
                  </div>
                );
              }
              return (
                <div key={i} style={{ padding: "2rem", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "6px" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.65rem", letterSpacing: "0.2em", color: "rgba(100,116,139,0.4)", textTransform: "uppercase", marginBottom: "1rem" }}>{item.step}</div>
                  <div style={{ fontSize: "1.5rem", color: item.color, marginBottom: "0.85rem" }}>{item.icon}</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "0.04em", color: "#ffffff", textTransform: "uppercase", marginBottom: "0.75rem" }}>{item.title}</div>
                  <p style={{ ...S.body, fontSize: "0.85rem" }}>{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Trust anchor */}
          <div style={{ marginTop: "3rem", padding: "1.25rem 2rem", background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: "4px", textAlign: "center" }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.12em", color: "rgba(201,168,76,0.75)", textTransform: "uppercase" }}>
              All grades are backed by Diamond Index™ certification + verification system — QR codes, Cert IDs, and a permanent public record.
            </span>
          </div>
        </div>
      </section>

      <div style={S.divider} />

      {/* ══════════════════════════════════════════════════════════════════
          3. HOW YOU MAKE MONEY
      ══════════════════════════════════════════════════════════════════ */}
      <section id="how-you-earn" style={S.section}>
        <div style={S.container}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "start" }}>

            <div>
              <div style={S.eyebrow}>Revenue Model</div>
              <h2 style={S.h2}>How You Make Money</h2>
              <p style={{ ...S.body, marginBottom: "2rem" }}>
                Three income streams. You control how much you use each one.
                The more cards you grade, the more you earn — no ceiling, no monthly fees.
              </p>

              <div style={{ display: "flex", flexDirection: "column" as const, gap: "1.25rem" }}>
                {[
                  {
                    icon: "◆",
                    title: "Per-Scan Earnings",
                    color: GOLD,
                    desc: "Every card graded through your operation earns you a base fee. Grade 500 cards a month and the math is simple.",
                    detail: "Base: $0.75–$1.50 per card",
                  },
                  {
                    icon: "◈",
                    title: "Booth & Event Pricing",
                    color: BLUE,
                    desc: "Set up at shows and grade on the spot. You charge the customer, keep the spread. Diamond Index™ takes a small platform fee.",
                    detail: "Quick Grade: $5.99 → you keep $5.00 | Slab: $14.99 → you keep $13.00",
                  },
                  {
                    icon: "◉",
                    title: "Volume = Income",
                    color: "rgba(148,200,255,0.9)",
                    desc: "As your grading volume grows, your per-card rate increases. Sign a card shop or dealer and their volume works for you too.",
                    detail: "Higher volume → higher tier → higher rate",
                  },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "1.25rem", padding: "1.5rem", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "6px" }}>
                    <div style={{ fontSize: "1.25rem", color: item.color, flexShrink: 0, paddingTop: "2px" }}>{item.icon}</div>
                    <div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.04em", color: "#ffffff", textTransform: "uppercase", marginBottom: "0.4rem" }}>{item.title}</div>
                      <p style={{ ...S.body, fontSize: "0.83rem", marginBottom: "0.5rem" }}>{item.desc}</p>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.1em", color: item.color, textTransform: "uppercase" }}>{item.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tier rate table */}
            <div>
              <div style={{ ...S.eyebrow }}>Grader Tiers</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "1.5rem" }}>
                Your Rate Grows With Your Volume
              </div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: "0.75rem" }}>
                {[
                  { label: "Starter",       vol: "Up to 25/mo",   rate: "$0.75/card", color: "rgba(148,163,184,0.9)",  border: "rgba(148,163,184,0.2)" },
                  { label: "Active",        vol: "26–50/mo",      rate: "$1.00/card", color: "rgba(148,200,255,0.9)",  border: "rgba(148,200,255,0.25)" },
                  { label: "Professional",  vol: "51–100/mo",     rate: "$1.25/card", color: BLUE,                     border: "rgba(99,155,255,0.3)" },
                  { label: "Senior",        vol: "101–250/mo",    rate: "$1.50/card", color: GOLD,                     border: "rgba(201,168,76,0.3)" },
                  { label: "Master Grader", vol: "250+/mo",       rate: "$1.50/card + bonuses", color: "rgba(255,215,80,1)", border: "rgba(255,215,80,0.35)", master: true },
                ].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", background: "rgba(255,255,255,0.025)", border: `1px solid ${t.border}`, borderRadius: "4px", position: "relative" as const }}>
                    {t.master && (
                      <div style={{ position: "absolute" as const, top: "-9px", right: "1rem", background: "rgba(255,215,80,0.12)", border: "1px solid rgba(255,215,80,0.35)", borderRadius: "20px", padding: "1px 8px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.52rem", letterSpacing: "0.14em", color: "rgba(255,215,80,0.9)", textTransform: "uppercase" as const }}>Top Tier</div>
                    )}
                    <div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: t.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{t.label}</div>
                      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", color: "rgba(100,116,139,0.5)", marginTop: "2px" }}>{t.vol}</div>
                    </div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1rem", color: "#ffffff", textAlign: "right" as const }}>{t.rate}</div>
                  </div>
                ))}
              </div>
              <p style={{ ...S.body, fontSize: "0.72rem", marginTop: "1rem", color: "rgba(100,116,139,0.4)" }}>
                * Volume calculated on cards graded through your operation. Booth grades count at full rate.
              </p>
            </div>

          </div>
        </div>
      </section>

      <div style={S.divider} />

      {/* ══════════════════════════════════════════════════════════════════
          4. BOOTH MODEL
      ══════════════════════════════════════════════════════════════════ */}
      <section id="booth" style={{ ...S.section, background: "rgba(255,255,255,0.015)" }}>
        <div style={S.container}>
          <div style={{ marginBottom: "3.5rem" }}>
            <div style={S.eyebrow}>Live Events</div>
            <h2 style={S.h2}>The Booth Model</h2>
            <p style={{ ...S.body, maxWidth: "600px" }}>
              Set up at card shows, conventions, and local events. Grade on the spot.
              Customers pay you directly. You keep the spread. This is where the real money is.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "3rem" }}>
            {[
              {
                name: "Quick Grade",
                price: "$5.99",
                graderKeeps: "$5.00",
                diKeeps: "$0.99",
                icon: "◆",
                color: GOLD,
                border: "rgba(201,168,76,0.25)",
                desc: "Grade at your booth. Digital certification with Cert ID and QR code issued on the spot. Fast, clean, professional.",
                tag: "Most Popular at Shows",
              },
              {
                name: "Slab & Label",
                price: "$14.99",
                graderKeeps: "$13.00",
                diKeeps: "$1.99",
                icon: "◈",
                color: BLUE,
                border: "rgba(99,155,255,0.25)",
                desc: "Full physical slab — protective sleeve, printed Diamond Index™ label with diamond rating and Cert ID. Premium service, premium price.",
                tag: "Highest Value Per Card",
              },
            ].map((svc, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${svc.border}`, borderRadius: "6px", padding: "2rem", position: "relative" as const }}>
                <div style={{ position: "absolute" as const, top: "-10px", left: "1.5rem", background: "rgba(7,13,26,1)", border: `1px solid ${svc.border}`, borderRadius: "20px", padding: "2px 10px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.55rem", letterSpacing: "0.14em", color: svc.color, textTransform: "uppercase" as const }}>{svc.tag}</div>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "1.5rem", color: svc.color, marginBottom: "0.5rem" }}>{svc.icon}</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.04em" }}>{svc.name}</div>
                  </div>
                  <div style={{ textAlign: "right" as const }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.8rem", color: "#ffffff", lineHeight: 1 }}>{svc.price}</div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.65rem", color: "rgba(100,116,139,0.5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>per card</div>
                  </div>
                </div>
                <p style={{ ...S.body, fontSize: "0.83rem", marginBottom: "1.5rem" }}>{svc.desc}</p>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", background: "rgba(255,255,255,0.04)", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ textAlign: "center" as const }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.4rem", color: svc.color }}>{svc.graderKeeps}</div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.62rem", color: "rgba(100,116,139,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}>You Keep</div>
                  </div>
                  <div style={{ width: "1px", background: "rgba(255,255,255,0.08)" }} />
                  <div style={{ textAlign: "center" as const }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "rgba(100,116,139,0.5)" }}>{svc.diKeeps}</div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.62rem", color: "rgba(100,116,139,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Platform Fee</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Booth model callout */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {[
              { icon: "◆", title: "Set Up at Shows", desc: "Table at regional shows, conventions, and local card events. Bring your phone and your Diamond Index™ credentials." },
              { icon: "◈", title: "Grade on the Spot", desc: "Customers hand you the card. You photograph it, the system grades it, and a certified label is issued in minutes." },
              { icon: "◉", title: "Keep the Spread", desc: "You charge the customer. Diamond Index™ takes a small platform fee. The rest is yours — every time, every card." },
            ].map((item, i) => (
              <div key={i} style={{ padding: "1.75rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px" }}>
                <div style={{ fontSize: "1.2rem", color: GOLD, marginBottom: "0.75rem" }}>{item.icon}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.04em", color: "#ffffff", textTransform: "uppercase", marginBottom: "0.5rem" }}>{item.title}</div>
                <p style={{ ...S.body, fontSize: "0.83rem" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={S.divider} />

      {/* ══════════════════════════════════════════════════════════════════
          5. REAL EARNINGS EXAMPLES
      ══════════════════════════════════════════════════════════════════ */}
      <section id="earnings" style={S.section}>
        <div style={S.container}>
          <div style={{ marginBottom: "3.5rem" }}>
            <div style={S.eyebrow}>Real Numbers</div>
            <h2 style={S.h2}>What You Actually Earn</h2>
            <p style={{ ...S.body, maxWidth: "600px" }}>
              Three scenarios. Exact dollar amounts. No vague percentages.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
            {[
              {
                label: "The Weekend Grader",
                tier: "Starter",
                tierColor: "rgba(148,163,184,0.9)",
                desc: "You grade at one show per month. 60 quick grades, 10 slabs.",
                lines: [
                  { label: "60 quick grades", calc: "60 × $5.00", result: "$300.00" },
                  { label: "10 slabs", calc: "10 × $13.00", result: "$130.00" },
                  { label: "Weekend total", result: "$430.00", highlight: true },
                ],
              },
              {
                label: "The Active Dealer",
                tier: "Professional",
                tierColor: BLUE,
                desc: "You grade at shows and for local dealers. 500 cards per month.",
                lines: [
                  { label: "500 app grades", calc: "500 × $1.25", result: "$625.00" },
                  { label: "2 shows, 50 booth grades", calc: "100 × $5.00", result: "$500.00" },
                  { label: "Monthly total", result: "$1,125.00", highlight: true },
                ],
              },
              {
                label: "The Grading Operation",
                tier: "Master Grader",
                tierColor: "rgba(255,215,80,1)",
                desc: "You run a grading operation. Multiple shops send you cards monthly.",
                lines: [
                  { label: "1,000 app grades", calc: "1,000 × $1.50", result: "$1,500.00" },
                  { label: "3 shows, 200 booth grades", calc: "600 × $5.00", result: "$3,000.00" },
                  { label: "Monthly total", result: "$4,500.00", highlight: true },
                ],
              },
            ].map((scenario, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "6px", padding: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "0.65rem", letterSpacing: "0.14em", color: scenario.tierColor, textTransform: "uppercase" as const, background: `${scenario.tierColor.replace("0.9", "0.08").replace("1)", "0.08)")}`, border: `1px solid ${scenario.tierColor.replace("0.9", "0.2").replace("1)", "0.2)")}`, borderRadius: "3px", padding: "2px 8px" }}>{scenario.tier}</span>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "0.5rem" }}>{scenario.label}</div>
                <p style={{ ...S.body, fontSize: "0.78rem", marginBottom: "1.5rem" }}>{scenario.desc}</p>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: "0.5rem" }}>
                  {scenario.lines.map((line, j) => (
                    <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: line.highlight ? "0.75rem 1rem" : "0.35rem 0", background: line.highlight ? "rgba(255,255,255,0.04)" : "transparent", borderTop: line.highlight ? "1px solid rgba(255,255,255,0.08)" : undefined, borderRadius: line.highlight ? "3px" : undefined, marginTop: line.highlight ? "0.5rem" : undefined }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.8rem", color: line.highlight ? "rgba(203,213,225,0.9)" : "rgba(148,163,184,0.6)" }}>{line.label}</span>
                        {"calc" in line && line.calc && <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.7rem", color: "rgba(100,116,139,0.4)", letterSpacing: "0.04em" }}>{line.calc}</span>}
                      </div>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: line.highlight ? 800 : 600, fontSize: line.highlight ? "1.1rem" : "0.9rem", color: line.highlight ? scenario.tierColor : "rgba(203,213,225,0.7)", whiteSpace: "nowrap" as const }}>{line.result}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p style={{ ...S.body, fontSize: "0.7rem", color: "rgba(100,116,139,0.4)" }}>
            * Projections based on estimated grading volumes. Actual earnings vary. Diamond Index™ platform fee is deducted before grader earnings are calculated.
          </p>
        </div>
      </section>

      <div style={S.divider} />

      {/* ══════════════════════════════════════════════════════════════════
          6. WHAT YOU GET
      ══════════════════════════════════════════════════════════════════ */}
      <section id="perks" style={{ ...S.section, background: "rgba(255,255,255,0.015)" }}>
        <div style={S.container}>
          <div style={{ marginBottom: "3rem" }}>
            <div style={S.eyebrow}>Included With Certification</div>
            <h2 style={S.h2}>What You Get</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {[
              {
                icon: "◈",
                title: "Grader Dashboard",
                color: BLUE,
                desc: "Track every card you've graded, monitor your volume tier, view your earnings history, and manage your operation from one place.",
              },
              {
                icon: "◆",
                title: "Certification System",
                color: GOLD,
                desc: "Every grade you issue carries a unique DI Cert ID, a QR code, and a permanent public verification record. Your grades are backed by Diamond Index™.",
              },
              {
                icon: "◉",
                title: "Physical Labels & Slabs",
                color: "rgba(148,200,255,0.9)",
                desc: "Order printed Diamond Index™ labels and protective slabs for your booth grades. Cert ID and QR code printed on every label.",
              },
              {
                icon: "▭",
                title: "Grading Tools",
                color: GOLD,
                desc: "Access the full Diamond Index™ grading algorithm — centering, edges, corners, surface, and eye appeal — calculated, not estimated.",
              },
              {
                icon: "⊕",
                title: "Partner Marketplace Access",
                color: BLUE,
                desc: "List your grading services in the Diamond Index™ certified partner network. Collectors find you. You grade for them.",
              },
              {
                icon: "◈",
                title: "Certification Authority",
                color: "rgba(148,200,255,0.9)",
                desc: "You are the certified grader. Diamond Index™ backs every grade you issue with its verification infrastructure. Your reputation, our standard.",
              },
            ].map((perk, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "6px", padding: "1.75rem" }}>
                <div style={{ fontSize: "1.3rem", color: perk.color, marginBottom: "0.85rem" }}>{perk.icon}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.04em", color: "#ffffff", textTransform: "uppercase", marginBottom: "0.5rem" }}>{perk.title}</div>
                <p style={{ ...S.body, fontSize: "0.83rem" }}>{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={S.divider} />

      {/* ══════════════════════════════════════════════════════════════════
          7. APPLY
      ══════════════════════════════════════════════════════════════════ */}
      <section id="apply" style={S.section}>
        <div style={{ ...S.container, maxWidth: "640px" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ ...S.eyebrow, textAlign: "center" }}>Free to Join</div>
            <h2 style={{ ...S.h2, textAlign: "center" }}>Apply to Become a Certified Grader</h2>
            <p style={{ ...S.body, textAlign: "center" }}>
              Submit your application and we'll send you your Certified Grader credentials,
              grading tools, and everything you need to start your operation.
            </p>
          </div>

          {submitted ? (
            <div style={{ textAlign: "center", padding: "3rem 2rem", background: "rgba(99,155,255,0.06)", border: "1px solid rgba(99,155,255,0.2)", borderRadius: "8px" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>◆</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#ffffff", textTransform: "uppercase", marginBottom: "0.75rem" }}>Application Received.</div>
              <div style={{ ...S.body }}>Check your email for your Certified Grader credentials, grading tools, and portal access. Welcome to Diamond Index™.</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" as const, gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.16em", color: "rgba(100,116,139,0.6)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Full Name *</label>
                  <input
                    type="text" placeholder="Your name"
                    value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#ffffff", fontFamily: "'Barlow', sans-serif", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" as const }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.16em", color: "rgba(100,116,139,0.6)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Email *</label>
                  <input
                    type="email" placeholder="your@email.com"
                    value={formData.email}
                    onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#ffffff", fontFamily: "'Barlow', sans-serif", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" as const }}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.16em", color: "rgba(100,116,139,0.6)", textTransform: "uppercase", marginBottom: "0.5rem" }}>ZIP Code</label>
                  <input
                    type="text" placeholder="12345"
                    value={formData.zip}
                    onChange={e => setFormData(f => ({ ...f, zip: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#ffffff", fontFamily: "'Barlow', sans-serif", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" as const }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.16em", color: "rgba(100,116,139,0.6)", textTransform: "uppercase", marginBottom: "0.5rem" }}>I Am A</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData(f => ({ ...f, role: e.target.value }))}
                    style={{ width: "100%", padding: "0.75rem 1rem", background: "rgba(20,30,55,1)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#ffffff", fontFamily: "'Barlow', sans-serif", fontSize: "0.88rem", outline: "none", cursor: "pointer", boxSizing: "border-box" as const }}
                  >
                    <option value="collector">Collector</option>
                    <option value="dealer">Dealer / Shop Owner</option>
                    <option value="show-vendor">Show Vendor</option>
                    <option value="content-creator">Content Creator</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                style={{ padding: "1rem 2rem", background: "white", color: "#0d1b3e", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "3px", border: "none", cursor: "pointer", marginTop: "0.5rem" }}
              >
                Apply to Become a Grader →
              </button>
              <p style={{ ...S.body, fontSize: "0.72rem", textAlign: "center" as const }}>
                Free to join. No monthly fees. No commitments. You keep the majority of every transaction.
              </p>
            </form>
          )}
        </div>
      </section>

      <div style={S.divider} />

      {/* ══════════════════════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════════════════════ */}
      <section id="faq" style={{ ...S.section, background: "rgba(255,255,255,0.015)" }}>
        <div style={{ ...S.container, maxWidth: "760px" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{ ...S.eyebrow, textAlign: "center" }}>Common Questions</div>
            <h2 style={{ ...S.h2, textAlign: "center" }}>FAQ</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: "0" }}>
            {[
              {
                q: "Do I need any certification or training to join?",
                a: "No. Diamond Index™ is open to any collector. You grade using our app — the system does the calculation. There's no exam, no fee, and no prior experience required. If you can photograph a card, you can grade a card.",
              },
              {
                q: "How and when do I get paid?",
                a: "Earnings are tracked in your Grader Portal in real time. Payouts are processed on a rolling basis once your balance reaches the minimum threshold. Payment methods include direct deposit and PayPal. You'll see full details in your portal after signup.",
              },
              {
                q: "Can I build a grading operation with multiple graders under me?",
                a: "Yes. As your operation grows, you can bring in additional graders who work under your Diamond Index™ certification. Volume from your entire operation counts toward your tier rate. The more cards your operation grades, the higher your per-card rate.",
              },
              {
                q: "Is there a monthly fee or subscription to stay active?",
                a: "No monthly fees. No subscriptions. No minimums. Diamond Index™ is free to join and free to stay in. You only earn — you never pay to participate.",
              },
              {
                q: "What's the difference between app grading and booth grading?",
                a: "App grading is done by the collector through their phone — they photograph the card, the system grades it. Booth grading ($5.99 quick grade / $14.99 slab) is done by you in person at a show or shop. You do the work, you keep the majority.",
              },
              {
                q: "How is Diamond Index™ different from PSA or Beckett?",
                a: "PSA and Beckett are centralized grading companies with opaque scoring, long turnaround times, and pricing that benefits large institutional buyers. Diamond Index™ is formula-driven — every score is calculated, not estimated. Graders are collectors. Earnings stay in the hobby. And you can grade a card in minutes, not months.",
              },
              {
                q: "What does 'backed by Diamond Index™ certification' mean?",
                a: "Every grade issued through Diamond Index™ receives a unique Certification ID (DI-XXXX-XXXX format) and a QR code linked to a permanent public verification page. Anyone can scan the QR code to verify the card's grade, score breakdown, and certification date. Your grades carry that authority.",
              },
            ].map((item, i) => (
              <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 0", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" as const, gap: "1.5rem" }}
                >
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.02em", color: openFaq === i ? "#ffffff" : "rgba(203,213,225,0.85)", textTransform: "uppercase", lineHeight: 1.3 }}>
                    {item.q}
                  </span>
                  <span style={{ flexShrink: 0, width: "20px", height: "20px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: openFaq === i ? GOLD : "rgba(100,116,139,0.5)", fontSize: "1rem", lineHeight: 1, transition: "all 0.2s", transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)" }}>
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div style={{ paddingBottom: "1.5rem", paddingRight: "2.5rem" }}>
                    <p style={{ ...S.body, fontSize: "0.88rem", lineHeight: 1.8 }}>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: "3.5rem", textAlign: "center" as const }}>
            <p style={{ ...S.body, marginBottom: "1.5rem" }}>Ready to start your grading operation?</p>
            <a href="#apply" style={{ display: "inline-block", padding: "0.9rem 2rem", background: "white", color: "#0d1b3e", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "3px", textDecoration: "none" }}>
              Apply to Become a Grader →
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
