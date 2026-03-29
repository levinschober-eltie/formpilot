import { Hono } from "hono";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { projects } from "../db/schema";
import { requireAuth, requireRole, getOrgId, type AuthContext } from "../middleware/auth";

// ─── Validation ─────────────────────────────────────────────────────────────

const PROJECT_STATUSES = ["planning", "active", "completed", "archived"] as const;

const createProjectSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(255).trim(),
  description: z.string().max(2000).optional().or(z.null()),
  status: z.enum(PROJECT_STATUSES).default("planning"),
  customerId: z.string().uuid().nullable().optional(),
  sharedData: z.record(z.string(), z.unknown()).optional(),
  phases: z.array(z.unknown()).optional(),
});

const updateProjectSchema = createProjectSchema.partial();

// ─── Router ─────────────────────────────────────────────────────────────────

const app = new Hono();

app.use("*", requireAuth);

// GET / — Projekte auflisten, sortiert nach Erstellung (neueste zuerst)
app.get("/", async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const status = c.req.query("status");

  const conditions = [eq(projects.organizationId, orgId)];

  if (status && PROJECT_STATUSES.includes(status as (typeof PROJECT_STATUSES)[number])) {
    conditions.push(eq(projects.status, status as (typeof PROJECT_STATUSES)[number]));
  }

  const result = await db
    .select()
    .from(projects)
    .where(and(...conditions))
    .orderBy(desc(projects.createdAt))
    .limit(500);

  return c.json({ data: result });
});

// GET /:id — Einzelnes Projekt
app.get("/:id", async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const id = c.req.param("id")!;

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.organizationId, orgId)))
    .limit(1);

  if (!project) {
    return c.json({ error: "Projekt nicht gefunden" }, 404);
  }

  return c.json({ data: project });
});

// POST / — Projekt erstellen
app.post("/", async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const body = await c.req.json();

  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validierungsfehler", details: parsed.error.flatten() }, 400);
  }

  const [created] = await db
    .insert(projects)
    .values({
      organizationId: orgId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      status: parsed.data.status,
      customerId: parsed.data.customerId ?? null,
      sharedData: parsed.data.sharedData ?? {},
      phases: parsed.data.phases ?? [],
    })
    .returning();

  return c.json({ data: created }, 201);
});

// PUT /:id — Projekt aktualisieren
app.put("/:id", async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const id = c.req.param("id")!;
  const body = await c.req.json();

  const parsed = updateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validierungsfehler", details: parsed.error.flatten() }, 400);
  }

  // Prüfen ob Projekt existiert und zur Org gehört
  const [existing] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.organizationId, orgId)))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Projekt nicht gefunden" }, 404);
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.customerId !== undefined) updateData.customerId = parsed.data.customerId;
  if (parsed.data.sharedData !== undefined) updateData.sharedData = parsed.data.sharedData;
  if (parsed.data.phases !== undefined) updateData.phases = parsed.data.phases;

  const [updated] = await db
    .update(projects)
    .set(updateData)
    .where(and(eq(projects.id, id), eq(projects.organizationId, orgId)))
    .returning();

  return c.json({ data: updated });
});

// DELETE /:id — Projekt löschen (nur admin)
app.delete("/:id", requireRole("admin"), async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const id = c.req.param("id")!;

  const [deleted] = await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.organizationId, orgId)))
    .returning({ id: projects.id });

  if (!deleted) {
    return c.json({ error: "Projekt nicht gefunden" }, 404);
  }

  return c.json({ data: { deleted: true } });
});

export default app;
