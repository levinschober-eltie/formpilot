import { useState, useEffect, useRef, useCallback } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { MiniToggle } from '../common/MiniToggle';
import { createFullBackup, exportAllData, importAllData, checkIntegrity, getVersionHistory, restoreVersion } from '../../lib/storageBackup';
import { getAISettings, saveAISettings, testAPIKey } from '../../lib/aiService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { needsMigration, migrateLocalDataToSupabase } from '../../lib/dataMigration';
import { useAuth } from '../../contexts/AuthContext';

// ═══ Extracted Styles (P4) ═══
const S_QUOTA_BAR = { height: '8px', background: S.colors.border, borderRadius: S.radius.full, overflow: 'hidden', marginTop: '8px' };
const S_QUOTA_FILL = (pct) => ({
  height: '100%', width: `${pct}%`, borderRadius: S.radius.full, transition: 'width 0.3s ease',
  background: pct > 80 ? S.colors.danger : pct > 60 ? S.colors.warning : S.colors.success,
});

const S_COMPANY_INPUT = { ...styles.input(false), fontSize: '14px', minHeight: '42px' };
const S_COMPANY_LABEL = { ...styles.fieldLabel, fontSize: '13px' };
const S_COMPANY_FIELD = { marginBottom: '12px' };
const S_PREVIEW_HEADER = {
  border: `1px solid ${S.colors.border}`, borderRadius: S.radius.md, padding: '16px',
  marginTop: '16px', background: S.colors.bgInput,
};

