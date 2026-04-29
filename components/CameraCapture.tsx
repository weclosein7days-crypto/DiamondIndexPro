/**
 * Diamond Index™ — CameraCapture Component
 * Full guided capture flow:
 *   viewfinder → front 5s countdown → capture → flip prompt 7s → back capture
 *   → confirmation → cinematic analysis → grade reveal → accept/regrade/exit
 *   → vault save → marketplace offer
 *
 * Design: Dark, professional, financial-platform feel.
 * NO freestyling. Follow spec exactly.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";

const GOLD = "#c9a84c";
const BLUE = "rgba(99,155,255,0.9)";
const DARK = "#0c1628";

// ── Types ──────────────────────────────────────────────────────────────────────
type CapturePhase =
  | "viewfinder"       // Step 1: align card
  | "front-countdown"  // Step 2: 5s countdown front
  | "front-flash"      // Step 2: capture flash
  | "flip-prompt"      // Step 3: flip card overlay + 7s countdown
  | "back-countdown"   // Step 3b: back countdown (reuses flip-prompt state)
  | "back-flash"       // Step 3: back capture flash
  | "confirmation"     // Step 4: review front + back
  | "analysis"         // Step 5: cinematic analysis
  | "grades"           // Step 6: grade reveal
  | "action"           // Step 7: accept / regrade / exit
  | "vault-save"       // Step 8: saving to vault
  | "partner-referral" // Step 9: connect with master grader
  | "slab-order";      // Step 10: order physical slab

interface CaptureResult {
  frontImage: string;
  backImage: string;
  score: number;
  diamonds: number;
  tier: string;
  categories: { name: string; score: number; weight: string }[];
}

interface Props {
  onExit: () => void;
  onAccepted: (result: CaptureResult) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const CARD_IMG_FRONT = "https://images.unsplash.com/photo-1612404730960-5c71577fca11?w=400&q=80";
const CARD_IMG_BACK  = "https://images.unsplash.com/photo-1612404730960-5c71577fca11?w=400&q=80&flip=h";

const ANALYSIS_STEPS = [
  { key: "centering",   label: "Centering",   weight: "40%", delay: 800 },
  { key: "edges",       label: "Edges",       weight: "15%", delay: 2800 },
  { key: "corners",     label: "Corners",     weight: "15%", delay: 4800 },
  { key: "surface",     label: "Surface",     weight: "20%", delay: 6800 },
  { key: "eye_appeal",  label: "Eye Appeal",  weight: "10%", delay: 8800 },
];

const MOCK_RESULT: CaptureResult = {
  frontImage: CARD_IMG_FRONT,
  backImage: CARD_IMG_BACK,
  score: 94.2,
  diamonds: 4,
  tier: "ELITE",
  categories: [
    { name: "Centering",  score: 96, weight: "40%" },
    { name: "Edges",      score: 93, weight: "15%" },
    { name: "Corners",    score: 95, weight: "15%" },
    { name: "Surface",    score: 92, weight: "20%" },
    { name: "Eye Appeal", score: 96, weight: "10%" },
  ],
};

function tierColor(tier: string) {
  if (tier === "PRISTINE") return "#ffd750";
  if (tier === "ELITE")    return GOLD;
  if (tier === "SUPERIOR") return BLUE;
  return "rgba(148,163,184,0.85)";
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CameraCapture({ onExit, onAccepted }: Props) {
  const [phase, setPhase] = useState<CapturePhase>("viewfinder");
  const [countdown, setCountdown] = useState(5);
  const [flipCountdown, setFlipCountdown] = useState(7);
  const [analysisRevealed, setAnalysisRevealed] = useState<Set<string>>(new Set());
  const [gradesVisible, setGradesVisible] = useState(false);
  const [scoreCount, setScoreCount] = useState(0);
  const [vaultSaved, setVaultSaved] = useState(false);
  const [partnerSent, setPartnerSent] = useState(false);
  const [slabOrdered, setSlabOrdered] = useState(false);
  const [savedCertId, setSavedCertId] = useState<string | null>(null);
  const [savedQrUrl, setSavedQrUrl] = useState<string | null>(null);
  const [savedCardId, setSavedCardId] = useState<number | null>(null);
  const [cardName, setCardName] = useState("");
  const [cardSet, setCardSet] = useState("");
  const [cardYear, setCardYear] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardManufacturer, setCardManufacturer] = useState("");
  const [autoDetecting, setAutoDetecting] = useState(false);
  const [showRegradeModal, setShowRegradeModal] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const result = MOCK_RESULT;

  const createReGradeSession = trpc.payments.createReGradeSession.useMutation();
  const extractCardData = trpc.cards.extractData.useMutation();
  const saveCardMutation = trpc.vault.saveCard.useMutation();
  const updateStatusMutation = trpc.vault.updateStatus.useMutation();

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  // ── Front countdown ──
  useEffect(() => {
    if (phase !== "front-countdown") return;
    setCountdown(5);
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearTimer();
          setPhase("front-flash");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return clearTimer;
  }, [phase, clearTimer]);

  // ── Front flash → flip prompt ──
  useEffect(() => {
    if (phase !== "front-flash") return;
    const t = setTimeout(() => setPhase("flip-prompt"), 800);
    return () => clearTimeout(t);
  }, [phase]);

  // ── Flip countdown ──
  useEffect(() => {
    if (phase !== "flip-prompt") return;
    setFlipCountdown(7);
    timerRef.current = setInterval(() => {
      setFlipCountdown(c => {
        if (c <= 1) {
          clearTimer();
          setPhase("back-flash");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return clearTimer;
  }, [phase, clearTimer]);

  // ── Back flash → AI extraction → confirmation ──
  useEffect(() => {
    if (phase !== "back-flash") return;
    const t = setTimeout(async () => {
      setAutoDetecting(true);
      try {
        // Use a mock back image URL for demo; in production this would be the actual captured image
        const backImageUrl = result.backImage;
        const data = await extractCardData.mutateAsync({ imageUrl: backImageUrl });
        if (data.playerName && !cardName) setCardName(data.playerName);
        if (data.year && data.cardSet) {
          setCardSet(`${data.year} ${data.cardSet}`.trim());
        } else if (data.cardSet && !cardSet) {
          setCardSet(data.cardSet);
        }
        if (data.year) setCardYear(data.year);
        if (data.cardNumber) setCardNumber(data.cardNumber);
        if (data.manufacturer) setCardManufacturer(data.manufacturer);
      } catch {
        // silent fail — user can enter manually
      } finally {
        setAutoDetecting(false);
        setPhase("confirmation");
      }
    }, 800);
    return () => clearTimeout(t);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Analysis: reveal each step ──
  useEffect(() => {
    if (phase !== "analysis") return;
    setAnalysisRevealed(new Set());
    ANALYSIS_STEPS.forEach(s => {
      const t = setTimeout(() => {
        setAnalysisRevealed(prev => new Set(Array.from(prev).concat(s.key)));
      }, 600 + s.delay);
      // store for cleanup
    });
    // After all steps, move to grades
    const total = setTimeout(() => setPhase("grades"), 12000);
    return () => clearTimeout(total);
  }, [phase]);

  // ── Grade reveal ──
  useEffect(() => {
    if (phase !== "grades") return;
    setGradesVisible(false);
    setScoreCount(0);
    const t1 = setTimeout(() => setGradesVisible(true), 400);
    // Count up score
    let frame = 0;
    const target = result.score;
    const steps = 40;
    const t2 = setInterval(() => {
      frame++;
      setScoreCount(Math.min(+(target * frame / steps).toFixed(1), target));
      if (frame >= steps) clearInterval(t2);
    }, 40);
    // Move to action after reveal
    const t3 = setTimeout(() => setPhase("action"), 3000);
    return () => { clearTimeout(t1); clearInterval(t2); clearTimeout(t3); };
  }, [phase, result.score]);

  // ── Vault save ──
  useEffect(() => {
    if (phase !== "vault-save") return;
    setVaultSaved(false);
    // Persist card to DB (fire-and-forget — advance to marketplace regardless)
    saveCardMutation.mutate({
      cardName: cardName || undefined,
      cardSet: cardSet || undefined,
      cardYear: cardYear || undefined,
      cardNumber: cardNumber || undefined,
      manufacturer: cardManufacturer || undefined,
      frontImageUrl: result.frontImage || undefined,
      backImageUrl: result.backImage || undefined,
      overallScore: result.score,
      diamondRating: result.diamonds,
      gradeTier: result.tier,
      centeringScore: result.categories.find(c => c.name === "Centering")?.score,
      edgesScore: result.categories.find(c => c.name === "Edges")?.score,
      cornersScore: result.categories.find(c => c.name === "Corners")?.score,
      surfaceScore: result.categories.find(c => c.name === "Surface")?.score,
      eyeAppealScore: result.categories.find(c => c.name === "Eye Appeal")?.score,
      siteOrigin: typeof window !== "undefined" ? window.location.origin : undefined,
    }, {
      onSuccess: (data) => {
        if (data.certId) setSavedCertId(data.certId);
        if (data.qrCodeUrl) setSavedQrUrl(data.qrCodeUrl);
        if (data.cardId) setSavedCardId(data.cardId);
      },
    });
    const t = setTimeout(() => {
      setVaultSaved(true);
      setTimeout(() => setPhase("partner-referral"), 1200);
    }, 2000);
    return () => clearTimeout(t);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Shared overlay style ──
  const overlay: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: DARK,
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  };

  // ── EXIT button — always visible on every phase ──
  const showExit = true; // always visible on every phase

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div style={overlay}>

      {/* EXIT button — always visible, prominent */}
      <button
        onClick={onExit}
        style={{
          position: "absolute", top: "1rem", right: "1rem",
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
          fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase",
          padding: "0.55rem 1.1rem",
          background: "rgba(255,255,255,0.08)",
          color: "rgba(220,230,240,0.85)",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: "4px", cursor: "pointer", zIndex: 10000,
          backdropFilter: "blur(4px)",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={e => {
          (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.14)";
          (e.target as HTMLButtonElement).style.color = "#ffffff";
        }}
        onMouseLeave={e => {
          (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
          (e.target as HTMLButtonElement).style.color = "rgba(220,230,240,0.85)";
        }}
      >
        ✕ Exit
      </button>

      {/* ── STEP 1: VIEWFINDER ── */}
      {phase === "viewfinder" && (
        <ViewfinderScreen
          onStart={() => setPhase("front-countdown")}
        />
      )}

      {/* ── STEP 2: FRONT COUNTDOWN ── */}
      {phase === "front-countdown" && (
        <CountdownScreen
          side="FRONT"
          count={countdown}
          label="Hold steady — capturing front"
        />
      )}

      {/* ── FRONT FLASH ── */}
      {phase === "front-flash" && (
        <FlashScreen label="Front captured" />
      )}

      {/* ── STEP 3: FLIP PROMPT ── */}
      {phase === "flip-prompt" && (
        <FlipScreen count={flipCountdown} />
      )}

      {/* ── BACK FLASH + AI DETECTING ── */}
      {phase === "back-flash" && (
        autoDetecting ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.22em", color: `${GOLD}80`, textTransform: "uppercase", marginBottom: "1.5rem" }}>
              Diamond Index™
            </div>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem", animation: "pulse 1.2s ease-in-out infinite" }}>&#9670;</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
              Reading Card Data…
            </div>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", color: "rgba(148,163,184,0.45)" }}>
              Auto-detecting player, set, year &amp; card number
            </div>
            <style>{`@keyframes pulse { 0%,100%{opacity:0.4;transform:scale(0.9)} 50%{opacity:1;transform:scale(1.1)} }`}</style>
          </div>
        ) : (
          <FlashScreen label="Back captured" />
        )
      )}

      {/* ── STEP 4: CONFIRMATION ── */}
      {phase === "confirmation" && (
        <ConfirmationScreen
          front={result.frontImage}
          back={result.backImage}
          onUse={() => setPhase("analysis")}
          onRetake={() => setPhase("viewfinder")}
        />
      )}

      {/* ── STEP 5: ANALYSIS ── */}
      {phase === "analysis" && (
        <AnalysisScreen revealed={analysisRevealed} />
      )}

      {/* ── STEP 6: GRADE REVEAL ── */}
      {phase === "grades" && (
        <GradeRevealScreen
          result={result}
          scoreCount={scoreCount}
          visible={gradesVisible}
        />
      )}

      {/* ── STEP 7: ACTION ── */}
      {phase === "action" && (
        <ActionScreen
          result={result}
          cardName={cardName}
          cardSet={cardSet}
          onAccept={() => setPhase("vault-save")}
          onRegrade={() => setShowRegradeModal(true)}
          onExit={onExit}
        />
      )}

      {/* ── RE-GRADE PAYMENT MODAL ── */}
      {showRegradeModal && (
        <RegradeModal
          cardName={cardName}
          cardSet={cardSet}
          loading={createReGradeSession.isPending}
          onConfirm={async () => {
            try {
              const { url } = await createReGradeSession.mutateAsync({
                origin: window.location.origin,
                cardName: cardName || undefined,
                cardSet: cardSet || undefined,
              });
              window.open(url, "_blank");
              setShowRegradeModal(false);
            } catch {
              // error handled by trpc
            }
          }}
          onCancel={() => setShowRegradeModal(false)}
        />
      )}

      {/* ── STEP 8: VAULT SAVE ── */}
      {phase === "vault-save" && (
        <VaultSaveScreen saved={vaultSaved} />
      )}

      {/* ── STEP 9: PARTNER REFERRAL ── */}
      {phase === "partner-referral" && (
        <PartnerReferralScreen
          result={result}
          certId={savedCertId}
          sent={partnerSent}
          onSend={() => {
            setPartnerSent(true);
            if (savedCardId) updateStatusMutation.mutate({ id: savedCardId, status: "sent_to_partner" });
          }}
          onSlab={() => setPhase("slab-order")}
          onDone={() => onAccepted(result)}
        />
      )}
      {/* ── STEP 10: SLAB ORDER ── */}
      {phase === "slab-order" && (
        <SlabOrderScreen
          result={result}
          certId={savedCertId}
          ordered={slabOrdered}
          onOrder={() => {
            setSlabOrdered(true);
            if (savedCardId) updateStatusMutation.mutate({ id: savedCardId, status: "slab_ordered" });
          }}
          onDone={() => onAccepted(result)}
        />
      )}

    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SUB-SCREENS
// ────────────────────────────────────────────────────────────────────────────

function ViewfinderScreen({ onStart }: {
  onStart: () => void;
}) {
  return (
    <div style={{ width: "100%", maxWidth: "380px", padding: "3rem 1.5rem 1.25rem", textAlign: "center" }}>
      {/* Header */}
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.7rem", letterSpacing: "0.22em", color: GOLD, textTransform: "uppercase", marginBottom: "0.75rem" }}>
        Diamond Index™ — Card Scan
      </div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.6rem", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "1.25rem", textShadow: "0 0 20px rgba(255,255,255,0.15)" }}>
        Align Card Within Frame
      </div>

      {/* Viewfinder */}
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: "240px",
        margin: "0 auto 1.25rem",
        aspectRatio: "2.5/3.5",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.22)",
        borderRadius: "8px",
        overflow: "hidden",
      }}>
        {/* Corner brackets */}
        {[
          { top: "10px", left: "10px", borderTop: `2px solid ${GOLD}ee`, borderLeft: `2px solid ${GOLD}ee` },
          { top: "10px", right: "10px", borderTop: `2px solid ${GOLD}ee`, borderRight: `2px solid ${GOLD}ee` },
          { bottom: "10px", left: "10px", borderBottom: `2px solid ${GOLD}ee`, borderLeft: `2px solid ${GOLD}ee` },
          { bottom: "10px", right: "10px", borderBottom: `2px solid ${GOLD}ee`, borderRight: `2px solid ${GOLD}ee` },
        ].map((s, i) => (
          <div key={i} style={{ position: "absolute", width: "24px", height: "24px", ...s }} />
        ))}
        {/* Ghost card outline */}
        <div style={{
          position: "absolute", inset: "20px",
          border: "1px dashed rgba(255,255,255,0.35)",
          borderRadius: "4px",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", color: "rgba(200,215,230,0.75)", textAlign: "center", lineHeight: 1.6 }}>
            Place card face-up<br />within this area
          </div>
        </div>
        {/* Scanning line animation */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: "1px",
          background: `linear-gradient(90deg, transparent 0%, ${GOLD}cc 50%, transparent 100%)`,
          animation: "scanLine 2.5s ease-in-out infinite",
          top: "50%",
        }} />
      </div>

      <style>{`
        @keyframes scanLine {
          0%   { top: 20%; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 80%; opacity: 0; }
        }
      `}</style>

      {/* AI auto-detects all card info from back image — no manual input needed */}
      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", color: GOLD, marginBottom: "1rem", letterSpacing: "0.04em", opacity: 0.8 }}>
        ◆ Card info auto-detected from back image
      </div>

      <button
        onClick={onStart}
        style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
          fontSize: "0.82rem", letterSpacing: "0.14em", textTransform: "uppercase",
          padding: "1rem 3rem", background: GOLD, color: DARK,
          border: "none", borderRadius: "4px", cursor: "pointer", width: "100%",
        }}
      >
        Start Capture
      </button>
      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.7rem", color: "rgba(180,195,215,0.65)", marginTop: "0.6rem" }}>
        Front and back will be captured automatically
      </div>
    </div>
  );
}

