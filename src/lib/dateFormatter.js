/**
 * Zentrale Datum-Formatierung für konsistente Anzeige.
 * @param {string|Date} date - ISO string oder Date Objekt
 * @param {'date'|'datetime'|'time'} format - Anzeigeformat
 * @returns {string} Formatierter String in de-DE Locale
 */
export const formatDate = (date, format = 'date') => {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  const opts = {
    date: { day: '2-digit', month: '2-digit', year: 'numeric' },
    datetime: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' },
    time: { hour: '2-digit', minute: '2-digit' },
  };
  return d.toLocaleDateString('de-DE', opts[format] || opts.date);
};

/**
 * Relative Zeitangabe (z.B. "vor 5 Minuten")
 */
export const formatRelative = (date) => {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Gerade eben';
  if (mins < 60) return `Vor ${mins} Min.`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Vor ${days} Tag${days > 1 ? 'en' : ''}`;
  return formatDate(d, 'date');
};
