/**
 * Card Component - Container component for displaying content in a card format
 */
import type { FC, ReactNode, HTMLAttributes } from 'react';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card title */
  title?: string | undefined;
  /** Card subtitle */
  subtitle?: string | undefined;
  /** Card header actions (buttons, etc.) */
  headerActions?: ReactNode | undefined;
  /** Card footer content */
  footer?: ReactNode | undefined;
  /** Visual variant */
  variant?: 'default' | 'outlined' | 'elevated' | undefined;
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg' | undefined;
  /** Whether the card is interactive (clickable) */
  interactive?: boolean | undefined;
  /** Children content */
  children: ReactNode;
}

export const Card: FC<CardProps> = ({
  title,
  subtitle,
  headerActions,
  footer,
  variant = 'default',
  padding = 'md',
  interactive = false,
  children,
  className,
  onClick,
  ...props
}) => {
  const classNames = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    interactive ? styles.interactive : '',
    className ?? '',
  ].filter(Boolean).join(' ');

  const hasHeader = title || subtitle || headerActions;

  return (
    <div
      className={classNames}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
      } : undefined}
      {...props}
    >
      {hasHeader && (
        <div className={styles.header}>
          <div className={styles.headerText}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {headerActions && (
            <div className={styles.headerActions}>
              {headerActions}
            </div>
          )}
        </div>
      )}
      <div className={styles.body}>
        {children}
      </div>
      {footer && (
        <div className={styles.footer}>
          {footer}
        </div>
      )}
    </div>
  );
};
