/**
 * LabelPreviewModal — Diamond Index™ Label Preview & Export
 *
 * Opens a modal showing the rendered back label at screen scale.
 * Provides Download PDF and Download PNG export buttons.
 *
 * Usage:
 *   <LabelPreviewModal certId="DI-1234-5678" open={open} onClose={() => setOpen(false)} />
 *
 * When certId is provided, fetches live data via trpc.grader.getLabelData.
 * When data is provided directly, skips the fetch (useful for post-grade preview).
 */

import { useRef, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import LabelRenderer, { LabelData, buildLabelData } from "@/components/LabelRenderer";
import { X, Download, FileImage, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LabelPreviewModalProps {
  /** Cert ID to fetch label data for */
  certId?: string;
  /** Or pass data directly (skips fetch) */
  data?: LabelData;
  open: boolean;
  onClose: () => void;
}

// ─── Export helpers ───────────────────────────────────────────────────────────

async function exportToPNG(el: HTMLElement, certId: string): Promise<void> {
  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#060d1e",
    logging: false,
  });
  const link = document.createElement("a");
  link.download = `DI-label-${certId}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

async function exportToPDF(el: HTMLElement, certId: string): Promise<void> {
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#060d1e",
    logging: false,
  });

  // Label dimensions: 3.5in × 1.0in
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "in",
    format: [3.5, 1.0],
  });

  const imgData = canvas.toDataURL("image/png");
  pdf.addImage(imgData, "PNG", 0, 0, 3.5, 1.0);
  pdf.save(`DI-label-${certId}.pdf`);
}

// ─── Inner modal content ──────────────────────────────────────────────────────

function ModalContent({
  data,
  onClose,
}: {
  data: LabelData;
  onClose: () => void;
}) {
  const labelRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<"png" | "pdf" | null>(null);

  const handleExport = useCallback(
    async (type: "png" | "pdf") => {
      if (!labelRef.current || exporting) return;
      setExporting(type);
      try {
        if (type === "png") {
          await exportToPNG(labelRef.current, data.certId);
        } else {
          await exportToPDF(labelRef.current, data.certId);
        }
      } catch (err) {
        console.error("Export failed:", err);
      } finally {
        setExporting(null);
      }
    },
    [data.certId, exporting]
  );

  // Screen preview scale: fit 1050px label into ~900px max width
  const PREVIEW_W = Math.min(900, window.innerWidth - 80);
  const previewScale = PREVIEW_W / 1050;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#0d1526",
          border: "1px solid rgba(201,168,76,0.25)",
          borderRadius: "10px",
          padding: "28px",
          maxWidth: "960px",
          width: "100%",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}>
          <div>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "20px",
              letterSpacing: "0.12em",
              color: "#ffffff",
              textTransform: "uppercase",
              margin: 0,
            }}>
              LABEL PREVIEW
            </h2>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "12px",
              color: "rgba(255,255,255,0.45)",
              letterSpacing: "0.08em",
              margin: "3px 0 0 0",
            }}>
              {data.certId} · 3.5 × 1.0 in · VRC.7
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.5)",
              padding: "4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Label preview — hidden full-size div for export, visible scaled div for preview */}
        {/* Hidden full-size for export */}
        <div
          style={{
            position: "absolute",
            top: "-9999px",
            left: "-9999px",
            pointerEvents: "none",
          }}
        >
          <LabelRenderer ref={labelRef} data={data} scale={1} />
        </div>

        {/* Visible scaled preview */}
        <div
          style={{
            width: `${1050 * previewScale}px`,
            height: `${300 * previewScale}px`,
            margin: "0 auto 20px auto",
            overflow: "hidden",
            borderRadius: "6px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.2)",
          }}
        >
          <div style={{ transform: `scale(${previewScale})`, transformOrigin: "top left" }}>
            <LabelRenderer data={data} scale={1} />
          </div>
        </div>

        {/* Print specs note */}
        <p style={{
          textAlign: "center",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "11px",
          color: "rgba(255,255,255,0.35)",
          letterSpacing: "0.1em",
          marginBottom: "20px",
        }}>
          PRINT ON GLOSS LABEL STOCK · 3.5 × 1.0 IN · 300 DPI · TRIM TO EDGE
        </p>

        {/* Action buttons */}
        <div style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
        }}>
          <Button
            onClick={() => handleExport("pdf")}
            disabled={exporting !== null}
            style={{
              background: "#c9a84c",
              color: "#000000",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "13px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "10px 24px",
              border: "none",
              borderRadius: "4px",
              cursor: exporting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              opacity: exporting && exporting !== "pdf" ? 0.5 : 1,
            }}
          >
            {exporting === "pdf" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            Download PDF
          </Button>

          <Button
            onClick={() => handleExport("png")}
            disabled={exporting !== null}
            style={{
              background: "transparent",
              color: "#c9a84c",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "13px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "10px 24px",
              border: "1px solid rgba(201,168,76,0.5)",
              borderRadius: "4px",
              cursor: exporting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              opacity: exporting && exporting !== "png" ? 0.5 : 1,
            }}
          >
            {exporting === "png" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <FileImage size={14} />
            )}
            Download PNG
          </Button>

          <Button
            onClick={onClose}
            style={{
              background: "transparent",
              color: "rgba(255,255,255,0.5)",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
              fontSize: "13px",
              letterSpacing: "0.08em",
              padding: "10px 20px",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function LabelPreviewModal({
  certId,
  data: directData,
  open,
  onClose,
}: LabelPreviewModalProps) {
  // Fetch from server if certId provided and no direct data
  const { data: fetchedRaw, isLoading, error } = trpc.grader.getLabelData.useQuery(
    { certId: certId! },
    {
      enabled: open && !!certId && !directData,
      retry: false,
    }
  );

  if (!open) return null;

  // Resolve which data to use
  const labelData: LabelData | null = directData
    ? directData
    : fetchedRaw
    ? buildLabelData(fetchedRaw)
    : null;

  // Loading state
  if (!directData && isLoading) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "rgba(0,0,0,0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={onClose}
      >
        <div style={{ textAlign: "center" }}>
          <Loader2
            size={32}
            style={{ color: "#c9a84c", margin: "0 auto 12px" }}
            className="animate-spin"
          />
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            color: "rgba(255,255,255,0.6)",
            letterSpacing: "0.12em",
            fontSize: "13px",
          }}>
            LOADING LABEL DATA…
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (!directData && (error || !labelData)) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "rgba(0,0,0,0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: "#0d1526",
            border: "1px solid rgba(201,168,76,0.25)",
            borderRadius: "10px",
            padding: "32px",
            textAlign: "center",
            maxWidth: "360px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <AlertCircle size={32} style={{ color: "#c9a84c", margin: "0 auto 12px" }} />
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            color: "#ffffff",
            fontSize: "15px",
            letterSpacing: "0.08em",
            marginBottom: "8px",
          }}>
            LABEL DATA UNAVAILABLE
          </p>
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            color: "rgba(255,255,255,0.45)",
            fontSize: "12px",
            marginBottom: "20px",
          }}>
            {error?.message ?? "Could not load label data for this card."}
          </p>
          <button
            onClick={onClose}
            style={{
              background: "#c9a84c",
              color: "#000",
              border: "none",
              borderRadius: "4px",
              padding: "8px 20px",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "13px",
              letterSpacing: "0.1em",
              cursor: "pointer",
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
    );
  }

  return <ModalContent data={labelData!} onClose={onClose} />;
}
