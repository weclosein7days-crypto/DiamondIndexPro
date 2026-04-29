import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
/**
 * Affiliate / key-person table for assigning users and leads to key people.
 */
export const affiliates = mysqlTable("affiliates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  ownerUserId: int("ownerUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "grader"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  affiliateId: int("affiliateId"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Investor inquiry leads submitted via the Investors page modal.
 */
export const investorLeads = mysqlTable("investorLeads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  company: varchar("company", { length: 255 }),
  phone: varchar("phone", { length: 64 }),
  interest: mysqlEnum("interest", ["full_deck", "schedule_call", "general"]).default("general").notNull(),
  message: text("message"),
  // Lead management
  status: mysqlEnum("leadStatus", ["new", "contacted", "qualified", "closed"]).default("new").notNull(),
  assignedAffiliateId: int("assignedAffiliateId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvestorLead = typeof investorLeads.$inferSelect;
export type InsertInvestorLead = typeof investorLeads.$inferInsert;

/**
 * Graded cards stored in a user's vault.
 */
export const gradedCards = mysqlTable("gradedCards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Card identity (auto-detected or user-entered)
  cardName: varchar("cardName", { length: 255 }),
  cardSet: varchar("cardSet", { length: 255 }),
  cardYear: varchar("cardYear", { length: 16 }),
  cardNumber: varchar("cardNumber", { length: 64 }),
  manufacturer: varchar("manufacturer", { length: 128 }),
  // Images (S3 keys)
  frontImageKey: text("frontImageKey"),
  backImageKey: text("backImageKey"),
  // Grade results
  overallScore: decimal("overallScore", { precision: 5, scale: 2 }),
  diamondRating: int("diamondRating"),  // 1–5
  gradeTier: varchar("gradeTier", { length: 32 }), // STANDARD / PREMIUM / SUPERIOR / ELITE / PRISTINE
  centeringScore: decimal("centeringScore", { precision: 5, scale: 2 }),
  edgesScore: decimal("edgesScore", { precision: 5, scale: 2 }),
  cornersScore: decimal("cornersScore", { precision: 5, scale: 2 }),
  surfaceScore: decimal("surfaceScore", { precision: 5, scale: 2 }),
  eyeAppealScore: decimal("eyeAppealScore", { precision: 5, scale: 2 }),
  // Generated slab render assets (auto-generated after grading)
  slabFrontUrl: text("slabFrontUrl"),      // S3 URL for 3D front slab render
  slabBackUrl: text("slabBackUrl"),        // S3 URL for 3D back slab render
  slabCompositeUrl: text("slabCompositeUrl"), // S3 URL for front+back composite
  // Certification
  certId: varchar("certId", { length: 32 }).unique(), // DI-XXXX-XXXX format
  qrCodeUrl: text("qrCodeUrl"),                       // URL to QR code image
  // Grader who submitted this card
  graderId: int("graderId"),
  // Status
  status: mysqlEnum("status", ["in_vault", "sent_to_partner", "slab_ordered"]).default("in_vault").notNull(),
  // Admin grade override fields
  adminOverrideScore: decimal("adminOverrideScore", { precision: 5, scale: 2 }),
  adminOverrideTier: varchar("adminOverrideTier", { length: 32 }),
  adminOverrideDiamonds: int("adminOverrideDiamonds"),
  adminOverrideNote: text("adminOverrideNote"),
  adminOverrideBy: varchar("adminOverrideBy", { length: 255 }),
  adminOverrideAt: timestamp("adminOverrideAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GradedCard = typeof gradedCards.$inferSelect;
export type InsertGradedCard = typeof gradedCards.$inferInsert;
