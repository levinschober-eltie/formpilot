# FormPilot — Parallele Implementierungs-Prompts

## Übersicht

| # | Prompt | Datei | Parallelisierbar | Geschätzte Dauer |
|---|--------|-------|-------------------|------------------|
| 01 | Barcode/QR + GPS Feldtypen | `01_BARCODE_GPS.md` | ✅ Ja | 15-25 Min |
| 02 | 20 Branchenvorlagen | `02_BRANCHENVORLAGEN.md` | ✅ Ja | 20-30 Min |
| 03 | Foto-Annotation | `03_FOTO_ANNOTATION.md` | ✅ Ja | 20-30 Min |
| 04 | Excel-Export + Custom PDF | `04_EXPORT_EXCEL_PDF.md` | ✅ Ja | 15-25 Min |
| 05 | Multi-Signatur | `05_MULTI_SIGNATUR.md` | ✅ Ja | 15-20 Min |
| 06 | KI-Formular-Generator | `06_KI_FORMULAR.md` | ✅ Ja | 25-35 Min |
| 07 | Supabase Cloud-Migration | `07_SUPABASE_MIGRATION.md` | ⚠️ Sequentiell (vor 08) | 40-60 Min |
| 08 | Offline + Service Worker | `08_OFFLINE_SW.md` | ⚠️ Nach 07 | 30-45 Min |

## Reihenfolge

```
┌──────────────────────────────────────────────────────┐
│  PHASE 1 — Alle 6 parallel starten:                 │
│  [01] [02] [03] [04] [05] [06]                       │
│                                                      │
│  PHASE 2 — Nach Phase 1:                             │
│  [07] Supabase Migration                             │
│                                                      │
│  PHASE 3 — Nach Phase 2:                             │
│  [08] Offline + Service Worker                       │
└──────────────────────────────────────────────────────┘
```

## Merge-Reihenfolge

Nach Abschluss aller Chats:
1. Erstelle für jeden Chat einen Feature-Branch
2. Merge in dieser Reihenfolge: 02 → 01 → 03 → 05 → 04 → 06 → 07 → 08
3. Bei Konflikten in shared Files (constants.js, FormField.jsx, index.js): Manuell mergen (Einträge addieren, nicht ersetzen)

## Geteilte Dateien — Konfliktpotenzial

Diese Dateien werden von MEHREREN Prompts modifiziert:
- `src/config/constants.js` — Prompts 01, 02
- `src/components/fields/FormField.jsx` — Prompts 01, 03, 05
- `src/components/fields/index.js` — Prompts 01
- `src/components/layout/SubmissionDetail.jsx` — Prompt 04

→ Beim Merge: Änderungen sind ADDITIV (neue Einträge hinzufügen), daher einfach zu mergen.
