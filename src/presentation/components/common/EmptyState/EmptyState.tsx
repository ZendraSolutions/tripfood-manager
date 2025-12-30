/**
 * EmptyState Component - Displays when there's no data to show
 */
import type { FC, ReactNode } from 'react';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  /** Icon to display */
  icon?: ReactNode;
  /** Title of the empty state */
  title: string;
  /** Description text */
  description?: string;
  /** Action button or content */
  action?: ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState: FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  size = 'md',
}) => {
  const defaultIcon = (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );

  return (
    <div className={`${styles.container} ${styles[size]}`} role="status">
      <div className={styles.iconWrapper} aria-hidden="true">
        {icon || defaultIcon}
      </div>
      <h3 className={styles.title}>{title}</h3>
      {description && (
        <p className={styles.description}>{description}</p>
      )}
      {action && (
        <div className={styles.action}>
          {action}
        </div>
      )}
    </div>
  );
};
