# FormPilot — Prompt 08: Offline + Service Worker (S04)

> Kopiere diesen gesamten Prompt in einen neuen Claude Code Chat.
> Arbeitsverzeichnis: `/Users/levinschober/projects/formpilot`
> **WICHTIG:** Starte diesen Prompt ERST wenn Prompt 07 (Supabase) abgeschlossen ist!

---

## Kontext

FormPilot ist eine React/Vite PWA für digitale Formulare im Handwerk. Du implementierst **vollständige Offline-Fähigkeit** mit Service Worker, IndexedDB-Queue und Hintergrund-Sync. Auf Baustellen und in Kellern gibt es oft kein Netz — Offline ist das #1 Must-Have laut Wettbewerbsanalyse.

### Regeln
- FR1: Modular. Offline-Logic als eigene Services/Hooks.
- FR3: Schema abwärtskompatibel.
- FR6: `npm run build` muss durchlaufen.
- P1-P4: Performance-Regeln einhalten.

### Voraussetzung
- Prompt 07 (Supabase) ist implementiert
- Daten werden in Supabase gespeichert
- `src/lib/supabaseService.js` existiert
- `src/lib/storageAdapter.js` existiert
- Vite PWA Plugin ist bereits in `package.json`

---

## Aufgabe 1: Service Worker Konfiguration

### Erweitere: `vite.config.js`

Das Vite PWA Plugin ist bereits installiert. Konfiguriere es für Offline:

```javascript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      workbox: {
        // Cache App-Shell
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Runtime Caching für Supabase API
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
              networkTimeoutSeconds: 5
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-storage',
              expiration: { maxEntries: 200, maxAgeSeconds: 604800 }
            }
          }
        ]
      },
      manifest: {
        name: 'FormPilot',
        short_name: 'FormPilot',
        description: 'Digitale Formulare für Handwerk & Bau',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
});
```

---

## Aufgabe 2: Offline-Datenbank (IndexedDB)

### Neue Datei: `src/lib/offlineDb.js`

Verwende die IndexedDB direkt (oder eine leichtgewichtige Wrapper-Library wie `idb`):

```bash
npm install idb
```

```javascript
import { openDB } from 'idb';

const DB_NAME = 'formpilot-offline';
const DB_VERSION = 1;

export async function getOfflineDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Offline-Cache für Stammdaten
      db.createObjectStore('templates', { keyPath: 'id' });
      db.createObjectStore('customers', { keyPath: 'id' });
      db.createObjectStore('projects', { keyPath: 'id' });

      // Offline-Queue für Änderungen
      const syncStore = db.createObjectStore('syncQueue', {
        keyPath: 'id',
        autoIncrement: true
      });
      syncStore.createIndex('by-timestamp', 'timestamp');
      syncStore.createIndex('by-status', 'status');

      // Offline-Submissions (lokal gespeichert bis sync)
      db.createObjectStore('offlineSubmissions', { keyPath: 'id' });

      // Offline-Dateien (Fotos, Signaturen)
      db.createObjectStore('offlineFiles', { keyPath: 'path' });
    }
  });
}
```

---

## Aufgabe 3: Sync-Queue

### Neue Datei: `src/lib/syncQueue.js`

Eine Queue die Offline-Änderungen sammelt und bei Netzwerk-Verfügbarkeit synchronisiert:

```javascript
export class SyncQueue {
  constructor(db) {
    this.db = db;
  }

  // Änderung zur Queue hinzufügen
  async enqueue(action) {
    // action: { type: 'create|update|delete', entity: 'submission|template|...', data: {...}, timestamp: Date.now() }
    const entry = {
      ...action,
      status: 'pending',
      retryCount: 0,
      timestamp: Date.now()
    };
    await this.db.add('syncQueue', entry);
    // Trigger Sync wenn online
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  // Queue abarbeiten
  async processQueue() {
    const tx = this.db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    const pending = await store.index('by-status').getAll('pending');

    for (const entry of pending) {
      try {
        await this.processEntry(entry);
        entry.status = 'completed';
        await store.put(entry);
      } catch (error) {
        entry.retryCount++;
        entry.lastError = error.message;
        if (entry.retryCount >= 5) {
          entry.status = 'failed';
        }
        await store.put(entry);
      }
    }
  }

  // Einzelne Änderung synchronisieren
  async processEntry(entry) {
    const { type, entity, data } = entry;
    switch (entity) {
      case 'submission':
        if (type === 'create' || type === 'update') {
          // Zuerst Offline-Dateien hochladen
          await this.uploadOfflineFiles(data);
          await supabaseService.saveSubmission(data);
        } else if (type === 'delete') {
          await supabaseService.deleteSubmission(data.id);
        }
        break;
      // ... weitere Entities
    }
  }

  // Offline-Fotos/Signaturen hochladen
  async uploadOfflineFiles(submission) {
    // Base64/Blob aus offlineFiles Store lesen
    // In Supabase Storage hochladen
    // URLs in submission.data aktualisieren
  }

  // Queue-Status abrufen
  async getQueueStatus() {
    const db = this.db;
    const pending = await db.countFromIndex('syncQueue', 'by-status', 'pending');
    const failed = await db.countFromIndex('syncQueue', 'by-status', 'failed');
    return { pending, failed };
  }

  // Fehlgeschlagene Einträge erneut versuchen
  async retryFailed() {
    // Alle 'failed' auf 'pending' setzen, retryCount zurücksetzen
  }
}
```

---

## Aufgabe 4: Online/Offline-Erkennung

### Neuer Hook: `src/hooks/useOnlineStatus.js`

```javascript
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Trigger Sync
        syncQueue.processQueue();
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}
```

### UI-Indikator: `src/components/common/OfflineIndicator.jsx`

Ein Banner das anzeigt:
- **Online:** Nichts anzeigen (oder grüner Punkt)
- **Offline:** Gelber Banner "Offline — Änderungen werden gespeichert und bei Verbindung synchronisiert"
- **Syncing:** "Synchronisiere... (3 Änderungen)" mit Spinner
- **Sync-Fehler:** Roter Banner "2 Änderungen konnten nicht synchronisiert werden" mit "Erneut versuchen" Button

Position: Fixiert am oberen Bildschirmrand, über der Navigation.

---

## Aufgabe 5: Offline-fähiger Storage-Adapter

### Erweitere: `src/lib/storageAdapter.js`

Der bestehende Adapter (aus Prompt 07) wird erweitert:

```javascript
export async function saveSubmission(submission) {
  if (navigator.onLine && USE_SUPABASE) {
    try {
      // Online: Direkt in Supabase speichern
      return await supabaseService.saveSubmission(submission);
    } catch (error) {
      // Netzwerk-Fehler: Offline-Fallback
      return await saveSubmissionOffline(submission);
    }
  } else {
    // Offline: Lokal speichern + Queue
    return await saveSubmissionOffline(submission);
  }
}

async function saveSubmissionOffline(submission) {
  const db = await getOfflineDb();
  // 1. In offlineSubmissions Store speichern
  await db.put('offlineSubmissions', submission);
  // 2. Sync-Queue Eintrag erstellen
  await syncQueue.enqueue({
    type: submission.id ? 'update' : 'create',
    entity: 'submission',
    data: submission
  });
  return submission;
}
```

**Gleiche Logik für:** Templates, Customers, Projects

### Offline-Daten laden

```javascript
export async function getSubmissions() {
  if (navigator.onLine && USE_SUPABASE) {
    const submissions = await supabaseService.getSubmissions();
    // Cache in IndexedDB für Offline-Zugriff
    const db = await getOfflineDb();
    for (const s of submissions) {
      await db.put('offlineSubmissions', s);
    }
    return submissions;
  } else {
    // Offline: Aus IndexedDB lesen
    const db = await getOfflineDb();
    return await db.getAll('offlineSubmissions');
  }
}
```

---

## Aufgabe 6: Offline-fähige Formulare

### Kernfeature: Formular offline ausfüllen

1. **Templates cachen:** Beim App-Start alle Templates in IndexedDB cachen
2. **Fotos offline speichern:** Base64 in IndexedDB statt Upload
3. **Signaturen offline speichern:** Base64 in IndexedDB
4. **Submission offline erstellen:** Alles lokal, Sync-Queue-Eintrag
5. **Draft-Recovery:** Auch offline — aus IndexedDB statt localStorage

### Erweitere: `src/components/filler/FormFiller.jsx`

