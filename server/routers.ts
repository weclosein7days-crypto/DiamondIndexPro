import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, graderProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createReGradeCheckoutSession } from "./stripe";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import {
  saveGradedCard,
  getCardsByUserId,
  getCardById,
  getCardByCertId,
  updateCardStatus,
  saveInvestorLead,
  promoteUserToGrader,
  listAllUsers,
  updateUser,
  deleteUser,
  listAllCards,
  getCardByIdAdmin,
  adminUpdateCard,
  adminDeleteCard,
  listAllLeads,
  updateLead,
  deleteLead,
  listAffiliates,
  createAffiliate,
  updateAffiliate,
  deleteAffiliate,
  deleteCardByOwner,
} from "./db";
import { TRPCError } from "@trpc/server";
import { adminProcedure } from "./_core/trpc";
import { generateAndStoreQR } from "./qr";
import { generateSlabRenders } from "./slabRenderer";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  cards: router({
    extractData: publicProcedure
      .input(z.object({ imageUrl: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content:
                  "You are a sports card identification expert. Extract structured data from the back of a sports card image. Return ONLY valid JSON with no markdown or explanation.",
              },
              {
                role: "user",
                content: [
                  { type: "image_url", image_url: { url: input.imageUrl, detail: "high" } },
                  {
                    type: "text",
                    text: 'Extract the following from this sports card back image. Return ONLY a JSON object with these exact keys (use empty string if not found): { "playerName": "", "cardSet": "", "year": "", "cardNumber": "", "manufacturer": "", "sport": "" }',
                  },
                ],
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "card_data",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    playerName: { type: "string" },
                    cardSet: { type: "string" },
                    year: { type: "string" },
                    cardNumber: { type: "string" },
                    manufacturer: { type: "string" },
                    sport: { type: "string" },
                  },
                  required: ["playerName", "cardSet", "year", "cardNumber", "manufacturer", "sport"],
                  additionalProperties: false,
                },
              },
            },
          });
          const content = response.choices?.[0]?.message?.content ?? "{}";
          return JSON.parse(typeof content === "string" ? content : JSON.stringify(content)) as {
            playerName: string; cardSet: string; year: string;
            cardNumber: string; manufacturer: string; sport: string;
          };
        } catch {
          return { playerName: "", cardSet: "", year: "", cardNumber: "", manufacturer: "", sport: "" };
        }
      }),

    /** Validate whether an uploaded image is a gradeable sports/trading card — checks card type, blur, and framing */
    validateImage: publicProcedure
      .input(z.object({ imageUrl: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are a professional sports card grading inspector. Your job is to determine whether an uploaded image is suitable for grading. Be strict but fair. Return ONLY valid JSON.",
              },
              {
                role: "user",
                content: [
                  { type: "image_url", image_url: { url: input.imageUrl, detail: "high" } } as const,
                  {
                    type: "text",
                    text: `Inspect this image and answer three questions:
1. IS_CARD: Is this a sports card, trading card, or collectible card? (true/false)
2. IS_SHARP: Is the card image sharp and in focus — not blurry, not motion-blurred, not out of focus? (true/false)
3. IS_FRAMED: Is the card fully visible and properly framed — not cut off, not at an extreme angle, not obscured? (true/false)

Return JSON: {
  "isCard": boolean,
  "isSharp": boolean,
  "isFramed": boolean,
  "confidence": number 0-100,
  "rejectionReason": "one of: not_a_card | too_blurry | wrong_framing | none",
  "rejectionMessage": "human-readable message if rejected, empty string if accepted"
}`,
                  } as const,
                ],
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "card_validation_v2",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    isCard: { type: "boolean" },
                    isSharp: { type: "boolean" },
                    isFramed: { type: "boolean" },
                    confidence: { type: "number" },
                    rejectionReason: { type: "string" },
                    rejectionMessage: { type: "string" },
                  },
                  required: ["isCard", "isSharp", "isFramed", "confidence", "rejectionReason", "rejectionMessage"],
                  additionalProperties: false,
                },
              },
            },
          });
          const content = response.choices?.[0]?.message?.content ?? '{}';
          const result = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content)) as {
            isCard: boolean; isSharp: boolean; isFramed: boolean;
            confidence: number; rejectionReason: string; rejectionMessage: string;
          };
          // Determine overall acceptance
          const accepted = result.isCard && result.isSharp && result.isFramed && result.confidence >= 60;
          return { ...result, accepted };
        } catch {
          // On error, allow grading to proceed (fail open)
          return { isCard: true, isSharp: true, isFramed: true, confidence: 70, rejectionReason: "none", rejectionMessage: "", accepted: true };
        }
      }),

    /** Grade a sports card image using AI vision — returns scores for all 5 categories */
    gradeCard: publicProcedure
      .input(z.object({
        frontImageUrl: z.string(),
        backImageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          type ImageContent = { type: "image_url"; image_url: { url: string; detail: "high" } };
          type TextContent = { type: "text"; text: string };
          const userContent: Array<ImageContent | TextContent> = [
            { type: "image_url", image_url: { url: input.frontImageUrl, detail: "high" } },
          ];
          if (input.backImageUrl && input.backImageUrl !== input.frontImageUrl) {
            userContent.push({ type: "image_url", image_url: { url: input.backImageUrl, detail: "high" } });
          }
          userContent.push({
            type: "text",
            text: `You are a professional sports card grader with 20+ years of experience, equivalent to PSA, BGS, and SGC graders. Analyze this card image and provide precise numerical scores.

Grading criteria (score range 50-100):
- centering: How well-centered is the card? Perfect = 100, severely off-center = 50
- edges: Condition of all 4 edges, chips, nicks, roughness. Pristine = 100, heavy damage = 50
- corners: Condition of all 4 corners, wear, fraying, rounding. Sharp = 100, heavy wear = 50
- surface: Front and back surface condition, scratches, print defects, stains. Pristine = 100, heavy damage = 50
- eyeAppeal: Overall visual impression, color vibrancy, print quality. Stunning = 100, poor = 50

Weighted overall score: centering 20%, edges 20%, corners 20%, surface 25%, eyeAppeal 15%.
Also estimate market value in USD based on the card condition and any visible player/set info.
Provide brief grading notes explaining the key factors affecting the grade.

Return ONLY valid JSON with these exact keys.`,
          });

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are a professional sports card grading expert. Grade cards with precision and return structured JSON scores.",
              },
              {
                role: "user",
                content: userContent,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "card_grade",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    centering: { type: "number" },
                    edges: { type: "number" },
                    corners: { type: "number" },
                    surface: { type: "number" },
                    eyeAppeal: { type: "number" },
                    overallScore: { type: "number" },
                    estimatedMarketValue: { type: "number" },
                    gradingNotes: { type: "string" },
                  },
                  required: ["centering", "edges", "corners", "surface", "eyeAppeal", "overallScore", "estimatedMarketValue", "gradingNotes"],
                  additionalProperties: false,
                },
              },
            },
          });
          const content = response.choices?.[0]?.message?.content ?? '{}';
          const result = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content)) as {
            centering: number; edges: number; corners: number; surface: number;
            eyeAppeal: number; overallScore: number; estimatedMarketValue: number; gradingNotes: string;
          };
          // Clamp all scores to 50-100 range
          const clamp = (v: number) => Math.min(100, Math.max(50, v));
          const centering = clamp(result.centering);
          const edges = clamp(result.edges);
          const corners = clamp(result.corners);
          const surface = clamp(result.surface);
          const eyeAppeal = clamp(result.eyeAppeal);
          // Recalculate weighted overall score
          const overallScore = Math.round((centering * 0.20 + edges * 0.20 + corners * 0.20 + surface * 0.25 + eyeAppeal * 0.15) * 10) / 10;
          // Map score to diamond rating
          let diamondRating: number;
          if (overallScore >= 95) diamondRating = 5;
          else if (overallScore >= 88) diamondRating = 4;
          else if (overallScore >= 80) diamondRating = 3;
          else if (overallScore >= 70) diamondRating = 2;
          else diamondRating = 1;
          // Map score to grade tier
          let gradeTier: string;
          if (overallScore >= 95) gradeTier = 'PRISTINE';
          else if (overallScore >= 88) gradeTier = 'ELITE';
          else if (overallScore >= 80) gradeTier = 'EXCELLENT';
          else if (overallScore >= 70) gradeTier = 'GOOD';
          else gradeTier = 'FAIR';
          return {
            centering, edges, corners, surface, eyeAppeal,
            overallScore, diamondRating, gradeTier,
            estimatedMarketValue: Math.max(5, result.estimatedMarketValue ?? 50),
            gradingNotes: result.gradingNotes ?? '',
          };
        } catch (err) {
          console.error('[gradeCard] LLM error:', err);
          return {
            centering: 85, edges: 85, corners: 85, surface: 85, eyeAppeal: 85,
            overallScore: 85, diamondRating: 3, gradeTier: 'EXCELLENT',
            estimatedMarketValue: 50, gradingNotes: 'Grading service temporarily unavailable.',
          };
        }
      }),
  }),

  vault: router({
    /** Save a graded card to the user's vault and send post-grade email notification */
    saveCard: protectedProcedure
      .input(z.object({
        cardName: z.string().optional(),
        cardSet: z.string().optional(),
        cardYear: z.string().optional(),
        cardNumber: z.string().optional(),
        manufacturer: z.string().optional(),
        frontImageUrl: z.string().optional(),
        backImageUrl: z.string().optional(),
        overallScore: z.number(),
        diamondRating: z.number().int().min(1).max(5),
        gradeTier: z.string(),
        centeringScore: z.number().optional(),
        edgesScore: z.number().optional(),
        cornersScore: z.number().optional(),
        surfaceScore: z.number().optional(),
        eyeAppealScore: z.number().optional(),
        userEmail: z.string().optional(),
        userName: z.string().optional(),
        siteOrigin: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user.id;

        // Generate unique DI-XXXX-XXXX certification ID
        const year = new Date().getFullYear();
        const rand = Math.floor(10000000 + Math.random() * 90000000).toString();
        const certId = `DI-${rand.slice(0, 4)}-${rand.slice(4, 8)}`;
        const verifyUrl = `${input.siteOrigin ?? "https://diamondindex.com"}/verify/${certId}`;
        // Generate self-hosted QR code — stored in S3 at labels/{certId}/qr.png
        const qrCodeUrl = await generateAndStoreQR(certId, input.siteOrigin ?? "https://diamondindex.com");

        // Save to DB
        const cardId = await saveGradedCard({
          userId,
          cardName: input.cardName ?? null,
          cardSet: input.cardSet ?? null,
          cardYear: input.cardYear ?? null,
          cardNumber: input.cardNumber ?? null,
          manufacturer: input.manufacturer ?? null,
          frontImageKey: input.frontImageUrl ?? null,
          backImageKey: input.backImageUrl ?? null,
          overallScore: input.overallScore.toString(),
          diamondRating: input.diamondRating,
          gradeTier: input.gradeTier,
          centeringScore: input.centeringScore?.toString() ?? null,
          edgesScore: input.edgesScore?.toString() ?? null,
          cornersScore: input.cornersScore?.toString() ?? null,
          surfaceScore: input.surfaceScore?.toString() ?? null,
          eyeAppealScore: input.eyeAppealScore?.toString() ?? null,
          certId,
          qrCodeUrl,
          status: "in_vault",
        });

        // Diamond display string
        const diamonds = "◆".repeat(input.diamondRating) + "◇".repeat(5 - input.diamondRating);
        const cardLabel = [input.cardYear, input.cardName, input.cardSet].filter(Boolean).join(" · ") || "Sports Card";
        const vaultUrl = `${input.siteOrigin ?? "https://diamondindex.com"}/vault`;

        // Notify owner of new grade
        await notifyOwner({
          title: `New Card Graded — ${cardLabel}`,
          content: `User: ${input.userName ?? ctx.user.name ?? "Unknown"} (${input.userEmail ?? ctx.user.email ?? "no email"})\nCard: ${cardLabel}\nScore: ${input.overallScore.toFixed(1)} | Tier: ${input.gradeTier} | Diamonds: ${diamonds}\nCard ID: ${cardId}\nCert ID: ${certId}`,
        }).catch(() => {});

        // Build grading report email content (sent as owner notification for now)
        const emailContent = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIAMOND INDEX™ — GRADING REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear ${input.userName ?? "Collector"},

Your card has been graded and saved to your Diamond Index™ Vault.

CARD: ${cardLabel}
CARD #: ${input.cardNumber ?? "—"}
MANUFACTURER: ${input.manufacturer ?? "—"}

GRADE RESULT
─────────────────────────────
Overall Score:   ${input.overallScore.toFixed(1)}
Tier:            ${input.gradeTier}
Diamond Rating:  ${diamonds}

CATEGORY BREAKDOWN
─────────────────────────────
Centering:   ${input.centeringScore?.toFixed(1) ?? "—"}
Edges:       ${input.edgesScore?.toFixed(1) ?? "—"}
Corners:     ${input.cornersScore?.toFixed(1) ?? "—"}
Surface:     ${input.surfaceScore?.toFixed(1) ?? "—"}
Eye Appeal:  ${input.eyeAppealScore?.toFixed(1) ?? "—"}

YOUR VAULT
─────────────────────────────
View your card and full report at:
${vaultUrl}

CERTIFICATION ID
─────────────────────────────
Your card's unique Certification ID: ${certId}
Verification URL: ${verifyUrl}

Scan the QR code in your Vault to verify this card's authenticity at any time.

PHYSICAL CERTIFICATION OPTIONS
─────────────────────────────
Your grade report and card photos are attached. Here are your options for a physical certified slab:

1. PRINT YOUR OWN LABEL (Included with your package)
   Download your certified label from your Vault and print it at home.
   Label download: ${vaultUrl}

2. SHIP ME A LABEL + SLAB — $14.99
   We ship you a pre-printed label and protective slab with your Cert ID + QR code.
   You place the card and seal it yourself.
   Order at: ${vaultUrl}

3. FULL ASSEMBLY BY A MASTER GRADER — $19.90
   Mail your card with a prepaid return envelope. A certified Master Grader assembles
   the slab and ships it back to you same day.

   Closest Master Grader to you:
   SportCardsOnline.com
   Att: A.G. US INFO / D. Index
   735 Taylor Rd, Suite 201
   Columbus, Ohio 43230

   Include your Certification ID (${certId}) and a return address with your card.

Thank you for grading with Diamond Index™.
The standard for card certification.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Diamond Index™ Certification Authority
${vaultUrl}
`.trim();

        // Send grading report to owner (acts as email relay until direct email is wired)
        await notifyOwner({
          title: `Grading Report — ${cardLabel} — Send to ${input.userEmail ?? "user"}`,
          content: emailContent,
        }).catch(() => {});

        // Trigger async slab render generation (non-blocking — card is already saved)
        generateSlabRenders({
          cardId,
          certId,
          overallScore: input.overallScore,
          diamondRating: input.diamondRating,
          centeringScore: input.centeringScore,
          edgesScore: input.edgesScore,
          cornersScore: input.cornersScore,
          surfaceScore: input.surfaceScore,
          eyeAppealScore: input.eyeAppealScore,
          frontImageUrl: input.frontImageUrl,
          backImageUrl: input.backImageUrl,
          cardName: input.cardName,
          cardSet: input.cardSet,
          cardYear: input.cardYear,
        }).catch(err => console.error('[saveCard] Slab render trigger failed:', err));

        return { success: true, cardId, certId, qrCodeUrl, verifyUrl };
      }),

    /** List all graded cards for the logged-in user */
    listCards: protectedProcedure.query(async ({ ctx }) => {
      return getCardsByUserId(ctx.user.id);
    }),

    /** Get a single card by ID (must belong to the logged-in user) */
    getCard: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .query(async ({ input, ctx }) => {
        return getCardById(input.id, ctx.user.id);
      }),

    /** Update the status of a card in the vault */
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number().int(),
        status: z.enum(["in_vault", "sent_to_partner", "slab_ordered"]),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verify card belongs to user
        const card = await getCardById(input.id, ctx.user.id);
        if (!card) throw new Error("Card not found");
        await updateCardStatus(input.id, input.status);
        return { success: true };
      }),

    /** Calculate what percentile a given score falls in across all graded cards */
    getPercentile: publicProcedure
      .input(z.object({ score: z.number() }))
      .query(async ({ input }) => {
        try {
          const { getDb } = await import('./db');
          const { gradedCards } = await import('../drizzle/schema');
          const { sql } = await import('drizzle-orm');
          const db = await getDb();
          if (!db) return { percentile: 88, topPercent: 12, totalCards: 0 };
          // Count total cards and cards with score below this one
          const [totalResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(gradedCards);
          const [belowResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(gradedCards)
            .where(sql`CAST(overall_score AS DECIMAL) < ${input.score}`);
          const total = Number(totalResult?.count ?? 0);
          const below = Number(belowResult?.count ?? 0);
          if (total === 0) return { percentile: 50, topPercent: 50, totalCards: 0 };
          // Percentile = percentage of cards this score beats
          const percentile = Math.round((below / total) * 100);
          // topPercent = top X% (100 - percentile, but at least 1%)
          const topPercent = Math.max(1, 100 - percentile);
          return { percentile, topPercent, totalCards: total };
        } catch {
          return { percentile: 88, topPercent: 12, totalCards: 0 };
        }
      }),

    /** Permanently delete a card from the vault (owner-only) */
    deleteCard: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input, ctx }) => {
        try {
          await deleteCardByOwner(input.id, ctx.user.id);
          return { success: true };
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Delete failed";
          if (msg.startsWith("Forbidden")) {
            throw new TRPCError({ code: "FORBIDDEN", message: "You do not own this card" });
          }
          if (msg === "Card not found") {
            throw new TRPCError({ code: "NOT_FOUND", message: "Card not found" });
          }
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: msg });
        }
      }),
  }),

  verify: router({
    /** Public verification page — no auth required */
    getCard: publicProcedure
      .input(z.object({ certId: z.string() }))
      .query(async ({ input }) => {
        const card = await getCardByCertId(input.certId);
        if (!card) return null;

        // frontImageKey already stores the full /manus-storage/... URL — use it directly.
        // Do NOT call storageGet() here: it would prepend /manus-storage/ again, producing a
        // double-prefixed broken URL like /manus-storage/manus-storage/...
        const frontImageUrl: string | null = card.frontImageKey ?? null;
        const backImageUrl: string | null = card.backImageKey ?? null;

        return {
          ...card,
          frontImageUrl,
          backImageUrl,
        };
      }),
  }),

  investors: router({
    submitLead: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        company: z.string().optional(),
        phone: z.string().optional(),
        interest: z.enum(["full_deck", "schedule_call", "general"]).default("general"),
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await saveInvestorLead({
          name: input.name,
          email: input.email,
          company: input.company ?? null,
          phone: input.phone ?? null,
          interest: input.interest,
          message: input.message ?? null,
        });

        await notifyOwner({
          title: `New Investor Inquiry — ${input.name}`,
          content: `Name: ${input.name}\nEmail: ${input.email}\nCompany: ${input.company ?? "—"}\nPhone: ${input.phone ?? "—"}\nInterest: ${input.interest}\nMessage: ${input.message ?? "—"}`,
        }).catch(() => {});

        return { success: true };
      }),
  }),

  payments: router({
    createReGradeSession: publicProcedure
      .input(z.object({
        origin: z.string(),
        cardName: z.string().optional(),
        cardSet: z.string().optional(),
        userEmail: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return createReGradeCheckoutSession(input);
      }),
  }),

  /** Admin-only procedures */
  admin: router({
    /** Promote a user to certified grader role */
    promoteToGrader: adminProcedure
      .input(z.object({ userId: z.number().int() }))
      .mutation(async ({ input }) => {
        await promoteUserToGrader(input.userId);
        return { success: true };
      }),

    /** List all users */
    listUsers: adminProcedure.query(async () => listAllUsers()),

    /** Update a user's role or affiliate */
    updateUser: adminProcedure
      .input(z.object({
        userId: z.number().int(),
        role: z.enum(['user', 'admin', 'grader']).optional(),
        affiliateId: z.number().int().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateUser(input.userId, {
          ...(input.role !== undefined ? { role: input.role } : {}),
          ...(input.affiliateId !== undefined ? { affiliateId: input.affiliateId } : {}),
        });
        return { success: true };
      }),

    /** Delete a user */
    deleteUser: adminProcedure
      .input(z.object({ userId: z.number().int() }))
      .mutation(async ({ input }) => {
        await deleteUser(input.userId);
        return { success: true };
      }),

    /** List all graded cards across all users */
    listAllCards: adminProcedure.query(async () => listAllCards()),

    /** Override/edit a card's grade */
    updateCard: adminProcedure
      .input(z.object({
        cardId: z.number().int(),
        overallScore: z.string().optional(),
        gradeTier: z.string().optional(),
        diamondRating: z.number().int().min(1).max(5).optional(),
        status: z.enum(['in_vault', 'sent_to_partner', 'slab_ordered']).optional(),
        adminOverrideNote: z.string().nullable().optional(),
        adminOverrideBy: z.string().nullable().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const now = new Date();
        await adminUpdateCard(input.cardId, {
          ...(input.overallScore !== undefined ? { overallScore: input.overallScore, adminOverrideScore: input.overallScore } : {}),
          ...(input.gradeTier !== undefined ? { gradeTier: input.gradeTier, adminOverrideTier: input.gradeTier } : {}),
          ...(input.diamondRating !== undefined ? { diamondRating: input.diamondRating, adminOverrideDiamonds: input.diamondRating } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
          adminOverrideNote: input.adminOverrideNote ?? null,
          adminOverrideBy: input.adminOverrideBy ?? ctx.user.name ?? ctx.user.email ?? 'admin',
          adminOverrideAt: now,
        });
        return { success: true };
      }),

    /** Delete a card */
    deleteCard: adminProcedure
      .input(z.object({ cardId: z.number().int() }))
      .mutation(async ({ input }) => {
        await adminDeleteCard(input.cardId);
        return { success: true };
      }),

    /** List all investor leads */
    listLeads: adminProcedure.query(async () => listAllLeads()),

    /** Update a lead's status, affiliate, or notes */
    updateLead: adminProcedure
      .input(z.object({
        leadId: z.number().int(),
        status: z.enum(['new', 'contacted', 'qualified', 'closed']).optional(),
        assignedAffiliateId: z.number().int().nullable().optional(),
        notes: z.string().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateLead(input.leadId, {
          ...(input.status !== undefined ? { status: input.status } : {}),
          ...(input.assignedAffiliateId !== undefined ? { assignedAffiliateId: input.assignedAffiliateId } : {}),
          ...(input.notes !== undefined ? { notes: input.notes } : {}),
        });
        return { success: true };
      }),

    /** Delete a lead */
    deleteLead: adminProcedure
      .input(z.object({ leadId: z.number().int() }))
      .mutation(async ({ input }) => {
        await deleteLead(input.leadId);
        return { success: true };
      }),

    /** List affiliates */
    listAffiliates: adminProcedure.query(async () => listAffiliates()),

    /** Create an affiliate */
    createAffiliate: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        code: z.string().min(1),
        ownerUserId: z.number().int().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await createAffiliate(input);
        return { success: true, id };
      }),

    /** Update an affiliate */
    updateAffiliate: adminProcedure
      .input(z.object({
        affiliateId: z.number().int(),
        name: z.string().optional(),
        code: z.string().optional(),
        ownerUserId: z.number().int().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateAffiliate(input.affiliateId, {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.code !== undefined ? { code: input.code } : {}),
          ...(input.ownerUserId !== undefined ? { ownerUserId: input.ownerUserId } : {}),
        });
        return { success: true };
      }),

    /** Delete an affiliate */
    deleteAffiliate: adminProcedure
      .input(z.object({ affiliateId: z.number().int() }))
      .mutation(async ({ input }) => {
        await deleteAffiliate(input.affiliateId);
        return { success: true };
      }),
  }),

  grader: router({
    /** Get grader dashboard stats */
    getStats: graderProcedure.query(async ({ ctx }) => {
      const cards = await getCardsByUserId(ctx.user.id);
      const total = cards.length;
      const slabOrdered = cards.filter(c => c.status === 'slab_ordered').length;
      const sentToPartner = cards.filter(c => c.status === 'sent_to_partner').length;
      // Simulated earnings: $2.50 per card graded
      const estimatedEarnings = (total * 2.5).toFixed(2);
      return { total, slabOrdered, sentToPartner, estimatedEarnings };
    }),

    /** List all cards graded by this grader (same as vault but grader-scoped) */
    listCards: graderProcedure.query(async ({ ctx }) => {
      return getCardsByUserId(ctx.user.id);
    }),

    /** Batch update status for multiple cards */
    batchUpdateStatus: graderProcedure
      .input(z.object({
        ids: z.array(z.number().int()),
        status: z.enum(["in_vault", "sent_to_partner", "slab_ordered"]),
      }))
      .mutation(async ({ input, ctx }) => {
        for (const id of input.ids) {
          const card = await getCardById(id, ctx.user.id);
          if (card) await updateCardStatus(id, input.status);
        }
        return { success: true, updated: input.ids.length };
      }),

    /**
     * Assemble all data needed to render the back label for a given cert ID.
     * Resolves the card photo S3 key to a /manus-storage/ URL.
     */
    getLabelData: graderProcedure
      .input(z.object({ certId: z.string() }))
      .query(async ({ input, ctx }) => {
        const card = await getCardByCertId(input.certId);
        if (!card) throw new TRPCError({ code: 'NOT_FOUND', message: 'Card not found' });
        // Verify the requesting user owns this card
        if (card.userId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
        // frontImageKey already stores the full /manus-storage/... URL — use it directly.
        // Calling storageGet() would double-prefix it (/manus-storage/manus-storage/...).
        const cardImageUrl: string | undefined = card.frontImageKey ?? undefined;
        return {
          playerName:     card.cardName ?? 'UNKNOWN PLAYER',
          cardYear:       card.cardYear ?? '',
          cardSet:        card.cardSet ?? '',
          cardNumber:     card.cardNumber ?? undefined,
          variant:        card.manufacturer ?? undefined,
          centeringScore: parseFloat(card.centeringScore ?? '0'),
          edgesScore:     parseFloat(card.edgesScore ?? '0'),
          surfaceScore:   parseFloat(card.surfaceScore ?? '0'),
          cornersScore:   parseFloat(card.cornersScore ?? '0'),
          eyeAppealScore: parseFloat(card.eyeAppealScore ?? '0'),
          overallScore:   parseFloat(card.overallScore ?? '0'),
          diamondRating:  card.diamondRating ?? 1,
          certId:         card.certId ?? '',
          // If QR was not generated at grading time, generate it now and cache it
          qrCodeUrl:      card.qrCodeUrl ?? await generateAndStoreQR(card.certId ?? '', 'https://diamondindex.com'),
          cardImageUrl,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
