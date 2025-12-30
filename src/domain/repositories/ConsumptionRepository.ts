/**
 * @fileoverview Consumption Repository Interface
 * Defines the contract for consumption data persistence operations
 * @module domain/repositories/ConsumptionRepository
 */

import type { Consumption } from '@domain/entities/Consumption';

/**
 * Interface for Consumption repository operations
 * Following Repository pattern for domain-driven design
 */
export interface ConsumptionRepository {
  /**
   * Finds a consumption by its unique identifier
   * @param id - The consumption's unique identifier
   * @returns The consumption if found, null otherwise
   */
  findById(id: string): Promise<Consumption | null>;

  /**
   * Retrieves all consumptions for a specific trip
   * @param tripId - The trip's unique identifier
   * @returns Array of consumptions for the trip
   */
  findByTripId(tripId: string): Promise<Consumption[]>;

  /**
   * Retrieves consumptions for a specific participant
   * @param participantId - The participant's unique identifier
   * @returns Array of consumptions for the participant
   */
  findByParticipantId(participantId: string): Promise<Consumption[]>;

  /**
   * Retrieves consumptions for a specific product
   * @param productId - The product's unique identifier
   * @returns Array of consumptions for the product
   */
  findByProductId(productId: string): Promise<Consumption[]>;

  /**
   * Retrieves consumptions for a specific trip and date
   * @param tripId - The trip's unique identifier
   * @param date - The date to filter by
   * @returns Array of consumptions for the trip on that date
   */
  findByTripIdAndDate(tripId: string, date: Date): Promise<Consumption[]>;

  /**
   * Retrieves all consumptions
   * @returns Array of all consumptions
   */
  findAll(): Promise<Consumption[]>;

  /**
   * Saves a new consumption
   * @param consumption - The consumption entity to save
   * @returns The saved consumption
   */
  save(consumption: Consumption): Promise<Consumption>;

  /**
   * Updates an existing consumption
   * @param consumption - The consumption entity with updated data
   * @returns The updated consumption
   */
  update(consumption: Consumption): Promise<Consumption>;

  /**
   * Deletes a consumption by its identifier
   * @param id - The consumption's unique identifier
   * @returns True if deleted successfully
   */
  delete(id: string): Promise<boolean>;

  /**
   * Deletes all consumptions for a specific trip
   * @param tripId - The trip's unique identifier
   * @returns Number of consumptions deleted
   */
  deleteByTripId(tripId: string): Promise<number>;

  /**
   * Checks if a consumption exists
   * @param id - The consumption's unique identifier
   * @returns True if the consumption exists
   */
  exists(id: string): Promise<boolean>;
}