- Draft-Autosave: In IndexedDB statt nur localStorage
- Submit: Über storageAdapter (Online/Offline transparent)
- Kein UI-Unterschied zwischen Online/Offline (außer dem Banner)

### Erweitere: `src/components/filler/TemplateSelector.jsx`

- Templates aus Cache laden wenn offline
- "Offline verfügbar" Badge an gecachten Templates
- Nicht-gecachte Templates: Ausgegraut wenn offline

---

## Aufgabe 7: Sync-Konflikte

### Neue Datei: `src/lib/conflictResolver.js`

Einfache Strategie (Last-Write-Wins mit Warnung):

```javascript
export function resolveConflict(localData, serverData) {
  // Vergleiche updated_at Timestamps
  if (localData.updated_at > serverData.updated_at) {
    // Lokale Änderung ist neuer → Überschreiben
    return { winner: 'local', data: localData };
  } else {
    // Server ist neuer → Server gewinnt, lokale Änderung verwerfen
    return { winner: 'server', data: serverData };
  }
}
```

Bei Konflikt: Toast-Notification "Deine Offline-Änderung an [Template-Name] wurde überschrieben — ein Kollege hat zwischenzeitlich Änderungen vorgenommen."

---

## Aufgabe 8: PWA Install-Prompt

### Neue Datei: `src/components/common/InstallPrompt.jsx`

Custom Install-Banner:
- Erscheint nach 2. Besuch (oder nach erstem Formular-Submit)
- "FormPilot installieren — schneller Zugriff, offline nutzbar"
- "Installieren" + "Später" Buttons
- Nutzt `beforeinstallprompt` Event
- Nach Installation: Banner verschwindet permanent

---

## Validierung & Tests

1. **Build:**
   ```bash
   npm run build
   ```

2. **PWA-Validierung:**
   ```bash
   npm run build && npm run preview
   ```
   - [ ] Lighthouse PWA-Audit ≥ 90 Punkte
   - [ ] Service Worker registriert sich
   - [ ] App ist installierbar (Install-Button in Chrome)
   - [ ] Manifest korrekt (Name, Icons, Theme-Color)

3. **Offline-Tests (Chrome DevTools → Network → Offline):**
   - [ ] App startet offline (aus Cache)
   - [ ] Templates-Liste wird angezeigt (aus IndexedDB)
   - [ ] Formular kann offline ausgefüllt werden
   - [ ] Fotos können offline aufgenommen werden
   - [ ] Signatur funktioniert offline
   - [ ] Submission wird offline gespeichert
   - [ ] Offline-Banner wird angezeigt
   - [ ] Sync-Queue zeigt "1 Änderung ausstehend"

4. **Sync-Tests:**
   - [ ] Netzwerk wieder an → Automatische Synchronisation
   - [ ] Sync-Banner: "Synchronisiere..." → "Erfolgreich synchronisiert"
   - [ ] Submission erscheint in Supabase nach Sync
   - [ ] Fotos werden in Storage hochgeladen nach Sync
   - [ ] Mehrere Offline-Submissions → Alle werden synchronisiert

5. **Konflikt-Tests:**
   - [ ] Offline Submission erstellen → Gleiche Submission online bearbeiten → Sync → Warnung
   - [ ] Last-Write-Wins funktioniert korrekt

6. **Regression:**
   - [ ] Online-Modus funktioniert wie vorher (kein Performance-Verlust)
   - [ ] Alle Features aus Prompts 01-07 funktionieren noch
   - [ ] localStorage-Fallback (ohne Supabase) funktioniert noch

---

## Dateien die geändert/erstellt werden

**Neue Dateien:**
- `src/lib/offlineDb.js`
- `src/lib/syncQueue.js`
- `src/lib/conflictResolver.js`
- `src/hooks/useOnlineStatus.js`
- `src/components/common/OfflineIndicator.jsx`
- `src/components/common/InstallPrompt.jsx`

**Geänderte Dateien:**
- `vite.config.js` — PWA Plugin Konfiguration
- `src/lib/storageAdapter.js` — Offline-Fallback
- `src/components/filler/FormFiller.jsx` — Offline-Draft
- `src/components/filler/TemplateSelector.jsx` — Offline-Cache-Badge
- `src/App.jsx` — OfflineIndicator + InstallPrompt einbinden
