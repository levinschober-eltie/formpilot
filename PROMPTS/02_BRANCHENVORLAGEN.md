# FormPilot — Prompt 02: 20 Branchenspezifische Vorlagen

> Kopiere diesen gesamten Prompt in einen neuen Claude Code Chat.
> Arbeitsverzeichnis: `/Users/levinschober/projects/formpilot`

---

## Kontext

FormPilot ist eine React/Vite PWA für digitale Formulare im Handwerk. Du erstellst **20 branchenspezifische Formularvorlagen** die sofort einsatzbereit sind. Das ist ein kritisches Feature — Wettbewerber wie Lumiform (12.000+) und Jotform (10.000+) haben riesige Vorlagen-Bibliotheken.

### Regeln
- FR1: Modular. Vorlagen als eigene Datei(en), NICHT die bestehende templates.js überschreiben.
- FR3: Schema abwärtskompatibel. Verwende NUR existierende Feldtypen.
- FR6: Am Ende: `npm run build` muss durchlaufen.

### Existierende Feldtypen (NUR diese verwenden!)
`text`, `textarea`, `number`, `date`, `time`, `select`, `radio`, `checkbox`, `toggle`, `checklist`, `rating`, `heading`, `divider`, `info`, `signature`, `photo`, `repeater`

### Existierendes Template-Schema
Lies die Datei `src/config/templates.js` — dort sind 3 Demo-Templates definiert. Verwende EXAKT dasselbe Schema.

### Existierende Kategorien
Lies `src/config/constants.js` → `CATEGORY_OPTIONS`. Die erlaubten Kategorien sind: `service`, `abnahme`, `mangel`, `pruefung`, `uebergabe`, `custom`

---

## Aufgabe

### Schritt 1: Bestehendes Schema verstehen

Lies diese Dateien:
- `src/config/templates.js` — Bestehende 3 Demo-Templates
- `src/config/constants.js` — Kategorien, Feldtypen, Icons
- `src/lib/helpers.js` — `createField()` und `createEmptyTemplate()` Funktionen

Verstehe das exakte Schema bevor du anfängst.

### Schritt 2: Neue Datei erstellen

Erstelle `src/config/industryTemplates.js` mit 20 Templates.

### Schritt 3: Templates nach Branche

Erstelle je Branche realistische, sofort nutzbare Vorlagen. **Jedes Formular muss Felder enthalten die ein echter Handwerker tatsächlich braucht.** Recherchiere im Kopf was typische Formulare in diesen Branchen enthalten.

#### SHK (Sanitär, Heizung, Klima) — 4 Templates

1. **Heizungswartungsprotokoll** (Kategorie: `pruefung`)
   - Seite 1: Kundendaten (Name, Adresse, Tel, Anlagennr.)
   - Seite 2: Anlagendaten (Hersteller [Select], Typ, Baujahr, Brennstoff [Select: Gas/Öl/Pellet/Wärmepumpe], Leistung kW)
   - Seite 3: Prüfpunkte (Checklist: Brenner, Abgaswerte, Dichtheit, Ausdehnungsgefäß, Sicherheitsventil, Umwälzpumpe, Regelung, Schornstein)
   - Seite 4: Messwerte (Number: Abgastemperatur, CO-Wert, O2-Wert, Abgasverlust, Rußzahl)
   - Seite 5: Ergebnis + Unterschrift (Rating: Gesamtzustand, Textarea: Bemerkungen, Toggle: Mängel vorhanden, Signatur Techniker + Kunde)

2. **Trinkwasser-Probenahmeprotokoll** (Kategorie: `pruefung`)
   - Probenahmestelle, Proben-Nr, Temperatur, Datum/Uhrzeit
   - Anlageninformationen, Leitungsmaterial
   - Checklist: Vorlaufzeit, Stagnation, Probenart (Stagnationsprobe/Zufallsprobe)
   - Foto der Entnahmestelle
   - Unterschrift

