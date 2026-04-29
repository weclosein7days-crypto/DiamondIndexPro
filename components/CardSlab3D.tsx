/**
 * CardSlab3D — Interactive 3D graded card slab viewer
 *
 * FRONT FACE (canvas texture 512×716):
 *   - Top label strip (~22% height): dark navy, "DIAMOND INDEX™", diamonds, score, cert ID
 *   - Bottom card area (~78% height): real uploaded card front photo
 *
 * BACK FACE (canvas texture 512×716):
 *   - Full DI certification back — NEVER a card photo
 *   - Dark navy background, gold border frame
 *   - Large DI diamond logo
 *   - CERTIFIED AUTHENTIC badge
 *   - Cert ID (prominent)
 *   - QR code placeholder
 *   - 5-category score grid
 *   - VRC.7 footer
 *
 * ACRYLIC: crystal clear — SLAB_D=0.18, transmission=0.95, opacity=0.08
 * CARD EDGE: thin cream-white box at z=0 simulates physical card thickness
 */

import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { TextureLoader } from "three";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CardSlab3DProps {
  frontImageUrl?: string | null;
  backImageUrl?: string | null;
  certId?: string;
  score?: number | string | null;
  diamondRating?: number | null;
  cardName?: string | null;
  cardYear?: string | null;
  cardSet?: string | null;
  centeringScore?: number | null;
  edgesScore?: number | null;
  surfaceScore?: number | null;
  cornersScore?: number | null;
  eyeAppealScore?: number | null;
  height?: number;
}

// ─── Slab dimensions (Three.js units) ────────────────────────────────────────
const SLAB_W = 3.5;
const SLAB_H = 5.0;
const SLAB_D = 0.18;
const CARD_W = 2.9;
const CARD_H = 4.4;

// ─── Canvas texture dimensions ────────────────────────────────────────────────
const TEX_W = 512;
const TEX_H = 716;
const LABEL_H_FRAC = 0.28;  // 28% of texture height — matches LabelRenderer 3-column layout
const LABEL_H_PX = Math.round(TEX_H * LABEL_H_FRAC); // ~200px

// ─── Design tokens ────────────────────────────────────────────────────────────
const GOLD = "#c9a84c";
const NAVY_DARK = "#040810";
const NAVY = "#060d1e";
const BLUE_DIAMOND = "#82d2ff";

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface LabelParams {
  certId: string;
  score: string;
  diamondRating: number;
  cardName: string;
  cardYear: string;
  cardSet: string;
  centeringScore: number;
  edgesScore: number;
  surfaceScore: number;
  cornersScore: number;
  eyeAppealScore: number;
}

function drawDiamond(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  filled: boolean
) {
  const half = size * 0.42;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 4);
  if (filled) {
    ctx.fillStyle = BLUE_DIAMOND;
    ctx.shadowColor = "rgba(130,210,255,0.55)";
    ctx.shadowBlur = 3;  // Reduced from 7 — sharp diamond, no bleed over label
  } else {
    ctx.fillStyle = "rgba(130,210,255,0.15)";
    ctx.shadowBlur = 0;
  }
  ctx.fillRect(-half, -half, half * 2, half * 2);
  ctx.restore();
}

// ─── FRONT face canvas (label strip + card image area) ───────────────────────
// LABEL_H_PX ≈ 200px — replicates LabelRenderer 3-column layout
// 3 columns within 0–200px strip:
//   LEFT  (0–143px wide):   card photo thumbnail + DI badge + player name
//   CENTER (144–409px wide): DIAMOND INDEX™ header + score grid + FINAL SCORE panel
//   RIGHT  (410–512px wide): QR code + cert ID
// Gold vertical dividers at x=143 and x=410
// Card image fills TEX_H - LABEL_H_PX below the strip

