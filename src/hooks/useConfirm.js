import { useState, useCallback } from 'react';

/**
 * Hook für styled Confirm-Dialoge (ersetzt browser confirm())
 * Usage: const { confirm, ConfirmDialog } = useConfirm();
 *        await confirm({ title: '...', message: '...' });
 */
export const useConfirm = () => {
  const [state, setState] = useState(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state?.resolve(true);
    setState(null);
  }, [state]);

  const handleCancel = useCallback(() => {
    state?.resolve(false);
    setState(null);
  }, [state]);

  return {
    confirm,
    confirmState: state,
    handleConfirm,
    handleCancel,
  };
};
