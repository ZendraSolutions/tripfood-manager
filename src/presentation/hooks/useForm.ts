/**
 * useForm Hook - Generic form state management with validation
 * Provides a complete interface for form handling with validation support
 *
 * @module presentation/hooks/useForm
 */
import { useState, useCallback, useMemo, type ChangeEvent, type FormEvent } from 'react';

/**
 * Validation rule function type
 */
export type ValidationRule<T> = (value: T[keyof T], values: T) => string | undefined;

/**
 * Validation schema type - maps field names to arrays of validation rules
 */
export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T>[];
};

/**
 * Form errors type - maps field names to error messages
 */
export type FormErrors<T> = {
  [K in keyof T]?: string;
};

/**
 * Touched fields type - tracks which fields have been interacted with
 */
export type TouchedFields<T> = {
  [K in keyof T]?: boolean;
};

/**
 * Options for the useForm hook
 */
export interface UseFormOptions<T> {
  /** Initial form values */
  initialValues: T;
  /** Validation schema */
  validationSchema?: ValidationSchema<T>;
  /** Callback when form is submitted with valid data */
  onSubmit?: (values: T) => void | Promise<void>;
  /** Whether to validate on change (default: true) */
  validateOnChange?: boolean;
  /** Whether to validate on blur (default: true) */
  validateOnBlur?: boolean;
}

/**
 * State interface for the useForm hook
 */
export interface UseFormState<T> {
  /** Current form values */
  values: T;
  /** Validation errors */
  errors: FormErrors<T>;
  /** Fields that have been touched */
  touched: TouchedFields<T>;
  /** Whether the form is currently submitting */
  isSubmitting: boolean;
  /** Whether the form has been modified from initial values */
  isDirty: boolean;
  /** Whether the form is valid (no errors) */
  isValid: boolean;
}

/**
 * Actions interface for the useForm hook
 */
export interface UseFormActions<T> {
  /** Handles change events for form inputs */
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  /** Handles blur events for form inputs */
  handleBlur: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  /** Handles form submission */
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  /** Sets a specific field value */
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  /** Sets a specific field error */
  setFieldError: <K extends keyof T>(field: K, error: string | undefined) => void;
  /** Sets multiple field values at once */
  setValues: (values: Partial<T>) => void;
  /** Sets multiple errors at once */
  setErrors: (errors: FormErrors<T>) => void;
  /** Marks a field as touched */
  setFieldTouched: <K extends keyof T>(field: K, touched?: boolean) => void;
  /** Resets the form to initial values */
  reset: (newInitialValues?: T) => void;
  /** Validates a single field */
  validateField: <K extends keyof T>(field: K) => string | undefined;
  /** Validates all fields */
  validateForm: () => boolean;
  /** Gets props for an input field (value, onChange, onBlur, name) */
  getFieldProps: <K extends keyof T>(field: K) => {
    name: K;
    value: T[K];
    onChange: UseFormActions<T>['handleChange'];
    onBlur: UseFormActions<T>['handleBlur'];
  };
  /** Gets error message for a field (only if touched) */
  getFieldError: <K extends keyof T>(field: K) => string | undefined;
}

/**
 * Combined return type for the useForm hook
 */
export type UseFormReturn<T> = UseFormState<T> & UseFormActions<T>;

