import { useRef, useState, useEffect, useCallback } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';

// ═══ FEATURE: Signature Capture (Canvas-based) ═══
const S_CANVAS_WRAP = {
  position: 'relative', borderRadius: S.radius.md,
  border: `1.5px solid ${S.colors.border}`, background: S.colors.white,
  overflow: 'hidden', touchAction: 'none',
};
const S_CANVAS = { display: 'block', width: '100%', cursor: 'crosshair' };
const S_TOOLBAR = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  marginTop: '8px', gap: '8px',
};
const S_BTN = {
  padding: '6px 14px', borderRadius: S.radius.sm, fontSize: '12px',
  fontWeight: 600, border: `1px solid ${S.colors.border}`, background: S.colors.bgInput,
  color: S.colors.textSecondary, cursor: 'pointer', fontFamily: 'inherit',
};
const S_PLACEHOLDER = {
  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
  justifyContent: 'center', pointerEvents: 'none', color: S.colors.textMuted,
  fontSize: '14px', gap: '8px',
};

export const SignatureField = ({ field, value, onChange, error }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(!!value);
  const lastPoint = useRef(null);

  const getPoint = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return {
      x: (touch.clientX - rect.left) * (canvas.width / rect.width),
      y: (touch.clientY - rect.top) * (canvas.height / rect.height),
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = 200;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#e2e8f0' : '#1a1a1a';
    ctx.lineWidth = 2;
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2);
        setHasContent(true);
      };
      img.src = value;
    }
  }, []);

  const startDraw = useCallback((e) => {
    e.preventDefault();
    setIsDrawing(true);
    lastPoint.current = getPoint(e);
  }, [getPoint]);

  const draw = useCallback((e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const point = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x / 2, lastPoint.current.y / 2);
    ctx.lineTo(point.x / 2, point.y / 2);
    ctx.stroke();
    lastPoint.current = point;
    setHasContent(true);
  }, [isDrawing, getPoint]);

  const endDraw = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPoint.current = null;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onChange(dataUrl);
  }, [isDrawing, onChange]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
    onChange(null);
  }, [onChange]);

  return (
    <div>
      <div style={{ ...S_CANVAS_WRAP, borderColor: error ? S.colors.danger : S.colors.border }}>
        {!hasContent && <div style={S_PLACEHOLDER}>✍️ Hier unterschreiben</div>}
        <canvas ref={canvasRef} style={{ ...S_CANVAS, height: '100px' }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
      </div>
      <div style={S_TOOLBAR}>
        <span style={{ fontSize: '11px', color: S.colors.textMuted }}>
          {hasContent ? '✓ Unterschrift erfasst' : 'Bitte unterschreiben'}
        </span>
        <button type="button" onClick={clearCanvas} style={S_BTN}>Löschen</button>
      </div>
    </div>
  );
};
