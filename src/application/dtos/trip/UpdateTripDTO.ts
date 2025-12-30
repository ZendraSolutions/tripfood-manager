/**
 * @fileoverview Data Transfer Object for updating an existing Trip.
 * All fields are optional to support partial updates.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

/**
 * DTO for updating an existing trip in the system.
 *
 * @description
 * This interface defines the contract for trip update requests.
 * All fields are optional, allowing for partial updates.
 * Only the provided fields will be updated.
 *
 * @example
 * ```typescript
 * // Update only the name
 * const updateNameDto: UpdateTripDTO = {
 *   name: 'New Trip Name',
 * };
 *
 * // Update dates
 * const updateDatesDto: UpdateTripDTO = {
 *   startDate: new Date('2024-07-05'),
 *   endDate: new Date('2024-07-10'),
 * };
 * ```
 */
export interface UpdateTripDTO {
  /**
   * Updated name of the trip.
   * If provided, must be non-empty and descriptive.
   * @minLength 1
   * @maxLength 100
   */
  readonly name?: string;

  /**
   * Updated description of the trip.
   * Can be set to undefined to remove the description.
   * @maxLength 500
   */
  readonly description?: string;

  /**
   * Updated start date of the trip.
   * If provided, must be validated against the end date.
   */
  readonly startDate?: Date;

  /**
   * Updated end date of the trip.
   * If provided, must be validated against the start date.
   */
  readonly endDate?: Date;
}