function buildFrontLabelCanvas(params: LabelParams): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext("2d")!;

  // ── Column layout (mirrors LabelRenderer proportions) ──────────────────────
  // LEFT: 28% = ~143px  |  CENTER: 52% = ~266px  |  RIGHT: 20% = ~103px
  const LEFT_W   = Math.round(TEX_W * 0.28); // 143
  const RIGHT_W  = Math.round(TEX_W * 0.20); // 102
  const CENTER_W = TEX_W - LEFT_W - RIGHT_W;  // 267
  const DIV_X1   = LEFT_W;                    // 143
  const DIV_X2   = TEX_W - RIGHT_W;           // 410
  const H        = LABEL_H_PX;                // 200

  // ── Card area background (filled by compositeTexture) ──────────────────────
  ctx.fillStyle = "#0a1628";
  ctx.fillRect(0, H, TEX_W, TEX_H - H);

  // ── Label strip background — deep navy ────────────────────────────────────
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, TEX_W, H);

  // Outer gold border around label strip
  ctx.strokeStyle = "rgba(201,168,76,0.45)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, TEX_W - 1, H - 1);

  // Gold bottom border — sharp printed edge separating label from card
  ctx.strokeStyle = "rgba(201,168,76,0.95)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, H - 1);
  ctx.lineTo(TEX_W, H - 1);
  ctx.stroke();

  // ── LEFT COLUMN: placeholder for card photo (drawn in compositeTexture) ────
  // Draw a dark placeholder; compositeTexture will draw the actual card photo here
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(0, 0, LEFT_W, H);

  // DI badge — top-left corner (drawn as text "DI" in a circle)
  ctx.save();
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(18, 18, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = NAVY_DARK;
  ctx.font = "bold 9px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("DI", 18, 18);
  ctx.textBaseline = "alphabetic";
  ctx.restore();

  // Bottom gradient overlay in left column for text legibility
  const leftGrad = ctx.createLinearGradient(0, H - 55, 0, H);
  leftGrad.addColorStop(0, "rgba(6,13,30,0)");
  leftGrad.addColorStop(1, "rgba(6,13,30,0.95)");
  ctx.fillStyle = leftGrad;
  ctx.fillRect(0, H - 55, LEFT_W, 55);

  // Player name — bottom of left column
  const name = (params.cardName || "").toUpperCase().slice(0, 18);
  if (name) {
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "bold 11px Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(name, 6, H - 22);
  }
  const meta = [params.cardYear, params.cardSet].filter(Boolean).join(" ").slice(0, 20);
  if (meta) {
    ctx.fillStyle = "rgba(255,255,255,0.50)";
    ctx.font = "7px Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(meta, 6, H - 10);
  }

  // ── VERTICAL DIVIDERS ──────────────────────────────────────────────────────
  ctx.strokeStyle = "rgba(201,168,76,0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(DIV_X1, 0);
  ctx.lineTo(DIV_X1, H);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(DIV_X2, 0);
  ctx.lineTo(DIV_X2, H);
  ctx.stroke();

  // ── CENTER COLUMN: DIAMOND INDEX™ header + score grid + FINAL SCORE ────────
  const cx = DIV_X1; // center column starts at DIV_X1

  // Header: DIAMOND INDEX™
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "bold 11px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("DIAMOND INDEX™", cx + CENTER_W / 2, 14);

  // Header underline
  ctx.strokeStyle = "rgba(201,168,76,0.25)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx + 8, 18);
  ctx.lineTo(cx + CENTER_W - 8, 18);
  ctx.stroke();

  // Score grid — 2 columns of 2-3 rows each
  const categories = [
    { label: "CENTERING", score: params.centeringScore },
    { label: "EDGES",     score: params.edgesScore },
    { label: "SURFACE",   score: params.surfaceScore },
    { label: "CORNERS",   score: params.cornersScore },
    { label: "EYE APPEAL",score: params.eyeAppealScore },
  ];
  const colW = (CENTER_W - 16) / 2;
  const rowH = 18;
  const gridTop = 24;

  categories.forEach((cat, i) => {
    const col = i < 3 ? 0 : 1;
    const row = i < 3 ? i : i - 3;
    const gx = cx + 8 + col * (colW + 0);
    const gy = gridTop + row * rowH;

    // Diamond icon (small rotated square)
    const dh = 4;
    ctx.save();
    ctx.translate(gx + 5, gy + 5);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = BLUE_DIAMOND;
    ctx.fillRect(-dh, -dh, dh * 2, dh * 2);
    ctx.restore();

    // Category label
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "bold 8px Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(cat.label, gx + 12, gy + 8);

    // Score value
    ctx.fillStyle = GOLD;
    ctx.font = "bold 9px Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(Math.round(cat.score) + "%", gx + colW - 2, gy + 8);
  });

  // FINAL SCORE panel — dark box at bottom of center column
  const fsTop = H - 52;
  const fsPad = 8;
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(cx + fsPad, fsTop, CENTER_W - fsPad * 2, 44);
  ctx.strokeStyle = "rgba(201,168,76,0.35)";
  ctx.lineWidth = 0.8;
  ctx.strokeRect(cx + fsPad, fsTop, CENTER_W - fsPad * 2, 44);

  // "FINAL SCORE" label
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "bold 7px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("FINAL SCORE", cx + fsPad + 6, fsTop + 12);

  // Diamond rating row in FINAL SCORE panel
  const rating = Math.max(1, Math.min(5, Math.round(params.diamondRating)));
  for (let i = 0; i < 5; i++) {
    drawDiamond(ctx, cx + fsPad + 8 + i * 14, fsTop + 28, 8, i < rating);
  }

  // Score number — right side of FINAL SCORE panel
  ctx.fillStyle = GOLD;
  ctx.font = "bold 28px Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(params.score + "%", cx + CENTER_W - fsPad - 4, fsTop + 36);

  // Footer: VRC.7
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "6px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("— DIAMOND GRADED WITH VRC.7 —", cx + CENTER_W / 2, H - 4);

  // ── RIGHT COLUMN: QR code + cert ID ───────────────────────────────────────
  const rx = DIV_X2; // right column starts at DIV_X2
  const rcx = rx + RIGHT_W / 2; // center of right column

  // "SCAN TO VERIFY" label
  ctx.fillStyle = GOLD;
  ctx.font = "bold 7px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SCAN TO VERIFY", rcx, 14);

  // QR code placeholder — deterministic pixel grid from certId
  const QR_SIZE = 72;
  const qrX = Math.round(rcx - QR_SIZE / 2);
  const qrY = Math.round(H / 2 - QR_SIZE / 2 - 8);

  // White QR background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(qrX, qrY, QR_SIZE, QR_SIZE);

  // QR border
  ctx.strokeStyle = "rgba(201,168,76,0.70)";
  ctx.lineWidth = 1.2;
  ctx.strokeRect(qrX, qrY, QR_SIZE, QR_SIZE);

  // QR pixel grid (deterministic from certId)
  const MODULES = 15;
  const cellSize = QR_SIZE / MODULES;
  const seed = params.certId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = (n: number) => ((seed * 1103515245 + n * 12345) & 0x7fffffff) % 2;

  // Corner finder patterns
  const drawFinder = (ox: number, oy: number) => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(qrX + ox * cellSize, qrY + oy * cellSize, 7 * cellSize, 7 * cellSize);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(qrX + (ox + 1) * cellSize, qrY + (oy + 1) * cellSize, 5 * cellSize, 5 * cellSize);
    ctx.fillStyle = "#000000";
    ctx.fillRect(qrX + (ox + 2) * cellSize, qrY + (oy + 2) * cellSize, 3 * cellSize, 3 * cellSize);
  };
  drawFinder(0, 0);
  drawFinder(MODULES - 7, 0);
  drawFinder(0, MODULES - 7);

  // Data modules
  for (let row = 0; row < MODULES; row++) {
    for (let col = 0; col < MODULES; col++) {
      const inFinder =
        (row < 8 && col < 8) ||
        (row < 8 && col >= MODULES - 8) ||
        (row >= MODULES - 8 && col < 8);
      if (!inFinder) {
        if (rand(row * MODULES + col) === 1) {
          ctx.fillStyle = "#000000";
          ctx.fillRect(
            qrX + col * cellSize,
            qrY + row * cellSize,
            cellSize - 0.3,
            cellSize - 0.3
          );
        }
      }
    }
  }

  // Cert ID below QR
  ctx.fillStyle = "#7eb8f7";
  ctx.font = "bold 7px monospace";
  ctx.textAlign = "center";
  ctx.fillText(params.certId, rcx, qrY + QR_SIZE + 12);

  return canvas;
}

