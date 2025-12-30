/**
 * ErrorDisplay Component - Shows error messages with retry option
 */
import type { FC, ReactNode } from 'react';
import styles from './ErrorDisplay.module.css';

export interface ErrorDisplayProps {
  /** Error title */
  title?: string;
  /** Error message */
  message: string;
  /** Retry handler */
  onRetry?: () => void;
  /** Retry button text */
  retryText?: string;
  /** Custom icon */
  icon?: ReactNode;
  /** Additional action */
  action?: ReactNode;
  /** Variant style */
  variant?: 'inline' | 'card' | 'fullpage';
}

export const ErrorDisplay: FC<ErrorDisplayProps> = ({
  title = 'Error',
  message,
  onRetry,
  retryText = 'Reintentar',
  icon,
  action,
  variant = 'card',
}) => {
  const defaultIcon = (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4m0 4h.01" />
    </svg>
  );

  if (variant === 'inline') {
    return (
      <div className={styles.inline} role="alert">
        <span className={styles.inlineIcon} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4m0 4h.01" />
          </svg>
        </span>
        <span className={styles.inlineMessage}>{message}</span>
        {onRetry && (
          <button
            type="button"
            className={styles.inlineRetry}
            onClick={onRetry}
          >
            {retryText}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${styles[variant]}`} role="alert">
      <div className={styles.iconWrapper} aria-hidden="true">
        {icon || defaultIcon}
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        {onRetry && (
          <button
            type="button"
            className={styles.retryButton}
            onClick={onRetry}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 4v6h6M23 20v-6h-6" />
              <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
            </svg>
            {retryText}
          </button>
        )}
        {action}
      </div>
    </div>
  );
};
