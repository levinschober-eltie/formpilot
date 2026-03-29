import { Hono } from "hono";
import { requireScope, type ApiAuthContext } from "../../middleware/api-auth";
import { getUsage } from "../../services/usage";

// ─── Router ─────────────────────────────────────────────────────────────────

const app = new Hono();

// GET / — Aktuelle Monats-Usage abrufen (read scope)
app.get("/", requireScope("read"), async (c: ApiAuthContext) => {
  const orgId = c.get("orgId");

  const usage = await getUsage(orgId);

  if (!usage) {
    return c.json({
      data: {
        submissionsCount: 0,
        templatesCount: 0,
        aiCreditsUsed: 0,
        apiCalls: 0,
        storageBytes: 0,
        periodStart: null,
        periodEnd: null,
      },
    });
  }

  return c.json({
    data: {
      submissionsCount: usage.submissionsCount,
      templatesCount: usage.templatesCount,
      aiCreditsUsed: usage.aiCreditsUsed,
      apiCalls: usage.apiCalls,
      storageBytes: usage.storageBytes,
      periodStart: usage.periodStart,
      periodEnd: usage.periodEnd,
    },
  });
});

export default app;