// ─── BACK face canvas — full DI certification back (NO card image) ────────────

function buildBackCertCanvas(params: LabelParams): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext("2d")!;

  // ── Full background ──
  const bg = ctx.createLinearGradient(0, 0, 0, TEX_H);
  bg.addColorStop(0, "#040a14");
  bg.addColorStop(0.5, NAVY);
  bg.addColorStop(1, NAVY_DARK);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Subtle center glow
  const glow = ctx.createRadialGradient(TEX_W / 2, TEX_H * 0.35, 0, TEX_W / 2, TEX_H * 0.35, 200);
  glow.addColorStop(0, "rgba(130,210,255,0.05)");
  glow.addColorStop(1, "rgba(130,210,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // ── Gold border frame ──
  ctx.strokeStyle = "rgba(201,168,76,0.55)";
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, TEX_W - 20, TEX_H - 20);
  ctx.strokeStyle = "rgba(201,168,76,0.18)";
  ctx.lineWidth = 1;
  ctx.strokeRect(16, 16, TEX_W - 32, TEX_H - 32);

  // ── Header ──
  ctx.fillStyle = GOLD;
  ctx.font = "bold 15px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("DIAMOND INDEX™", TEX_W / 2, 42);

  ctx.strokeStyle = "rgba(201,168,76,0.35)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(40, 52);
  ctx.lineTo(TEX_W - 40, 52);
  ctx.stroke();

  // ── Large DI diamond logo ──
  const LOGO_SIZE = 80;
  const LOGO_CX = TEX_W / 2;
  const LOGO_CY = 128;
  const half = LOGO_SIZE * 0.42;

  // Outer glow
  ctx.save();
  ctx.translate(LOGO_CX, LOGO_CY);
  ctx.rotate(Math.PI / 4);
  ctx.shadowColor = "rgba(130,210,255,0.45)";
  ctx.shadowBlur = 32;
  ctx.fillStyle = "rgba(130,210,255,0.10)";
  ctx.fillRect(-half * 1.4, -half * 1.4, half * 2.8, half * 2.8);
  ctx.restore();

  // Diamond body
  ctx.save();
  ctx.translate(LOGO_CX, LOGO_CY);
  ctx.rotate(Math.PI / 4);
  const dGrad = ctx.createLinearGradient(-half, -half, half, half);
  dGrad.addColorStop(0, "#a8dcff");
  dGrad.addColorStop(0.5, BLUE_DIAMOND);
  dGrad.addColorStop(1, "#5ab8f0");
  ctx.fillStyle = dGrad;
  ctx.shadowColor = "rgba(130,210,255,0.8)";
  ctx.shadowBlur = 18;
  ctx.fillRect(-half, -half, half * 2, half * 2);
  // Inner highlight
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.fillRect(-half * 0.45, -half * 0.45, half * 0.9, half * 0.9);
  ctx.restore();

  // "DI" text inside diamond
  ctx.fillStyle = "rgba(4,10,20,0.88)";
  ctx.font = "bold 22px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("DI", LOGO_CX, LOGO_CY);
  ctx.textBaseline = "alphabetic";

  // ── CERTIFIED AUTHENTIC badge ──
  const BADGE_Y = 192;
  const BADGE_W = 220;
  const BADGE_H = 26;
  const BADGE_X = (TEX_W - BADGE_W) / 2;
  const badgeGrad = ctx.createLinearGradient(BADGE_X, BADGE_Y, BADGE_X + BADGE_W, BADGE_Y);
  badgeGrad.addColorStop(0, "rgba(201,168,76,0)");
  badgeGrad.addColorStop(0.2, "rgba(201,168,76,0.18)");
  badgeGrad.addColorStop(0.5, "rgba(201,168,76,0.28)");
  badgeGrad.addColorStop(0.8, "rgba(201,168,76,0.18)");
  badgeGrad.addColorStop(1, "rgba(201,168,76,0)");
  ctx.fillStyle = badgeGrad;
  ctx.fillRect(BADGE_X, BADGE_Y, BADGE_W, BADGE_H);
  ctx.strokeStyle = "rgba(201,168,76,0.4)";
  ctx.lineWidth = 0.8;
  ctx.strokeRect(BADGE_X, BADGE_Y, BADGE_W, BADGE_H);
  ctx.fillStyle = GOLD;
  ctx.font = "bold 11px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("✦  CERTIFIED AUTHENTIC  ✦", TEX_W / 2, BADGE_Y + 17);

  // ── Cert ID ──
  ctx.fillStyle = "rgba(255,255,255,0.32)";
  ctx.font = "8px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("CERTIFICATION NUMBER", TEX_W / 2, 240);
  ctx.fillStyle = "#7eb8f7";
  ctx.font = "bold 18px monospace";
  ctx.textAlign = "center";
  ctx.fillText(params.certId, TEX_W / 2, 262);

  // Divider
  ctx.strokeStyle = "rgba(201,168,76,0.22)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(40, 274);
  ctx.lineTo(TEX_W - 40, 274);
  ctx.stroke();

  // ── QR code placeholder ──
  const QR_SIZE = 108;
  const QR_X = (TEX_W - QR_SIZE) / 2;
  const QR_Y = 284;
  const CELL = 9;
  const COLS = Math.floor(QR_SIZE / CELL);

  // QR background
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(QR_X - 4, QR_Y - 4, QR_SIZE + 8, QR_SIZE + 8);
  ctx.strokeStyle = "rgba(201,168,76,0.7)";
  ctx.lineWidth = 1.2;
  ctx.strokeRect(QR_X - 4, QR_Y - 4, QR_SIZE + 8, QR_SIZE + 8);

  // Deterministic QR-like pattern seeded from certId
  const seed = params.certId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  for (let r = 0; r < COLS; r++) {
    for (let c = 0; c < COLS; c++) {
      // Corner finder patterns
      const isCorner =
        (r < 3 && c < 3) ||
        (r < 3 && c >= COLS - 3) ||
        (r >= COLS - 3 && c < 3);
      if (isCorner) {
        ctx.fillStyle = "rgba(130,210,255,0.85)";
        ctx.fillRect(QR_X + c * CELL, QR_Y + r * CELL, CELL - 1, CELL - 1);
      } else {
        const bit = ((seed * (r * 13 + c * 7 + 3)) % 17) > 8;
        if (bit) {
          ctx.fillStyle = "rgba(130,210,255,0.65)";
          ctx.fillRect(QR_X + c * CELL, QR_Y + r * CELL, CELL - 1, CELL - 1);
        }
      }
    }
  }

  // "SCAN TO VERIFY" label
  ctx.fillStyle = "rgba(201,168,76,0.65)";
  ctx.font = "bold 9px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SCAN TO VERIFY", TEX_W / 2, QR_Y + QR_SIZE + 16);

  // Divider
  ctx.strokeStyle = "rgba(201,168,76,0.22)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(40, QR_Y + QR_SIZE + 22);
  ctx.lineTo(TEX_W - 40, QR_Y + QR_SIZE + 22);
  ctx.stroke();

  // ── 5-category score grid ──
  const scores = [
    { label: "CENTERING",  value: params.centeringScore },
    { label: "EDGES",      value: params.edgesScore },
    { label: "SURFACE",    value: params.surfaceScore },
    { label: "CORNERS",    value: params.cornersScore },
    { label: "EYE APPEAL", value: params.eyeAppealScore },
  ];

  const GRID_START_Y = QR_Y + QR_SIZE + 34;
  const COL1_X = 32;
  const COL2_X = TEX_W / 2 + 16;
  const ROW_H = 22;

  scores.forEach((s, i) => {
    const col = i < 3 ? 0 : 1;
    const row = i < 3 ? i : i - 3;
    const x = col === 0 ? COL1_X : COL2_X;
    const y = GRID_START_Y + row * ROW_H;
    const rightEdge = col === 0 ? TEX_W / 2 - 10 : TEX_W - 22;

    drawDiamond(ctx, x + 5, y - 3, 9, true);

    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "bold 8px Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(s.label, x + 14, y);

    ctx.fillStyle = GOLD;
    ctx.font = "bold 10px Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${Math.round(s.value)}`, rightEdge, y);
  });

  // ── Footer ──
  ctx.strokeStyle = "rgba(201,168,76,0.22)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(40, TEX_H - 28);
  ctx.lineTo(TEX_W - 40, TEX_H - 28);
  ctx.stroke();

  ctx.fillStyle = "rgba(201,168,76,0.4)";
  ctx.font = "7px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("— GRADED WITH VRC.7 STANDARD —", TEX_W / 2, TEX_H - 18);

  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.font = "6px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("diamondindex.com", TEX_W / 2, TEX_H - 8);

  return canvas;
}// ─── Composite: draw card image into card area of front label canvas ────────────

