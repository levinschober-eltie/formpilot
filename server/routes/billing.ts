import { Hono } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole, getOrgId, type AuthContext } from "../middleware/auth";
import { db } from "../db";
import { subscriptions, organizations } from "../db/schema";
import { getUsage } from "../services/usage";
import {
  createCustomer,
  createCheckoutSession,
  createPortalSession,
  constructEvent,
  PRICE_IDS,
} from "../services/stripe";

// ─── Validation ─────────────────────────────────────────────────────────────

const checkoutSchema = z.object({
  plan: z.enum(["pro", "business"]),
});

// ─── Router ────────────────────────────────────────────────────────────────

const billingRoutes = new Hono();

// ─── GET /subscription — Aktuelle Subscription der Org abrufen ─────────────

billingRoutes.get("/subscription", requireAuth, async (c: AuthContext) => {
  const orgId = getOrgId(c);

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.organizationId, orgId))
    .limit(1);

  if (!subscription) {
    // Kein Abo vorhanden -> Free-Plan Defaults zurückgeben
    return c.json({
      subscription: {
        plan: "free",
        status: "active",
        cancelAtPeriodEnd: false,
        currentPeriodStart: null,
        currentPeriodEnd: null,
      },
    });
  }

  // Stripe-interne IDs nicht an den Client leaken
  return c.json({
    subscription: {
      plan: subscription.plan,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      metadata: subscription.metadata,
    },
  });
});

// ─── GET /usage — Aktuelle Monats-Usage der Org abrufen ────────────────────

billingRoutes.get("/usage", requireAuth, async (c: AuthContext) => {
  const orgId = getOrgId(c);

  const usage = await getUsage(orgId);

  if (!usage) {
    // Noch keine Usage in dieser Periode -> Nullwerte
    return c.json({
      usage: {
        submissionsCount: 0,
        templatesCount: 0,
        aiCreditsUsed: 0,
        storageBytes: 0,
        apiCalls: 0,
        periodStart: null,
        periodEnd: null,
      },
    });
  }

  return c.json({
    usage: {
      submissionsCount: usage.submissionsCount,
      templatesCount: usage.templatesCount,
      aiCreditsUsed: usage.aiCreditsUsed,
      storageBytes: usage.storageBytes,
      apiCalls: usage.apiCalls,
      periodStart: usage.periodStart,
      periodEnd: usage.periodEnd,
    },
  });
});

// ─── POST /checkout — Stripe Checkout Session erstellen ────────────────────

billingRoutes.post(
  "/checkout",
  requireAuth,
  requireRole("admin"),
  async (c: AuthContext) => {
    const body = await c.req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: "Ungültiger Plan", details: parsed.error.flatten() }, 400);
    }

    const { plan } = parsed.data;
    const orgId = getOrgId(c);
    const priceId = PRICE_IDS[plan];

    if (!priceId) {
      return c.json({ error: `Kein Preis für Plan "${plan}" konfiguriert` }, 500);
    }

    // Bestehende Subscription / Customer laden
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, orgId))
      .limit(1);

    let customerId = subscription?.stripeCustomerId;

    // Falls kein Stripe Customer existiert, erstellen
    if (!customerId) {
      const profile = c.get("user");
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, orgId))
        .limit(1);

      const customer = await createCustomer(
        profile.email || "",
        org?.name || "",
        orgId,
      );
      customerId = customer.id;

      // Customer ID in Subscription speichern (upsert)
      if (subscription) {
        await db
          .update(subscriptions)
          .set({ stripeCustomerId: customerId, updatedAt: new Date() })
          .where(eq(subscriptions.organizationId, orgId));
      } else {
        await db.insert(subscriptions).values({
          organizationId: orgId,
          stripeCustomerId: customerId,
          plan: "free",
          status: "active",
        });
      }
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const session = await createCheckoutSession(
      customerId!,
      priceId,
      `${frontendUrl}/settings/billing?success=true`,
      `${frontendUrl}/settings/billing?canceled=true`,
    );

    return c.json({ url: session.url });
  },
);

// ─── POST /portal — Stripe Customer Portal erstellen ───────────────────────

billingRoutes.post(
  "/portal",
  requireAuth,
  requireRole("admin"),
  async (c: AuthContext) => {
    const orgId = getOrgId(c);

    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, orgId))
      .limit(1);

    if (!subscription?.stripeCustomerId) {
      return c.json({ error: "Kein Stripe-Kunde vorhanden" }, 400);
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const session = await createPortalSession(
      subscription.stripeCustomerId,
      `${frontendUrl}/settings/billing`,
    );

    return c.json({ url: session.url });
  },
);

// ─── POST /webhook — Stripe Webhook (KEIN requireAuth) ────────────────────

billingRoutes.post("/webhook", async (c) => {
  const signature = c.req.header("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return c.json({ error: "Fehlende Signatur oder Webhook-Secret" }, 400);
  }

  // Raw Body für Signatur-Verifikation (NICHT c.req.json())
  const rawBody = await c.req.text();

  let event: any;
  try {
    event = constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook-Signatur ungültig:", err);
    return c.json({ error: "Ungültige Signatur" }, 400);
  }

  // ─── Event-Handler ───────────────────────────────────────────────────

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        // Subscription-Details von Stripe holen würden einen Extra-API-Call benötigen.
        // Die relevanten Daten kommen über subscription.updated Event.
        // Hier setzen wir nur die IDs und den initialen Status.
        await db
          .update(subscriptions)
          .set({
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: customerId,
            status: "active",
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeCustomerId, customerId));

        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const customerId = sub.customer;

        // Plan aus Price-ID ableiten
        const priceId = sub.items?.data?.[0]?.price?.id;
        let plan: "free" | "pro" | "business" | "enterprise" | "sdk" = "free";
        if (priceId === PRICE_IDS.pro) plan = "pro";
        else if (priceId === PRICE_IDS.business) plan = "business";

        // Status mappen (Stripe -> DB Enum)
        const statusMap: Record<string, string> = {
          active: "active",
          trialing: "trialing",
          past_due: "past_due",
          canceled: "canceled",
          incomplete: "incomplete",
          incomplete_expired: "canceled",
          unpaid: "past_due",
          paused: "active",
        };
        const status = statusMap[sub.status] || "active";

        await db
          .update(subscriptions)
          .set({
            plan: plan as any,
            status: status as any,
            stripeSubscriptionId: sub.id,
            currentPeriodStart: sub.current_period_start
              ? new Date(sub.current_period_start * 1000)
              : null,
            currentPeriodEnd: sub.current_period_end
              ? new Date(sub.current_period_end * 1000)
              : null,
            cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeCustomerId, customerId));

        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId = sub.customer;

        await db
          .update(subscriptions)
          .set({
            plan: "free" as any,
            status: "canceled" as any,
            cancelAtPeriodEnd: false,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeCustomerId, customerId));

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        await db
          .update(subscriptions)
          .set({
            status: "past_due" as any,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeCustomerId, customerId));

        break;
      }

      default:
        // Unbekannte Events ignorieren
        break;
    }
  } catch (err) {
    console.error(`Webhook-Event ${event.type} Verarbeitung fehlgeschlagen:`, err);
    // Trotzdem 200 zurückgeben, damit Stripe nicht wiederholt
    return c.json({ received: true, error: "Verarbeitung fehlgeschlagen" });
  }

  return c.json({ received: true });
});

export default billingRoutes;
