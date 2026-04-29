import { createConnection } from "mysql2/promise";
import { readFileSync } from "fs";
import dotenv from "dotenv";

dotenv.config();

const db = await createConnection(process.env.DATABASE_URL);

const sql = `
ALTER TABLE \`gradedCards\`
  ADD COLUMN IF NOT EXISTS \`certId\` varchar(32),
  ADD COLUMN IF NOT EXISTS \`qrCodeUrl\` text;
`;

const sqlIndex = `
CREATE UNIQUE INDEX IF NOT EXISTS \`certId_unique\` ON \`gradedCards\` (\`certId\`);
`;

const sql2 = `
ALTER TABLE \`gradedCards\`
  MODIFY COLUMN \`status\` enum('in_vault','sent_to_partner','slab_ordered') NOT NULL DEFAULT 'in_vault';
`;

const sql3 = `
UPDATE \`gradedCards\` SET \`status\` = 'in_vault' WHERE \`status\` NOT IN ('in_vault','sent_to_partner','slab_ordered');
`;

// Drop listedForSale only if it exists
const [cols] = await db.execute(`SHOW COLUMNS FROM \`gradedCards\` LIKE 'listedForSale'`);
const dropSql = cols.length > 0
  ? `ALTER TABLE \`gradedCards\` DROP COLUMN \`listedForSale\``
  : null;

try {
  await db.execute(sql);
  console.log("✓ Added certId, qrCodeUrl columns");
} catch (e) {
  if (e.code === "ER_DUP_FIELDNAME" || (e.sqlMessage && e.sqlMessage.includes("Duplicate column"))) {
    console.log("certId/qrCodeUrl already exist, skipping");
  } else {
    throw e;
  }
}

try {
  await db.execute(sqlIndex);
  console.log("✓ Created unique index on certId");
} catch (e) {
  if (e.sqlMessage && (e.sqlMessage.includes("Duplicate key name") || e.sqlMessage.includes("already exists"))) {
    console.log("certId index already exists, skipping");
  } else {
    throw e;
  }
}

await db.execute(sql2);
console.log("✓ Updated status enum");

await db.execute(sql3);
console.log("✓ Updated existing row statuses");

if (dropSql) {
  await db.execute(dropSql);
  console.log("✓ Dropped listedForSale column");
} else {
  console.log("listedForSale already removed, skipping");
}

await db.end();
console.log("Migration complete.");