function compositeTexture(
  labelCanvas: HTMLCanvasElement,
  cardImage: CanvasImageSource
): THREE.CanvasTexture {
  const out = document.createElement("canvas");
  out.width = TEX_W;
  out.height = TEX_H;
  const ctx = out.getContext("2d")!;

  // Card image fills the bottom card area (below label strip)
  ctx.drawImage(cardImage, 0, LABEL_H_PX, TEX_W, TEX_H - LABEL_H_PX);

  // Label strip base (all columns except left photo column)
  ctx.drawImage(labelCanvas, 0, 0, TEX_W, LABEL_H_PX, 0, 0, TEX_W, LABEL_H_PX);

  // Card photo thumbnail in left column of label strip
  // LEFT_W = 28% of TEX_W = ~143px
  const LEFT_W = Math.round(TEX_W * 0.28);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, LEFT_W, LABEL_H_PX);
  ctx.clip();
  ctx.drawImage(cardImage, 0, 0, LEFT_W, LABEL_H_PX);
  ctx.restore();

  // Re-draw left column overlays (DI badge + name gradient) from label canvas on top of photo
  ctx.drawImage(labelCanvas, 0, 0, LEFT_W, LABEL_H_PX, 0, 0, LEFT_W, LABEL_H_PX);

  const tex = new THREE.CanvasTexture(out);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ─── Slab mesh ────────────────────────────────────────────────────────────────

