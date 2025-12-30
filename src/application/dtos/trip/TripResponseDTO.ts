/**
 * @fileoverview Data Transfer Object for Trip response data.
 * Represents the trip information returned to clients.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

/**
 * DTO representing trip data in API responses.
 *
 * @description
 * This interface defines the structure of trip data returned to clients.
 * It includes all trip properties along with computed metadata.
 *
 * @example
 * ```typescript
 * const tripResponse: TripResponseDTO = {
 *   id: 'trip-123',
 *   name: 'Summer Beach Trip',
 *   description: 'Annual beach trip',
 *   startDate: new Date('2024-07-01'),
 *   endDate: new Date('2024-07-07'),
 *   durationDays: 7,
 *   participantCount: 5,
 *   createdAt: new Date('2024-01-15'),
 *   updatedAt: new Date('2024-01-20'),
 * };
 * ```
 */
export interface TripResponseDTO {
  /**
   * Unique identifier of the trip.
   */
  readonly id: string;

  /**
   * Name of the trip.
   */
  readonly name: string;

  /**
   * Optional description of the trip.
   */
  readonly description?: string;

  /**
   * Start date of the trip.
   */
  readonly startDate: Date;

  /**
   * End date of the trip.
   */
  readonly endDate: Date;

  /**
   * Computed duration of the trip in days.
   * Calculated as the difference between end and start dates.
   */
  readonly durationDays: number;

  /**
   * Number of participants in the trip.
   * Useful for quick reference without loading participant details.
   */
  readonly participantCount: number;

  /**
   * Timestamp when the trip was created.
   */
  readonly createdAt: Date;

  /**
   * Timestamp when the trip was last updated.
   */
  readonly updatedAt: Date;
}

/**
 * DTO for detailed trip response including related entities.
 *
 * @description
 * Extended trip response that includes summary information
 * about related entities like participants and products.
 */
export interface TripDetailResponseDTO extends TripResponseDTO {
  /**
   * Summary of participants in the trip.
   */
  readonly participants: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
  }>;

  /**
   * Count of products associated with the trip.
   */
  readonly productCount: number;

  /**
   * Total consumption records for the trip.
   */
  readonly consumptionCount: number;
}
