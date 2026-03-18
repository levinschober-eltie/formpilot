// ═══ FEATURE: AI Form Generator Service (Prompt 06) ═══
import { validateAndFixAITemplate } from './aiTemplateValidator';
import { supabase, isSupabaseConfigured } from './supabase';

const MODEL = 'claude-sonnet-4-6';
const AI_SETTINGS_KEY = 'fp_ai_settings';

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

/**
 * Get the stored API key from localStorage
 */
export function getAISettings() {
  try {
    const raw = localStorage.getItem(AI_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { apiKey: '' };
  } catch {
    return { apiKey: '' };
  }
}

/**
 * Save AI settings to localStorage
 */
export function saveAISettings(settings) {
  localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * Extract JSON from a response that may contain markdown code fences
 */
function extractJSON(text) {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // noop
  }

  // Try extracting from ```json ... ``` or ``` ... ```
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // noop
    }
  }

  // Try finding first { to last }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1));
    } catch {
      // noop
    }
  }

  throw new Error('Konnte kein gültiges JSON aus der KI-Antwort extrahieren');
}

/**
 * Test if the API key is valid by making a minimal API call
 */
export async function testAPIKey(apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 32,
      messages: [{ role: 'user', content: 'Antworte mit: OK' }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error('Ungültiger API-Key');
    if (response.status === 429) throw new Error('Rate Limit erreicht — bitte warten');
    throw new Error(err.error?.message || `API-Fehler: ${response.status}`);
  }

  return true;
}

/**
 * Generate a form template from a user prompt using Claude API
 * @param {string} userPrompt - Natural language description of the desired form
 * @param {string} language - Language for the form (default: 'de')
 * @param {number} retryCount - Internal retry counter
 * @returns {Promise<{ template: object, warnings: string[] }>}
 */
export async function generateFormTemplate(userPrompt, language = 'de', retryCount = 0) {
  if (!userPrompt || userPrompt.trim().length < 10) {
    throw new Error('Bitte beschreibe dein Formular genauer (mindestens 10 Zeichen).');
  }

  // Try Edge Function first (secure: API key on server)
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-form', {
        body: { prompt: userPrompt.trim(), language },
      });
      if (error) throw error;
      if (data?.template) {
        // Validate and fix the template from Edge Function
        return validateAndFixAITemplate(data.template);
      }
    } catch (e) {
      console.warn('[FormPilot] Edge Function nicht verfügbar, Fallback auf direkte API:', e.message);
    }
  }

  // Fallback: Direct API call (for dev/demo mode without Supabase Edge Functions)
  const settings = getAISettings();
  const apiKey = settings.apiKey;

  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  if (!userPrompt || userPrompt.trim().length < 10) {
    throw new Error('Bitte beschreibe dein Formular genauer (mindestens 10 Zeichen).');
  }

  const langHint = language === 'de'
    ? 'Erstelle das Formular auf Deutsch.'
    : `Erstelle das Formular auf ${language}.`;

  const fullPrompt = `${langHint}\n\nFormularbeschreibung: ${userPrompt.trim()}`;

  let response;
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: fullPrompt }],
      }),
    });
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Keine Internetverbindung. KI-Generator benötigt Online-Zugang.');
    }
    throw new Error('Netzwerkfehler: ' + err.message);
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error('NO_API_KEY');
    if (response.status === 429) throw new Error('Rate Limit erreicht. Bitte in 30 Sekunden erneut versuchen.');
    if (response.status >= 500) throw new Error('Fehler bei der KI. Bitte in 30 Sekunden erneut versuchen.');
    throw new Error(err.error?.message || `API-Fehler: ${response.status}`);
  }

  const data = await response.json();
  const textContent = data.content?.find(c => c.type === 'text')?.text;

  if (!textContent) {
    throw new Error('Leere Antwort von der KI erhalten.');
  }

  let rawTemplate;
  try {
    rawTemplate = extractJSON(textContent);
  } catch {
    // Retry once with a more explicit prompt
    if (retryCount < 2) {
      return generateFormTemplate(
        userPrompt + '\n\nWICHTIG: Antworte NUR mit einem validen JSON-Objekt. Kein Markdown, kein Text drumherum.',
        language,
        retryCount + 1
      );
    }
    throw new Error('Die KI hat kein gültiges JSON zurückgegeben. Bitte erneut versuchen.');
  }

  // Validate and fix
  const result = validateAndFixAITemplate(rawTemplate);
  return result;
}
