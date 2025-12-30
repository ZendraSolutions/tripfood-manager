/**
 * @fileoverview Data Transfer Object for Participant response data.
 * Represents the participant information returned to clients.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

/**
 * DTO representing participant data in API responses.
 *
 * @description
 * This interface defines the structure of participant data returned to clients.
 * It includes all participant properties along with metadata.
 *
 * @example
 * ```typescript
 * const participantResponse: ParticipantResponseDTO = {
 *   id: 'participant-123',
 *   tripId: 'trip-456',
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   phone: '+1234567890',
 *   dietaryRestrictions: ['vegetarian', 'gluten-free'],
 *   notes: 'Prefers morning coffee',
 *   createdAt: new Date('2024-01-15'),
 *   updatedAt: new Date('2024-01-20'),
 * };
 * ```
 */
export interface ParticipantResponseDTO {
  /**
   * Unique identifier of the participant.
   */
  readonly id: string;

  /**
   * ID of the trip this participant belongs to.
   */
  readonly tripId: string;

  /**
   * Full name of the participant.
   */
  readonly name: string;

  /**
   * Email address of the participant.
   */
  readonly email?: string;

  /**
   * Phone number of the participant.
   */
  readonly phone?: string;

  /**
   * Dietary restrictions or preferences.
   */
  readonly dietaryRestrictions: ReadonlyArray<string>;

  /**
   * Notes about the participant.
   */
  readonly notes?: string;

  /**
   * Timestamp when the participant was created.
   */
  readonly createdAt: Date;

  /**
   * Timestamp when the participant was last updated.
   */
  readonly updatedAt: Date;
}

/**
 * DTO for participant with availability summary.
 *
 * @description
 * Extended participant response that includes availability information.
 */
export interface ParticipantWithAvailabilityDTO extends ParticipantResponseDTO {
  /**
   * Dates when the participant is available during the trip.
   */
  readonly availableDates: ReadonlyArray<Date>;

  /**
   * Percentage of trip days the participant is available.
   */
  readonly availabilityPercentage: number;
}
