import { Hono } from "hono";
import { z } from "zod";
import { eq, and, or, desc } from "drizzle-orm";
import { db } from "../db";
import { templates } from "../db/schema";
import { requireAuth, requireRole, getOrgId, type AuthContext } from "../middleware/auth";

// ─── Validation ─────────────────────────────────────────────────────────────

const CATEGORIES = ["service", "abnahme", "mangel", "pruefung", "uebergabe", "custom"] as const;

const createTemplateSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  description: z.string().optional(),
  category: z.enum(CATEGORIES).default("custom"),
  icon: z.string().default("📋"),
  schema: z.record(z.string(), z.unknown()),
  pdfSettings: z.record(z.string(), z.unknown()).optional(),
  emailTemplate: z.record(z.string(), z.unknown()).optional(),
  isDemo: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isArchived: z.boolean().default(false),
  visibleForRoles: z.array(z.string()).default(["admin", "monteur", "buero"]),
});

const updateTemplateSchema = createTemplateSchema.partial();

// ─── Router ─────────────────────────────────────────────────────────────────

const app = new Hono();

// Auth auf allen Routen
app.use("*", requireAuth);

// GET / — Templates für Organisation auflisten (inkl. Demos)
app.get("/", async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const category = c.req.query("category");
  const archived = c.req.query("archived");

  const conditions = [
    or(
      eq(templates.organizationId, orgId),
      eq(templates.isDemo, true),
    ),
  ];

  if (category && CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    conditions.push(eq(templates.category, category as (typeof CATEGORIES)[number]));
  }

  if (archived === "true") {
    conditions.push(eq(templates.isArchived, true));
  } else if (archived !== "all") {
    // Default: nur nicht-archivierte
    conditions.push(eq(templates.isArchived, false));
  }

  const result = await db
    .select()
    .from(templates)
    .where(and(...conditions))
    .orderBy(desc(templates.createdAt))
    .limit(500);

  return c.json({ data: result });
});

// GET /:id — Einzelnes Template
app.get("/:id", async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const id = c.req.param("id")!;

  const [template] = await db
    .select()
    .from(templates)
    .where(
      and(
        eq(templates.id, id),
        or(
          eq(templates.organizationId, orgId),
          eq(templates.isDemo, true),
        ),
      ),
    )
    .limit(1);

  if (!template) {
    return c.json({ error: "Template nicht gefunden" }, 404);
  }

  return c.json({ data: template });
});

// POST / — Template erstellen (admin/buero)
app.post("/", requireRole("buero"), async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const profile = c.get("user");
  const body = await c.req.json();

  const parsed = createTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validierungsfehler", details: parsed.error.flatten() }, 400);
  }

  const [created] = await db
    .insert(templates)
    .values({
      organizationId: orgId,
      createdBy: profile.id,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      category: parsed.data.category,
      icon: parsed.data.icon,
      schema: parsed.data.schema,
      pdfSettings: parsed.data.pdfSettings ?? {},
      emailTemplate: parsed.data.emailTemplate ?? {},
      isDemo: parsed.data.isDemo,
      isActive: parsed.data.isActive,
      isArchived: parsed.data.isArchived,
      visibleForRoles: parsed.data.visibleForRoles,
    })
    .returning();

  return c.json({ data: created }, 201);
});

// PUT /:id — Template aktualisieren (admin/buero), Version inkrementieren
app.put("/:id", requireRole("buero"), async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const id = c.req.param("id")!;
  const body = await c.req.json();

  const parsed = updateTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validierungsfehler", details: parsed.error.flatten() }, 400);
  }

  // Prüfen ob Template zur Org gehört
  const [existing] = await db
    .select({ id: templates.id, version: templates.version })
    .from(templates)
    .where(and(eq(templates.id, id), eq(templates.organizationId, orgId)))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Template nicht gefunden" }, 404);
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.category !== undefined) updateData.category = parsed.data.category;
  if (parsed.data.icon !== undefined) updateData.icon = parsed.data.icon;
  if (parsed.data.schema !== undefined) updateData.schema = parsed.data.schema;
  if (parsed.data.pdfSettings !== undefined) updateData.pdfSettings = parsed.data.pdfSettings;
  if (parsed.data.emailTemplate !== undefined) updateData.emailTemplate = parsed.data.emailTemplate;
  if (parsed.data.isDemo !== undefined) updateData.isDemo = parsed.data.isDemo;
  if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;
  if (parsed.data.isArchived !== undefined) updateData.isArchived = parsed.data.isArchived;
  if (parsed.data.visibleForRoles !== undefined) updateData.visibleForRoles = parsed.data.visibleForRoles;

  // Version immer inkrementieren
  updateData.version = existing.version + 1;

  const [updated] = await db
    .update(templates)
    .set(updateData)
    .where(and(eq(templates.id, id), eq(templates.organizationId, orgId)))
    .returning();

  return c.json({ data: updated });
});

// DELETE /:id — Template löschen (nur admin)
app.delete("/:id", requireRole("admin"), async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const id = c.req.param("id")!;

  const [deleted] = await db
    .delete(templates)
    .where(and(eq(templates.id, id), eq(templates.organizationId, orgId)))
    .returning({ id: templates.id });

  if (!deleted) {
    return c.json({ error: "Template nicht gefunden" }, 404);
  }

  return c.json({ success: true });
});

export default app;
