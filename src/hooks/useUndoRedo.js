import { useState, useCallback, useRef } from 'react';

// ═══ HOOK: Undo/Redo für Builder (S01) ═══
export const useUndoRedo = (initialState, maxHistory = 50) => {
  const [state, setState] = useState(initialState);
  const historyRef = useRef([JSON.stringify(initialState)]);
  const indexRef = useRef(0);

  const push = useCallback((next) => {
    const json = JSON.stringify(next);
    // Keine Duplikate
    if (json === historyRef.current[indexRef.current]) {
      setState(next);
      return;
    }
    // Zukunft abschneiden
    historyRef.current = historyRef.current.slice(0, indexRef.current + 1);
    historyRef.current.push(json);
    // Max-History einhalten
    if (historyRef.current.length > maxHistory) {
      historyRef.current.shift();
    } else {
      indexRef.current += 1;
    }
    setState(next);
  }, [maxHistory]);

  const undo = useCallback(() => {
    if (indexRef.current <= 0) return;
    indexRef.current -= 1;
    setState(JSON.parse(historyRef.current[indexRef.current]));
  }, []);

  const redo = useCallback(() => {
    if (indexRef.current >= historyRef.current.length - 1) return;
    indexRef.current += 1;
    setState(JSON.parse(historyRef.current[indexRef.current]));
  }, []);

  const canUndo = indexRef.current > 0;
  const canRedo = indexRef.current < historyRef.current.length - 1;

  return { state, push, undo, redo, canUndo, canRedo };
};
