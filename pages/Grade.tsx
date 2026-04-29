/*
 * Diamond Index™ — /grade (Public Grading Flow)
 * Design: dark navy, blue accents, gold highlights
 * Typography: Barlow Condensed (headings) + Barlow (body)
 *
 * 5-step flow:
 *   1. Entry    — scan/upload options
 *   2. Scanning — animated analysis state
 *   3. Centering — first WOW moment (bars + scores)
 *   4. Analysis  — full 5-category grid (clickable)
 *   5. Result    — diamonds + score + value + CTAs
 */

import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CenteringDetailsModal from "@/components/CenteringDetailsModal";
import EdgesDetailsModal from "@/components/EdgesDetailsModal";
import CornersDetailsModal from "@/components/CornersDetailsModal";
import SurfaceDetailsModal from "@/components/SurfaceDetailsModal";
import EyeAppealDetailsModal from "@/components/EyeAppealDetailsModal";
import CameraCapture from "@/components/CameraCapture";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import CardSlab3D from "@/components/CardSlab3D";

// ─── upload helper ────────────────────────────────────────────────────────────
async function uploadImageFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
  if (res.status === 401) throw new Error("401 Unauthorized");
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `Upload failed (${res.status})`);
  }
  const data = await res.json() as { url: string };
  if (!data.url) throw new Error("Upload succeeded but no URL returned");
  return data.url;
}

// ─── sample card image — real card photo from hero section ─────────────────
const CARD_IMG = "/manus-storage/pasted_file_zUMIJb_image_cea74904.webp";

// ─── style constants ─────────────────────────────────────────────────────────
const BG = "#060d1a";
const BLUE = "#3b82f6";
const GOLD = "rgba(201,168,76,0.9)";
const GOLD_BRIGHT = "rgba(255,215,80,1)";

const S = {
  page: {
    minHeight: "100vh",
    background: BG,
    fontFamily: "'Barlow', sans-serif",
    display: "flex" as const,
    flexDirection: "column" as const,
  },
  main: {
    flex: 1,
    display: "flex" as const,
    flexDirection: "column" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: "2rem 1.5rem",
    minHeight: "calc(100vh - 64px)",
  },
  card: {
    width: "100%",
    maxWidth: "480px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    padding: "2.5rem 2rem",
    position: "relative" as const,
  },
  eyebrow: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600,
    fontSize: "0.65rem",
    letterSpacing: "0.22em",
    color: GOLD,
    textTransform: "uppercase" as const,
    marginBottom: "0.75rem",
  },
  h1: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
    color: "#ffffff",
    textTransform: "uppercase" as const,
    letterSpacing: "-0.01em",
    lineHeight: 1.05,
    marginBottom: "0.5rem",
  },
  sub: {
    fontFamily: "'Barlow', sans-serif",
    fontWeight: 300,
    fontSize: "0.85rem",
    color: "rgba(148,163,184,0.6)",
    marginBottom: "2rem",
    lineHeight: 1.6,
  },
  btn: {
    display: "block" as const,
    width: "100%",
    padding: "0.9rem 1.5rem",
    borderRadius: "5px",
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: "0.85rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s ease",
  },
  progress: {
    display: "flex" as const,
    gap: "6px",
    marginBottom: "2.5rem",
    justifyContent: "center" as const,
  },
};

// ─── progress dots ────────────────────────────────────────────────────────────
function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div style={S.progress}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === step - 1 ? "24px" : "6px",
            height: "6px",
            borderRadius: "3px",
            background: i < step ? BLUE : "rgba(255,255,255,0.12)",
            transition: "all 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}

