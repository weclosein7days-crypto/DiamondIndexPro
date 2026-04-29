import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

try {
  // Modify the role enum to add 'grader'
  await conn.execute(`
    ALTER TABLE users 
    MODIFY COLUMN role ENUM('user', 'admin', 'grader') NOT NULL DEFAULT 'user'
  `);
  console.log("✅ Role enum updated: added 'grader'");
} catch (err) {
  if (err.message && err.message.includes("Duplicate")) {
    console.log("ℹ️  Role enum already has 'grader' — skipping");
  } else {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
} finally {
  await conn.end();
}