const loadCompanySettings = () => {
  try {
    const raw = localStorage.getItem('fp_company_settings');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const saveCompanySettings = (settings) => {
  localStorage.setItem('fp_company_settings', JSON.stringify(settings));
};

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

export const SettingsScreen = ({ darkMode, onToggleDarkMode }) => {
  const { user, handleLogout } = useAuth();
  const [storageBytes, setStorageBytes] = useState(0);
  const [backupStatus, setBackupStatus] = useState(null);
  const [backupMeta, setBackupMeta] = useState(null);
  const [versionHistory, setVersionHistory] = useState(null);
  const [restoreStatus, setRestoreStatus] = useState(null);
  const [aiKey, setAiKey] = useState('');
  const [aiTestStatus, setAiTestStatus] = useState(null); // null | 'testing' | 'success' | 'error'
  const [aiTestMsg, setAiTestMsg] = useState('');
  const [company, setCompany] = useState(() => loadCompanySettings());
  const [companySaved, setCompanySaved] = useState(false);
  const [migrationNeeded, setMigrationNeeded] = useState(false);
  const [migrationRunning, setMigrationRunning] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(null);
  const [migrationResult, setMigrationResult] = useState(null);
  const importRef = useRef(null);
  const maxBytes = 5 * 1024 * 1024; // 5MB localStorage limit

  const CRITICAL_LABELS = { fp_submissions: 'Verträge', fp_templates: 'Vorlagen', fp_customers: 'Kontakte', fp_projects: 'Projekte' };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStorageBytes(estimateStorageUsage());
    checkIntegrity().then(info => setBackupMeta(info)).catch(() => {});
    const settings = getAISettings();
    if (settings.apiKey) setAiKey(settings.apiKey);
    setMigrationNeeded(needsMigration());
  }, []);

  const handleMigration = useCallback(async () => {
    setMigrationRunning(true);
    setMigrationResult(null);
    try {
      const result = await migrateLocalDataToSupabase((progress) => {
        setMigrationProgress(progress);
      });
      setMigrationResult(result);
      setMigrationNeeded(needsMigration());
    } catch (e) {
      setMigrationResult({ errors: [e.message], migrated: {} });
    }
    setMigrationRunning(false);
  }, []);

  const handleAiKeySave = useCallback(() => {
    saveAISettings({ apiKey: aiKey.trim() });
    setAiTestStatus(null);
    setAiTestMsg('Gespeichert');
    setTimeout(() => setAiTestMsg(''), 2000);
  }, [aiKey]);

  const handleAiKeyTest = useCallback(async () => {
    if (!aiKey.trim()) { setAiTestStatus('error'); setAiTestMsg('Bitte API-Key eingeben'); return; }
    setAiTestStatus('testing');
    setAiTestMsg('');
    try {
      await testAPIKey(aiKey.trim());
      saveAISettings({ apiKey: aiKey.trim() });
      setAiTestStatus('success');
      setAiTestMsg('API-Key ist gültig!');
    } catch (e) {
      setAiTestStatus('error');
      setAiTestMsg(e.message || 'Verbindung fehlgeschlagen');
    }
  }, [aiKey]);

  const updateCompanyField = useCallback((field, value) => {
    setCompany(prev => {
      const next = { ...prev, [field]: value };
      saveCompanySettings(next);
      return next;
    });
    setCompanySaved(true);
    setTimeout(() => setCompanySaved(false), 2000);
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
        <button onClick={handleLogout} style={{ ...styles.btn('danger'), width: '100%' }}>Abmelden</button>
      </div>

      {/* ═══ Cloud-Status & Migration Banner ═══ */}
      {isSupabaseConfigured() && (
        <div style={{ ...styles.card, marginTop: '12px', border: `1px solid ${S.colors.primary}40` }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Cloud-Sync</h3>
          <div style={{ fontSize: '13px', color: S.colors.success, fontWeight: 600, marginBottom: '8px' }}>
            Supabase verbunden
          </div>
          <p style={{ fontSize: '12px', color: S.colors.textSecondary, marginBottom: '12px' }}>
            Deine Daten werden in der Cloud gespeichert und sind auf allen Geraeten verfuegbar.
          </p>
          {migrationNeeded && !migrationResult && (
            <div style={{ padding: '12px', background: `${S.colors.warning}15`, border: `1px solid ${S.colors.warning}40`, borderRadius: S.radius.md, marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: S.colors.warning, marginBottom: '6px' }}>Lokale Daten gefunden</div>
              <p style={{ fontSize: '12px', color: S.colors.textSecondary, marginBottom: '10px' }}>
                Du hast Daten im lokalen Speicher. Moechtest du sie in die Cloud migrieren?
              </p>
              <button
                onClick={handleMigration}
                disabled={migrationRunning}
                style={{ ...styles.btn('primary'), width: '100%', opacity: migrationRunning ? 0.6 : 1 }}
              >
                {migrationRunning ? 'Migration laeuft...' : 'Daten in Cloud migrieren'}
              </button>
            </div>
          )}
          {migrationRunning && migrationProgress && (
            <div style={{ padding: '12px', background: S.colors.bgInput, borderRadius: S.radius.md, marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                Phase: {migrationProgress.phase} ({migrationProgress.processed || 0}/{migrationProgress.total || 0})
              </div>
              <div style={{ height: '6px', background: S.colors.border, borderRadius: S.radius.full, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${migrationProgress.total ? (migrationProgress.processed / migrationProgress.total * 100) : 0}%`, background: S.colors.primary, borderRadius: S.radius.full, transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}
          {migrationResult && (
            <div style={{ padding: '12px', background: migrationResult.errors?.length ? `${S.colors.warning}15` : `${S.colors.success}15`, borderRadius: S.radius.md }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: migrationResult.errors?.length ? S.colors.warning : S.colors.success, marginBottom: '6px' }}>
                Migration {migrationResult.errors?.length ? 'mit Warnungen' : 'erfolgreich'}
              </div>
              <div style={{ fontSize: '12px', color: S.colors.textSecondary }}>
                {migrationResult.migrated?.templates > 0 && <div>Vorlagen: {migrationResult.migrated.templates}</div>}
                {migrationResult.migrated?.submissions > 0 && <div>Formulare: {migrationResult.migrated.submissions}</div>}
                {migrationResult.migrated?.customers > 0 && <div>Kontakte: {migrationResult.migrated.customers}</div>}
                {migrationResult.migrated?.projects > 0 && <div>Projekte: {migrationResult.migrated.projects}</div>}
                {migrationResult.errors?.map((err, i) => <div key={i} style={{ color: S.colors.danger, marginTop: '4px' }}>{err}</div>)}
              </div>
            </div>
          )}
        </div>
      )}

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
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Firmeneinstellungen</h3>
        <p style={{ fontSize: '12px', color: S.colors.textSecondary, marginBottom: '16px' }}>
          Diese Daten erscheinen im PDF-Export als Kopfzeile. Logo wird auf max. 400x200px komprimiert.
        </p>
        {companySaved && <div style={{ fontSize: '13px', fontWeight: 600, color: S.colors.success, marginBottom: '10px' }}>Gespeichert</div>}
        <div style={S_COMPANY_FIELD}>
          <label style={S_COMPANY_LABEL}>Firmenlogo</label>
          <LogoUpload value={company.companyLogo || ''} onChange={(val) => updateCompanyField('companyLogo', val)} />
        </div>
        <div style={S_COMPANY_FIELD}>
          <label style={S_COMPANY_LABEL}>Firmenname</label>
          <input value={company.companyName || ''} onChange={e => updateCompanyField('companyName', e.target.value)} placeholder="z.B. GF Elite PV GmbH" style={S_COMPANY_INPUT} />
        </div>
        <div style={S_COMPANY_FIELD}>
          <label style={S_COMPANY_LABEL}>Adresse</label>
          <textarea value={company.companyAddress || ''} onChange={e => updateCompanyField('companyAddress', e.target.value)} placeholder="Musterstr. 1&#10;12345 Musterstadt" rows={3} style={{ ...S_COMPANY_INPUT, minHeight: '72px', resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ ...S_COMPANY_FIELD, flex: 1 }}>
            <label style={S_COMPANY_LABEL}>Telefon</label>
            <input value={company.companyPhone || ''} onChange={e => updateCompanyField('companyPhone', e.target.value)} placeholder="089/12345678" style={S_COMPANY_INPUT} />
          </div>
          <div style={{ ...S_COMPANY_FIELD, flex: 1 }}>
            <label style={S_COMPANY_LABEL}>E-Mail</label>
            <input value={company.companyEmail || ''} onChange={e => updateCompanyField('companyEmail', e.target.value)} placeholder="info@firma.de" style={S_COMPANY_INPUT} />
          </div>
        </div>
        <div style={S_COMPANY_FIELD}>
          <label style={S_COMPANY_LABEL}>Akzentfarbe (PDF)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input type="color" value={company.accentColor || '#2563eb'} onChange={e => updateCompanyField('accentColor', e.target.value)} style={{ width: '48px', height: '36px', border: 'none', cursor: 'pointer', borderRadius: S.radius.sm }} />
            <span style={{ fontSize: '13px', color: S.colors.textSecondary, fontFamily: S.font.mono }}>{company.accentColor || '#2563eb'}</span>
          </div>
        </div>
        {(company.companyName || company.companyLogo) && (
          <div style={S_PREVIEW_HEADER}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: S.colors.textMuted, marginBottom: '8px' }}>PDF-Kopfzeile Vorschau:</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '10px', borderBottom: `3px solid ${company.accentColor || '#2563eb'}` }}>
              {company.companyLogo && <img src={company.companyLogo} alt="Logo" style={{ maxWidth: '120px', maxHeight: '60px', objectFit: 'contain' }} />}
              <div>
                {company.companyName && <div style={{ fontSize: '15px', fontWeight: 700, color: company.accentColor || '#2563eb' }}>{company.companyName}</div>}
                {company.companyAddress && company.companyAddress.split('\n').map((line, i) => <div key={i} style={{ fontSize: '11px', color: S.colors.textSecondary }}>{line}</div>)}
                {company.companyPhone && <div style={{ fontSize: '11px', color: S.colors.textSecondary }}>Tel: {company.companyPhone}</div>}
                {company.companyEmail && <div style={{ fontSize: '11px', color: S.colors.textSecondary }}>{company.companyEmail}</div>}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ ...styles.card, marginTop: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>KI-Einstellungen</h3>
        <p style={{ fontSize: '12px', color: S.colors.textSecondary, marginBottom: '12px' }}>
          Anthropic API-Key für den KI-Formular-Generator. Dein Key wird nur lokal gespeichert und nie an Dritte weitergegeben.
        </p>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ ...styles.fieldLabel, fontSize: '13px' }}>API-Key</label>
          <input
            type="password"
            value={aiKey}
            onChange={e => setAiKey(e.target.value)}
            placeholder="sk-ant-..."
            style={{ ...styles.input(false), fontSize: '14px', minHeight: '42px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleAiKeySave} style={{ ...styles.btn('secondary'), flex: 1 }}>Speichern</button>
          <button onClick={handleAiKeyTest} disabled={aiTestStatus === 'testing'} style={{ ...styles.btn('primary'), flex: 1, opacity: aiTestStatus === 'testing' ? 0.6 : 1 }}>
            {aiTestStatus === 'testing' ? 'Teste...' : 'Testen'}
          </button>
        </div>
        {aiTestMsg && (
          <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '8px', color: aiTestStatus === 'success' ? S.colors.success : aiTestStatus === 'error' ? S.colors.danger : S.colors.textSecondary }}>
            {aiTestMsg}
          </div>
        )}
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
          <div><span style={{ color: S.colors.success }}>●</span> fp_ai_generator: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_excel_export: aktiv</div>
          <div><span style={{ color: S.colors.success }}>●</span> fp_company_branding: aktiv</div>
          <div><span style={{ color: S.colors.textMuted }}>○</span> fp_offline: geplant</div>
          <div><span style={{ color: isSupabaseConfigured() ? S.colors.success : S.colors.textMuted }}>{isSupabaseConfigured() ? '●' : '○'}</span> fp_supabase: {isSupabaseConfigured() ? 'aktiv' : 'bereit (URL nicht gesetzt)'}</div>
        </div>
      </div>
    </div>
  );
};