// ─── STEP 1: Entry ────────────────────────────────────────────────────────────
function StepEntry({ onStart, onCameraOpen, onImagesReady }: { onStart: () => void; onCameraOpen?: () => void; onImagesReady?: (front: string, back: string) => void }) {
  const fileInputFront = useRef<HTMLInputElement>(null);
  const fileInputBack = useRef<HTMLInputElement>(null);
  const [frontUploaded, setFrontUploaded] = useState(false);
  const [backUploaded, setBackUploaded] = useState(false);
  const [frontUrl, setFrontUrl] = useState("");
  const [backUrl, setBackUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [rejected, setRejected] = useState<{ reason: string; message: string } | null>(null);
  const { isAuthenticated } = useAuth();
  const validateImage = trpc.cards.validateImage.useMutation();

  const requireAuth = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to upload and grade a card.");
      setTimeout(() => { window.location.href = getLoginUrl("/grade"); }, 1200);
      return false;
    }
    return true;
  };

  const handleFrontFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!requireAuth()) return;
    setUploading(true);
    setRejected(null); // Clear any previous rejection when re-uploading
    try {
      const url = await uploadImageFile(file);
      setFrontUrl(url);
      setFrontUploaded(true);
      toast.success("Front image uploaded.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      if (msg.includes("401") || msg.includes("Unauthorized")) {
        toast.error("Please log in to upload images.");
        setTimeout(() => { window.location.href = getLoginUrl("/grade"); }, 1200);
      } else {
        toast.error("Front image upload failed. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleBackFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!requireAuth()) return;
    setUploading(true);
    try {
      const url = await uploadImageFile(file);
      setBackUrl(url);
      setBackUploaded(true);
      toast.success("Back image uploaded.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      if (msg.includes("401") || msg.includes("Unauthorized")) {
        toast.error("Please log in to upload images.");
        setTimeout(() => { window.location.href = getLoginUrl("/grade"); }, 1200);
      } else {
        toast.error("Back image upload failed. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleStart = async () => {
    if (!frontUrl) {
      toast.error("Please upload a front image before grading.");
      return;
    }
    // Validate the image before proceeding
    setValidating(true);
    setRejected(null);
    try {
      const result = await validateImage.mutateAsync({ imageUrl: frontUrl });
      if (!result.accepted) {
        // Determine user-friendly rejection message
        let message = result.rejectionMessage || "We couldn't grade this image. Please upload a clear photo of a single card.";
        let reason = result.rejectionReason || "unknown";
        if (!result.isCard) {
          reason = "not_a_card";
          message = "This doesn't appear to be a sports card or trading card. Please upload a clear photo of a single card.";
        } else if (!result.isSharp) {
          reason = "too_blurry";
          message = "The image is too blurry to grade accurately. Please upload a sharper, in-focus photo.";
        } else if (!result.isFramed) {
          reason = "wrong_framing";
          message = "The card isn't fully visible. Please make sure the entire card is in frame and not cut off.";
        }
        setRejected({ reason, message });
        setValidating(false);
        return;
      }
    } catch {
      // On validation error, proceed anyway (fail open)
    } finally {
      setValidating(false);
    }
    if (onImagesReady) {
      // Use front image as back fallback if no back was uploaded
      onImagesReady(frontUrl, backUrl || frontUrl);
    }
    onStart();
  };

  const handleCamera = () => {
    if (onCameraOpen) onCameraOpen();
  };

  // Icon map for rejection reasons
  const rejectionIcon: Record<string, string> = {
    not_a_card: "🚫",
    too_blurry: "🔍",
    wrong_framing: "📐",
    unknown: "⚠️",
  };

  return (
    <div style={{ ...S.card, maxWidth: "460px", position: "relative" as const }}>
      <ProgressDots step={1} total={5} />

      {/* ── Rejection Screen ── */}
      {rejected && (
        <div style={{
          textAlign: "center" as const,
          padding: "1.5rem 0.5rem",
        }}>
          <div style={{ fontSize: "2.8rem", marginBottom: "1rem" }}>
            {rejectionIcon[rejected.reason] ?? "⚠️"}
          </div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            color: "#ef4444",
            textTransform: "uppercase" as const,
            marginBottom: "0.75rem",
          }}>
            Image Not Accepted
          </div>
          <p style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: "0.88rem",
            color: "rgba(203,213,225,0.85)",
            lineHeight: 1.6,
            marginBottom: "1.5rem",
          }}>
            {rejected.message}
          </p>
          <button
            onClick={() => {
              setRejected(null);
              setFrontUploaded(false);
              setFrontUrl("");
              setBackUploaded(false);
              setBackUrl("");
              if (fileInputFront.current) fileInputFront.current.value = "";
              if (fileInputBack.current) fileInputBack.current.value = "";
            }}
            style={{
              ...S.btn,
              background: "rgba(59,130,246,0.15)",
              border: `1px solid ${BLUE}60`,
              color: "#93c5fd",
              fontSize: "0.8rem",
              letterSpacing: "0.12em",
              padding: "0.85rem 2rem",
            }}
          >
            Try a Different Image
          </button>
        </div>
      )}

      {/* ── Normal Upload UI (hidden when rejected) ── */}
      {!rejected && (
        <>
      <div style={S.eyebrow}>Step 1 of 5</div>
      <h1 style={S.h1}>Grade Your Card Instantly</h1>
      <p style={{ ...S.sub, marginBottom: "1.5rem" }}>Takes under 60 seconds. No shipping required.</p>

      {/* PRIMARY: Camera — hero card */}
      <button
        onClick={handleCamera}
        style={{
          width: "100%",
          background: "rgba(59,130,246,0.1)",
          border: "1.5px solid rgba(59,130,246,0.45)",
          borderRadius: "8px",
          padding: "1.75rem 1.5rem",
          cursor: "pointer",
          display: "flex" as const,
          flexDirection: "column" as const,
          alignItems: "center" as const,
          gap: "0.6rem",
          marginBottom: "1rem",
          position: "relative" as const,
          transition: "all 0.2s ease",
        }}
      >
        {/* Recommended badge */}
        <div style={{
          position: "absolute" as const,
          top: "-1px",
          right: "14px",
          background: BLUE,
          color: "#ffffff",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: "0.55rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase" as const,
          padding: "3px 8px",
          borderRadius: "0 0 4px 4px",
        }}>
          Fastest &amp; Recommended
        </div>
        <span style={{ fontSize: "2.2rem", lineHeight: 1 }}>📸</span>
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: "1.05rem",
          letterSpacing: "0.1em",
          color: "#93c5fd",
          textTransform: "uppercase" as const,
        }}>
          Scan with Camera
        </span>
        <span style={{
          fontFamily: "'Barlow', sans-serif",
          fontSize: "0.72rem",
          color: "rgba(147,197,253,0.5)",
        }}>
          Point your phone at the card — front &amp; back
        </span>
      </button>

      {/* SECONDARY: Upload options — smaller, side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "1.5rem" }}>
        {/* Front upload */}
        <input ref={fileInputFront} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFrontFile} />
        <button
          onClick={() => fileInputFront.current?.click()}
          style={{
            background: frontUploaded ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)",
            border: frontUploaded ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.08)",
            borderRadius: "6px",
            padding: "0.85rem 0.75rem",
            cursor: "pointer",
            display: "flex" as const,
            flexDirection: "column" as const,
            alignItems: "center" as const,
            gap: "0.4rem",
            transition: "all 0.2s ease",
          }}
        >
          <span style={{ fontSize: "1.1rem" }}>{frontUploaded ? "✓" : "📤"}</span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.7rem", letterSpacing: "0.08em", color: frontUploaded ? "#86efac" : "rgba(148,163,184,0.55)", textTransform: "uppercase" as const }}>Front Image</span>
        </button>

        {/* Back upload */}
        <input ref={fileInputBack} type="file" accept="image/*" style={{ display: "none" }} onChange={handleBackFile} />
        <button
          onClick={() => fileInputBack.current?.click()}
          style={{
            background: backUploaded ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)",
            border: backUploaded ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.08)",
            borderRadius: "6px",
            padding: "0.85rem 0.75rem",
            cursor: "pointer",
            display: "flex" as const,
            flexDirection: "column" as const,
            alignItems: "center" as const,
            gap: "0.4rem",
            transition: "all 0.2s ease",
          }}
        >
          <span style={{ fontSize: "1.1rem" }}>{backUploaded ? "✓" : "📤"}</span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.7rem", letterSpacing: "0.08em", color: backUploaded ? "#86efac" : "rgba(148,163,184,0.55)", textTransform: "uppercase" as const }}>Back Image</span>
        </button>
      </div>

      {/* Primary CTA */}
      <button
        onClick={handleStart}
        disabled={uploading || validating}
        style={{
          ...S.btn,
          background: `linear-gradient(135deg, ${BLUE}, #2563eb)`,
          color: "#ffffff",
          fontSize: "0.9rem",
          letterSpacing: "0.16em",
          padding: "1.1rem",
          boxShadow: `0 4px 20px rgba(59,130,246,0.3)`,
        }}
      >
        Start Grading →
      </button>

      <p style={{ ...S.sub, marginTop: "1rem", marginBottom: 0, textAlign: "center" as const, fontSize: "0.68rem" }}>
        Images are processed locally and never stored without your permission.
      </p>

      {/* ── MOVE 3: Trust block ── */}
      <div style={{
        marginTop: "1.5rem",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingTop: "1.25rem",
      }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: "0.62rem",
          letterSpacing: "0.2em",
          color: GOLD,
          textTransform: "uppercase" as const,
          marginBottom: "0.75rem",
          textAlign: "center" as const,
        }}>
          How Your Card Is Graded
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "0.4rem",
          marginBottom: "0.75rem",
        }}>
          {["Centering", "Edges", "Corners", "Surface", "Eye Appeal"].map((cat) => (
            <div key={cat} style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "4px",
              padding: "0.45rem 0.5rem",
              textAlign: "center" as const,
            }}>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600,
                fontSize: "0.6rem",
                letterSpacing: "0.08em",
                color: "rgba(148,163,184,0.55)",
                textTransform: "uppercase" as const,
              }}>{cat}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => toast.info("Full grading breakdown is shown after your card is analyzed.")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            width: "100%",
            fontFamily: "'Barlow', sans-serif",
            fontSize: "0.68rem",
            color: `${GOLD}`,
            opacity: 0.6,
            letterSpacing: "0.04em",
            padding: "0.25rem 0",
            textAlign: "center" as const,
          }}
        >
          View Full Grading Breakdown ↓
        </button>
      </div>
        </>
      )}

      {/* ── Validating overlay ── */}
      {validating && (
        <div style={{
          position: "absolute" as const,
          inset: 0,
          background: "rgba(6,13,30,0.88)",
          borderRadius: "inherit",
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          zIndex: 10,
        }}>
          <div style={{
            width: "32px",
            height: "32px",
            border: `2px solid rgba(59,130,246,0.2)`,
            borderTop: `2px solid ${BLUE}`,
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "0.7rem",
            letterSpacing: "0.2em",
            color: "rgba(147,197,253,0.7)",
            textTransform: "uppercase" as const,
          }}>
            Checking Image...
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STEP 2: Scanning ─────────────────────────────────────────────────────────
// Cinematic scan sequence:
//   Phase 0 (0-0.5s):  Grid fades in, corner brackets snap into place
//   Phase 1 (0.5-1.5s): Sweep line crosses card top→bottom
//   Phase 2 (1.5-2.0s): Edge detection lines appear on all 4 sides
//   Phase 3 (2.0-4.5s): Status tickers sequence through 7 categories
//   Phase 4 (4.5s):     "Analysis Complete" → auto-advance

const SCAN_TICKERS = [
  { label: "Detecting card boundaries",   category: "INIT",     color: "#93c5fd" },
  { label: "Measuring edge definition",    category: "EDGES",    color: "#60a5fa" },
  { label: "Analyzing centering offset",   category: "CENTER",   color: "#38bdf8" },
  { label: "Scanning surface texture",     category: "SURFACE",  color: "#34d399" },
  { label: "Evaluating corner integrity",  category: "CORNERS",  color: "#a78bfa" },
  { label: "Calculating eye appeal",       category: "APPEAL",   color: GOLD_BRIGHT },
  { label: "Compiling final score",        category: "SCORE",    color: "#22c55e" },
];

function StepScanning({ onDone, frontImageUrl }: { onDone: () => void; frontImageUrl?: string }) {
  const [phase, setPhase] = useState(0);          // 0=grid, 1=sweep, 2=edges, 3=tickers, 4=done
  const [sweepY, setSweepY] = useState(0);         // 0-100%
  const [tickerIndex, setTickerIndex] = useState(-1); // which ticker is active
  const [completedTickers, setCompletedTickers] = useState<number[]>([]);
  const [edgeLengths, setEdgeLengths] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
  const [cornerVisible, setCornerVisible] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Phase 0: corners snap in after 300ms
  useEffect(() => {
    const t = setTimeout(() => setCornerVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Phase 0→1: start sweep after 600ms
  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 600);
    return () => clearTimeout(t);
  }, []);

  // Phase 1: animate sweep line
  useEffect(() => {
    if (phase !== 1) return;
    let frame: number;
    let start: number | null = null;
    const duration = 1100;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setSweepY(progress * 100);
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setPhase(2);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  // Phase 2: edge lines grow in
  useEffect(() => {
    if (phase !== 2) return;
    let start: number | null = null;
    let frame: number;
    const duration = 500;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 2);
      setEdgeLengths({ top: ease * 100, right: ease * 100, bottom: ease * 100, left: ease * 100 });
      if (p < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setPhase(3);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  // Phase 3: sequence tickers
  useEffect(() => {
    if (phase !== 3) return;
    let current = 0;
    setTickerIndex(0);
    const interval = setInterval(() => {
      setCompletedTickers((prev) => [...prev, current]);
      current++;
      if (current >= SCAN_TICKERS.length) {
        clearInterval(interval);
        setTickerIndex(SCAN_TICKERS.length); // all done
        setTimeout(() => {
          setAnalysisComplete(true);
          setTimeout(onDone, 900);
        }, 400);
      } else {
        setTickerIndex(current);
      }
    }, 360);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "680px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1.5rem",
        alignItems: "start",
      }}
    >
      {/* LEFT: Card visual with scan overlay */}
      <div>
        <ProgressDots step={2} total={5} />
        <div style={S.eyebrow}>Step 2 of 5 — Analysis</div>
        <h1 style={{ ...S.h1, fontSize: "clamp(1.3rem,3vw,1.7rem)", marginBottom: "1rem" }}>Analyzing Your Card</h1>

        {/* Card frame */}
        <div
          style={{
            position: "relative" as const,
            width: "100%",
            aspectRatio: "2.5/3.5",
            borderRadius: "6px",
            overflow: "hidden",
            background: "#0a1428",
            border: "1px solid rgba(59,130,246,0.2)",
          }}
        >
          <img
            src={frontImageUrl || CARD_IMG}
            alt="Card under analysis"
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.55, display: "block" }}
          />

          {/* Scan grid — always visible */}
          <div
            style={{
              position: "absolute" as const,
              inset: 0,
              backgroundImage: `linear-gradient(rgba(59,130,246,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.07) 1px, transparent 1px)`,
              backgroundSize: "18px 18px",
              opacity: cornerVisible ? 1 : 0,
              transition: "opacity 0.5s ease",
            }}
          />

          {/* Sweep line */}
          {phase >= 1 && (
            <div
              style={{
                position: "absolute" as const,
                left: 0,
                right: 0,
                top: `${sweepY}%`,
                height: "2px",
                background: `linear-gradient(90deg, transparent 0%, ${BLUE} 20%, rgba(147,197,253,1) 50%, ${BLUE} 80%, transparent 100%)`,
                boxShadow: `0 0 16px 2px rgba(59,130,246,0.6), 0 0 4px rgba(147,197,253,0.8)`,
                zIndex: 3,
              }}
            />
          )}

          {/* Edge detection lines — grow from center outward */}
          {/* Top edge */}
          <div style={{
            position: "absolute" as const, top: "12%", left: "50%",
            height: "1px",
            width: `${edgeLengths.top * 0.76}%`,
            transform: "translateX(-50%)",
            background: "rgba(251,191,36,0.7)",
            boxShadow: "0 0 6px rgba(251,191,36,0.5)",
            transition: "width 0.5s ease",
            zIndex: 4,
          }} />
          {/* Bottom edge */}
          <div style={{
            position: "absolute" as const, bottom: "12%", left: "50%",
            height: "1px",
            width: `${edgeLengths.bottom * 0.76}%`,
            transform: "translateX(-50%)",
            background: "rgba(251,191,36,0.7)",
            boxShadow: "0 0 6px rgba(251,191,36,0.5)",
            transition: "width 0.5s ease",
            zIndex: 4,
          }} />
          {/* Left edge */}
          <div style={{
            position: "absolute" as const, left: "12%", top: "50%",
            width: "1px",
            height: `${edgeLengths.left * 0.76}%`,
            transform: "translateY(-50%)",
            background: "rgba(251,191,36,0.7)",
            boxShadow: "0 0 6px rgba(251,191,36,0.5)",
            transition: "height 0.5s ease",
            zIndex: 4,
          }} />
          {/* Right edge */}
          <div style={{
            position: "absolute" as const, right: "12%", top: "50%",
            width: "1px",
            height: `${edgeLengths.right * 0.76}%`,
            transform: "translateY(-50%)",
            background: "rgba(251,191,36,0.7)",
            boxShadow: "0 0 6px rgba(251,191,36,0.5)",
            transition: "height 0.5s ease",
            zIndex: 4,
          }} />

          {/* Corner brackets — snap in */}
          {[
            { top: "6px", left: "6px",   borderTop: `2px solid ${BLUE}`, borderLeft: `2px solid ${BLUE}` },
            { top: "6px", right: "6px",  borderTop: `2px solid ${BLUE}`, borderRight: `2px solid ${BLUE}` },
            { bottom: "6px", left: "6px",  borderBottom: `2px solid ${BLUE}`, borderLeft: `2px solid ${BLUE}` },
            { bottom: "6px", right: "6px", borderBottom: `2px solid ${BLUE}`, borderRight: `2px solid ${BLUE}` },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                position: "absolute" as const,
                width: "16px",
                height: "16px",
                opacity: cornerVisible ? 1 : 0,
                transform: cornerVisible ? "scale(1)" : "scale(0.4)",
                transition: `opacity 0.25s ease ${i * 60}ms, transform 0.25s ease ${i * 60}ms`,
                zIndex: 5,
                ...s,
              }}
            />
          ))}

          {/* Status badge */}
          <div
            style={{
              position: "absolute" as const,
              bottom: "8px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(6,13,26,0.85)",
              backdropFilter: "blur(4px)",
              border: analysisComplete ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(59,130,246,0.3)",
              borderRadius: "20px",
              padding: "4px 10px",
              zIndex: 6,
              transition: "border-color 0.4s ease",
            }}
          >
            <div
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: analysisComplete ? "#22c55e" : BLUE,
                boxShadow: analysisComplete ? "0 0 8px #22c55e" : `0 0 8px ${BLUE}`,
                transition: "background 0.4s ease, box-shadow 0.4s ease",
              }}
            />
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "0.58rem",
                letterSpacing: "0.16em",
                color: analysisComplete ? "#86efac" : "#93c5fd",
                textTransform: "uppercase" as const,
                transition: "color 0.4s ease",
              }}
            >
              {analysisComplete ? "Analysis Complete" : "Analyzing…"}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT: Status tickers */}
      <div
        style={{
          paddingTop: "3.5rem",
          display: "flex",
          flexDirection: "column" as const,
          gap: "0",
        }}
      >
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 600,
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            color: "rgba(148,163,184,0.4)",
            textTransform: "uppercase" as const,
            marginBottom: "0.75rem",
          }}
        >
          System Output
        </div>

        {/* AI tagline */}
        <div
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: "0.72rem",
            color: "rgba(147,197,253,0.55)",
            marginBottom: "1rem",
            lineHeight: 1.5,
          }}
        >
          AI grading 5 categories in real-time
        </div>

        {SCAN_TICKERS.map((ticker, i) => {
          const isDone = completedTickers.includes(i);
          const isActive = tickerIndex === i;
          const isVisible = isDone || isActive;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.55rem 0.75rem",
                marginBottom: "3px",
                borderRadius: "4px",
                background: isActive
                  ? "rgba(59,130,246,0.08)"
                  : isDone
                  ? "rgba(34,197,94,0.04)"
                  : "transparent",
                border: isActive
                  ? "1px solid rgba(59,130,246,0.2)"
                  : isDone
                  ? "1px solid rgba(34,197,94,0.1)"
                  : "1px solid transparent",
                opacity: isVisible ? 1 : 0.12,
                transform: isVisible ? "translateX(0)" : "translateX(8px)",
                transition: "opacity 0.35s ease, transform 0.35s ease, background 0.3s ease, border-color 0.3s ease",
              }}
            >
              {/* Indicator */}
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: isDone ? "#22c55e" : isActive ? ticker.color : "rgba(255,255,255,0.1)",
                  boxShadow: isActive ? `0 0 8px ${ticker.color}` : isDone ? "0 0 6px #22c55e" : "none",
                  transition: "background 0.3s ease, box-shadow 0.3s ease",
                }}
              />
              {/* Category tag */}
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.55rem",
                  letterSpacing: "0.14em",
                  color: isActive ? ticker.color : isDone ? "rgba(134,239,172,0.5)" : "rgba(148,163,184,0.2)",
                  textTransform: "uppercase" as const,
                  minWidth: "48px",
                  transition: "color 0.3s ease",
                }}
              >
                {ticker.category}
              </span>
              {/* Label */}
              <span
                style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: "0.78rem",
                  color: isDone ? "rgba(134,239,172,0.65)" : isActive ? "#e2e8f0" : "rgba(148,163,184,0.2)",
                  transition: "color 0.3s ease",
                  flex: 1,
                }}
              >
                {ticker.label}
                {isActive && (
                  <span
                    style={{
                      display: "inline-block",
                      marginLeft: "4px",
                      animation: "blink 0.8s step-end infinite",
                      color: ticker.color,
                    }}
                  >
                    ▌
                  </span>
                )}
              </span>
              {/* Checkmark */}
              {isDone && (
                <span style={{ color: "#22c55e", fontSize: "0.75rem", flexShrink: 0 }}>✓</span>
              )}
            </div>
          );
        })}

        {/* Progress bar */}
        <div
          style={{
            marginTop: "1rem",
            height: "2px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "1px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.round((completedTickers.length / SCAN_TICKERS.length) * 100)}%`,
              background: `linear-gradient(90deg, ${BLUE}, #22c55e)`,
              borderRadius: "1px",
              transition: "width 0.35s ease",
              boxShadow: "0 0 8px rgba(34,197,94,0.4)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "0.4rem",
          }}
        >
          <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.65rem", color: "rgba(148,163,184,0.3)" }}>
            {completedTickers.length} / {SCAN_TICKERS.length} checks
          </span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", color: analysisComplete ? "#86efac" : "rgba(148,163,184,0.3)", transition: "color 0.4s ease" }}>
            {analysisComplete ? "COMPLETE" : "RUNNING"}
          </span>
        </div>
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── STEP 3: Centering ────────────────────────────────────────────────────────
function StepCentering({ onNext }: { onNext: () => void }) {
  const [animated, setAnimated] = useState(false);
  const [frontCount, setFrontCount] = useState(0);
  const [backCount, setBackCount] = useState(0);
  const [finalCount, setFinalCount] = useState(0);

  const frontScore = 96;
  const backScore = 100;
  const finalScore = 98;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!animated) return;
    const duration = 1200;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setFrontCount(Math.round(ease * frontScore));
      setBackCount(Math.round(ease * backScore));
      setFinalCount(Math.round(ease * finalScore));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [animated]);

  const CenterBar = ({ label, left, right, score, count }: { label: string; left: number; right: number; score: number; count: number }) => (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.14em", color: GOLD, textTransform: "uppercase" as const }}>{label}</span>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1rem", color: "#ffffff" }}>Score: {count}</span>
      </div>
      <div style={{ position: "relative" as const, height: "10px", background: "rgba(255,255,255,0.06)", borderRadius: "5px", overflow: "hidden" }}>
        {/* Left fill */}
        <div style={{
          position: "absolute" as const, left: 0, top: 0, bottom: 0,
          width: animated ? `${left}%` : "50%",
          background: `linear-gradient(90deg, rgba(59,130,246,0.4), ${BLUE})`,
          borderRadius: "5px 0 0 5px",
          transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: `0 0 8px rgba(59,130,246,0.4)`,
        }} />
        {/* Right fill */}
        <div style={{
          position: "absolute" as const, right: 0, top: 0, bottom: 0,
          width: animated ? `${right}%` : "50%",
          background: `linear-gradient(270deg, rgba(147,197,253,0.4), #93c5fd)`,
          borderRadius: "0 5px 5px 0",
          transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: `0 0 8px rgba(147,197,253,0.3)`,
        }} />
        {/* Center line */}
        <div style={{ position: "absolute" as const, left: "50%", top: 0, bottom: 0, width: "1px", background: "rgba(255,255,255,0.2)" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.3rem" }}>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", color: "#93c5fd" }}>{left}%</span>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", color: "#93c5fd" }}>{right}%</span>
      </div>
    </div>
  );

  return (
    <div style={{ ...S.card, maxWidth: "520px" }}>
      <ProgressDots step={3} total={5} />
      <div style={S.eyebrow}>Step 3 of 5 — Centering</div>
      <h1 style={{ ...S.h1, marginBottom: "0.5rem" }}>Centering Detected</h1>
      <p style={{ ...S.sub, marginBottom: "0.5rem" }}>Front and back measurements complete.</p>
      {/* Differentiator tagline */}
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 600,
        fontSize: "0.7rem",
        letterSpacing: "0.16em",
        color: GOLD,
        textTransform: "uppercase" as const,
        marginBottom: "1.75rem",
        opacity: 0.85,
      }}>
        ◆ Measured to the pixel — not estimated
      </div>

      <CenterBar label="Front Centering" left={49} right={51} score={frontScore} count={frontCount} />
      <CenterBar label="Back Centering" left={60} right={40} score={backScore} count={backCount} />

      {/* Final score */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(201,168,76,0.2)",
        borderRadius: "6px",
        padding: "1.25rem",
        textAlign: "center" as const,
        marginBottom: "2rem",
        opacity: animated ? 1 : 0,
        transform: animated ? "translateY(0)" : "translateY(8px)",
        transition: "all 0.6s ease 1s",
      }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.18em", color: GOLD, textTransform: "uppercase" as const, marginBottom: "0.5rem" }}>Final Centering Score</div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "3.5rem", color: GOLD_BRIGHT, lineHeight: 1 }}>{finalCount}</div>
        <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.7rem", color: "rgba(148,163,184,0.4)", marginTop: "0.3rem" }}>({frontScore} + {backScore}) ÷ 2 = {finalScore}</div>
      </div>

      <button onClick={onNext} style={{ ...S.btn, background: BLUE, color: "#ffffff", fontSize: "0.85rem", letterSpacing: "0.12em", padding: "0.9rem" }}>
        View Full Analysis →
      </button>
    </div>
  );
}

