import { Hono } from "hono";
import { z } from "zod";
import { eq, and, asc } from "drizzle-orm";
import { db } from "../db";
import { customers } from "../db/schema";
import { requireAuth, requireRole, getOrgId, type AuthContext } from "../middleware/auth";

// ─── Validation ─────────────────────────────────────────────────────────────

const createCustomerSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(255).trim(),
  email: z.string().email().trim().optional().or(z.literal("")).or(z.null()),
  phone: z.string().max(30).optional().or(z.null()),
  address: z.string().max(500).optional().or(z.null()),
  notes: z.string().max(5000).optional().or(z.null()),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const updateCustomerSchema = createCustomerSchema.partial();

// ─── Router ─────────────────────────────────────────────────────────────────

const app = new Hono();

app.use("*", requireAuth);

// GET / — Kunden auflisten, sortiert nach Name
app.get("/", async (c: AuthContext) => {
  const orgId = getOrgId(c);

  const result = await db
    .select()
    .from(customers)
    .where(eq(customers.organizationId, orgId))
    .orderBy(asc(customers.name))
    .limit(500);

  return c.json({ data: result });
});

// GET /:id — Einzelner Kunde
app.get("/:id", async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const id = c.req.param("id")!;

  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.organizationId, orgId)))
    .limit(1);

  if (!customer) {
    return c.json({ error: "Kunde nicht gefunden" }, 404);
  }

  return c.json({ data: customer });
});

// POST / — Kunde erstellen
app.post("/", async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const body = await c.req.json();

  const parsed = createCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validierungsfehler", details: parsed.error.flatten() }, 400);
  }

  const [created] = await db
    .insert(customers)
    .values({
      organizationId: orgId,
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      notes: parsed.data.notes || null,
      metadata: parsed.data.metadata ?? {},
    })
    .returning();

  return c.json({ data: created }, 201);
});

// PUT /:id — Kunde aktualisieren
app.put("/:id", async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const id = c.req.param("id")!;
  const body = await c.req.json();

  const parsed = updateCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validierungsfehler", details: parsed.error.flatten() }, 400);
  }

  // Prüfen ob Kunde existiert und zur Org gehört
  const [existing] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.organizationId, orgId)))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Kunde nicht gefunden" }, 404);
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.email !== undefined) updateData.email = parsed.data.email || null;
  if (parsed.data.phone !== undefined) updateData.phone = parsed.data.phone || null;
  if (parsed.data.address !== undefined) updateData.address = parsed.data.address || null;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes || null;
  if (parsed.data.metadata !== undefined) updateData.metadata = parsed.data.metadata;

  const [updated] = await db
    .update(customers)
    .set(updateData)
    .where(and(eq(customers.id, id), eq(customers.organizationId, orgId)))
    .returning();

  return c.json({ data: updated });
});

// DELETE /:id — Kunde löschen (nur admin)
app.delete("/:id", requireRole("admin"), async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const id = c.req.param("id")!;

  const [deleted] = await db
    .delete(customers)
    .where(and(eq(customers.id, id), eq(customers.organizationId, orgId)))
    .returning({ id: customers.id });

  if (!deleted) {
    return c.json({ error: "Kunde nicht gefunden" }, 404);
  }

  return c.json({ success: true });
});

export default app;
