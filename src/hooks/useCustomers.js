import { useData } from '../contexts/DataContext';

export function useCustomers() {
  const { customers, setCustomers, handleCustomersChange } = useData();
  return { customers, setCustomers, handleCustomersChange };
}
