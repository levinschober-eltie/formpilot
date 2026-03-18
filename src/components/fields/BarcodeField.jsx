import React, { useState, useRef, useEffect, useCallback } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';

// ═══ P4: Style-Objekte AUSSERHALB der Render-Funktion ═══
const S_WRAPPER = { display: 'flex', flexDirection: 'column', gap: '8px' };

const S_SCAN_BTN = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  padding: '10px 20px', borderRadius: S.radius.md, fontSize: '14px', fontWeight: 600,
  fontFamily: 'inherit', border: 'none', cursor: 'pointer', transition: S.transition,
  background: S.colors.primary, color: S.colors.white, WebkitTapHighlightColor: 'transparent',
};

const S_OVERLAY = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
  background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
};

const S_VIDEO = {
  width: '100%', maxWidth: '400px', borderRadius: S.radius.md, objectFit: 'cover',
};

const S_SCAN_FRAME = {
  position: 'absolute', width: '220px', height: '220px',
  border: '3px solid rgba(255,255,255,0.7)', borderRadius: '16px',
  boxShadow: '0 0 0 9999px rgba(0,0,0,0.3)',
};

const S_CLOSE_BTN = {
  position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.2)',
  border: 'none', borderRadius: S.radius.full, width: '40px', height: '40px',
  fontSize: '20px', color: '#fff', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
};

const S_SUCCESS_BADGE = {
  display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
  borderRadius: S.radius.full, fontSize: '13px', fontWeight: 600,
  background: `${S.colors.success}15`, color: S.colors.success,
};

const S_ERROR_MSG = {
  fontSize: '13px', color: S.colors.danger, padding: '8px 12px',
  background: `${S.colors.danger}08`, borderRadius: S.radius.sm,
};

const S_HINT = {
  fontSize: '12px', color: S.colors.textMuted, textAlign: 'center', padding: '8px',
};

const S_VIDEO_CONTAINER = {
  position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const ALL_FORMATS = [
  { value: 'qr_code', label: 'QR-Code' },
  { value: 'code_128', label: 'Code 128' },
  { value: 'code_39', label: 'Code 39' },
  { value: 'ean_13', label: 'EAN-13' },
  { value: 'ean_8', label: 'EAN-8' },
  { value: 'upc_a', label: 'UPC-A' },
];

const SCAN_TIMEOUT_MS = 15000;

// ═══ BarcodeField Component ═══
const BarcodeField = React.memo(({ field, value, onChange, error }) => {
  const [scanning, setScanning] = useState(false);
  const [camError, setCamError] = useState(null);
  const [scanStatus, setScanStatus] = useState(null); // 'success' | 'timeout' | null
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // Cleanup: stop camera and intervals
  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => { stopCamera(); };
  }, [stopCamera]);

  const startScan = useCallback(async () => {
    setCamError(null);
    setScanStatus(null);
    setScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Try native BarcodeDetector
      if ('BarcodeDetector' in window) {
        const formats = field.barcodeFormats?.length ? field.barcodeFormats : ['qr_code', 'code_128', 'ean_13'];
        try {
          detectorRef.current = new window.BarcodeDetector({ formats });
        } catch {
          // Fallback: try without format filter
          detectorRef.current = new window.BarcodeDetector();
        }

        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const barcodes = await detectorRef.current.detect(videoRef.current);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              onChange(code);
              setScanStatus('success');
              stopCamera();
              setScanning(false);
            }
          } catch {
            // detection frame error — ignore, retry
          }
        }, 250);
      } else {
        // No native BarcodeDetector — user must enter manually
        setCamError('Barcode-Erkennung wird in diesem Browser nicht unterstützt. Bitte manuell eingeben.');
        stopCamera();
        setScanning(false);
        return;
      }

      // Timeout
      timeoutRef.current = setTimeout(() => {
        setScanStatus('timeout');
        stopCamera();
        setScanning(false);
      }, SCAN_TIMEOUT_MS);

    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCamError('Kamera-Zugriff wurde verweigert. Bitte Berechtigung erteilen oder Code manuell eingeben.');
      } else {
        setCamError('Kamera konnte nicht gestartet werden. Bitte Code manuell eingeben.');
      }
      setScanning(false);
    }
  }, [field.barcodeFormats, onChange, stopCamera]);

  const closeScan = useCallback(() => {
    stopCamera();
    setScanning(false);
  }, [stopCamera]);

  const handleManualInput = useCallback((e) => {
    onChange(e.target.value);
    if (scanStatus === 'success') setScanStatus(null);
  }, [onChange, scanStatus]);

  const handleRescan = useCallback(() => {
    onChange('');
    setScanStatus(null);
    startScan();
  }, [onChange, startScan]);

  return (
    <div style={S_WRAPPER}>
      {/* Scan button / Success badge */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        {scanStatus === 'success' && value ? (
          <>
            <span style={S_SUCCESS_BADGE}>&#x2713; Code erkannt</span>
            <button type="button" onClick={handleRescan} style={{ ...S_SCAN_BTN, background: `${S.colors.primary}15`, color: S.colors.primary, fontSize: '13px', padding: '8px 14px' }}>
              Erneut scannen
            </button>
          </>
        ) : (
          <button type="button" onClick={startScan} style={S_SCAN_BTN} disabled={scanning}>
            {scanning ? 'Scanne...' : '📷 Barcode/QR scannen'}
          </button>
        )}
      </div>

      {/* Camera error */}
      {camError && <div style={S_ERROR_MSG}>{camError}</div>}

      {/* Timeout hint */}
      {scanStatus === 'timeout' && (
        <div style={{ ...S_ERROR_MSG, color: S.colors.warning, background: `${S.colors.warning}08` }}>
          Kein Barcode erkannt. Bitte erneut versuchen oder manuell eingeben.
        </div>
      )}

      {/* Manual input fallback */}
      <input
        type="text"
        value={value || ''}
        onChange={handleManualInput}
        placeholder={field.placeholder || 'Manuell eingeben oder scannen'}
        style={styles.input(!!error)}
      />

      {/* Camera overlay */}
      {scanning && (
        <div style={S_OVERLAY}>
          <button type="button" onClick={closeScan} style={S_CLOSE_BTN} aria-label="Scanner schließen">&#x2715;</button>
          <div style={S_VIDEO_CONTAINER}>
            <video ref={videoRef} playsInline muted style={S_VIDEO} />
            <div style={S_SCAN_FRAME} />
          </div>
          <div style={S_HINT}>Barcode oder QR-Code in den Rahmen halten</div>
        </div>
      )}
    </div>
  );
});

BarcodeField.displayName = 'BarcodeField';

export { BarcodeField };
export default BarcodeField;
