/**
 * Select Component - Reusable dropdown select with label and validation states
 */
import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Label for the select */
  label?: string;
  /** Options to display */
  options: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Helper text displayed below the select */
  helperText?: string;
  /** Error message (shows error state when present) */
  error?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the field is required */
  required?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Left icon */
  leftIcon?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  placeholder,
  helperText,
  error,
  size = 'md',
  required = false,
  fullWidth = false,
  leftIcon,
  className,
  id,
  disabled,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);

  const containerClasses = [
    styles.container,
    fullWidth ? styles.fullWidth : '',
    className ?? '',
  ].filter(Boolean).join(' ');

  const selectWrapperClasses = [
    styles.selectWrapper,
    styles[size],
    hasError ? styles.error : '',
    disabled ? styles.disabled : '',
    leftIcon ? styles.hasLeftIcon : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true"> *</span>}
        </label>
      )}
      <div className={selectWrapperClasses}>
        {leftIcon && (
          <span className={styles.icon} aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <select
          ref={ref}
          id={selectId}
          className={styles.select}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          required={required}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <span className={styles.chevron} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </div>
      {error && (
        <p id={`${selectId}-error`} className={styles.errorText} role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${selectId}-helper`} className={styles.helperText}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
