/**
 * @fileoverview Base repository interface defining common CRUD operations.
 * Provides a foundation for all entity-specific repositories following DDD.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

import { IPaginationParams, IPaginatedResult, ISortParams } from '../../types';

/**
 * Query options for repository operations.
 * Provides pagination and sorting capabilities.
 *
 * @typeParam T - The entity type for type-safe sorting
 */
export interface IQueryOptions<T> {
  /** Pagination parameters */
  readonly pagination?: IPaginationParams;
  /** Sorting parameters */
  readonly sort?: ISortParams<T>;
}

/**
 * Base repository interface with common CRUD operations.
 *
 * @description
 * This generic interface defines the standard operations that all
 * repositories must implement. It follows the Repository pattern
 * from Domain-Driven Design and provides type-safe access to data
 * persistence while keeping the domain layer independent of
 * infrastructure concerns.
 *
 * Key principles:
 * - Domain entities are the input/output (not DTOs or records)
 * - Async operations return Promises
 * - Null is returned when entities are not found
 * - No infrastructure-specific types leak into the domain
 *
 * @typeParam T - The domain entity type this repository manages
 *
 * @example
 * ```typescript
 * interface ITripRepository extends IBaseRepository<Trip> {
 *   findByDateRange(start: Date, end: Date): Promise<Trip[]>;
 *   findActive(): Promise<Trip[]>;
 * }
 * ```
 */
export interface IBaseRepository<T> {
  /**
   * Finds an entity by its unique identifier.
   *
   * @param id - The unique identifier of the entity
   * @returns Promise resolving to the entity if found, null otherwise
   *
   * @example
   * ```typescript
   * const trip = await tripRepository.findById('abc-123');
   * if (trip) {
   *   console.log(trip.name);
   * }
   * ```
   */
  findById(id: string): Promise<T | null>;

  /**
   * Retrieves all entities from the repository.
   *
   * @returns Promise resolving to an array of all entities
   *
   * @example
   * ```typescript
   * const allTrips = await tripRepository.findAll();
   * ```
   */
  findAll(): Promise<T[]>;

  /**
   * Saves a new entity to the repository.
   * This operation is idempotent - if the entity already exists,
   * it will be updated instead.
   *
   * @param entity - The entity to save
   * @returns Promise resolving to the saved entity
   *
   * @example
   * ```typescript
   * const trip = Trip.create({ name: 'Summer Trip', ... });
   * const savedTrip = await tripRepository.save(trip);
   * ```
   */
  save(entity: T): Promise<T>;

  /**
   * Updates an existing entity in the repository.
   *
   * @param entity - The entity with updated values
   * @returns Promise resolving to the updated entity
   * @throws {NotFoundError} If the entity does not exist
   *
   * @example
   * ```typescript
   * const updatedTrip = trip.update({ name: 'New Name' });
   * await tripRepository.update(updatedTrip);
   * ```
   */
  update(entity: T): Promise<T>;

  /**
   * Deletes an entity by its unique identifier.
   *
   * @param id - The unique identifier of the entity to delete
   * @returns Promise resolving when the entity is deleted
   *
   * @example
   * ```typescript
   * await tripRepository.delete('abc-123');
   * ```
   */
  delete(id: string): Promise<void>;

  /**
   * Checks if an entity with the given ID exists.
   *
   * @param id - The unique identifier to check
   * @returns Promise resolving to true if the entity exists, false otherwise
   *
   * @example
   * ```typescript
   * if (await tripRepository.exists('abc-123')) {
   *   console.log('Trip exists');
   * }
   * ```
   */
  exists(id: string): Promise<boolean>;

  /**
   * Counts the total number of entities in the repository.
   *
   * @returns Promise resolving to the count of entities
   *
   * @example
   * ```typescript
   * const totalTrips = await tripRepository.count();
   * ```
   */
  count(): Promise<number>;

  /**
   * Deletes multiple entities by their IDs in a single operation.
   *
   * @param ids - Array of entity IDs to delete
   * @returns Promise resolving when all entities are deleted
   *
   * @example
   * ```typescript
   * await tripRepository.deleteMany(['id-1', 'id-2', 'id-3']);
   * ```
   */
  deleteMany(ids: string[]): Promise<void>;

  /**
   * Saves multiple entities in a single transaction.
   *
   * @param entities - Array of entities to save
   * @returns Promise resolving to array of saved entities
   *
   * @example
   * ```typescript
   * const savedTrips = await tripRepository.saveMany([trip1, trip2, trip3]);
   * ```
   */
  saveMany(entities: T[]): Promise<T[]>;
}

/**
 * Extended base repository with pagination support.
 *
 * @typeParam T - The domain entity type
 */
export interface IPaginatedRepository<T> extends IBaseRepository<T> {
  /**
   * Retrieves entities with pagination.
   *
   * @param options - Query options including pagination and sorting
   * @returns Promise resolving to paginated result
   */
  findAllPaginated(options: IQueryOptions<T>): Promise<IPaginatedResult<T>>;
}
