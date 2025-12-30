/**
 * @fileoverview Data Transfer Object for creating Availability records.
 * Contains DTOs for managing participant availability during trips.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

/**
 * DTO for creating a single availability record.
 *
 * @description
 * This interface defines the contract for availability creation requests.
 * An availability record indicates that a participant is present on a specific date.
 *
 * @example
 * ```typescript
 * const createAvailabilityDto: CreateAvailabilityDTO = {
 *   tripId: 'trip-123',
 *   participantId: 'participant-456',
 *   date: new Date('2024-07-15'),
 *   meals: {
 *     breakfast: true,
 *     lunch: true,
 *     dinner: false,
 *   },
 * };
 * ```
 */
export interface CreateAvailabilityDTO {
  /**
   * ID of the trip.
   * Must reference an existing trip.
   */
  readonly tripId: string;

  /**
   * ID of the participant.
   * Must reference an existing participant in the trip.
   */
  readonly participantId: string;

  /**
   * Date of availability.
   * Must be within the trip date range.
   */
  readonly date: Date;

  /**
   * Meal availability for this date.
   * Indicates which meals the participant will be present for.
   */
  readonly meals?: {
    readonly breakfast?: boolean;
    readonly lunch?: boolean;
    readonly dinner?: boolean;
  };

  /**
   * Optional notes about this availability.
   * Can include arrival/departure times, etc.
   * @maxLength 200
   */
  readonly notes?: string;
}

/**
 * DTO for creating availability for a date range.
 *
 * @description
 * Allows setting availability for multiple consecutive dates at once.
 */
export interface CreateAvailabilityRangeDTO {
  /**
   * ID of the trip.
   */
  readonly tripId: string;

  /**
   * ID of the participant.
   */
  readonly participantId: string;

  /**
   * Start date of the range (inclusive).
   */
  readonly startDate: Date;

  /**
   * End date of the range (inclusive).
   */
  readonly endDate: Date;

  /**
   * Default meal availability for all dates in the range.
   */
  readonly meals?: {
    readonly breakfast?: boolean;
    readonly lunch?: boolean;
    readonly dinner?: boolean;
  };
}

/**
 * DTO for bulk availability creation.
 *
 * @description
 * Allows creating availability records for multiple participants
 * and dates at once.
 */
export interface BulkCreateAvailabilityDTO {
  /**
   * ID of the trip.
   */
  readonly tripId: string;

  /**
   * Array of availability records to create.
   */
  readonly availabilities: ReadonlyArray<Omit<CreateAvailabilityDTO, 'tripId'>>;
}
