import { db } from "../db";
import { usageRecords } from "../db/schema";
import { sql, and, eq } from "drizzle-orm";

// ─── Typen ──────────────────────────────────────────────────────────────────

type UsageField =
  | "submissionsCount"
  | "templatesCount"
  | "aiCreditsUsed"
  | "apiCalls";

// Mapping von Field-Namen auf DB-Spalten
const FIELD_COLUMN_MAP: Record<UsageField, keyof typeof usageRecords> = {
  submissionsCount: "submissionsCount",
  templatesCount: "templatesCount",
  aiCreditsUsed: "aiCreditsUsed",
  apiCalls: "apiCalls",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Gibt den 1. des aktuellen Monats als ISO-Date-String zurück.
 */
function getCurrentPeriodStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

/**
 * Gibt den letzten Tag des aktuellen Monats als ISO-Date-String zurück.
 */
function getCurrentPeriodEnd(): string {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
}

// ─── incrementUsage ─────────────────────────────────────────────────────────

/**
 * Inkrementiert ein Usage-Feld für die aktuelle Periode der Organisation.
 * Verwendet UPSERT: erstellt den Record falls er noch nicht existiert.
 */
export async function incrementUsage(
  orgId: string,
  field: UsageField,
  amount = 1,
): Promise<void> {
  const periodStart = getCurrentPeriodStart();
  const periodEnd = getCurrentPeriodEnd();
  const column = FIELD_COLUMN_MAP[field];

  try {
    await db
      .insert(usageRecords)
      .values({
        organizationId: orgId,
        periodStart,
        periodEnd,
        [column]: amount,
      })
      .onConflictDoUpdate({
        target: [usageRecords.organizationId, usageRecords.periodStart],
        set: {
          [column]: sql`${usageRecords[column]} + ${amount}`,
          updatedAt: new Date(),
        },
      });
  } catch (e) {
    // Usage-Tracking darf nie die eigentliche Request blockieren
    console.error("Usage increment failed:", e);
  }
}

/**
 * Gibt die aktuelle Usage für eine Organisation zurück.
 */
export async function getUsage(orgId: string) {
  const periodStart = getCurrentPeriodStart();

  const [record] = await db
    .select()
    .from(usageRecords)
    .where(
      and(
        eq(usageRecords.organizationId, orgId),
        eq(usageRecords.periodStart, periodStart),
      ),
    )
    .limit(1);

  return record ?? null;
}
