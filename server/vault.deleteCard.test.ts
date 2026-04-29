/**
 * Tests for vault.deleteCard tRPC procedure
 *
 * Verifies:
 * - Owner can delete their own card
 * - Non-owner receives FORBIDDEN error
 * - Deleting a non-existent card returns NOT_FOUND
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ── Mock the db helpers so tests don't need a real database ──────────────────
vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    deleteCardByOwner: vi.fn(),
  };
});

import { deleteCardByOwner } from "./db";

// ── Helper: build a minimal authenticated context ────────────────────────────
function makeCtx(userId: number): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `user-${userId}`,
      email: `user${userId}@example.com`,
      name: `User ${userId}`,
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("vault.deleteCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns { success: true } when the owner deletes their card", async () => {
    vi.mocked(deleteCardByOwner).mockResolvedValueOnce(undefined);

    const caller = appRouter.createCaller(makeCtx(42));
    const result = await caller.vault.deleteCard({ id: 7 });

    expect(result).toEqual({ success: true });
    expect(deleteCardByOwner).toHaveBeenCalledWith(7, 42);
  });

  it("throws FORBIDDEN when the card belongs to another user", async () => {
    vi.mocked(deleteCardByOwner).mockRejectedValueOnce(
      new Error("Forbidden: card does not belong to this user")
    );

    const caller = appRouter.createCaller(makeCtx(99));
    await expect(caller.vault.deleteCard({ id: 7 })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("throws NOT_FOUND when the card does not exist", async () => {
    vi.mocked(deleteCardByOwner).mockRejectedValueOnce(
      new Error("Card not found")
    );

    const caller = appRouter.createCaller(makeCtx(1));
    await expect(caller.vault.deleteCard({ id: 9999 })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("throws INTERNAL_SERVER_ERROR for unexpected DB errors", async () => {
    vi.mocked(deleteCardByOwner).mockRejectedValueOnce(
      new Error("Database connection lost")
    );

    const caller = appRouter.createCaller(makeCtx(1));
    await expect(caller.vault.deleteCard({ id: 1 })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
  });

  it("rejects non-integer card IDs at the input validation layer", async () => {
    const caller = appRouter.createCaller(makeCtx(1));
    // @ts-expect-error — intentionally passing wrong type to test runtime validation
    await expect(caller.vault.deleteCard({ id: "not-a-number" })).rejects.toThrow();
  });
});
