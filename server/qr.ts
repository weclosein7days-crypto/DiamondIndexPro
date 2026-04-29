/**
 * server/qr.ts
 * Self-hosted QR code generation for Diamond Index™ certification labels.
 *
 * Generates a QR code PNG from a certId, stores it in S3 at:
 *   labels/{certId}/qr.png
 *
 * Returns the storage URL (/manus-storage/...) for use in labels and the Verify page.
 * If a QR already exists for a certId, returns the existing URL without regenerating.
 */

import QRCode from "qrcode";
import { storagePut, storageGet } from "./storage";

const QR_SIZE = 300; // px — high resolution for print quality

/**
 * Generate a QR code for a certId and store it in S3.
 * @param certId  e.g. "DI-1234-5678"
 * @param baseUrl e.g. "https://diamondindex.manus.space" (use window.location.origin from frontend)
 * @returns The storage URL string for the QR PNG
 */
export async function generateAndStoreQR(
  certId: string,
  baseUrl: string
): Promise<string> {
  const verifyUrl = `${baseUrl}/verify/${certId}`;
  const storageKey = `labels/${certId}/qr.png`;

  // Generate QR code as a PNG buffer
  const qrBuffer = await QRCode.toBuffer(verifyUrl, {
    type: "png",
    width: QR_SIZE,
    margin: 2,
    color: {
      dark: "#000000",  // Black modules
      light: "#FFFFFF", // White background
    },
    errorCorrectionLevel: "H", // High error correction — survives label printing
  });

  // Upload to S3
  const { url } = await storagePut(storageKey, qrBuffer, "image/png");

  return url;
}

/**
 * Get the storage URL for an existing QR code.
 * Returns null if no QR has been generated yet for this certId.
 */
export async function getQRUrl(certId: string): Promise<string | null> {
  const storageKey = `labels/${certId}/qr.png`;
  try {
    const { url } = await storageGet(storageKey);
    return url;
  } catch {
    return null;
  }
}
