import { Hono } from "hono";
import { z } from "zod/v4";
import { requireAuth, getOrgId, type AuthContext } from "../middleware/auth";
import { incrementUsage } from "../services/usage";
import * as fs from "node:fs/promises";
import * as path from "node:path";

// ─── Config ────────────────────────────────────────────────────────────────

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
// Max file size: 10 MB (base64 = ~33% larger than raw, so ~13.3 MB base64 string)
const MAX_BASE64_SIZE = 14 * 1024 * 1024;

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf', 'application/json'];

// Erlaubte Content-Types
const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
  "application/json",
  "text/plain",
  "text/csv",
]);

// ─── Zod Schemas ───────────────────────────────────────────────────────────

const uploadBodySchema = z.object({
  path: z.string().min(1, "Pfad erforderlich").max(255),
  data: z.string().min(1, "Daten erforderlich"),
  contentType: z.string().min(1, "Content-Type erforderlich"),
});

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Erstellt den vollständigen Pfad für eine Datei innerhalb des Upload-Verzeichnisses.
 * Validiert gegen Path Traversal.
 */
function resolveUploadPath(orgId: string, filePath: string): string {
  // Normalisieren und bereinigen — keine ../ erlauben
  const sanitized = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '').replace(/^\/+/, "");
  const uploadDir = path.resolve(UPLOAD_DIR, orgId);
  const fullPath = path.resolve(uploadDir, sanitized);

  // Sicherheitscheck: Pfad muss innerhalb Upload-Dir bleiben
  if (!fullPath.startsWith(path.resolve(uploadDir))) {
    throw new Error("Ungültiger Dateipfad");
  }

  return fullPath;
}

/**
 * Stellt sicher, dass das Verzeichnis existiert.
 */
async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

// ─── Router ────────────────────────────────────────────────────────────────

const fileRoutes = new Hono();

// Alle File-Routen erfordern Auth
fileRoutes.use("/*", requireAuth);

// POST /upload — Datei als Base64 hochladen
fileRoutes.post("/upload", async (c: AuthContext) => {
  const body = await c.req.json();
  const parsed = uploadBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" }, 400);
  }

  const { path: filePath, data, contentType } = parsed.data;

  // Content-Type prüfen
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return c.json(
      { error: `Content-Type nicht erlaubt: ${contentType}` },
      400,
    );
  }

  // Größe prüfen
  if (data.length > MAX_BASE64_SIZE) {
    return c.json({ error: "Datei zu groß (max. 10 MB)" }, 413);
  }

  const orgId = getOrgId(c);

  let fullPath: string;
  try {
    fullPath = resolveUploadPath(orgId, filePath);
  } catch {
    return c.json({ error: "Ungültiger Dateipfad" }, 400);
  }

  // Base64 dekodieren
  let buffer: Buffer;
  try {
    // base64 data URL prefix entfernen falls vorhanden
    const raw = data.replace(/^data:[^;]+;base64,/, "");
    buffer = Buffer.from(raw, "base64");
  } catch {
    return c.json({ error: "Ungültige Base64-Daten" }, 400);
  }

  // Decoded file size check
  if (buffer.length > MAX_FILE_SIZE) {
    return c.json({ error: "Datei zu groß (max. 10 MB)" }, 413);
  }

  // Verzeichnis erstellen und Datei schreiben
  try {
    await ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, buffer);
  } catch (err) {
    console.error("File write error:", err);
    return c.json({ error: "Datei konnte nicht gespeichert werden" }, 500);
  }

  // Storage-Usage tracken (non-blocking)
  incrementUsage(orgId, "apiCalls").catch((e) =>
    console.error("File upload usage tracking failed:", e),
  );

  const storedPath = `${orgId}/${filePath.replace(/^\/+/, "")}`;
  return c.json({ path: storedPath }, 201);
});

// GET /download/:path{.+} — Datei herunterladen
fileRoutes.get("/download/*", async (c: AuthContext) => {
  const orgId = getOrgId(c);
  // Alles nach /download/ ist der Dateipfad
  const filePath = c.req.path.replace(/^\/download\//, "");

  if (!filePath) {
    return c.json({ error: "Dateipfad erforderlich" }, 400);
  }

  let fullPath: string;
  try {
    fullPath = resolveUploadPath(orgId, filePath);
  } catch {
    return c.json({ error: "Ungültiger Dateipfad" }, 400);
  }

  // Prüfen ob Datei existiert
  try {
    await fs.access(fullPath);
  } catch {
    return c.json({ error: "Datei nicht gefunden" }, 404);
  }

  // Datei lesen und als Base64 Data URL zurückgeben
  try {
    const buffer = await fs.readFile(fullPath);
    const base64 = buffer.toString("base64");

    // Content-Type aus Dateiendung ableiten
    const ext = path.extname(fullPath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".pdf": "application/pdf",
      ".json": "application/json",
      ".txt": "text/plain",
      ".csv": "text/csv",
    };
    const contentType = contentTypeMap[ext] || "application/octet-stream";

    return c.json({
      data: `data:${contentType};base64,${base64}`,
      contentType,
      size: buffer.length,
    });
  } catch (err) {
    console.error("File read error:", err);
    return c.json({ error: "Datei konnte nicht gelesen werden" }, 500);
  }
});

// DELETE /:path{.+} — Datei löschen
fileRoutes.delete("/*", async (c: AuthContext) => {
  const orgId = getOrgId(c);
  // Alles nach dem führenden / ist der Dateipfad
  const filePath = c.req.path.replace(/^\//, "");

  if (!filePath) {
    return c.json({ error: "Dateipfad erforderlich" }, 400);
  }

  let fullPath: string;
  try {
    fullPath = resolveUploadPath(orgId, filePath);
  } catch {
    return c.json({ error: "Ungültiger Dateipfad" }, 400);
  }

  // Prüfen ob Datei existiert
  try {
    await fs.access(fullPath);
  } catch {
    return c.json({ error: "Datei nicht gefunden" }, 404);
  }

  // Datei löschen
  try {
    await fs.unlink(fullPath);
  } catch (err) {
    console.error("File delete error:", err);
    return c.json({ error: "Datei konnte nicht gelöscht werden" }, 500);
  }

  return c.json({ ok: true });
});

export default fileRoutes;