function CountdownScreen({ side, count, label }: { side: string; count: number; label: string }) {
  return (
    <div style={{ width: "100%", maxWidth: "380px", padding: "3rem 1.5rem 1.25rem", textAlign: "center" }}>
      {/* Header */}
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.7rem", letterSpacing: "0.22em", color: GOLD, textTransform: "uppercase", marginBottom: "0.75rem" }}>
        Diamond Index™ — Card Scan
      </div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "1rem" }}>
        Capturing — {side}
      </div>
      {/* Card frame with countdown overlay in corner */}
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: "240px",
        margin: "0 auto 1.25rem",
        aspectRatio: "2.5/3.5",
        background: "rgba(255,255,255,0.08)",
        border: `1px solid ${GOLD}60`,
        borderRadius: "8px",
        overflow: "hidden",
      }}>
        {/* Corner brackets */}
        {[
          { top: "10px", left: "10px", borderTop: `2px solid ${GOLD}ee`, borderLeft: `2px solid ${GOLD}ee` },
          { top: "10px", right: "10px", borderTop: `2px solid ${GOLD}ee`, borderRight: `2px solid ${GOLD}ee` },
          { bottom: "10px", left: "10px", borderBottom: `2px solid ${GOLD}ee`, borderLeft: `2px solid ${GOLD}ee` },
          { bottom: "10px", right: "10px", borderBottom: `2px solid ${GOLD}ee`, borderRight: `2px solid ${GOLD}ee` },
        ].map((s, i) => (
          <div key={i} style={{ position: "absolute", width: "24px", height: "24px", ...s }} />
        ))}
        {/* Ghost card outline */}
        <div style={{
          position: "absolute", inset: "20px",
          border: "1px dashed rgba(255,255,255,0.35)",
          borderRadius: "4px",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", color: "rgba(200,215,230,0.75)", textAlign: "center", lineHeight: 1.6 }}>
            Hold steady
          </div>
        </div>
        {/* Scanning line */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: "1px",
          background: `linear-gradient(90deg, transparent 0%, ${GOLD}cc 50%, transparent 100%)`,
          animation: "scanLine 2.5s ease-in-out infinite",
          top: "50%",
        }} />
        {/* Countdown number — top-right corner overlay */}
        <div style={{
          position: "absolute",
          top: "8px",
          right: "10px",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900,
          fontSize: "2.2rem",
          color: GOLD,
          lineHeight: 1,
          textShadow: `0 0 16px ${GOLD}80`,
          transition: "all 0.6s ease",
          zIndex: 10,
        }}>
          {count}
        </div>
      </div>
      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.78rem", color: "rgba(148,163,184,0.6)" }}>
        {label}
      </div>
    </div>
  );
}

