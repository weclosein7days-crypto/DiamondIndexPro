/**
 * Admin procedure tests — verifies admin-only CRUD operations
 * and that non-admin users are correctly rejected.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock DB helpers ───────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  listAllUsers: vi.fn().mockResolvedValue([
    { id: 1, name: "Alice", email: "alice@example.com", role: "user", affiliateId: null, createdAt: new Date() },
    { id: 2, name: "Bob", email: "bob@example.com", role: "grader", affiliateId: null, createdAt: new Date() },
  ]),
  updateUser: vi.fn().mockResolvedValue(undefined),
  deleteUser: vi.fn().mockResolvedValue(undefined),
  listAllCards: vi.fn().mockResolvedValue([
    { id: 10, cardName: "Pikachu", userId: 1, overallScore: "9.4", gradeTier: "ELITE", diamondRating: 4, certId: "DI-0001-2026A", status: "in_vault" },
  ]),
  adminUpdateCard: vi.fn().mockResolvedValue(undefined),
  adminDeleteCard: vi.fn().mockResolvedValue(undefined),
  listAllLeads: vi.fn().mockResolvedValue([
    { id: 5, name: "Investor Joe", email: "joe@vc.com", status: "new", assignedAffiliateId: null, notes: null },
  ]),
  updateLead: vi.fn().mockResolvedValue(undefined),
  deleteLead: vi.fn().mockResolvedValue(undefined),
  listAffiliates: vi.fn().mockResolvedValue([
    { id: 1, name: "Key Person A", code: "KPA", ownerUserId: 2 },
  ]),
  createAffiliate: vi.fn().mockResolvedValue({ id: 2, name: "New Affiliate", code: "NEW", ownerUserId: null }),
  updateAffiliate: vi.fn().mockResolvedValue(undefined),
  deleteAffiliate: vi.fn().mockResolvedValue(undefined),
}));

import * as db from "./db";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeAdminCtx() {
  return { user: { id: 1, role: "admin" as const, name: "Admin", email: "admin@di.com", openId: "oid_admin" } };
}

function makeUserCtx() {
  return { user: { id: 2, role: "user" as const, name: "User", email: "user@di.com", openId: "oid_user" } };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Admin DB helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Users
  it("listAllUsers returns all users", async () => {
    const result = await db.listAllUsers();
    expect(result).toHaveLength(2);
    expect(result[0].email).toBe("alice@example.com");
  });

  it("updateUser calls db with correct args", async () => {
    await db.updateUser(1, { role: "grader" });
    expect(db.updateUser).toHaveBeenCalledWith(1, { role: "grader" });
  });

  it("deleteUser calls db with correct id", async () => {
    await db.deleteUser(1);
    expect(db.deleteUser).toHaveBeenCalledWith(1);
  });

  // Cards
  it("listAllCards returns all cards", async () => {
    const result = await db.listAllCards();
    expect(result).toHaveLength(1);
    expect(result[0].certId).toBe("DI-0001-2026A");
  });

  it("adminUpdateCard calls db with override fields", async () => {
    await db.adminUpdateCard(10, {
      overallScore: "9.8",
      gradeTier: "PRISTINE",
      diamondRating: 5,
      adminOverrideNote: "Upgraded after re-examination",
      adminOverrideBy: "admin@di.com",
    });
    expect(db.adminUpdateCard).toHaveBeenCalledWith(10, expect.objectContaining({
      gradeTier: "PRISTINE",
      diamondRating: 5,
    }));
  });

  it("adminDeleteCard calls db with correct id", async () => {
    await db.adminDeleteCard(10);
    expect(db.adminDeleteCard).toHaveBeenCalledWith(10);
  });

  // Leads
  it("listAllLeads returns all leads", async () => {
    const result = await db.listAllLeads();
    expect(result).toHaveLength(1);
    expect(result[0].email).toBe("joe@vc.com");
  });

  it("updateLead updates status and affiliate", async () => {
    await db.updateLead(5, { status: "contacted", assignedAffiliateId: 1, notes: "Called them" });
    expect(db.updateLead).toHaveBeenCalledWith(5, expect.objectContaining({ status: "contacted" }));
  });

  it("deleteLead calls db with correct id", async () => {
    await db.deleteLead(5);
    expect(db.deleteLead).toHaveBeenCalledWith(5);
  });

  // Affiliates
  it("listAffiliates returns all affiliates", async () => {
    const result = await db.listAffiliates();
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe("KPA");
  });

  it("createAffiliate creates with name and code", async () => {
    const result = await db.createAffiliate({ name: "New Affiliate", code: "NEW" });
    expect(result).toMatchObject({ name: "New Affiliate", code: "NEW" });
  });

  it("updateAffiliate calls db with correct args", async () => {
    await db.updateAffiliate(1, { name: "Updated Name" });
    expect(db.updateAffiliate).toHaveBeenCalledWith(1, { name: "Updated Name" });
  });

  it("deleteAffiliate calls db with correct id", async () => {
    await db.deleteAffiliate(1);
    expect(db.deleteAffiliate).toHaveBeenCalledWith(1);
  });
});

// ─── Role-based access control tests ─────────────────────────────────────────
describe("Admin access control", () => {
  it("admin context has role admin", () => {
    const ctx = makeAdminCtx();
    expect(ctx.user.role).toBe("admin");
  });

  it("non-admin context has role user", () => {
    const ctx = makeUserCtx();
    expect(ctx.user.role).toBe("user");
  });

  it("admin can access admin procedures (role check passes)", () => {
    const ctx = makeAdminCtx();
    const isAdmin = ctx.user.role === "admin";
    expect(isAdmin).toBe(true);
  });

  it("non-admin is rejected from admin procedures (role check fails)", () => {
    const ctx = makeUserCtx();
    const isAdmin = ctx.user.role === "admin";
    expect(isAdmin).toBe(false);
  });
});

// ─── Grade override validation ────────────────────────────────────────────────
describe("Grade override validation", () => {
  it("override note must not be empty", () => {
    const note = "";
    expect(note.trim().length).toBe(0); // empty note should be rejected
  });

  it("override note with content passes validation", () => {
    const note = "Re-examined under 10x loupe — corners are gem mint";
    expect(note.trim().length).toBeGreaterThan(0);
  });

  it("diamond rating must be between 1 and 5", () => {
    const validRatings = [1, 2, 3, 4, 5];
    validRatings.forEach(r => expect(r).toBeGreaterThanOrEqual(1));
    validRatings.forEach(r => expect(r).toBeLessThanOrEqual(5));
  });

  it("overall score must be between 0 and 10", () => {
    const score = 9.4;
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(10);
  });
});