3. **Rohrleitungs-Abdruckprotokoll** (Kategorie: `pruefung`)
   - Bauvorhaben, Auftraggeber, Leitungsart
   - Prüfdaten: Medium (Wasser/Luft/Stickstoff), Prüfdruck, Einwirkzeit, Ablesedrücke (Repeater: Zeit → Druck)
   - Ergebnis: Toggle (bestanden/nicht bestanden)
   - Unterschriften: Prüfer + Auftraggeber

4. **SHK-Serviceauftrag** (Kategorie: `service`)
   - Kundendaten, Auftragsnummer, Anfahrtszeit
   - Art der Störung (Select + Textarea)
   - Durchgeführte Arbeiten (Textarea)
   - Materialverbrauch (Repeater: Artikel, Menge, Einheit)
   - Arbeitszeit (Number: Stunden)
   - Fotos vorher/nachher
   - Unterschriften

#### Elektro — 4 Templates

5. **E-Check Protokoll** (Kategorie: `pruefung`)
   - Anlagendaten (Standort, Zähler-Nr, Sicherungskasten)
   - Prüfpunkte (Checklist: Leitungsanlage, Schutzmaßnahmen, Fehlerstromschutzschalter, Überspannungsschutz, Isolationswiderstand, Schleifenimpedanz)
   - Messwerte (Repeater: Stromkreis → Isolationswiderstand → Schleifenimpedanz → RCD-Auslösezeit)
   - Ergebnis + Nächster Prüftermin
   - Unterschrift

6. **Photovoltaik-Inbetriebnahmeprotokoll** (Kategorie: `abnahme`)
   - Anlagendaten: Leistung kWp, Module (Hersteller, Typ, Anzahl), Wechselrichter
   - Elektrische Messwerte: Leerlaufspannung, Kurzschlussstrom, Isolationswiderstand pro String (Repeater)
   - Checklist: Modulbefestigung, Kabelverlegung, Erdung, Blitzschutz, Beschriftung
   - Fotos: Module, Wechselrichter, Zähler, Gesamtansicht
   - Abnahme: Toggle (bestanden), Datum, Unterschriften

7. **Prüfprotokoll ortsveränderliche Geräte (DGUV V3)** (Kategorie: `pruefung`)
   - Gerätedaten (Bezeichnung, Hersteller, Serien-Nr, Standort)
   - Sichtprüfung (Checklist: Gehäuse, Anschlussleitung, Stecker, Zugentlastung)
   - Messungen (Schutzleiterwiderstand, Isolationswiderstand, Berührungsstrom, Schutzleiterstrom)
   - Ergebnis (Radio: bestanden/bedingt bestanden/nicht bestanden)
   - Nächster Prüftermin, Prüfplakette angebracht (Toggle)
   - Unterschrift Prüfer

8. **Elektro-Aufmaß** (Kategorie: `service`)
   - Raum/Bereich (Text)
   - Positionen (Repeater: Position, Beschreibung, Menge, Einheit [Select: Stück/Meter/Pausch.])
   - Fotos pro Bereich
   - Bemerkungen
   - Unterschrift

#### Facility Management — 4 Templates

9. **Gebäudeinspektion / Rundgang** (Kategorie: `pruefung`)
   - Objekt, Datum, Prüfer
   - Bereiche (Repeater pro Bereich): Bereich-Name, Checklist (Sauberkeit, Beleuchtung, Fenster/Türen, Bodenbelag, Brandschutz, Fluchtwege, Beschilderung)
   - Mängelfotos
   - Dringlichkeit (Rating)
   - Gesamtbewertung + Unterschrift

10. **Schlüsselübergabeprotokoll** (Kategorie: `uebergabe`)
    - Übergeber, Übernehmer
    - Objekt/Einheit
    - Schlüssel (Repeater: Schlüssel-Nr, Art [Select: Haustür/Wohnung/Keller/Briefkasten/Sonstige], Anzahl)
    - Zählerstände (Repeater: Zähler-Art → Stand → Foto)
    - Bemerkungen zum Zustand
    - Unterschriften beider Parteien

