import { useRef, useState, useEffect, useCallback, memo } from 'react';
import { S } from '../../config/theme';

// ═══ FEATURE: Signature Capture (Canvas-based) ═══
const S_CANVAS_WRAP = {
  position: 'relative', borderRadius: S.radius.md,
  border: `1.5px solid ${S.colors.border}`, background: S.colors.bgCardSolid,
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
const S_SLOT_LABEL = {
  fontSize: '13px', fontWeight: 600, color: S.colors.textPrimary,
  marginBottom: '6px',
};
const S_SLOT_DIVIDER = {
  borderTop: `1px dashed ${S.colors.border}`,
  margin: '12px 0',
};
const S_REQUIRED_MARK = {
  color: S.colors.danger || '#dc2626',
  marginLeft: '4px',
};

// ═══ Single Canvas Component (reused for each slot) ═══
const SingleCanvas = memo(({ slotValue, onSlotChange, error, placeholder }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(!!slotValue);
  const lastPoint = useRef(null);

  const getPoint = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
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
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--fp-canvas-stroke').trim() || '#1a1a1a';
    ctx.lineWidth = 2;
    if (slotValue) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2);
        setHasContent(true);
      };
      img.onerror = () => { setHasContent(false); };
      img.src = slotValue;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- canvas init only on mount

  const startDraw = useCallback((e) => {
    e.preventDefault();
    setIsDrawing(true);
    lastPoint.current = getPoint(e);
  }, [getPoint]);

  const draw = useCallback((e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSlotChange(dataUrl);
  }, [isDrawing, onSlotChange]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
    onSlotChange(null);
  }, [onSlotChange]);

  return (
    <div>
      <div style={{ ...S_CANVAS_WRAP, borderColor: error ? (S.colors.danger || '#dc2626') : S.colors.border }}>
        {!hasContent && <div style={S_PLACEHOLDER}>{placeholder || '✍️ Hier unterschreiben'}</div>}
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
});
SingleCanvas.displayName = 'SingleCanvas';

// ═══ Main SignatureField (supports single + multi mode) ═══
export const SignatureField = memo(({ field, value, onChange, error }) => {
  const isMulti = field.multiSignature && Array.isArray(field.signatureSlots) && field.signatureSlots.length > 0;

  // Single mode: unchanged behavior (backward compatible)
  const handleSingleChange = useCallback((dataUrl) => {
    onChange(dataUrl);
  }, [onChange]);

  // Multi mode: update the specific slot in the object
  const handleSlotChange = useCallback((slotId, dataUrl) => {
    const current = (typeof value === 'object' && value !== null && !Array.isArray(value)) ? value : {};
    onChange({ ...current, [slotId]: dataUrl });
  }, [value, onChange]);

  if (!isMulti) {
    // ═══ Single signature mode (backward compatible) ═══
    return (
      <SingleCanvas
        slotValue={value}
        onSlotChange={handleSingleChange}
        error={error}
        placeholder="✍️ Hier unterschreiben"
      />
    );
  }

  // ═══ Multi signature mode ═══
  const multiValue = (typeof value === 'object' && value !== null && !Array.isArray(value)) ? value : {};

  return (
    <div>
      {field.signatureSlots.map((slot, index) => (
        <div key={slot.id}>
          {index > 0 && <div style={S_SLOT_DIVIDER} />}
          <div style={S_SLOT_LABEL}>
            {slot.label || `Unterschrift ${index + 1}`}
            {slot.required && <span style={S_REQUIRED_MARK}>*</span>}
          </div>
          <SingleCanvas
            slotValue={multiValue[slot.id] || null}
            onSlotChange={(dataUrl) => handleSlotChange(slot.id, dataUrl)}
            error={error && typeof error === 'string' && error.includes(slot.label)}
            placeholder={`✍️ ${slot.label || 'Hier unterschreiben'}`}
          />
        </div>
      ))}
    </div>
  );
});
SignatureField.displayName = 'SignatureField';