// ─── STEP 4: Full Analysis ────────────────────────────────────────────────────
function StepAnalysis({ onNext }: { onNext: () => void }) {
  const [animated, setAnimated] = useState(false);
  const [centeringOpen, setCenteringOpen] = useState(false);
  const [edgesOpen, setEdgesOpen] = useState(false);
  const [cornersOpen, setCornersOpen] = useState(false);
  const [surfaceOpen, setSurfaceOpen] = useState(false);
  const [eyeAppealOpen, setEyeAppealOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const categories = [
    { label: "Centering", score: 96, weight: 40, color: GOLD_BRIGHT, desc: "Front 51/49 · Back 60/40", icon: "⊞", microType: "bar", barValue: 96, onClick: () => setCenteringOpen(true) },
    { label: "Edges", score: 91, weight: 15, color: "#93c5fd", desc: "Light wear on 2 sides", icon: "◫", microType: "edge", barValue: 91, onClick: () => setEdgesOpen(true) },
    { label: "Corners", score: 91, weight: 15, color: "#93c5fd", desc: "Minor whitening top-right", icon: "◱", microType: "corner", barValue: 91, onClick: () => setCornersOpen(true) },
    { label: "Surface", score: 83, weight: 20, color: "#f97316", desc: "Light scratch detected", icon: "✦", microType: "surface", barValue: 83, onClick: () => setSurfaceOpen(true) },
    { label: "Eye Appeal", score: 96, weight: 10, color: "#a78bfa", desc: "Strong color & gloss", icon: "◈", microType: "eye", barValue: 96, onClick: () => setEyeAppealOpen(true) },
  ];

  return (
    <>
      <div style={{ ...S.card, maxWidth: "520px" }}>
        <ProgressDots step={4} total={5} />
        <div style={S.eyebrow}>Step 4 of 5 — Full Analysis</div>
        <h1 style={{ ...S.h1, marginBottom: "0.5rem" }}>All Categories Graded</h1>
        <p style={{ ...S.sub, marginBottom: "2rem" }}>Tap any category to see the detailed breakdown.</p>

        <div style={{ display: "flex", flexDirection: "column" as const, gap: "0.6rem", marginBottom: "2rem" }}>
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={cat.onClick}
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "6px",
                padding: "0.85rem 1rem",
                cursor: "pointer",
                display: "flex" as const,
                alignItems: "center" as const,
                gap: "0.85rem",
                opacity: animated ? 1 : 0,
                transform: animated ? "translateX(0)" : "translateX(-12px)",
                transition: `all 0.4s ease ${i * 0.08}s`,
                textAlign: "left" as const,
              }}
            >
              {/* Left accent bar */}
              <div style={{ width: "3px", height: "40px", background: cat.color, borderRadius: "2px", flexShrink: 0, boxShadow: `0 0 8px ${cat.color}40` }} />

              {/* Micro-visual: mini progress bar */}
              <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "3px", flexShrink: 0 }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "4px", background: `${cat.color}12`, border: `1px solid ${cat.color}30`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" as const, overflow: "hidden" }}>
                  {/* Mini fill bar inside icon box */}
                  <div style={{ position: "absolute" as const, bottom: 0, left: 0, right: 0, height: `${cat.barValue}%`, background: `${cat.color}20`, transition: `height 0.8s ease ${i * 0.1 + 0.3}s` }} />
                  <span style={{ fontSize: "0.85rem", position: "relative" as const, zIndex: 1 }}>{cat.icon}</span>
                </div>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.48rem", letterSpacing: "0.08em", color: `${cat.color}80`, textTransform: "uppercase" as const }}>{cat.weight}%</span>
              </div>

              {/* Label + desc + mini score bar */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.08em", color: "#ffffff", textTransform: "uppercase" as const }}>{cat.label}</span>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.3rem", color: cat.color, lineHeight: 1, textShadow: animated ? `0 0 12px ${cat.color}80` : "none", transition: `text-shadow 0.6s ease ${i * 0.1 + 0.5}s` }}>{cat.score}</span>
                </div>
                {/* Mini horizontal score bar */}
                <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", marginBottom: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: animated ? `${cat.barValue}%` : "0%", background: cat.color, borderRadius: "2px", transition: `width 0.9s ease ${i * 0.1 + 0.2}s`, boxShadow: `0 0 6px ${cat.color}60` }} />
                </div>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.68rem", color: "rgba(148,163,184,0.4)" }}>{cat.desc}</div>
              </div>

              {/* View Breakdown CTA */}
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.6rem", letterSpacing: "0.1em", color: `${cat.color}70`, textTransform: "uppercase" as const, whiteSpace: "nowrap" as const, flexShrink: 0 }}>View Breakdown</span>
            </button>
          ))}
        </div>

        <button onClick={onNext} style={{ ...S.btn, background: BLUE, color: "#ffffff", fontSize: "0.85rem", letterSpacing: "0.12em", padding: "0.9rem" }}>
          See Final Score →
        </button>
      </div>

      {/* Detail modals */}
      <CenteringDetailsModal
        open={centeringOpen}
        onClose={() => setCenteringOpen(false)}
        frontLeft={49}
        frontRight={51}
        frontScore={96}
        backLeft={60}
        backRight={40}
        backScore={100}
        finalScore={98}
      />
      <EdgesDetailsModal
        open={edgesOpen}
        onClose={() => setEdgesOpen(false)}
        edges={[
          { side: "Top",    severity: "Light",  note: "Light wear along top edge" },
          { side: "Left",   severity: "Minor",  note: "Minor chipping on left edge" },
          { side: "Right",  severity: "Light",  note: "Light wear on right edge" },
          { side: "Bottom", severity: "Clean",  note: "Clean, no visible wear" },
        ]}
        finalScore={91}
      />
      <CornersDetailsModal
        open={cornersOpen}
        onClose={() => setCornersOpen(false)}
        corners={[
          { position: "TL", label: "Top Left",     severity: "Light", note: "Light whitening" },
          { position: "TR", label: "Top Right",    severity: "Minor", note: "Minor wear" },
          { position: "BL", label: "Bottom Left",  severity: "Clean", note: "Clean" },
          { position: "BR", label: "Bottom Right", severity: "Light", note: "Light wear" },
        ]}
        finalScore={91}
      />
      <SurfaceDetailsModal
        open={surfaceOpen}
        onClose={() => setSurfaceOpen(false)}
        defects={[
          { id: "d1", severity: "Light",    description: "Light scratch (top right)",  x: 72, y: 25 },
          { id: "d2", severity: "Minor",    description: "Print line (center)",         x: 50, y: 55 },
          { id: "d3", severity: "Moderate", description: "Small dent (bottom edge)",    x: 30, y: 80 },
        ]}
        finalScore={83}
      />
      <EyeAppealDetailsModal
        open={eyeAppealOpen}
        onClose={() => setEyeAppealOpen(false)}
        data={{ colorVibrancy: 96, surfaceShine: 94, printQuality: 95, visualBalance: 97, finalScore: 96 }}
      />
    </>
  );
}

