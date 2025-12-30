/**
 * useModal Hook - Manages modal state and actions
 */
import { useState, useCallback } from 'react';

export interface UseModalReturn {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Open the modal */
  open: () => void;
  /** Close the modal */
  close: () => void;
  /** Toggle the modal state */
  toggle: () => void;
}

/**
 * Hook for managing modal visibility state
 * @param initialState - Initial open state (default: false)
 * @returns Modal state and actions
 */
export function useModal(initialState = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
