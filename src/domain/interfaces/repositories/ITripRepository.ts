/**
 * @fileoverview Trip Repository Interface.
 * Defines the contract for Trip persistence operations following DDD principles.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

import { Trip, ITripUpdateDTO } from '../../entities/Trip';
import { IBaseRepository } from './IBaseRepository';

/**
 * Trip-specific query filters.
 */
export interface ITripQueryFilters {
  /** Filter by trip name (partial match, case-insensitive) */
  readonly name?: string;
  /** Filter by date range - trips that overlap with this range */
  readonly startDate?: Date;
  readonly endDate?: Date;
  /** Filter by status */
  readonly status?: 'active' | 'upcoming' | 'past' | 'all';
}

/**
 * Repository interface for Trip entity persistence operations.
 *
 * @description
 * This interface extends the base repository with Trip-specific
 * query methods. It follows DDD principles by:
 * - Working with domain entities (not infrastructure types)
 * - Providing domain-meaningful query methods
 * - Keeping the interface independent of storage implementation
 *
 * Implementations of this interface will be provided by the
 * infrastructure layer (e.g., IndexedDB, REST API).
 *
 * @example
 * ```typescript
 * // Usage in application service
 * class TripService {
 *   constructor(private readonly tripRepository: ITripRepository) {}
 *
 *   async getActiveTrips(): Promise<Trip[]> {
 *     return this.tripRepository.findActive();
 *   }
 * }
 * ```
 *
 * @extends {IBaseRepository<Trip>}
 */
export interface ITripRepository extends IBaseRepository<Trip> {
  /**
   * Finds trips by name using partial matching (case-insensitive).
   *
   * @param name - The name or partial name to search for
   * @returns Promise resolving to array of matching trips
   *
   * @example
   * ```typescript
   * const trips = await tripRepository.findByName('summer');
   * // Returns trips like "Summer Vacation", "Summer 2024", etc.
   * ```
   */
  findByName(name: string): Promise<Trip[]>;

  /**
   * Finds trips that are active on a specific date.
   * A trip is active if the date falls between its start and end dates.
   *
   * @param date - The date to check
   * @returns Promise resolving to array of trips active on that date
   *
   * @example
   * ```typescript
   * const activeTrips = await tripRepository.findByDate(new Date());
   * ```
   */
  findByDate(date: Date): Promise<Trip[]>;

  /**
   * Finds trips that overlap with a date range.
   *
   * @param startDate - Start of the date range
   * @param endDate - End of the date range
   * @returns Promise resolving to array of trips in the range
   *
   * @example
   * ```typescript
   * const trips = await tripRepository.findByDateRange(
   *   new Date('2024-06-01'),
   *   new Date('2024-08-31')
   * );
   * ```
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<Trip[]>;

  /**
   * Gets all trips ordered by start date (most recent first).
   *
   * @returns Promise resolving to array of trips sorted by start date descending
   *
   * @example
   * ```typescript
   * const sortedTrips = await tripRepository.findAllOrderedByStartDate();
   * ```
   */
  findAllOrderedByStartDate(): Promise<Trip[]>;

  /**
   * Finds trips that are currently active (today's date is within trip dates).
   *
   * @returns Promise resolving to array of currently active trips
   *
   * @example
   * ```typescript
   * const activeTrips = await tripRepository.findActive();
   * ```
   */
  findActive(): Promise<Trip[]>;

  /**
   * Finds trips that haven't started yet.
   *
   * @returns Promise resolving to array of upcoming trips
   *
   * @example
   * ```typescript
   * const upcomingTrips = await tripRepository.findUpcoming();
   * ```
   */
  findUpcoming(): Promise<Trip[]>;

  /**
   * Finds trips that have already ended.
   *
   * @returns Promise resolving to array of past trips
   *
   * @example
   * ```typescript
   * const pastTrips = await tripRepository.findPast();
   * ```
   */
  findPast(): Promise<Trip[]>;

  /**
   * Partially updates a trip with the given fields.
   * This method allows updating specific fields without requiring
   * the full entity.
   *
   * @param id - The trip's unique identifier
   * @param updates - Object containing fields to update
   * @returns Promise resolving to the updated trip, or null if not found
   *
   * @example
   * ```typescript
   * const updated = await tripRepository.partialUpdate('trip-123', {
   *   name: 'Updated Trip Name',
   *   description: 'New description',
   * });
   * ```
   */
  partialUpdate(id: string, updates: ITripUpdateDTO): Promise<Trip | null>;

  /**
   * Checks if a trip with the given name already exists.
   * Useful for preventing duplicate trip names.
   *
   * @param name - The trip name to check
   * @param excludeId - Optional trip ID to exclude from the check (for updates)
   * @returns Promise resolving to true if a trip with that name exists
   *
   * @example
   * ```typescript
   * if (await tripRepository.existsByName('Summer Vacation')) {
   *   throw new DuplicateError('Trip', 'name', 'Summer Vacation');
   * }
   * ```
   */
  existsByName(name: string, excludeId?: string): Promise<boolean>;

  /**
   * Finds trips using complex filters.
   *
   * @param filters - The filter criteria
   * @returns Promise resolving to array of matching trips
   *
   * @example
   * ```typescript
   * const trips = await tripRepository.findWithFilters({
   *   name: 'vacation',
   *   status: 'upcoming',
   * });
   * ```
   */
  findWithFilters(filters: ITripQueryFilters): Promise<Trip[]>;
}
