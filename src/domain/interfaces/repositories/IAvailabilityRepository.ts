/**
 * @fileoverview Availability Repository Interface.
 * Defines the contract for Availability persistence operations following DDD principles.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

import { Availability, IAvailabilityUpdateDTO } from '../../entities/Availability';
import { MealType, IDateRange } from '../../types';
import { IBaseRepository } from './IBaseRepository';

/**
 * Availability-specific query filters.
 */
export interface IAvailabilityQueryFilters {
  /** Filter by trip ID */
  readonly tripId?: string;
  /** Filter by participant ID */
  readonly participantId?: string;
  /** Filter by date */
  readonly date?: Date;
  /** Filter by date range */
  readonly dateRange?: IDateRange;
  /** Filter by specific meal availability */
  readonly meal?: MealType;
}

/**
 * Summary of availability for a specific date/meal combination.
 */
export interface IAvailabilitySummary {
  /** The date */
  readonly date: Date;
  /** The meal type */
  readonly meal: MealType;
  /** Number of participants available */
  readonly availableCount: number;
  /** IDs of available participants */
  readonly participantIds: ReadonlyArray<string>;
}

/**
 * Repository interface for Availability entity persistence operations.
 *
 * @description
 * This interface extends the base repository with Availability-specific
 * query methods. Availability tracks which participants will be present
 * for which meals during a trip, enabling accurate food/beverage planning.
 *
 * @example
 * ```typescript
 * // Usage in application service
 * class AvailabilityService {
 *   constructor(private readonly availabilityRepository: IAvailabilityRepository) {}
 *
 *   async getParticipantAvailability(participantId: string): Promise<Availability[]> {
 *     return this.availabilityRepository.findByParticipantId(participantId);
 *   }
 * }
 * ```
 *
 * @extends {IBaseRepository<Availability>}
 */
export interface IAvailabilityRepository extends IBaseRepository<Availability> {
  /**
   * Retrieves all availabilities for a specific trip.
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to array of availabilities in the trip
   *
   * @example
   * ```typescript
   * const availabilities = await availabilityRepository.findByTripId('trip-123');
   * ```
   */
  findByTripId(tripId: string): Promise<Availability[]>;

  /**
   * Retrieves all availabilities for a specific participant.
   *
   * @param participantId - The participant's unique identifier
   * @returns Promise resolving to array of availabilities for the participant
   *
   * @example
   * ```typescript
   * const availabilities = await availabilityRepository.findByParticipantId('participant-123');
   * ```
   */
  findByParticipantId(participantId: string): Promise<Availability[]>;

  /**
   * Retrieves availabilities for a specific trip on a specific date.
   *
   * @param tripId - The trip's unique identifier
   * @param date - The date to filter by
   * @returns Promise resolving to array of availabilities on that date
   *
   * @example
   * ```typescript
   * const availabilities = await availabilityRepository.findByTripIdAndDate(
   *   'trip-123',
   *   new Date('2024-07-15')
   * );
   * ```
   */
  findByTripIdAndDate(tripId: string, date: Date): Promise<Availability[]>;

  /**
   * Retrieves availability for a specific participant on a specific date.
   * Returns null if no availability record exists.
   *
   * @param participantId - The participant's unique identifier
   * @param date - The date to filter by
   * @returns Promise resolving to the availability if found, null otherwise
   *
   * @example
   * ```typescript
   * const availability = await availabilityRepository.findByParticipantIdAndDate(
   *   'participant-123',
   *   new Date('2024-07-15')
   * );
   * ```
   */
  findByParticipantIdAndDate(participantId: string, date: Date): Promise<Availability | null>;

  /**
   * Retrieves availability for a specific participant, trip, and date.
   * Useful for checking if an availability record already exists.
   *
   * @param participantId - The participant's unique identifier
   * @param tripId - The trip's unique identifier
   * @param date - The date to filter by
   * @returns Promise resolving to the availability if found, null otherwise
   *
   * @example
   * ```typescript
   * const availability = await availabilityRepository.findByParticipantTripAndDate(
   *   'participant-123',
   *   'trip-123',
   *   new Date('2024-07-15')
   * );
   * ```
   */
  findByParticipantTripAndDate(
    participantId: string,
    tripId: string,
    date: Date
  ): Promise<Availability | null>;

