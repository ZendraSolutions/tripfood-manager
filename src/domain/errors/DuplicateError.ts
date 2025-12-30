/**
 * @fileoverview Duplicate error class for TripFood Manager.
 * Used when attempting to create an entity that already exists.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

import { DomainError, DomainErrorCode } from './DomainError';

/**
 * Error thrown when attempting to create a duplicate entity.
 *
 * @description
 * This error is used when trying to create an entity that violates
 * uniqueness constraints, such as:
 * - Same ID already exists
 * - Same natural key (e.g., email, name + tripId combination)
 * - Other business uniqueness rules
 *
 * @example
 * ```typescript
 * // Duplicate by ID
 * throw new DuplicateError('Trip', 'id', 'trip-123');
 *
 * // Duplicate by natural key
 * throw DuplicateError.forField('Participant', 'email', 'john@example.com');
 *
 * // Duplicate by composite key
 * throw DuplicateError.forCompositeKey('Consumption', {
 *   participantId: 'p-1',
 *   productId: 'prod-1',
 *   date: '2024-01-15'
 * });
 * ```
 *
 * @extends DomainError
 */
export class DuplicateError extends DomainError {
  /**
   * The type of entity that is duplicated.
   * @readonly
   */
  public readonly entityType: string;

  /**
   * The field that caused the duplication.
   * @readonly
   */
  public readonly field?: string;

  /**
   * The value that is duplicated.
   * @readonly
   */
  public readonly duplicateValue?: unknown;

  /**
   * Composite key values that caused the duplication.
   * @readonly
   */
  public readonly compositeKey?: Record<string, unknown>;

  /**
   * Creates a new DuplicateError instance.
   *
   * @param entityType - The type of entity that is duplicated
   * @param field - The field that caused the duplication (optional)
   * @param duplicateValue - The duplicated value (optional)
   * @param compositeKey - Composite key values (optional)
   */
  constructor(
    entityType: string,
    field?: string,
    duplicateValue?: unknown,
    compositeKey?: Record<string, unknown>
  ) {
    const message = DuplicateError.buildMessage(
      entityType,
      field,
      duplicateValue,
      compositeKey
    );

    const details: Record<string, unknown> = {
      entityType,
    };

    if (field !== undefined) {
      details['field'] = field;
    }

    if (duplicateValue !== undefined) {
      details['duplicateValue'] = duplicateValue;
    }

    if (compositeKey !== undefined) {
      details['compositeKey'] = compositeKey;
    }

    super(message, DomainErrorCode.DUPLICATE_ERROR, details);

    this.entityType = entityType;
    this.field = field;
    this.duplicateValue = duplicateValue;
    this.compositeKey = compositeKey;
  }

  /**
   * Builds the error message based on provided parameters.
   *
   * @param entityType - The type of entity
   * @param field - The field that caused the duplication (optional)
   * @param duplicateValue - The duplicated value (optional)
   * @param compositeKey - Composite key values (optional)
   * @returns Formatted error message
   */
  private static buildMessage(
    entityType: string,
    field?: string,
    duplicateValue?: unknown,
    compositeKey?: Record<string, unknown>
  ): string {
    if (compositeKey !== undefined) {
      const keyString = Object.entries(compositeKey)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(', ');
      return `${entityType} with composite key {${keyString}} already exists`;
    }

    if (field !== undefined && duplicateValue !== undefined) {
      return `${entityType} with ${field} '${String(duplicateValue)}' already exists`;
    }

    if (field !== undefined) {
      return `${entityType} with duplicate ${field} already exists`;
    }

    return `${entityType} already exists`;
  }

  /**
   * Creates a DuplicateError for a specific field value.
   *
   * @param entityType - The type of entity
   * @param field - The field name
   * @param value - The duplicate value
   * @returns A new DuplicateError instance
   *
   * @example
   * ```typescript
   * throw DuplicateError.forField('Participant', 'email', 'john@example.com');
   * // Message: "Participant with email 'john@example.com' already exists"
   * ```
   */
  public static forField(
    entityType: string,
    field: string,
    value: unknown
  ): DuplicateError {
    return new DuplicateError(entityType, field, value);
  }

  /**
   * Creates a DuplicateError for an entity ID.
   *
   * @param entityType - The type of entity
   * @param id - The duplicate ID
   * @returns A new DuplicateError instance
   *
   * @example
   * ```typescript
   * throw DuplicateError.forId('Trip', 'trip-123');
   * // Message: "Trip with id 'trip-123' already exists"
   * ```
   */
  public static forId(entityType: string, id: string): DuplicateError {
    return new DuplicateError(entityType, 'id', id);
  }

  /**
   * Creates a DuplicateError for a composite key.
   *
   * @param entityType - The type of entity
   * @param compositeKey - Object containing the composite key fields and values
   * @returns A new DuplicateError instance
   *
   * @example
   * ```typescript
   * throw DuplicateError.forCompositeKey('Availability', {
   *   participantId: 'participant-1',
   *   tripId: 'trip-1',
   *   date: '2024-01-15'
   * });
   * ```
   */
  public static forCompositeKey(
    entityType: string,
    compositeKey: Record<string, unknown>
  ): DuplicateError {
    return new DuplicateError(entityType, undefined, undefined, compositeKey);
  }

  /**
   * Creates a DuplicateError for a Trip name.
   *
   * @param tripName - The duplicate trip name
   * @returns A new DuplicateError instance
   */
  public static tripNameExists(tripName: string): DuplicateError {
    return DuplicateError.forField('Trip', 'name', tripName);
  }

  /**
   * Creates a DuplicateError for a Participant in a Trip.
   *
   * @param participantName - The participant name
   * @param tripId - The trip ID
   * @returns A new DuplicateError instance
   */
  public static participantExistsInTrip(
    participantName: string,
    tripId: string
  ): DuplicateError {
    return DuplicateError.forCompositeKey('Participant', {
      name: participantName,
      tripId,
    });
  }

  /**
   * Creates a DuplicateError for a Product name.
   *
   * @param productName - The duplicate product name
   * @returns A new DuplicateError instance
   */
  public static productNameExists(productName: string): DuplicateError {
    return DuplicateError.forField('Product', 'name', productName);
  }

  /**
   * Creates a DuplicateError for an Availability entry.
   *
   * @param participantId - The participant ID
   * @param tripId - The trip ID
   * @param date - The date
   * @returns A new DuplicateError instance
   */
  public static availabilityExists(
    participantId: string,
    tripId: string,
    date: string
  ): DuplicateError {
    return DuplicateError.forCompositeKey('Availability', {
      participantId,
      tripId,
      date,
    });
  }

  /**
   * Type guard to check if an error is a DuplicateError.
   *
   * @param error - The error to check
   * @returns True if the error is a DuplicateError instance
   */
  public static isDuplicateError(error: unknown): error is DuplicateError {
    return error instanceof DuplicateError;
  }
}
