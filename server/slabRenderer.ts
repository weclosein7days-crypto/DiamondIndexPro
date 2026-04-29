/**
 * Slab Render Pipeline
 *
 * After a card is graded and saved, this module generates:
 * 1. 3D front slab render — card front image + DI navy label (diamonds + cert ID)
 * 2. 3D back slab render — card back image + DI cert label (FINAL SCORE / scores / CERTIFIED AUTHENTIC)
 * 3. Composite mock — front + back side by side
 *
 * All renders are stored in S3 and URLs are saved to the gradedCards table.
 *
 * LOCKED DESIGN (from approved renders):
 * - Clear acrylic slab, NO gold border
 * - Dark navy/black background with deep blue atmospheric glow
 * - Front label: navy blue, DIAMOND INDEX™, 5 diamonds, DI badge, CERT ID
 * - Back label: FINAL SCORE / score in silver (left), DIAMOND INDEX™ / CERTIFIED AUTHENTIC / cert ID (center), QR (right)
 */

import { generateImage } from "./_core/imageGeneration";
import { storagePut } from "./storage";
import { updateCardSlabRenders } from "./db";

export interface SlabRenderInput {
  cardId: number;
  certId: string;
  overallScore: number;
  diamondRating: number;
  centeringScore?: number;
  edgesScore?: number;
  cornersScore?: number;
  surfaceScore?: number;
  eyeAppealScore?: number;
  frontImageUrl?: string;
  backImageUrl?: string;
  cardName?: string;
  cardSet?: string;
  cardYear?: string;
}

function buildDiamondLabel(diamondRating: number): string {
  const filled = "◆".repeat(diamondRating);
  const empty = "◇".repeat(5 - diamondRating);
  return `${filled}${empty} DIAMONDS`;
}

function buildFrontSlabPrompt(input: SlabRenderInput): string {
  const diamondLabel = buildDiamondLabel(input.diamondRating);
  const cardDesc = [input.cardYear, input.cardName, input.cardSet].filter(Boolean).join(" ");

  return `Ultra-premium photorealistic product render of a graded trading card in a clear acrylic slab. 
Slight tilt to the right, dark navy/black background with deep blue atmospheric glow from below, studio lighting with soft specular highlights on the acrylic edges.
CLEAR acrylic frame ONLY — absolutely NO gold border, NO gold outline, NO metallic trim anywhere.

The top 28% of the slab face shows the Diamond Index™ navy blue certification label:
- Deep navy background
- "DIAMOND INDEX™" in bold white text at top center
- Five 3D photorealistic sparkling diamond gems in a row across the center
- DI silver diamond badge (diamond shape with DI letters) on the left
- "Certified Grading / VRC-7 Standard" small text on the right
- "${diamondLabel}" in spaced gold letters below the gems
- "CERT ID: ${input.certId}" in gold text at the bottom of the label

The bottom 72% shows the front of the trading card${cardDesc ? ` — ${cardDesc}` : ""}.

8K photorealistic, cinematic product photography, pristine clear acrylic, no scratches on slab.`;
}

function buildBackSlabPrompt(input: SlabRenderInput): string {
  const centering = input.centeringScore?.toFixed(0) ?? "—";
  const edges = input.edgesScore?.toFixed(0) ?? "—";
  const corners = input.cornersScore?.toFixed(0) ?? "—";
  const surface = input.surfaceScore?.toFixed(0) ?? "—";
  const eyeAppeal = input.eyeAppealScore?.toFixed(0) ?? "—";
  const finalScore = input.overallScore.toFixed(1);
  const cardDesc = [input.cardYear, input.cardName, input.cardSet].filter(Boolean).join(" ");

  return `Ultra-premium photorealistic product render of the BACK of a graded trading card in a clear acrylic slab.
Same angle and lighting — slight tilt, dark navy/black background with deep blue atmospheric glow, studio lighting with soft specular highlights.
CLEAR acrylic frame ONLY — absolutely NO gold border, NO gold outline, NO metallic trim anywhere.

The top 35% of the slab face shows the Diamond Index™ back certification label with EXACTLY this layout:
- Dark navy blue background
- LEFT column: "FINAL SCORE" in small silver uppercase letters, then "${finalScore}" in larger silver text below it — vertically centered, authoritative
- CENTER column: "DIAMOND INDEX™" in small white text at top, then a thin hairline rule, then "CERTIFIED AUTHENTIC" in bold gold with thin hairline rules above AND below it (like an official seal stamp), then "${input.certId}" in smaller gold text with breathing room below
- RIGHT: clean black and white QR code
- Below the header: score grid — CENTERING ${centering}% | SURFACE ${surface}% | CORNERS ${corners}% | EDGES ${edges}% | EYE APPEAL ${eyeAppeal}%

The bottom 65% shows the BACK of the trading card${cardDesc ? ` — ${cardDesc}` : ""}.

8K photorealistic, cinematic product photography, pristine clear acrylic.`;
}

