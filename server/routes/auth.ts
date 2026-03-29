import { Hono } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db";
import {
  organizations,
  profiles,
  subscriptions,
  session as sessionTable,
} from "../db/schema";
import { auth, requireAuth, getOrgId, type AuthContext } from "../middleware/auth";
import { checkRateLimit } from "../middleware/rate-limit";

// ─── Validation ─────────────────────────────────────────────────────────────

const registerSchema = z.object({
  orgName: z.string().min(2, "Organisationsname muss mindestens 2 Zeichen haben"),
  name: z.string().min(1, "Name ist erforderlich"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben"),
});

const pinVerifySchema = z.object({
  pin: z.string().min(4, "PIN muss mindestens 4 Zeichen haben").max(10),
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 63);
}

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ─── Router ─────────────────────────────────────────────────────────────────

const app = new Hono();

// POST /register — Neue Organisation + Admin-User registrieren
app.post("/register", async (c) => {
  const body = await c.req.json();

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validierungsfehler", details: parsed.error.flatten() }, 400);
  }

  const { orgName, name, email, password } = parsed.data;

  // Rate Limiting auf E-Mail
  const { allowed } = await checkRateLimit(`register:${email}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return c.json({ error: "Zu viele Registrierungsversuche. Bitte später erneut versuchen." }, 429);
  }

  try {
    // 1. Organisation erstellen
    const slug = slugify(orgName) + "-" + Date.now().toString(36);
    const [org] = await db
      .insert(organizations)
      .values({
        name: orgName,
        slug,
        settings: {},
      })
      .returning();

    // 2. User über better-auth erstellen (email/password)
    let authUser;
    try {
      authUser = await auth.api.signUpEmail({
        body: {
          name,
          email,
          password,
        },
      });
    } catch (authError: unknown) {
      // Rollback: Organisation löschen
      await db.delete(organizations).where(eq(organizations.id, org.id));
      const message = authError instanceof Error ? authError.message : "Registrierung fehlgeschlagen";
      return c.json({ error: message }, 400);
    }

    if (!authUser?.user) {
      await db.delete(organizations).where(eq(organizations.id, org.id));
      return c.json({ error: "Benutzer konnte nicht erstellt werden" }, 500);
    }

    // 3. Profil erstellen (Admin-Rolle)
    const [profile] = await db
      .insert(profiles)
      .values({
        userId: authUser.user.id,
        organizationId: org.id,
        name,
        email,
        role: "admin",
        active: true,
      })
      .returning();

    // 4. Free-Subscription erstellen
    await db
      .insert(subscriptions)
      .values({
        organizationId: org.id,
        plan: "free",
        status: "active",
      });

    // Session-Token zurückgeben
    return c.json({
      data: {
        profile: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          organizationId: profile.organizationId,
        },
        session: authUser.token ? { token: authUser.token } : null,
      },
    }, 201);
  } catch (error: unknown) {
    console.error("Registration error:", error);
    const message = error instanceof Error ? error.message : "Registrierung fehlgeschlagen";
    return c.json({ error: message }, 500);
  }
});

// POST /pin-verify — PIN-Login
app.post("/pin-verify", async (c) => {
  const body = await c.req.json();

  const parsed = pinVerifySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validierungsfehler", details: parsed.error.flatten() }, 400);
  }

  // Rate Limiting auf IP
  const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
  const { allowed } = await checkRateLimit(`pin:${ip}`, 10, 15 * 60 * 1000);
  if (!allowed) {
    return c.json({ error: "Zu viele Versuche. Bitte später erneut versuchen." }, 429);
  }

  try {
    // PIN hashen
    const pinHash = await hashPin(parsed.data.pin);

    // PIN-Kollision prüfen (Uniqueness auf Application-Ebene)
    const matches = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.pinHash, pinHash))
      .limit(2);

    if (matches.length > 1) {
      return c.json({ error: "PIN-Konflikt — bitte Administrator kontaktieren" }, 409);
    }

    // Profil über pin_hash finden
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.pinHash, pinHash))
      .limit(1);

    if (!profile) {
      return c.json({ error: "Ungültige PIN" }, 401);
    }

    if (!profile.active) {
      return c.json({ error: "Konto deaktiviert" }, 403);
    }

    // Session direkt in DB erstellen (better-auth hat kein createSession API)
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Tage

    await db
      .insert(sessionTable)
      .values({
        id: sessionId,
        token,
        userId: profile.userId,
        expiresAt,
        ipAddress: ip,
        userAgent: c.req.header("user-agent") ?? null,
      });

    // Profil ohne pinHash zurückgeben
    const { pinHash: _pin, ...safeProfile } = profile;

    return c.json({
      data: {
        profile: safeProfile,
        session: { token },
      },
    });
  } catch (error: unknown) {
    console.error("PIN verify error:", error);
    return c.json({ error: "Authentifizierung fehlgeschlagen" }, 500);
  }
});

// GET /me — Aktuellen User + Subscription laden (authentifiziert)
app.get("/me", requireAuth, async (c: AuthContext) => {
  const profile = c.get("user");
  const orgId = getOrgId(c);

  // Subscription laden
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.organizationId, orgId))
    .limit(1);

  // pinHash nicht zurückgeben
  const { pinHash: _pin, ...safeProfile } = profile;

  return c.json({
    data: {
      profile: safeProfile,
      subscription: subscription ?? null,
    },
  });
});

// Alle anderen Auth-Routen (signin, signout, etc.) über better-auth Handler
app.all("/api/auth/*", async (c) => {
  return auth.handler(c.req.raw);
});

export default app;
