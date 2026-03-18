import { useState, useEffect, useRef, useCallback } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { MiniToggle } from '../common/MiniToggle';
import { createFullBackup, exportAllData, importAllData, checkIntegrity, getVersionHistory, restoreVersion } from '../../lib/storageBackup';

// ═══ Extracted Styles (P4) ═══
const S_QUOTA_BAR = { height: '8px', background: S.colors.border, borderRadius: S.radius.full, overflow: 'hidden', marginTop: '8px' };
const S_QUOTA_FILL = (pct) => ({
  height: '100%', width: `${pct}%`, borderRadius: S.radius.full, transition: 'width 0.3s ease',
  background: pct > 80 ? S.colors.danger : pct > 60 ? S.colors.warning : S.colors.success,
});

const estimateStorageUsage = () => {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('fp_')) {
      total += (localStorage.getItem(key) || '').length * 2; // UTF-16
    }
  }
  return total;
};

export const SettingsScreen = ({ user, onLogout, darkMode, onToggleDarkMode }) => {
  const [storageBytes, setStorageBytes] = useState(0);
  const [backupStatus, setBackupStatus] = useState(null);
  const [backupMeta, setBackupMeta] = useState(null);
  const [versionHistory, setVersionHistory] = useState(null);
  const [restoreStatus, setRestoreStatus] = useState(null);
  const importRef = useRef(null);
  const maxBytes = 5 * 1024 * 1024; // 5MB localStorage limit

  const CRITICAL_LABELS = { fp_submissions: 'Verträge', fp_templates: 'Vorlagen', fp_customers: 'Kontakte', fp_projects: 'Projekte' };

  useEffect(() => {
    setStorageBytes(estimateStorageUsage());
    checkIntegrity().then(info => setBackupMeta(info)).catch(() => {});
  }, []);

  const handleBackup = useCallback(async () => {
    setBackupStatus('running');
    try {
      const count = await createFullBackup();
      setBackupStatus(`${count} Keys gesichert`);
      const info = await checkIntegrity();
      setBackupMeta(info);
    } catch { setBackupStatus('Fehler beim Backup'); }
    setTimeout(() => setBackupStatus(null), 3000);
  }, []);

  const handleExport = useCallback(() => {
    const count = exportAllData();
    setBackupStatus(`${count} Keys exportiert`);
    setTimeout(() => setBackupStatus(null), 3000);
  }, []);

  const handleImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const count = await importAllData(file);
      setBackupStatus(`${count} Keys importiert — Seite neu laden`);
      setStorageBytes(estimateStorageUsage());
    } catch { setBackupStatus('Import fehlgeschlagen — ungültiges Format'); }
    e.target.value = '';
  }, []);

  const loadVersionHistory = useCallback(async () => {
    const keys = ['fp_submissions', 'fp_templates', 'fp_customers', 'fp_projects'];
    const history = {};
    for (const key of keys) {
      history[key] = await getVersionHistory(key);
    }
    setVersionHistory(history);
  }, []);

  const handleRestore = useCallback(async (historyId, label) => {
    try {
      const result = await restoreVersion(historyId);
      setRestoreStatus(`${label} wiederhergestellt (${new Date(result.timestamp).toLocaleString('de-DE')})`);
      setTimeout(() => setRestoreStatus(null), 4000);
      await loadVersionHistory();
    } catch (e) {
      setRestoreStatus(`Fehler: ${e.message}`);
      setTimeout(() => setRestoreStatus(null), 4000);
    }
  }, [loadVersionHistory]);

  const storageMB = (storageBytes / (1024 * 1024)).toFixed(2);
  const storagePct = Math.min(100, (storageBytes / maxBytes) * 100);

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px' }}>Einstellungen</h2>
      <div style={styles.card}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Benutzer</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: S.colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px' }}>{user.name.split(' ').map(w => w[0]).join('')}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '16px' }}>{user.name}</div>
            <div style={{ fontSize: '13px', color: S.colors.textSecondary }}>{user.email}</div>
            <span style={styles.badge(S.colors.primary)}>{user.role === 'admin' ? 'Administrator' : user.role === 'monteur' ? 'Monteur' : 'Büro'}</span>
          </div>
        </div>
        <button onClick={onLogout} style={{ ...styles.btn('danger'), width: '100%' }}>Abmelden</button>
      </div>

      <div style={{ ...styles.card, marginTop: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Darstellung</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>Dark Mode</div>
            <div style={{ fontSize: '12px', color: S.colors.textSecondary }}>Dunkles Farbschema verwenden</div>
          </div>
          <MiniToggle value={darkMode} onChange={onToggleDarkMode} />
        </div>
      </div>

      <div style={{ ...styles.card, marginTop: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Speicherverbrauch</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: S.colors.textSecondary }}>{storageMB} MB von 5 MB</span>
          <span style={{ color: storagePct > 80 ? S.colors.danger : S.colors.textMuted, fontWeight: 600 }}>{storagePct.toFixed(0)}%</span>
        </div>
        <div style={S_QUOTA_BAR}><div style={S_QUOTA_FILL(storagePct)} /></div>
        {storagePct > 80 && <p style={{ fontSize: '12px', color: S.colors.danger, marginTop: '8px' }}>Speicher fast voll! Alte Formulare löschen oder exportieren.</p>}
      </div>

      <div style={{ ...styles.card, marginTop: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Datensicherung</h3>
        <input ref={importRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
        {backupMeta && (
          <div style={{ fontSize: '12px', color: S.colors.textSecondary, marginBottom: '12px', padding: '8px 12px', background: S.colors.bgInput, borderRadius: S.radius.sm }}>
            <div>IndexedDB-Backup: <strong>{backupMeta.backupKeyCount}</strong> Keys</div>
            <div>localStorage: <strong>{backupMeta.localKeyCount}</strong> Keys</div>
            {backupMeta.backupMeta?.lastBackup && <div>Letztes Backup: {new Date(backupMeta.backupMeta.lastBackup).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>}
          </div>
        )}
        {backupStatus && <div style={{ fontSize: '13px', fontWeight: 600, color: S.colors.success, marginBottom: '10px' }}>{backupStatus}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={handleBackup} style={{ ...styles.btn('secondary'), width: '100%' }}>IndexedDB-Backup erstellen</button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleExport} style={{ ...styles.btn('secondary'), flex: 1 }}>JSON exportieren</button>
            <button onClick={() => importRef.current?.click()} style={{ ...styles.btn('secondary'), flex: 1 }}>JSON importieren</button>
          </div>
        </div>
        <p style={{ fontSize: '11px', color: S.colors.textMuted, marginTop: '8px' }}>Daten werden automatisch in IndexedDB gespiegelt. Bei Datenverlust wird das Backup automatisch wiederhergestellt.</p>
      </div>

      <div style={{ ...styles.card, marginTop: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Versionsverlauf</h3>
        <p style={{ fontSize: '12px', color: S.colors.textSecondary, marginBottom: '10px' }}>Kritische Daten werden versioniert. Bei Problemen kannst du auf eine frühere Version zurücksetzen.</p>
        {restoreStatus && <div style={{ fontSize: '13px', fontWeight: 600, color: S.colors.success, marginBottom: '10px' }}>{restoreStatus}</div>}
        {!versionHistory ? (
          <button onClick={loadVersionHistory} style={{ ...styles.btn('secondary'), width: '100%' }}>Versionsverlauf laden</button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(CRITICAL_LABELS).map(([key, label]) => {
              const versions = versionHistory[key] || [];
              return (
                <div key={key} style={{ padding: '8px 12px', background: S.colors.bgInput, borderRadius: S.radius.sm }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{label} <span style={{ fontWeight: 400, color: S.colors.textMuted }}>({versions.length} Versionen)</span></div>
                  {versions.length === 0 && <div style={{ fontSize: '11px', color: S.colors.textMuted }}>Noch keine Versionen gespeichert</div>}
                  {versions.slice(0, 3).map((v) => (
                    <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', padding: '3px 0', borderTop: `1px solid ${S.colors.border}` }}>
                      <span style={{ color: S.colors.textSecondary }}>{new Date(v.timestamp).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} — {(v.size / 1024).toFixed(1)} KB</span>
                      <button onClick={() => handleRestore(v.id, label)} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, background: 'transparent', color: S.colors.primary, cursor: 'pointer', fontFamily: 'inherit' }}>Wiederherstellen</button>
                    </div>
                  ))}
                </div>
              );
            })}
            <button onClick={loadVersionHistory} style={{ ...styles.btn('secondary'), width: '100%', fontSize: '12px' }}>Aktualisieren</button>
          </div>
        )}
      </div>

      <div style={{ ...styles.card, marginTop: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Über FormPilot</h3>
        <p style={{ fontSize: '13px', color: S.colors.textSecondary, lineHeight: 1.6 }}>Version 5.0 (Feature Complete)<br />Formular-Generator für Handwerksbetriebe.</p>
      </div>
      <div style={{ ...styles.card, marginTop: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Feature-Status</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', fontFamily: S.font.mono }}>
          <div><span style={{ color: S.colors.success }}>●</span> fp_core_engine: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_form_filler: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_form_builder: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_signature: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_photo: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_pdf_export: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_csv_export: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_dashboard: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_repeater: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_dark_mode: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_search_filter: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_crm: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_template_import_export: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_status_management: aktiv</div>
          <div><span style={{ color: S.colors.textMuted }}>○</span> fp_offline: geplant</div>
          <div><span style={{ color: S.colors.textMuted }}>○</span> fp_supabase: geplant</div>
        </div>
      </div>
    </div>
  );
};
