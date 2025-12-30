/**
 * @fileoverview Participant Repository Interface.
 * Defines the contract for Participant persistence operations following DDD principles.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

import { Participant, IParticipantUpdateDTO } from '../../entities/Participant';
import { IBaseRepository } from './IBaseRepository';

/**
 * Participant-specific query filters.
 */
export interface IParticipantQueryFilters {
  /** Filter by trip ID */
  readonly tripId?: string;
  /** Filter by name (partial match, case-insensitive) */
  readonly name?: string;
  /** Filter by email (partial match, case-insensitive) */
  readonly email?: string;
}

/**
 * Repository interface for Participant entity persistence operations.
 *
 * @description
 * This interface extends the base repository with Participant-specific
 * query methods. Participants are always associated with a trip, so
 * most query methods support filtering by trip ID.
 *
 * @example
 * ```typescript
 * // Usage in application service
 * class ParticipantService {
 *   constructor(private readonly participantRepository: IParticipantRepository) {}
 *
 *   async getTripParticipants(tripId: string): Promise<Participant[]> {
 *     return this.participantRepository.findByTripId(tripId);
 *   }
 * }
 * ```
 *
 * @extends {IBaseRepository<Participant>}
 */
export interface IParticipantRepository extends IBaseRepository<Participant> {
  /**
   * Retrieves all participants for a specific trip.
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to array of participants in the trip
   *
   * @example
   * ```typescript
   * const participants = await participantRepository.findByTripId('trip-123');
   * ```
   */
  findByTripId(tripId: string): Promise<Participant[]>;

  /**
   * Finds participants by name using partial matching (case-insensitive).
   *
   * @param name - The name or partial name to search for
   * @returns Promise resolving to array of matching participants
   *
   * @example
   * ```typescript
   * const participants = await participantRepository.findByName('john');
   * ```
   */
  findByName(name: string): Promise<Participant[]>;

  /**
   * Finds a participant by exact name within a specific trip.
   * Useful for checking duplicates within a trip.
   *
   * @param tripId - The trip's unique identifier
   * @param name - The exact name to search for
   * @returns Promise resolving to the participant if found, null otherwise
   *
   * @example
   * ```typescript
   * const participant = await participantRepository.findByTripIdAndName(
   *   'trip-123',
   *   'John Doe'
   * );
   * ```
   */
  findByTripIdAndName(tripId: string, name: string): Promise<Participant | null>;

  /**
   * Finds participants by email using partial matching (case-insensitive).
   *
   * @param email - The email or partial email to search for
   * @returns Promise resolving to array of matching participants
   *
   * @example
   * ```typescript
   * const participants = await participantRepository.findByEmail('@company.com');
   * ```
   */
  findByEmail(email: string): Promise<Participant[]>;

  /**
   * Counts the number of participants in a specific trip.
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to the count of participants
   *
   * @example
   * ```typescript
   * const count = await participantRepository.countByTripId('trip-123');
   * ```
   */
  countByTripId(tripId: string): Promise<number>;

  /**
   * Partially updates a participant with the given fields.
   *
   * @param id - The participant's unique identifier
   * @param updates - Object containing fields to update
   * @returns Promise resolving to the updated participant, or null if not found
   *
   * @example
   * ```typescript
   * const updated = await participantRepository.partialUpdate('participant-123', {
   *   name: 'New Name',
   *   notes: 'Updated notes',
   * });
   * ```
   */
  partialUpdate(id: string, updates: IParticipantUpdateDTO): Promise<Participant | null>;

  /**
   * Deletes all participants associated with a specific trip.
   * Useful when deleting a trip and all its related data.
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to the number of participants deleted
   *
   * @example
   * ```typescript
   * const deletedCount = await participantRepository.deleteByTripId('trip-123');
   * console.log(`Deleted ${deletedCount} participants`);
   * ```
   */
  deleteByTripId(tripId: string): Promise<number>;

  /**
   * Checks if a participant with the given name exists in a trip.
   *
   * @param tripId - The trip's unique identifier
   * @param name - The participant name to check
   * @param excludeId - Optional participant ID to exclude (for updates)
   * @returns Promise resolving to true if participant exists
   *
   * @example
   * ```typescript
   * if (await participantRepository.existsInTrip('trip-123', 'John Doe')) {
   *   throw new DuplicateError('Participant', 'name', 'John Doe');
   * }
   * ```
   */
  existsInTrip(tripId: string, name: string, excludeId?: string): Promise<boolean>;

  /**
   * Finds participants using complex filters.
   *
   * @param filters - The filter criteria
   * @returns Promise resolving to array of matching participants
   *
   * @example
   * ```typescript
   * const participants = await participantRepository.findWithFilters({
   *   tripId: 'trip-123',
   *   name: 'john',
   * });
   * ```
   */
  findWithFilters(filters: IParticipantQueryFilters): Promise<Participant[]>;

  /**
   * Gets participants ordered by name within a trip.
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to array of participants sorted by name
   */
  findByTripIdOrderedByName(tripId: string): Promise<Participant[]>;
}
