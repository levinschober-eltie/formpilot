// ═══ FEATURE: Style System (Chat F.1) ═══
export const S = {
  colors: {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    accent: '#f0c040',
    accentDark: '#d4a017',
    success: '#16a34a',
    warning: '#f59e0b',
    danger: '#dc2626',
    bg: '#f1f5f9',
    bgCard: 'rgba(255,255,255,0.82)',
    bgCardSolid: '#ffffff',
    bgInput: '#f8fafc',
    border: '#e2e8f0',
    borderFocus: '#2563eb',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    white: '#ffffff',
    shadow: '0 4px 24px rgba(0,0,0,0.06)',
    shadowLg: '0 8px 40px rgba(0,0,0,0.10)',
  },
  radius: { sm: '8px', md: '12px', lg: '16px', xl: '20px', full: '9999px' },
  font: {
    sans: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  glass: {
    background: 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(16px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.4)',
  },
};

export const CATEGORY_COLORS = {
  service: S.colors.primary,
  abnahme: S.colors.accent,
  mangel: S.colors.danger,
  pruefung: S.colors.primaryLight,
  uebergabe: S.colors.success,
  custom: S.colors.textSecondary,
};

export const STATUS_COLORS = {
  draft: S.colors.warning,
  completed: S.colors.success,
  sent: S.colors.primary,
  archived: S.colors.textMuted,
};

export const STATUS_LABELS = {
  draft: 'Entwurf',
  completed: 'Abgeschlossen',
  sent: 'Versendet',
  archived: 'Archiviert',
};
