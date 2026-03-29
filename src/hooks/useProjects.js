import { useData } from '../contexts/DataContext';

export function useProjects() {
  const { projects, setProjects, refreshProjects, handleCreateProject, saveProject, deleteProject } = useData();
  return { projects, setProjects, refreshProjects, handleCreateProject, saveProject, deleteProject };
}
