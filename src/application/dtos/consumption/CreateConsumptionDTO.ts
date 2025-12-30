/**
 * @fileoverview Data Transfer Object for creating a new Consumption record.
 * Contains all required and optional fields for consumption creation.
 *
 * @author TripFood Manager Team
 * @version 1.0.0
 */

/**
 * Meal type enumeration.
 * Identifies the meal context for consumption tracking.
 */
export enum MealType {
  /** Morning meal */
  BREAKFAST = 'BREAKFAST',
  /** Mid-day meal */
  LUNCH = 'LUNCH',
  /** Evening meal */
  DINNER = 'DINNER',
  /** Between-meal eating */
  SNACK = 'SNACK',
  /** Any time consumption */
  OTHER = 'OTHER',
}

/**
 * DTO for creating a new consumption record.
 *
 * @description
 * This interface defines the contract for consumption creation requests.
 * A consumption record tracks what products a participant consumes on a specific date.
 *
 * @example
 * ```typescript
 * const createConsumptionDto: CreateConsumptionDTO = {
 *   tripId: 'trip-123',
 *   participantId: 'participant-456',
 *   productId: 'product-789',
 *   date: new Date('2024-07-15'),
 *   quantity: 2,
 *   mealType: MealType.LUNCH,
 * };
 * ```
 */
export interface CreateConsumptionDTO {
  /**
   * ID of the trip this consumption belongs to.
   * Must reference an existing trip.
   */
  readonly tripId: string;

  /**
   * ID of the participant who will consume.
   * Must reference an existing participant in the trip.
   */
  readonly participantId: string;

  /**
   * ID of the product being consumed.
   * Must reference an existing product in the trip.
   */
  readonly productId: string;

  /**
   * Date of the consumption.
   * Must be within the trip date range.
   */
  readonly date: Date;

  /**
   * Quantity of the product consumed.
   * Uses the product's unit of measurement.
   * @minimum 0
   */
  readonly quantity: number;

  /**
   * Type of meal for this consumption.
   * Helps in organizing and planning meals.
   */
  readonly mealType: MealType;

  /**
   * Optional notes about this consumption.
   * Can include preferences, substitutions, etc.
   * @maxLength 200
   */
  readonly notes?: string;
}

/**
 * DTO for bulk consumption creation.
 *
 * @description
 * Allows creating multiple consumption records at once,
 * useful for meal planning across multiple days or participants.
 */
export interface BulkCreateConsumptionDTO {
  /**
   * ID of the trip for all consumption records.
   */
  readonly tripId: string;

  /**
   * Array of consumption records to create.
   */
  readonly consumptions: ReadonlyArray<Omit<CreateConsumptionDTO, 'tripId'>>;
}
