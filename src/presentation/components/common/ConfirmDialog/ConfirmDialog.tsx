/**
 * ConfirmDialog Component - Confirmation dialog for destructive actions
 */
import type { FC, ReactNode } from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';
import styles from './ConfirmDialog.module.css';

export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog should close */
  onClose: () => void;
  /** Callback when confirmed */
  onConfirm: () => void;
  /** Dialog title */
  title: string;
  /** Dialog message */
  message: string | ReactNode;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Variant affects button styling */
  variant?: 'danger' | 'warning' | 'info';
  /** Loading state for confirm action */
  isLoading?: boolean;
  /** Custom icon */
  icon?: ReactNode;
}

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
  icon,
}) => {
  const defaultIcons: Record<string, ReactNode> = {
    danger: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01" />
      </svg>
    ),
    warning: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4m0 4h.01" />
      </svg>
    ),
    info: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4m0-4h.01" />
      </svg>
    ),
  };

  const confirmButtonVariant = variant === 'danger' ? 'danger' : 'primary';

  const footer = (
    <>
      <Button
        variant="secondary"
        onClick={onClose}
        disabled={isLoading}
      >
        {cancelText}
      </Button>
      <Button
        variant={confirmButtonVariant}
        onClick={onConfirm}
        isLoading={isLoading}
      >
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      size="sm"
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className={styles.content}>
        <div className={`${styles.iconWrapper} ${styles[variant]}`} aria-hidden="true">
          {icon || defaultIcons[variant]}
        </div>
        <div className={styles.message}>
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>
      </div>
    </Modal>
  );
};
