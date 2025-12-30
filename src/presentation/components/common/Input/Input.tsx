/**
 * Input Component - Reusable form input with label and validation states
 */
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import styles from './Input.module.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label for the input */
  label?: string | undefined;
  /** Helper text displayed below the input */
  helperText?: string | undefined;
  /** Error message (shows error state when present) */
  error?: string | undefined;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** Left icon/addon */
  leftAddon?: ReactNode | undefined;
  /** Right icon/addon */
  rightAddon?: ReactNode | undefined;
  /** Whether the field is required */
  required?: boolean | undefined;
  /** Full width */
  fullWidth?: boolean | undefined;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  size = 'md',
  leftAddon,
  rightAddon,
  required = false,
  fullWidth = false,
  className,
  id,
  disabled,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);

  const containerClasses = [
    styles.container,
    fullWidth ? styles.fullWidth : '',
    className ?? '',
  ].filter(Boolean).join(' ');

  const inputWrapperClasses = [
    styles.inputWrapper,
    styles[size],
    hasError ? styles.error : '',
    disabled ? styles.disabled : '',
    leftAddon ? styles.hasLeftAddon : '',
    rightAddon ? styles.hasRightAddon : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true"> *</span>}
        </label>
      )}
      <div className={inputWrapperClasses}>
        {leftAddon && (
          <span className={styles.addon} aria-hidden="true">
            {leftAddon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={styles.input}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          required={required}
          {...props}
        />
        {rightAddon && (
          <span className={styles.addon} aria-hidden="true">
            {rightAddon}
          </span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className={styles.errorText} role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${inputId}-helper`} className={styles.helperText}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
