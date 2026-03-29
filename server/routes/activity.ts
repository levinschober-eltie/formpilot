import { Hono } from "hono";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { activityLog } from "../db/schema";
import { requireAuth, getOrgId, type AuthContext } from "../middleware/auth";

// ─── Validation ─────────────────────────────────────────────────────────────

const createActivitySchema = z.object({
  action: z.string().min(1, "Action ist erforderlich").max(255).trim(),
  entityType: z.string().min(1, "Entity-Typ ist erforderlich").max(255).trim(),
  entityId: z.string().uuid().optional().or(z.null()),
  details: z.record(z.string(), z.unknown()).optional(),
});

// ─── Router ─────────────────────────────────────────────────────────────────

const app = new Hono();

app.use("*", requireAuth);

// GET / — Activity-Log auflisten
app.get("/", async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const entityType = c.req.query("entityType");
  const entityId = c.req.query("entityId");
  const limitParam = c.req.query("limit");
  const limit = Math.min(Math.max(parseInt(limitParam || "50", 10) || 50, 1), 500);

  const conditions = [eq(activityLog.organizationId, orgId)];

  if (entityType) {
    conditions.push(eq(activityLog.entityType, entityType));
  }
  if (entityId) {
    conditions.push(eq(activityLog.entityId, entityId));
  }

  const result = await db
    .select()
    .from(activityLog)
    .where(and(...conditions))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);

  return c.json({ data: result });
});

// POST / — Activity-Log-Eintrag erstellen
app.post("/", async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const profile = c.get("user");
  const body = await c.req.json();

  const parsed = createActivitySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validierungsfehler", details: parsed.error.flatten() }, 400);
  }

  const [created] = await db
    .insert(activityLog)
    .values({
      organizationId: orgId,
      userId: profile.id,
      action: parsed.data.action,
      entityType: parsed.data.entityType,
      entityId: parsed.data.entityId ?? null,
      details: parsed.data.details ?? {},
    })
    .returning();

  return c.json({ data: created }, 201);
});

export default app;
