import { useData } from '../contexts/DataContext';

/**
 * @returns {{ customTemplates: Array, allTemplates: Array, activeTemplates: Array, refreshTemplates: Function, updateTemplate: Function, handleDeleteTemplate: Function }}
 */
export function useTemplates() {
  const { customTemplates, allTemplates, activeTemplates, refreshTemplates, updateTemplate, handleDeleteTemplate } = useData();
  return { customTemplates, allTemplates, activeTemplates, refreshTemplates, updateTemplate, handleDeleteTemplate };
}
