/**
 * @fileoverview Validation error class for TripFood Manager.
 * Used when entity or value object validation fails.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

import { DomainError, DomainErrorCode } from './DomainError';

/**
 * Represents a single validation failure.
 */
export interface IValidationFailure {
  /** The field or property that failed validation */
  readonly field: string;
  /** The validation rule that was violated */
  readonly rule: string;
  /** Human-readable message describing the failure */
  readonly message: string;
  /** The actual value that failed validation (optional for security) */
  readonly value?: unknown;
}

/**
 * Error thrown when validation of domain entities or value objects fails.
 *
 * @description
 * This error is used to communicate validation failures in a structured way.
 * It supports multiple validation failures and provides detailed information
 * about each failure for proper error handling and user feedback.
 *
 * @example
 * ```typescript
 * // Single validation failure
 * throw new ValidationError('Trip name is required', 'name', 'required');
 *
 * // Multiple validation failures
 * throw ValidationError.fromFailures([
 *   { field: 'name', rule: 'required', message: 'Name is required' },
 *   { field: 'startDate', rule: 'future', message: 'Start date must be in the future' }
 * ]);
 * ```
 *
 * @extends DomainError
 */
export class ValidationError extends DomainError {
  /**
   * The field that failed validation (for single-field errors).
   * @readonly
   */
  public readonly field?: string;

  /**
   * The validation rule that was violated.
   * @readonly
   */
  public readonly rule?: string;

  /**
   * Array of all validation failures (for multi-field validation).
   * @readonly
   */
  public readonly failures: ReadonlyArray<IValidationFailure>;

  /**
   * Creates a new ValidationError instance.
   *
   * @param message - Human-readable error message
   * @param field - The field that failed validation (optional)
   * @param rule - The validation rule that was violated (optional)
   * @param value - The value that failed validation (optional)
   */
  constructor(
    message: string,
    field?: string,
    rule?: string,
    value?: unknown
  ) {
    const details: Record<string, unknown> = {};

    if (field !== undefined) {
      details['field'] = field;
    }
    if (rule !== undefined) {
      details['rule'] = rule;
    }
    if (value !== undefined) {
      details['value'] = value;
    }

    super(
      message,
      DomainErrorCode.VALIDATION_ERROR,
      Object.keys(details).length > 0 ? details : undefined
    );

    this.field = field;
    this.rule = rule;

    // Create failures array from single field error
    if (field && rule) {
      this.failures = [
        {
          field,
          rule,
          message,
          value,
        },
      ];
    } else {
      this.failures = [];
    }
  }

  /**
   * Creates a ValidationError from multiple validation failures.
   *
   * @param failures - Array of validation failures
   * @returns A new ValidationError instance containing all failures
   *
   * @example
   * ```typescript
   * const errors = ValidationError.fromFailures([
   *   { field: 'name', rule: 'required', message: 'Name is required' },
   *   { field: 'email', rule: 'format', message: 'Invalid email format' }
   * ]);
   * ```
   */
  public static fromFailures(
    failures: ReadonlyArray<IValidationFailure>
  ): ValidationError {
    if (failures.length === 0) {
      return new ValidationError('Validation failed with no specific errors');
    }

    if (failures.length === 1) {
      const failure = failures[0];
      return new ValidationError(
        failure.message,
        failure.field,
        failure.rule,
        failure.value
      );
    }

    const message = `Validation failed with ${failures.length} errors: ${failures
      .map((f) => f.message)
      .join('; ')}`;

    const error = new ValidationError(message);

    // Override the readonly failures array using Object.defineProperty
    Object.defineProperty(error, 'failures', {
      value: failures,
      writable: false,
      enumerable: true,
      configurable: false,
    });

    return error;
  }