function FlashScreen({ label }: { label: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "rgba(255,255,255,0.15)",
        animation: "flashFade 0.8s ease forwards",
      }} />
      <style>{`@keyframes flashFade { 0% { opacity: 1; } 100% { opacity: 0; } }`}</style>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#ffffff", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        ✓ {label}
      </div>
    </div>
  );
}

function FlipScreen({ count }: { count: number }) {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      {/* Big flip instruction */}
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
        fontSize: "clamp(2rem, 6vw, 3.5rem)", color: "#ffffff",
        textTransform: "uppercase", letterSpacing: "0.04em",
        marginBottom: "0.5rem",
      }}>
        Flip Card Over
      </div>
      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.82rem", color: "rgba(148,163,184,0.55)", marginBottom: "2.5rem" }}>
        This helps ensure accurate grading
      </div>

      {/* Countdown ring */}
      <div style={{
        width: "120px", height: "120px", borderRadius: "50%",
        border: `3px solid ${GOLD}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 2rem",
        boxShadow: `0 0 24px ${GOLD}20`,
        position: "relative",
      }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
          fontSize: "3.5rem", color: GOLD, lineHeight: 1,
        }}>{count}</div>
      </div>

      {/* Ghost card outline */}
      <div style={{
        width: "160px", height: "224px", margin: "0 auto",
        border: `1px dashed ${GOLD}30`,
        borderRadius: "6px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.65rem", color: "rgba(148,163,184,0.3)", textAlign: "center", lineHeight: 1.6 }}>
          Align back<br />of card here
        </div>
      </div>

      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", color: "rgba(100,116,139,0.45)", marginTop: "1.5rem" }}>
        Back will be captured automatically
      </div>
    </div>
  );
}

function ConfirmationScreen({
  front, back, onUse, onRetake,
}: { front: string; back: string; onUse: () => void; onRetake: () => void }) {
  return (
    <div style={{ width: "100%", maxWidth: "520px", padding: "2rem", textAlign: "center" }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.22em", color: `${GOLD}80`, textTransform: "uppercase", marginBottom: "0.5rem" }}>
        Review Your Scans
      </div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "2rem" }}>
        Confirm Both Images
      </div>

      {/* Front + Back thumbnails */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "FRONT", src: front },
          { label: "BACK",  src: back  },
        ].map(img => (
          <div key={img.label}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.18em", color: "rgba(148,163,184,0.5)", textTransform: "uppercase", marginBottom: "0.4rem" }}>{img.label}</div>
            <div style={{
              aspectRatio: "2.5/3.5",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px", overflow: "hidden",
            }}>
              <img src={img.src} alt={img.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <button
        onClick={onUse}
        style={{
          width: "100%", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
          fontSize: "0.82rem", letterSpacing: "0.14em", textTransform: "uppercase",
          padding: "1rem", background: GOLD, color: DARK,
          border: "none", borderRadius: "4px", cursor: "pointer", marginBottom: "0.75rem",
        }}
      >
        Use These Photos
      </button>
      <button
        onClick={onRetake}
        style={{
          width: "100%", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
          fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase",
          padding: "0.85rem", background: "transparent", color: "rgba(148,163,184,0.65)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", cursor: "pointer",
        }}
      >
        Retake
      </button>
    </div>
  );
}

function AnalysisScreen({ revealed }: { revealed: Set<string> }) {
  return (
    <div style={{ width: "100%", maxWidth: "480px", padding: "2rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.22em", color: `${GOLD}80`, textTransform: "uppercase", marginBottom: "0.5rem" }}>
          Diamond Index™
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.6rem", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Analyzing Your Card…
        </div>
      </div>

      {/* Light bar sweep */}
      <div style={{
        width: "100%", height: "3px", background: "rgba(255,255,255,0.04)",
        borderRadius: "2px", overflow: "hidden", marginBottom: "2rem",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, height: "100%",
          background: `linear-gradient(90deg, transparent 0%, ${GOLD} 50%, transparent 100%)`,
          width: "40%",
          animation: "lightBar 3.8s ease-in-out infinite",
        }} />
      </div>
      <style>{`
        @keyframes lightBar {
          0%   { left: -40%; opacity: 0.4; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { left: 140%; opacity: 0.4; }
        }
      `}</style>

      {/* Analysis steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {ANALYSIS_STEPS.map(s => {
          const done = revealed.has(s.key);
          return (
            <div key={s.key} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.75rem 1rem",
              background: done ? "rgba(99,155,255,0.06)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${done ? "rgba(99,155,255,0.2)" : "rgba(255,255,255,0.05)"}`,
              borderRadius: "4px",
              transition: "all 0.4s ease",
              opacity: done ? 1 : 0.35,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: done ? BLUE : "rgba(255,255,255,0.15)",
                  boxShadow: done ? `0 0 8px ${BLUE}` : "none",
                  transition: "all 0.4s ease",
                }} />
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.1em", color: done ? "#ffffff" : "rgba(148,163,184,0.4)", textTransform: "uppercase" }}>
                  {s.label}
                </span>
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.65rem", color: "rgba(100,116,139,0.4)" }}>{s.weight}</span>
              </div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.12em", color: done ? BLUE : "rgba(100,116,139,0.3)", textTransform: "uppercase" }}>
                {done ? "✓ Done" : "—"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GradeRevealScreen({ result, scoreCount, visible }: { result: CaptureResult; scoreCount: number; visible: boolean }) {
  return (
    <div style={{ width: "100%", maxWidth: "380px", padding: "1.25rem 1.5rem", textAlign: "center" }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.22em", color: `${GOLD}80`, textTransform: "uppercase", marginBottom: "1.5rem" }}>
        Grade Complete
      </div>

      {/* Score */}
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
        fontSize: "5rem", color: "#ffffff", lineHeight: 1,
        opacity: visible ? 1 : 0, transition: "opacity 0.6s ease",
        textShadow: `0 0 40px rgba(201,168,76,0.4)`,
      }}>
        {scoreCount.toFixed(1)}
        <span style={{ fontSize: "2rem", color: "rgba(148,163,184,0.5)" }}>%</span>
      </div>

      {/* Diamonds */}
      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", margin: "1.25rem 0", opacity: visible ? 1 : 0, transition: "opacity 0.6s ease 0.3s" }}>
        {Array.from({ length: result.diamonds }).map((_, i) => (
          <img key={i} src="/manus-storage/diamond-blue-sm_46bffbe0.png" width="36" height="36" alt="diamond"
            style={{ filter: `drop-shadow(0 0 8px rgba(130,210,255,0.8)) brightness(1.2)` }} />
        ))}
      </div>

      {/* Tier */}
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
        fontSize: "0.7rem", letterSpacing: "0.28em", color: tierColor(result.tier),
        textTransform: "uppercase", marginBottom: "0.5rem",
        opacity: visible ? 1 : 0, transition: "opacity 0.6s ease 0.5s",
      }}>
        ◆ {result.tier} GRADE ◆
      </div>

      {/* Category scores */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "1.5rem", opacity: visible ? 1 : 0, transition: "opacity 0.6s ease 0.7s" }}>
        {result.categories.map(c => (
          <div key={c.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.75rem", background: "rgba(255,255,255,0.025)", borderRadius: "3px" }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.08em", color: "rgba(148,163,184,0.7)", textTransform: "uppercase" }}>{c.name}</span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "0.85rem", color: "#ffffff" }}>{c.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionScreen({ result, cardName, cardSet, onAccept, onRegrade, onExit }: {
  result: CaptureResult;
  cardName?: string;
  cardSet?: string;
  onAccept: () => void;
  onRegrade: () => void;
  onExit: () => void;
}) {
  const [emailClicked, setEmailClicked] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    setEmailClicked(true);
    setTimeout(() => setEmailClicked(false), 3000);
  };

  return (
    <div style={{ width: "100%", maxWidth: "460px", padding: "2rem 1.5rem", overflowY: "auto", maxHeight: "90vh" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.22em", color: `${GOLD}80`, textTransform: "uppercase", marginBottom: "0.4rem" }}>
          Diamond Index™ — Grade Complete
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "3rem", color: "#ffffff", lineHeight: 1, marginBottom: "0.2rem" }}>
          {result.score}%
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "0.35rem", marginBottom: "0.4rem" }}>
          {Array.from({ length: result.diamonds }).map((_, i) => (
            <img key={i} src="/manus-storage/diamond-blue-sm_46bffbe0.png" width="24" height="24" alt="diamond"
              style={{ filter: `drop-shadow(0 0 6px rgba(130,210,255,0.7))` }} />
          ))}
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.24em", color: tierColor(result.tier), textTransform: "uppercase" }}>
          ◆ {result.tier} GRADE ◆
        </div>
      </div>

      {/* Orange divider */}
      <div style={{ width: "100%", height: "1px", background: `linear-gradient(90deg, transparent, #d97706, transparent)`, marginBottom: "1.5rem" }} />

      {/* Results delivery */}
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(148,163,184,0.45)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
        Your Detailed Report
      </div>
      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.78rem", color: "rgba(148,163,184,0.6)", lineHeight: 1.6, marginBottom: "1rem" }}>
        Your full grade report — card photos, score breakdown, and label download instructions — will be emailed to you automatically. You can also print it now.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "1.5rem" }}>
        <button
          onClick={handlePrint}
          style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
            fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase",
            padding: "0.85rem", background: "rgba(255,255,255,0.05)",
            color: "#ffffff", border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "4px", cursor: "pointer",
          }}
        >
          Print Results
        </button>
        <button
          onClick={handleEmail}
          style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
            fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase",
            padding: "0.85rem",
            background: emailClicked ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.05)",
            color: emailClicked ? "#4ade80" : "#ffffff",
            border: emailClicked ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(255,255,255,0.15)",
            borderRadius: "4px", cursor: "pointer", transition: "all 0.3s ease",
          }}
        >
          {emailClicked ? "✓ Email Sent" : "Email Results"}
        </button>
      </div>

      {/* Orange divider */}
      <div style={{ width: "100%", height: "1px", background: `linear-gradient(90deg, transparent, #d97706, transparent)`, marginBottom: "1.5rem" }} />

      {/* Slab fulfillment options */}
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(148,163,184,0.45)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
        Physical Certification Options
      </div>

      {/* Option 1: DIY Label */}
      <div style={{
        padding: "1rem", background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", marginBottom: "0.6rem",
        textAlign: "left",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.35rem" }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "0.82rem", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Print Your Own Label
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: GOLD }}>Included</div>
        </div>
        <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", color: "rgba(148,163,184,0.55)", lineHeight: 1.5 }}>
          Download and print your certified label at home. Included with your grading package.
        </div>
      </div>

      {/* Option 2: Ship Label + Slab */}
      <div style={{
        padding: "1rem", background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", marginBottom: "0.6rem",
        textAlign: "left",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.35rem" }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "0.82rem", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Ship Me a Label + Slab
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: GOLD }}>$14.99</div>
        </div>
        <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", color: "rgba(148,163,184,0.55)", lineHeight: 1.5 }}>
          We ship you a pre-printed label and protective slab with your Cert ID + QR code. You place the card and seal it yourself.
        </div>
      </div>

      {/* Option 3: Mail to SportCardsOnline */}
      <div style={{
        padding: "1rem", background: "rgba(99,155,255,0.04)",
        border: `1px solid ${BLUE}30`, borderRadius: "6px", marginBottom: "1.5rem",
        textAlign: "left",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.35rem" }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "0.82rem", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Full Assembly by a Master Grader
            </div>
            <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.62rem", color: BLUE, marginTop: "0.15rem", lineHeight: 1.5 }}>
              Closest to you: SportCardsOnline.com<br />
              Att: A.G. US INFO / D. Index<br />
              735 Taylor Rd, Suite 201, Columbus, Ohio 43230
            </div>
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: GOLD }}>$19.90</div>
        </div>
        <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", color: "rgba(148,163,184,0.55)", lineHeight: 1.5 }}>
          Mail your card with a prepaid return envelope. A certified Master Grader assembles the slab and ships it back to you same day.
        </div>
      </div>

      {/* Orange divider */}
      <div style={{ width: "100%", height: "1px", background: `linear-gradient(90deg, transparent, #d97706, transparent)`, marginBottom: "1.5rem" }} />

      {/* ACCEPT — primary */}
      <button
        onClick={onAccept}
        style={{
          width: "100%", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
          fontSize: "0.85rem", letterSpacing: "0.14em", textTransform: "uppercase",
          padding: "1.1rem", background: GOLD, color: DARK,
          border: "none", borderRadius: "4px", cursor: "pointer", marginBottom: "0.75rem",
        }}
      >
        Save to My Vault ◆
      </button>

      {/* RE-GRADE — secondary */}
      <button
        onClick={onRegrade}
        style={{
          width: "100%", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
          fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase",
          padding: "0.9rem", background: "transparent", color: "rgba(148,163,184,0.55)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", cursor: "pointer", marginBottom: "0.6rem",
        }}
      >
        Re-Grade (New Submission)
      </button>

      {/* EXIT */}
      <button
        onClick={onExit}
        style={{
          width: "100%", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600,
          fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase",
          padding: "0.65rem", background: "transparent", color: "rgba(100,116,139,0.4)",
          border: "none", cursor: "pointer",
        }}
      >
        Exit Without Saving
      </button>
    </div>
  );
}

