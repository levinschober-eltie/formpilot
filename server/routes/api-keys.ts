import { Hono } from "hono";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { apiKeys } from "../db/schema";
import {
  requireAuth,
  requireRole,
  getOrgId,
  type AuthContext,
} from "../middleware/auth";
import { generateApiKey } from "../middleware/api-auth";

// ─── Validation ─────────────────────────────────────────────────────────────

const createKeySchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(100).trim(),
  scopes: z
    .array(z.enum(["read", "write"]))
    .default(["read", "write"]),
  expiresAt: z.string().datetime().optional(),
});

// ─── Router ─────────────────────────────────────────────────────────────────

const app = new Hono();

// Alle Routen erfordern Session-Auth + Admin-Rolle
app.use("*", requireAuth);
app.use("*", requireRole("admin"));

// GET / — API-Keys der Organisation auflisten (nur Prefix, nie den vollen Key)
app.get("/", async (c: AuthContext) => {
  const orgId = getOrgId(c);

  const keys = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      scopes: apiKeys.scopes,
      active: apiKeys.active,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.organizationId, orgId))
    .orderBy(desc(apiKeys.createdAt));

  return c.json({ data: keys });
});

// POST / — Neuen API-Key erstellen (gibt vollen Key nur einmal zurück!)
app.post("/", async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const profile = c.get("user");
  const body = await c.req.json();

  const parsed = createKeySchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Validierungsfehler", details: parsed.error.flatten() },
      400,
    );
  }

  const expiresAt = parsed.data.expiresAt
    ? new Date(parsed.data.expiresAt)
    : undefined;

  const result = await generateApiKey(
    orgId,
    parsed.data.name,
    parsed.data.scopes,
    profile.id,
    expiresAt,
  );

  return c.json(
    {
      data: {
        id: result.id,
        key: result.key, // Voller Key — wird nur dieses eine Mal angezeigt!
        prefix: result.prefix,
        name: parsed.data.name,
        scopes: parsed.data.scopes,
      },
      warning:
        "Speichere den API-Key jetzt! Er wird nur einmal angezeigt und kann nicht wiederhergestellt werden.",
    },
    201,
  );
});

// DELETE /:id — API-Key widerrufen (active=false)
app.delete("/:id", async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const id = c.req.param("id")!;

  const [revoked] = await db
    .update(apiKeys)
    .set({ active: false })
    .where(
      and(eq(apiKeys.id, id), eq(apiKeys.organizationId, orgId)),
    )
    .returning({ id: apiKeys.id });

  if (!revoked) {
    return c.json({ error: "API-Key nicht gefunden" }, 404);
  }

  return c.json({ success: true });
});

export default app;
