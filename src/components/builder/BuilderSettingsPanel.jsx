import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { S } from '../../config/theme';
import { FIELD_TYPE_ICONS } from '../../config/constants';
import { MiniToggle } from '../common/MiniToggle';
import { OptionsEditor } from './OptionsEditor';
import { ChecklistItemsEditor } from './ChecklistItemsEditor';
import { useDebounce } from '../../hooks/useDebounce';

// ═══ Debounced Input wrapper (P6) ═══
const DebouncedInput = ({ value, onChange, component: Comp = 'input', ...props }) => {
  const [local, setLocal] = useState(value);
  const debounced = useDebounce(local, 300);
  useEffect(() => { if (debounced !== value) onChange(debounced); }, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setLocal(value); }, [value]);
  return <Comp {...props} value={local} onChange={e => setLocal(e.target.value)} />;
};

// ═══ Extracted Styles (P4) ═══
const S_HEADER = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' };
const S_CLOSE = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: S.colors.textMuted };
const S_TABS = { display: 'flex', borderBottom: `1px solid ${S.colors.border}`, marginBottom: '12px' };
const S_INPUT = { width: '100%', padding: '8px 10px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };
const S_LABEL = { display: 'block', fontSize: '12px', fontWeight: 600, color: S.colors.textSecondary, marginBottom: '4px', marginTop: '12px' };
const S_EMPTY = { padding: '16px', textAlign: 'center', color: S.colors.textMuted, fontSize: '13px' };
const S_COND_CARD = { padding: '10px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, marginBottom: '8px', background: S.colors.bgInput };
const S_COND_HEADER = { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' };
const S_COND_REMOVE = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: S.colors.textMuted };
const S_COND_SELECT = { width: '100%', padding: '6px 8px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, fontSize: '12px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: '4px' };
const S_ADD_COND = { padding: '8px 12px', borderRadius: S.radius.sm, border: `1px dashed ${S.colors.border}`, background: 'transparent', color: S.colors.textMuted, cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', width: '100%' };
const S_SLOT_CARD = { padding: '8px 10px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, marginBottom: '6px', background: S.colors.bgInput };
const S_SLOT_ROW = { display: 'flex', gap: '6px', alignItems: 'center' };
const S_SLOT_REMOVE = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: S.colors.textMuted, flexShrink: 0 };

const tabStyle = (id, activeTab) => ({
  flex: 1, padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: activeTab === id ? 700 : 500,
  border: 'none', borderBottom: `2px solid ${activeTab === id ? S.colors.primary : 'transparent'}`,
  background: 'none', color: activeTab === id ? S.colors.primary : S.colors.textSecondary, cursor: 'pointer', fontFamily: 'inherit',
});
const widthBtn = (current, w) => ({
  flex: 1, padding: '6px', borderRadius: S.radius.sm, fontSize: '12px', fontWeight: 600,
  border: `1.5px solid ${current === w ? S.colors.primary : S.colors.border}`,
  background: current === w ? `${S.colors.primary}10` : 'transparent',
  color: current === w ? S.colors.primary : S.colors.textSecondary, cursor: 'pointer', fontFamily: 'inherit',
});

const getOps = (refType) => {
  switch (refType) {
    case 'text': case 'textarea': return [{ v: 'equals', l: 'ist gleich' }, { v: 'notEquals', l: 'ist nicht' }, { v: 'contains', l: 'enthält' }, { v: 'isEmpty', l: 'ist leer' }, { v: 'isNotEmpty', l: 'ist nicht leer' }];
    case 'number': case 'rating': return [{ v: 'equals', l: 'ist gleich' }, { v: 'notEquals', l: 'ist nicht' }, { v: 'gt', l: 'größer als' }, { v: 'lt', l: 'kleiner als' }];
    case 'toggle': return [{ v: 'equals', l: 'ist gleich' }];
    case 'select': case 'radio': return [{ v: 'equals', l: 'ist gleich' }, { v: 'notEquals', l: 'ist nicht' }];
    default: return [{ v: 'equals', l: 'ist gleich' }, { v: 'isEmpty', l: 'ist leer' }];
  }
};

export const BuilderSettingsPanel = React.memo(({ field, allFields, onChange, onClose }) => {
  const [activeTab, setActiveTab] = useState('general');
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (field) setActiveTab('general'); }, [field?.id]);
  const upd = useCallback((key, value) => { if (field) onChange({ ...field, [key]: value }); }, [field, onChange]);
  const updV = useCallback((key, value) => { if (field) onChange({ ...field, validation: { ...(field.validation || {}), [key]: value } }); }, [field, onChange]);
  const referenceFields = useMemo(() => field ? allFields.filter(f => f.id !== field.id && !['heading', 'divider', 'info'].includes(f.type)) : [], [allFields, field]);

  if (!field) return null;

  const isDisplay = ['heading', 'divider', 'info'].includes(field.type);
  const hasOptions = ['select', 'radio', 'checkbox'].includes(field.type);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={S_HEADER}>
        <span style={{ fontWeight: 700, fontSize: '14px' }}>{FIELD_TYPE_ICONS[field.type] || '📋'} {field.type}</span>
        <button onClick={onClose} style={S_CLOSE}>✕</button>
      </div>
      <div style={S_TABS}>
        <button style={tabStyle('general', activeTab)} onClick={() => setActiveTab('general')}>Allgemein</button>
        {!isDisplay && <button style={tabStyle('validation', activeTab)} onClick={() => setActiveTab('validation')}>Validierung</button>}
        <button style={tabStyle('conditions', activeTab)} onClick={() => setActiveTab('conditions')}>Bedingungen</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '16px' }}>

        {activeTab === 'general' && <>
          {field.type !== 'divider' && <><label style={S_LABEL}>Label</label><DebouncedInput value={field.label || ''} onChange={v => upd('label', v)} style={S_INPUT} autoFocus placeholder="Feldname" /></>}
          {!isDisplay && <><label style={S_LABEL}>Breite</label><div style={{ display: 'flex', gap: '4px' }}>{['full', 'half', 'third'].map(w => <button key={w} onClick={() => upd('width', w)} style={widthBtn(field.width, w)}>{w === 'full' ? 'Voll' : w === 'half' ? 'Halb' : 'Drittel'}</button>)}</div></>}
          {!isDisplay && <><label style={S_LABEL}>Pflichtfeld</label><MiniToggle value={field.required} onChange={v => upd('required', v)} /></>}
          {(field.type === 'text' || field.type === 'textarea' || field.type === 'number') && <><label style={S_LABEL}>Placeholder</label><DebouncedInput value={field.placeholder || ''} onChange={v => upd('placeholder', v)} style={S_INPUT} placeholder="Platzhaltertext..." /></>}
          {field.type === 'number' && <><label style={S_LABEL}>Einheit</label><DebouncedInput value={field.validation?.unit || ''} onChange={v => updV('unit', v)} style={S_INPUT} placeholder="z.B. kW, m²" /></>}
          {field.type === 'toggle' && <><label style={S_LABEL}>Label An</label><DebouncedInput value={field.labelOn || 'Ja'} onChange={v => upd('labelOn', v)} style={S_INPUT} /><label style={S_LABEL}>Label Aus</label><DebouncedInput value={field.labelOff || 'Nein'} onChange={v => upd('labelOff', v)} style={S_INPUT} /></>}
          {field.type === 'heading' && <><label style={S_LABEL}>Ebene</label><div style={{ display: 'flex', gap: '4px' }}>{['h2', 'h3', 'h4'].map(lv => <button key={lv} onClick={() => upd('level', lv)} style={widthBtn(field.level, lv)}>{lv.toUpperCase()}</button>)}</div></>}
          {field.type === 'info' && <><label style={S_LABEL}>Inhalt</label><DebouncedInput component="textarea" value={field.content || ''} onChange={v => upd('content', v)} style={{ ...S_INPUT, minHeight: '80px', resize: 'vertical' }} /></>}
          {hasOptions && <><label style={S_LABEL}>Optionen (min. 2)</label><OptionsEditor options={field.options || []} onChange={o => upd('options', o)} /></>}
          {field.type === 'checklist' && <><label style={S_LABEL}>Prüfpunkte</label><ChecklistItemsEditor items={field.items || []} onChange={i => upd('items', i)} /><label style={S_LABEL}>Notizen erlauben</label><MiniToggle value={field.allowNotes} onChange={v => upd('allowNotes', v)} /></>}
          {field.type === 'rating' && <>
            <label style={S_LABEL}>Typ</label>
            <div style={{ display: 'flex', gap: '4px' }}>{[{ v: 'stars', l: 'Sterne' }, { v: 'traffic', l: 'Ampel' }].map(rt => <button key={rt.v} onClick={() => upd('ratingType', rt.v)} style={widthBtn(field.ratingType, rt.v)}>{rt.l}</button>)}</div>
            {field.ratingType !== 'traffic' && <><label style={S_LABEL}>Max Sterne: {field.maxStars || 5}</label><input type="range" min={3} max={10} value={field.maxStars || 5} onChange={e => upd('maxStars', Number(e.target.value))} style={{ width: '100%' }} /></>}
          </>}
          {field.type === 'photo' && <>
            <label style={S_LABEL}>Max Fotos: {field.validation?.maxPhotos || 5}</label>
            <input type="range" min={1} max={10} value={field.validation?.maxPhotos || 5} onChange={e => updV('maxPhotos', Number(e.target.value))} style={{ width: '100%' }} />
          </>}
          {field.type === 'signature' && <>
            <label style={S_LABEL}>Multi-Signatur</label>
            <MiniToggle value={!!field.multiSignature} onChange={v => {
              const updates = { ...field, multiSignature: v };
              if (v && (!field.signatureSlots || field.signatureSlots.length === 0)) {
                updates.signatureSlots = [
                  { id: `sig-${Date.now()}-1`, label: 'Auftragnehmer', required: true },
                  { id: `sig-${Date.now()}-2`, label: 'Auftraggeber', required: true },
                ];
              }
              onChange(updates);
            }} />
            {field.multiSignature && <>
              <label style={S_LABEL}>Signatur-Slots</label>
              {(field.signatureSlots || []).map((slot, si) => (
                <div key={slot.id} style={S_SLOT_CARD}>
                  <div style={S_SLOT_ROW}>
                    <input value={slot.label || ''} onChange={e => {
                      const slots = [...(field.signatureSlots || [])];
                      slots[si] = { ...slots[si], label: e.target.value };
                      upd('signatureSlots', slots);
                    }} style={{ ...S_INPUT, flex: 1, marginBottom: 0 }} placeholder="Slot-Label" />
                    <button onClick={() => {
                      if ((field.signatureSlots || []).length <= 1) return;
                      upd('signatureSlots', (field.signatureSlots || []).filter((_, i) => i !== si));
                    }} style={{ ...S_SLOT_REMOVE, color: (field.signatureSlots || []).length <= 1 ? S.colors.border : S.colors.textMuted }}>✕</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                    <span style={{ fontSize: '11px', color: S.colors.textSecondary }}>Pflicht</span>
                    <MiniToggle value={!!slot.required} onChange={v => {
                      const slots = [...(field.signatureSlots || [])];
                      slots[si] = { ...slots[si], required: v };
                      upd('signatureSlots', slots);
                    }} />
                  </div>
                </div>
              ))}
              {(field.signatureSlots || []).length < 5 && (
                <button onClick={() => {
                  const id = `sig-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
                  upd('signatureSlots', [...(field.signatureSlots || []), { id, label: `Unterschrift ${(field.signatureSlots || []).length + 1}`, required: false }]);
                }} style={S_ADD_COND}>＋ Slot hinzufügen</button>
              )}
            </>}
          </>}
          {field.type === 'barcode' && <>
            <label style={S_LABEL}>Placeholder</label>
            <DebouncedInput value={field.placeholder || ''} onChange={v => upd('placeholder', v)} style={S_INPUT} placeholder="Manuell eingeben oder scannen" />
            <label style={S_LABEL}>Erlaubte Formate</label>
            {[
              { value: 'qr_code', label: 'QR-Code' },
              { value: 'code_128', label: 'Code 128' },
              { value: 'code_39', label: 'Code 39' },
              { value: 'ean_13', label: 'EAN-13' },
              { value: 'ean_8', label: 'EAN-8' },
              { value: 'upc_a', label: 'UPC-A' },
            ].map(fmt => {
              const formats = field.barcodeFormats || ['qr_code', 'code_128', 'ean_13'];
              const checked = formats.includes(fmt.value);
              return (
                <label key={fmt.value} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginBottom: '4px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={checked} onChange={() => {
                    const next = checked ? formats.filter(f => f !== fmt.value) : [...formats, fmt.value];
                    upd('barcodeFormats', next.length ? next : ['qr_code']);
                  }} />
                  {fmt.label}
                </label>
              );
            })}
          </>}
          {field.type === 'gps' && <>
            <label style={S_LABEL}>Automatisch erfassen</label>
            <MiniToggle value={field.autoCapture || false} onChange={v => upd('autoCapture', v)} />
            <label style={S_LABEL}>Karten-Link anzeigen</label>
            <MiniToggle value={field.showMap !== false} onChange={v => upd('showMap', v)} />
            <label style={S_LABEL}>Hohe Genauigkeit (GPS)</label>
            <MiniToggle value={field.highAccuracy !== false} onChange={v => upd('highAccuracy', v)} />
          </>}
          {field.type === 'repeater' && <>
            <label style={S_LABEL}>Max Einträge: {field.validation?.maxRows || 10}</label>
            <input type="range" min={1} max={50} value={field.validation?.maxRows || 10} onChange={e => updV('maxRows', Number(e.target.value))} style={{ width: '100%' }} />
            <label style={S_LABEL}>Spalten</label>
            {(field.subFields || []).map((sf, si) => (
              <div key={sf.id} style={{ marginBottom: '6px', padding: '6px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, background: S.colors.bgInput }}>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <input value={sf.label} onChange={e => {
                    const sfs = [...(field.subFields || [])];
                    sfs[si] = { ...sfs[si], label: e.target.value };
                    upd('subFields', sfs);
                  }} style={{ ...S_INPUT, flex: 1, marginBottom: 0 }} placeholder="Spaltenname" />
                  <select value={sf.type || 'text'} onChange={e => {
                    const sfs = [...(field.subFields || [])];
                    sfs[si] = { ...sfs[si], type: e.target.value };
                    upd('subFields', sfs);
                  }} style={{ ...S_COND_SELECT, width: 'auto', flex: '0 0 90px', marginBottom: 0 }}>
                    <option value="text">Text</option>
                    <option value="number">Zahl</option>
                    <option value="date">Datum</option>
                    <option value="select">Auswahl</option>
                    <option value="toggle">Toggle</option>
                  </select>
                  <button onClick={() => { if ((field.subFields || []).length <= 1) return; upd('subFields', (field.subFields || []).filter((_, i) => i !== si)); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: (field.subFields || []).length <= 1 ? S.colors.border : S.colors.textMuted, fontSize: '14px', flexShrink: 0 }}>✕</button>
                </div>
                {(sf.type === 'select') && (
                  <input value={sf.options || ''} onChange={e => {
                    const sfs = [...(field.subFields || [])];
                    sfs[si] = { ...sfs[si], options: e.target.value };
                    upd('subFields', sfs);
                  }} style={{ ...S_INPUT, marginTop: '4px', fontSize: '11px' }} placeholder="Optionen (kommagetrennt): Option 1, Option 2, Option 3" />
                )}
              </div>
            ))}
            <button onClick={() => {
              const id = `sf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
              upd('subFields', [...(field.subFields || []), { id, label: `Spalte ${(field.subFields || []).length + 1}`, type: 'text', placeholder: '' }]);
            }} style={S_ADD_COND}>＋ Spalte hinzufügen</button>
          </>}
        </>}

        {activeTab === 'validation' && <>
          {(field.type === 'text' || field.type === 'textarea') && <>
            <label style={S_LABEL}>Min. Zeichen</label><input type="number" min={0} value={field.validation?.minLength || ''} onChange={e => updV('minLength', e.target.value ? Number(e.target.value) : undefined)} style={S_INPUT} />
            <label style={S_LABEL}>Max. Zeichen</label><input type="number" min={0} value={field.validation?.maxLength || ''} onChange={e => updV('maxLength', e.target.value ? Number(e.target.value) : undefined)} style={S_INPUT} />
            <label style={S_LABEL}>Regex-Pattern</label><DebouncedInput value={field.validation?.pattern || ''} onChange={v => updV('pattern', v)} style={S_INPUT} placeholder="z.B. ^[A-Z].*" />
          </>}
          {field.type === 'number' && <>
            <label style={S_LABEL}>Minimum</label><input type="number" value={field.validation?.min ?? ''} onChange={e => updV('min', e.target.value === '' ? undefined : Number(e.target.value))} style={S_INPUT} />
            <label style={S_LABEL}>Maximum</label><input type="number" value={field.validation?.max ?? ''} onChange={e => updV('max', e.target.value === '' ? undefined : Number(e.target.value))} style={S_INPUT} />
            <label style={S_LABEL}>Dezimalstellen</label><input type="number" min={0} max={6} value={field.validation?.decimals ?? ''} onChange={e => updV('decimals', e.target.value === '' ? undefined : Number(e.target.value))} style={S_INPUT} />
          </>}
          {field.type === 'date' && <><label style={S_LABEL}>Heute als Standard</label><MiniToggle value={field.validation?.defaultToday} onChange={v => updV('defaultToday', v)} /></>}
          {field.type === 'checkbox' && <>
            <label style={S_LABEL}>Min. Auswahl</label><input type="number" min={0} value={field.validation?.minSelect ?? ''} onChange={e => updV('minSelect', e.target.value === '' ? undefined : Number(e.target.value))} style={S_INPUT} />
            <label style={S_LABEL}>Max. Auswahl</label><input type="number" min={0} value={field.validation?.maxSelect ?? ''} onChange={e => updV('maxSelect', e.target.value === '' ? undefined : Number(e.target.value))} style={S_INPUT} />
          </>}
          {!['text', 'textarea', 'number', 'date', 'checkbox'].includes(field.type) && <div style={S_EMPTY}>Keine Validierungsoptionen für diesen Feldtyp.</div>}
        </>}

        {activeTab === 'conditions' && <>
          <p style={{ fontSize: '12px', color: S.colors.textSecondary, marginBottom: '12px' }}>Feld anzeigen/ausblenden basierend auf anderen Feldern.</p>
          {(field.conditions || []).map((cond, ci) => {
            const ref = referenceFields.find(f => f.id === cond.field);
            const ops = ref ? getOps(ref.type) : [{ v: 'equals', l: 'ist gleich' }];
            return (
              <div key={ci} style={S_COND_CARD}>
                <div style={S_COND_HEADER}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: S.colors.textMuted }}>Wenn</span>
                  <button onClick={() => { const n = [...(field.conditions || [])]; n.splice(ci, 1); upd('conditions', n); }} style={S_COND_REMOVE}>✕</button>
                </div>
                <select value={cond.field || ''} onChange={e => { const n = [...(field.conditions || [])]; n[ci] = { ...n[ci], field: e.target.value, value: '' }; upd('conditions', n); }} style={S_COND_SELECT}>
                  <option value="">— Feld wählen —</option>
                  {referenceFields.map(rf => <option key={rf.id} value={rf.id}>{rf.label || rf.type}</option>)}
                </select>
                <select value={cond.operator || 'equals'} onChange={e => { const n = [...(field.conditions || [])]; n[ci] = { ...n[ci], operator: e.target.value }; upd('conditions', n); }} style={S_COND_SELECT}>
                  {ops.map(op => <option key={op.v} value={op.v}>{op.l}</option>)}
                </select>
                {!['isEmpty', 'isNotEmpty'].includes(cond.operator) && (
                  ref?.type === 'toggle' ? (
                    <select value={String(cond.value)} onChange={e => { const n = [...(field.conditions || [])]; n[ci] = { ...n[ci], value: e.target.value === 'true' }; upd('conditions', n); }} style={S_COND_SELECT}><option value="true">Ja</option><option value="false">Nein</option></select>
                  ) : ref?.options ? (
                    <select value={cond.value || ''} onChange={e => { const n = [...(field.conditions || [])]; n[ci] = { ...n[ci], value: e.target.value }; upd('conditions', n); }} style={S_COND_SELECT}><option value="">— Wert —</option>{ref.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                  ) : (
                    <input value={cond.value ?? ''} onChange={e => { const n = [...(field.conditions || [])]; n[ci] = { ...n[ci], value: ref?.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value }; upd('conditions', n); }} type={ref?.type === 'number' ? 'number' : 'text'} placeholder="Wert" style={{ ...S_INPUT, fontSize: '12px', padding: '6px 8px' }} />
                  )
                )}
                <select value={cond.action || 'show'} onChange={e => { const n = [...(field.conditions || [])]; n[ci] = { ...n[ci], action: e.target.value }; upd('conditions', n); }} style={S_COND_SELECT}>
                  <option value="show">Anzeigen</option><option value="hide">Ausblenden</option><option value="require">Pflichtfeld machen</option><option value="disable">Deaktivieren</option>
                </select>
              </div>
            );
          })}
          {(field.conditions || []).length > 1 && (
            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: S.colors.textSecondary, alignSelf: 'center' }}>Verknüpfung:</span>
              {['AND', 'OR'].map(l => <button key={l} onClick={() => upd('conditionLogic', l)} style={widthBtn(field.conditionLogic, l)}>{l === 'AND' ? 'UND' : 'ODER'}</button>)}
            </div>
          )}
          <button onClick={() => upd('conditions', [...(field.conditions || []), { field: '', operator: 'equals', value: '', action: 'show' }])} style={S_ADD_COND}>＋ Bedingung hinzufügen</button>
        </>}
      </div>
    </div>
  );
});

BuilderSettingsPanel.displayName = 'BuilderSettingsPanel';
