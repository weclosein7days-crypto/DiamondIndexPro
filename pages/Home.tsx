/*
 * Diamond Index™ — Home Page
 * Assembles: Header | Hero | PhoneSection | GradingScale | HowItWorks | Pricing | Graders | ValueSection | CTABanner | Footer
 * Financial certification authority aesthetic
 *
 * SectionDivider: atmospheric fading line — center barely visible, edges dissolve.
 * Not a hard border. A natural breath between sections.
 */

import CTABanner from "@/components/CTABanner";
import PhoneSection from "@/components/PhoneSection";
import Footer from "@/components/Footer";
import GradingScale from "@/components/GradingScale";
import GradersSection from "@/components/GradersSection";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import WhyAI from "@/components/WhyAI";
import ConversionStrip from "@/components/ConversionStrip";
import PricingSection from "@/components/PricingSection";
import ValueSection from "@/components/ValueSection";

/**
 * SectionDivider — atmospheric fading line.
 * bg: the background color of the containing transition zone (matches adjacent sections).
 * tone: "gold" (warm accent, used after hero) | "subtle" (near-invisible, used between dark sections)
 */
function SectionDivider({
  bg = "#060d1e",
  tone = "subtle",
}: {
  bg?: string;
  tone?: "gold" | "subtle";
}) {
  const gradient =
    tone === "gold"
      ? "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.0) 8%, rgba(201,168,76,0.45) 30%, rgba(201,168,76,0.75) 50%, rgba(201,168,76,0.45) 70%, rgba(201,168,76,0.0) 92%, transparent 100%)"
      : "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.0) 10%, rgba(201,168,76,0.06) 35%, rgba(201,168,76,0.11) 50%, rgba(201,168,76,0.06) 65%, rgba(201,168,76,0.0) 90%, transparent 100%)";

  const glow =
    tone === "gold"
      ? "0 0 10px 1px rgba(201,168,76,0.15), 0 0 24px 3px rgba(201,168,76,0.05)"
      : "none";

  return (
    <div style={{ background: bg, lineHeight: 0 }}>
      <div
        style={{
          height: "1px",
          background: gradient,
          boxShadow: glow,
          margin: "0 auto",
          width: "70%",
        }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "#ffffff" }}>
      <Header />
      <main>
        <HeroSection />

        {/* Hero → PhoneSection: warm gold accent — the signature divider */}
        <SectionDivider bg="#060d1e" tone="gold" />

        <PhoneSection />

        {/* PhoneSection → GradingScale */}
        <SectionDivider bg="#060d1e" tone="subtle" />

        <GradingScale />

        {/* GradingScale → HowItWorks */}
        <SectionDivider bg="#060d1e" tone="subtle" />

        <HowItWorks />

        {/* HowItWorks → WhyAI */}
        <SectionDivider bg="#060d1e" tone="subtle" />

        <WhyAI />

        {/* WhyAI → ConversionStrip */}
        <SectionDivider bg="#060d1e" tone="subtle" />

        <ConversionStrip />

        {/* ConversionStrip → Pricing */}
        <SectionDivider bg="#060d1e" tone="gold" />

        <PricingSection />

        {/* Pricing → Value */}
        <SectionDivider bg="#060d1e" tone="subtle" />

        <ValueSection />

        {/* Value → CTA */}
        <SectionDivider bg="#060d1e" tone="gold" />

        <CTABanner />

        {/* CTA → Graders (last section) */}
        <SectionDivider bg="#060d1e" tone="subtle" />

        <GradersSection />
      </main>
      <Footer />
    </div>
  );
}
