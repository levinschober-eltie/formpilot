import { randomBytes } from "crypto";
import type { Context, Next } from "hono";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { apiKeys } from "../db/schema";

// ─── Typen ──────────────────────────────────────────────────────────────────

export type ApiAuthResult = {
  orgId: string;
  scopes: string[];
  keyId: string;
};

type ApiAuthEnv = {
  Variables: {
    orgId: string;
    scopes: string[];
    keyId: string;
  };
};

export type ApiAuthContext = Context<ApiAuthEnv>;

// ─── SHA-256 Helper ─────────────────────────────────────────────────────────

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ─── authenticateApiKey ─────────────────────────────────────────────────────

/**
 * Authentifiziert einen API-Key aus dem Authorization-Header.
 * Key-Format: fp_live_ + 24 hex chars (insgesamt 32 chars).
 * Speicherung: keyPrefix (erste 16 chars) + SHA-256 Hash des vollen Keys.
 */
export async function authenticateApiKey(
  c: Context,
): Promise<ApiAuthResult | null> {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer fp_")) return null;

  const key = authHeader.slice(7); // "Bearer " entfernen
  const prefix = key.substring(0, 16); // "fp_live_" + 8 hex chars

  // Vollen Key hashen
  const keyHash = await sha256(key);

  // Passenden Key in DB suchen
  const [found] = await db
    .select({
      id: apiKeys.id,
      organizationId: apiKeys.organizationId,
      scopes: apiKeys.scopes,
      expiresAt: apiKeys.expiresAt,
    })
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.keyPrefix, prefix),
        eq(apiKeys.keyHash, keyHash),
        eq(apiKeys.active, true),
      ),
    )
    .limit(1);

  if (!found) return null;

  // Ablauf prüfen
  if (found.expiresAt && found.expiresAt < new Date()) return null;

  // lastUsedAt aktualisieren (non-blocking)
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, found.id))
    .catch(() => {});

  return {
    orgId: found.organizationId,
    scopes: (found.scopes as string[]) ?? ["read", "write"],
    keyId: found.id,
  };
}

// ─── requireApiAuth Middleware ──────────────────────────────────────────────

/**
 * Hono-Middleware: Validiert API-Key, setzt orgId/scopes/keyId auf Context.
 * Bei fehlendem/ungültigem Key -> 401.
 */
export async function requireApiAuth(
  c: Context<ApiAuthEnv>,
  next: Next,
): Promise<Response | void> {
  const auth = await authenticateApiKey(c);

  if (!auth) {
    return c.json(
      { error: "Invalid or missing API key", code: "UNAUTHORIZED" },
      401,
    );
  }

  c.set("orgId", auth.orgId);
  c.set("scopes", auth.scopes);
  c.set("keyId", auth.keyId);

  await next();
}

// ─── requireScope Middleware Factory ────────────────────────────────────────

/**
 * Erzeugt Middleware die prüft ob der API-Key den erforderlichen Scope hat.
 * Typische Scopes: "read", "write"
 */
export function requireScope(scope: string) {
  return async (
    c: Context<ApiAuthEnv>,
    next: Next,
  ): Promise<Response | void> => {
    const scopes = c.get("scopes");

    if (!scopes || !scopes.includes(scope)) {
      return c.json(
        {
          error: `API key missing required scope: ${scope}`,
          code: "FORBIDDEN",
        },
        403,
      );
    }

    await next();
  };
}

// ─── generateApiKey ─────────────────────────────────────────────────────────

/**
 * Generiert einen neuen API-Key für eine Organisation.
 * Der volle Key wird nur einmal zurückgegeben!
 *
 * @returns { key, prefix, id } - key ist der volle Klartext-Key
 */
export async function generateApiKey(
  orgId: string,
  name: string,
  scopes: string[] = ["read", "write"],
  createdBy?: string,
  expiresAt?: Date,
): Promise<{ key: string; prefix: string; id: string }> {
  // fp_live_ + 24 hex chars = 32 chars total
  const randomHex = randomBytes(12).toString("hex"); // 24 hex chars
  const key = `fp_live_${randomHex}`;
  const prefix = key.substring(0, 16);
  const keyHash = await sha256(key);

  const [created] = await db
    .insert(apiKeys)
    .values({
      organizationId: orgId,
      name,
      keyHash,
      keyPrefix: prefix,
      scopes,
      createdBy: createdBy ?? null,
      expiresAt: expiresAt ?? null,
    })
    .returning({ id: apiKeys.id });

  return { key, prefix, id: created.id };
}
