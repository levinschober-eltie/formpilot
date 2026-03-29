import { db } from "../db";
import { rateLimits } from "../db/schema";
import { sql, lt } from "drizzle-orm";

const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 Minuten
const DEFAULT_MAX_ATTEMPTS = 10;

/**
 * PostgreSQL-basiertes Rate Limiting (serverless-safe).
 * Verwendet UPSERT für atomisches Zähler-Inkrement.
 * Fail-open bei DB-Fehlern.
 */
export async function checkRateLimit(
  key: string,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  windowMs = DEFAULT_WINDOW_MS,
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - windowMs);

  try {
    // Atomic upsert: insert oder increment, reset wenn Fenster abgelaufen
    const [result] = await db
      .insert(rateLimits)
      .values({ key, count: 1, windowStart: new Date() })
      .onConflictDoUpdate({
        target: rateLimits.key,
        set: {
          count: sql`CASE
            WHEN ${rateLimits.windowStart} < ${windowStart} THEN 1
            ELSE ${rateLimits.count} + 1
          END`,
          windowStart: sql`CASE
            WHEN ${rateLimits.windowStart} < ${windowStart} THEN NOW()
            ELSE ${rateLimits.windowStart}
          END`,
        },
      })
      .returning({ count: rateLimits.count });

    const count = result?.count ?? 1;
    const remaining = Math.max(0, maxAttempts - count);

    return { allowed: count <= maxAttempts, remaining };
  } catch (e) {
    // Fail-open: bei DB-Fehler Request durchlassen,
    // damit der eigentliche Handler einen sauberen Fehler zurückgibt.
    // WARNUNG: Im Produktivbetrieb sollte dies überwacht werden.
    console.error("[CRITICAL] Rate limit DB check failed — fail-open active:", e);
    return { allowed: true, remaining: maxAttempts };
  }
}

/**
 * Cleanup abgelaufener Rate-Limit-Einträge (via Cron oder periodisch).
 */
export async function cleanupRateLimits(): Promise<void> {
  const cutoff = new Date(Date.now() - 60 * 60 * 1000); // 1 Stunde alt
  await db.delete(rateLimits).where(lt(rateLimits.windowStart, cutoff));
}
