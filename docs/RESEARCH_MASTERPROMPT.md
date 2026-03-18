# FormPilot — Wettbewerbs- & Feature-Recherche Masterprompt

> Kopiere diesen gesamten Prompt in einen neuen Claude-Chat (claude.ai oder API) **mit Web-Recherche aktiviert**.
> Er ist darauf ausgelegt, eine tiefe, mehrstufige Analyse durchzuführen.
> Erwartete Token-Kosten: hoch (umfangreiche Web-Recherche + lange Analyse).
> **Hinweis:** Falls der Output abgeschnitten wird, antworte mit "Weiter ab Phase X" — der Prompt ist so aufgebaut, dass phasenweise fortgesetzt werden kann.

---

## Kontext: Was ist FormPilot?

FormPilot ist eine **Progressive Web App (PWA)** für Handwerksbetriebe, Baufirmen und Facility-Management-Unternehmen. Ziel: Papierformulare (Baustellenabnahmen, Serviceberichte, Mängelprotokolle, Checklisten, Wartungsprotokolle) vollständig digitalisieren — Erfassung auf dem Smartphone/Tablet, PDF-Export, Cloud-Sync, Offline-Fähigkeit.

### Aktueller Feature-Stand (März 2026):
- **Formular-Builder** (Drag & Drop) mit Feldtypen: Text, Nummer, Datum, Dropdown, Checkbox, Radio, Textarea, Signatur (Canvas), Foto (Kamera-Capture), Repeater (dynamische Feldgruppen)
- **PDF-Export** (Print-basiert) und **CSV-Export** (UTF-8)
- **Dashboard mit Analytics** (KPIs, 7-Tage-Chart, Rankings)
- **Submission-Detail-Ansicht** mit Such- und Filterfunktion
- **Dark Mode**, **PWA-Manifest**
- **Stack:** React + Vite, Supabase (PostgreSQL + Auth + Storage), n8n für PDF/Email
- **Kein nativer App-Store-Zwang** — reine PWA, installierbar ohne App Store
- **Zielgruppe:** KMU (5-50 Mitarbeiter), Handwerk/Bau/FM im DACH-Raum, preissensitiv, geringe IT-Affinität

### Geplant, aber noch nicht umgesetzt:
- S04: Offline + Service Worker + IndexedDB Queue
- S05: Supabase Cloud-Migration (derzeit localStorage)
- S06: Berechtigungen + Rollen (RBAC)
- S07: Analytics erweitern + Branding + White-Label
- S08: Automationen + API + Webhooks

### Bekannte Wettbewerber (Ausgangspunkt):
- **smap one** (smapone.com) — No-Code Formular-Plattform für Industrie
- **Offpaper** (offpaper.io) — Digitale Formulare für Handwerk & Bau
- **PlanRadar** (planradar.com) — Baudokumentation & Mängelmanagement
- **Kizeo Forms** (kizeoforms.com) — Mobile Formulare für Außendienst

---

## Deine Aufgabe

Du bist ein **Research-Analyst für digitale Formular- und Datenerfassungs-Tools** im Bereich Handwerk, Bau, Facility Management und Industrie. Führe eine umfassende, mehrstufige Analyse durch.

---

### PHASE 1: Wettbewerber-Identifikation (breit)

Recherchiere und identifiziere **mindestens 15-20 Wettbewerber** in folgenden Kategorien:

**Kategorie A — Direkte Wettbewerber (Formular-Digitalisierung für Handwerk/Bau/FM):**
- smap one, Offpaper (bereits bekannt)
- Suche nach: deutschen/europäischen Tools, die explizit Handwerk/Bau/Facility Management adressieren
- Suchbegriffe: "digitale Formulare Handwerk", "Baustellendokumentation App", "mobile Datenerfassung Bau", "Checklisten App Handwerk", "Mängelprotokoll digital", "Serviceberichte App", "Abnahmeprotokoll App", "Wartungsprotokoll digital", "Formular App Baustelle DSGVO"
- Prüfe auch: Google Play Store / Apple App Store Listings mit Keywords "Baustellenformular", "Checkliste Handwerk", "Serviceprotokoll"

