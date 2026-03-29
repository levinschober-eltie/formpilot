import { useData } from '../contexts/DataContext';

export function useSubmissions() {
  const { submissions, setSubmissions, onSubmissionSave } = useData();
  return { submissions, setSubmissions, onSubmissionSave };
}
