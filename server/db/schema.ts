import {
  pgTable,
  uuid,
  text,
  integer,
  bigint,
  boolean,
  date,
  timestamp,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "monteur",
  "buero",
]);

export const templateCategoryEnum = pgEnum("template_category", [
  "service",
  "abnahme",
  "mangel",
  "pruefung",
  "uebergabe",
  "custom",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "draft",
  "completed",
  "sent",
  "archived",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "planning",
  "active",
  "completed",
  "archived",
]);

export const subscriptionPlanEnum = pgEnum("subscription_plan", [
  "free",
  "pro",
  "business",
  "enterprise",
  "sdk",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "trialing",
  "past_due",
  "canceled",
  "incomplete",
]);

// ─── better-auth Tabellen ────────────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// ─── Domain-Tabellen ─────────────────────────────────────────────────────────

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    role: userRoleEnum("role").notNull().default("monteur"),
    pinHash: text("pin_hash"),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("profiles_org_idx").on(table.organizationId),
    index("profiles_user_idx").on(table.userId),
    index("profiles_pin_hash_idx").on(table.pinHash),
  ],
);

export const templates = pgTable(
  "templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    createdBy: uuid("created_by").references(() => profiles.id),
    name: text("name").notNull(),
    description: text("description"),
    category: templateCategoryEnum("category").notNull().default("custom"),
    icon: text("icon").default("📋"),
    version: integer("version").default(1).notNull(),
    schema: jsonb("schema").notNull(),
    pdfSettings: jsonb("pdf_settings").default({}),
    emailTemplate: jsonb("email_template").default({}),
    isDemo: boolean("is_demo").default(false).notNull(),
    isArchived: boolean("is_archived").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    visibleForRoles: jsonb("visible_for_roles").default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("templates_org_idx").on(table.organizationId),
    index("templates_category_idx").on(table.category),
    index("templates_created_at_idx").on(table.createdAt),
  ],
);

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    templateId: uuid("template_id").references(() => templates.id),
    templateVersion: integer("template_version").default(1).notNull(),
    filledBy: uuid("filled_by").references(() => profiles.id),
    filledByName: text("filled_by_name"),
    status: submissionStatusEnum("status").notNull().default("draft"),
    data: jsonb("data").notNull().default({}),
    metadata: jsonb("metadata").default({}),
    customerId: uuid("customer_id").references(() => customers.id),
    customerName: text("customer_name"),
    customerEmail: text("customer_email"),
    projectId: uuid("project_id").references(() => projects.id),
    projectName: text("project_name"),
    projectAddress: text("project_address"),
    signatures: jsonb("signatures").default([]),
    photos: jsonb("photos").default([]),
    pdfPath: text("pdf_path"),
    pdfGeneratedAt: timestamp("pdf_generated_at"),
    emailSent: boolean("email_sent").default(false).notNull(),
    emailSentAt: timestamp("email_sent_at"),
    emailTo: text("email_to"),
    gpsLat: text("gps_lat"),
    gpsLng: text("gps_lng"),
    startedAt: timestamp("started_at").defaultNow(),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("submissions_org_idx").on(table.organizationId),
    index("submissions_template_idx").on(table.templateId),
    index("submissions_status_idx").on(table.status),
    index("submissions_filled_by_idx").on(table.filledBy),
    index("submissions_created_at_idx").on(table.createdAt),
    index("submissions_customer_idx").on(table.customerId),
    index("submissions_project_idx").on(table.projectId),
  ],
);

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    notes: text("notes"),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("customers_org_idx").on(table.organizationId),
    index("customers_email_idx").on(table.email),
  ],
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id").references(() => customers.id),
    name: text("name").notNull(),
    description: text("description"),
    status: projectStatusEnum("status").notNull().default("planning"),
    sharedData: jsonb("shared_data").default({}),
    phases: jsonb("phases").default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("projects_org_idx").on(table.organizationId),
    index("projects_customer_idx").on(table.customerId),
    index("projects_status_idx").on(table.status),
  ],
);

export const activityLog = pgTable(
  "activity_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => profiles.id),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id"),
    details: jsonb("details").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("activity_log_org_idx").on(table.organizationId),
    index("activity_log_entity_idx").on(table.entityType, table.entityId),
    index("activity_log_created_at_idx").on(table.createdAt),
    index("activity_log_user_idx").on(table.userId),
  ],
);