11. **Brandschutzbegehung** (Kategorie: `pruefung`)
    - Objekt, Begehungsdatum, Teilnehmer
    - Brandschutztechnische Prüfpunkte (Checklist: Feuerlöscher vorhanden/geprüft, Fluchtwegebeschilderung, Brandschutztüren schließen selbsttätig, Rauchmelder funktionsfähig, Löschdecken, Brandschutzklappen, Sprinkleranlage)
    - Mängel (Repeater: Bereich, Mangel, Foto, Priorität [Select: Sofort/Kurzfristig/Mittelfristig])
    - Frist zur Mängelbeseitigung
    - Unterschriften

12. **Wartungsprotokoll Aufzug/Technik** (Kategorie: `pruefung`)
    - Anlagendaten: Typ, Hersteller, Baujahr, Standort, Fabrik-Nr
    - Wartungspunkte (Checklist: je nach Anlagetyp)
    - Messwerte (Repeater: Messpunkt → Wert → Einheit → Soll-Bereich)
    - Materialverbrauch (Repeater)
    - Nächster Wartungstermin
    - Unterschrift

#### Maler/Trockenbau — 2 Templates

13. **Baustellenabnahme Malerarbeiten** (Kategorie: `abnahme`)
    - Objekt, Auftraggeber, Auftragnehmer
    - Räume/Bereiche (Repeater: Raum, Arbeit [Select: Anstrich/Tapete/Putz/Lackierung], Zustand [Rating])
    - Mängelliste (Repeater: Raum, Mangel-Beschreibung, Foto, Frist)
    - Gesamtergebnis (Radio: Ohne Mängel/Mit Mängeln/Verweigert)
    - Unterschriften beider Parteien

14. **Aufmaßblatt** (Kategorie: `service`)
    - Bauvorhaben, Raum
    - Positionen (Repeater: Position/Leistung, Länge, Breite, Höhe, Fläche m², Abzüge)
    - Skizze/Foto
    - Summe (Info-Feld mit Hinweis)
    - Unterschrift

#### Allgemein/Übergreifend — 6 Templates

15. **Arbeitsschein / Stundennachweis** (Kategorie: `service`)
    - Datum, Mitarbeiter, Projekt/Kunde
    - Arbeitszeiterfassung (Repeater: Datum → Von → Bis → Pause → Tätigkeit)
    - Materialverbrauch (Repeater: Material → Menge → Einheit)
    - Fahrtkosten (Number: km)
    - Unterschrift Mitarbeiter + Auftraggeber

16. **Gefährdungsbeurteilung** (Kategorie: `pruefung`)
    - Arbeitsbereich, Tätigkeit, Ersteller, Datum
    - Gefährdungen (Repeater: Gefährdung, Risiko [Select: Gering/Mittel/Hoch/Sehr hoch], Maßnahme, Verantwortlicher, Frist)
    - Schutzausrüstung (Checklist: Helm, Handschuhe, Schutzbrille, Gehörschutz, Sicherheitsschuhe, Auffanggurt)
    - Unterweisung erfolgt (Toggle)
    - Unterschrift

17. **Bautagebuch** (Kategorie: `custom`)
    - Projekt, Datum, Wetter [Select: Sonnig/Bewölkt/Regen/Schnee/Frost], Temperatur
    - Anwesende (Repeater: Firma → Personenzahl → Tätigkeit)
    - Durchgeführte Arbeiten (Textarea)
    - Besondere Vorkommnisse (Textarea)
    - Materiallieferungen (Repeater: Material → Menge → Lieferant)
    - Fotos (Baufortschritt)
    - Unterschrift Bauleiter

18. **Übergabeprotokoll allgemein** (Kategorie: `uebergabe`)
    - Übergeber, Übernehmer, Objekt/Gegenstand
    - Zustandsbeschreibung (Textarea)
    - Checkliste Zustand (Checklist: Vollständig, Funktionsfähig, Sauber, Unbeschädigt)
    - Mängel (Repeater: Mangel → Foto)
    - Zubehör (Repeater: Gegenstand → Anzahl → Zustand)
    - Unterschriften beider Parteien

