/**
 * @fileoverview Trip Repository Interface
 * Defines the contract for trip data persistence operations
 * @module domain/repositories/TripRepository
 */

import type { Trip } from '@domain/entities/Trip';

/**
 * Interface for Trip repository operations
 * Following Repository pattern for domain-driven design
 */
export interface TripRepository {
  /**
   * Finds a trip by its unique identifier
   * @param id - The trip's unique identifier
   * @returns The trip if found, null otherwise
   */
  findById(id: string): Promise<Trip | null>;

  /**
   * Retrieves all trips
   * @returns Array of all trips
   */
  findAll(): Promise<Trip[]>;

  /**
   * Saves a new trip
   * @param trip - The trip entity to save
   * @returns The saved trip
   */
  save(trip: Trip): Promise<Trip>;

  /**
   * Updates an existing trip
   * @param trip - The trip entity with updated data
   * @returns The updated trip
   */
  update(trip: Trip): Promise<Trip>;

  /**
   * Deletes a trip by its identifier
   * @param id - The trip's unique identifier
   * @returns True if deleted successfully
   */
  delete(id: string): Promise<boolean>;

  /**
   * Checks if a trip exists
   * @param id - The trip's unique identifier
   * @returns True if the trip exists
   */
  exists(id: string): Promise<boolean>;
}
