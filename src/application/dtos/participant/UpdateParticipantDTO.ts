/**
 * @fileoverview Data Transfer Object for updating an existing Participant.
 * All fields are optional to support partial updates.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

/**
 * DTO for updating an existing participant in the system.
 *
 * @description
 * This interface defines the contract for participant update requests.
 * All fields are optional, allowing for partial updates.
 * Note: tripId cannot be updated after creation.
 *
 * @example
 * ```typescript
 * // Update only the name
 * const updateNameDto: UpdateParticipantDTO = {
 *   name: 'Jane Doe',
 * };
 *
 * // Update contact information
 * const updateContactDto: UpdateParticipantDTO = {
 *   email: 'jane.new@example.com',
 *   phone: '+9876543210',
 * };
 * ```
 */
export interface UpdateParticipantDTO {
  /**
   * Updated name of the participant.
   * If provided, must be non-empty.
   * @minLength 1
   * @maxLength 100
   */
  readonly name?: string;

  /**
   * Updated email address.
   * If provided, must be a valid email format.
   */
  readonly email?: string;

  /**
   * Updated phone number.
   */
  readonly phone?: string;

  /**
   * Updated dietary restrictions or preferences.
   * Replaces the entire list if provided.
   */
  readonly dietaryRestrictions?: ReadonlyArray<string>;

  /**
   * Updated notes about the participant.
   * @maxLength 500
   */
  readonly notes?: string;
}
