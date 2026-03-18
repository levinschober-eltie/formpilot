import { useState, useRef, useCallback, memo } from 'react';
import { S } from '../../config/theme';
import { styles } from '../../styles/shared';
import { dialog } from '../../lib/dialogService';

// ═══ FEATURE: Logo Upload Component ═══
const S_CONTAINER = { display: 'flex', flexDirection: 'column', gap: '12px' };
const S_PREVIEW = {
  maxWidth: '200px', maxHeight: '100px', objectFit: 'contain',
  border: `1px solid ${S.colors.border}`, borderRadius: S.radius.sm, padding: '8px',
  background: S.colors.bgInput,
};
const S_UPLOAD_AREA = {
  border: `2px dashed ${S.colors.border}`, borderRadius: S.radius.md,
  padding: '24px', textAlign: 'center', cursor: 'pointer',
  transition: S.transition, background: S.colors.bgInput,
};
const S_ACTIONS = { display: 'flex', gap: '8px' };

const compressImage = (file, maxW = 400, maxH = 200) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxW) { h = h * (maxW / w); w = maxW; }
        if (h > maxH) { w = w * (maxH / h); h = maxH; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const LogoUpload = memo(({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      dialog.alert({ title: 'Ungültiges Format', message: 'Bitte ein Bild auswählen (PNG, JPG, SVG).' });
      return;
    }
    setUploading(true);
    try {
      const base64 = await compressImage(file);
      onChange(base64);
    } catch {
      dialog.alert({ title: 'Fehler', message: 'Fehler beim Laden des Bildes.' });
    }
    setUploading(false);
    e.target.value = '';
  }, [onChange]);

  const handleRemove = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <div style={S_CONTAINER}>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        onChange={handleFile}
        style={{ display: 'none' }}
      />
      {value ? (
        <>
          <img src={value} alt="Firmenlogo" style={S_PREVIEW} />
          <div style={S_ACTIONS}>
            <button onClick={() => inputRef.current?.click()} style={styles.btn('secondary', 'sm')} disabled={uploading}>
              Logo ändern
            </button>
            <button onClick={handleRemove} style={{ ...styles.btn('ghost', 'sm'), color: S.colors.danger }}>
              Logo entfernen
            </button>
          </div>
        </>
      ) : (
        <div style={S_UPLOAD_AREA} onClick={() => inputRef.current?.click()}>
          <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }}>🖼</div>
          <div style={{ fontSize: '14px', color: S.colors.textSecondary }}>
            {uploading ? 'Wird geladen...' : 'Klicken zum Logo hochladen'}
          </div>
          <div style={{ fontSize: '12px', color: S.colors.textMuted, marginTop: '4px' }}>
            PNG, JPG oder SVG (max. 400x200px)
          </div>
        </div>
      )}
    </div>
  );
});

LogoUpload.displayName = 'LogoUpload';