/**
 * Hook for managing form state with validation
 *
 * @description
 * This hook provides a complete form management solution including:
 * - Form state management (values, errors, touched)
 * - Validation with custom rules
 * - Submission handling
 * - Helper methods for input binding
 *
 * @param options - Configuration options for the form
 * @returns {UseFormReturn<T>} State and actions for form management
 *
 * @example
 * ```tsx
 * interface LoginForm {
 *   email: string;
 *   password: string;
 * }
 *
 * const required = (value: string) => !value ? 'Campo requerido' : undefined;
 * const email = (value: string) => !/\S+@\S+\.\S+/.test(value) ? 'Email invalido' : undefined;
 *
 * function LoginPage() {
 *   const {
 *     values,
 *     errors,
 *     isSubmitting,
 *     handleSubmit,
 *     getFieldProps,
 *     getFieldError,
 *   } = useForm<LoginForm>({
 *     initialValues: { email: '', password: '' },
 *     validationSchema: {
 *       email: [required, email],
 *       password: [required],
 *     },
 *     onSubmit: async (values) => {
 *       await loginUser(values);
 *     },
 *   });
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input {...getFieldProps('email')} type="email" />
 *       {getFieldError('email') && <span>{getFieldError('email')}</span>}
 *
 *       <input {...getFieldProps('password')} type="password" />
 *       {getFieldError('password') && <span>{getFieldError('password')}</span>}
 *
 *       <button type="submit" disabled={isSubmitting}>
 *         {isSubmitting ? 'Cargando...' : 'Iniciar sesion'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useForm<T extends Record<string, unknown>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const {
    initialValues,
    validationSchema = {} as ValidationSchema<T>,
    onSubmit,
    validateOnChange = true,
    validateOnBlur = true,
  } = options;

  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<TouchedFields<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Checks if form is dirty (values differ from initial)
   */
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  /**
   * Checks if form is valid (no errors)
   */
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 || Object.values(errors).every((e) => !e);
  }, [errors]);

  /**
   * Validates a single field
   */
  const validateField = useCallback(<K extends keyof T>(field: K): string | undefined => {
    const rules = validationSchema[field];
    if (!rules || rules.length === 0) {
      return undefined;
    }

    for (const rule of rules) {
      const error = rule(values[field], values);
      if (error) {
        return error;
      }
    }

    return undefined;
  }, [values, validationSchema]);

  /**
   * Validates all fields
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors<T> = {};
    let hasErrors = false;

    for (const field of Object.keys(validationSchema) as Array<keyof T>) {
      const error = validateField(field);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    }

    setErrorsState(newErrors);
    return !hasErrors;
  }, [validationSchema, validateField]);

  /**
   * Sets a specific field value
   */
  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValuesState((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (validateOnChange) {
      // Validate after state update
      setTimeout(() => {
        const rules = validationSchema[field];
        if (rules && rules.length > 0) {
          const newValues = { ...values, [field]: value };
          for (const rule of rules) {
            const error = rule(value, newValues);
            if (error) {
              setErrorsState((prev) => ({ ...prev, [field]: error }));
              return;
            }
          }
          setErrorsState((prev) => ({ ...prev, [field]: undefined }));
        }
      }, 0);
    }
  }, [validateOnChange, validationSchema, values]);

  /**
   * Sets a specific field error
   */
  const setFieldError = useCallback(<K extends keyof T>(field: K, error: string | undefined) => {
    setErrorsState((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  /**
   * Sets multiple values at once
   */
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({
      ...prev,
      ...newValues,
    }));
  }, []);

  /**
   * Sets multiple errors at once
   */
  const setErrors = useCallback((newErrors: FormErrors<T>) => {
    setErrorsState(newErrors);
  }, []);

  /**
   * Marks a field as touched
   */
  const setFieldTouched = useCallback(<K extends keyof T>(field: K, isTouched = true) => {
    setTouched((prev) => ({
      ...prev,
      [field]: isTouched,
    }));
  }, []);

  /**
   * Handles change events
   */
  const handleChange = useCallback((
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const field = name as keyof T;

    let newValue: unknown = value;

    // Handle checkbox
    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    }

    // Handle number
    if (type === 'number') {
      newValue = value === '' ? '' : Number(value);
    }

    setFieldValue(field, newValue as T[keyof T]);
  }, [setFieldValue]);

  /**
   * Handles blur events
   */
  const handleBlur = useCallback((
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    const field = name as keyof T;

    setFieldTouched(field, true);

    if (validateOnBlur) {
      const error = validateField(field);
      setFieldError(field, error);
    }
  }, [setFieldTouched, validateOnBlur, validateField, setFieldError]);

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched: TouchedFields<T> = {};
    for (const field of Object.keys(values) as Array<keyof T>) {
      allTouched[field] = true;
    }
    setTouched(allTouched);

    // Validate form
    const isFormValid = validateForm();
    if (!isFormValid) {
      return;
    }

    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validateForm, onSubmit]);

  /**
   * Resets the form
   */
  const reset = useCallback((newInitialValues?: T) => {
    const resetValues = newInitialValues || initialValues;
    setValuesState(resetValues);
    setErrorsState({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Gets props for an input field
   */
  const getFieldProps = useCallback(<K extends keyof T>(field: K) => ({
    name: field,
    value: values[field],
    onChange: handleChange,
    onBlur: handleBlur,
  }), [values, handleChange, handleBlur]);

  /**
   * Gets error message for a field (only if touched)
   */
  const getFieldError = useCallback(<K extends keyof T>(field: K): string | undefined => {
    return touched[field] ? errors[field] : undefined;
  }, [touched, errors]);

  return {
    // State
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    isValid,
    // Actions
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setValues,
    setErrors,
    setFieldTouched,
    reset,
    validateField,
    validateForm,
    getFieldProps,
    getFieldError,
  };
}

// ============================================================================
// Common Validation Rules
// ============================================================================

/**
 * Creates a required field validation rule
 */
export function required(message = 'Este campo es requerido'): ValidationRule<Record<string, unknown>> {
  return (value) => {
    if (value === undefined || value === null || value === '') {
      return message;
    }
    return undefined;
  };
}

/**
 * Creates a minimum length validation rule
 */
export function minLength(min: number, message?: string): ValidationRule<Record<string, unknown>> {
  return (value) => {
    if (typeof value === 'string' && value.length < min) {
      return message || `Debe tener al menos ${min} caracteres`;
    }
    return undefined;
  };
}

/**
 * Creates a maximum length validation rule
 */
export function maxLength(max: number, message?: string): ValidationRule<Record<string, unknown>> {
  return (value) => {
    if (typeof value === 'string' && value.length > max) {
      return message || `Debe tener maximo ${max} caracteres`;
    }
    return undefined;
  };
}

/**
 * Creates an email validation rule
 */
export function email(message = 'Email invalido'): ValidationRule<Record<string, unknown>> {
  return (value) => {
    if (typeof value === 'string' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return message;
    }
    return undefined;
  };
}

/**
 * Creates a pattern validation rule
 */
export function pattern(regex: RegExp, message: string): ValidationRule<Record<string, unknown>> {
  return (value) => {
    if (typeof value === 'string' && value && !regex.test(value)) {
      return message;
    }
    return undefined;
  };
}

/**
 * Creates a minimum value validation rule for numbers
 */
export function min(minValue: number, message?: string): ValidationRule<Record<string, unknown>> {
  return (value) => {
    if (typeof value === 'number' && value < minValue) {
      return message || `El valor debe ser al menos ${minValue}`;
    }
    return undefined;
  };
}

/**
 * Creates a maximum value validation rule for numbers
 */
export function max(maxValue: number, message?: string): ValidationRule<Record<string, unknown>> {
  return (value) => {
    if (typeof value === 'number' && value > maxValue) {
      return message || `El valor debe ser maximo ${maxValue}`;
    }
    return undefined;
  };
}

/**
 * Creates a custom validation rule
 */
export function custom<T extends Record<string, unknown>>(
  validator: (value: T[keyof T], values: T) => boolean,
  message: string
): ValidationRule<T> {
  return (value, values) => {
    if (!validator(value, values)) {
      return message;
    }
    return undefined;
  };
}