  /**
   * Retrieves availabilities for a trip within a date range.
   *
   * @param tripId - The trip's unique identifier
   * @param dateRange - The date range to filter by
   * @returns Promise resolving to array of availabilities in the range
   *
   * @example
   * ```typescript
   * const availabilities = await availabilityRepository.findByTripIdAndDateRange(
   *   'trip-123',
   *   { startDate: new Date('2024-07-01'), endDate: new Date('2024-07-31') }
   * );
   * ```
   */
  findByTripIdAndDateRange(tripId: string, dateRange: IDateRange): Promise<Availability[]>;

  /**
   * Partially updates an availability with the given fields.
   *
   * @param id - The availability's unique identifier
   * @param updates - Object containing fields to update
   * @returns Promise resolving to the updated availability, or null if not found
   *
   * @example
   * ```typescript
   * const updated = await availabilityRepository.partialUpdate('availability-123', {
   *   meals: ['breakfast', 'dinner'],
   * });
   * ```
   */
  partialUpdate(id: string, updates: IAvailabilityUpdateDTO): Promise<Availability | null>;

  /**
   * Deletes all availabilities for a specific participant.
   *
   * @param participantId - The participant's unique identifier
   * @returns Promise resolving to the number of availabilities deleted
   *
   * @example
   * ```typescript
   * const deletedCount = await availabilityRepository.deleteByParticipantId('participant-123');
   * ```
   */
  deleteByParticipantId(participantId: string): Promise<number>;

  /**
   * Deletes all availabilities for a specific trip.
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to the number of availabilities deleted
   *
   * @example
   * ```typescript
   * const deletedCount = await availabilityRepository.deleteByTripId('trip-123');
   * ```
   */
  deleteByTripId(tripId: string): Promise<number>;

  /**
   * Counts availabilities for a specific trip.
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to the count
   *
   * @example
   * ```typescript
   * const count = await availabilityRepository.countByTripId('trip-123');
   * ```
   */
  countByTripId(tripId: string): Promise<number>;

  /**
   * Finds availabilities using complex filters.
   *
   * @param filters - The filter criteria
   * @returns Promise resolving to array of matching availabilities
   *
   * @example
   * ```typescript
   * const availabilities = await availabilityRepository.findWithFilters({
   *   tripId: 'trip-123',
   *   date: new Date('2024-07-15'),
   * });
   * ```
   */
  findWithFilters(filters: IAvailabilityQueryFilters): Promise<Availability[]>;

  /**
   * Gets availability summary for a trip on a specific date.
   * Returns count of participants available for each meal.
   *
   * @param tripId - The trip's unique identifier
   * @param date - The date to get summary for
   * @returns Promise resolving to array of availability summaries by meal
   *
   * @example
   * ```typescript
   * const summary = await availabilityRepository.getSummaryByDate('trip-123', new Date());
   * summary.forEach(s => {
   *   console.log(`${s.meal}: ${s.availableCount} participants`);
   * });
   * ```
   */
  getSummaryByDate(tripId: string, date: Date): Promise<IAvailabilitySummary[]>;

  /**
   * Gets the count of participants available for a specific meal on a date.
   *
   * @param tripId - The trip's unique identifier
   * @param date - The date to check
   * @param meal - The meal type to check
   * @returns Promise resolving to the count of available participants
   *
   * @example
   * ```typescript
   * const count = await availabilityRepository.countAvailableForMeal(
   *   'trip-123',
   *   new Date('2024-07-15'),
   *   'lunch'
   * );
   * ```
   */
  countAvailableForMeal(tripId: string, date: Date, meal: MealType): Promise<number>;

  /**
   * Gets participant IDs that are available for a specific meal on a date.
   *
   * @param tripId - The trip's unique identifier
   * @param date - The date to check
   * @param meal - The meal type to check
   * @returns Promise resolving to array of participant IDs
   *
   * @example
   * ```typescript
   * const participantIds = await availabilityRepository.getParticipantsAvailableForMeal(
   *   'trip-123',
   *   new Date('2024-07-15'),
   *   'dinner'
   * );
   * ```
   */
  getParticipantsAvailableForMeal(
    tripId: string,
    date: Date,
    meal: MealType
  ): Promise<string[]>;

  /**
   * Creates or updates availability for a participant on a date.
   * If an availability already exists, it will be updated.
   *
   * @param availability - The availability to upsert
   * @returns Promise resolving to the created/updated availability
   *
   * @example
   * ```typescript
   * const availability = Availability.create({
   *   participantId: 'participant-123',
   *   tripId: 'trip-123',
   *   date: new Date('2024-07-15'),
   *   meals: ['breakfast', 'lunch', 'dinner'],
   * });
   * const saved = await availabilityRepository.upsert(availability);
   * ```
   */
  upsert(availability: Availability): Promise<Availability>;
}
