# FormPilot

Digitaler Formular-Generator für Handwerksbetriebe.
Eigenständiges Projekt — Multi-File React/Vite + Supabase.

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
├── config/          # Theme, Konstanten, Demo-Templates
├── lib/             # Storage, Validation, Helpers, Supabase
├── styles/          # Shared Styles
├── components/
│   ├── fields/      # Alle Feldtyp-Komponenten (14 Typen)
│   ├── filler/      # FormFiller + TemplateSelector
│   ├── builder/     # FormBuilder + Palette + Canvas + Settings
│   ├── layout/      # Login, Settings, Submissions, TemplatesOverview
│   └── common/      # Toast, MiniToggle, shared UI
├── hooks/           # Custom Hooks (ab S01: useUndoRedo etc.)
├── pages/           # Page-Level Komponenten (ab S07: Analytics)
├── App.jsx          # Haupt-App
└── main.jsx         # Entry Point
```

## Workflow
1. Feature in passender Datei implementieren
2. Build prüfen: npm run build
3. Dev-Server: npm run dev
