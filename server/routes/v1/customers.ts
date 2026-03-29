import { Hono } from "hono";
import { z } from "zod";
import { eq, and, asc } from "drizzle-orm";
import { db } from "../../db";
import { customers } from "../../db/schema";
import { requireScope, type ApiAuthContext } from "../../middleware/api-auth";

// ─── Validation ─────────────────────────────────────────────────────────────

const createCustomerSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  email: z.string().email().optional().or(z.literal("")).or(z.null()),
  phone: z.string().optional().or(z.null()),
  address: z.string().optional().or(z.null()),
  notes: z.string().optional().or(z.null()),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ─── Router ─────────────────────────────────────────────────────────────────

const app = new Hono();

// GET / — Kunden auflisten (read scope)
app.get("/", requireScope("read"), async (c: ApiAuthContext) => {
  const orgId = c.get("orgId");
  const limit = Math.min(Number(c.req.query("limit")) || 100, 500);
  const offset = Number(c.req.query("offset")) || 0;

  const result = await db
    .select()
    .from(customers)
    .where(eq(customers.organizationId, orgId))
    .orderBy(asc(customers.name))
    .limit(limit)
    .offset(offset);

  return c.json({ data: result, meta: { limit, offset, count: result.length } });
});

// POST / — Kunde erstellen (write scope)
app.post("/", requireScope("write"), async (c: ApiAuthContext) => {
  const orgId = c.get("orgId");
  const body = await c.req.json();

  const parsed = createCustomerSchema.safeParse(body);
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

export default app;