// ─── Billing / SaaS ─────────────────────────────────────────────────────────

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .unique()
      .references(() => organizations.id, { onDelete: "cascade" }),
    stripeCustomerId: text("stripe_customer_id").unique(),
    stripeSubscriptionId: text("stripe_subscription_id").unique(),
    plan: subscriptionPlanEnum("plan").notNull().default("free"),
    status: subscriptionStatusEnum("status").notNull().default("active"),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("subscriptions_stripe_idx").on(table.stripeCustomerId),
  ],
);

export const usageRecords = pgTable(
  "usage_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    submissionsCount: integer("submissions_count").default(0).notNull(),
    templatesCount: integer("templates_count").default(0).notNull(),
    aiCreditsUsed: integer("ai_credits_used").default(0).notNull(),
    storageBytes: bigint("storage_bytes", { mode: "number" }).default(0).notNull(),
    apiCalls: integer("api_calls").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("usage_records_org_period_idx").on(
      table.organizationId,
      table.periodStart,
    ),
  ],
);

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    keyHash: text("key_hash").notNull().unique(),
    keyPrefix: text("key_prefix").notNull(),
    scopes: jsonb("scopes").default(["read", "write"]),
    lastUsedAt: timestamp("last_used_at"),
    expiresAt: timestamp("expires_at"),
    active: boolean("active").default(true).notNull(),
    createdBy: uuid("created_by").references(() => profiles.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("api_keys_org_idx").on(table.organizationId),
    index("api_keys_hash_idx").on(table.keyHash),
    index("api_keys_prefix_idx").on(table.keyPrefix),
  ],
);

export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: userRoleEnum("role").notNull().default("monteur"),
    invitedBy: uuid("invited_by").references(() => profiles.id),
    token: text("token").notNull().unique(),
    acceptedAt: timestamp("accepted_at"),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("invitations_token_idx").on(table.token),
    index("invitations_org_idx").on(table.organizationId),
  ],
);

export const webhooks = pgTable(
  "webhooks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    events: jsonb("events").notNull(),
    secret: text("secret").notNull(),
    active: boolean("active").default(true).notNull(),
    lastTriggeredAt: timestamp("last_triggered_at"),
    failureCount: integer("failure_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("webhooks_org_idx").on(table.organizationId),
  ],
);

export const rateLimits = pgTable(
  "rate_limits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull().unique(),
    count: integer("count").default(0).notNull(),
    windowStart: timestamp("window_start").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("rate_limits_key_idx").on(table.key),
  ],
);

// ─── Relations ───────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  profiles: many(profiles),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const organizationRelations = relations(organizations, ({ many, one }) => ({
  profiles: many(profiles),
  templates: many(templates),
  submissions: many(submissions),
  customers: many(customers),
  projects: many(projects),
  subscription: one(subscriptions, {
    fields: [organizations.id],
    references: [subscriptions.organizationId],
  }),
}));

export const profileRelations = relations(profiles, ({ one }) => ({
  user: one(user, { fields: [profiles.userId], references: [user.id] }),
  organization: one(organizations, {
    fields: [profiles.organizationId],
    references: [organizations.id],
  }),
}));

export const templateRelations = relations(templates, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [templates.organizationId],
    references: [organizations.id],
  }),
  submissions: many(submissions),
}));

export const submissionRelations = relations(submissions, ({ one }) => ({
  organization: one(organizations, {
    fields: [submissions.organizationId],
    references: [organizations.id],
  }),
  template: one(templates, {
    fields: [submissions.templateId],
    references: [templates.id],
  }),
  customer: one(customers, {
    fields: [submissions.customerId],
    references: [customers.id],
  }),
  project: one(projects, {
    fields: [submissions.projectId],
    references: [projects.id],
  }),
}));

export const customerRelations = relations(customers, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [customers.organizationId],
    references: [organizations.id],
  }),
  submissions: many(submissions),
  projects: many(projects),
}));

export const projectRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  customer: one(customers, {
    fields: [projects.customerId],
    references: [customers.id],
  }),
  submissions: many(submissions),
}));

export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  organization: one(organizations, {
    fields: [subscriptions.organizationId],
    references: [organizations.id],
  }),
}));
