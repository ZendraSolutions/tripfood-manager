/**
 * @fileoverview Data Transfer Object for creating a new Trip.
 * Contains all required and optional fields for trip creation.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

/**
 * DTO for creating a new trip in the system.
 *
 * @description
 * This interface defines the contract for trip creation requests.
 * It contains all necessary information to create a valid Trip entity.
 *
 * @example
 * ```typescript
 * const createTripDto: CreateTripDTO = {
 *   name: 'Summer Beach Trip 2024',
 *   description: 'Annual beach trip with friends',
 *   startDate: new Date('2024-07-01'),
 *   endDate: new Date('2024-07-07'),
 * };
 * ```
 */
export interface CreateTripDTO {
  /**
   * Name of the trip.
   * Must be non-empty and descriptive.
   * @minLength 1
   * @maxLength 100
   */
  readonly name: string;

  /**
   * Optional description providing more details about the trip.
   * Can include activities, goals, or special notes.
   * @maxLength 500
   */
  readonly description?: string;

  /**
   * Start date of the trip.
   * Must be a valid date, typically in the future or present.
   */
  readonly startDate: Date;

  /**
   * End date of the trip.
   * Must be equal to or after the start date.
   */
  readonly endDate: Date;
}
