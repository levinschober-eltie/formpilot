import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { auth } from "./middleware/auth";
import authRoutes from "./routes/auth";
import templateRoutes from "./routes/templates";
import submissionRoutes from "./routes/submissions";
import customerRoutes from "./routes/customers";
import projectRoutes from "./routes/projects";
import activityRoutes from "./routes/activity";
import aiRoutes from "./routes/ai";
import fileRoutes from "./routes/files";
import billingRoutes from "./routes/billing";
import invitationRoutes from "./routes/invitations";
import v1Routes from "./routes/v1";
import apiKeyRoutes from "./routes/api-keys";

// ─── Environment Validation ─────────────────────────────────────────────────
const REQUIRED_ENV = ['DATABASE_URL', 'BETTER_AUTH_SECRET'] as const;
const OPTIONAL_ENV = ['ANTHROPIC_API_KEY', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_PRICE_PRO', 'STRIPE_PRICE_BUSINESS'] as const;

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[FATAL] Missing required env var: ${key}`);
    process.exit(1);
  }
}

for (const key of OPTIONAL_ENV) {
  if (!process.env[key]) {
    console.warn(`[WARN] Missing optional env var: ${key} — related features will be disabled`);
  }
}

// ─── App Setup ──────────────────────────────────────────────────────────────

const app = new Hono();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const PORT = Number(process.env.PORT) || 3001;

// ─── Global Middleware ──────────────────────────────────────────────────────

app.use("*", logger());

app.use(
  "*",
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    maxAge: 86400,
  }),
);

// ─── Health Check ───────────────────────────────────────────────────────────

app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.1.0",
  });
});

// ─── better-auth Handler ────────────────────────────────────────────────────

app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

// ─── API Routes ─────────────────────────────────────────────────────────────

app.route("/api/auth", authRoutes);
app.route("/api/templates", templateRoutes);
app.route("/api/submissions", submissionRoutes);
app.route("/api/customers", customerRoutes);
app.route("/api/projects", projectRoutes);
app.route("/api/activity", activityRoutes);
app.route("/api/ai", aiRoutes);
app.route("/api/files", fileRoutes);
app.route("/api/billing", billingRoutes);
app.route("/api/invitations", invitationRoutes);
app.route("/api/v1", v1Routes);
app.route("/api/api-keys", apiKeyRoutes);

// ─── 404 Fallback ───────────────────────────────────────────────────────────

app.notFound((c) => {
  return c.json({ error: "Route nicht gefunden" }, 404);
});

// ─── Error Handler ──────────────────────────────────────────────────────────

app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json(
    { error: "Interner Serverfehler" },
    500,
  );
});

// ─── Server Start ───────────────────────────────────────────────────────────

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`FormPilot API läuft auf http://localhost:${info.port}`);
});

export default app;