19. **Reklamationsprotokoll** (Kategorie: `mangel`)
    - Kunde, Rechnungs-/Auftragsnr, Datum
    - Reklamationsgrund (Select + Textarea)
    - Fotos des Schadens
    - Beurteilung (Radio: Berechtigt/Teilweise/Unberechtigt)
    - Maßnahme (Textarea)
    - Kostenübernahme (Radio: Auftragnehmer/Auftraggeber/Geteilt)
    - Frist
    - Unterschriften

20. **Fahrzeugübergabe / Fuhrpark-Check** (Kategorie: `uebergabe`)
    - Fahrzeug (Kennzeichen, Typ, km-Stand, Tankstand [Select])
    - Checklist (Verbandskasten, Warndreieck, Warnweste, Bereifung, Beleuchtung, Ölstand, Wischwasser, Sauberkeit innen/außen)
    - Schäden (Repeater: Position am Fahrzeug [Select], Beschreibung, Foto)
    - km-Stand bei Übergabe
    - Unterschrift Übergeber + Übernehmer

---

### Schritt 4: Integration

#### `src/config/templates.js` — Ergänze:

Am Ende der Datei die neuen Templates importieren und zum Export hinzufügen:
```javascript
import { industryTemplates } from './industryTemplates';

// Bestehende demoTemplates NICHT ändern!
export const allTemplates = [...demoTemplates, ...industryTemplates];
```

**WICHTIG:** Prüfe wie `templates.js` aktuell exportiert wird und wie `App.jsx` die Templates lädt. Passe die Integration entsprechend an, ohne bestehende Funktionalität zu brechen.

#### `src/config/constants.js` — Wenn nötig:

Falls neue Kategorien benötigt werden, ergänze sie in `CATEGORY_OPTIONS`. Versuche aber mit den bestehenden Kategorien auszukommen.

---

### Schritt 5: Qualitätsprüfung

Für JEDES der 20 Templates prüfe:

1. **Schema-Validität:**
   - Alle Feld-IDs einzigartig (Format: `field-{templatekürzel}-{nummer}`)
   - Alle `type`-Werte sind gültige Feldtypen
   - Select/Radio/Checkbox haben `options` Array
   - Repeater haben `subFields` Array
   - Checklist hat `items` Array
   - Alle Pages haben `id`, `title`, `fields`

2. **Realismus:**
   - Feldlabels sind korrekte deutsche Fachbegriffe
   - Reihenfolge der Felder ist logisch (Kopfdaten → Details → Ergebnis → Unterschrift)
   - Sinnvolle Defaults (z.B. `defaultToday: true` bei Datum)
   - Sinnvolle `required: true` bei kritischen Feldern

3. **Bedingte Logik:**
   - Nutze `conditions` wo sinnvoll (z.B. "Wenn Mängel vorhanden = Ja → Zeige Mängeldetails")
   - Verwende die existierenden Operatoren: `equals`, `notEquals`, `isEmpty`, `isNotEmpty`

4. **Build:**
   ```bash
   npm run build
   ```
   → MUSS fehlerfrei durchlaufen

5. **Dev-Server testen:**
   ```bash
   npm run dev
   ```
   - [ ] Alle 20 Templates erscheinen in der Template-Übersicht
   - [ ] Jedes Template kann geöffnet und ausgefüllt werden
   - [ ] Jedes Template kann als PDF exportiert werden
   - [ ] Die 3 bestehenden Demo-Templates funktionieren noch (Regression!)
   - [ ] Stichprobe: 5 Templates komplett ausfüllen und submitten

---

## NICHT ÄNDERN

- `src/components/fields/*` — Wird von anderen Prompts bearbeitet
- `src/lib/export*.js` — Wird von Prompt 04 bearbeitet
- `src/App.jsx` — Nur ändern wenn nötig für Template-Laden