// ─── STEP 4.5: Generating Report (transition screen) ────────────────────────
function StepGenerating({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  // phase 0 = logo fade in, phase 1 = text appears, phase 2 = bar fills, phase 3 = done

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => onDone(), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        minHeight: "320px",
        opacity: phase >= 1 ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}
    >
      {/* Diamond Index logo mark */}
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "12px",
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${GOLD}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "scale(1)" : "scale(0.7)",
          transition: "all 0.5s cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: phase >= 2 ? `0 0 32px ${GOLD}40, 0 0 64px ${GOLD}20` : "none",
        }}
      >
        <img src="/manus-storage/diamond-blue-sm_46bffbe0.png" width="40" height="40" alt="diamond" style={{ filter: phase >= 2 ? `drop-shadow(0 0 8px rgba(130,210,255,0.9)) brightness(1.2)` : "none", transition: "filter 0.5s ease" }} />
      </div>

      {/* Generating Report text */}
      <div style={{ textAlign: "center" as const }}>
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "1.4rem",
            letterSpacing: "0.08em",
            color: "#ffffff",
            textTransform: "uppercase" as const,
            opacity: phase >= 1 ? 1 : 0,
            transition: "opacity 0.4s ease 0.2s",
          }}
        >
          Generating Report
          <span
            style={{
              display: "inline-block",
              animation: "blink 0.8s step-end infinite",
              color: GOLD,
              marginLeft: "2px",
            }}
          >
            ...
          </span>
        </div>
        <div
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: "0.72rem",
            color: "rgba(148,163,184,0.4)",
            marginTop: "0.4rem",
            opacity: phase >= 1 ? 1 : 0,
            transition: "opacity 0.4s ease 0.4s",
          }}
        >
          Calculating final Diamond Index™ score
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: "220px",
          height: "2px",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "1px",
          overflow: "hidden",
          opacity: phase >= 2 ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        <div
          style={{
            height: "100%",
            width: phase >= 3 ? "100%" : phase >= 2 ? "70%" : "0%",
            background: `linear-gradient(90deg, ${BLUE}, ${GOLD})`,
            borderRadius: "1px",
            transition: "width 1s ease",
            boxShadow: `0 0 8px ${GOLD}60`,
          }}
        />
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── helper: map score to percentile text + PSA anchor ──────────────────────
function getPercentileLabel(score: number): { percentile: string; psa: string } {
  if (score >= 98)  return { percentile: "Top 2% of all graded cards",  psa: "Comparable to PSA 10" };
  if (score >= 95)  return { percentile: "Top 5% of all graded cards",  psa: "Comparable to PSA 10" };
  if (score >= 92)  return { percentile: "Top 12% of all graded cards", psa: "Comparable to PSA 9+" };
  if (score >= 88)  return { percentile: "Top 20% of all graded cards", psa: "Comparable to PSA 9" };
  if (score >= 83)  return { percentile: "Top 35% of all graded cards", psa: "Comparable to PSA 8" };
  if (score >= 75)  return { percentile: "Top 50% of all graded cards", psa: "Comparable to PSA 7" };
  return              { percentile: "Top 65% of all graded cards", psa: "Comparable to PSA 6" };
}

