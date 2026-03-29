import { useState, useEffect, useMemo } from 'react';
import { S, CATEGORY_COLORS, STATUS_COLORS, STATUS_LABELS } from '../../config/theme';
import { styles } from '../../styles/shared';
import { getActivityLog } from '../../lib/customerService';
import { useData } from '../../contexts/DataContext';

// ═══ FEATURE: Dashboard & Analytics ═══
const S_GRID = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' };
const S_STAT_CARD = (color) => ({
  ...styles.card, padding: '16px 18px', borderLeft: `4px solid ${color}`,
  display: 'flex', flexDirection: 'column', gap: '4px',
});
const S_STAT_VAL = { fontSize: '28px', fontWeight: 800, letterSpacing: '-1px' };
const S_STAT_LABEL = { fontSize: '12px', color: S.colors.textSecondary, fontWeight: 600 };
const S_CHART_BAR = (pct, color) => ({
  height: '24px', width: `${Math.max(pct, 2)}%`, background: color, borderRadius: S.radius.sm,
  transition: 'width 0.4s ease', minWidth: '2px',
});
const S_LEGEND_DOT = (color) => ({
  width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0,
});
const S_ROW = { display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' };

const LOG_COLORS = {
  submission_created: S.colors.success,
  submission_deleted: S.colors.danger,
  customer_created: S.colors.primary,
  customer_updated: S.colors.accent,
  note_added: S.colors.warning,
};
const LOG_LABELS = {
  submission_created: 'Vertrag erstellt',
  submission_deleted: 'Vertrag gelöscht',
  customer_created: 'Kontakt angelegt',
  customer_updated: 'Kontakt aktualisiert',
  note_added: 'Notiz',
};
const S_LOG_DOT = (color) => ({ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, marginTop: '5px' });

export const DashboardScreen = () => {
  const { submissions, allTemplates } = useData();
  const [recentLog, setRecentLog] = useState([]);
  useEffect(() => { getActivityLog().then(log => setRecentLog(log.slice(0, 10))).catch(() => {}); }, []);
  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now - 7 * 86400000).toISOString();
    const monthAgo = new Date(now - 30 * 86400000).toISOString();

    const todayCount = submissions.filter(s => s.createdAt?.startsWith(today)).length;
    const weekCount = submissions.filter(s => s.createdAt >= weekAgo).length;
    const monthCount = submissions.filter(s => s.createdAt >= monthAgo).length;

    const byTemplate = {};
    const byStatus = {};
    const byUser = {};
    const byDay = {};

    submissions.forEach(s => {
      const tplId = s.templateId;
      byTemplate[tplId] = (byTemplate[tplId] || 0) + 1;
      byStatus[s.status] = (byStatus[s.status] || 0) + 1;
      byUser[s.filledByName || 'Unbekannt'] = (byUser[s.filledByName || 'Unbekannt'] || 0) + 1;
      const day = s.createdAt?.split('T')[0];
      if (day) byDay[day] = (byDay[day] || 0) + 1;
    });

    const templateRanking = Object.entries(byTemplate)
      .map(([id, count]) => {
        const tpl = allTemplates.find(t => t.id === id);
        return { name: tpl?.name || 'Unbekannt', icon: tpl?.icon || '📋', category: tpl?.category, count };
      })
      .sort((a, b) => b.count - a.count);

    const userRanking = Object.entries(byUser)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Last 7 days activity
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const key = d.toISOString().split('T')[0];
      last7Days.push({
        label: d.toLocaleDateString('de-DE', { weekday: 'short' }),
        date: key,
        count: byDay[key] || 0,
      });
    }
    const dayCounts = last7Days.map(d => d.count);
    const maxDay = dayCounts.length > 0 ? Math.max(...dayCounts, 1) : 1;

    return { total: submissions.length, todayCount, weekCount, monthCount, byStatus, templateRanking, userRanking, last7Days, maxDay };
  }, [submissions, allTemplates]);

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Dashboard</h2>
      <p style={{ color: S.colors.textSecondary, marginBottom: '20px', fontSize: '14px' }}>
        Auswertung aller eingereichten Formulare
      </p>

      {/* KPI Cards */}
      <div style={S_GRID}>
        <div style={S_STAT_CARD(S.colors.primary)}>
          <div style={S_STAT_VAL}>{stats.total}</div>
          <div style={S_STAT_LABEL}>Gesamt</div>
        </div>
        <div style={S_STAT_CARD(S.colors.success)}>
          <div style={S_STAT_VAL}>{stats.todayCount}</div>
          <div style={S_STAT_LABEL}>Heute</div>
        </div>
        <div style={S_STAT_CARD(S.colors.accent)}>
          <div style={S_STAT_VAL}>{stats.weekCount}</div>
          <div style={S_STAT_LABEL}>Diese Woche</div>
        </div>
        <div style={S_STAT_CARD(S.colors.primaryLight)}>
          <div style={S_STAT_VAL}>{stats.monthCount}</div>
          <div style={S_STAT_LABEL}>Dieser Monat</div>
        </div>
      </div>

      {/* 7-Day Activity */}
      <div style={{ ...styles.card, marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Aktivität (7 Tage)</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '100px' }}>
          {stats.last7Days.map(d => (
            <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: S.colors.text }}>{d.count}</span>
              <div style={{ width: '100%', background: S.colors.border, borderRadius: S.radius.sm, overflow: 'hidden', height: '60px', display: 'flex', alignItems: 'flex-end' }}>
                <div style={{ width: '100%', height: `${(d.count / stats.maxDay) * 100}%`, background: `linear-gradient(180deg, ${S.colors.primary}, ${S.colors.primaryLight})`, borderRadius: S.radius.sm, transition: 'height 0.3s ease', minHeight: d.count > 0 ? '4px' : '0' }} />
              </div>
              <span style={{ fontSize: '10px', color: S.colors.textMuted }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Template Ranking */}
        <div style={styles.card}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Top Formulare</h3>
          {stats.templateRanking.length === 0 && <p style={{ fontSize: '13px', color: S.colors.textMuted }}>Keine Daten</p>}
          {stats.templateRanking.slice(0, 5).map((t, i) => (
            <div key={i} style={S_ROW}>
              <span style={{ fontSize: '18px' }}>{t.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                <div style={{ marginTop: '3px' }}>
                  <div style={S_CHART_BAR((t.count / stats.total) * 100, CATEGORY_COLORS[t.category] || S.colors.primary)} />
                </div>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: S.colors.primary, flexShrink: 0 }}>{t.count}</span>
            </div>
          ))}
        </div>

        {/* Status Distribution */}
        <div style={styles.card}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Status-Verteilung</h3>
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <div key={status} style={S_ROW}>
              <div style={S_LEGEND_DOT(STATUS_COLORS[status] || S.colors.textMuted)} />
              <span style={{ flex: 1, fontSize: '13px' }}>{STATUS_LABELS[status] || status}</span>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>{count}</span>
            </div>
          ))}
          {Object.keys(stats.byStatus).length === 0 && <p style={{ fontSize: '13px', color: S.colors.textMuted }}>Keine Daten</p>}
        </div>

        {/* User Ranking */}
        <div style={styles.card}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Benutzer-Aktivität</h3>
          {stats.userRanking.map((u, i) => (
            <div key={i} style={S_ROW}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: S.colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                {u.name.split(' ').map(w => w[0]).join('')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{u.name}</div>
                <div style={{ marginTop: '3px' }}>
                  <div style={S_CHART_BAR((u.count / stats.total) * 100, S.colors.primaryLight)} />
                </div>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: S.colors.primary, flexShrink: 0 }}>{u.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Aktivitätslog */}
      {recentLog.length > 0 && (
        <div style={{ ...styles.card, marginTop: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Letzte Aktivitäten</h3>
          {recentLog.map(entry => (
            <div key={entry.id} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: `1px solid ${S.colors.borderFaint}` }}>
              <div style={S_LOG_DOT(LOG_COLORS[entry.action] || S.colors.textMuted)} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{LOG_LABELS[entry.action] || entry.action}</div>
                {entry.details && <div style={{ fontSize: '12px', color: S.colors.textMuted, marginTop: '2px' }}>{entry.details}</div>}
                <div style={{ fontSize: '11px', color: S.colors.textMuted, marginTop: '2px' }}>
                  {new Date(entry.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {entry.userName && ` · ${entry.userName}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
