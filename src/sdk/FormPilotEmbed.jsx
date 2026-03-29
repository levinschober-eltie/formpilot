// ═══ FormPilot SDK — Embed Component ═══
// Drop-in React component for embedding FormPilot in other projects

import { memo, useState, useCallback } from 'react';
import { useFormPilot } from './useFormPilot';

// ═══ Styles (outside render for P4) ═══
const loadingStyle = { padding: 20, textAlign: 'center' };
const errorStyle = { padding: 20, color: 'red' };
const successStyle = { padding: 20, textAlign: 'center' };
const containerStyle = { padding: 20 };
const headingStyle = { marginBottom: 12 };
const listStyle = { display: 'flex', flexDirection: 'column', gap: 8 };
const buttonStyle = {
  padding: '12px 16px',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  background: 'white',
  cursor: 'pointer',
  textAlign: 'left',
};
const descriptionStyle = { fontSize: 13, color: '#64748b', marginTop: 4 };
const hintStyle = { fontSize: 13, color: '#64748b', marginBottom: 16 };
const submitBtnStyle = {
  padding: '10px 20px',
  background: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
};

// Simple embed: shows a template selector + form filler
export const FormPilotEmbed = memo(function FormPilotEmbed({
  apiKey,
  baseUrl,
  templateId,     // Optional: pre-select a template
  onSubmit,       // Callback when form is submitted
  style = {},
}) {
  const { client, templates, loading, error } = useFormPilot({ apiKey, baseUrl });
  const [selectedTemplate, setSelectedTemplate] = useState(templateId || null);
  const [formData] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!selectedTemplate) return;
    try {
      const result = await client.createSubmission({
        templateId: selectedTemplate,
        data: formData,
        status: 'completed',
      });
      setSubmitted(true);
      onSubmit?.(result);
    } catch (e) {
      console.error('FormPilot submit error:', e);
    }
  }, [client, selectedTemplate, formData, onSubmit]);

  if (loading) return <div style={{ ...loadingStyle, ...style }}>L&auml;dt FormPilot...</div>;
  if (error) return <div style={{ ...errorStyle, ...style }}>Fehler: {error}</div>;
  if (submitted) return <div style={{ ...successStyle, ...style }}>Formular erfolgreich eingereicht!</div>;

  // Template selection
  if (!selectedTemplate) {
    return (
      <div style={{ ...containerStyle, ...style }}>
        <h3 style={headingStyle}>Formular ausw&auml;hlen</h3>
        <div style={listStyle}>
          {templates.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              style={buttonStyle}
            >
              <strong>{t.name}</strong>
              {t.description && <div style={descriptionStyle}>{t.description}</div>}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Simple form (for full form filler, use the full FormPilot component instead)
  const template = templates.find(t => t.id === selectedTemplate);
  return (
    <div style={{ ...containerStyle, ...style }}>
      <h3 style={headingStyle}>{template?.name || 'Formular'}</h3>
      <p style={hintStyle}>
        F&uuml;r die vollst&auml;ndige Formularansicht nutzen Sie die FormPilot-App.
        Dieses Embed unterst&uuml;tzt die programmatische Einreichung.
      </p>
      <button onClick={handleSubmit} style={submitBtnStyle}>
        Einreichen
      </button>
    </div>
  );
});
