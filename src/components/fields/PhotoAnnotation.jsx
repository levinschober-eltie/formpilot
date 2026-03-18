import { useRef, useEffect, useCallback, memo } from 'react';
import { S } from '../../config/theme';
import { useAnnotation, TOOLS, COLORS, WIDTHS } from '../../hooks/useAnnotation';

// ═══ FEATURE: Photo Annotation Overlay ═══

// ── Styles (outside render) ──
const S_OVERLAY = {
  position: 'fixed', inset: 0, zIndex: 10000,
  background: 'rgba(0,0,0,0.95)',
  display: 'flex', flexDirection: 'column',
  fontFamily: S.font.sans,
};

const S_TOOLBAR = {
  display: 'flex', flexWrap: 'wrap', gap: '6px',
  padding: '8px 12px', alignItems: 'center',
  ...S.glass,
  borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none',
};

const S_TOOL_BTN = (active) => ({
  minWidth: '44px', minHeight: '44px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: S.radius.sm, border: 'none',
  background: active ? S.colors.primary : 'rgba(255,255,255,0.12)',
  color: active ? '#fff' : '#ccc',
  fontSize: '18px', cursor: 'pointer',
  transition: S.transition, fontFamily: 'inherit',
});

const S_COLOR_BTN = (c, active) => ({
  width: '32px', height: '32px', minWidth: '32px',
  borderRadius: S.radius.full,
  background: c, border: active ? '3px solid #fff' : '2px solid rgba(255,255,255,0.3)',
  cursor: 'pointer', boxSizing: 'border-box',
});

const S_WIDTH_BTN = (active) => ({
  minWidth: '44px', minHeight: '36px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: S.radius.sm, border: 'none',
  background: active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
  color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
  fontFamily: 'inherit',
});

const S_CANVAS_AREA = {
  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
  overflow: 'hidden', position: 'relative', padding: '8px',
};

const S_CANVAS = {
  maxWidth: '100%', maxHeight: '100%', touchAction: 'none',
  borderRadius: S.radius.sm,
};

const S_ACTIONS = {
  display: 'flex', gap: '12px', padding: '10px 16px',
  justifyContent: 'center',
  ...S.glass,
  borderRadius: 0, borderBottom: 'none', borderLeft: 'none', borderRight: 'none',
};

const S_ACTION_BTN = (variant) => ({
  minWidth: '44px', minHeight: '44px', padding: '10px 24px',
  borderRadius: S.radius.md, border: 'none',
  background: variant === 'primary' ? S.colors.primary : 'rgba(255,255,255,0.12)',
  color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
  fontFamily: 'inherit',
});

const S_SEP = {
  width: '1px', height: '28px', background: 'rgba(255,255,255,0.15)', margin: '0 2px',
};

const TOOL_ICONS = [
  { id: TOOLS.PEN, icon: '✏️', label: 'Stift' },
  { id: TOOLS.ARROW, icon: '↗', label: 'Pfeil' },
  { id: TOOLS.RECT, icon: '▭', label: 'Rechteck' },
  { id: TOOLS.TEXT, icon: 'T', label: 'Text' },
];

const PhotoAnnotation = memo(function PhotoAnnotation({ imageSrc, onSave, onCancel }) {
  const canvasRef = useRef(null);
  const bgImageRef = useRef(null);
  const containerRef = useRef(null);

  const {
    tool, setTool,
    color, setColor,
    strokeWidth, setStrokeWidth,
    undoCount,
    undo, clearAll,
    startDraw, draw, endDraw,
    mergeResult,
  } = useAnnotation(canvasRef, bgImageRef);

  // ── Load image and set up canvas ──
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      bgImageRef.current = img;
      const c = canvasRef.current;
      if (!c) return;
      // Retina 2x
      c.width = img.width;
      c.height = img.height;
      // CSS size will be constrained by maxWidth/maxHeight
      c.style.aspectRatio = `${img.width} / ${img.height}`;
    };
    img.src = imageSrc;

    return () => {
      // Cleanup
      bgImageRef.current = null;
    };
  }, [imageSrc]);

  // ── Draw background image behind canvas for visual reference ──
  // We use a CSS background on the canvas container instead of drawing into canvas,
  // so that the canvas only contains annotation data for clean merging.
  const canvasStyle = {
    ...S_CANVAS,
    backgroundImage: `url(${imageSrc})`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
  };

  const handleFinish = useCallback(() => {
    const merged = mergeResult();
    if (merged) onSave(merged);
  }, [mergeResult, onSave]);

  const handleClearAll = useCallback(() => {
    if (window.confirm('Alle Annotationen löschen?')) {
      clearAll();
    }
  }, [clearAll]);

  // Prevent scroll/zoom while annotating
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prevent = (e) => e.preventDefault();
    el.addEventListener('touchmove', prevent, { passive: false });
    return () => el.removeEventListener('touchmove', prevent);
  }, []);

  return (
    <div style={S_OVERLAY} ref={containerRef}>
      {/* ── Toolbar ── */}
      <div style={S_TOOLBAR}>
        {TOOL_ICONS.map((t) => (
          <button key={t.id} type="button" style={S_TOOL_BTN(tool === t.id)}
            onClick={() => setTool(t.id)} aria-label={t.label} title={t.label}>
            {t.icon}
          </button>
        ))}

        <div style={S_SEP} />

        <button type="button" style={S_TOOL_BTN(false)} onClick={undo}
          disabled={undoCount === 0} aria-label="Rückgängig" title="Rückgängig">↩</button>
        <button type="button" style={S_TOOL_BTN(false)} onClick={handleClearAll}
          aria-label="Alles löschen" title="Alles löschen">🗑</button>

        <div style={S_SEP} />

        {COLORS.map((c) => (
          <button key={c} type="button" style={S_COLOR_BTN(c, color === c)}
            onClick={() => setColor(c)} aria-label={`Farbe ${c}`} />
        ))}

        <div style={S_SEP} />

        {WIDTHS.map((w) => (
          <button key={w.value} type="button" style={S_WIDTH_BTN(strokeWidth === w.value)}
            onClick={() => setStrokeWidth(w.value)}>
            {w.label}
          </button>
        ))}
      </div>

      {/* ── Canvas ── */}
      <div style={S_CANVAS_AREA}>
        <canvas
          ref={canvasRef}
          style={canvasStyle}
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
          onPointerCancel={endDraw}
        />
      </div>

      {/* ── Actions ── */}
      <div style={S_ACTIONS}>
        <button type="button" style={S_ACTION_BTN('secondary')} onClick={onCancel}>
          Abbrechen
        </button>
        <button type="button" style={S_ACTION_BTN('primary')} onClick={handleFinish}>
          Fertig ✓
        </button>
      </div>
    </div>
  );
});

export default PhotoAnnotation;