function VaultSaveScreen({ saved }: { saved: boolean }) {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      {/* Animated save indicator */}
      <div style={{
        width: "80px", height: "80px", borderRadius: "50%",
        border: `2px solid ${saved ? GOLD : "rgba(255,255,255,0.1)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 1.5rem",
        boxShadow: saved ? `0 0 32px ${GOLD}40` : "none",
        transition: "all 0.5s ease",
      }}>
        {saved
          ? <span style={{ fontSize: "2rem", color: GOLD }}>✓</span>
          : <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: `2px solid ${GOLD}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        }
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.5rem" }}>
        {saved ? "Saved to My Vault" : "Saving…"}
      </div>
      {saved && (
        <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.82rem", color: "rgba(148,163,184,0.6)", lineHeight: 1.6 }}>
          Your certified report is now saved.<br />Front, back, and grade report attached.
        </div>
      )}
    </div>
  );
}

// ── PARTNER REFERRAL SCREEN ──────────────────────────────────────────────────
function PartnerReferralScreen({ result, certId, sent, onSend, onSlab, onDone }: {
  result: CaptureResult;
  certId: string | null;
  sent: boolean;
  onSend: () => void;
  onSlab: () => void;
  onDone: () => void;
}) {
  const diamonds = "◆".repeat(result.diamonds) + "◇".repeat(5 - result.diamonds);
  return (
    <div style={{ width: "100%", maxWidth: "480px", padding: "2rem", textAlign: "center" }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.6rem", letterSpacing: "0.22em", color: `${GOLD}80`, textTransform: "uppercase", marginBottom: "0.75rem" }}>
        Diamond Index™ — Certified
      </div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.5rem", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.5rem" }}>
        Connect With a<br />Master Grader
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", margin: "1.2rem 0", padding: "1rem", background: "rgba(255,255,255,0.04)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)" }}>
        {result.frontImage && (
          <img src={result.frontImage} alt="card" style={{ width: "56px", height: "78px", objectFit: "cover", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.15)" }} />
        )}
        <div style={{ textAlign: "left" }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: tierColor(result.tier), textTransform: "uppercase" }}>{result.tier}</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "1.4rem", color: "#ffffff" }}>{result.score.toFixed(1)}</div>
          <div style={{ fontSize: "0.9rem", color: GOLD, letterSpacing: "0.1em" }}>{diamonds}</div>
          {certId && <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.65rem", color: "rgba(148,163,184,0.5)", marginTop: "0.25rem" }}>{certId}</div>}
        </div>
      </div>
      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.82rem", color: "rgba(148,163,184,0.6)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
        We will send your certified card data to a verified<br />
        <strong style={{ color: "rgba(148,163,184,0.85)" }}>Diamond Index™ partner</strong> who can help sell your card.
      </div>
      <div style={{ width: "100%", height: "1px", background: `linear-gradient(90deg, transparent, #d97706, transparent)`, marginBottom: "1.5rem" }} />
      {!sent ? (
        <>
          <button
            onClick={onSend}
            style={{ width: "100%", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.14em", textTransform: "uppercase", padding: "1.1rem", background: GOLD, color: "#000000", border: "none", borderRadius: "4px", cursor: "pointer", marginBottom: "0.75rem" }}
          >
            Send My Card Data
          </button>
          <button
            onClick={onSlab}
            style={{ width: "100%", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.9rem", background: "transparent", color: BLUE, border: `1px solid ${BLUE}40`, borderRadius: "4px", cursor: "pointer", marginBottom: "0.75rem" }}
          >
            Order Slab / Label →
          </button>
          <button
            onClick={onDone}
            style={{ width: "100%", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.75rem", background: "transparent", color: "rgba(148,163,184,0.45)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "4px", cursor: "pointer" }}
          >
            Go to My Vault
          </button>
        </>
      ) : (
        <>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>
            ✓ Card Data Sent to Partner
          </div>
          <button
            onClick={onDone}
            style={{ width: "100%", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.9rem", background: "transparent", color: "rgba(148,163,184,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", cursor: "pointer" }}
          >
            Go to My Vault
          </button>
        </>
      )}
    </div>
  );
}

// ── SLAB ORDER SCREEN ─────────────────────────────────────────────────────────
function SlabOrderScreen({ result, certId, ordered, onOrder, onDone }: {
  result: CaptureResult;
  certId: string | null;
  ordered: boolean;
  onOrder: () => void;
  onDone: () => void;
}) {
  return (
    <div style={{ width: "100%", maxWidth: "480px", padding: "2rem", textAlign: "center" }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.6rem", letterSpacing: "0.22em", color: `${GOLD}80`, textTransform: "uppercase", marginBottom: "0.75rem" }}>
        Diamond Index™ — Physical Certification
      </div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.5rem", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.5rem" }}>
        Order Slab / Label
      </div>
      <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.82rem", color: "rgba(148,163,184,0.6)", lineHeight: 1.7, marginBottom: "1.2rem" }}>
        Receive a physical graded label and protective slab<br />with your <strong style={{ color: "rgba(148,163,184,0.85)" }}>Certification ID</strong> and QR code printed on it.
      </div>
      {certId && (
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: GOLD, letterSpacing: "0.12em", marginBottom: "1.2rem" }}>
          {certId}
        </div>
      )}
      <div style={{ width: "100%", height: "1px", background: `linear-gradient(90deg, transparent, #d97706, transparent)`, marginBottom: "1.5rem" }} />
      {!ordered ? (
        <>
          <button
            onClick={onOrder}
            style={{ width: "100%", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.14em", textTransform: "uppercase", padding: "1.1rem", background: BLUE, color: "#ffffff", border: "none", borderRadius: "4px", cursor: "pointer", marginBottom: "0.75rem" }}
          >
            Order My Slab
          </button>
          <button
            onClick={onDone}
            style={{ width: "100%", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.75rem", background: "transparent", color: "rgba(148,163,184,0.45)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "4px", cursor: "pointer" }}
          >
            Not Now — Go to My Vault
          </button>
        </>
      ) : (
        <>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>
            ✓ Slab Ordered
          </div>
          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.78rem", color: "rgba(148,163,184,0.55)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
            We'll be in touch with shipping details.
          </div>
          <button
            onClick={onDone}
            style={{ width: "100%", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.9rem", background: "transparent", color: "rgba(148,163,184,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", cursor: "pointer" }}
          >
            Go to My Vault
          </button>
        </>
      )}
    </div>
  );
}

// ── RE-GRADE PAYMENT MODAL ─────────────────────────────────────────────────
function RegradeModal({ cardName, cardSet, loading, onConfirm, onCancel }: {
  cardName?: string;
  cardSet?: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cardLabel = [cardName, cardSet].filter(Boolean).join(" · ") || "this card";
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 50,
      background: "rgba(7,13,26,0.92)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: "100%", maxWidth: "400px", margin: "1.5rem",
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "8px", padding: "2rem", textAlign: "center",
      }}>
        {/* Icon */}
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>◆</div>

        {/* Title */}
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
          fontSize: "1.4rem", color: "#ffffff", textTransform: "uppercase",
          letterSpacing: "0.06em", marginBottom: "0.5rem",
        }}>
          Re-Grade Submission
        </div>

        {/* Card label */}
        <div style={{
          fontFamily: "'Barlow', sans-serif", fontSize: "0.82rem",
          color: "rgba(148,163,184,0.6)", marginBottom: "1.5rem", lineHeight: 1.6,
        }}>
          {cardLabel}
        </div>

        {/* Orange divider */}
        <div style={{ width: "100%", height: "1px", background: `linear-gradient(90deg, transparent, #d97706, transparent)`, marginBottom: "1.5rem" }} />

        {/* Fee */}
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
          fontSize: "2.2rem", color: GOLD, letterSpacing: "0.04em", marginBottom: "0.25rem",
        }}>
          $9.99
        </div>
        <div style={{
          fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem",
          color: "rgba(100,116,139,0.6)", marginBottom: "2rem",
        }}>
          Re-Grade Fee — One-time charge per submission
        </div>

        {/* Confirm */}
        <button
          onClick={onConfirm}
          disabled={loading}
          style={{
            width: "100%", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
            fontSize: "0.85rem", letterSpacing: "0.14em", textTransform: "uppercase",
            padding: "1.1rem", background: loading ? "rgba(201,168,76,0.4)" : GOLD,
            color: DARK, border: "none", borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer", marginBottom: "0.75rem",
            transition: "background 0.2s",
          }}
        >
          {loading ? "Redirecting to Checkout…" : "Confirm & Pay — $9.99"}
        </button>

        {/* Cancel */}
        <button
          onClick={onCancel}
          disabled={loading}
          style={{
            width: "100%", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600,
            fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase",
            padding: "0.8rem", background: "transparent",
            color: "rgba(100,116,139,0.5)",
            border: "1px solid rgba(255,255,255,0.07)", borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
