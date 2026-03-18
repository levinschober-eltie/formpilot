# FormPilot

Digitaler Formular-Generator für Handwerksbetriebe.
Eigenständiges Projekt — Multi-File React/Vite + Supabase.
Wird bald in LagerPilot eingebunden (Library-Build vorhanden).

## Regeln (NIEMALS brechen)
FR1: Modular. Neue Features als Hooks/Komponenten. NIE Bestehendes umschreiben.
FR2: Feature-Flags: fp_{name}. undefined → deaktiviert.
FR3: Schema abwärtskompatibel. Fallbacks für alles.
FR4: Eigene Supabase-Instanz (Auth, Storage, Realtime).
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
src/
├── index.js             # Barrel Export (Public API für Embedding)
├── App.jsx              # Haupt-App (Provider Shell + UI/Navigation)
├── main.jsx             # SPA Entry Point
├── config/              # Theme, Konstanten, Demo-Templates
├── contexts/            # AuthContext (initialUser), DataContext
├── lib/                 # Storage, Validation, Helpers
│   ├── supabase/        # 9 modulare Service-Dateien (auth, templates, etc.)
│   ├── supabaseService.js  # Backwards-compat Barrel Re-Export
│   ├── aiService.js     # AI Form Generation (Edge Function + Fallback)
│   └── dialogService.js # Global In-App Dialoge
├── styles/              # Shared Styles + CSS Variables (--fp-*)
├── hooks/               # useDebounce, useUndoRedo, useOnlineStatus, etc.
├── components/
│   ├── fields/          # Alle Feldtyp-Komponenten (14 Typen)
│   ├── filler/          # FormFiller + TemplateSelector
│   ├── builder/         # FormBuilder + Palette + Canvas + Settings
│   ├── layout/          # Login, Settings, Submissions, TemplatesOverview
│   └── common/          # ErrorBoundary, GlobalDialog, Toast, MiniToggle
supabase/
├── migrations/          # SQL-Migrationen (001-005)
└── functions/           # Edge Functions (verify-pin, generate-form)
```

## Builds
- SPA: `npm run build` (PWA mit Service Worker)
- Library: `npm run build:lib` (ESM für Embedding in LagerPilot)
- Dev: `npm run dev`

## Integration (LagerPilot)
```jsx
import { FormPilot, AuthProvider, DataProvider } from 'formpilot/src';
<AuthProvider initialUser={externerUser}>
  <DataProvider><FormPilot /></DataProvider>
</AuthProvider>
```
