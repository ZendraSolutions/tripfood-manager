/**
 * @fileoverview Participant Repository Interface
 * Defines the contract for participant data persistence operations
 * @module domain/repositories/ParticipantRepository
 */

import type { Participant } from '@domain/entities/Participant';

/**
 * Interface for Participant repository operations
 * Following Repository pattern for domain-driven design
 */
export interface ParticipantRepository {
  /**
   * Finds a participant by its unique identifier
   * @param id - The participant's unique identifier
   * @returns The participant if found, null otherwise
   */
  findById(id: string): Promise<Participant | null>;

  /**
   * Retrieves all participants for a specific trip
   * @param tripId - The trip's unique identifier
   * @returns Array of participants for the trip
   */
  findByTripId(tripId: string): Promise<Participant[]>;

  /**
   * Retrieves all participants
   * @returns Array of all participants
   */
  findAll(): Promise<Participant[]>;

  /**
   * Saves a new participant
   * @param participant - The participant entity to save
   * @returns The saved participant
   */
  save(participant: Participant): Promise<Participant>;

  /**
   * Updates an existing participant
   * @param participant - The participant entity with updated data
   * @returns The updated participant
   */
  update(participant: Participant): Promise<Participant>;

  /**
   * Deletes a participant by its identifier
   * @param id - The participant's unique identifier
   * @returns True if deleted successfully
   */
  delete(id: string): Promise<boolean>;

  /**
   * Deletes all participants for a specific trip
   * @param tripId - The trip's unique identifier
   * @returns Number of participants deleted
   */
  deleteByTripId(tripId: string): Promise<number>;

  /**
   * Checks if a participant exists
   * @param id - The participant's unique identifier
   * @returns True if the participant exists
   */
  exists(id: string): Promise<boolean>;
}