**Kategorie B — Breitere Formular-/Datenerfassungs-Plattformen:**
- Tools die nicht nur auf Bau/Handwerk fokussiert sind, aber stark dort eingesetzt werden
- Z.B. Fulcrum, GoAudits, GoCanvas, PlanRadar, Fieldwire, iAuditor (SafetyCulture), 123FormBuilder, JotForm, Typeform (Business), Formstack, Kizeo Forms, FastField, Device Magic, FormConnect, ProntoForms
- Suche international (DACH, UK, USA, Australien — Bau/FM ist überall relevant)

**Kategorie C — Angrenzende Tools die Formular-Features haben:**
- Projektmanagement-Tools mit Formular-Modulen (z.B. Procore, Buildertrend)
- ERP-Systeme mit mobiler Datenerfassung
- Wartungsmanagement (CMMS) mit Checklisten-Modulen
- HSE/Safety-Plattformen mit Formular-Builder

Für jeden Wettbewerber erfasse:
- Name, URL, Herkunftsland
- Gründungsjahr (falls findbar)
- Zielgruppe / Branchenfokus
- Preismodell (falls öffentlich)
- Kernversprechen (1-2 Sätze)
- G2/Capterra-Bewertung (Sterne + Anzahl Reviews)
- Plattform: PWA / Native iOS / Native Android / Web only

---

### PHASE 2: Deep-Dive Feature-Vergleich

Für die **Top 10 relevantesten Wettbewerber** (Auswahl basierend auf Relevanz für FormPilots Zielgruppe), erstelle eine detaillierte Feature-Matrix in folgenden Dimensionen:

#### 2.1 Formular-Builder
- Feldtypen (welche genau? Barcode/QR? GPS? NFC? Zeichnung? Skizze auf Foto? Berechnung?)
- Bedingte Logik / Conditional Fields (wenn Feld A = X, zeige Feld B)
- Formular-Templates / Vorlagen-Bibliothek
- Versionierung von Formularen
- Formular-Import/Export (zwischen Instanzen)
- Mehrsprachige Formulare
- Abschnitte / Seitenumbrüche / Sections
- Pflichtfelder / Validierung
- Auto-Ausfüllung / Prefill von Feldern
- Mathematische Berechnungen in Feldern
- Lookup-Felder (Daten aus anderen Quellen ziehen)

#### 2.2 Mobile Erfassung
- Offline-Fähigkeit (wie gelöst? Sync-Konflikte?)
- Foto-Annotation (auf Foto zeichnen, markieren)
- Barcode-/QR-Code-Scanner
- GPS-Erfassung (automatisch + manuell)
- NFC-Tag-Scanning
- Sprachmemo / Audio-Aufnahme
- Video-Aufnahme
- Timer / Zeiterfassung in Formularen
- Bluetooth-Geräte-Anbindung (Messgeräte?)

#### 2.3 Workflow & Automation
- Mehrstufige Workflows (Genehmigung, Review, Eskalation)
- Automatische Benachrichtigungen (Push, Email, SMS)
- Webhooks / API-Integration
- Zapier/Make/n8n-Integration
- Automatische PDF-Generierung + Versand
- Aufgaben-/Task-Management-Integration
- Wiederkehrende Formulare / Scheduled Inspections
- Dispatch / Auftragsverteilung

#### 2.4 Daten & Reporting
- Dashboard / Analytics
- Benutzerdefinierte Reports
- Trend-Analysen über Zeit
- Export-Formate (PDF, CSV, Excel, JSON, XML)
- BI-Tool-Integration (PowerBI, Tableau, Looker)
- Daten-API / REST-API
- Echtzeit-Dashboards

#### 2.5 Zusammenarbeit & Rollen
- Rollen- und Berechtigungsmanagement (wie granular?)
- Team-/Abteilungs-Struktur
- Mandantenfähigkeit / Multi-Tenancy
- Gastzugang (Kunden/Subunternehmer)
- Kommentar- / Chat-Funktion
- Audit-Trail / Änderungshistorie
- Digitale Unterschriften (mehrere Parteien)

#### 2.6 Integration & Plattform
- Verfügbar als: PWA, Native iOS, Native Android, Desktop?
- SSO / LDAP / Active Directory
- Cloud-Hosting / On-Premise Option
- White-Label / Custom Branding
- API-Dokumentation / Entwickler-Portal
- ERP-Integration (SAP, DATEV, etc.)
- CRM-Integration
- Cloud-Storage-Integration (SharePoint, Google Drive, Dropbox)