/**
 * Generate all 3 slab renders for a graded card.
 * Runs asynchronously after saveCard — does not block the grading response.
 */
export async function generateSlabRenders(input: SlabRenderInput): Promise<void> {
  try {
    console.log(`[SlabRenderer] Starting render for card ${input.cardId} (${input.certId})`);

    // Build image generation options
    const frontOptions: Parameters<typeof generateImage>[0] = {
      prompt: buildFrontSlabPrompt(input),
    };
    if (input.frontImageUrl) {
      frontOptions.originalImages = [{ url: input.frontImageUrl, mimeType: "image/jpeg" }];
    }

    const backOptions: Parameters<typeof generateImage>[0] = {
      prompt: buildBackSlabPrompt(input),
    };
    if (input.backImageUrl) {
      backOptions.originalImages = [{ url: input.backImageUrl, mimeType: "image/jpeg" }];
    } else if (input.frontImageUrl) {
      // Fall back to front image if no back provided
      backOptions.originalImages = [{ url: input.frontImageUrl, mimeType: "image/jpeg" }];
    }

    // Generate front and back in parallel
    const [frontResult, backResult] = await Promise.all([
      generateImage(frontOptions),
      generateImage(backOptions),
    ]);

    const slabFrontUrl = frontResult.url ?? null;
    const slabBackUrl = backResult.url ?? null;

    // Generate composite (front + back side by side) using Python PIL via a stored script approach
    // We'll use a simple approach: store both URLs and generate composite via a separate call
    let slabCompositeUrl: string | null = null;

    if (slabFrontUrl && slabBackUrl) {
      slabCompositeUrl = await generateComposite(slabFrontUrl, slabBackUrl, input.cardId);
    }

    // Update DB with generated asset URLs
    await updateCardSlabRenders(input.cardId, {
      slabFrontUrl,
      slabBackUrl,
      slabCompositeUrl,
    });

    console.log(`[SlabRenderer] Renders complete for card ${input.cardId}`);
  } catch (err) {
    console.error(`[SlabRenderer] Failed to generate renders for card ${input.cardId}:`, err);
    // Non-fatal — card is already saved, renders can be retried
  }
}

/**
 * Generate a side-by-side composite of front and back slab renders.
 * Downloads both images, composites with PIL via child process, uploads to S3.
 */
async function generateComposite(
  frontUrl: string,
  backUrl: string,
  cardId: number
): Promise<string | null> {
  try {
    const { execSync } = await import("child_process");
    const { writeFileSync, readFileSync, unlinkSync } = await import("fs");
    const { tmpdir } = await import("os");
    const { join } = await import("path");

    // Download front and back images
    const [frontResp, backResp] = await Promise.all([
      fetch(frontUrl),
      fetch(backUrl),
    ]);
    const frontBuffer = Buffer.from(await frontResp.arrayBuffer());
    const backBuffer = Buffer.from(await backResp.arrayBuffer());

    const tmpFront = join(tmpdir(), `slab_front_${cardId}.png`);
    const tmpBack = join(tmpdir(), `slab_back_${cardId}.png`);
    const tmpOut = join(tmpdir(), `slab_composite_${cardId}.png`);

    writeFileSync(tmpFront, frontBuffer);
    writeFileSync(tmpBack, backBuffer);

    // Composite with PIL
    const script = `
from PIL import Image
front = Image.open("${tmpFront}").convert("RGBA")
back = Image.open("${tmpBack}").convert("RGBA")
fw, fh = front.size
target_h = 2000
scale = target_h / fh
front_r = front.resize((int(fw * scale), target_h), Image.LANCZOS)
back_r = back.resize((int(fw * scale), target_h), Image.LANCZOS)
frw = front_r.size[0]
overlap = int(frw * 0.12)
total_w = frw + frw - overlap
total_h = target_h + 80
canvas = Image.new("RGBA", (total_w, total_h), (4, 8, 20, 255))
canvas.paste(back_r, (frw - overlap, 60), back_r)
canvas.paste(front_r, (0, 0), front_r)
canvas.convert("RGB").save("${tmpOut}", quality=97)
print("ok")
`;

    execSync(`python3 -c '${script.replace(/'/g, "'\\''")}'`, { timeout: 30000 });

    const compositeBuffer = readFileSync(tmpOut);
    const { url } = await storagePut(
      `slabs/${cardId}/composite.png`,
      compositeBuffer,
      "image/png"
    );

    // Cleanup temp files
    try { unlinkSync(tmpFront); unlinkSync(tmpBack); unlinkSync(tmpOut); } catch {}

    return url;
  } catch (err) {
    console.error("[SlabRenderer] Composite generation failed:", err);
    return null;
  }
}
