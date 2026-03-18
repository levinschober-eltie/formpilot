// Supabase Edge Function: AI Form Generation Proxy
// Proxies Claude API calls through backend so API key is never exposed to browser
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Nicht authentifiziert' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Nicht authentifiziert' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { prompt, language = 'de' } = await req.json()
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Prompt erforderlich' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get API key from environment (NEVER from client)
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI-Service nicht konfiguriert' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Call Anthropic API from backend
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `Du bist ein Formular-Generator. Erstelle ein JSON-Formular-Template basierend auf dieser Beschreibung:

"${prompt}"

Sprache: ${language}

Antworte NUR mit validem JSON in diesem Format:
{
  "name": "Template Name",
  "description": "Kurze Beschreibung",
  "category": "service|abnahme|pruefung|uebergabe|mangel|custom",
  "icon": "emoji",
  "pages": [{ "id": "page-1", "title": "Seite 1" }],
  "fields": [
    {
      "id": "field-1",
      "pageId": "page-1",
      "type": "text|textarea|number|date|time|select|radio|checkbox|toggle|checklist|rating|signature|photo|barcode|gps|heading|divider|info",
      "label": "Feldname",
      "required": true/false,
      "width": "full|half|third",
      "options": [{"value": "v1", "label": "Option 1"}],
      "validation": { "minLength": 0, "maxLength": 500 }
    }
  ]
}`,
        }],
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('Anthropic API error:', errorBody)
      return new Response(JSON.stringify({ error: 'AI-Generierung fehlgeschlagen' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const result = await response.json()
    const content = result.content?.[0]?.text || ''

    // Parse the JSON from the response
    let template
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content]
      template = JSON.parse(jsonMatch[1].trim())
    } catch {
      return new Response(JSON.stringify({ error: 'AI-Antwort konnte nicht geparst werden', raw: content }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ template }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
