import React, { useState, useEffect, useCallback, useRef } from 'react';
import { S } from '../../config/theme';

// ═══ P4: Style-Objekte AUSSERHALB der Render-Funktion ═══
const S_WRAPPER = { display: 'flex', flexDirection: 'column', gap: '8px' };

const S_LOCATE_BTN = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  padding: '10px 20px', borderRadius: S.radius.md, fontSize: '14px', fontWeight: 600,
  fontFamily: 'inherit', border: 'none', cursor: 'pointer', transition: S.transition,
  background: S.colors.primary, color: S.colors.white, WebkitTapHighlightColor: 'transparent',
};

const S_COORDS_BOX = {
  padding: '12px 14px', borderRadius: S.radius.md,
  background: S.colors.bgInput, border: `1.5px solid ${S.colors.border}`,
  fontFamily: S.font.mono, fontSize: '14px', color: S.colors.text, lineHeight: 1.6,
};

const S_COORD_LABEL = {
  fontSize: '11px', fontWeight: 600, color: S.colors.textMuted, textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const S_MAP_BTN = {
  display: 'inline-flex', alignItems: 'center', gap: '4px',
  padding: '6px 12px', borderRadius: S.radius.sm, fontSize: '12px', fontWeight: 600,
  fontFamily: 'inherit', border: `1.5px solid ${S.colors.border}`, cursor: 'pointer',
  background: 'transparent', color: S.colors.textSecondary, transition: S.transition,
  textDecoration: 'none',
};

const S_ERROR_MSG = {
  fontSize: '13px', color: S.colors.danger, padding: '8px 12px',
  background: `${S.colors.danger}08`, borderRadius: S.radius.sm,
};

const S_LOADING = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  fontSize: '14px', color: S.colors.textSecondary, padding: '8px 0',
};

const S_PULSE_DOT = {
  width: '10px', height: '10px', borderRadius: '50%', background: S.colors.primary,
  animation: 'fp-gps-pulse 1.2s ease-in-out infinite',
};

const accuracyBadge = (accuracy) => {
  let color = S.colors.danger;
  if (accuracy < 20) color = S.colors.success;
  else if (accuracy < 100) color = S.colors.warning;
  return {
    display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
    borderRadius: S.radius.full, fontSize: '12px', fontWeight: 600,
    background: `color-mix(in srgb, ${color} 12%, transparent)`, color,
  };
};

const GPS_TIMEOUT_MS = 10000;

// Inject keyframe animation once
let styleInjected = false;
const injectPulseStyle = () => {
  if (styleInjected) return;
  styleInjected = true;
  const style = document.createElement('style');
  style.textContent = `@keyframes fp-gps-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.7); } }`;
  document.head.appendChild(style);
};

// ═══ GpsField Component ═══
const GpsField = React.memo(({ field, value, onChange, error }) => {
  const [loading, setLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const watchIdRef = useRef(null);
  const autoCapturedRef = useRef(false);

  // Inject pulse animation
  useEffect(() => { injectPulseStyle(); }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  const captureLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation wird von diesem Browser nicht unterstützt.');
      return;
    }
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setGpsError('GPS ist nur über HTTPS verfügbar.');
      return;
    }

    setLoading(true);
    setGpsError(null);

    const options = {
      enableHighAccuracy: field.highAccuracy !== false,
      timeout: GPS_TIMEOUT_MS,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const gpsData = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy * 10) / 10,
          timestamp: new Date().toISOString(),
        };
        onChange(gpsData);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case 1: setGpsError('Standortfreigabe benötigt. Bitte Berechtigung erteilen.'); break;
          case 2: setGpsError('Standort konnte nicht ermittelt werden.'); break;
          case 3: setGpsError('Standort konnte nicht ermittelt werden (Zeitüberschreitung).'); break;
          default: setGpsError('Unbekannter Fehler bei der Standortermittlung.');
        }
      },
      options,
    );
  }, [field.highAccuracy, onChange]);

  // Auto-capture on mount if configured
  useEffect(() => {
    if (field.autoCapture && !autoCapturedRef.current && !value) {
      autoCapturedRef.current = true;
      captureLocation();
    }
  }, [field.autoCapture, value, captureLocation]);

  const gps = value && typeof value === 'object' && value.lat != null ? value : null;
  const showMap = field.showMap !== false;

  return (
    <div style={S_WRAPPER}>
      {/* Loading state */}
      {loading && (
        <div style={S_LOADING}>
          <div style={S_PULSE_DOT} />
          Standort wird ermittelt...
        </div>
      )}

      {/* Error */}
      {gpsError && <div style={S_ERROR_MSG}>{gpsError}</div>}

      {/* Coordinates display */}
      {gps && !loading && (
        <div style={S_COORDS_BOX}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <div style={S_COORD_LABEL}>Breitengrad</div>
              <div>{gps.lat.toFixed(6)}</div>
            </div>
            <div>
              <div style={S_COORD_LABEL}>Längengrad</div>
              <div>{gps.lng.toFixed(6)}</div>
            </div>
            <div>
              <div style={S_COORD_LABEL}>Genauigkeit</div>
              <span style={accuracyBadge(gps.accuracy)}>{gps.accuracy} m</span>
            </div>
          </div>
          {showMap && (
            <div style={{ marginTop: '8px' }}>
              <a
                href={`https://www.google.com/maps?q=${gps.lat},${gps.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={S_MAP_BTN}
              >
                Auf Karte anzeigen
              </a>
            </div>
          )}
        </div>
      )}

      {/* Capture / Re-capture button */}
      {!loading && (
        <button type="button" onClick={captureLocation} style={S_LOCATE_BTN}>
          {gps ? 'Standort aktualisieren' : 'Standort erfassen'}
        </button>
      )}
    </div>
  );
});

GpsField.displayName = 'GpsField';

export { GpsField };
export default GpsField;
