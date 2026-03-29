import { Hono } from "hono";
import { z } from "zod";
import { eq, and, isNull, gt } from "drizzle-orm";
import { db } from "../db";
import { invitations, profiles, session as sessionTable } from "../db/schema";
import { auth, requireAuth, requireRole, getOrgId, type AuthContext } from "../middleware/auth";
import { checkRateLimit } from "../middleware/rate-limit";

// ─── Validation ─────────────────────────────────────────────────────────────

const createInvitationSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse").trim(),
  role: z.enum(["admin", "monteur", "buero"]).default("monteur"),
});

const acceptInvitationSchema = z.object({
  token: z.string().uuid("Ungültiger Token"),
  name: z.string().min(1, "Name ist erforderlich").max(255).trim(),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben"),
});

// ─── Router ─────────────────────────────────────────────────────────────────

const app = new Hono();

// GET / — Alle Einladungen der Organisation auflisten (nur Admin)
app.get("/", requireAuth, requireRole("admin"), async (c: AuthContext) => {
  const orgId = getOrgId(c);

  try {
    const result = await db
      .select()
      .from(invitations)
      .where(eq(invitations.organizationId, orgId))
      .orderBy(invitations.createdAt)
      .limit(100);

    return c.json({ data: result });
  } catch (error: unknown) {
    console.error("List invitations error:", error);
    return c.json({ error: "Einladungen konnten nicht geladen werden" }, 500);
  }
});

// GET /team — Teammitglieder der Organisation auflisten
app.get("/team", requireAuth, async (c: AuthContext) => {
  const orgId = getOrgId(c);

  try {
    const result = await db
      .select({
        id: profiles.id,
        name: profiles.name,
        email: profiles.email,
        role: profiles.role,
        active: profiles.active,
        createdAt: profiles.createdAt,
      })
      .from(profiles)
      .where(eq(profiles.organizationId, orgId))
      .orderBy(profiles.createdAt)
      .limit(500);

    return c.json({ data: result });
  } catch (error: unknown) {
    console.error("List team error:", error);
    return c.json({ error: "Team konnte nicht geladen werden" }, 500);
  }
});

// POST / — Neue Einladung erstellen (nur Admin)
app.post("/", requireAuth, requireRole("admin"), async (c: AuthContext) => {
  const body = await c.req.json();

  const parsed = createInvitationSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validierungsfehler", details: parsed.error.flatten() }, 400);
  }

  const { email, role } = parsed.data;
  const orgId = getOrgId(c);
  const profile = c.get("user");

  try {
    // Prüfen ob E-Mail bereits in der Organisation existiert
    const [existingProfile] = await db
      .select()
      .from(profiles)
      .where(and(eq(profiles.organizationId, orgId), eq(profiles.email, email)))
      .limit(1);

    if (existingProfile) {
      return c.json({ error: "Diese E-Mail-Adresse ist bereits in der Organisation registriert" }, 409);
    }

    // Prüfen ob bereits eine offene Einladung für diese E-Mail existiert
    const [existingInvitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.organizationId, orgId),
          eq(invitations.email, email),
          isNull(invitations.acceptedAt),
          gt(invitations.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (existingInvitation) {
      return c.json({ error: "Es existiert bereits eine offene Einladung für diese E-Mail-Adresse" }, 409);
    }

    // Einladung erstellen
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Tage

    const [invitation] = await db
      .insert(invitations)
      .values({
        organizationId: orgId,
        email,
        role,
        invitedBy: profile.id,
        token,
        expiresAt,
      })
      .returning();

    return c.json({ data: invitation }, 201);
  } catch (error: unknown) {
    console.error("Create invitation error:", error);
    const message = error instanceof Error ? error.message : "Einladung konnte nicht erstellt werden";
    return c.json({ error: message }, 500);
  }
});

// POST /accept — Einladung annehmen (keine Auth erforderlich)
app.post("/accept", async (c) => {
  // Rate Limiting auf IP
  const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
  const { allowed } = await checkRateLimit(`invite-accept:${ip}`, 10, 15 * 60 * 1000);
  if (!allowed) {
    return c.json({ error: "Zu viele Versuche. Bitte später erneut versuchen." }, 429);
  }

  const body = await c.req.json();

  const parsed = acceptInvitationSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validierungsfehler", details: parsed.error.flatten() }, 400);
  }

  const { token, name, password } = parsed.data;

  try {
    // Einladung suchen: gültig, nicht angenommen, nicht abgelaufen
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.token, token),
          isNull(invitations.acceptedAt),
          gt(invitations.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!invitation) {
      return c.json({ error: "Einladung ungültig oder abgelaufen" }, 404);
    }

    // User über better-auth erstellen
    let authUser;
    try {
      authUser = await auth.api.signUpEmail({
        body: {
          name,
          email: invitation.email,
          password,
        },
      });
    } catch (authError: unknown) {
      const message = authError instanceof Error ? authError.message : "Benutzer konnte nicht erstellt werden";
      return c.json({ error: message }, 400);
    }

    if (!authUser?.user) {
      return c.json({ error: "Benutzer konnte nicht erstellt werden" }, 500);
    }

    // Profil mit Rolle und Organisation der Einladung erstellen
    const [profile] = await db
      .insert(profiles)
      .values({
        userId: authUser.user.id,
        organizationId: invitation.organizationId,
        name,
        email: invitation.email,
        role: invitation.role,
        active: true,
      })
      .returning();

    // Einladung als angenommen markieren
    await db
      .update(invitations)
      .set({ acceptedAt: new Date() })
      .where(eq(invitations.id, invitation.id));

    // Session-Token erstellen
    const sessionToken = crypto.randomUUID() + crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";

    await db
      .insert(sessionTable)
      .values({
        id: sessionId,
        token: sessionToken,
        userId: authUser.user.id,
        expiresAt,
        ipAddress: ip,
        userAgent: c.req.header("user-agent") ?? null,
      });

    // Profil ohne pinHash zurückgeben
    const { pinHash: _pin, ...safeProfile } = profile;

    return c.json({
      data: {
        profile: safeProfile,
        session: { token: sessionToken },
      },
    }, 201);
  } catch (error: unknown) {
    console.error("Accept invitation error:", error);
    const message = error instanceof Error ? error.message : "Einladung konnte nicht angenommen werden";
    return c.json({ error: message }, 500);
  }
});

// DELETE /:id — Einladung widerrufen (nur Admin)
app.delete("/:id", requireAuth, requireRole("admin"), async (c: AuthContext) => {
  const id = c.req.param("id")!;
  const orgId = getOrgId(c);

  try {
    const [deleted] = await db
      .delete(invitations)
      .where(and(eq(invitations.id, id), eq(invitations.organizationId, orgId)))
      .returning();

    if (!deleted) {
      return c.json({ error: "Einladung nicht gefunden" }, 404);
    }

    return c.json({ data: { id: deleted.id } });
  } catch (error: unknown) {
    console.error("Delete invitation error:", error);
    return c.json({ error: "Einladung konnte nicht gelöscht werden" }, 500);
  }
});

export default app;
