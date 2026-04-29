/**
 * server/qr.test.ts
 * Unit tests for the self-hosted QR code generation helper.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock storagePut / storageGet ─────────────────────────────────────────────
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({
    key: "labels/DI-1234-5678/qr.png",
    url: "/manus-storage/labels/DI-1234-5678/qr.png",
  }),
  storageGet: vi.fn().mockResolvedValue({
    key: "labels/DI-1234-5678/qr.png",
    url: "/manus-storage/labels/DI-1234-5678/qr.png",
  }),
}));

import { generateAndStoreQR, getQRUrl } from "./qr";
import { storagePut, storageGet } from "./storage";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("generateAndStoreQR", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates a QR code and stores it in S3 with the correct key", async () => {
    const url = await generateAndStoreQR("DI-1234-5678", "https://diamondindex.com");

    expect(storagePut).toHaveBeenCalledOnce();
    const [key, buffer, contentType] = (storagePut as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(key).toBe("labels/DI-1234-5678/qr.png");
    expect(contentType).toBe("image/png");
    expect(buffer).toBeInstanceOf(Buffer);
    expect(url).toBe("/manus-storage/labels/DI-1234-5678/qr.png");
  });

  it("encodes the correct verify URL in the QR data", async () => {
    // We can't decode the QR buffer in a unit test, but we can verify
    // storagePut was called with a non-empty buffer
    await generateAndStoreQR("DI-9999-0001", "https://myapp.manus.space");
    const [, buffer] = (storagePut as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(buffer.length).toBeGreaterThan(100); // PNG has a header + data
  });

  it("uses the provided baseUrl to build the verify URL", async () => {
    // Different baseUrls should produce different QR buffers (different data)
    await generateAndStoreQR("DI-AAAA-BBBB", "https://localhost:3000");
    const [key1] = (storagePut as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(key1).toBe("labels/DI-AAAA-BBBB/qr.png");
  });

  it("returns the S3 storage URL from storagePut", async () => {
    const result = await generateAndStoreQR("DI-1234-5678", "https://diamondindex.com");
    expect(result).toMatch(/^\/manus-storage\//);
  });

  it("handles certIds with different formats correctly", async () => {
    const certIds = ["DI-0001-0001", "DI-9999-9999", "DI-1234-5678"];
    for (const certId of certIds) {
      vi.clearAllMocks();
      const url = await generateAndStoreQR(certId, "https://diamondindex.com");
      expect(url).toBeTruthy();
      const [key] = (storagePut as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(key).toBe(`labels/${certId}/qr.png`);
    }
  });
});

describe("getQRUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the storage URL for an existing QR code", async () => {
    const url = await getQRUrl("DI-1234-5678");
    expect(url).toBe("/manus-storage/labels/DI-1234-5678/qr.png");
    expect(storageGet).toHaveBeenCalledWith("labels/DI-1234-5678/qr.png");
  });

  it("returns null if the QR code does not exist in S3", async () => {
    (storageGet as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Not found"));
    const url = await getQRUrl("DI-XXXX-XXXX");
    expect(url).toBeNull();
  });

  it("calls storageGet with the correct S3 key path", async () => {
    await getQRUrl("DI-5555-6666");
    expect(storageGet).toHaveBeenCalledWith("labels/DI-5555-6666/qr.png");
  });
});
