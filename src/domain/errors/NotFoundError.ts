/**
 * @fileoverview Not found error class for TripFood Manager.
 * Used when a requested entity cannot be found in the repository.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

import { DomainError, DomainErrorCode } from './DomainError';

/**
 * Error thrown when a requested entity cannot be found.
 *
 * @description
 * This error is used when attempting to retrieve, update, or delete
 * an entity that does not exist in the repository. It provides
 * context about which entity type and identifier were requested.
 *
 * @example
 * ```typescript
 * // Basic usage
 * throw new NotFoundError('Trip', 'abc-123');
 *
 * // Using factory method
 * throw NotFoundError.forEntity('Participant', 'participant-456');
 *
 * // For queries
 * throw NotFoundError.forQuery('Trip', { status: 'active', ownerId: 'user-123' });
 * ```
 *
 * @extends DomainError
 */
export class NotFoundError extends DomainError {
  /**
   * The type of entity that was not found.
   * @readonly
   */
  public readonly entityType: string;

  /**
   * The identifier used to search for the entity.
   * @readonly
   */
  public readonly entityId?: string | undefined;

  /**
   * The search criteria used when querying (for multi-criteria searches).
   * @readonly
   */
  public readonly searchCriteria?: Record<string, unknown> | undefined;

  /**
   * Creates a new NotFoundError instance.
   *
   * @param entityType - The type of entity that was not found (e.g., 'Trip', 'Participant')
   * @param entityId - The identifier of the entity that was searched for (optional)
   * @param searchCriteria - Search criteria used when querying (optional)
   */
  constructor(
    entityType: string,
    entityId?: string,
    searchCriteria?: Record<string, unknown>
  ) {
    const message = NotFoundError.buildMessage(entityType, entityId, searchCriteria);

    const details: Record<string, unknown> = {
      entityType,
    };

    if (entityId !== undefined) {
      details['entityId'] = entityId;
    }

    if (searchCriteria !== undefined) {
      details['searchCriteria'] = searchCriteria;
    }

    super(message, DomainErrorCode.NOT_FOUND_ERROR, details);

    this.entityType = entityType;
    this.entityId = entityId;
    this.searchCriteria = searchCriteria;
  }

  /**
   * Builds the error message based on provided parameters.
   *
   * @param entityType - The type of entity
   * @param entityId - The entity identifier (optional)
   * @param searchCriteria - Search criteria (optional)
   * @returns Formatted error message
   */
  private static buildMessage(
    entityType: string,
    entityId?: string,
    searchCriteria?: Record<string, unknown>
  ): string {
    if (entityId !== undefined) {
      return `${entityType} with ID '${entityId}' was not found`;
    }

    if (searchCriteria !== undefined) {
      const criteriaString = Object.entries(searchCriteria)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(', ');
      return `${entityType} matching criteria {${criteriaString}} was not found`;
    }

    return `${entityType} was not found`;
  }

  /**
   * Creates a NotFoundError for an entity with a specific ID.
   *
   * @param entityType - The type of entity
   * @param entityId - The entity identifier
   * @returns A new NotFoundError instance
   *
   * @example
   * ```typescript
   * throw NotFoundError.forEntity('Trip', 'trip-123');
   * // Message: "Trip with ID 'trip-123' was not found"
   * ```
   */
  public static forEntity(entityType: string, entityId: string): NotFoundError {
    return new NotFoundError(entityType, entityId);
  }

  /**
   * Creates a NotFoundError for an entity with a specific ID.
   * Alias for forEntity method.
   *
   * @param entityType - The type of entity
   * @param entityId - The entity identifier
   * @returns A new NotFoundError instance
   *
   * @example
   * ```typescript
   * throw NotFoundError.withId('Trip', 'trip-123');
   * // Message: "Trip with ID 'trip-123' was not found"
   * ```
   */
  public static withId(entityType: string, entityId: string): NotFoundError {
    return NotFoundError.forEntity(entityType, entityId);
  }

  /**
   * Creates a NotFoundError for a query that returned no results.
   *
   * @param entityType - The type of entity
   * @param searchCriteria - The search criteria used
   * @returns A new NotFoundError instance
   *
   * @example
   * ```typescript
   * throw NotFoundError.forQuery('Participant', { tripId: 'trip-123', email: 'test@example.com' });
   * // Message: "Participant matching criteria {tripId="trip-123", email="test@example.com"} was not found"
   * ```
   */
  public static forQuery(
    entityType: string,
    searchCriteria: Record<string, unknown>
  ): NotFoundError {
    return new NotFoundError(entityType, undefined, searchCriteria);
  }

  /**
   * Creates a NotFoundError for a Trip entity.
   *
   * @param tripId - The trip identifier
   * @returns A new NotFoundError instance
   */
  public static tripNotFound(tripId: string): NotFoundError {
    return NotFoundError.forEntity('Trip', tripId);
  }

  /**
   * Creates a NotFoundError for a Participant entity.
   *
   * @param participantId - The participant identifier
   * @returns A new NotFoundError instance
   */
  public static participantNotFound(participantId: string): NotFoundError {
    return NotFoundError.forEntity('Participant', participantId);
  }

  /**
   * Creates a NotFoundError for a Product entity.
   *
   * @param productId - The product identifier
   * @returns A new NotFoundError instance
   */
  public static productNotFound(productId: string): NotFoundError {
    return NotFoundError.forEntity('Product', productId);
  }

  /**
   * Creates a NotFoundError for a Consumption entity.
   *
   * @param consumptionId - The consumption identifier
   * @returns A new NotFoundError instance
   */
  public static consumptionNotFound(consumptionId: string): NotFoundError {
    return NotFoundError.forEntity('Consumption', consumptionId);
  }

  /**
   * Creates a NotFoundError for an Availability entity.
   *
   * @param availabilityId - The availability identifier
   * @returns A new NotFoundError instance
   */
  public static availabilityNotFound(availabilityId: string): NotFoundError {
    return NotFoundError.forEntity('Availability', availabilityId);
  }

  /**
   * Type guard to check if an error is a NotFoundError.
   *
   * @param error - The error to check
   * @returns True if the error is a NotFoundError instance
   */
  public static isNotFoundError(error: unknown): error is NotFoundError {
    return error instanceof NotFoundError;
  }
}