interface SlabMeshProps {
  frontTexture: THREE.Texture;
  backTexture: THREE.Texture;
  autoRotate: boolean;
}

function SlabMesh({ frontTexture, backTexture, autoRotate }: SlabMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  // Hero angle: dead face-on (Y=0) so label + card are both fully visible on load.
  // Tiny X tilt (0.04 rad ≈ 2.3°) so the top edge catches a hint of light.
  const rotationRef = useRef({ y: 0.0, x: 0.04 });

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    if (autoRotate) {
      rotationRef.current.y += delta * 0.35;
    }
    groupRef.current.rotation.y = rotationRef.current.y;
    groupRef.current.rotation.x = rotationRef.current.x;
  });

  // Crystal-clear acrylic sides
  const acrylicSide = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xe8f4ff),
    transparent: true,
    opacity: 0.08,
    roughness: 0.02,
    metalness: 0.0,
    transmission: 0.95,
    thickness: 0.15,
    ior: 1.49,
    reflectivity: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
  });

  const goldMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xc9a84c),
    metalness: 0.9,
    roughness: 0.18,
  });

  const frontMaterial = new THREE.MeshStandardMaterial({
    map: frontTexture,
    roughness: 0.72,  // Higher roughness = less specular glare, more matte printed look
    metalness: 0.0,
  });

  const backMaterial = new THREE.MeshStandardMaterial({
    map: backTexture,
    roughness: 0.72,
    metalness: 0.0,
  });

  // BoxGeometry face order: +X(right), -X(left), +Y(top), -Y(bottom), +Z(front), -Z(back)
  const slabMaterials = [
    acrylicSide,   // right
    acrylicSide,   // left
    acrylicSide,   // top
    acrylicSide,   // bottom
    frontMaterial, // front (+Z)
    backMaterial,  // back (-Z)
  ];

  // Card edge — thin cream-white box inside the slab at z=0
  const cardEdgeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xf5f0e8),
    roughness: 0.55,
    metalness: 0.0,
  });

  return (
    <group ref={groupRef}>
      {/* Main slab body */}
      <mesh material={slabMaterials} castShadow receiveShadow>
        <boxGeometry args={[SLAB_W, SLAB_H, SLAB_D, 1, 1, 1]} />
      </mesh>

      {/* Card edge layer — simulates physical card thickness visible from the side */}
      <mesh position={[0, 0, 0]} material={cardEdgeMat}>
        <boxGeometry args={[CARD_W, CARD_H, 0.009]} />
      </mesh>

      {/* Subtle acrylic sheen on front face — very low opacity, no reflectivity over label */}
      <mesh position={[0, 0, SLAB_D / 2 + 0.001]}>
        <planeGeometry args={[CARD_W, CARD_H]} />
        <meshPhysicalMaterial
          color={new THREE.Color(0xe8f4ff)}
          transparent
          opacity={0.015}
          roughness={0.0}
          metalness={0.0}
          reflectivity={0.15}
        />
      </mesh>

      {/* Gold border trim */}
      <mesh position={[0, SLAB_H / 2 + 0.015, 0]} material={goldMaterial}>
        <boxGeometry args={[SLAB_W + 0.04, 0.03, SLAB_D + 0.04]} />
      </mesh>
      <mesh position={[0, -(SLAB_H / 2 + 0.015), 0]} material={goldMaterial}>
        <boxGeometry args={[SLAB_W + 0.04, 0.03, SLAB_D + 0.04]} />
      </mesh>
      <mesh position={[-(SLAB_W / 2 + 0.015), 0, 0]} material={goldMaterial}>
        <boxGeometry args={[0.03, SLAB_H + 0.04, SLAB_D + 0.04]} />
      </mesh>
      <mesh position={[SLAB_W / 2 + 0.015, 0, 0]} material={goldMaterial}>
        <boxGeometry args={[0.03, SLAB_H + 0.04, SLAB_D + 0.04]} />
      </mesh>
    </group>
  );
}

// ─── Scene: loads front image only, back is always pure cert canvas ───────────

interface SceneProps {
  frontImageUrl: string;
  backImageUrl?: string | null;
  certId: string;
  score: string;
  diamondRating: number;
  cardName: string;
  cardYear: string;
  cardSet: string;
  centeringScore: number;
  edgesScore: number;
  surfaceScore: number;
  cornersScore: number;
  eyeAppealScore: number;
  autoRotate: boolean;
}

