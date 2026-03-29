import { Hono } from "hono";
import { requireApiAuth } from "../../middleware/api-auth";
import { checkRateLimit } from "../../middleware/rate-limit";
import { incrementUsage } from "../../services/usage";
import templateRoutes from "./templates";
import submissionRoutes from "./submissions";
import customerRoutes from "./customers";
import usageRoutes from "./usage";

// ─── v1 Public API ──────────────────────────────────────────────────────────

type ApiEnv = {
  Variables: {
    orgId: string;
    scopes: string[];
    keyId: string;
  };
};

const v1 = new Hono<ApiEnv>();

// API Key Auth + Rate Limit + Usage Tracking auf allen v1-Routen
v1.use("*", requireApiAuth as any);

v1.use("*", async (c, next) => {
  const orgId = c.get("orgId");

  // Rate Limit: 300 Requests pro Minute pro Organisation
  const { allowed, remaining } = await checkRateLimit(
    `v1:${orgId}`,
    300,
    60000,
  );

  if (!allowed) {
    return c.json(
      {
        error: "Rate limit exceeded. Max 300 requests per minute.",
        code: "RATE_LIMITED",
        retryAfter: 60,
      },
      429,
    );
  }

  // Rate-Limit-Header setzen
  c.header("X-RateLimit-Limit", "300");
  c.header("X-RateLimit-Remaining", String(remaining));

  // API-Call Usage tracken (non-blocking)
  incrementUsage(orgId, "apiCalls").catch(() => {});

  await next();
});

// ─── Sub-Routes ─────────────────────────────────────────────────────────────

v1.route("/templates", templateRoutes);
v1.route("/submissions", submissionRoutes);
v1.route("/customers", customerRoutes);
v1.route("/usage", usageRoutes);

// ─── API Info ───────────────────────────────────────────────────────────────

v1.get("/", (c) => {
  return c.json({
    api: "FormPilot",
    version: "v1",
    docs: "https://docs.formpilot.de/api/v1",
    endpoints: ["/templates", "/submissions", "/customers", "/usage"],
  });
});

export default v1;
