import { Hono } from "hono";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../../db";
import { templates } from "../../db/schema";
import { requireScope, type ApiAuthContext } from "../../middleware/api-auth";

// ─── Validation ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  "service",
  "abnahme",
  "mangel",
  "pruefung",
  "uebergabe",
  "custom",
] as const;

const createTemplateSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(255).trim(),
  description: z.string().max(2000).optional(),
  category: z.enum(CATEGORIES).default("custom"),
  icon: z.string().default("\ud83d\udccb"),
  schema: z.record(z.string(), z.unknown()),
  pdfSettings: z.record(z.string(), z.unknown()).optional(),
  emailTemplate: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().default(true),
  visibleForRoles: z.array(z.string()).default(["admin", "monteur", "buero"]),
});

const updateTemplateSchema = createTemplateSchema.partial();

// ─── Router ─────────────────────────────────────────────────────────────────

const app = new Hono();

// GET / — Templates auflisten (read scope)
app.get("/", requireScope("read"), async (c: ApiAuthContext) => {
  const orgId = c.get("orgId");
  const category = c.req.query("category");
  const limit = Math.min(Number(c.req.query("limit")) || 100, 500);
  const offset = Number(c.req.query("offset")) || 0;

  const conditions = [
    eq(templates.organizationId, orgId),
    eq(templates.isArchived, false),
  ];

  if (
    category &&
    CATEGORIES.includes(category as (typeof CATEGORIES)[number])
  ) {
    conditions.push(
      eq(templates.category, category as (typeof CATEGORIES)[number]),
    );
  }

  const result = await db
    .select()
    .from(templates)
    .where(and(...conditions))
    .orderBy(desc(templates.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json({ data: result, meta: { limit, offset, count: result.length } });
});

// GET /:id — Einzelnes Template (read scope)
app.get("/:id", requireScope("read"), async (c: ApiAuthContext) => {
  const orgId = c.get("orgId");
  const id = c.req.param("id")!;

  const [template] = await db
    .select()
    .from(templates)
    .where(
      and(eq(templates.id, id), eq(templates.organizationId, orgId)),
    )
    .limit(1);

  if (!template) {
    return c.json({ error: "Template nicht gefunden", code: "NOT_FOUND" }, 404);
  }

  return c.json({ data: template });
});

// POST / — Template erstellen (write scope)
app.post("/", requireScope("write"), async (c: ApiAuthContext) => {
  const orgId = c.get("orgId");
  const body = await c.req.json();

  const parsed = createTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      {
        error: "Validierungsfehler",
        code: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      },
      400,
    );
  }

  const [created] = await db
    .insert(templates)
    .values({
      organizationId: orgId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      category: parsed.data.category,
      icon: parsed.data.icon,
      schema: parsed.data.schema,
      pdfSettings: parsed.data.pdfSettings ?? {},
      emailTemplate: parsed.data.emailTemplate ?? {},
      isActive: parsed.data.isActive,
      isArchived: false,
      isDemo: false,
      visibleForRoles: parsed.data.visibleForRoles,
    })
    .returning();

  return c.json({ data: created }, 201);
});

// PUT /:id — Template aktualisieren (write scope)
app.put("/:id", requireScope("write"), async (c: ApiAuthContext) => {
  const orgId = c.get("orgId");
  const id = c.req.param("id")!;
  const body = await c.req.json();

  const parsed = updateTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      {
        error: "Validierungsfehler",
        code: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      },
      400,
    );
  }

  // Prüfen ob Template zur Org gehört
  const [existing] = await db
    .select({ id: templates.id, version: templates.version })
    .from(templates)
    .where(and(eq(templates.id, id), eq(templates.organizationId, orgId)))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Template nicht gefunden", code: "NOT_FOUND" }, 404);
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.description !== undefined)
    updateData.description = parsed.data.description;
  if (parsed.data.category !== undefined)
    updateData.category = parsed.data.category;
  if (parsed.data.icon !== undefined) updateData.icon = parsed.data.icon;
  if (parsed.data.schema !== undefined) updateData.schema = parsed.data.schema;
  if (parsed.data.pdfSettings !== undefined)
    updateData.pdfSettings = parsed.data.pdfSettings;
  if (parsed.data.emailTemplate !== undefined)
    updateData.emailTemplate = parsed.data.emailTemplate;
  if (parsed.data.isActive !== undefined)
    updateData.isActive = parsed.data.isActive;
  if (parsed.data.visibleForRoles !== undefined)
    updateData.visibleForRoles = parsed.data.visibleForRoles;

  // Version immer inkrementieren
  updateData.version = existing.version + 1;

  const [updated] = await db
    .update(templates)
    .set(updateData)
    .where(and(eq(templates.id, id), eq(templates.organizationId, orgId)))
    .returning();

  return c.json({ data: updated });
});

// DELETE /:id — Template löschen (write scope)
app.delete("/:id", requireScope("write"), async (c: ApiAuthContext) => {
  const orgId = c.get("orgId");
  const id = c.req.param("id")!;

  const [deleted] = await db
    .delete(templates)
    .where(and(eq(templates.id, id), eq(templates.organizationId, orgId)))
    .returning({ id: templates.id });

  if (!deleted) {
    return c.json({ error: "Template nicht gefunden", code: "NOT_FOUND" }, 404);
  }

  return c.json({ success: true });
});

export default app;
