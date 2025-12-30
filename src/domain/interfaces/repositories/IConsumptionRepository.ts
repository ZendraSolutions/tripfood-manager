/**
 * @fileoverview Consumption Repository Interface.
 * Defines the contract for Consumption persistence operations following DDD principles.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

import { Consumption, IConsumptionUpdateDTO } from '../../entities/Consumption';
import { MealType, IDateRange } from '../../types';
import { IBaseRepository } from './IBaseRepository';

/**
 * Consumption-specific query filters.
 */
export interface IConsumptionQueryFilters {
  /** Filter by trip ID */
  readonly tripId?: string;
  /** Filter by participant ID */
  readonly participantId?: string;
  /** Filter by product ID */
  readonly productId?: string;
  /** Filter by meal type */
  readonly meal?: MealType;
  /** Filter by date */
  readonly date?: Date;
  /** Filter by date range */
  readonly dateRange?: IDateRange;
}

/**
 * Aggregated consumption data for reporting.
 */
export interface IConsumptionSummary {
  /** The product ID */
  readonly productId: string;
  /** Total quantity consumed */
  readonly totalQuantity: number;
  /** Number of consumption records */
  readonly consumptionCount: number;
  /** Number of unique participants */
  readonly uniqueParticipants: number;
}

/**
 * Repository interface for Consumption entity persistence operations.
 *
 * @description
 * This interface extends the base repository with Consumption-specific
 * query methods. Consumptions track what participants consume during
 * a trip, linking trips, participants, and products together.
 *
 * @example
 * ```typescript
 * // Usage in application service
 * class ConsumptionService {
 *   constructor(private readonly consumptionRepository: IConsumptionRepository) {}
 *
 *   async getTripConsumptions(tripId: string): Promise<Consumption[]> {
 *     return this.consumptionRepository.findByTripId(tripId);
 *   }
 * }
 * ```
 *
 * @extends {IBaseRepository<Consumption>}
 */
export interface IConsumptionRepository extends IBaseRepository<Consumption> {
  /**
   * Retrieves all consumptions for a specific trip.
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to array of consumptions in the trip
   *
   * @example
   * ```typescript
   * const consumptions = await consumptionRepository.findByTripId('trip-123');
   * ```
   */
  findByTripId(tripId: string): Promise<Consumption[]>;

  /**
   * Retrieves all consumptions by a specific participant.
   *
   * @param participantId - The participant's unique identifier
   * @returns Promise resolving to array of consumptions by the participant
   *
   * @example
   * ```typescript
   * const consumptions = await consumptionRepository.findByParticipantId('participant-123');
   * ```
   */
  findByParticipantId(participantId: string): Promise<Consumption[]>;

  /**
   * Retrieves all consumptions of a specific product.
   *
   * @param productId - The product's unique identifier
   * @returns Promise resolving to array of consumptions of the product
   *
   * @example
   * ```typescript
   * const consumptions = await consumptionRepository.findByProductId('product-123');
   * ```
   */
  findByProductId(productId: string): Promise<Consumption[]>;

  /**
   * Retrieves consumptions for a specific trip on a specific date.
   *
   * @param tripId - The trip's unique identifier
   * @param date - The date to filter by
   * @returns Promise resolving to array of consumptions on that date
   *
   * @example
   * ```typescript
   * const consumptions = await consumptionRepository.findByTripIdAndDate(
   *   'trip-123',
   *   new Date('2024-07-15')
   * );
   * ```
   */
  findByTripIdAndDate(tripId: string, date: Date): Promise<Consumption[]>;

  /**
   * Retrieves consumptions for a specific trip and meal type.
   *
   * @param tripId - The trip's unique identifier
   * @param meal - The meal type to filter by
   * @returns Promise resolving to array of consumptions for that meal
   *
   * @example
   * ```typescript
   * const lunchConsumptions = await consumptionRepository.findByTripIdAndMeal(
   *   'trip-123',
   *   'lunch'
   * );
   * ```
   */
  findByTripIdAndMeal(tripId: string, meal: MealType): Promise<Consumption[]>;

