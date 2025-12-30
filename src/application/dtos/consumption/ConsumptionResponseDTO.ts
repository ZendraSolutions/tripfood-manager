/**
 * @fileoverview Data Transfer Object for Consumption response data.
 * Represents the consumption information returned to clients.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

import type { MealType } from './CreateConsumptionDTO';

/**
 * DTO representing consumption data in API responses.
 *
 * @description
 * This interface defines the structure of consumption data returned to clients.
 * It includes all consumption properties along with related entity information.
 *
 * @example
 * ```typescript
 * const consumptionResponse: ConsumptionResponseDTO = {
 *   id: 'consumption-123',
 *   tripId: 'trip-456',
 *   participantId: 'participant-789',
 *   participantName: 'John Doe',
 *   productId: 'product-012',
 *   productName: 'Mineral Water',
 *   date: new Date('2024-07-15'),
 *   quantity: 2,
 *   mealType: MealType.LUNCH,
 *   notes: 'With lunch',
 *   createdAt: new Date('2024-01-15'),
 *   updatedAt: new Date('2024-01-15'),
 * };
 * ```
 */
export interface ConsumptionResponseDTO {
  /**
   * Unique identifier of the consumption record.
   */
  readonly id: string;

  /**
   * ID of the trip this consumption belongs to.
   */
  readonly tripId: string;

  /**
   * ID of the participant.
   */
  readonly participantId: string;

  /**
   * Name of the participant for display purposes.
   */
  readonly participantName: string;

  /**
   * ID of the product consumed.
   */
  readonly productId: string;

  /**
   * Name of the product for display purposes.
   */
  readonly productName: string;

  /**
   * Date of the consumption.
   */
  readonly date: Date;

  /**
   * Quantity consumed.
   */
  readonly quantity: number;

  /**
   * Type of meal.
   */
  readonly mealType: MealType;

  /**
   * Notes about the consumption.
   */
  readonly notes?: string;

  /**
   * Timestamp when the record was created.
   */
  readonly createdAt: Date;

  /**
   * Timestamp when the record was last updated.
   */
  readonly updatedAt: Date;
}

/**
 * DTO for consumption summary by date.
 *
 * @description
 * Aggregated consumption data for a specific date.
 */
export interface ConsumptionByDateDTO {
  /**
   * The date for this summary.
   */
  readonly date: Date;

  /**
   * Number of participants consuming on this date.
   */
  readonly participantCount: number;

  /**
   * Total consumption records for this date.
   */
  readonly totalConsumptions: number;

  /**
   * Breakdown by meal type.
   */
  readonly byMealType: ReadonlyArray<{
    readonly mealType: MealType;
    readonly count: number;
  }>;
}

/**
 * DTO for consumption summary by participant.
 *
 * @description
 * Aggregated consumption data for a specific participant.
 */
export interface ConsumptionByParticipantDTO {
  /**
   * Participant identifier.
   */
  readonly participantId: string;

  /**
   * Participant name.
   */
  readonly participantName: string;

  /**
   * Total consumption records for this participant.
   */
  readonly totalConsumptions: number;

  /**
   * Products consumed by this participant.
   */
  readonly products: ReadonlyArray<{
    readonly productId: string;
    readonly productName: string;
    readonly totalQuantity: number;
  }>;
}
