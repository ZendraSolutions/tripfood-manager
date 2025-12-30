/**
 * @fileoverview Base domain error class for TripFood Manager.
 * Provides a foundation for all domain-specific errors with proper
 * error hierarchy and serialization capabilities.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

/**
 * Error codes for domain errors.
 * These codes help identify the type of error programmatically.
 */
export enum DomainErrorCode {
  /** Generic domain error */
  DOMAIN_ERROR = 'DOMAIN_ERROR',
  /** Validation failed */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  /** Entity not found */
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  /** Duplicate entity */
  DUPLICATE_ERROR = 'DUPLICATE_ERROR',
  /** Business rule violation */
  BUSINESS_RULE_ERROR = 'BUSINESS_RULE_ERROR',
  /** Invalid operation */
  INVALID_OPERATION_ERROR = 'INVALID_OPERATION_ERROR',
}

/**
 * Interface for serialized domain error representation.
 * Used for logging, API responses, and error transmission.
 */
export interface ISerializedDomainError {
  /** Error name/type */
  readonly name: string;
  /** Error code for programmatic handling */
  readonly code: DomainErrorCode;
  /** Human-readable error message */
  readonly message: string;
  /** Optional details about the error */
  readonly details?: Record<string, unknown>;
  /** Timestamp when the error occurred */
  readonly timestamp: string;
  /** Stack trace (only in development) */
  readonly stack?: string;
}

/**
 * Base class for all domain-specific errors in TripFood Manager.
 *
 * @description
 * This class extends the native Error class and provides additional
 * functionality specific to domain errors:
 * - Error codes for programmatic handling
 * - Detailed error information
 * - Serialization for logging and API responses
 * - Proper prototype chain maintenance
 *
 * @example
 * ```typescript
 * throw new DomainError('Something went wrong in the domain', DomainErrorCode.DOMAIN_ERROR);
 * ```
 *
 * @extends Error
 */
export class DomainError extends Error {
  /**
   * Error code identifying the type of domain error.
   * @readonly
   */
  public readonly code: DomainErrorCode;

  /**
   * Additional details about the error.
   * Can contain any relevant information for debugging.
   * @readonly
   */
  public readonly details?: Record<string, unknown> | undefined;

  /**
   * Timestamp when the error was created.
   * @readonly
   */
  public readonly timestamp: Date;

  /**
   * Creates a new DomainError instance.
   *
   * @param message - Human-readable error message
   * @param code - Error code for programmatic handling (defaults to DOMAIN_ERROR)
   * @param details - Optional additional details about the error
   */
  constructor(
    message: string,
    code: DomainErrorCode = DomainErrorCode.DOMAIN_ERROR,
    details?: Record<string, unknown>
  ) {
    super(message);

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();

    // Capture stack trace, excluding constructor call from it
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serializes the error to a plain object for logging or API responses.
   *
   * @param includeStack - Whether to include the stack trace (default: false)
   * @returns Serialized error object
   *
   * @example
   * ```typescript
   * const error = new DomainError('Test error');
   * console.log(JSON.stringify(error.toJSON()));
   * ```
   */
  public toJSON(includeStack: boolean = false): ISerializedDomainError {
    const serialized: ISerializedDomainError = {
      name: this.name,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
    };

    if (this.details !== undefined) {
      return { ...serialized, details: this.details };
    }

    if (includeStack && this.stack) {
      return { ...serialized, stack: this.stack };
    }

    return serialized;
  }

  /**
   * Creates a string representation of the error.
   *
   * @returns Formatted error string
   */
  public override toString(): string {
    const baseString = `${this.name} [${this.code}]: ${this.message}`;

    if (this.details) {
      return `${baseString}\nDetails: ${JSON.stringify(this.details, null, 2)}`;
    }

    return baseString;
  }

  /**
   * Type guard to check if an error is a DomainError.
   *
   * @param error - The error to check
   * @returns True if the error is a DomainError instance
   *
   * @example
   * ```typescript
   * try {
   *   // some operation
   * } catch (error) {
   *   if (DomainError.isDomainError(error)) {
   *     console.log(error.code);
   *   }
   * }
   * ```
   */
  public static isDomainError(error: unknown): error is DomainError {
    return error instanceof DomainError;
  }
}
