import { useData } from '../contexts/DataContext';

export function useTemplates() {
  const { customTemplates, allTemplates, activeTemplates, refreshTemplates, updateTemplate, handleDeleteTemplate } = useData();
  return { customTemplates, allTemplates, activeTemplates, refreshTemplates, updateTemplate, handleDeleteTemplate };
}
