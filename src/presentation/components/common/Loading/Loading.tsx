/**
 * Loading Component - Displays loading state with spinner
 */
import type { FC } from 'react';
import styles from './Loading.module.css';

export interface LoadingProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Loading message */
  message?: string;
  /** Whether to display as overlay */
  overlay?: boolean;
  /** Whether to display as fullscreen */
  fullscreen?: boolean;
}

export const Loading: FC<LoadingProps> = ({
  size = 'md',
  message = 'Cargando...',
  overlay = false,
  fullscreen = false,
}) => {
  const containerClasses = [
    styles.container,
    overlay ? styles.overlay : '',
    fullscreen ? styles.fullscreen : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <div className={`${styles.spinner} ${styles[size]}`} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle
            className={styles.track}
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <circle
            className={styles.progress}
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {message && <p className={styles.message}>{message}</p>}
      <span className="sr-only">{message}</span>
    </div>
  );
};