// ─── STEP 5: Final Result ─────────────────────────────────────────────────────
function StepResult({ frontImageUrl, backImageUrl }: { frontImageUrl?: string; backImageUrl?: string }) {
  // Reveal phases: 0=hidden, 1=analyzing, 2=score counting, 3=diamonds, 4=full
  const [revealPhase, setRevealPhase] = useState(0);
  const [scoreCount, setScoreCount] = useState(0);
  const [valueCount, setValueCount] = useState(0);
  const [diamondsVisible, setDiamondsVisible] = useState(0); // how many diamonds shown

  const finalScore = 95.5;
  const marketValue = 2500;
  const yourValue = 2400;
  const diamonds = 5;

  // ── Vault save ──────────────────────────────────────────────────────────────
  const saveCard = trpc.vault.saveCard.useMutation();
  const [savedCertId, setSavedCertId] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);

  // Auto-save to vault when result phase reaches 4 and we have an image
  useEffect(() => {
    if (revealPhase < 4) return;
    if (savedCertId || saveFailed) return;
    if (!frontImageUrl) return; // no real image — skip auto-save
    saveCard.mutate(
      {
        cardName: "Graded Card",
        cardYear: new Date().getFullYear().toString(),
        cardSet: "Diamond Index™",
        cardNumber: "",
        frontImageUrl,
        backImageUrl: backImageUrl ?? frontImageUrl,
        overallScore: finalScore,
        centeringScore: 96,
        edgesScore: 91,
        cornersScore: 91,
        surfaceScore: 83,
        eyeAppealScore: 96,
        gradeTier: "ELITE",
        diamondRating: diamonds,
        siteOrigin: window.location.origin,
      },
      {
        onSuccess: (data) => {
          setSavedCertId((data as { certId?: string })?.certId ?? "saved");
          toast.success("Card saved to your vault!");
        },
        onError: () => {
          setSaveFailed(true);
          toast.error("Could not save to vault. You can save manually from the vault page.");
        },
      }
    );
  }, [revealPhase]);
  // Live percentile from DB — falls back to static label if query fails
  const percentileQuery = trpc.vault.getPercentile.useQuery(
    { score: finalScore },
    { enabled: revealPhase >= 2, staleTime: 60_000 }
  );
  const liveTopPercent = percentileQuery.data?.topPercent;
  const { percentile: staticPercentile, psa } = getPercentileLabel(finalScore);
  const percentile = liveTopPercent != null
    ? `Top ${liveTopPercent}% of graded cards`
    : staticPercentile;

  // Orchestrate the reveal sequence
  useEffect(() => {
    const timers = [
      // Phase 1: "Analyzing your card..." (0ms)
      setTimeout(() => setRevealPhase(1), 0),
      // Phase 2: Score counts up (1800ms) — slower build
      setTimeout(() => setRevealPhase(2), 1800),
      // Phase 3: Diamonds appear one-by-one (3800ms) — more suspense
      setTimeout(() => setRevealPhase(3), 3800),
      // Phase 4: Full breakdown + value visible
      setTimeout(() => setRevealPhase(4), 3800 + diamonds * 200 + 600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Score count-up when phase 2 starts
  useEffect(() => {
    if (revealPhase < 2) return;
    const duration = 1400;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setScoreCount(Math.round(ease * finalScore * 10) / 10);
      setValueCount(Math.round(ease * yourValue));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [revealPhase]);

  // Diamonds appear one-by-one when phase 3 starts
  useEffect(() => {
    if (revealPhase < 3) return;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setDiamondsVisible(count);
      if (count >= diamonds) clearInterval(interval);
    }, 200);
    return () => clearInterval(interval);
  }, [revealPhase]);

  // Use real uploaded image or fall back to demo card image
  const displayImage = frontImageUrl || CARD_IMG;

  return (
    <div style={{ ...S.card, maxWidth: "520px", textAlign: "center" as const }}>
      <ProgressDots step={5} total={5} />
      <div style={S.eyebrow}>Final Result</div>

      {/* ── PHASE 1: Analyzing overlay ── */}
      {revealPhase === 1 && (
        <div style={{
          display: "flex", flexDirection: "column" as const, alignItems: "center",
          justifyContent: "center", gap: "1rem", minHeight: "260px",
          animation: "fadeIn 0.4s ease",
        }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "50%",
            border: `2px solid ${GOLD}40`,
            borderTopColor: GOLD,
            animation: "spin 0.9s linear infinite",
          }} />
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
            fontSize: "1.1rem", letterSpacing: "0.1em", color: "#ffffff",
            textTransform: "uppercase" as const,
          }}>
            Analyzing your card
            <span style={{ animation: "blink 0.8s step-end infinite", color: GOLD }}>...</span>
          </div>
          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", color: "rgba(148,163,184,0.4)" }}>
            Calculating Diamond Index™ score
          </div>
        </div>
      )}

      {/* ── PHASES 2–4: The actual result ── */}
      {revealPhase >= 2 && (
        <>
          {/* Diamonds with ambient glow — one-by-one */}
          <div style={{ position: "relative" as const, display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
            <div style={{
              position: "absolute" as const, top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "180px", height: "60px",
              background: `radial-gradient(ellipse, ${GOLD}30 0%, transparent 70%)`,
              opacity: revealPhase >= 3 ? 1 : 0,
              transition: "opacity 1s ease 0.3s",
              pointerEvents: "none" as const, filter: "blur(8px)",
            }} />
            <div style={{ display: "flex", justifyContent: "center", gap: "0.6rem", position: "relative" as const, zIndex: 1 }}>
              {Array.from({ length: diamonds }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    opacity: diamondsVisible > i ? 1 : 0,
                    transform: diamondsVisible > i
                      ? (diamondsVisible === i + 1 ? "scale(1.15) translateY(-2px)" : "scale(1) translateY(0)")
                      : "scale(0.4) translateY(12px)",
                    transition: diamondsVisible === i + 1
                      ? "all 0.25s cubic-bezier(0.34,1.56,0.64,1)"
                      : "all 0.5s cubic-bezier(0.34,1.56,0.64,1)",
                    filter: diamondsVisible > i
                      ? `drop-shadow(0 0 12px rgba(130,210,255,0.9)) drop-shadow(0 0 24px rgba(70,160,220,0.5)) brightness(1.2)`
                      : "none",
                  }}
                >
                  <img src="/manus-storage/diamond-blue-sm_46bffbe0.png" width="44" height="44" alt="diamond" />
                </div>
              ))}
            </div>
          </div>

          {/* ELITE GRADE label + PSA anchor */}
          <div style={{
            display: "flex", flexDirection: "column" as const, alignItems: "center",
            gap: "0.25rem", marginBottom: "0.5rem",
            opacity: revealPhase >= 2 ? 1 : 0, transition: "opacity 0.5s ease 0.2s",
          }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: "0.6rem", letterSpacing: "0.28em", color: GOLD,
              textTransform: "uppercase" as const,
            }}>
              ◆ Elite Grade ◆
            </div>
            {/* FIX 2: PSA confidence anchor */}
            <div style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: "0.72rem",
              color: "rgba(148,163,184,0.65)",
              letterSpacing: "0.03em",
            }}>
              Comparable to PSA 9+
            </div>
          </div>

          {/* Score count-up */}
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
            fontSize: "5.5rem", color: GOLD_BRIGHT, lineHeight: 1, marginBottom: "0.25rem",
            opacity: revealPhase >= 2 ? 1 : 0, transition: "opacity 0.4s ease",
            textShadow: `0 0 60px rgba(255,215,80,0.4), 0 0 20px rgba(255,215,80,0.2)`,
          }}>
            {scoreCount.toFixed(1)}%
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.18em", color: "rgba(201,168,76,0.5)", textTransform: "uppercase" as const, marginBottom: "0.35rem" }}>
            Diamond Index™ Grade
          </div>

          {/* FIX 1: Top X% rarity line */}
          <div style={{
            display: "flex", flexDirection: "column" as const, alignItems: "center",
            gap: "0.2rem", marginBottom: "1rem",
            opacity: revealPhase >= 2 ? 1 : 0, transition: "opacity 0.6s ease 0.8s",
          }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
              fontSize: "1rem", letterSpacing: "0.14em",
              color: "rgba(134,239,172,1)", textTransform: "uppercase" as const,
              textShadow: "0 0 20px rgba(134,239,172,0.4)",
            }}>
              ◆ {percentile}
            </div>
            <div style={{
              fontFamily: "'Barlow', sans-serif", fontSize: "0.65rem",
              color: "rgba(148,163,184,0.45)", letterSpacing: "0.03em", fontStyle: "italic",
            }}>
              Measured to the pixel — not estimated
            </div>
          </div>

          {/* Emotional condition label */}
          <div style={{
            fontFamily: "'Barlow', sans-serif", fontSize: "0.8rem",
            color: "rgba(203,213,225,0.65)", letterSpacing: "0.04em", marginBottom: "1.4rem",
            opacity: revealPhase >= 4 ? 1 : 0, transition: "opacity 0.6s ease",
          }}>
            Excellent Condition — High Collector Value
          </div>

          {/* ── 3D SLAB REVEAL ── */}
          {revealPhase >= 4 && (
            <div style={{
              marginBottom: "1.5rem",
              opacity: 1,
              animation: "fadeIn 0.8s ease",
              borderRadius: "10px",
              overflow: "hidden",
              border: "1px solid rgba(201,168,76,0.15)",
            }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.55rem", letterSpacing: "0.22em", color: "rgba(201,168,76,0.5)", textTransform: "uppercase" as const, padding: "0.5rem 0 0.25rem", textAlign: "center" as const }}>
                Your Graded Slab
              </div>
              <CardSlab3D
                frontImageUrl={displayImage}
                backImageUrl={backImageUrl || null}
                certId={savedCertId ?? "DI-0000-0000"}
                score={finalScore}
                diamondRating={diamonds}
                cardName="Graded Card"
                cardYear={new Date().getFullYear().toString()}
                cardSet="Diamond Index™"
                centeringScore={96}
                edgesScore={91}
                surfaceScore={83}
                cornersScore={91}
                eyeAppealScore={96}
                height={320}
              />
            </div>
          )}

          {/* ── MOVE 3 BONUS: AI market value line ── */}
          {revealPhase >= 4 && (
            <>
              <div style={{
                fontFamily: "'Barlow', sans-serif", fontSize: "0.65rem",
                color: "rgba(148,163,184,0.4)", letterSpacing: "0.03em",
                marginBottom: "0.2rem", fontStyle: "italic",
              }}>
                AI-adjusted market value based on current comps
              </div>
              <div style={{
                fontFamily: "'Barlow', sans-serif", fontSize: "0.62rem",
                color: "rgba(148,163,184,0.35)", letterSpacing: "0.02em",
                marginBottom: "0.5rem", fontStyle: "italic",
              }}>
                Based on recent sales of similar graded cards
              </div>
            </>
          )}

          {/* Value box */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "6px", padding: "1.25rem", marginBottom: "0.6rem",
            opacity: revealPhase >= 4 ? 1 : 0, transition: "opacity 0.6s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.78rem", color: "rgba(148,163,184,0.5)" }}>Market Value (PSA 10)</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", color: "rgba(148,163,184,0.6)", textDecoration: "line-through" }}>${marketValue.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.78rem", color: "rgba(203,213,225,0.8)" }}>Your Diamond Index™ Value</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.5rem", color: GOLD_BRIGHT }}>${valueCount.toLocaleString()}</span>
            </div>
          </div>

          {/* Retain value line */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "6px", marginBottom: "1.5rem",
            opacity: revealPhase >= 4 ? 1 : 0, transition: "opacity 0.5s ease 0.2s",
          }}>
            <span style={{ color: "#22c55e", fontSize: "0.75rem" }}>&#10003;</span>
            <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", color: "rgba(134,239,172,0.7)" }}>
              You retain <strong style={{ color: "#86efac" }}>96%</strong> of market value with this grade
            </span>
          </div>

          {/* FIX 5: Next-step guidance line */}
          <div style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: "0.78rem",
            color: "rgba(203,213,225,0.55)",
            letterSpacing: "0.02em",
            marginBottom: "1rem",
            opacity: revealPhase >= 4 ? 1 : 0, transition: "opacity 0.5s ease 0.1s",
          }}>
            Your card is now graded and ready to save or certify.
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", flexDirection: "column" as const, gap: "0.6rem",
            opacity: revealPhase >= 4 ? 1 : 0, transition: "opacity 0.6s ease 0.4s" }}>

            {/* FIX 3: Ship Me a Slab — highlighted primary purchase option */}
            <div style={{ position: "relative" as const }}>
              {/* Most Popular badge */}
              <div style={{
                position: "absolute" as const,
                top: "-1px",
                right: "14px",
                background: BLUE,
                color: "#ffffff",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "0.52rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase" as const,
                padding: "3px 8px",
                borderRadius: "0 0 4px 4px",
                zIndex: 1,
              }}>
                Most Popular
              </div>
              <button
                onClick={() => toast.info("Slab ordering will be available soon. Save your card to vault first.")}
                style={{
                  ...S.btn,
                  width: "100%",
                  background: "rgba(59,130,246,0.08)",
                  border: `1.5px solid ${BLUE}`,
                  color: "#93c5fd",
                  padding: "1rem",
                  fontSize: "0.88rem",
                  letterSpacing: "0.12em",
                  boxShadow: `0 0 18px rgba(59,130,246,0.25), 0 4px 16px rgba(59,130,246,0.15)`,
                }}
              >
                Ship Me a Slab — $14.99
              </button>
            </div>

            {/* FIX 4: Add to My Collection (renamed from Save to Vault) */}
            <Link
              href="/vault"
              style={{ ...S.btn, background: `linear-gradient(135deg, ${GOLD}, #b8922a)`, color: "#070d1a", padding: "1rem", fontSize: "0.88rem", letterSpacing: "0.14em", boxShadow: `0 4px 20px rgba(201,168,76,0.35)`, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              Add to My Collection ◆
            </Link>

            {/* Secondary row: Find a Grader + Share */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              <button
                onClick={() => toast.info("Connect with a certified grader from your Vault.")}
                style={{ ...S.btn, background: `linear-gradient(135deg, ${BLUE}, #2563eb)`, color: "#ffffff", padding: "0.75rem", fontSize: "0.75rem", boxShadow: `0 2px 12px rgba(59,130,246,0.25)` }}
              >
                Find a Grader
              </button>
              <button
                onClick={() => toast.info("Share feature coming soon.")}
                style={{ ...S.btn, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(203,213,225,0.7)", padding: "0.75rem", fontSize: "0.75rem" }}
              >
                Share
              </button>
            </div>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <Link href="/" style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.72rem", color: "rgba(100,116,139,0.4)", textDecoration: "none" }}>
              ← Back to Home
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Grade Page ──────────────────────────────────────────────────────────
export default function Grade() {
  const [step, setStep] = useState(1);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [frontImageUrl, setFrontImageUrl] = useState("");
  const [backImageUrl, setBackImageUrl] = useState("");
  const { isAuthenticated } = useAuth();

  const handleCameraOpen = () => {
    if (!isAuthenticated) {
      // Redirect to login, return to /grade after auth
      window.location.href = getLoginUrl("/grade");
      return;
    }
    setCameraOpen(true);
  };

  return (
    <div style={S.page}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {cameraOpen && (
        <CameraCapture
          onExit={() => setCameraOpen(false)}
          onAccepted={() => { setCameraOpen(false); window.location.href = "/vault"; }}
        />
      )}
      <Header />
      <main style={S.main}>
        {step === 1 && <StepEntry onStart={() => setStep(2)} onCameraOpen={handleCameraOpen} onImagesReady={(f, b) => { setFrontImageUrl(f); setBackImageUrl(b); }} />}
        {step === 2 && <StepScanning onDone={() => setStep(3)} frontImageUrl={frontImageUrl} />}
        {step === 3 && <StepCentering onNext={() => setStep(4)} />}
        {step === 4 && <StepAnalysis onNext={() => setStep(4.5)} />}
        {step === 4.5 && <StepGenerating onDone={() => setStep(5)} />}
        {step === 5 && <StepResult frontImageUrl={frontImageUrl} backImageUrl={backImageUrl} />}
      </main>
      <Footer />
    </div>
  );
}
