/**
 * @fileoverview Availability Repository Interface
 * Defines the contract for availability data persistence operations
 * @module domain/repositories/AvailabilityRepository
 */

import type { Availability } from '@domain/entities/Availability';

/**
 * Interface for Availability repository operations
 * Following Repository pattern for domain-driven design
 */
export interface AvailabilityRepository {
  /**
   * Finds an availability by its unique identifier
   * @param id - The availability's unique identifier
   * @returns The availability if found, null otherwise
   */
  findById(id: string): Promise<Availability | null>;

  /**
   * Retrieves all availabilities for a specific trip
   * @param tripId - The trip's unique identifier
   * @returns Array of availabilities for the trip
   */
  findByTripId(tripId: string): Promise<Availability[]>;

  /**
   * Retrieves availabilities for a specific participant
   * @param participantId - The participant's unique identifier
   * @returns Array of availabilities for the participant
   */
  findByParticipantId(participantId: string): Promise<Availability[]>;

  /**
   * Retrieves availabilities for a specific trip and date
   * @param tripId - The trip's unique identifier
   * @param date - The date to filter by
   * @returns Array of availabilities for the trip on that date
   */
  findByTripIdAndDate(tripId: string, date: Date): Promise<Availability[]>;

  /**
   * Retrieves availability for a specific participant and date
   * @param participantId - The participant's unique identifier
   * @param date - The date to filter by
   * @returns The availability if found, null otherwise
   */
  findByParticipantIdAndDate(participantId: string, date: Date): Promise<Availability | null>;

  /**
   * Retrieves all availabilities
   * @returns Array of all availabilities
   */
  findAll(): Promise<Availability[]>;

  /**
   * Saves a new availability
   * @param availability - The availability entity to save
   * @returns The saved availability
   */
  save(availability: Availability): Promise<Availability>;

  /**
   * Updates an existing availability
   * @param availability - The availability entity with updated data
   * @returns The updated availability
   */
  update(availability: Availability): Promise<Availability>;

  /**
   * Deletes an availability by its identifier
   * @param id - The availability's unique identifier
   * @returns True if deleted successfully
   */
  delete(id: string): Promise<boolean>;

  /**
   * Deletes all availabilities for a specific participant
   * @param participantId - The participant's unique identifier
   * @returns Number of availabilities deleted
   */
  deleteByParticipantId(participantId: string): Promise<number>;

  /**
   * Checks if an availability exists
   * @param id - The availability's unique identifier
   * @returns True if the availability exists
   */
  exists(id: string): Promise<boolean>;
}
