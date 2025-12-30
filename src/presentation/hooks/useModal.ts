/**
 * useModal Hook - Manages modal state and actions
 * Provides a simple interface for controlling modal visibility
 *
 * @module presentation/hooks/useModal
 */
import { useState, useCallback, useMemo } from 'react';

/**
 * Configuration options for the useModal hook
 */
export interface UseModalOptions {
  /** Initial open state (default: false) */
  initialOpen?: boolean;
  /** Callback when modal opens */
  onOpen?: () => void;
  /** Callback when modal closes */
  onClose?: () => void;
}

/**
 * Return type for the useModal hook
 */
export interface UseModalReturn {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Open the modal */
  open: () => void;
  /** Close the modal */
  close: () => void;
  /** Toggle the modal state */
  toggle: () => void;
  /** Props to spread on the modal component */
  modalProps: {
    isOpen: boolean;
    onClose: () => void;
  };
}

/**
 * Hook for managing modal visibility state
 *
 * @description
 * This hook provides a simple and consistent interface for controlling
 * modal visibility across the application. It includes callbacks for
 * open/close events and convenient props to spread on modal components.
 *
 * @param options - Configuration options (optional)
 * @returns {UseModalReturn} Modal state and actions
 *
 * @example
 * ```tsx
 * // Basic usage
 * function MyComponent() {
 *   const { isOpen, open, close, modalProps } = useModal();
 *
 *   return (
 *     <div>
 *       <button onClick={open}>Abrir Modal</button>
 *       <Modal {...modalProps}>
 *         <h2>Contenido del Modal</h2>
 *         <button onClick={close}>Cerrar</button>
 *       </Modal>
 *     </div>
 *   );
 * }
 *
 * // With options
 * function MyComponentWithCallbacks() {
 *   const { isOpen, open, close } = useModal({
 *     initialOpen: false,
 *     onOpen: () => console.log('Modal abierto'),
 *     onClose: () => console.log('Modal cerrado'),
 *   });
 *
 *   return (
 *     <div>
 *       <button onClick={open}>Abrir</button>
 *       {isOpen && <Modal onClose={close}>...</Modal>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useModal(options: UseModalOptions = {}): UseModalReturn {
  const { initialOpen = false, onOpen, onClose } = options;

  const [isOpen, setIsOpen] = useState(initialOpen);

  /**
   * Opens the modal
   */
  const open = useCallback(() => {
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  /**
   * Closes the modal
   */
  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  /**
   * Toggles the modal state
   */
  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const newState = !prev;
      if (newState) {
        onOpen?.();
      } else {
        onClose?.();
      }
      return newState;
    });
  }, [onOpen, onClose]);

  /**
   * Memoized props to spread on modal component
   */
  const modalProps = useMemo(() => ({
    isOpen,
    onClose: close,
  }), [isOpen, close]);

  return {
    isOpen,
    open,
    close,
    toggle,
    modalProps,
  };
}

/**
 * Hook for managing multiple modals by key
 *
 * @description
 * This hook is useful when you need to manage multiple modals in a single
 * component. Each modal is identified by a unique key.
 *
 * @returns Functions for managing multiple modals
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isOpen, open, close } = useModals();
 *
 *   return (
 *     <div>
 *       <button onClick={() => open('create')}>Crear</button>
 *       <button onClick={() => open('edit')}>Editar</button>
 *
 *       <Modal isOpen={isOpen('create')} onClose={() => close('create')}>
 *         <CreateForm />
 *       </Modal>
 *
 *       <Modal isOpen={isOpen('edit')} onClose={() => close('edit')}>
 *         <EditForm />
 *       </Modal>
 *     </div>
 *   );
 * }
 * ```
 */
export function useModals(): {
  /** Check if a modal is open */
  isOpen: (key: string) => boolean;
  /** Open a modal by key */
  open: (key: string) => void;
  /** Close a modal by key */
  close: (key: string) => void;
  /** Toggle a modal by key */
  toggle: (key: string) => void;
  /** Close all modals */
  closeAll: () => void;
  /** Get the currently open modal key (if any) */
  currentModal: string | null;
} {
  const [openModals, setOpenModals] = useState<Set<string>>(new Set());

  const isOpen = useCallback((key: string): boolean => {
    return openModals.has(key);
  }, [openModals]);

  const open = useCallback((key: string) => {
    setOpenModals((prev) => new Set(prev).add(key));
  }, []);

  const close = useCallback((key: string) => {
    setOpenModals((prev) => {
      const newSet = new Set(prev);
      newSet.delete(key);
      return newSet;
    });
  }, []);

  const toggle = useCallback((key: string) => {
    setOpenModals((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  const closeAll = useCallback(() => {
    setOpenModals(new Set());
  }, []);

  const currentModal = useMemo((): string | null => {
    const modals = Array.from(openModals);
    return modals.length > 0 ? (modals[modals.length - 1] ?? null) : null;
  }, [openModals]);

  return {
    isOpen,
    open,
    close,
    toggle,
    closeAll,
    currentModal,
  };
}

/**
 * Hook for managing a confirmation modal with data
 *
 * @description
 * This hook is useful for confirmation dialogs where you need to pass
 * data along with the modal state (e.g., the item to delete).
 *
 * @returns Functions for managing confirmation modal with data
 *
 * @example
 * ```tsx
 * function UserList() {
 *   const { isOpen, data, openWith, close, confirm } = useConfirmModal<User>();
 *
 *   const handleDelete = async (user: User) => {
 *     await deleteUser(user.id);
 *     close();
 *   };
 *
 *   return (
 *     <div>
 *       {users.map(user => (
 *         <button key={user.id} onClick={() => openWith(user)}>
 *           Eliminar {user.name}
 *         </button>
 *       ))}
 *
 *       <ConfirmDialog
 *         isOpen={isOpen}
 *         onClose={close}
 *         onConfirm={() => data && handleDelete(data)}
 *         title="Eliminar usuario"
 *         message={`¿Estas seguro de eliminar a ${data?.name}?`}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export function useConfirmModal<T>(): {
  /** Whether the modal is open */
  isOpen: boolean;
  /** The data passed to the modal */
  data: T | null;
  /** Open the modal with data */
  openWith: (data: T) => void;
  /** Close the modal and clear data */
  close: () => void;
  /** Execute confirmation action */
  confirm: (action: (data: T) => void | Promise<void>) => Promise<void>;
} {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const openWith = useCallback((newData: T) => {
    setData(newData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Delay clearing data to allow for exit animations
    setTimeout(() => setData(null), 300);
  }, []);

  const confirm = useCallback(async (action: (data: T) => void | Promise<void>) => {
    if (data) {
      await action(data);
      close();
    }
  }, [data, close]);

  return {
    isOpen,
    data,
    openWith,
    close,
    confirm,
  };
}
