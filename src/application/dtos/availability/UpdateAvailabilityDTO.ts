/**
 * @fileoverview Data Transfer Object for updating Availability records.
 * All fields are optional to support partial updates.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

/**
 * DTO for updating an existing availability record.
 *
 * @description
 * This interface defines the contract for availability update requests.
 * Only meal availability and notes can be updated.
 *
 * @example
 * ```typescript
 * // Update meal availability
 * const updateMealsDto: UpdateAvailabilityDTO = {
 *   meals: {
 *     breakfast: true,
 *     lunch: false,
 *     dinner: true,
 *   },
 * };
 *
 * // Update notes
 * const updateNotesDto: UpdateAvailabilityDTO = {
 *   notes: 'Will arrive late for dinner',
 * };
 * ```
 */
export interface UpdateAvailabilityDTO {
  /**
   * Updated meal availability.
   */
  readonly meals?: {
    readonly breakfast?: boolean;
    readonly lunch?: boolean;
    readonly dinner?: boolean;
  };

  /**
   * Updated notes about this availability.
   * @maxLength 200
   */
  readonly notes?: string;
}
