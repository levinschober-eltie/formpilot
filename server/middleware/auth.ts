import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { Context, Next } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db";
import {
  user,
  session,
  account,
  verification,
  profiles,
  organizations,
} from "../db/schema";

// ─── better-auth Instanz ────────────────────────────────────────────────────

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    revokeOtherSessions: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 Tage
    updateAge: 60 * 60 * 24, // 1 Tag
  },
  trustedOrigins: [
    process.env.FRONTEND_URL || "http://localhost:5173",
  ],
});

// ─── Typen ──────────────────────────────────────────────────────────────────

type Profile = typeof profiles.$inferSelect;
type SessionData = Awaited<ReturnType<typeof auth.api.getSession>>;

type AuthEnv = {
  Variables: {
    user: Profile;
    session: NonNullable<SessionData>;
  };
};

export type AuthContext = Context<AuthEnv>;

// ─── Role Hierarchy ─────────────────────────────────────────────────────────

const ROLE_HIERARCHY: Record<string, number> = {
  admin: 3,
  buero: 2,
  monteur: 1,
};

type Role = "admin" | "buero" | "monteur";

// ─── requireAuth Middleware ─────────────────────────────────────────────────

/**
 * Hono middleware: validiert Session, lädt Profil, setzt c.set('user') + c.set('session').
 * Bei fehlender/ungültiger Session -> 401.
 */
export async function requireAuth(c: Context<AuthEnv>, next: Next): Promise<Response | void> {
  try {
    const sessionData = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!sessionData) {
      return c.json({ error: "Nicht authentifiziert" }, 401);
    }

    // Profil über userId laden
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, sessionData.user.id))
      .limit(1);

    if (!profile) {
      return c.json({ error: "Kein Profil gefunden" }, 401);
    }

    if (!profile.active) {
      return c.json({ error: "Konto deaktiviert" }, 403);
    }

    c.set("user", profile);
    c.set("session", sessionData);

    await next();
  } catch (error) {
    console.error("[Auth] Middleware error:", error);
    return c.json({ error: "Authentifizierungsfehler" }, 500);
  }
}

// ─── requireRole Middleware Factory ─────────────────────────────────────────

/**
 * Erzeugt Middleware die prüft ob der User mindestens die angegebene Rolle hat.
 * Hierarchie: admin > buero > monteur
 */
export function requireRole(minimumRole: Role) {
  return async (c: Context<AuthEnv>, next: Next): Promise<Response | void> => {
    const profile = c.get("user");

    if (!profile) {
      return c.json({ error: "Nicht authentifiziert" }, 401);
    }

    const userLevel = ROLE_HIERARCHY[profile.role] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[minimumRole] ?? 0;

    if (userLevel < requiredLevel) {
      return c.json(
        { error: "Unzureichende Berechtigung" },
        403,
      );
    }

    await next();
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Gibt die organization_id des aktuellen Users zurück.
 */
export function getOrgId(c: Context<AuthEnv>): string {
  const profile = c.get("user");
  return profile.organizationId;
}