  /**
   * Creates a ValidationError for a required field.
   *
   * @param fieldName - Name of the required field
   * @param entityName - Name of the entity (optional, for context)
   * @returns A new ValidationError instance
   *
   * @example
   * ```typescript
   * throw ValidationError.required('name', 'Trip');
   * // Message: "Trip name is required"
   * ```
   */
  public static required(fieldName: string, entityName?: string): ValidationError {
    const prefix = entityName ? `${entityName} ` : '';
    return new ValidationError(
      `${prefix}${fieldName} is required`,
      fieldName,
      'required'
    );
  }

  /**
   * Creates a ValidationError for an invalid format.
   *
   * @param fieldName - Name of the field with invalid format
   * @param expectedFormat - Description of the expected format
   * @param actualValue - The actual value that was provided (optional)
   * @returns A new ValidationError instance
   *
   * @example
   * ```typescript
   * throw ValidationError.invalidFormat('email', 'valid email address');
   * ```
   */
  public static invalidFormat(
    fieldName: string,
    expectedFormat: string,
    actualValue?: unknown
  ): ValidationError {
    return new ValidationError(
      `${fieldName} must be a ${expectedFormat}`,
      fieldName,
      'format',
      actualValue
    );
  }

  /**
   * Creates a ValidationError for a value out of range.
   *
   * @param fieldName - Name of the field
   * @param min - Minimum allowed value (optional)
   * @param max - Maximum allowed value (optional)
   * @param actualValue - The actual value that was provided (optional)
   * @returns A new ValidationError instance
   *
   * @example
   * ```typescript
   * throw ValidationError.outOfRange('quantity', 1, 100, 0);
   * ```
   */
  public static outOfRange(
    fieldName: string,
    min?: number,
    max?: number,
    actualValue?: unknown
  ): ValidationError {
    let message: string;

    if (min !== undefined && max !== undefined) {
      message = `${fieldName} must be between ${min} and ${max}`;
    } else if (min !== undefined) {
      message = `${fieldName} must be at least ${min}`;
    } else if (max !== undefined) {
      message = `${fieldName} must be at most ${max}`;
    } else {
      message = `${fieldName} is out of range`;
    }

    return new ValidationError(message, fieldName, 'range', actualValue);
  }

  /**
   * Creates a ValidationError for invalid length.
   *
   * @param fieldName - Name of the field
   * @param minLength - Minimum length (optional)
   * @param maxLength - Maximum length (optional)
   * @param actualLength - The actual length (optional)
   * @returns A new ValidationError instance
   */
  public static invalidLength(
    fieldName: string,
    minLength?: number,
    maxLength?: number,
    actualLength?: number
  ): ValidationError {
    let message: string;

    if (minLength !== undefined && maxLength !== undefined) {
      message = `${fieldName} must be between ${minLength} and ${maxLength} characters`;
    } else if (minLength !== undefined) {
      message = `${fieldName} must be at least ${minLength} characters`;
    } else if (maxLength !== undefined) {
      message = `${fieldName} must be at most ${maxLength} characters`;
    } else {
      message = `${fieldName} has invalid length`;
    }

    return new ValidationError(message, fieldName, 'length', actualLength);
  }

  /**
   * Creates a ValidationError for an invalid date range.
   *
   * @param startFieldName - Name of the start date field
   * @param endFieldName - Name of the end date field
   * @returns A new ValidationError instance
   */
  public static invalidDateRange(
    startFieldName: string,
    endFieldName: string
  ): ValidationError {
    return new ValidationError(
      `${startFieldName} must be before ${endFieldName}`,
      `${startFieldName}_${endFieldName}`,
      'dateRange'
    );
  }

  /**
   * Checks if this error has multiple validation failures.
   *
   * @returns True if there are multiple failures
   */
  public hasMultipleFailures(): boolean {
    return this.failures.length > 1;
  }

  /**
   * Gets all fields that have validation errors.
   *
   * @returns Array of field names with errors
   */
  public getFailedFields(): ReadonlyArray<string> {
    return this.failures.map((f) => f.field);
  }

  /**
   * Type guard to check if an error is a ValidationError.
   *
   * @param error - The error to check
   * @returns True if the error is a ValidationError instance
   */
  public static isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError;
  }
}
