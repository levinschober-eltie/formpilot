import { Hono } from "hono";
import { z } from "zod/v4";
import { requireAuth, getOrgId, type AuthContext } from "../middleware/auth";
import { incrementUsage } from "../services/usage";

// ─── Zod Schema ────────────────────────────────────────────────────────────

const generateBodySchema = z.object({
  prompt: z.string().min(10, "Bitte beschreibe dein Formular genauer (mindestens 10 Zeichen).").max(2000).trim(),
  language: z.string().default("de"),
});

// ─── System Prompt (identisch mit aiService.js) ────────────────────────────

const SYSTEM_PROMPT = `Du bist ein Formular-Experte für Handwerk, Bau und Facility Management.
Du erstellst digitale Formulare im FormPilot-Schema.

REGELN:
1. Antworte NUR mit einem JSON-Objekt. Kein Markdown, kein Text drumherum.
2. Verwende NUR diese Feldtypen: text, textarea, number, date, time, select, radio, checkbox, toggle, checklist, rating, heading, divider, info, signature, photo, repeater
3. Jedes Feld braucht: id (einzigartig, Format: "field-ai-{nummer}"), type, label
4. Organisiere logisch in Seiten (pages)
5. Nutze bedingte Logik wo sinnvoll
6. Denke an: Kopfdaten → Details → Prüfung → Ergebnis → Unterschrift
7. Nutze deutsche Labels und Optionen
8. Markiere wichtige Felder als required: true
9. Verwende passende Feldtypen (z.B. Toggle für Ja/Nein, Rating für Bewertungen, Checklist für Prüfpunkte, Repeater für dynamische Listen)

SCHEMA:
{
  "name": "Formular-Name",
  "description": "Kurzbeschreibung",
  "category": "service|abnahme|mangel|pruefung|uebergabe|custom",
  "icon": "Passendes Emoji",
  "pages": [{
    "id": "p1",
    "title": "Seitenname",
    "fields": [{
      "id": "field-ai-1",
      "type": "text",
      "label": "Feldname",
      "required": true,
      "placeholder": "Platzhalter",
      "width": "full|half|third",
      "conditions": [{
        "field": "anderes-feld-id",
        "operator": "equals|notEquals|contains|isEmpty|isNotEmpty",
        "value": "wert",
        "action": "show|hide|require"
      }]
    }]
  }]
}

Für SELECT/RADIO/CHECKBOX: options: [{ value: "opt1", label: "Option 1" }]
Für CHECKLIST: items: [{ id: "c1", label: "Prüfpunkt 1" }]
Für REPEATER: subFields: [{ id: "sf1", label: "Spalte", type: "text" }]
Für RATING: maxStars: 5, ratingType: "stars|traffic"
Für DATE: defaultToday: true/false
Für NUMBER: min, max, decimals, unit
Für TOGGLE: labelOn: "Ja", labelOff: "Nein"
Für HEADING: level: "h2"
Für INFO: content: "Hinweistext"
Für PHOTO: maxPhotos: 5`;

// ─── JSON Extraktion (identisch mit aiService.js) ──────────────────────────

function extractJSON(text: string): unknown {
  // Direkt parsen
  try {
    return JSON.parse(text);
  } catch {
    // noop
  }

  // Aus ```json ... ``` oder ``` ... ``` extrahieren
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // noop
    }
  }

  // Erste { bis letzte } versuchen
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1));
    } catch {
      // noop
    }
  }

  throw new Error("Konnte kein gültiges JSON aus der KI-Antwort extrahieren");
}

// ─── Router ────────────────────────────────────────────────────────────────

const aiRoutes = new Hono();

// Alle AI-Routen erfordern Auth
aiRoutes.use("/*", requireAuth);

// POST /generate — Formular-Template via Claude generieren
aiRoutes.post("/generate", async (c: AuthContext) => {
  // Body validieren
  const body = await c.req.json();
  const parsed = generateBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" }, 400);
  }

  const { prompt, language } = parsed.data;

  // API Key aus Umgebungsvariable
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return c.json({ error: "AI-Service nicht konfiguriert (ANTHROPIC_API_KEY fehlt)" }, 503);
  }

  const orgId = getOrgId(c);
  const langHint =
    language === "de"
      ? "Erstelle das Formular auf Deutsch."
      : `Erstelle das Formular auf ${language}.`;
  const fullPrompt = `${langHint}\n\nFormularbeschreibung: ${prompt.trim()}`;

  // Claude API aufrufen (direct fetch, kein SDK)
  let response: Response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: fullPrompt }],
      }),
    });
  } catch (err) {
    console.error("Anthropic API network error:", err);
    return c.json({ error: "Netzwerkfehler beim KI-Aufruf" }, 502);
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.error(`Anthropic API error ${response.status}:`, errorBody);

    if (response.status === 401) {
      return c.json({ error: "Ungültiger ANTHROPIC_API_KEY" }, 503);
    }
    if (response.status === 429) {
      return c.json({ error: "Rate Limit erreicht — bitte in 30 Sekunden erneut versuchen" }, 429);
    }
    return c.json({ error: "AI-Generierung fehlgeschlagen" }, 502);
  }

  const result = await response.json();
  const textContent: string | undefined = result.content?.find(
    (block: { type: string }) => block.type === "text",
  )?.text;

  if (!textContent) {
    return c.json({ error: "Leere Antwort von der KI erhalten" }, 502);
  }

  // JSON aus Antwort extrahieren
  let template: unknown;
  try {
    template = extractJSON(textContent);
  } catch {
    return c.json(
      { error: "AI-Antwort konnte nicht geparst werden", raw: textContent },
      422,
    );
  }

  // Usage tracken (non-blocking)
  incrementUsage(orgId, "aiCreditsUsed").catch((e) =>
    console.error("AI usage tracking failed:", e),
  );

  return c.json({ template });
});

export default aiRoutes;
