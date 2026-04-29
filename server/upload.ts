/**
 * Diamond Index™ — Image Upload Route
 * POST /api/upload
 * Accepts: multipart/form-data with field "image" (front or back card photo)
 * Returns: { url: string, key: string }
 *
 * The URL is a /manus-storage/ path that can be stored in DB and rendered directly.
 */

import { Router, Request, Response } from "express";
import multer from "multer";
import { storagePut } from "./storage";
import { sdk } from "./_core/sdk";

const router = Router();

// Store file in memory (max 16MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 16 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (JPEG, PNG, WEBP)"));
    }
  },
});

router.post("/api/upload", upload.single("image"), async (req: Request, res: Response) => {
  try {
    // Require authentication
    let user;
    try {
      user = await sdk.authenticateRequest(req);
    } catch {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "No image file provided" });
      return;
    }

    const { buffer, mimetype, originalname } = req.file;
    const ext = originalname.split(".").pop()?.toLowerCase() || "jpg";
    const timestamp = Date.now();
    const userId = user.id;
    const key = `cards/${userId}/${timestamp}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { url } = await storagePut(key, buffer, mimetype);

    res.json({ url, key });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("[Upload] Error:", message);
    res.status(500).json({ error: message });
  }
});

export function registerUploadRoute(app: import("express").Express) {
  app.use(router);
}
