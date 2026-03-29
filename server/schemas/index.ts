import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod/v4";
import {
  templates,
  submissions,
  customers,
  projects,
} from "../db/schema";

// ─── Template Schemas ───────────────────────────────────────────────────────
export const templateInsertSchema = createInsertSchema(templates, {
  name: (schema) => schema.min(1, "Name ist erforderlich"),
  schema: z.any(), // JSONB, validated at application level
}).omit({ id: true, organizationId: true, createdAt: true, updatedAt: true });

export const templateSelectSchema = createSelectSchema(templates);

export const templateUpdateSchema = templateInsertSchema.partial();

// ─── Submission Schemas ─────────────────────────────────────────────────────
export const submissionInsertSchema = createInsertSchema(submissions, {
  data: z.record(z.string(), z.any()),
}).omit({ id: true, organizationId: true, createdAt: true, updatedAt: true });

export const submissionSelectSchema = createSelectSchema(submissions);

export const submissionUpdateSchema = submissionInsertSchema.partial();

// ─── Customer Schemas ───────────────────────────────────────────────────────
export const customerInsertSchema = createInsertSchema(customers, {
  name: (schema) => schema.min(1, "Name ist erforderlich"),
}).omit({ id: true, organizationId: true, createdAt: true, updatedAt: true });

export const customerSelectSchema = createSelectSchema(customers);

export const customerUpdateSchema = customerInsertSchema.partial();

// ─── Project Schemas ────────────────────────────────────────────────────────
export const projectInsertSchema = createInsertSchema(projects, {
  name: (schema) => schema.min(1, "Name ist erforderlich"),
}).omit({ id: true, organizationId: true, createdAt: true, updatedAt: true });

export const projectSelectSchema = createSelectSchema(projects);

export const projectUpdateSchema = projectInsertSchema.partial();
