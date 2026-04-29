import { eq, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

// desc already imported above
import { gradedCards, investorLeads, affiliates, InsertGradedCard, InsertInvestorLead } from "../drizzle/schema";

export async function saveGradedCard(card: InsertGradedCard) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(gradedCards).values(card);
  return (result as { insertId: number }).insertId;
}

export async function getCardsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gradedCards)
    .where(eq(gradedCards.userId, userId))
    .orderBy(desc(gradedCards.createdAt));
}

export async function getCardById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(gradedCards)
    .where(eq(gradedCards.id, id))
    .limit(1);
  const card = result[0];
  if (!card || card.userId !== userId) return undefined;
  return card;
}

export async function saveInvestorLead(lead: InsertInvestorLead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(investorLeads).values(lead);
}

export async function getCardByCertId(certId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(gradedCards)
    .where(eq(gradedCards.certId, certId))
    .limit(1);
  return result[0] ?? undefined;
}

export async function updateCardStatus(id: number, status: "in_vault" | "sent_to_partner" | "slab_ordered") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(gradedCards).set({ status }).where(eq(gradedCards.id, id));
}

export async function promoteUserToGrader(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ role: "grader" }).where(eq(users.id, userId));
}

export async function listAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt));
}

export async function updateUser(id: number, data: { role?: 'user' | 'admin' | 'grader'; affiliateId?: number | null }) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(users).set(data).where(eq(users.id, id));
}

export async function deleteUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(users).where(eq(users.id, id));
}

export async function listAllCards() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gradedCards).orderBy(desc(gradedCards.createdAt));
}

export async function getCardByIdAdmin(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(gradedCards).where(eq(gradedCards.id, id)).limit(1);
  return result[0] ?? undefined;
}

export async function adminUpdateCard(id: number, data: {
  overallScore?: string;
  gradeTier?: string;
  diamondRating?: number;
  status?: 'in_vault' | 'sent_to_partner' | 'slab_ordered';
  adminOverrideScore?: string | null;
  adminOverrideTier?: string | null;
  adminOverrideDiamonds?: number | null;
  adminOverrideNote?: string | null;
  adminOverrideBy?: string | null;
  adminOverrideAt?: Date | null;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(gradedCards).set(data).where(eq(gradedCards.id, id));
}

/** Delete a card owned by a specific user — enforces ownership before deleting */
export async function deleteCardByOwner(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  // Verify ownership first
  const result = await db.select({ id: gradedCards.id, userId: gradedCards.userId })
    .from(gradedCards).where(eq(gradedCards.id, id)).limit(1);
  const card = result[0];
  if (!card) throw new Error('Card not found');
  if (card.userId !== userId) throw new Error('Forbidden: card does not belong to this user');
  await db.delete(gradedCards).where(eq(gradedCards.id, id));
}

export async function adminDeleteCard(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(gradedCards).where(eq(gradedCards.id, id));
}

export async function listAllLeads() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(investorLeads).orderBy(desc(investorLeads.createdAt));
}

export async function updateLead(id: number, data: {
  status?: 'new' | 'contacted' | 'qualified' | 'closed';
  assignedAffiliateId?: number | null;
  notes?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(investorLeads).set(data).where(eq(investorLeads.id, id));
}

export async function deleteLead(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(investorLeads).where(eq(investorLeads.id, id));
}

export async function listAffiliates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(affiliates).orderBy(asc(affiliates.name));
}

export async function createAffiliate(data: { name: string; code: string; ownerUserId?: number | null }) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const [result] = await db.insert(affiliates).values(data);
  return (result as { insertId: number }).insertId;
}

export async function updateAffiliate(id: number, data: { name?: string; code?: string; ownerUserId?: number | null }) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(affiliates).set(data).where(eq(affiliates.id, id));
}

export async function deleteAffiliate(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(affiliates).where(eq(affiliates.id, id));
}

/** Update the generated slab render URLs for a card after AI generation completes */
export async function updateCardSlabRenders(id: number, data: {
  slabFrontUrl?: string | null;
  slabBackUrl?: string | null;
  slabCompositeUrl?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(gradedCards).set(data).where(eq(gradedCards.id, id));
}
