/**
 * fix-image-urls.mjs
 *
 * Fixes broken image URLs in the gradedCards table. Handles two patterns:
 *
 * Pattern A — Double-prefix (from storageGet bug):
 *   /manus-storage/manus-storage/cards/... → /manus-storage/cards/...
 *
 * Pattern B — External/Unsplash demo URLs (seeded placeholder data):
 *   https://images.unsplash.com/... → NULL
 *   These are external URLs that don't belong to any real upload and cannot
 *   be served as slab textures. Nulling them causes the slab to show the
 *   proper fallback (cert ID canvas) instead of a broken image.
 *
 * Run from the project root:
 *   node scripts/fix-image-urls.mjs
 */

import "dotenv/config";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL environment variable is not set.");
  process.exit(1);
}

const DOUBLE_PREFIX   = "/manus-storage/manus-storage/";
const SINGLE_PREFIX   = "/manus-storage/";
const EXTERNAL_HOSTS  = ["images.unsplash.com", "unsplash.com", "picsum.photos", "loremflickr.com"];

function isExternalDemo(url) {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    return EXTERNAL_HOSTS.some(h => hostname === h || hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

function fixUrl(url) {
  if (!url) return { fixed: null, reason: null };

  // Pattern A: double-prefix
  if (url.startsWith(DOUBLE_PREFIX)) {
    return {
      fixed: SINGLE_PREFIX + url.slice(DOUBLE_PREFIX.length),
      reason: "double-prefix stripped",
    };
  }

  // Pattern B: external demo URL
  if (isExternalDemo(url)) {
    return { fixed: null, reason: "external demo URL nulled" };
  }

  return { fixed: url, reason: null }; // no change needed
}

async function run() {
  const conn = await mysql.createConnection(DATABASE_URL);

  try {
    // ── 1. Fetch all cards ────────────────────────────────────────────────────
    const [rows] = await conn.execute(
      `SELECT id, certId, frontImageKey, backImageKey FROM gradedCards`
    );

    console.log(`\n🔍  Scanning ${rows.length} card(s)...\n`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const row of rows) {
      const { fixed: newFront, reason: frontReason } = fixUrl(row.frontImageKey);
      const { fixed: newBack,  reason: backReason  } = fixUrl(row.backImageKey);

      const frontChanged = newFront !== row.frontImageKey;
      const backChanged  = newBack  !== row.backImageKey;

      if (!frontChanged && !backChanged) {
        skippedCount++;
        continue;
      }

      // Build UPDATE
      const setClauses = [];
      const values = [];

      if (frontChanged) {
        setClauses.push("frontImageKey = ?");
        values.push(newFront);
        console.log(`  ID ${row.id} (${row.certId}) | frontImageKey: ${frontReason}`);
        console.log(`    before: ${row.frontImageKey}`);
        console.log(`    after:  ${newFront ?? "NULL"}`);
      }
      if (backChanged) {
        setClauses.push("backImageKey = ?");
        values.push(newBack);
        console.log(`  ID ${row.id} (${row.certId}) | backImageKey: ${backReason}`);
        console.log(`    before: ${row.backImageKey}`);
        console.log(`    after:  ${newBack ?? "NULL"}`);
      }

      values.push(row.id);
      await conn.execute(
        `UPDATE gradedCards SET ${setClauses.join(", ")} WHERE id = ?`,
        values
      );
      fixedCount++;
    }

    console.log(`\n✅  Done.`);
    console.log(`   Fixed:   ${fixedCount} card(s)`);
    console.log(`   Skipped: ${skippedCount} card(s) (already correct)`);

    // ── 2. Verify ─────────────────────────────────────────────────────────────
    const [remaining] = await conn.execute(
      `SELECT COUNT(*) AS count FROM gradedCards
       WHERE frontImageKey LIKE ? OR backImageKey LIKE ?`,
      [`${DOUBLE_PREFIX}%`, `${DOUBLE_PREFIX}%`]
    );
    if (remaining[0].count === 0) {
      console.log(`\n✅  Verification: no double-prefix URLs remain.`);
    } else {
      console.warn(`\n⚠️   ${remaining[0].count} double-prefix URL(s) still remain.`);
    }

  } finally {
    await conn.end();
  }
}

run().catch(err => {
  console.error("❌  Script failed:", err.message);
  process.exit(1);
});
