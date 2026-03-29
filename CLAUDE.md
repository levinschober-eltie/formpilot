# FormPilot

Digitaler Formular-Generator — Standalone SaaS + Embeddable SDK.
React/Vite Frontend (Vercel) + Hono API Server (Railway) + PostgreSQL (Railway).

## Stack
- **Frontend:** React 19 + Vite 8, deployed on Vercel
- **Backend:** Hono + Drizzle ORM + better-auth, deployed on Railway
- **Database:** PostgreSQL on Railway
- **Billing:** Stripe (direct API, kein SDK)
- **Auth:** better-auth (Email/Password + PIN-Login)
- **ORM:** Drizzle mit postgres.js

## Regeln (NIEMALS brechen)
FR1: Modular. Neue Features als Hooks/Komponenten. NIE Bestehendes umschreiben.
FR2: Feature-Flags: fp_{name}. undefined → deaktiviert.
FR3: Schema abwärtskompatibel. Fallbacks für alles.
FR4: KEIN Supabase. Nur Railway + Vercel + GitHub.
FR5: Regression nach jedem Feature.
FR6: Am Ende: lauffähiger Code, Build muss durchlaufen.

## Performance (IMMER)
P1: React.memo auf Komponenten die Props empfangen + oft re-rendern.
P2: useCallback auf Event-Handler die als Props weitergegeben werden.
P3: useMemo auf teure Berechnungen.
P4: Style-Objekte AUSSERHALB Render-Funktionen definieren.
P5: Listen >20 Items → Pagination oder Virtualisierung.
P6: Debounce auf Text-Inputs die State triggern (300ms).

## Demo-User
Admin: PIN 1234 | Monteur: PIN 5678 | Büro: PIN 9999

## Projektstruktur
```
formpilot/
├── src/                        # Frontend (Vite SPA + Library Build)
│   ├── index.js                # Barrel Export (Public API für Embedding + SDK)
│   ├── App.jsx                 # Haupt-App (Provider Shell + UI/Navigation)
│   ├── AppShell.jsx            # Router-Shell (Landing vs App vs Legal Pages)
│   ├── main.jsx                # SPA Entry Point (mit Router)
│   ├── config/                 # Theme, Konstanten, Demo-Templates
│   ├── contexts/               # AuthContext, DataContext
│   ├── hooks/                  # useDebounce, useSubscription, etc.
│   ├── lib/
│   │   ├── api/                # API-Client Module (auth, templates, submissions, etc.)
│   │   ├── storageAdapter*.js  # Abstraktionsschicht (API → IndexedDB → localStorage)
│   │   ├── tierService.js      # Feature-Gating nach Plan
│   │   ├── featureFlags.js     # Tier-basierte Feature-Flags
│   │   ├── aiService.js        # AI Form Generation
│   │   ├── router.js           # Hash-Router
│   │   └── storage.js          # localStorage + IndexedDB
│   ├── pages/                  # LandingPage, PricingPage, Datenschutz, Impressum, AGB
│   ├── sdk/                    # FormPilotClient, useFormPilot, FormPilotEmbed
│   ├── styles/                 # Shared Styles + CSS Variables
│   └── components/
│       ├── fields/             # 19 Feldtyp-Komponenten
│       ├── filler/             # FormFiller + TemplateSelector
│       ├── builder/            # FormBuilder + AIFormGenerator
│       ├── layout/             # Login, Settings (8 Sub-Module), Dashboard, etc.
│       └── common/             # ErrorBoundary, Toast, CookieBanner, etc.
├── server/                     # Hono API-Server (Railway)
│   ├── index.ts                # Entry Point + Route-Mounting
│   ├── db/
│   │   ├── index.ts            # Drizzle Client (postgres.js)
│   │   └── schema.ts           # Komplettes Drizzle-Schema
│   ├── routes/
│   │   ├── auth.ts             # Register, PIN-Verify, /me
│   │   ├── templates.ts        # Templates CRUD
│   │   ├── submissions.ts      # Submissions CRUD
│   │   ├── customers.ts        # Customers CRUD
│   │   ├── projects.ts         # Projects CRUD
│   │   ├── activity.ts         # Activity Log
│   │   ├── ai.ts               # AI Form Generation (Claude API)
│   │   ├── files.ts            # File Upload/Download
│   │   ├── billing.ts          # Stripe Checkout/Portal/Webhook
│   │   ├── invitations.ts      # Team-Einladungen
│   │   ├── api-keys.ts         # API-Key Management
│   │   └── v1/                 # Public REST API (API-Key Auth)
│   │       ├── index.ts        # v1 Router + API-Key Middleware
│   │       ├── templates.ts
│   │       ├── submissions.ts
│   │       ├── customers.ts
│   │       └── usage.ts
│   ├── middleware/
│   │   ├── auth.ts             # better-auth + requireAuth + requireRole
│   │   ├── api-auth.ts         # API-Key Auth + generateApiKey
│   │   └── rate-limit.ts       # DB-backed Rate-Limiting
│   ├── schemas/
│   │   └── index.ts            # Shared Zod Schemas (aus Drizzle generiert)
│   └── services/
│       ├── usage.ts            # Usage-Metering (UPSERT)
│       └── stripe.ts           # Stripe API (direct fetch)
├── drizzle.config.ts           # Drizzle Kit Config
├── Procfile                    # Railway: web: node --import tsx server/index.ts
└── vite.config.js              # Frontend Build (SPA + Library)
```

## Pricing
| | Free | Pro 29€/mo | Business 79€/mo | Enterprise |
|---|---|---|---|---|
| User | 2 | 10 | ∞ | ∞ |
| Templates | 5 | 50 | ∞ | ∞ |
| Einreichungen/Mo | 50 | 500 | 5.000 | Custom |
| AI/Mo | 5 | 50 | 200 | Custom |
| API | Nein | Read-only | Voll | Voll |

## Builds
- SPA: `npm run build` (PWA mit Service Worker)
- Library: `npm run build:lib` (ESM für Embedding)
- API: `npm run dev:api` (Development) / Railway (Production)
- DB: `npm run db:push` (Schema pushen)

## SDK Integration
```jsx
// React Embed
import { FormPilotEmbed } from 'formpilot';
<FormPilotEmbed apiKey="fp_live_..." baseUrl="https://api.formpilot.de" templateId="..." onSubmit={cb} />

// Headless Client (Node.js / Browser)
import { createFormPilotClient } from 'formpilot';
const fp = createFormPilotClient({ apiKey: 'fp_live_...', baseUrl: 'https://api.formpilot.de' });
const templates = await fp.getTemplates();
```

## Env Vars
```
# Frontend
VITE_API_URL=http://localhost:3001

# Server
DATABASE_URL=postgres://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173
PORT=3001
ANTHROPIC_API_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_PRO=...
STRIPE_PRICE_BUSINESS=...
```
