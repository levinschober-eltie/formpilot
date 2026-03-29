import { createHmac, timingSafeEqual } from "crypto";

// ─── Price IDs ──────────────────────────────────────────────────────────────

export const PRICE_IDS = {
  pro: process.env.STRIPE_PRICE_PRO || "",
  business: process.env.STRIPE_PRICE_BUSINESS || "",
} as const;

// ─── Stripe API Helper ─────────────────────────────────────────────────────

async function stripeRequest(
  path: string,
  method: string,
  body?: Record<string, string>,
) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body ? new URLSearchParams(body).toString() : undefined,
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data;
}

// ─── Customer ───────────────────────────────────────────────────────────────

export async function createCustomer(
  email: string,
  name: string,
  orgId: string,
) {
  return stripeRequest("/customers", "POST", {
    email,
    name,
    "metadata[org_id]": orgId,
  });
}

// ─── Checkout Session ───────────────────────────────────────────────────────

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
) {
  return stripeRequest("/checkout/sessions", "POST", {
    customer: customerId,
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

// ─── Customer Portal ────────────────────────────────────────────────────────

export async function createPortalSession(
  customerId: string,
  returnUrl: string,
) {
  return stripeRequest("/billing_portal/sessions", "POST", {
    customer: customerId,
    return_url: returnUrl,
  });
}

// ─── Webhook Signature Verification ────────────────────────────────────────

/**
 * Verifiziert Stripe Webhook-Signatur mit HMAC-SHA256.
 * Implementiert manuell ohne Stripe SDK.
 */
export function constructEvent(
  payload: string,
  signature: string,
  webhookSecret: string,
) {
  // 1. Stripe-Signature Header parsen (t=timestamp,v1=signature)
  const parts = signature.split(",");
  const timestampPart = parts.find((p) => p.startsWith("t="));
  const signaturePart = parts.find((p) => p.startsWith("v1="));

  if (!timestampPart || !signaturePart) {
    throw new Error("Ungueltige Stripe-Signatur: fehlende Felder");
  }

  const timestamp = timestampPart.slice(2);
  const expectedSig = signaturePart.slice(3);

  // 2. Signed Payload erstellen
  const signedPayload = `${timestamp}.${payload}`;

  // 3. HMAC-SHA256 berechnen
  const hmac = createHmac("sha256", webhookSecret);
  hmac.update(signedPayload);
  const computedSig = hmac.digest("hex");

  // 4. Signaturen vergleichen (timing-safe)
  const expectedBuf = Buffer.from(expectedSig, "hex");
  const computedBuf = Buffer.from(computedSig, "hex");

  if (
    expectedBuf.length !== computedBuf.length ||
    !timingSafeEqual(expectedBuf, computedBuf)
  ) {
    throw new Error("Ungueltige Stripe-Signatur: Signatur stimmt nicht");
  }

  // 5. Timestamp-Toleranz pruefen (5 Minuten)
  const now = Math.floor(Date.now() / 1000);
  const tolerance = 300; // 5 Minuten
  if (Math.abs(now - parseInt(timestamp, 10)) > tolerance) {
    throw new Error("Ungueltige Stripe-Signatur: Timestamp zu alt");
  }

  // 6. Event parsen und zurueckgeben
  return JSON.parse(payload);
}
