// ═══ FormPilot SDK — React Hook ═══
// Wraps FormPilotClient with React state management

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FormPilotClient } from './FormPilotClient';

export function useFormPilot({ apiKey, baseUrl }) {
  const client = useMemo(() => new FormPilotClient({ apiKey, baseUrl }), [apiKey, baseUrl]);

  const [templates, setTemplates] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTemplates = useCallback(async () => {
    try {
      const data = await client.getTemplates();
      setTemplates(data);
    } catch (e) { setError(e.message); }
  }, [client]);

  const loadSubmissions = useCallback(async (filters) => {
    try {
      const data = await client.getSubmissions(filters);
      setSubmissions(data);
    } catch (e) { setError(e.message); }
  }, [client]);

  const submitForm = useCallback(async (data) => {
    const result = await client.createSubmission(data);
    await loadSubmissions();
    return result;
  }, [client, loadSubmissions]);

  useEffect(() => {
    Promise.all([loadTemplates(), loadSubmissions()])
      .finally(() => setLoading(false));
  }, [loadTemplates, loadSubmissions]);

  return {
    client,
    templates,
    submissions,
    loading,
    error,
    loadTemplates,
    loadSubmissions,
    submitForm,
  };
}
