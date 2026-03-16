import { useRef, useState, useCallback } from 'react';
import { S } from '../../config/theme';

// ═══ FEATURE: Photo Capture & Upload ═══
const S_WRAP = { display: 'flex', flexDirection: 'column', gap: '8px' };
const S_DROP_ZONE = (hasError, isDragging) => ({
  borderRadius: S.radius.md, border: `2px dashed ${hasError ? S.colors.danger : isDragging ? S.colors.primary : S.colors.border}`,
  background: isDragging ? `${S.colors.primary}08` : S.colors.bgInput, padding: '24px',
  textAlign: 'center', cursor: 'pointer', transition: S.transition,
});
const S_BTNS = { display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' };
const S_BTN = (variant) => ({
  padding: '8px 16px', borderRadius: S.radius.sm, fontSize: '13px', fontWeight: 600,
  border: variant === 'primary' ? 'none' : `1px solid ${S.colors.border}`,
  background: variant === 'primary' ? S.colors.primary : S.colors.bgInput,
  color: variant === 'primary' ? '#fff' : S.colors.textSecondary,
  cursor: 'pointer', fontFamily: 'inherit',
});
const S_PREVIEW_GRID = { display: 'flex', flexWrap: 'wrap', gap: '8px' };
const S_PREVIEW_ITEM = {
  position: 'relative', width: '80px', height: '80px', borderRadius: S.radius.sm,
  overflow: 'hidden', border: `1px solid ${S.colors.border}`,
};
const S_PREVIEW_IMG = { width: '100%', height: '100%', objectFit: 'cover' };
const S_REMOVE = {
  position: 'absolute', top: 2, right: 2, width: 20, height: 20, borderRadius: '50%',
  background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', cursor: 'pointer',
  fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export const PhotoField = ({ field, value, onChange, error }) => {
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const photos = Array.isArray(value) ? value : value ? [value] : [];
  const maxPhotos = field.validation?.maxPhotos || 5;

  const addPhotos = useCallback(async (files) => {
    const remaining = maxPhotos - photos.length;
    const toProcess = Array.from(files).slice(0, remaining);
    const compressed = await Promise.all(toProcess.map(f => compressImage(f)));
    const updated = [...photos, ...compressed];
    onChange(updated.length === 1 ? updated[0] : updated);
  }, [photos, maxPhotos, onChange]);

  const removePhoto = useCallback((idx) => {
    const updated = photos.filter((_, i) => i !== idx);
    onChange(updated.length === 0 ? null : updated.length === 1 ? updated[0] : updated);
  }, [photos, onChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setIsDragging(false);
    const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'));
    if (files.length) addPhotos(files);
  }, [addPhotos]);

  return (
    <div style={S_WRAP}>
      {photos.length > 0 && (
        <div style={S_PREVIEW_GRID}>
          {photos.map((src, i) => (
            <div key={i} style={S_PREVIEW_ITEM}>
              <img src={src} alt={`Foto ${i + 1}`} style={S_PREVIEW_IMG} />
              <button onClick={() => removePhoto(i)} style={S_REMOVE}>✕</button>
            </div>
          ))}
        </div>
      )}
      {photos.length < maxPhotos && (
        <div style={S_DROP_ZONE(error, isDragging)}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}>
          <div style={{ fontSize: '28px', marginBottom: '4px', opacity: 0.5 }}>📷</div>
          <div style={{ fontSize: '13px', color: S.colors.textSecondary }}>
            Foto aufnehmen oder hochladen
          </div>
          <div style={{ fontSize: '11px', color: S.colors.textMuted, marginTop: '2px' }}>
            {photos.length}/{maxPhotos} Fotos
          </div>
          <div style={S_BTNS}>
            <button type="button" onClick={(e) => { e.stopPropagation(); cameraRef.current?.click(); }} style={S_BTN('primary')}>
              📸 Kamera
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} style={S_BTN('secondary')}>
              📁 Datei
            </button>
          </div>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" multiple hidden
        onChange={(e) => { if (e.target.files.length) addPhotos(e.target.files); e.target.value = ''; }} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden
        onChange={(e) => { if (e.target.files.length) addPhotos(e.target.files); e.target.value = ''; }} />
    </div>
  );
};
