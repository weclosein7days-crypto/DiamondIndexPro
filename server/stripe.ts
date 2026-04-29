/**
 * Diamond Index™ — Stripe Integration
 * Handles Re-Grade payment via Stripe Checkout Sessions.
 * Re-Grade fee: $9.99 per submission.
 */

import Stripe from "stripe";
import express, { Router, Request, Response, Express } from "express";

const REGRADE_PRICE_USD = 999; // $9.99 in cents
const REGRADE_PRODUCT_NAME = "Diamond Index™ Re-Grade Submission";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key);
}

// ── tRPC-compatible helper: create a Checkout Session ──────────────────────
export async function createReGradeCheckoutSession({
  origin,
  cardName,
  cardSet,
  userEmail,
}: {
  origin: string;
  cardName?: string;
  cardSet?: string;
  userEmail?: string;
}): Promise<{ url: string }> {
  const stripe = getStripe();

  const description = [cardName, cardSet].filter(Boolean).join(" · ") || "Card Re-Grade";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: REGRADE_PRICE_USD,
          product_data: {
            name: REGRADE_PRODUCT_NAME,
            description,
          },
        },
        quantity: 1,
      },
    ],
    customer_email: userEmail,
    allow_promotion_codes: true,
    metadata: {
      card_name: cardName ?? "",
      card_set: cardSet ?? "",
      customer_email: userEmail ?? "",
    },
    success_url: `${origin}/grade?regrade=success`,
    cancel_url: `${origin}/grade?regrade=cancelled`,
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return { url: session.url };
}

// ── Express webhook route ──────────────────────────────────────────────────
export function registerStripeWebhook(app: Express) {
  const webhookRouter = Router();

  // Raw body required for signature verification — must be registered BEFORE json()
  webhookRouter.post(
    "/api/stripe/webhook",
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event: Stripe.Event;

      try {
        const stripe = getStripe();
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret ?? "");
      } catch (err) {
        console.error("[Stripe Webhook] Signature verification failed:", err);
        return res.status(400).send("Webhook signature verification failed");
      }

      // Test event passthrough — required for Stripe webhook verification
      if (event.id.startsWith("evt_test_")) {
        console.log("[Stripe Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log("[Stripe] Re-Grade payment completed:", {
            id: session.id,
            card: session.metadata?.card_name,
            set: session.metadata?.card_set,
            email: session.metadata?.customer_email,
          });
          break;
        }
        default:
          console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
      }

      return res.json({ received: true });
    }
  );

  app.use(webhookRouter);
}