function SceneWithTextures({
  frontImageUrl,
  certId,
  score,
  diamondRating,
  cardName,
  cardYear,
  cardSet,
  centeringScore,
  edgesScore,
  surfaceScore,
  cornersScore,
  eyeAppealScore,
  autoRotate,
}: SceneProps) {
  const params: LabelParams = {
    certId, score, diamondRating, cardName, cardYear, cardSet,
    centeringScore, edgesScore, surfaceScore, cornersScore, eyeAppealScore,
  };

  // Only load the front card image — back is NEVER a card photo
  const frontImg = useLoader(TextureLoader, frontImageUrl, (loader) => {
    (loader as THREE.TextureLoader).crossOrigin = "anonymous";
  });

  const frontTexture = React.useMemo(() => {
    const labelCanvas = buildFrontLabelCanvas(params);
    if (frontImg.image) return compositeTexture(labelCanvas, frontImg.image as CanvasImageSource);
    const tex = new THREE.CanvasTexture(labelCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frontImg]);

  // Back is always the DI certification canvas — no card image
  const backTexture = React.useMemo(() => {
    const c = buildBackCertCanvas(params);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certId, score]);

  return <SlabMesh frontTexture={frontTexture} backTexture={backTexture} autoRotate={autoRotate} />;
}

// ─── Fallback scene (no image URL) ───────────────────────────────────────────

type FallbackProps = Omit<SceneProps, "frontImageUrl" | "backImageUrl">;

function SceneWithFallback(props: FallbackProps) {
  const params: LabelParams = {
    certId: props.certId,
    score: props.score,
    diamondRating: props.diamondRating,
    cardName: props.cardName,
    cardYear: props.cardYear,
    cardSet: props.cardSet,
    centeringScore: props.centeringScore,
    edgesScore: props.edgesScore,
    surfaceScore: props.surfaceScore,
    cornersScore: props.cornersScore,
    eyeAppealScore: props.eyeAppealScore,
  };

  const frontTexture = React.useMemo(() => {
    const c = buildFrontLabelCanvas(params);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const backTexture = React.useMemo(() => {
    const c = buildBackCertCanvas(params);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <SlabMesh frontTexture={frontTexture} backTexture={backTexture} autoRotate={props.autoRotate} />;
}

// ─── Error boundary ───────────────────────────────────────────────────────────

class TextureErrorBoundary extends React.Component<
  FallbackProps & { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: FallbackProps & { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      const { children: _c, ...rest } = this.props;
      return <SceneWithFallback {...rest} />;
    }
    return this.props.children;
  }
}

// ─── WebGL check ─────────────────────────────────────────────────────────────

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function CardSlab3D({
  frontImageUrl,
  backImageUrl: _backImageUrl, // accepted for API compat but not used on back face
  certId = "DI-0000-0000",
  score,
  diamondRating = 3,
  cardName = "",
  cardYear = "",
  cardSet = "",
  centeringScore = 90,
  edgesScore = 90,
  surfaceScore = 90,
  cornersScore = 90,
  eyeAppealScore = 90,
  height = 480,
}: CardSlab3DProps) {
  const [webglAvailable] = useState(() => isWebGLAvailable());
  const [autoRotate, setAutoRotate] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const [showFlipHint, setShowFlipHint] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  // certPhase: 0=blur+dim, 1=certifying text, 2=scan, 3=certified reveal, 4=done
  const [certPhase, setCertPhase] = useState(0);
  const [glowPulse, setGlowPulse] = useState(false);
  const [showShimmer, setShowShimmer] = useState(false);
  const slabRef = useRef<HTMLDivElement>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scoreStr = score != null
    ? String(parseFloat(String(score)).toFixed(1))
    : "—";

  const handleInteractStart = () => {
    setIsInteracting(true);
    setAutoRotate(false);
    setShowFlipHint(false);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  };

  const handleInteractEnd = () => {
    setIsInteracting(false);
    resumeTimerRef.current = setTimeout(() => setAutoRotate(true), 3000);
  };

  const [shareCopied, setShareCopied] = useState(false);
  const shareCopyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enterFocus = () => setFocusMode(true);
  const exitFocus = () => setFocusMode(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation(); // don't close focus mode
    const url = `${window.location.origin}/verify/${certId}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      if (shareCopyTimerRef.current) clearTimeout(shareCopyTimerRef.current);
      shareCopyTimerRef.current = setTimeout(() => setShareCopied(false), 2000);
    }).catch(() => {
      // Fallback: select a temp input
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setShareCopied(true);
      if (shareCopyTimerRef.current) clearTimeout(shareCopyTimerRef.current);
      shareCopyTimerRef.current = setTimeout(() => setShareCopied(false), 2000);
    });
  };

  // Escape key exits focus mode
  useEffect(() => {
    if (!focusMode) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") exitFocus(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusMode]);

  // Prevent body scroll while in focus mode
  useEffect(() => {
    if (focusMode) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [focusMode]);

  // Certification moment sequence — plays once on mount
  useEffect(() => {
    // Phase 0 → 1: show "CERTIFYING…" after 400ms
    const t1 = setTimeout(() => setCertPhase(1), 400);
    // Phase 1 → 2: scan line starts at 900ms
    const t2 = setTimeout(() => setCertPhase(2), 900);
    // Phase 2 → 3: "CERTIFIED" reveal at 1500ms
    const t3 = setTimeout(() => setCertPhase(3), 1500);
    // Phase 3 → 4: overlay fades out at 2100ms
    const t4 = setTimeout(() => setCertPhase(4), 2100);
    // Glow pulse fires at 2100ms
    const t5 = setTimeout(() => {
      setGlowPulse(true);
      setTimeout(() => setGlowPulse(false), 700);
    }, 2100);
    // Shimmer sweep fires at 2200ms (just after overlay fades)
    const t6 = setTimeout(() => setShowShimmer(true), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); clearTimeout(t6); };
  }, []);

  useEffect(() => {
    // Hide flip hint after 4 seconds
    const t = setTimeout(() => setShowFlipHint(false), 4000);
    return () => {
      clearTimeout(t);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const fallbackProps: FallbackProps = {
    certId,
    score: scoreStr,
    diamondRating: diamondRating ?? 3,
    cardName: cardName ?? "",
    cardYear: cardYear ?? "",
    cardSet: cardSet ?? "",
    centeringScore: centeringScore ?? 90,
    edgesScore: edgesScore ?? 90,
    surfaceScore: surfaceScore ?? 90,
    cornersScore: cornersScore ?? 90,
    eyeAppealScore: eyeAppealScore ?? 90,
    autoRotate,
  };

  // Fallback for no WebGL
  if (!webglAvailable) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center bg-[#060d1e] rounded-xl border border-[rgba(201,168,76,0.2)]"
      >
        {frontImageUrl ? (
          <img
            src={frontImageUrl}
            alt="Graded card"
            className="h-full object-contain rounded"
            style={{ maxHeight: height - 32 }}
          />
        ) : (
          <div className="text-center text-[#a0b4c8]">
            <div className="text-4xl mb-2">◆</div>
            <div className="text-sm font-mono">{certId}</div>
          </div>
        )}
      </div>
    );
  }

  // The slab canvas — shared between normal and focus mode
  const slabCanvas = (
    <div
      ref={slabRef}
      style={{
        height: focusMode ? Math.min(height * 1.25, window.innerHeight * 0.75) : height,
        width: focusMode ? "min(480px, 90vw)" : "100%",
        cursor: isInteracting ? "grabbing" : "grab",
        transition: "height 0.3s ease, width 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease",
        transform: focusMode ? "scale(1.04)" : "scale(1)",
        boxShadow: focusMode
          ? "0 0 60px 8px rgba(201,168,76,0.18), 0 0 120px 20px rgba(10,22,40,0.7)"
          : "none",
        borderRadius: "0.75rem",
        overflow: "hidden",
        position: "relative",
        background: "linear-gradient(to bottom, #060d1e, #0a1628)",
      }}
      onMouseDown={handleInteractStart}
      onMouseUp={handleInteractEnd}
      onTouchStart={handleInteractStart}
      onTouchEnd={handleInteractEnd}
    >
      {/* Focus mode exit hint */}
      {focusMode && (
        <div
          className="absolute top-3 right-3 z-20 flex items-center gap-1.5 pointer-events-none"
          style={{ opacity: 0.6 }}
        >
          <span className="text-[9px] tracking-widest uppercase" style={{ color: "rgba(201,168,76,0.8)" }}>
            ESC to exit
          </span>
        </div>
      )}

      {/* Flip hint */}
      {showFlipHint && (
        <div
          className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-2 z-10 pointer-events-none"
          style={{ animation: "fadeInOut 4s ease forwards" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="rgba(201,168,76,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
          <span className="text-[10px] tracking-widest uppercase" style={{ color: "rgba(201,168,76,0.7)" }}>
            Drag to flip
          </span>
        </div>
      )}

      {!showFlipHint && (
        <div className="absolute bottom-3 left-0 right-0 text-center text-[10px] text-[rgba(160,180,200,0.35)] pointer-events-none z-10 tracking-widest uppercase">
          Drag to rotate
        </div>
      )}

      {/* ── Shimmer sweep — plays once after certification ── */}
      {showShimmer && (
        <div
          onAnimationEnd={() => setShowShimmer(false)}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 31,
            borderRadius: "0.75rem",
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-20%",
              left: "-30%",
              width: "24px",
              height: "140%",
              background: "linear-gradient(90deg, transparent 0%, rgba(255,252,230,0.20) 40%, rgba(201,168,76,0.12) 50%, rgba(255,252,230,0.20) 60%, transparent 100%)",
              transform: "skewX(-18deg)",
              animation: "shimmerSweep 0.65s cubic-bezier(0.4,0,0.2,1) forwards",
            }}
          />
        </div>
      )}

      {/* ── Certification moment overlay ── */}
      {certPhase < 4 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 30,
            borderRadius: "0.75rem",
            overflow: "hidden",
            pointerEvents: "none",
            // Dim + blur the slab underneath
            backdropFilter: certPhase < 4 ? "blur(3px)" : "none",
            WebkitBackdropFilter: certPhase < 4 ? "blur(3px)" : "none",
            backgroundColor: "rgba(4,8,20,0.55)",
            transition: "opacity 0.5s ease, backdrop-filter 0.5s ease",
            opacity: certPhase < 4 ? 1 : 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {/* CERTIFYING text — phases 1 */}
          {certPhase === 1 && (
            <div style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "13px",
              letterSpacing: "0.25em",
              color: "rgba(201,168,76,0.85)",
              textTransform: "uppercase",
              animation: "certTextIn 0.4s ease forwards",
            }}>
              CERTIFYING…
            </div>
          )}

          {/* Scan line — phase 2 */}
          {certPhase === 2 && (
            <>
              <div style={{
                fontFamily: "'Courier New', monospace",
                fontSize: "13px",
                letterSpacing: "0.25em",
                color: "rgba(201,168,76,0.6)",
                textTransform: "uppercase",
              }}>
                CERTIFYING…
              </div>
              <div style={{
                position: "absolute",
                left: 0,
                right: 0,
                height: "1.5px",
                background: "linear-gradient(90deg, transparent 0%, rgba(120,200,255,0.0) 5%, rgba(120,200,255,0.9) 40%, rgba(180,230,255,1) 50%, rgba(120,200,255,0.9) 60%, rgba(120,200,255,0.0) 95%, transparent 100%)",
                boxShadow: "0 0 8px 2px rgba(120,200,255,0.4)",
                animation: "scanLine 0.6s ease forwards",
                top: 0,
              }} />
            </>
          )}

          {/* CERTIFIED reveal — phase 3 */}
          {certPhase === 3 && (
            <div style={{ textAlign: "center", animation: "certReveal 0.4s ease forwards" }}>
              <div style={{
                fontFamily: "'Courier New', monospace",
                fontSize: "14px",
                letterSpacing: "0.22em",
                color: "rgba(201,168,76,1)",
                textTransform: "uppercase",
                fontWeight: 700,
                marginBottom: "6px",
              }}>
                CERTIFIED — {certId}
              </div>
              <div style={{
                fontFamily: "'Courier New', monospace",
                fontSize: "9px",
                letterSpacing: "0.18em",
                color: "rgba(160,200,240,0.7)",
                textTransform: "uppercase",
              }}>
                Verified on Diamond Index™
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes certTextIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanLine {
          0%   { top: 0%;   opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes certReveal {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes glowRing {
          0%   { box-shadow: 0 0 0px 0px rgba(201,168,76,0); }
          40%  { box-shadow: 0 0 24px 6px rgba(201,168,76,0.45); }
          100% { box-shadow: 0 0 0px 0px rgba(201,168,76,0); }
        }
        @keyframes fadeInOut {
          0%   { opacity: 0; }
          15%  { opacity: 1; }
          75%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes focusBackdropIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to   { opacity: 1; backdrop-filter: blur(8px); }
        }
        @keyframes shimmerSweep {
          0%   { left: -30%; opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { left: 130%; opacity: 0; }
        }
      `}</style>

      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 52 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[5, 8, 6]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
          color={new THREE.Color(0xfff8f0)}
        />
        <directionalLight
          position={[-4, -3, 4]}
          intensity={0.5}
          color={new THREE.Color(0xd0e8ff)}
        />
        <pointLight
          position={[0, 0, 8]}
          intensity={focusMode ? 0.6 : 0.3}
          color={new THREE.Color(0xc9a84c)}
        />
        <Environment preset="studio" />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={(3 * Math.PI) / 4}
          rotateSpeed={0.6}
          dampingFactor={0.08}
          enableDamping
        />
        <Suspense fallback={<SceneWithFallback {...fallbackProps} />}>
          <TextureErrorBoundary {...fallbackProps}>
            {frontImageUrl ? (
              <SceneWithTextures {...fallbackProps} frontImageUrl={frontImageUrl} />
            ) : (
              <SceneWithFallback {...fallbackProps} />
            )}
          </TextureErrorBoundary>
        </Suspense>
      </Canvas>
    </div>
  );

  return (
    <div
      style={{
        height,
        position: "relative",
        borderRadius: "0.75rem",
        animation: glowPulse ? "glowRing 0.7s ease forwards" : "none",
      }}
    >
      {/* Normal (non-focus) slab — click to enter focus mode */}
      {!focusMode && (
        <div
          style={{ height: "100%", cursor: "pointer" }}
          onClick={enterFocus}
          title="Click to focus"
        >
          {slabCanvas}
        </div>
      )}

      {/* Focus mode: portal-style fixed overlay */}
      {focusMode && (
        <>
          {/* Backdrop — click outside to exit */}
          <div
            onClick={exitFocus}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9998,
              backgroundColor: "rgba(4,8,16,0.75)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              transition: "opacity 0.3s ease, backdrop-filter 0.3s ease",
              animation: "focusBackdropIn 0.3s ease forwards",
            }}
          />
          {/* Centered slab + share button — stop propagation so clicking slab doesn't close */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              pointerEvents: "none",
            }}
          >
            <div style={{ pointerEvents: "auto" }}>
              {slabCanvas}
            </div>

            {/* Share button row */}
            <div
              style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: "12px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleShare}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 16px",
                  background: "transparent",
                  border: "1px solid rgba(201,168,76,0.55)",
                  borderRadius: "6px",
                  color: "rgba(201,168,76,0.9)",
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,168,76,0.08)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.85)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.55)";
                }}
              >
                {/* Share icon */}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                {shareCopied ? "Link Copied!" : "Share"}
              </button>

              {/* Inline toast confirmation */}
              {shareCopied && (
                <span
                  style={{
                    fontSize: "10px",
                    color: "rgba(130,210,255,0.85)",
                    letterSpacing: "0.08em",
                    animation: "fadeInOut 2s ease forwards",
                  }}
                >
                  {`${window.location.origin}/verify/${certId}`}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
