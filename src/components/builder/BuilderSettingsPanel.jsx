import { useState } from 'react';
import { S } from '../../config/theme';
import { FIELD_TYPE_ICONS } from '../../config/constants';
import { MiniToggle } from '../common/MiniToggle';
import { OptionsEditor } from './OptionsEditor';
import { ChecklistItemsEditor } from './ChecklistItemsEditor';

export const BuilderSettingsPanel = ({ field, allFields, onChange, onClose }) => {
  const [activeTab, setActiveTab] = useState('general');
  if (!field) return null;
  const upd = (key, value) => onChange({ ...field, [key]: value });
  const updV = (key, value) => onChange({ ...field, validation: { ...(field.validation || {}), [key]: value } });
  const isDisplay = ['heading', 'divider', 'info'].includes(field.type);
  const hasOptions = ['select', 'radio', 'checkbox'].includes(field.type);
  const referenceFields = allFields.filter(f => f.id !== field.id && !['heading', 'divider', 'info'].includes(f.type));
  const sI = { width: '100%', padding: '8px 10px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };
  const sL = { display: 'block', fontSize: '12px', fontWeight: 600, color: S.colors.textSecondary, marginBottom: '4px', marginTop: '12px' };
  const tabS = (id) => ({ flex: 1, padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: activeTab === id ? 700 : 500, border: 'none', borderBottom: `2px solid ${activeTab === id ? S.colors.primary : 'transparent'}`, background: 'none', color: activeTab === id ? S.colors.primary : S.colors.textSecondary, cursor: 'pointer', fontFamily: 'inherit' });

  const getOps = (refType) => {
    switch (refType) {
      case 'text': case 'textarea': return [{ v: 'equals', l: 'ist gleich' }, { v: 'notEquals', l: 'ist nicht' }, { v: 'contains', l: 'enthält' }, { v: 'isEmpty', l: 'ist leer' }, { v: 'isNotEmpty', l: 'ist nicht leer' }];
      case 'number': case 'rating': return [{ v: 'equals', l: 'ist gleich' }, { v: 'notEquals', l: 'ist nicht' }, { v: 'gt', l: 'größer als' }, { v: 'lt', l: 'kleiner als' }];
      case 'toggle': return [{ v: 'equals', l: 'ist gleich' }];
      case 'select': case 'radio': return [{ v: 'equals', l: 'ist gleich' }, { v: 'notEquals', l: 'ist nicht' }];
      default: return [{ v: 'equals', l: 'ist gleich' }, { v: 'isEmpty', l: 'ist leer' }];
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontWeight: 700, fontSize: '14px' }}>{FIELD_TYPE_ICONS[field.type] || '📋'} {field.type}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: S.colors.textMuted }}>✕</button>
      </div>
      <div style={{ display: 'flex', borderBottom: `1px solid ${S.colors.border}`, marginBottom: '12px' }}>
        <button style={tabS('general')} onClick={() => setActiveTab('general')}>Allgemein</button>
        {!isDisplay && <button style={tabS('validation')} onClick={() => setActiveTab('validation')}>Validierung</button>}
        <button style={tabS('conditions')} onClick={() => setActiveTab('conditions')}>Bedingungen</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '16px' }}>

        {activeTab === 'general' && <>
          {field.type !== 'divider' && <><label style={sL}>Label</label><input value={field.label || ''} onChange={e => upd('label', e.target.value)} style={sI} autoFocus placeholder="Feldname" /></>}
          {!isDisplay && <><label style={sL}>Breite</label><div style={{ display: 'flex', gap: '4px' }}>{['full', 'half', 'third'].map(w => <button key={w} onClick={() => upd('width', w)} style={{ flex: 1, padding: '6px', borderRadius: S.radius.sm, fontSize: '12px', fontWeight: 600, border: `1.5px solid ${field.width === w ? S.colors.primary : S.colors.border}`, background: field.width === w ? `${S.colors.primary}10` : 'transparent', color: field.width === w ? S.colors.primary : S.colors.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>{w === 'full' ? 'Voll' : w === 'half' ? 'Halb' : 'Drittel'}</button>)}</div></>}
          {!isDisplay && <><label style={sL}>Pflichtfeld</label><MiniToggle value={field.required} onChange={v => upd('required', v)} /></>}
          {(field.type === 'text' || field.type === 'textarea' || field.type === 'number') && <><label style={sL}>Placeholder</label><input value={field.placeholder || ''} onChange={e => upd('placeholder', e.target.value)} style={sI} placeholder="Platzhaltertext..." /></>}
          {field.type === 'number' && <><label style={sL}>Einheit</label><input value={field.validation?.unit || ''} onChange={e => updV('unit', e.target.value)} style={sI} placeholder="z.B. kW, m²" /></>}
          {field.type === 'toggle' && <><label style={sL}>Label An</label><input value={field.labelOn || 'Ja'} onChange={e => upd('labelOn', e.target.value)} style={sI} /><label style={sL}>Label Aus</label><input value={field.labelOff || 'Nein'} onChange={e => upd('labelOff', e.target.value)} style={sI} /></>}
          {field.type === 'heading' && <><label style={sL}>Ebene</label><div style={{ display: 'flex', gap: '4px' }}>{['h2', 'h3', 'h4'].map(lv => <button key={lv} onClick={() => upd('level', lv)} style={{ flex: 1, padding: '6px', borderRadius: S.radius.sm, fontSize: '12px', fontWeight: 600, border: `1.5px solid ${field.level === lv ? S.colors.primary : S.colors.border}`, background: field.level === lv ? `${S.colors.primary}10` : 'transparent', color: field.level === lv ? S.colors.primary : S.colors.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>{lv.toUpperCase()}</button>)}</div></>}
          {field.type === 'info' && <><label style={sL}>Inhalt</label><textarea value={field.content || ''} onChange={e => upd('content', e.target.value)} style={{ ...sI, minHeight: '80px', resize: 'vertical' }} /></>}
          {hasOptions && <><label style={sL}>Optionen (min. 2)</label><OptionsEditor options={field.options || []} onChange={o => upd('options', o)} /></>}
          {field.type === 'checklist' && <><label style={sL}>Prüfpunkte</label><ChecklistItemsEditor items={field.items || []} onChange={i => upd('items', i)} /><label style={sL}>Notizen erlauben</label><MiniToggle value={field.allowNotes} onChange={v => upd('allowNotes', v)} /></>}
          {field.type === 'rating' && <>
            <label style={sL}>Typ</label>
            <div style={{ display: 'flex', gap: '4px' }}>{[{ v: 'stars', l: '⭐ Sterne' }, { v: 'traffic', l: '🚦 Ampel' }].map(rt => <button key={rt.v} onClick={() => upd('ratingType', rt.v)} style={{ flex: 1, padding: '6px', borderRadius: S.radius.sm, fontSize: '12px', fontWeight: 600, border: `1.5px solid ${field.ratingType === rt.v ? S.colors.primary : S.colors.border}`, background: field.ratingType === rt.v ? `${S.colors.primary}10` : 'transparent', color: field.ratingType === rt.v ? S.colors.primary : S.colors.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>{rt.l}</button>)}</div>
            {field.ratingType !== 'traffic' && <><label style={sL}>Max Sterne: {field.maxStars || 5}</label><input type="range" min={3} max={10} value={field.maxStars || 5} onChange={e => upd('maxStars', Number(e.target.value))} style={{ width: '100%' }} /></>}
          </>}
        </>}

        {activeTab === 'validation' && <>
          {(field.type === 'text' || field.type === 'textarea') && <>
            <label style={sL}>Min. Zeichen</label><input type="number" min={0} value={field.validation?.minLength || ''} onChange={e => updV('minLength', e.target.value ? Number(e.target.value) : undefined)} style={sI} />
            <label style={sL}>Max. Zeichen</label><input type="number" min={0} value={field.validation?.maxLength || ''} onChange={e => updV('maxLength', e.target.value ? Number(e.target.value) : undefined)} style={sI} />
            <label style={sL}>Regex-Pattern</label><input value={field.validation?.pattern || ''} onChange={e => updV('pattern', e.target.value)} style={sI} placeholder="z.B. ^[A-Z].*" />
          </>}
          {field.type === 'number' && <>
            <label style={sL}>Minimum</label><input type="number" value={field.validation?.min ?? ''} onChange={e => updV('min', e.target.value === '' ? undefined : Number(e.target.value))} style={sI} />
            <label style={sL}>Maximum</label><input type="number" value={field.validation?.max ?? ''} onChange={e => updV('max', e.target.value === '' ? undefined : Number(e.target.value))} style={sI} />
            <label style={sL}>Dezimalstellen</label><input type="number" min={0} max={6} value={field.validation?.decimals ?? ''} onChange={e => updV('decimals', e.target.value === '' ? undefined : Number(e.target.value))} style={sI} />
          </>}
          {field.type === 'date' && <><label style={sL}>Heute als Standard</label><MiniToggle value={field.validation?.defaultToday} onChange={v => updV('defaultToday', v)} /></>}
          {field.type === 'checkbox' && <>
            <label style={sL}>Min. Auswahl</label><input type="number" min={0} value={field.validation?.minSelect ?? ''} onChange={e => updV('minSelect', e.target.value === '' ? undefined : Number(e.target.value))} style={sI} />
            <label style={sL}>Max. Auswahl</label><input type="number" min={0} value={field.validation?.maxSelect ?? ''} onChange={e => updV('maxSelect', e.target.value === '' ? undefined : Number(e.target.value))} style={sI} />
          </>}
          {!['text', 'textarea', 'number', 'date', 'checkbox'].includes(field.type) && <div style={{ padding: '16px', textAlign: 'center', color: S.colors.textMuted, fontSize: '13px' }}>Keine Validierungsoptionen für diesen Feldtyp.</div>}
        </>}

        {activeTab === 'conditions' && <>
          <p style={{ fontSize: '12px', color: S.colors.textSecondary, marginBottom: '12px' }}>Feld anzeigen/ausblenden basierend auf anderen Feldern.</p>
          {(field.conditions || []).map((cond, ci) => {
            const ref = referenceFields.find(f => f.id === cond.field);
            const ops = ref ? getOps(ref.type) : [{ v: 'equals', l: 'ist gleich' }];
            return (
              <div key={ci} style={{ padding: '10px', borderRadius: S.radius.sm, border: `1px solid ${S.colors.border}`, marginBottom: '8px', background: S.colors.bgInput }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: S.colors.textMuted }}>Wenn</span>
                  <button onClick={() => { const n = [...(field.conditions || [])]; n.splice(ci, 1); upd('conditions', n); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: S.colors.textMuted }}>✕</button>
                </div>
                <select value={cond.field || ''} onChange={e => { const n = [...(field.conditions || [])]; n[ci] = { ...n[ci], field: e.target.value, value: '' }; upd('conditions', n); }} style={{ ...sI, marginBottom: '4px', fontSize: '12px', padding: '6px 8px' }}>
                  <option value="">— Feld wählen —</option>
                  {referenceFields.map(rf => <option key={rf.id} value={rf.id}>{rf.label || rf.type}</option>)}
                </select>
                <select value={cond.operator || 'equals'} onChange={e => { const n = [...(field.conditions || [])]; n[ci] = { ...n[ci], operator: e.target.value }; upd('conditions', n); }} style={{ ...sI, marginBottom: '4px', fontSize: '12px', padding: '6px 8px' }}>
                  {ops.map(op => <option key={op.v} value={op.v}>{op.l}</option>)}
                </select>
                {!['isEmpty', 'isNotEmpty'].includes(cond.operator) && (
                  ref?.type === 'toggle' ? (
                    <select value={String(cond.value)} onChange={e => { const n = [...(field.conditions || [])]; n[ci] = { ...n[ci], value: e.target.value === 'true' }; upd('conditions', n); }} style={{ ...sI, marginBottom: '4px', fontSize: '12px', padding: '6px 8px' }}><option value="true">Ja</option><option value="false">Nein</option></select>
                  ) : ref?.options ? (
                    <select value={cond.value || ''} onChange={e => { const n = [...(field.conditions || [])]; n[ci] = { ...n[ci], value: e.target.value }; upd('conditions', n); }} style={{ ...sI, marginBottom: '4px', fontSize: '12px', padding: '6px 8px' }}><option value="">— Wert —</option>{ref.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                  ) : (
                    <input value={cond.value ?? ''} onChange={e => { const n = [...(field.conditions || [])]; n[ci] = { ...n[ci], value: ref?.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value }; upd('conditions', n); }} type={ref?.type === 'number' ? 'number' : 'text'} placeholder="Wert" style={{ ...sI, fontSize: '12px', padding: '6px 8px' }} />
                  )
                )}
                <select value={cond.action || 'show'} onChange={e => { const n = [...(field.conditions || [])]; n[ci] = { ...n[ci], action: e.target.value }; upd('conditions', n); }} style={{ ...sI, fontSize: '12px', padding: '6px 8px' }}>
                  <option value="show">Anzeigen</option><option value="hide">Ausblenden</option><option value="require">Pflichtfeld machen</option><option value="disable">Deaktivieren</option>
                </select>
              </div>
            );
          })}
          {(field.conditions || []).length > 1 && (
            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: S.colors.textSecondary, alignSelf: 'center' }}>Verknüpfung:</span>
              {['AND', 'OR'].map(l => <button key={l} onClick={() => upd('conditionLogic', l)} style={{ padding: '4px 12px', borderRadius: S.radius.sm, fontSize: '12px', fontWeight: 600, border: `1.5px solid ${field.conditionLogic === l ? S.colors.primary : S.colors.border}`, background: field.conditionLogic === l ? `${S.colors.primary}10` : 'transparent', color: field.conditionLogic === l ? S.colors.primary : S.colors.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>{l === 'AND' ? 'UND' : 'ODER'}</button>)}
            </div>
          )}
          <button onClick={() => upd('conditions', [...(field.conditions || []), { field: '', operator: 'equals', value: '', action: 'show' }])} style={{ padding: '8px 12px', borderRadius: S.radius.sm, border: `1px dashed ${S.colors.border}`, background: 'transparent', color: S.colors.textMuted, cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', width: '100%' }}>＋ Bedingung hinzufügen</button>
        </>}
      </div>
    </div>
  );
};
