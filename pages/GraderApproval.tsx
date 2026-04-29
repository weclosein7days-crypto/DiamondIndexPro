/**
 * GraderApproval — Diamond Index™
 * Shown once when a user's account is upgraded to Certified Grader.
 * Celebrates the transition and routes to the Grader Dashboard.
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { DIAMOND_SINGLE } from "@/lib/diamondRating";

const DARK = "#060d1e";
const GOLD = "#c9a84c";

export default function GraderApproval() {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in after mount
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // If user is not a grader, redirect to vault
  useEffect(() => {
    if (!loading && user && user.role !== "grader" && user.role !== "admin") {
      navigate("/vault");
    }
  }, [user, loading, navigate]);

  const features = [
    { icon: "◆", label: "Advanced Grading Tools", desc: "Full scoring system with batch processing" },
    { icon: "◈", label: "Label Printing", desc: "Print certified labels with QR codes" },
    { icon: "◇", label: "Earnings Dashboard", desc: "Track revenue per scan and per event" },
    { icon: "◆", label: "Booth Mode", desc: "Grade cards live at shows and events" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: DARK,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        opacity: visible ? 1 : 0,
        transition: "opacity 1.2s ease",
      }}
    >
      <div style={{ maxWidth: "560px", width: "100%", textAlign: "center" }}>

        {/* Diamond icon */}
        <div style={{ marginBottom: "2rem" }}>
          <img
            src={DIAMOND_SINGLE}
            alt="Diamond"
            style={{
              width: "72px",
              filter: "drop-shadow(0 0 24px rgba(201,168,76,0.6))",
              animation: "pulse 3s ease-in-out infinite",
            }}
          />
        </div>

        {/* Eyebrow */}
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: "0.7rem",
          letterSpacing: "0.25em",
          color: GOLD,
          textTransform: "uppercase",
          marginBottom: "1rem",
        }}>
          Diamond Index™ — Certified Grader
        </div>

        {/* Headline */}
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900,
          fontSize: "clamp(2rem, 6vw, 3rem)",
          color: "#fff",
          lineHeight: 1.1,
          marginBottom: "1rem",
          textTransform: "uppercase",
          letterSpacing: "0.02em",
        }}>
          You're Now a<br />
          <span style={{ color: GOLD }}>Certified Grader</span>
        </div>

        {/* Sub */}
        <div style={{
          fontFamily: "'Barlow', sans-serif",
          fontSize: "1rem",
          color: "rgba(160,180,200,0.85)",
          lineHeight: 1.7,
          marginBottom: "2.5rem",
          maxWidth: "400px",
          margin: "0 auto 2.5rem",
        }}>
          Your account has been upgraded. You now have full access to the Diamond Index™ professional grading platform.
        </div>

        {/* Orange divider */}
        <div style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.0) 8%, rgba(201,168,76,0.6) 30%, rgba(201,168,76,0.9) 50%, rgba(201,168,76,0.6) 70%, rgba(201,168,76,0.0) 92%, transparent 100%)",
          margin: "0 auto 2.5rem",
          width: "70%",
        }} />

        {/* Feature list */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "3rem",
          textAlign: "left",
        }}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,168,76,0.15)",
                borderRadius: "10px",
                padding: "1.25rem",
              }}
            >
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "0.95rem", color: GOLD, marginBottom: "0.35rem" }}>
                {f.icon} {f.label}
              </div>
              <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.78rem", color: "rgba(160,180,200,0.7)", lineHeight: 1.5 }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/grader-dashboard")}
          style={{
            display: "inline-block",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "0.9rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            padding: "1.1rem 3rem",
            background: GOLD,
            color: DARK,
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            marginBottom: "1.25rem",
            width: "100%",
            maxWidth: "340px",
          }}
        >
          Enter Grader Dashboard →
        </button>

        <div>
          <button
            onClick={() => navigate("/vault")}
            style={{
              background: "none",
              border: "none",
              fontFamily: "'Barlow', sans-serif",
              fontSize: "0.8rem",
              color: "rgba(160,180,200,0.5)",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Go to My Vault instead
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
