import { Hono } from "hono";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { submissions } from "../db/schema";
import { requireAuth, requireRole, getOrgId, type AuthContext } from "../middleware/auth";

// ─── Validation ─────────────────────────────────────────────────────────────

const STATUSES = ["draft", "completed", "sent", "archived"] as const;

const createSubmissionSchema = z.object({
  templateId: z.string().uuid().nullable().optional(),
  templateVersion: z.number().int().default(1),
  status: z.enum(STATUSES).default("draft"),
  data: z.record(z.string(), z.unknown()).default({}),
  metadata: z.record(z.string(), z.unknown()).optional(),
  filledByName: z.string().optional(),
  customerId: z.string().uuid().nullable().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  projectId: z.string().uuid().nullable().optional(),
  projectName: z.string().optional(),
  projectAddress: z.string().optional(),
  signatures: z.array(z.unknown()).default([]),
  photos: z.array(z.unknown()).default([]),
  gpsLat: z.string().optional(),
  gpsLng: z.string().optional(),
});

const updateSubmissionSchema = createSubmissionSchema.partial();

const statusUpdateSchema = z.object({
  status: z.enum(STATUSES),
});

// ─── Router ─────────────────────────────────────────────────────────────────

const app = new Hono();

app.use("*", requireAuth);

// GET / — Submissions auflisten
app.get("/", async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const status = c.req.query("status");
  const templateId = c.req.query("templateId");
  const filledBy = c.req.query("filledBy");

  const conditions = [eq(submissions.organizationId, orgId)];

  if (status && STATUSES.includes(status as (typeof STATUSES)[number])) {
    conditions.push(eq(submissions.status, status as (typeof STATUSES)[number]));
  }
  if (templateId) {
    conditions.push(eq(submissions.templateId, templateId));
  }
  if (filledBy) {
    conditions.push(eq(submissions.filledBy, filledBy));
  }

  const result = await db
    .select()
    .from(submissions)
    .where(and(...conditions))
    .orderBy(desc(submissions.createdAt))
    .limit(500);

  return c.json({ data: result });
});

// GET /:id — Einzelne Submission
app.get("/:id", async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const id = c.req.param("id")!;

  const [submission] = await db
    .select()
    .from(submissions)
    .where(and(eq(submissions.id, id), eq(submissions.organizationId, orgId)))
    .limit(1);

  if (!submission) {
    return c.json({ error: "Formular nicht gefunden" }, 404);
  }

  return c.json({ data: submission });
});

// POST / — Submission erstellen
app.post("/", async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const profile = c.get("user");
  const body = await c.req.json();

  const parsed = createSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validierungsfehler", details: parsed.error.flatten() }, 400);
  }

  const [created] = await db
    .insert(submissions)
    .values({
      organizationId: orgId,
      templateId: parsed.data.templateId ?? null,
      templateVersion: parsed.data.templateVersion,
      filledBy: profile.id,
      filledByName: parsed.data.filledByName ?? profile.name,
      status: parsed.data.status,
      data: parsed.data.data,
      metadata: parsed.data.metadata ?? {},
      customerId: parsed.data.customerId ?? null,
      customerName: parsed.data.customerName ?? null,
      customerEmail: parsed.data.customerEmail || null,
      projectId: parsed.data.projectId ?? null,
      projectName: parsed.data.projectName ?? null,
      projectAddress: parsed.data.projectAddress ?? null,
      signatures: parsed.data.signatures,
      photos: parsed.data.photos,
      gpsLat: parsed.data.gpsLat ?? null,
      gpsLng: parsed.data.gpsLng ?? null,
      startedAt: new Date(),
      completedAt: parsed.data.status === "completed" ? new Date() : null,
    })
    .returning();

  return c.json({ data: created }, 201);
});

// PUT /:id — Submission aktualisieren
app.put("/:id", async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const id = c.req.param("id")!;
  const body = await c.req.json();

  const parsed = updateSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validierungsfehler", details: parsed.error.flatten() }, 400);
  }

  // Prüfen ob Submission existiert und zur Org gehört
  const [existing] = await db
    .select({ id: submissions.id })
    .from(submissions)
    .where(and(eq(submissions.id, id), eq(submissions.organizationId, orgId)))
    .limit(1);

  if (!existing) {
    return c.json({ error: "Formular nicht gefunden" }, 404);
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.templateId !== undefined) updateData.templateId = parsed.data.templateId;
  if (parsed.data.templateVersion !== undefined) updateData.templateVersion = parsed.data.templateVersion;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.data !== undefined) updateData.data = parsed.data.data;
  if (parsed.data.metadata !== undefined) updateData.metadata = parsed.data.metadata;
  if (parsed.data.filledByName !== undefined) updateData.filledByName = parsed.data.filledByName;
  if (parsed.data.customerId !== undefined) updateData.customerId = parsed.data.customerId;
  if (parsed.data.customerName !== undefined) updateData.customerName = parsed.data.customerName;
  if (parsed.data.customerEmail !== undefined) updateData.customerEmail = parsed.data.customerEmail;
  if (parsed.data.projectId !== undefined) updateData.projectId = parsed.data.projectId;
  if (parsed.data.projectName !== undefined) updateData.projectName = parsed.data.projectName;
  if (parsed.data.projectAddress !== undefined) updateData.projectAddress = parsed.data.projectAddress;
  if (parsed.data.signatures !== undefined) updateData.signatures = parsed.data.signatures;
  if (parsed.data.photos !== undefined) updateData.photos = parsed.data.photos;
  if (parsed.data.gpsLat !== undefined) updateData.gpsLat = parsed.data.gpsLat;
  if (parsed.data.gpsLng !== undefined) updateData.gpsLng = parsed.data.gpsLng;

  // completedAt setzen wenn Status auf completed wechselt
  if (parsed.data.status === "completed") {
    updateData.completedAt = new Date();
  }

  const [updated] = await db
    .update(submissions)
    .set(updateData)
    .where(and(eq(submissions.id, id), eq(submissions.organizationId, orgId)))
    .returning();

  return c.json({ data: updated });
});

// PATCH /:id/status — Nur Status aktualisieren
app.patch("/:id/status", async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const id = c.req.param("id")!;
  const body = await c.req.json();

  const parsed = statusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validierungsfehler", details: parsed.error.flatten() }, 400);
  }

  const updateData: Record<string, unknown> = {
    status: parsed.data.status,
  };

  if (parsed.data.status === "completed") {
    updateData.completedAt = new Date();
  }

  const [updated] = await db
    .update(submissions)
    .set(updateData)
    .where(and(eq(submissions.id, id), eq(submissions.organizationId, orgId)))
    .returning();

  if (!updated) {
    return c.json({ error: "Formular nicht gefunden" }, 404);
  }

  return c.json({ data: updated });
});

// DELETE /:id — Submission löschen (nur admin)
app.delete("/:id", requireRole("admin"), async (c: AuthContext) => {
  const orgId = getOrgId(c);
  const id = c.req.param("id")!;

  const [deleted] = await db
    .delete(submissions)
    .where(and(eq(submissions.id, id), eq(submissions.organizationId, orgId)))
    .returning({ id: submissions.id });

  if (!deleted) {
    return c.json({ error: "Formular nicht gefunden" }, 404);
  }

  return c.json({ success: true });
});

export default app;
