// ═══ FEATURE: Style System (CSS Variables + Static Tokens) ═══
export const S = {
  colors: {
    // Semantic colors (static — same in light & dark)
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    accent: '#f0c040',
    accentDark: '#d4a017',
    success: '#16a34a',
    warning: '#f59e0b',
    danger: '#dc2626',
    borderFocus: '#2563eb',
    white: '#ffffff',
    // Theme-aware colors (CSS custom properties)
    bg: 'var(--fp-bg)',
    bgEnd: 'var(--fp-bg-end)',
    bgCard: 'var(--fp-bg-card)',
    bgCardSolid: 'var(--fp-bg-card-solid)',
    bgInput: 'var(--fp-bg-input)',
    border: 'var(--fp-border)',
    borderFaint: 'var(--fp-border-faint)',
    text: 'var(--fp-text)',
    textSecondary: 'var(--fp-text-secondary)',
    textMuted: 'var(--fp-text-muted)',
    shadow: 'var(--fp-shadow)',
    shadowLg: 'var(--fp-shadow-lg)',
  },
  radius: { sm: '8px', md: '12px', lg: '16px', xl: '20px', full: '9999px' },
  font: {
    sans: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  glass: {
    background: 'var(--fp-glass-bg)',
    backdropFilter: 'blur(16px) saturate(180%)',
    border: '1px solid var(--fp-glass-border)',
  },
};

export const CATEGORY_COLORS = {
  service: S.colors.primary,
  abnahme: S.colors.accent,
  mangel: S.colors.danger,
  pruefung: S.colors.primaryLight,
  uebergabe: S.colors.success,
  custom: '#94a3b8',
};

export const STATUS_COLORS = {
  draft: S.colors.warning,
  completed: S.colors.success,
  sent: S.colors.primary,
  archived: '#94a3b8',
};

export const STATUS_LABELS = {
  draft: 'Entwurf',
  completed: 'Abgeschlossen',
  sent: 'Versendet',
  archived: 'Archiviert',
};
