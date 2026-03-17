import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { S } from '../../config/theme';
import { FIELD_TYPE_ICONS } from '../../config/constants';
import { MiniToggle } from '../common/MiniToggle';
import { OptionsEditor } from './OptionsEditor';
import { ChecklistItemsEditor } from './ChecklistItemsEditor';

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
  useEffect(() => { if (field) setActiveTab('general'); }, [field?.id]);
  const upd = useCallback((key, value) => { if (field) onChange({ ...field, [key]: value }); }, [field, onChange]);
  const updV = useCallback((key, value) => { if (field) onChange({ ...field, validation: { ...(field.validation || {}), [key]: value } }); }, [field, onChange]);
  const referenceFields = useMemo(() => field ? allFields.filter(f => f.id !== field.id && !['heading', 'divider', 'info'].includes(f.type)) : [], [allFields, field?.id]);

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
          {field.type !== 'divider' && <><label style={S_LABEL}>Label</label><input value={field.label || ''} onChange={e => upd('label', e.target.value)} style={S_INPUT} autoFocus placeholder="Feldname" /></>}
          {!isDisplay && <><label style={S_LABEL}>Breite</label><div style={{ display: 'flex', gap: '4px' }}>{['full', 'half', 'third'].map(w => <button key={w} onClick={() => upd('width', w)} style={widthBtn(field.width, w)}>{w === 'full' ? 'Voll' : w === 'half' ? 'Halb' : 'Drittel'}</button>)}</div></>}
          {!isDisplay && <><label style={S_LABEL}>Pflichtfeld</label><MiniToggle value={field.required} onChange={v => upd('required', v)} /></>}
          {(field.type === 'text' || field.type === 'textarea' || field.type === 'number') && <><label style={S_LABEL}>Placeholder</label><input value={field.placeholder || ''} onChange={e => upd('placeholder', e.target.value)} style={S_INPUT} placeholder="Platzhaltertext..." /></>}
          {field.type === 'number' && <><label style={S_LABEL}>Einheit</label><input value={field.validation?.unit || ''} onChange={e => updV('unit', e.target.value)} style={S_INPUT} placeholder="z.B. kW, m²" /></>}
          {field.type === 'toggle' && <><label style={S_LABEL}>Label An</label><input value={field.labelOn || 'Ja'} onChange={e => upd('labelOn', e.target.value)} style={S_INPUT} /><label style={S_LABEL}>Label Aus</label><input value={field.labelOff || 'Nein'} onChange={e => upd('labelOff', e.target.value)} style={S_INPUT} /></>}
          {field.type === 'heading' && <><label style={S_LABEL}>Ebene</label><div style={{ display: 'flex', gap: '4px' }}>{['h2', 'h3', 'h4'].map(lv => <button key={lv} onClick={() => upd('level', lv)} style={widthBtn(field.level, lv)}>{lv.toUpperCase()}</button>)}</div></>}
          {field.type === 'info' && <><label style={S_LABEL}>Inhalt</label><textarea value={field.content || ''} onChange={e => upd('content', e.target.value)} style={{ ...S_INPUT, minHeight: '80px', resize: 'vertical' }} /></>}
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
          {field.type === 'repeater' && <>
            <label style={S_LABEL}>Max Einträge: {field.validation?.maxRows || 10}</label>
            <input type="range" min={1} max={50} value={field.validation?.maxRows || 10} onChange={e => updV('maxRows', Number(e.target.value))} style={{ width: '100%' }} />
            <label style={S_LABEL}>Spalten</label>
            {(field.subFields || []).map((sf, si) => (
              <div key={sf.id} style={{ display: 'flex', gap: '4px', marginBottom: '4px', alignItems: 'center' }}>
                <input value={sf.label} onChange={e => {
                  const sfs = [...(field.subFields || [])];
                  sfs[si] = { ...sfs[si], label: e.target.value };
                  upd('subFields', sfs);
                }} style={{ ...S_INPUT, flex: 1, marginBottom: 0 }} placeholder="Spaltenname" />
                <button onClick={() => { if ((field.subFields || []).length <= 1) return; upd('subFields', (field.subFields || []).filter((_, i) => i !== si)); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: (field.subFields || []).length <= 1 ? S.colors.border : S.colors.textMuted, fontSize: '14px' }}>✕</button>
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
            <label style={S_LABEL}>Regex-Pattern</label><input value={field.validation?.pattern || ''} onChange={e => updV('pattern', e.target.value)} style={S_INPUT} placeholder="z.B. ^[A-Z].*" />
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