  /**
   * Retrieves consumptions for a specific participant on a specific date.
   *
   * @param participantId - The participant's unique identifier
   * @param date - The date to filter by
   * @returns Promise resolving to array of consumptions
   *
   * @example
   * ```typescript
   * const consumptions = await consumptionRepository.findByParticipantIdAndDate(
   *   'participant-123',
   *   new Date('2024-07-15')
   * );
   * ```
   */
  findByParticipantIdAndDate(participantId: string, date: Date): Promise<Consumption[]>;

  /**
   * Retrieves consumptions for a trip within a date range.
   *
   * @param tripId - The trip's unique identifier
   * @param dateRange - The date range to filter by
   * @returns Promise resolving to array of consumptions in the range
   *
   * @example
   * ```typescript
   * const consumptions = await consumptionRepository.findByTripIdAndDateRange(
   *   'trip-123',
   *   { startDate: new Date('2024-07-01'), endDate: new Date('2024-07-31') }
   * );
   * ```
   */
  findByTripIdAndDateRange(tripId: string, dateRange: IDateRange): Promise<Consumption[]>;

  /**
   * Partially updates a consumption with the given fields.
   *
   * @param id - The consumption's unique identifier
   * @param updates - Object containing fields to update
   * @returns Promise resolving to the updated consumption, or null if not found
   *
   * @example
   * ```typescript
   * const updated = await consumptionRepository.partialUpdate('consumption-123', {
   *   quantity: 3,
   *   meal: 'dinner',
   * });
   * ```
   */
  partialUpdate(id: string, updates: IConsumptionUpdateDTO): Promise<Consumption | null>;

  /**
   * Deletes all consumptions for a specific trip.
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to the number of consumptions deleted
   *
   * @example
   * ```typescript
   * const deletedCount = await consumptionRepository.deleteByTripId('trip-123');
   * ```
   */
  deleteByTripId(tripId: string): Promise<number>;

  /**
   * Deletes all consumptions by a specific participant.
   *
   * @param participantId - The participant's unique identifier
   * @returns Promise resolving to the number of consumptions deleted
   *
   * @example
   * ```typescript
   * const deletedCount = await consumptionRepository.deleteByParticipantId('participant-123');
   * ```
   */
  deleteByParticipantId(participantId: string): Promise<number>;

  /**
   * Deletes all consumptions of a specific product.
   *
   * @param productId - The product's unique identifier
   * @returns Promise resolving to the number of consumptions deleted
   *
   * @example
   * ```typescript
   * const deletedCount = await consumptionRepository.deleteByProductId('product-123');
   * ```
   */
  deleteByProductId(productId: string): Promise<number>;

  /**
   * Counts consumptions for a specific trip.
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to the count
   *
   * @example
   * ```typescript
   * const count = await consumptionRepository.countByTripId('trip-123');
   * ```
   */
  countByTripId(tripId: string): Promise<number>;

  /**
   * Finds consumptions using complex filters.
   *
   * @param filters - The filter criteria
   * @returns Promise resolving to array of matching consumptions
   *
   * @example
   * ```typescript
   * const consumptions = await consumptionRepository.findWithFilters({
   *   tripId: 'trip-123',
   *   meal: 'breakfast',
   *   dateRange: { startDate: new Date(), endDate: new Date() },
   * });
   * ```
   */
  findWithFilters(filters: IConsumptionQueryFilters): Promise<Consumption[]>;

  /**
   * Gets a summary of consumption by product for a trip.
   *
   * @param tripId - The trip's unique identifier
   * @returns Promise resolving to array of consumption summaries
   *
   * @example
   * ```typescript
   * const summary = await consumptionRepository.getSummaryByProduct('trip-123');
   * summary.forEach(s => {
   *   console.log(`Product ${s.productId}: ${s.totalQuantity} total`);
   * });
   * ```
   */
  getSummaryByProduct(tripId: string): Promise<IConsumptionSummary[]>;

  /**
   * Gets total consumption quantity for a specific product in a trip.
   *
   * @param tripId - The trip's unique identifier
   * @param productId - The product's unique identifier
   * @returns Promise resolving to total quantity consumed
   *
   * @example
   * ```typescript
   * const total = await consumptionRepository.getTotalQuantityByProduct(
   *   'trip-123',
   *   'product-123'
   * );
   * ```
   */
  getTotalQuantityByProduct(tripId: string, productId: string): Promise<number>;
}
