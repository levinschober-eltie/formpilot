import { useData } from '../contexts/DataContext';

/**
 * @returns {{ projects: Array, setProjects: Function, refreshProjects: Function, handleCreateProject: Function, saveProject: Function, deleteProject: Function }}
 */
export function useProjects() {
  const { projects, setProjects, refreshProjects, handleCreateProject, saveProject, deleteProject } = useData();
  return { projects, setProjects, refreshProjects, handleCreateProject, saveProject, deleteProject };
}