#### 2.7 Datenschutz & Compliance (KRITISCH für DACH)
- DSGVO-Konformität (Auftragsverarbeitung, Löschkonzept, Datenexport)
- Serverstandort (EU / Deutschland / USA?)
- ISO 27001 oder vergleichbare Zertifizierung
- Verschlüsselung (at rest + in transit)
- Datenhoheit: Kann der Kunde alle Daten exportieren und löschen?
- Audit-Log für Compliance-Nachweise
- BAV (Vertrag zur Auftragsverarbeitung) verfügbar?

#### 2.8 UX & Onboarding (wichtig für KMU mit geringer IT-Affinität)
- Time-to-first-form: Wie schnell kann ein neuer Nutzer sein erstes Formular erstellen?
- Vorlagen-Bibliothek für Handwerk/Bau (branchenspezifisch)
- Onboarding-Wizard / Guided Tour
- Hilfe-Center / Dokumentation auf Deutsch
- Support-Kanäle (Chat, Telefon, Email) — Reaktionszeit?
- Community / Forum
- Schulungs-Videos / Webinare

#### 2.9 KI / Emerging Features
- KI-gestützte Formular-Erstellung (aus PDF/Foto)
- OCR / Texterkennung
- Automatische Kategorisierung / Tagging
- Sprache-zu-Text für Felderfassung
- KI-basierte Anomalie-Erkennung in Daten
- Smart Suggestions / Autocomplete basierend auf historischen Daten
- KI-gestützte Zusammenfassungen von Submissions

---

### PHASE 3: Pricing-Analyse

Erstelle eine Preisvergleichs-Tabelle:
- Free Tier (was ist enthalten?)
- Einstiegspreis pro User/Monat
- Enterprise-Tier Preise (falls bekannt)
- Preis pro Feature (z.B. PDF-Export, Offline, API erst ab welchem Tier?)
- Vertragsbindung (monatlich/jährlich)
- Welches Preismodell nutzt FormPilot-Zielgruppe typischerweise? (KMU-Handwerk = preissensitiv!)
- **Preisanker:** Was zahlt ein 10-Mann-Handwerksbetrieb typischerweise pro Monat für solche Tools?
- Gibt es Setup-Gebühren / Implementierungskosten?
- Gibt es mengenbasierte Preise (pro Formular, pro Submission, pro Speicher)?
- Welche Features sind typische Upsell-Trigger (= erst ab teurem Plan verfügbar)?

---

### PHASE 4: Gap-Analyse & Feature-Priorisierung für FormPilot

Basierend auf deiner Recherche, erstelle drei Listen:

#### Liste A: "MUST HAVE — Sofort integrieren" (Marktstandard, ohne geht's nicht)
Features die **alle ernstzunehmenden Wettbewerber** haben und die FormPilot fehlen.
Begründung pro Feature: Warum ist es Marktstandard? Was verliert FormPilot ohne?

#### Liste B: "SHOULD HAVE — Mittelfristig" (Differenzierung + Kundennachfrage)
Features die **viele aber nicht alle** Wettbewerber haben und die FormPilot einen Vorteil verschaffen würden.
Begründung: Welcher Kundenbedarf wird adressiert? Wie schwer ist die Umsetzung (grobe Schätzung)?

#### Liste C: "NICE TO HAVE — Langfristig / Optional"
Features die nur wenige Premium-Tools haben oder die innovativ aber nicht kriegsentscheidend sind.
Begründung: Warum nicht sofort? Unter welchen Umständen wird es relevant?

#### Liste D: "BEWUSST NICHT — Außerhalb des Scope"
Features die Wettbewerber haben, aber die FormPilot **nicht** bauen sollte.
Begründung: Warum nicht? (z.B. zu komplex für Zielgruppe, anderer Produktfokus, besser durch Integration lösen)

**Für jedes Feature in Listen A-C, schätze:**
- **Impact** (Hoch/Mittel/Niedrig): Wie stark beeinflusst es die Kaufentscheidung?
- **Komplexität** (S/M/L/XL): Grobe Entwicklungs-Schätzung
- **Umsatz-Relevanz**: Ist es ein Feature das Kunden zum Upgrade auf einen höheren Plan bewegt?

---

### PHASE 5: Strategische Empfehlungen

