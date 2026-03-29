import { useData } from '../contexts/DataContext';

/**
 * @returns {{ submissions: Array, setSubmissions: Function, onSubmissionSave: Function|null }}
 */
export function useSubmissions() {
  const { submissions, setSubmissions, onSubmissionSave } = useData();
  return { submissions, setSubmissions, onSubmissionSave };
}
