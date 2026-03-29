import { useState, useEffect, useCallback, memo } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { MiniToggle } from '../common/MiniToggle';
import { isApiConfigured } from '../../lib/api/client';
import { needsMigration, migrateToApi } from '../../lib/dataMigration';

// ═══ Extracted Styles (P4) ═══
const S_QUOTA_BAR = { height: '8px', background: S.colors.border, borderRadius: S.radius.full, overflow: 'hidden', marginTop: '8px' };
const S_QUOTA_FILL = (pct) => ({
  height: '100%', width: `${pct}%`, borderRadius: S.radius.full, transition: 'width 0.3s ease',
  background: pct > 80 ? S.colors.danger : pct > 60 ? S.colors.warning : S.colors.success,
});
const S_MIGRATION_BOX = { padding: '12px', borderRadius: S.radius.md, marginBottom: '12px' };
const S_PROGRESS_BAR_OUTER = { height: '6px', background: S.colors.border, borderRadius: S.radius.full, overflow: 'hidden' };

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

export const SettingsInfo = memo(function SettingsInfo({ darkMode, onToggleDarkMode }) {
  const [storageBytes, setStorageBytes] = useState(0);
  const [migrationNeeded, setMigrationNeeded] = useState(false);
  const [migrationRunning, setMigrationRunning] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(null);
  const [migrationResult, setMigrationResult] = useState(null);
  const maxBytes = 5 * 1024 * 1024; // 5MB localStorage limit

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setStorageBytes(estimateStorageUsage());
    setMigrationNeeded(needsMigration());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const handleMigration = useCallback(async () => {
    setMigrationRunning(true);
    setMigrationResult(null);
    try {
      const result = await migrateToApi((progress) => {
        setMigrationProgress(progress);
      });
      setMigrationResult(result);
      setMigrationNeeded(needsMigration());
    } catch (e) {
      setMigrationResult({ errors: [e.message], migrated: {} });
    }
    setMigrationRunning(false);
  }, []);

  const storageMB = (storageBytes / (1024 * 1024)).toFixed(2);
  const storagePct = Math.min(100, (storageBytes / maxBytes) * 100);

  return (
    <>
      {/* ═══ Cloud-Status & Migration Banner ═══ */}
      {isApiConfigured() && (
        <div style={{ ...styles.card, marginTop: '12px', border: `1px solid ${S.colors.primary}40` }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Cloud-Sync</h3>
          <div style={{ fontSize: '13px', color: S.colors.success, fontWeight: 600, marginBottom: '8px' }}>
            Supabase verbunden
          </div>
          <p style={{ fontSize: '12px', color: S.colors.textSecondary, marginBottom: '12px' }}>
            Deine Daten werden in der Cloud gespeichert und sind auf allen Geräten verfügbar.
          </p>
          {migrationNeeded && !migrationResult && (
            <div style={{ ...S_MIGRATION_BOX, background: `${S.colors.warning}15`, border: `1px solid ${S.colors.warning}40` }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: S.colors.warning, marginBottom: '6px' }}>Lokale Daten gefunden</div>
              <p style={{ fontSize: '12px', color: S.colors.textSecondary, marginBottom: '10px' }}>
                Du hast Daten im lokalen Speicher. Möchtest du sie in die Cloud migrieren?
              </p>
              <button
                onClick={handleMigration}
                disabled={migrationRunning}
                style={{ ...styles.btn('primary'), width: '100%', opacity: migrationRunning ? 0.6 : 1 }}
              >
                {migrationRunning ? 'Migration läuft...' : 'Daten in Cloud migrieren'}
              </button>
            </div>
          )}
          {migrationRunning && migrationProgress && (
            <div style={{ ...S_MIGRATION_BOX, background: S.colors.bgInput }}>
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                Phase: {migrationProgress.phase} ({migrationProgress.processed || 0}/{migrationProgress.total || 0})
              </div>
              <div style={S_PROGRESS_BAR_OUTER}>
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
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Speicherverbrauch</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: S.colors.textSecondary }}>{storageMB} MB von 5 MB</span>
          <span style={{ color: storagePct > 80 ? S.colors.danger : S.colors.textMuted, fontWeight: 600 }}>{storagePct.toFixed(0)}%</span>
        </div>
        <div style={S_QUOTA_BAR}><div style={S_QUOTA_FILL(storagePct)} /></div>
        {storagePct > 80 && <p style={{ fontSize: '12px', color: S.colors.danger, marginTop: '8px' }}>Speicher fast voll! Alte Formulare löschen oder exportieren.</p>}
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
          <div><span style={{ color: isApiConfigured() ? S.colors.success : S.colors.textMuted }}>{isApiConfigured() ? '●' : '○'}</span> fp_supabase: {isApiConfigured() ? 'aktiv' : 'bereit (URL nicht gesetzt)'}</div>
        </div>
      </div>
    </>
  );
});
