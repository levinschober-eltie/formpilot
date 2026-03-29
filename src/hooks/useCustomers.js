import { useData } from '../contexts/DataContext';

/**
 * @returns {{ customers: Array, setCustomers: Function, handleCustomersChange: Function }}
 */
export function useCustomers() {
  const { customers, setCustomers, handleCustomersChange } = useData();
  return { customers, setCustomers, handleCustomersChange };
}