1. **Positionierung:** Wo sollte sich FormPilot im Markt positionieren? (Low-Cost vs. Feature-Rich vs. Nische?) — Berücksichtige den PWA-Vorteil (kein App-Store, sofort einsetzbar, geringere Entwicklungskosten)
2. **Differenzierung:** Was könnte FormPilots "Killer Feature" sein, das kein anderer so hat? Denke an Kombinationen: z.B. "einfachstes Tool + sofort offline + deutsch + günstig"
3. **Pricing-Empfehlung:** Welches Preismodell passt zur Zielgruppe KMU-Handwerk/Bau? Konkret: Empfehle 2-3 Tier-Stufen mit Feature-Aufteilung und Preispunkten
4. **Go-to-Market:** Welche Features sind am wichtigsten für die ersten 100 zahlenden Kunden? Welche Branchen-Vertikale zuerst (Elektriker? SHK? Maler? FM?)
5. **Build vs. Integrate:** Welche Features sollte FormPilot selbst bauen, welche besser über Integrationen (n8n, Zapier) lösen?
6. **Technische Schulden vermeiden:** Welche Architektur-Entscheidungen sollten JETZT getroffen werden, um spätere Features nicht zu blockieren?
7. **DSGVO als Selling Point:** Wie können "Made in Germany" + EU-Hosting + DSGVO-Konformität als Wettbewerbsvorteil genutzt werden, insbesondere gegen US-Anbieter?
8. **Vertriebskanäle:** Welche Kanäle funktionieren bei KMU-Handwerk? (Innungen, Handwerkskammern, Messen, Google Ads, Empfehlungen?)

---

### PHASE 6: Zusammenfassung & Action Items

Fasse alles zusammen in:
1. **Executive Summary** (max. 1 Seite) — Die wichtigsten 5 Erkenntnisse, jede in 2-3 Sätzen
2. **Feature-Roadmap-Vorschlag** — Priorisierte Liste als Tabelle: Feature | Impact | Komplexität | Sprint/Phase | Abhängigkeiten
3. **Wettbewerber-Übersichtstabelle** — Kompakte Matrix (Tool × Top-20-Features), mit ✅/❌/🔶(teilweise) Markierung
4. **Pricing-Vergleichstabelle** — Alle Wettbewerber + empfohlene FormPilot-Preise nebeneinander
5. **Sofortige Action Items** — Was sollte Levin DIESE WOCHE als nächstes tun? (max. 5 konkrete Schritte)

---

## Arbeitsanweisungen

- **Sprache:** Deutsch (Fachbegriffe dürfen englisch bleiben)
- **Tiefe:** Lieber zu viel Detail als zu wenig. Ich lese alles.
- **Quellen:** Nutze Web-Recherche intensiv. Besuche die Websites der Wettbewerber, lies Feature-Seiten, Pricing-Seiten, Hilfe-Dokumentationen, G2/Capterra-Reviews.
- **Ehrlichkeit:** Wenn ein Feature von FormPilot besser gelöst ist als beim Wettbewerb, sag das. Wenn FormPilot in einem Bereich weit hinterher ist, sag das auch klar. Kein Schönreden.
- **Zahlen:** Preise in EUR wenn möglich, sonst USD mit Vermerk. Bei Bewertungen immer Quelle + Datum angeben.
- **Formatierung:** Nutze Markdown-Tabellen, Listen und klare Überschriften. Das Dokument wird als Referenz für die Produktentwicklung genutzt.
- **Quellenangaben:** Für jede faktische Behauptung (Preis, Feature, Bewertung) gib die URL an, damit ich nachprüfen kann.
- **Aktualität:** Prüfe, ob die Informationen aktuell sind (2025-2026). Veraltete Daten (>2 Jahre alt) kennzeichnen.

---

## Erwartetes Output-Format

Das Ergebnis soll als **ein zusammenhängendes Markdown-Dokument** geliefert werden, das ich direkt als `RESEARCH_ERGEBNIS.md` abspeichern kann. Struktur:

```
# FormPilot — Wettbewerbs- & Feature-Analyse (März 2026)
## Executive Summary
## Phase 1: Wettbewerber-Übersicht
## Phase 2: Feature-Vergleich (Tabellen)
## Phase 3: Pricing-Analyse
## Phase 4: Gap-Analyse & Priorisierung
## Phase 5: Strategische Empfehlungen
## Phase 6: Roadmap & Action Items
## Anhang: Quellenverzeichnis
```

---

*Dieser Prompt wurde erstellt am 2026-03-18, zuletzt aktualisiert am 2026-03-18, für das Projekt FormPilot (GF Elite PV GmbH / Levin Schober).*
