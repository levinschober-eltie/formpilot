import { useState, useRef, useCallback } from 'react';

// ═══ HOOK: Canvas Annotation Logic ═══

const MAX_UNDO = 20;

const TOOLS = { PEN: 'pen', ARROW: 'arrow', RECT: 'rect', TEXT: 'text' };
const COLORS = ['#dc2626', '#facc15', '#16a34a', '#2563eb', '#ffffff', '#000000'];
const WIDTHS = [
  { label: 'Dünn', value: 2 },
  { label: 'Mittel', value: 4 },
  { label: 'Dick', value: 8 },
];

export { TOOLS, COLORS, WIDTHS };

export function useAnnotation(canvasRef, bgImageRef) {
  const [tool, setTool] = useState(TOOLS.PEN);
  const [color, setColor] = useState(COLORS[0]);
  const [strokeWidth, setStrokeWidth] = useState(WIDTHS[1].value);

  const undoStackRef = useRef([]);
  const [undoCount, setUndoCount] = useState(0);
  const isDrawingRef = useRef(false);
  const startPosRef = useRef(null);
  // Snapshot before current shape-drag starts (for live preview)
  const preShapeSnapshotRef = useRef(null);

  // ── helpers ──
  const getCtx = useCallback(() => {
    const c = canvasRef.current;
    return c ? c.getContext('2d') : null;
  }, [canvasRef]);

  const pushUndo = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const c = canvasRef.current;
    const snap = ctx.getImageData(0, 0, c.width, c.height);
    undoStackRef.current.push(snap);
    if (undoStackRef.current.length > MAX_UNDO) undoStackRef.current.shift();
    setUndoCount(undoStackRef.current.length);
  }, [getCtx, canvasRef]);

  const undo = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || undoStackRef.current.length === 0) return;
    const snap = undoStackRef.current.pop();
    ctx.putImageData(snap, 0, 0);
    setUndoCount(undoStackRef.current.length);
  }, [getCtx]);

  const clearAll = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const c = canvasRef.current;
    ctx.clearRect(0, 0, c.width, c.height);
    undoStackRef.current = [];
    setUndoCount(0);
  }, [getCtx, canvasRef]);

  // ── coordinate helpers ──
  const getPos = useCallback((e) => {
    const c = canvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const rect = c.getBoundingClientRect();
    const scaleX = c.width / rect.width;
    const scaleY = c.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, [canvasRef]);

  // ── drawing helpers ──
  const drawArrow = useCallback((ctx, x1, y1, x2, y2) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLen = 20;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    // arrowhead
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 7), y2 - headLen * Math.sin(angle - Math.PI / 7));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 7), y2 - headLen * Math.sin(angle + Math.PI / 7));
    ctx.stroke();
  }, []);

  const applyStyle = useCallback((ctx) => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [color, strokeWidth]);

  // ── pointer handlers ──
  const startDraw = useCallback((e) => {
    // only primary pointer / single touch
    if (e.pointerType === 'touch' && !e.isPrimary) return;
    const ctx = getCtx();
    if (!ctx) return;

    const pos = getPos(e);
    isDrawingRef.current = true;
    startPosRef.current = pos;

    if (tool === TOOLS.TEXT) {
      isDrawingRef.current = false;
      const text = window.prompt('Text eingeben:');
      if (text) {
        pushUndo();
        const scaledSize = Math.max(16, strokeWidth * 6);
        ctx.font = `bold ${scaledSize}px ${`'DM Sans', sans-serif`}`;
        ctx.fillStyle = color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = Math.max(1, scaledSize / 8);
        ctx.lineJoin = 'round';
        ctx.strokeText(text, pos.x, pos.y);
        ctx.fillText(text, pos.x, pos.y);
      }
      return;
    }

    pushUndo();

    if (tool === TOOLS.PEN) {
      applyStyle(ctx);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }

    if (tool === TOOLS.ARROW || tool === TOOLS.RECT) {
      const c = canvasRef.current;
      preShapeSnapshotRef.current = ctx.getImageData(0, 0, c.width, c.height);
    }
  }, [tool, getCtx, getPos, pushUndo, applyStyle, color, strokeWidth, canvasRef]);

  const draw = useCallback((e) => {
    if (!isDrawingRef.current) return;
    if (e.pointerType === 'touch' && !e.isPrimary) return;
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);

    if (tool === TOOLS.PEN) {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      return;
    }

    // For arrow and rect, restore pre-shape snapshot and draw preview
    if ((tool === TOOLS.ARROW || tool === TOOLS.RECT) && preShapeSnapshotRef.current) {
      ctx.putImageData(preShapeSnapshotRef.current, 0, 0);
      applyStyle(ctx);
      const s = startPosRef.current;
      if (tool === TOOLS.ARROW) {
        drawArrow(ctx, s.x, s.y, pos.x, pos.y);
      } else {
        ctx.strokeRect(s.x, s.y, pos.x - s.x, pos.y - s.y);
      }
    }
  }, [tool, getCtx, getPos, applyStyle, drawArrow]);

  const endDraw = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    preShapeSnapshotRef.current = null;
    const ctx = getCtx();
    if (ctx && tool === TOOLS.PEN) {
      ctx.closePath();
    }
  }, [getCtx, tool]);

  // ── merge ──
  const mergeResult = useCallback(() => {
    const c = canvasRef.current;
    const bg = bgImageRef.current;
    if (!c || !bg) return null;
    const merge = document.createElement('canvas');
    merge.width = c.width;
    merge.height = c.height;
    const mCtx = merge.getContext('2d');
    mCtx.drawImage(bg, 0, 0, c.width, c.height);
    mCtx.drawImage(c, 0, 0);
    return merge.toDataURL('image/jpeg', 0.85);
  }, [canvasRef, bgImageRef]);

  return {
    tool, setTool,
    color, setColor,
    strokeWidth, setStrokeWidth,
    undoCount,
    undo, clearAll,
    startDraw, draw, endDraw,
    mergeResult,
  };
}
