/**
 * @fileoverview Data Transfer Object for Availability response data.
 * Represents availability information returned to clients.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

/**
 * Meal availability structure.
 *
 * @description
 * Represents which meals a participant is available for.
 */
export interface MealAvailabilityDTO {
  /**
   * Available for breakfast.
   */
  readonly breakfast: boolean;

  /**
   * Available for lunch.
   */
  readonly lunch: boolean;

  /**
   * Available for dinner.
   */
  readonly dinner: boolean;
}

/**
 * DTO representing availability data in API responses.
 *
 * @description
 * This interface defines the structure of availability data returned to clients.
 *
 * @example
 * ```typescript
 * const availabilityResponse: AvailabilityResponseDTO = {
 *   id: 'availability-123',
 *   tripId: 'trip-456',
 *   participantId: 'participant-789',
 *   participantName: 'John Doe',
 *   date: new Date('2024-07-15'),
 *   meals: { breakfast: true, lunch: true, dinner: false },
 *   notes: 'Leaving early',
 *   createdAt: new Date('2024-01-15'),
 *   updatedAt: new Date('2024-01-15'),
 * };
 * ```
 */
export interface AvailabilityResponseDTO {
  /**
   * Unique identifier of the availability record.
   */
  readonly id: string;

  /**
   * ID of the trip.
   */
  readonly tripId: string;

  /**
   * ID of the participant.
   */
  readonly participantId: string;

  /**
   * Name of the participant for display.
   */
  readonly participantName: string;

  /**
   * Date of availability.
   */
  readonly date: Date;

  /**
   * Meal availability.
   */
  readonly meals: MealAvailabilityDTO;

  /**
   * Notes about this availability.
   */
  readonly notes?: string;

  /**
   * Timestamp when created.
   */
  readonly createdAt: Date;

  /**
   * Timestamp when last updated.
   */
  readonly updatedAt: Date;
}

/**
 * DTO for availability summary by date.
 *
 * @description
 * Summarizes availability across all participants for a specific date.
 */
export interface AvailabilityByDateDTO {
  /**
   * The date for this summary.
   */
  readonly date: Date;

  /**
   * Total participants available on this date.
   */
  readonly totalAvailable: number;

  /**
   * Participants available for breakfast.
   */
  readonly breakfastCount: number;

  /**
   * Participants available for lunch.
   */
  readonly lunchCount: number;

  /**
   * Participants available for dinner.
   */
  readonly dinnerCount: number;

  /**
   * List of participants available on this date.
   */
  readonly participants: ReadonlyArray<{
    readonly participantId: string;
    readonly participantName: string;
    readonly meals: MealAvailabilityDTO;
  }>;
}

/**
 * DTO for availability summary by participant.
 *
 * @description
 * Summarizes a participant's availability across the trip.
 */
export interface AvailabilityByParticipantDTO {
  /**
   * Participant identifier.
   */
  readonly participantId: string;

  /**
   * Participant name.
   */
  readonly participantName: string;

  /**
   * Total days the participant is available.
   */
  readonly totalDaysAvailable: number;

  /**
   * Percentage of trip days available.
   */
  readonly availabilityPercentage: number;

  /**
   * Detailed availability by date.
   */
  readonly dates: ReadonlyArray<{
    readonly date: Date;
    readonly meals: MealAvailabilityDTO;
  }>;
}

/**
 * DTO for trip availability matrix.
 *
 * @description
 * Complete availability matrix showing all participants and dates.
 */
export interface AvailabilityMatrixDTO {
  /**
   * ID of the trip.
   */
  readonly tripId: string;

  /**
   * All dates in the trip.
   */
  readonly dates: ReadonlyArray<Date>;

  /**
   * All participants in the trip.
   */
  readonly participants: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
  }>;

  /**
   * Availability matrix: participantId -> date string -> availability
   */
  readonly matrix: Record<string, Record<string, MealAvailabilityDTO | null>>;

  /**
   * Summary statistics.
   */
  readonly summary: {
    readonly totalParticipants: number;
    readonly totalDays: number;
    readonly averageAvailability: number;
  };
}
