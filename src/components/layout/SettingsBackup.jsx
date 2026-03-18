import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { createFullBackup, exportAllData, importAllData, checkIntegrity, getVersionHistory, restoreVersion } from '../../lib/storageBackup';

// ═══ Extracted Styles (P4) ═══
const S_BACKUP_META = { fontSize: '12px', color: S.colors.textSecondary, marginBottom: '12px', padding: '8px 12px', background: S.colors.bgInput, borderRadius: S.radius.sm };
const S_VERSION_ITEM = { padding: '8px 12px', background: S.colors.bgInput, borderRadius: S.radius.sm };
const S_RESTORE_BTN = { fontSize: '11px', padding: '2px 8px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, background: 'transparent', color: S.colors.primary, cursor: 'pointer', fontFamily: 'inherit' };

const CRITICAL_LABELS = { fp_submissions: 'Verträge', fp_templates: 'Vorlagen', fp_customers: 'Kontakte', fp_projects: 'Projekte' };

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

export const SettingsBackup = memo(function SettingsBackup() {
  const [backupStatus, setBackupStatus] = useState(null);
  const [backupMeta, setBackupMeta] = useState(null);
  const [versionHistory, setVersionHistory] = useState(null);
  const [restoreStatus, setRestoreStatus] = useState(null);
  const [storageBytes, setStorageBytes] = useState(0);
  const importRef = useRef(null);

  useEffect(() => {
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

  // storageBytes is only used after import; suppress unused warning
  void storageBytes;

  return (
    <>
      <div style={{ ...styles.card, marginTop: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Datensicherung</h3>
        <input ref={importRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
        {backupMeta && (
          <div style={S_BACKUP_META}>
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
                <div key={key} style={S_VERSION_ITEM}>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{label} <span style={{ fontWeight: 400, color: S.colors.textMuted }}>({versions.length} Versionen)</span></div>
                  {versions.length === 0 && <div style={{ fontSize: '11px', color: S.colors.textMuted }}>Noch keine Versionen gespeichert</div>}
                  {versions.slice(0, 3).map((v) => (
                    <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', padding: '3px 0', borderTop: `1px solid ${S.colors.border}` }}>
                      <span style={{ color: S.colors.textSecondary }}>{new Date(v.timestamp).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} — {(v.size / 1024).toFixed(1)} KB</span>
                      <button onClick={() => handleRestore(v.id, label)} style={S_RESTORE_BTN}>Wiederherstellen</button>
                    </div>
                  ))}
                </div>
              );
            })}
            <button onClick={loadVersionHistory} style={{ ...styles.btn('secondary'), width: '100%', fontSize: '12px' }}>Aktualisieren</button>
          </div>
        )}
      </div>
    </>
  );
});
