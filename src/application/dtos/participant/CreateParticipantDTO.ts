/**
 * @fileoverview Data Transfer Object for creating a new Participant.
 * Contains all required and optional fields for participant creation.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

/**
 * DTO for creating a new participant in a trip.
 *
 * @description
 * This interface defines the contract for participant creation requests.
 * A participant is a person who is part of a trip and can consume products.
 *
 * @example
 * ```typescript
 * const createParticipantDto: CreateParticipantDTO = {
 *   tripId: 'trip-123',
 *   name: 'John Doe',
 *   email: 'john.doe@example.com',
 *   phone: '+1234567890',
 * };
 * ```
 */
export interface CreateParticipantDTO {
  /**
   * ID of the trip this participant belongs to.
   * Must reference an existing trip.
   */
  readonly tripId: string;

  /**
   * Full name of the participant.
   * Must be non-empty.
   * @minLength 1
   * @maxLength 100
   */
  readonly name: string;

  /**
   * Optional email address of the participant.
   * If provided, must be a valid email format.
   */
  readonly email?: string;

  /**
   * Optional phone number of the participant.
   * Can be used for contact purposes.
   */
  readonly phone?: string;

  /**
   * Optional dietary restrictions or preferences.
   * Helps in planning food purchases.
   */
  readonly dietaryRestrictions?: ReadonlyArray<string>;

  /**
   * Optional notes about the participant.
   * Can include allergies, preferences, etc.
   * @maxLength 500
   */
  readonly notes?: string;
}
